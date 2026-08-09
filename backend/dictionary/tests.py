import json
from io import StringIO
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.core.management import call_command
from django.core.management.base import CommandError
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


class DictionaryStatsViewTests(TestCase):
    def test_returns_dictionary_entry_counts(self):
        Kanji_entry.objects.create(kanji="日", stroke_count=4)
        Vocab_entry.objects.create()
        Grammar_entry.objects.create(grammar="～うちに")

        self.assertEqual(
            self.client.get("/api/v1/stats/").json(),
            {"vocabulary": 1, "kanji": 1, "grammar": 1},
        )


class FetchRelatedViewTests(TestCase):
    def test_get_related_kanji_preserves_query_order_and_language(self):
        day = Kanji_entry.objects.create(kanji="日", stroke_count=4)
        book = Kanji_entry.objects.create(kanji="本", stroke_count=5)
        Kanji_meaning.objects.create(kanji_entry=day, lang="en", meaning="day")
        Kanji_meaning.objects.create(kanji_entry=day, lang="vi", meaning="ngày")
        Kanji_meaning.objects.create(kanji_entry=book, lang="en", meaning="book")

        response = self.client.get(
            "/api/v1/related/kanji/", {"q": "日本語日", "lang": "eng"}
        ).json()

        self.assertEqual(response, {"results": [
            {"kanji_id": day.kanji_id, "kanji": "日", "meaning": ["day"]},
            {"kanji_id": book.kanji_id, "kanji": "本", "meaning": ["book"]},
        ]})

    def test_get_related_vocab_returns_matching_writing_and_short_meaning(self):
        matching = Vocab_entry.objects.create()
        Vocab_writting.objects.create(
            vocab_entry=matching, writting_type="kanji", writting="日本語", common=True
        )
        Vocab_writting.objects.create(
            vocab_entry=matching, writting_type="kana", writting="にほんご"
        )
        sense = Vocab_sense.objects.create(
            vocab_entry=matching, lang="en", position=0, applied_to_kanji="日本語"
        )
        Vocab_meaning.objects.create(
            vocab_sense=sense, meaning="Japanese language with a long description"
        )
        unrelated = Vocab_entry.objects.create()
        Vocab_writting.objects.create(
            vocab_entry=unrelated, writting_type="kanji", writting="英語"
        )

        response = self.client.get(
            "/api/v1/related/vocab/", {"q": "日", "lang": "en"}
        ).json()

        self.assertEqual(response["count"], 1)
        self.assertEqual(response["results"][0]["vocab_id"], matching.vocab_id)
        self.assertEqual(response["results"][0]["writting"], "日本語")
        self.assertEqual(response["results"][0]["meaning"], "Japanese language w…")

    def test_blank_queries_return_no_results(self):
        self.assertEqual(
            self.client.get("/api/v1/related/kanji/", {"q": " "}).json(),
            {"results": []},
        )
        self.assertEqual(
            self.client.get("/api/v1/related/vocab/", {"q": " "}).json(),
            {"results": []},
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


class UpdateKanjiJlptTests(TestCase):
    def _write_level_files(self, directory, values_by_level):
        for level in range(1, 6):
            (Path(directory) / f"N{level}_kanji.txt").write_text(
                " ".join(values_by_level.get(level, [])), encoding="utf-8"
            )

    def test_updates_matching_entries_and_reports_missing_kanji(self):
        first = Kanji_entry.objects.create(kanji="亜", stroke_count=7, jlpt_level=0)
        fifth = Kanji_entry.objects.create(kanji="日", stroke_count=4, jlpt_level=3)

        with TemporaryDirectory() as directory:
            self._write_level_files(directory, {1: ["亜", "愛"], 5: ["日"]})
            stdout = StringIO()
            call_command("update_kanji_jlpt", data_dir=Path(directory), stdout=stdout)

        first.refresh_from_db()
        fifth.refresh_from_db()
        self.assertEqual((first.jlpt_level, fifth.jlpt_level), (1, 5))
        self.assertIn("Updated 2 kanji", stdout.getvalue())
        self.assertIn("1 not found", stdout.getvalue())

    def test_dry_run_does_not_update_entries(self):
        entry = Kanji_entry.objects.create(kanji="日", stroke_count=4, jlpt_level=0)

        with TemporaryDirectory() as directory:
            self._write_level_files(directory, {5: ["日"]})
            call_command("update_kanji_jlpt", data_dir=Path(directory), dry_run=True)

        entry.refresh_from_db()
        self.assertEqual(entry.jlpt_level, 0)

    def test_rejects_kanji_appearing_in_multiple_levels(self):
        with TemporaryDirectory() as directory:
            self._write_level_files(directory, {1: ["日"], 5: ["日"]})
            with self.assertRaisesMessage(CommandError, "occurs in both N1 and N5"):
                call_command("update_kanji_jlpt", data_dir=Path(directory))


class UpdateVocabJlptTests(TestCase):
    def _write_csv(self, path, rows):
        lines = ["Original,Furigana,English,JLPT Level"]
        lines.extend(",".join(row) for row in rows)
        path.write_text("\n".join(lines), encoding="utf-8")

    def test_normalizes_original_and_updates_matching_kanji_writing(self):
        entry = Vocab_entry.objects.create(jlpt_level=0)
        Vocab_writting.objects.create(
            vocab_entry=entry, writting_type="kanji", writting="ＡＢＣ"
        )

        with TemporaryDirectory() as directory:
            path = Path(directory) / "jlpt_vocab.csv"
            self._write_csv(path, [(" ABC ", "えーびーしー", "letters", "N3")])
            call_command("update_vocab_jlpt", path=path)

        entry.refresh_from_db()
        self.assertEqual(entry.jlpt_level, 3)

    def test_uses_furigana_to_resolve_original_in_multiple_levels(self):
        entry = Vocab_entry.objects.create(jlpt_level=0)
        Vocab_writting.objects.create(
            vocab_entry=entry, writting_type="kanji", writting="人気"
        )
        Vocab_writting.objects.create(
            vocab_entry=entry, writting_type="kana", writting="にんき"
        )

        with TemporaryDirectory() as directory:
            path = Path(directory) / "jlpt_vocab.csv"
            self._write_csv(path, [
                ("人気", "にんき", "popularity", "N3"),
                ("人気", "ひとけ", "sign of life", "N1"),
            ])
            call_command("update_vocab_jlpt", path=path)

        entry.refresh_from_db()
        self.assertEqual(entry.jlpt_level, 3)

    def test_skips_an_ambiguous_match(self):
        entry = Vocab_entry.objects.create(jlpt_level=0)
        Vocab_writting.objects.create(
            vocab_entry=entry, writting_type="kanji", writting="人気"
        )

        with TemporaryDirectory() as directory:
            path = Path(directory) / "jlpt_vocab.csv"
            self._write_csv(path, [
                ("人気", "にんき", "popularity", "N3"),
                ("人気", "ひとけ", "sign of life", "N1"),
            ])
            stdout = StringIO()
            call_command("update_vocab_jlpt", path=path, stdout=stdout)

        entry.refresh_from_db()
        self.assertEqual(entry.jlpt_level, 0)
        self.assertIn("1 ambiguous entries skipped", stdout.getvalue())


class TranslateVocabVietnameseTests(TestCase):
    def _write_csv(self, directory, original="猫"):
        path = Path(directory) / "jlpt_vocab.csv"
        path.write_text(
            f"Original,Furigana,English,JLPT Level\n{original},ねこ,cat,N5\n",
            encoding="utf-8",
        )
        return path

    @patch(
        "dictionary.management.commands.translate_vocab_vi.LibreTranslateClient.translate"
    )
    def test_creates_matching_vietnamese_sense_and_translates_meanings(self, translate):
        translate.side_effect = lambda text: {"cat": "mèo", "feline": "họ mèo"}[text]
        entry = Vocab_entry.objects.create()
        Vocab_writting.objects.create(
            vocab_entry=entry, writting_type="kanji", writting="猫"
        )
        english = Vocab_sense.objects.create(
            vocab_entry=entry,
            lang="en",
            position=2,
            part_of_speech="noun",
            applied_to_kanji="猫",
            applied_to_kana="ねこ",
        )
        Vocab_meaning.objects.create(vocab_sense=english, meaning="cat")
        Vocab_meaning.objects.create(vocab_sense=english, meaning="feline")

        with TemporaryDirectory() as directory:
            call_command("translate_vocab_vi", path=self._write_csv(directory))

        vietnamese = Vocab_sense.objects.get(
            vocab_entry=entry, lang="vi", position=2
        )
        self.assertEqual(vietnamese.part_of_speech, "noun")
        self.assertEqual(vietnamese.applied_to_kanji, "猫")
        self.assertEqual(vietnamese.applied_to_kana, "ねこ")
        self.assertEqual(
            list(vietnamese.meanings.values_list("meaning", flat=True)),
            ["mèo", "họ mèo"],
        )

    @patch(
        "dictionary.management.commands.translate_vocab_vi.LibreTranslateClient.translate"
    )
    def test_deletes_and_recreates_an_existing_vietnamese_sense(self, translate):
        translate.return_value = "mèo mới"
        entry = Vocab_entry.objects.create()
        Vocab_writting.objects.create(
            vocab_entry=entry, writting_type="kanji", writting="猫"
        )
        english = Vocab_sense.objects.create(
            vocab_entry=entry, lang="en", position=0
        )
        Vocab_meaning.objects.create(vocab_sense=english, meaning="cat")
        vietnamese = Vocab_sense.objects.create(
            vocab_entry=entry, lang="vi", position=3
        )
        Vocab_meaning.objects.create(vocab_sense=vietnamese, meaning="nghĩa cũ")

        with TemporaryDirectory() as directory:
            call_command("translate_vocab_vi", path=self._write_csv(directory))

        self.assertFalse(Vocab_sense.objects.filter(pk=vietnamese.pk).exists())
        recreated = Vocab_sense.objects.get(
            vocab_entry=entry, lang="vi", position=0
        )
        self.assertEqual(
            list(recreated.meanings.values_list("meaning", flat=True)), ["mèo mới"]
        )


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
