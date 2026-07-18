from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Flash_card_entry, Flash_card_set, Kanji_flash_card, Vocab_flash_card, Grammar_flash_card
from dictionary.models import Kanji_entry, Vocab_entry, Grammar_entry
from .serializers import FlashCardDetailSerializer, FlashCardEntrySerializer, FlashCardSetSerializer
from django.db import transaction

# Create your views here.
class FlashCardSetCreateView(APIView):
    permission_classes = [IsAuthenticated]

    #get all flashcard sets for the user 
    def get(self, request):
        flash_card_sets = Flash_card_set.objects.filter(
            user=request.user,
            deleted_at__isnull=True,
        )
        serializer = FlashCardSetSerializer(flash_card_sets, many=True)
        return Response(serializer.data)

    #create a new flashcard set
    def post(self, request):
        serializer = FlashCardSetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        
class FlashCardSetDetailsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_flash_card_set(self, request, flash_card_set_id):
        return Flash_card_set.objects.filter(
            flash_card_set_id=flash_card_set_id,
            user=request.user,
            deleted_at__isnull=True,
        ).first()

    #get all flashcards for a specific flashcard set
    def get(self, request, flash_card_set_id):
        flash_card_set = self.get_flash_card_set(request, flash_card_set_id)
        if flash_card_set is None:
            return Response({"error": "Flashcard set not found"}, status=status.HTTP_404_NOT_FOUND)
        
        flash_cards = flash_card_set.flash_cards.filter(deleted_at__isnull=True)
        return Response({
            "name" : flash_card_set.name,
            "description" : flash_card_set.description,
            "visibility" : flash_card_set.visibility,
            "flash_cards" : FlashCardDetailSerializer(flash_cards, many=True).data
        })

    #update a specific flashcard set
    def patch(self, request, flash_card_set_id):
        flash_card_set = self.get_flash_card_set(request, flash_card_set_id)
        if flash_card_set is None:
            return Response({"error": "Flashcard set not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = FlashCardSetSerializer(flash_card_set, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    #soft delete a specific flashcard set
    def delete(self, request, flash_card_set_id):
        flash_card_set = self.get_flash_card_set(request, flash_card_set_id)
        if flash_card_set is None:
            return Response({"error": "Flashcard set not found"}, status=status.HTTP_404_NOT_FOUND)

        flash_card_set.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FlashCardCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_flash_card_set(self, request, flash_card_set_id):
        return Flash_card_set.objects.filter(
            flash_card_set_id=flash_card_set_id,
            user=request.user,
            deleted_at__isnull=True,
        ).first()
    
    #create a new flashcard for a specific flashcard set
    def post(self, request, flash_card_set_id):
        flash_card_set = self.get_flash_card_set(request, flash_card_set_id)

        if flash_card_set is None:
            return Response({"error": "Flashcard set not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = FlashCardEntrySerializer(data=request.data)
        if serializer.is_valid():
            entry_id = serializer.validated_data.pop('entry_id')
            card_type = serializer.validated_data['type']
            entry_model_by_type = {
                'kanji': Kanji_entry,
                'vocab': Vocab_entry,
                'grammar': Grammar_entry,
            }

            if not entry_model_by_type[card_type].objects.filter(pk=entry_id).exists():
                return Response({"entry_id": "Dictionary entry not found"}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                serializer.save(flash_card_set=flash_card_set)
                if card_type == 'kanji':
                    Kanji_flash_card.objects.create(
                        flash_card_entry=serializer.instance,
                        kanji_entry_id=entry_id
                    )
                elif card_type == 'vocab':
                    Vocab_flash_card.objects.create(
                        flash_card_entry=serializer.instance,
                        vocab_entry_id=entry_id
                    )
                elif card_type == 'grammar':
                    Grammar_flash_card.objects.create(
                        flash_card_entry=serializer.instance,
                        grammar_entry_id=entry_id
                    )
            return Response(
                FlashCardDetailSerializer(serializer.instance).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FlashCardUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    entry_model_by_type = {
        'kanji': Kanji_entry,
        'vocab': Vocab_entry,
        'grammar': Grammar_entry,
    }
    card_model_by_type = {
        'kanji': Kanji_flash_card,
        'vocab': Vocab_flash_card,
        'grammar': Grammar_flash_card,
    }
    entry_field_by_type = {
        'kanji': 'kanji_entry_id',
        'vocab': 'vocab_entry_id',
        'grammar': 'grammar_entry_id',
    }

    #update a specific flashcard
    def patch(self, request, flash_card_id):
        flash_card = Flash_card_entry.objects.filter(
            flash_card_id=flash_card_id,
            flash_card_set__user=request.user,
            deleted_at__isnull=True,
        ).first()

        if flash_card is None:
            return Response({"error": "Flashcard not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = FlashCardEntrySerializer(flash_card, data=request.data, partial=True)
        if serializer.is_valid():
            entry_id = serializer.validated_data.pop('entry_id', None)
            card_type = serializer.validated_data.get('type', flash_card.type)

            if entry_id is None and card_type != flash_card.type:
                return Response({"entry_id": "This field is required when changing type"}, status=status.HTTP_400_BAD_REQUEST)

            if entry_id is not None and not self.entry_model_by_type[card_type].objects.filter(pk=entry_id).exists():
                return Response({"entry_id": "Dictionary entry not found"}, status=status.HTTP_400_BAD_REQUEST)

            with transaction.atomic():
                serializer.save()
                if entry_id is not None:
                    for card_model in self.card_model_by_type.values():
                        card_model.objects.filter(flash_card_entry=flash_card).delete()
                    self.card_model_by_type[card_type].objects.create(
                        flash_card_entry=flash_card,
                        **{self.entry_field_by_type[card_type]: entry_id}
                    )
            return Response(FlashCardDetailSerializer(flash_card).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    #soft delete a specific flashcard
    def delete(self, request, flash_card_id):
        flash_card = Flash_card_entry.objects.filter(
            flash_card_id=flash_card_id,
            flash_card_set__user=request.user,
            deleted_at__isnull=True,
        ).first()

        if flash_card is None:
            return Response({"error": "Flashcard not found"}, status=status.HTTP_404_NOT_FOUND)
        
        flash_card.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UpdateFlashCardStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, flash_card_id):
        flash_card = Flash_card_entry.objects.filter(
            flash_card_id=flash_card_id,
            flash_card_set__user=request.user,
            deleted_at__isnull=True,
        ).first()

        if flash_card is None:
            return Response({"error": "Flashcard not found"}, status=status.HTTP_404_NOT_FOUND)

        status_value = request.data.get('status')
        if status_value not in dict(Flash_card_entry.Status.choices):
            return Response({"status": "Invalid status value"}, status=status.HTTP_400_BAD_REQUEST)

        flash_card.status = status_value
        flash_card.save(update_fields=["status"])
        return Response(FlashCardDetailSerializer(flash_card).data)