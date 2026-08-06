from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import User
from dictionary.models import (
    Grammar_entry,
    Grammar_example,
    Grammar_meaning,
    Kanji_entry,
    Kanji_meaning,
    Kanji_reading,
    Kanji_sino_vietnamese,
    Vocab_entry,
    Vocab_meaning,
    Vocab_sense,
    Vocab_writting,
)
from learning.models import (
    Flash_card_entry,
    Flash_card_set,
    Grammar_flash_card,
    Kanji_flash_card,
    Vocab_flash_card,
)


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
        kanji = Kanji_entry.objects.create(
            kanji="日",
            radicals="日",
            stroke_count=4,
            pen_stroke="丨フ一一",
            jlpt_level=5,
        )
        Kanji_reading.objects.create(kanji_entry=kanji, reading_type="onyomi", reading="ニチ")
        Kanji_meaning.objects.create(kanji_entry=kanji, lang="en", meaning="day")
        Kanji_meaning.objects.create(kanji_entry=kanji, lang="vi", meaning="ngày")
        Kanji_sino_vietnamese.objects.create(kanji_entry=kanji, sino_vietnamese="nhật")

        self.client.force_authenticate(user=user)
        response = self.client.post(
            reverse("flashcardentry-detail", kwargs={"flash_card_set_id": flash_card_set.flash_card_set_id}),
            {"type": "kanji", "entry_id": kanji.kanji_id},
            format="json",
            QUERY_STRING="lang=vi",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["kanji"], "日")
        self.assertEqual(response.data["onyomi"], ["ニチ"])
        self.assertEqual(response.data["meaning"], ["ngày"])
        self.assertEqual(response.data["sino_vietnamese"], ["nhật"])
        self.assertEqual(response.data["radicals"], "日")
        self.assertEqual(response.data["penStroke"], "丨フ一一")


class FlashCardSetDetailsViewTests(APITestCase):
    def test_get_returns_language_filtered_vocab_senses(self):
        user = User.objects.create(email="test@example.com", name="Test User")
        flash_card_set = Flash_card_set.objects.create(user=user)
        vocab = Vocab_entry.objects.create(jlpt_level=5)
        Vocab_writting.objects.create(
            vocab_entry=vocab,
            writting_type="kanji",
            writting="猫",
        )
        Vocab_writting.objects.create(
            vocab_entry=vocab,
            writting_type="kana",
            writting="ねこ",
        )
        english_sense = Vocab_sense.objects.create(
            vocab_entry=vocab,
            lang="en",
            part_of_speech="noun",
        )
        vietnamese_sense = Vocab_sense.objects.create(
            vocab_entry=vocab,
            lang="vi",
            part_of_speech="danh từ",
        )
        Vocab_meaning.objects.create(vocab_sense=english_sense, meaning="cat")
        Vocab_meaning.objects.create(vocab_sense=vietnamese_sense, meaning="mèo")
        flash_card = Flash_card_entry.objects.create(
            flash_card_set=flash_card_set,
            type="vocab",
        )
        Vocab_flash_card.objects.create(
            flash_card_entry=flash_card,
            vocab_entry=vocab,
        )

        self.client.force_authenticate(user=user)
        url = reverse(
            "flashcardset-detail",
            kwargs={"flash_card_set_id": flash_card_set.flash_card_set_id},
        )

        vietnamese_card = self.client.get(url, {"lang": "vi"}).data["flash_cards"][0]
        default_card = self.client.get(url, {"lang": "eng"}).data["flash_cards"][0]

        self.assertEqual(vietnamese_card["senses"], [{
            "part_of_speech": "danh từ",
            "meanings": ["mèo"],
        }])
        self.assertEqual(default_card["senses"], [{
            "part_of_speech": "noun",
            "meanings": ["cat"],
        }])


class FlashCardUpdateViewTests(APITestCase):
    def test_patch_updates_entry_and_specific_flashcard_table(self):
        user = User.objects.create(
            email="test@example.com",
            name="Test User",
        )
        flash_card_set = Flash_card_set.objects.create(user=user)
        kanji = Kanji_entry.objects.create(kanji="日", stroke_count=4)
        grammar = Grammar_entry.objects.create(grammar="てもいい", formation="Verb + てもいい")
        Grammar_meaning.objects.create(grammar_entry=grammar, lang="en", meaning="may")
        Grammar_meaning.objects.create(grammar_entry=grammar, lang="vi", meaning="được phép")
        Grammar_example.objects.create(
            grammar_entry=grammar,
            lang="vi",
            example_japanese="入ってもいい。",
            example_romaji="Haitte mo ii.",
            example_gloss="Có thể vào.",
        )
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
            QUERY_STRING="lang=vi",
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
        self.assertEqual(response.data["meaning"], ["được phép"])
        self.assertEqual(response.data["examples"], [{
            "example_japanese": "入ってもいい。",
            "example_romaji": "Haitte mo ii.",
            "example_gloss": "Có thể vào.",
        }])

        status_response = self.client.patch(
            reverse("flashcardstatus-update", kwargs={"flash_card_id": flash_card.flash_card_id}),
            {"status": "remembered"},
            format="json",
            QUERY_STRING="lang=vi",
        )
        self.assertEqual(status_response.data["meaning"], ["được phép"])
