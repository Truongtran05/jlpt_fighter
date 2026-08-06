from django.contrib import admin
from .models import Kanji_entry, Kanji_reading, Kanji_meaning,Kanji_sino_vietnamese, Vocab_entry, Vocab_meaning, Vocab_writting, Vocab_sense, Grammar_entry, Grammar_example, Grammar_meaning
# Register your models here.
admin.site.register(Kanji_entry)
admin.site.register(Kanji_reading)
admin.site.register(Kanji_meaning)
admin.site.register(Kanji_sino_vietnamese)
admin.site.register(Vocab_entry)
admin.site.register(Vocab_writting)
admin.site.register(Vocab_sense)
admin.site.register(Vocab_meaning)
admin.site.register(Grammar_entry)
admin.site.register(Grammar_example)
admin.site.register(Grammar_meaning)