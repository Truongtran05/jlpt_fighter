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
        lang = self.context.get('lang', 'en')
        if flash_card_entry.type == 'kanji':
            entry = flash_card_entry.kanji_flash_card.kanji_entry
            data.update({
                'kanji_id': entry.kanji_id,
                'kanji': entry.kanji,
                'sino_vietnamese': list(entry.sino_vietnamese.values_list('sino_vietnamese', flat=True)),
                'radicals': entry.radicals,
                'penStroke': entry.pen_stroke,
                'onyomi': list(entry.readings.filter(reading_type='onyomi').order_by('position', 'kanji_reading_id').values_list('reading', flat=True)),
                'kunyomi': list(entry.readings.filter(reading_type='kunyomi').order_by('position', 'kanji_reading_id').values_list('reading', flat=True)),
                'strokeCount': entry.stroke_count,
                'jlptLevel': entry.jlpt_level,
                'meaning': list(entry.meanings.filter(lang=lang).order_by('position', 'kanji_meaning_id').values_list('meaning', flat=True)),
            })
        elif flash_card_entry.type == 'vocab':
            entry = flash_card_entry.vocab_flash_card.vocab_entry
            data.update({
                'vocab_id': entry.vocab_id,
                'kana': list(entry.writtings.filter(writting_type='kana').order_by('common').values_list('writting', flat=True)),
                'kanji': list(entry.writtings.filter(writting_type='kanji').order_by('common').values_list('writting', flat=True)),
                'senses': [{
                    'part_of_speech': sense.part_of_speech,
                    'meanings': list(sense.meanings.values_list('meaning', flat=True)),
                } for sense in entry.senses.filter(lang=lang).order_by('position').prefetch_related('meanings')],
            })
        elif flash_card_entry.type == 'grammar':
            entry = flash_card_entry.grammar_flash_card.grammar_entry
            data.update({
                'grammar_id': entry.grammar_id,
                'grammar': entry.grammar,
                'formation': entry.formation,
                'meaning': list(entry.meanings.filter(lang=lang).values_list('meaning', flat=True)),
                'jlpt_level': entry.jlpt_level,
                'examples': [{
                    'example_japanese': example.example_japanese,
                    'example_romaji': example.example_romaji,
                    'example_gloss': example.example_gloss,
                } for example in entry.examples.filter(lang=lang)],
            })
        return data

class FlashCardSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flash_card_set
        fields = ['flash_card_set_id', 'name', 'description', 'visibility']

    def to_representation(self, flash_card_set):
        data = super().to_representation(flash_card_set)
        data.update({
            "total_flash_cards": flash_card_set.flash_cards.filter(deleted_at__isnull=True).count(),
            "total_remembered_flash_cards": flash_card_set.flash_cards.filter(deleted_at__isnull=True, status='remembered').count(),
            "total_forgotten_flash_cards": flash_card_set.flash_cards.filter(deleted_at__isnull=True, status='forgotten').count(),
        })
        return data
