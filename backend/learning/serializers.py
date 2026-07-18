from rest_framework import serializers
from .models import Flash_card_entry, Flash_card_set


class FlashCardEntrySerializer(serializers.ModelSerializer):
    entry_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Flash_card_entry
        fields = ['flash_card_id','type','entry_id']

class FlashCardDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flash_card_entry
        fields = ['flash_card_id', 'type', 'status']

    def to_representation(self, flash_card_entry):
        data = super().to_representation(flash_card_entry)
        data.update({
            'status' : flash_card_entry.status,
        })
        if flash_card_entry.type == 'kanji':
            entry = flash_card_entry.kanji_flash_card.kanji_entry
            data.update({
                'kanji_id': entry.kanji_id,
                'kanji': entry.kanji,
                'onyomi': [reading.reading for reading in entry.readings.filter(reading_type='onyomi')],
                'kunyomi': [reading.reading for reading in entry.readings.filter(reading_type='kunyomi')],
                'strokeCount': entry.stroke_count,
                'jlptLevel': entry.jlpt_level,
                'meaning': [meaning.meaning for meaning in entry.meanings.all()],
            })
        elif flash_card_entry.type == 'vocab':
            entry = flash_card_entry.vocab_flash_card.vocab_entry
            data.update({
                'vocab_id': entry.vocab_id,
                'kana': [writing.writting for writing in entry.writtings.filter(writting_type='kana')],
                'kanji': [writing.writting for writing in entry.writtings.filter(writting_type='kanji')],
                'meaning': [meaning.meaning for meaning in entry.meanings.all()],
            })
        elif flash_card_entry.type == 'grammar':
            entry = flash_card_entry.grammar_flash_card.grammar_entry
            data.update({
                'grammar_id': entry.grammar_id,
                'grammar': entry.grammar,
                'formation': entry.formation,
                'meaning': entry.meaning,
                'jlpt_level': entry.jlpt_level,
                'examples_japanese': [example.example_japanese for example in entry.examples.all()],
                'examples_english': [example.example_english for example in entry.examples.all()],
                'examples_romaji': [example.example_romaji for example in entry.examples.all()],
            })
        return data

class FlashCardSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flash_card_set
        fields = ['flash_card_set_id', 'name', 'description', 'visibility']
