from config import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenRefreshView
from .models import User
from .serializers import UserSerializer
from rest_framework.permissions import AllowAny


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
    def get(self, request):
        pass    

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