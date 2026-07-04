from django.db import models


class Kanji_entry(models.Model):
    kanji_id = models.AutoField(primary_key=True)
    kanji = models.CharField(max_length=1, unique=True, db_index = True)
    stroke_count = models.PositiveSmallIntegerField()
    jlpt_level = models.PositiveSmallIntegerField(null=True, blank=True)
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
    
class Vocab_entry(models.Model):
    vocab_id = models.AutoField(primary_key=True)

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

class Vocab_meaning(models.Model):
    vocab_meaning_id = models.AutoField(primary_key=True)

    vocab_entry = models.ForeignKey(
        Vocab_entry,
        on_delete=models.CASCADE,
        related_name="meanings",
    )

    meaning = models.CharField(max_length=512, db_index = True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["vocab_entry", "meaning"],
                name="unique_vocab_meaning",
            )
        ]

    def __str__(self):
        return super().__str__() + f" ({self.meaning})"

class Grammar_entry(models.Model):
    grammar_id = models.AutoField(primary_key=True)
    grammar = models.CharField(max_length=255, unique=True, db_index = True)
    formation = models.CharField(max_length=255, null=True, blank=True)
    meaning = models.CharField(max_length=512, db_index = True)
    jlpt_level = models.PositiveSmallIntegerField(null=True, blank=True)
    
    def __str__(self):
        return super().__str__() + f" (ID: {self.grammar_id})"
    
class Grammar_example(models.Model):
    grammar_example_id = models.AutoField(primary_key=True)

    grammar_entry = models.ForeignKey(
        Grammar_entry,
        on_delete=models.CASCADE,
        related_name="examples",
    )

    example_japanese = models.TextField(null=True, blank=True)
    example_romaji = models.TextField(null=True, blank=True)
    example_english = models.TextField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["grammar_entry", "example_japanese", "example_romaji", "example_english"],
                name="unique_grammar_example",
            )
        ]

    def __str__(self):
        return super().__str__() + f" (ID: {self.grammar_example_id})"
