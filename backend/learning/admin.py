from django.contrib import admin

from learning.models import Flash_card_entry, Flash_card_set, Grammar_flash_card, Kanji_flash_card, Vocab_flash_card

# Register your models here.
admin.site.register(Flash_card_set)
admin.site.register(Flash_card_entry)
admin.site.register(Kanji_flash_card)
admin.site.register(Vocab_flash_card)
admin.site.register(Grammar_flash_card)