from config import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny
from django.utils import timezone


# Create your views here. 
class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = TokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.user
        response = Response(
            {
                "user": {
                    "id": user.id,
                    "name": user.name,
                    "email": user.email,
                },
            },
            status=status.HTTP_200_OK,
        )

        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])

        #tokens are sented as cookies to the client
        response.set_cookie(
            "access_token",
            str(serializer.validated_data["access"]),
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax",
            max_age=300,
        )
        response.set_cookie( 
            "refresh_token",
            str(serializer.validated_data["refresh"]),
            httponly=True,
            secure=not settings.DEBUG,
            samesite="Lax", 
            max_age=604800,
        )

        return response

class LogoutView(APIView):
    authentication_classes = []  # Disable authentication for this view
    permission_classes = [AllowAny]  # Allow any user to access this view

    def post(self, request):
        response = Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response

class UserView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        base_user_data = serializer.data
        user_progress_data = {
            "total_flashcard_sets": user.flash_card_sets.filter(deleted_at__isnull=True).count(),
            "total_flashcards": sum(flash_card_set.flash_cards.filter(deleted_at__isnull=True).count() for flash_card_set in user.flash_card_sets.filter(deleted_at__isnull=True)),
            "total_completed_flashcards" : sum(flash_card_set.flash_cards.filter(deleted_at__isnull=True, status="remembered").count() for flash_card_set in user.flash_card_sets.filter(deleted_at__isnull=True)),
            "total_incomplete_flashcards": sum(flash_card_set.flash_cards.filter(deleted_at__isnull=True, status="forgotten").count() for flash_card_set in user.flash_card_sets.filter(deleted_at__isnull=True)),
            "total_kanji_flashcards": sum(flash_card_set.flash_cards.filter(deleted_at__isnull=True, type="kanji").count() for flash_card_set in user.flash_card_sets.filter(deleted_at__isnull=True)),
            "total_vocabulary_flashcards": sum(flash_card_set.flash_cards.filter(deleted_at__isnull=True, type="vocab").count() for flash_card_set in user.flash_card_sets.filter(deleted_at__isnull=True)),
            "total_grammar_flashcards": sum(flash_card_set.flash_cards.filter(deleted_at__isnull=True, type="grammar").count() for flash_card_set in user.flash_card_sets.filter(deleted_at__isnull=True)),
        }
        account_data = {
            "account_created_at": User.objects.filter(id=user.id).values_list('date_joined', flat=True).first(),
            "last_login": User.objects.filter(id=user.id).values_list('last_login', flat=True).first(),
        }
        return Response({**base_user_data, **user_progress_data, **account_data}, status=status.HTTP_200_OK)


class CookiesTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")
        if refresh_token is None:
            return Response({"detail": "Refresh token not provided."}, status=status.HTTP_400_BAD_REQUEST)

        request.data.update({"refresh": refresh_token})
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            access_token = response.data.get("access")   
            response.set_cookie(
                "access_token",
                str(access_token),
                httponly=True,
                secure=not settings.DEBUG,
                samesite="Lax",
                max_age=300,
            )
            response.data.pop("access", None)  # Remove the access token from the response data
        return response