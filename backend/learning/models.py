from django.utils import timezone
from django.db import models
from dictionary.models import Kanji_entry, Vocab_entry, Grammar_entry
from accounts.models import User
# Create your models here.
class Flash_card_set(models.Model):
    class Visibility(models.TextChoices):
        PUBLIC = "public", "Public"
        PRIVATE = "private", "Private"

    flash_card_set_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="flash_card_sets",
        null=True,
    )
    visibility = models.CharField(
        max_length=20,
        choices=Visibility.choices,
        default=Visibility.PRIVATE
    )
    name = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return super().__str__() + f" ({self.description})"
    
    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at"])
    def restore(self):
        self.deleted_at = None
        self.save(update_fields=["deleted_at"])
    @property
    def is_deleted(self):
        return self.deleted_at is not None
    @property
    def is_public(self):
        return self.visibility == self.Visibility.PUBLIC
    
class Flash_card_entry(models.Model):
    class card_type(models.TextChoices):
        KANJI = "kanji", "Kanji"
        VOCAB = "vocab", "Vocab"
        GRAMMAR = "grammar", "Grammar"
    flash_card_id = models.AutoField(primary_key=True)
    flash_card_set = models.ForeignKey(
        Flash_card_set,
        on_delete=models.CASCADE,
        related_name="flash_cards",
    )
    type = models.CharField(
        max_length=20,
        choices=card_type.choices,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save(update_fields=["deleted_at"])
    def restore(self):
        self.deleted_at = None
        self.save(update_fields=["deleted_at"])
    @property
    def is_deleted(self):
        return self.deleted_at is not None

    def __str__(self):
        return super().__str__() + f" (Flash Card ID: {self.flash_card_id})"
    
class Kanji_flash_card(models.Model):
    flash_card_entry = models.OneToOneField(
        Flash_card_entry,
        on_delete=models.CASCADE,
        related_name="kanji_flash_card",
        primary_key=True,
    )
    kanji_entry = models.ForeignKey(
        Kanji_entry,
        on_delete=models.CASCADE,
        related_name="kanji_flash_cards",
    )

class Vocab_flash_card(models.Model):
    flash_card_entry = models.OneToOneField(
        Flash_card_entry,
        on_delete=models.CASCADE,
        related_name="vocab_flash_card",
        primary_key=True,
    )
    vocab_entry = models.ForeignKey(
        Vocab_entry,
        on_delete=models.CASCADE,
        related_name="vocab_flash_cards",
    )

class Grammar_flash_card(models.Model):
    flash_card_entry = models.OneToOneField(
        Flash_card_entry,
        on_delete=models.CASCADE,
        related_name="grammar_flash_card",
        primary_key=True,
    )
    grammar_entry = models.ForeignKey(
        Grammar_entry,
        on_delete=models.CASCADE,
        related_name="grammar_flash_cards",
    )