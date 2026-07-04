from django.contrib import admin
from .models import Kanji_entry, Kanji_reading, Kanji_meaning, Vocab_entry, Vocab_writting, Vocab_meaning

# Register your models here.
admin.site.register(Kanji_entry)
admin.site.register(Kanji_reading)
admin.site.register(Kanji_meaning)
admin.site.register(Vocab_entry)
admin.site.register(Vocab_writting)
admin.site.register(Vocab_meaning)