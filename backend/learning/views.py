from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Flash_card_set
from .serializers import FlashCardSetSerializer

# Create your views here.
class FlashCardSetCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        flash_card_sets = Flash_card_set.objects.filter(
            user=request.user,
            deleted_at__isnull=True,
        )
        serializer = FlashCardSetSerializer(flash_card_sets, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FlashCardSetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        
class FlashCardSetDetailsView(APIView):
    pass

class FlashCardCreateView(APIView):
    pass

class FlashCardUpdateView(APIView):
    pass
