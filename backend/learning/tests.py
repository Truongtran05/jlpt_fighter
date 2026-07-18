from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from dictionary.models import Grammar_entry, Kanji_entry, Kanji_meaning, Kanji_reading
from learning.models import Flash_card_entry, Flash_card_set, Grammar_flash_card, Kanji_flash_card


class FlashCardSetCreateViewTests(APITestCase):
    def test_get_returns_set_id(self):
        user = User.objects.create(
            email="test@example.com",
            name="Test User",
        )
        flash_card_set = Flash_card_set.objects.create(user=user, name="N5")

        self.client.force_authenticate(user=user)
        response = self.client.get(reverse("flashcardset"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["flash_card_set_id"], flash_card_set.flash_card_set_id)


class FlashCardCreateViewTests(APITestCase):
    def test_post_returns_detailed_flashcard(self):
        user = User.objects.create(email="test@example.com", name="Test User")
        flash_card_set = Flash_card_set.objects.create(user=user)
        kanji = Kanji_entry.objects.create(kanji="日", stroke_count=4, jlpt_level=5)
        Kanji_reading.objects.create(kanji_entry=kanji, reading_type="onyomi", reading="ニチ")
        Kanji_meaning.objects.create(kanji_entry=kanji, meaning="day")

        self.client.force_authenticate(user=user)
        response = self.client.post(
            reverse("flashcardentry-detail", kwargs={"flash_card_set_id": flash_card_set.flash_card_set_id}),
            {"type": "kanji", "entry_id": kanji.kanji_id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["kanji"], "日")
        self.assertEqual(response.data["onyomi"], ["ニチ"])
        self.assertEqual(response.data["meaning"], ["day"])


class FlashCardUpdateViewTests(APITestCase):
    def test_patch_updates_entry_and_specific_flashcard_table(self):
        user = User.objects.create(
            email="test@example.com",
            name="Test User",
        )
        flash_card_set = Flash_card_set.objects.create(user=user)
        kanji = Kanji_entry.objects.create(kanji="日", stroke_count=4)
        grammar = Grammar_entry.objects.create(grammar="てもいい", meaning="may")
        flash_card = Flash_card_entry.objects.create(
            flash_card_set=flash_card_set,
            type="kanji",
        )
        Kanji_flash_card.objects.create(
            flash_card_entry=flash_card,
            kanji_entry=kanji,
        )

        self.client.force_authenticate(user=user)
        response = self.client.patch(
            reverse("flashcarddelete-detail", kwargs={"flash_card_id": flash_card.flash_card_id}),
            {"type": "grammar", "entry_id": grammar.grammar_id},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        flash_card.refresh_from_db()
        self.assertEqual(flash_card.type, "grammar")
        self.assertFalse(Kanji_flash_card.objects.filter(flash_card_entry=flash_card).exists())
        self.assertTrue(
            Grammar_flash_card.objects.filter(
                flash_card_entry=flash_card,
                grammar_entry=grammar,
            ).exists()
        )
        self.assertEqual(response.data["grammar"], "てもいい")
        self.assertEqual(response.data["meaning"], "may")
