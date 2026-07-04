from rest_framework import serializers
from .models import Flash_card_entry, Flash_card_set

class FlashCardEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Flash_card_entry
        fields = ['flash_card_id','type' ]

class FlashCardSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flash_card_set
        fields = ['name','description', 'visibility']