from rest_framework import serializers
from .models import Flash_card_entry, Flash_card_set

class FlashCardEntrySerializer(serializers.ModelSerializer):
    entry_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Flash_card_entry
        fields = ['flash_card_id','type','entry_id']

class FlashCardSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flash_card_set
        fields = ['flash_card_set_id', 'name', 'description', 'visibility']
