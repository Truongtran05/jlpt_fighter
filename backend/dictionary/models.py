from django.db import models


language_choices = [
    ("en", "English"),
    ("vi", "Vietnamese"),
]

class Kanji_entry(models.Model):
    kanji_id = models.AutoField(primary_key=True)
    kanji = models.CharField(max_length=1, unique=True, db_index = True)
    radicals = models.CharField(max_length=255, null=True, blank=True)
    stroke_count = models.PositiveSmallIntegerField()
    pen_stroke = models.CharField(max_length=255, null=True, blank=True)
    jlpt_level = models.PositiveSmallIntegerField(default=0)
    def __str__(self):
        return super().__str__() + f" ({self.kanji})"


class Kanji_reading(models.Model):
    kanji_reading_id = models.AutoField(primary_key=True)

    kanji_entry = models.ForeignKey(
        Kanji_entry,
        on_delete=models.CASCADE,
        related_name="readings",
    )

    reading_type = models.CharField(
        max_length=10,
        choices=[
            ("onyomi", "Onyomi"),
            ("kunyomi", "Kunyomi"),
        ],
    )

    reading = models.CharField(max_length=50, db_index = True)
    position = models.PositiveSmallIntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["kanji_entry", "reading_type", "reading"],
                name="unique_kanji_reading",
            )
        ]

    def __str__(self):
        return super().__str__() + f" ({self.reading})"


class Kanji_meaning(models.Model):
    kanji_meaning_id = models.AutoField(primary_key=True)

    kanji_entry = models.ForeignKey(
        Kanji_entry,
        on_delete=models.CASCADE,
        related_name="meanings",
    )

    lang = models.CharField(choices = language_choices, max_length=2, null=True, blank=True) #after importing, this field will be filled with the language of the meaning (either "en" or "vi")
    meaning = models.CharField(max_length=255, db_index = True)
    position = models.PositiveSmallIntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["kanji_entry", "meaning"],
                name="unique_kanji_meaning",
            )
        ]

    def __str__(self):
        return super().__str__() + f" ({self.meaning})"

class Kanji_sino_vietnamese(models.Model):
    kanji_sino_vietnamese_id = models.AutoField(primary_key=True)

    kanji_entry = models.ForeignKey(
        Kanji_entry,
        on_delete=models.CASCADE,
        related_name="sino_vietnamese",
    )

    sino_vietnamese = models.CharField(max_length=255, db_index = True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["kanji_entry", "sino_vietnamese"],
                name="unique_kanji_sino_vietnamese",
            )
        ]

    def __str__(self):
        return super().__str__() + f" ({self.sino_vietnamese})"
    
class Vocab_entry(models.Model):
    vocab_id = models.AutoField(primary_key=True)
    jlpt_level = models.PositiveSmallIntegerField(default=0)

    def __str__(self):
        return super().__str__() + f" (ID: {self.vocab_id})"

class Vocab_writting(models.Model):
    vocab_writting_id = models.AutoField(primary_key=True)

    vocab_entry = models.ForeignKey(
        Vocab_entry,
        on_delete=models.CASCADE,
        related_name="writtings",
    )

    writting_type = models.CharField(
        max_length=10,
        choices=[
            ("kanji", "Kanji"),
            ("kana", "Kana"),
        ],
    )
    common = models.BooleanField(default=False)
    writting = models.CharField(max_length=255, db_index = True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["vocab_entry", "writting", "writting_type"],
                name="unique_vocab_writting",
            )
        ]

    def __str__(self):
        return super().__str__() + f" ({self.writting} - {self.writting_type}))"

class Vocab_sense(models.Model):
    vocab_sense_id = models.AutoField(primary_key=True)

    vocab_entry = models.ForeignKey(
        Vocab_entry,
        on_delete=models.CASCADE,
        related_name="senses",
    )

    part_of_speech = models.CharField(max_length=255, null=True, blank=True)
    position = models.PositiveSmallIntegerField(default=0)
    lang = models.CharField(choices = language_choices, max_length=2, null=True, blank=True) #after importing, this field will be filled with the language of the sense (either "en" or "vi")
    applied_to_kanji = models.CharField(max_length=100, default="*")
    applied_to_kana = models.CharField(max_length=100, default="*")

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["vocab_entry", "position", "lang"],
                name="unique_vocab_sense",
            )
        ]

class Vocab_meaning(models.Model):
    vocab_meaning_id = models.AutoField(primary_key=True)

    vocab_sense = models.ForeignKey(
        Vocab_sense,
        on_delete=models.CASCADE,
        related_name="meanings",
    )
    meaning = models.TextField(null=True, blank=True)

class Grammar_entry(models.Model):
    grammar_id = models.AutoField(primary_key=True)
    grammar = models.CharField(max_length=255, unique=True, db_index = True)
    formation = models.CharField(max_length=255, null=True, blank=True)
    jlpt_level = models.PositiveSmallIntegerField(default=0)

    def __str__(self):
        return super().__str__() + f" (ID: {self.grammar_id})"

class Grammar_meaning(models.Model):
    grammar_meaning_id = models.AutoField(primary_key=True)

    grammar_entry = models.ForeignKey(
        Grammar_entry,
        on_delete=models.CASCADE,
        related_name="meanings",
    )

    lang = models.CharField(choices = language_choices, max_length=2, null=True, blank=True) #after importing, this field will be filled with the language of the meaning (either "en" or "vi")
    meaning = models.TextField(null=False, blank=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["grammar_entry", "meaning", "lang"],
                name="unique_grammar_meaning",
            )
        ]
    
class Grammar_example(models.Model):
    grammar_example_id = models.AutoField(primary_key=True)

    grammar_entry = models.ForeignKey(
        Grammar_entry,
        on_delete=models.CASCADE,
        related_name="examples",
    )

    lang = models.CharField(choices = language_choices, max_length=2, null=True, blank=True) #after importing, this field will be filled with the language of the example (either "en" or "vi")
    example_japanese = models.TextField(null=True, blank=True)
    example_romaji = models.TextField(null=True, blank=True)
    example_gloss = models.TextField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["grammar_entry", "example_japanese", "lang"],
                name="unique_grammar_example",
            )
        ]

    def __str__(self):
        return super().__str__() + f" (ID: {self.grammar_example_id})"
