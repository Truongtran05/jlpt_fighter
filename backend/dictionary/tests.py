import json
from pathlib import Path
from tempfile import TemporaryDirectory

from django.core.management import call_command
from django.test import TestCase

from .models import (
    Grammar_entry,
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


class KanjiSearchViewTests(TestCase):
    def test_returns_new_fields_and_orders_readings_and_meanings_by_position(self):
        entry = Kanji_entry.objects.create(
            kanji="日",
            radicals="日",
            stroke_count=4,
            pen_stroke="丨フ一一",
            jlpt_level=5,
        )
        Kanji_reading.objects.create(
            kanji_entry=entry,
            reading_type="onyomi",
            reading="ジツ",
            position=2,
        )
        Kanji_reading.objects.create(
            kanji_entry=entry,
            reading_type="onyomi",
            reading="ニチ",
            position=0,
        )
        Kanji_reading.objects.create(
            kanji_entry=entry,
            reading_type="kunyomi",
            reading="ひ",
            position=1,
        )
        Kanji_meaning.objects.create(
            kanji_entry=entry,
            lang="en",
            meaning="sun",
            position=1,
        )
        Kanji_meaning.objects.create(
            kanji_entry=entry,
            lang="en",
            meaning="day",
            position=0,
        )
        Kanji_meaning.objects.create(
            kanji_entry=entry,
            lang="vi",
            meaning="ngày",
            position=0,
        )
        Kanji_sino_vietnamese.objects.create(
            kanji_entry=entry,
            sino_vietnamese="nhật",
        )

        result = self.client.get(
            "/api/v1/kanji/", {"q": "日", "lang": "eng"}
        ).json()["results"][0]

        self.assertEqual(result["onyomi"], ["ニチ", "ジツ"])
        self.assertEqual(result["kunyomi"], ["ひ"])
        self.assertEqual(result["meaning"], ["day", "sun"])
        self.assertEqual(result["sino_vietnamese"], ["nhật"])
        self.assertEqual(result["radicals"], "日")
        self.assertEqual(result["penStroke"], "丨フ一一")


class VocabularySearchViewTests(TestCase):
    def test_wildcard_senses_do_not_include_unrelated_vocabulary(self):
        matching_entry = Vocab_entry.objects.create()
        Vocab_writting.objects.create(
            vocab_entry=matching_entry,
            writting_type="kanji",
            writting="猫",
        )
        matching_sense = Vocab_sense.objects.create(
            vocab_entry=matching_entry,
            lang="en",
            position=0,
            applied_to_kanji="*",
            applied_to_kana="*",
        )
        Vocab_meaning.objects.create(vocab_sense=matching_sense, meaning="cat")

        unrelated_entry = Vocab_entry.objects.create()
        Vocab_writting.objects.create(
            vocab_entry=unrelated_entry,
            writting_type="kanji",
            writting="犬",
        )
        Vocab_sense.objects.create(
            vocab_entry=unrelated_entry,
            lang="en",
            position=0,
            applied_to_kanji="*",
            applied_to_kana="*",
        )

        response = self.client.get(
            "/api/v1/vocab/", {"q": "猫", "lang": "eng"}
        ).json()

        self.assertEqual(response["count"], 1)
        self.assertEqual(
            [result["id"] for result in response["results"]],
            [matching_entry.vocab_id],
        )
        self.assertEqual(response["results"][0]["senses"][0]["meanings"], ["cat"])


class ImportVocabTests(TestCase):
    def test_imports_new_vocab_schema(self):
        data = [
            {
                "id": "1000000",
                "kanji": [{"text": "丸", "common": True}],
                "kana": [{"text": "まる", "common": False}],
                "sense": [
                    {
                        "partOfSpeech": ["n"],
                        "appliesToKanji": ["*"],
                        "appliesToKana": ["*"],
                        "lang": "eng",
                        "gloss": [{"text": "circle"}],
                    },
                    {
                        "partOfSpeech": ["n"],
                        "appliesToKanji": ["*"],
                        "appliesToKana": ["*"],
                        "lang": "vie",
                        "gloss": [{"text": "hình tròn"}],
                    },
                ],
            }
        ]

        with TemporaryDirectory() as directory:
            path = Path(directory) / "DataVocab.json"
            path.write_text(json.dumps(data), encoding="utf-8")
            call_command("import_vocab", path=path, batch_size=1)

        entry = Vocab_entry.objects.get(vocab_id=1000000)
        self.assertEqual(
            list(
                entry.writtings.order_by("vocab_writting_id").values_list(
                    "writting", "common"
                )
            ),
            [("丸", True), ("まる", False)],
        )
        self.assertEqual(
            list(
                entry.senses.order_by("position").values_list(
                    "position", "lang", "part_of_speech"
                )
            ),
            [(0, "en", "n"), (1, "vi", "n")],
        )
        self.assertEqual(
            list(
                entry.senses.order_by("position").values_list(
                    "meanings__meaning", flat=True
                )
            ),
            ["circle", "hình tròn"],
        )


class SuggestionsViewTests(TestCase):
    def test_filters_and_returns_kanji_vocab_and_grammar(self):
        kanji = Kanji_entry.objects.create(kanji="猫", stroke_count=11)
        Kanji_meaning.objects.create(
            kanji_entry=kanji, lang="en", meaning="cat", position=0
        )

        vocab = Vocab_entry.objects.create()
        Vocab_writting.objects.create(
            vocab_entry=vocab, writting_type="kanji", writting="猫"
        )
        sense = Vocab_sense.objects.create(vocab_entry=vocab, lang="en", position=0)
        Vocab_meaning.objects.create(vocab_sense=sense, meaning="cat")

        grammar = Grammar_entry.objects.create(grammar="猫のように")
        Grammar_meaning.objects.create(
            grammar_entry=grammar, lang="en", meaning="like a cat"
        )
        Grammar_entry.objects.create(grammar="～ながら")

        suggestions = self.client.get(
            "/api/v1/suggestions/", {"q": "猫", "lang": "en"}
        ).json()["suggestions"]

        suggestions_by_type = {item["type"]: item for item in suggestions}
        self.assertEqual(suggestions_by_type["kanji"]["text"], "猫")
        self.assertIn("猫", suggestions_by_type["vocab"]["text"])
        self.assertEqual(suggestions_by_type["grammar"]["text"], "猫のように")
        self.assertTrue(all(
            item["meaning"]
            for item in self.client.get(
                "/api/v1/suggestions/", {"q": "猫", "lang": "eng"}
            ).json()["suggestions"]
        ))
        self.assertEqual(
            self.client.get("/api/v1/suggestions/", {"q": " "}).json(),
            {"suggestions": []},
        )


class ImportKanjiTests(TestCase):
    def test_imports_new_kanji_schema(self):
        data = [
            {
                "kanji": "亜",
                "onyomi": ["ア"],
                "kunyomi": ["つ.ぐ"],
                "sino_vietnamese": ["a", "á"],
                "radicals": ["二"],
                "strokeCount": 7,
                "PenStrokes": "一丨フ一丨丨一",
                "jlptLevel": 1,
                "meanings": {
                    "eng": ["Asia"],
                    "vie": ["[á] châu Á"],
                },
            }
        ]

        with TemporaryDirectory() as directory:
            path = Path(directory) / "DataKanji.json"
            path.write_text(json.dumps(data), encoding="utf-8")
            call_command("import_kanji", path=path, batch_size=1)

        entry = Kanji_entry.objects.get(kanji="亜")
        self.assertEqual((entry.radicals, entry.pen_stroke), ("二", "一丨フ一丨丨一"))
        self.assertEqual(entry.readings.count(), 2)
        self.assertEqual(
            list(entry.meanings.order_by("lang").values_list("lang", "meaning")),
            [("en", "Asia"), ("vi", "[á] châu Á")],
        )
        self.assertEqual(entry.sino_vietnamese.count(), 2)


class ImportGrammarTests(TestCase):
    def test_imports_new_grammar_schema(self):
        data = [
            {
                "grammar": "～うちに",
                "formation": "Verb + うちに",
                "jlptLevel": "3",
                "meaning": {"eng": "While", "vie": "Trong khi"},
                "examples": [
                    {
                        "lang": "eng",
                        "exampleJapanese": "若いうちに勉強する。",
                        "exampleRomaji": "Wakai uchi ni benkyou suru.",
                        "exampleGloss": "Study while young.",
                    },
                    {
                        "lang": "vie",
                        "exampleJapanese": "若いうちに勉強する。",
                        "exampleRomaji": "",
                        "exampleGloss": "Học khi còn trẻ.",
                    },
                ],
            }
        ]

        with TemporaryDirectory() as directory:
            path = Path(directory) / "DataGrammar.json"
            path.write_text(json.dumps(data), encoding="utf-8")
            call_command("import_grammar", path=path, batch_size=1)

        entry = Grammar_entry.objects.get(grammar="～うちに")
        self.assertEqual(entry.jlpt_level, 3)
        self.assertEqual(
            list(entry.meanings.order_by("lang").values_list("lang", "meaning")),
            [("en", "While"), ("vi", "Trong khi")],
        )
        self.assertEqual(entry.examples.count(), 2)
