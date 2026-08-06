from pathlib import Path

import ijson
from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction

from dictionary.models import (
    Kanji_entry,
    Kanji_meaning,
    Kanji_reading,
    Kanji_sino_vietnamese,
)


LANGUAGES = {"eng": "en", "vie": "vi"}


class Command(BaseCommand):
    help = "Import kanji from DataKanji.json"

    def add_arguments(self, parser):
        parser.add_argument(
            "--path",
            type=Path,
            default=Path(__file__).resolve().parents[4] / "data" / "DataKanji.json",
            help="Path to DataKanji.json",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=2000,
            help="Number of kanji entries to insert per batch (default: 2000)",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        path = options["path"]
        batch_size = options["batch_size"]

        if batch_size < 1:
            raise CommandError("--batch-size must be greater than zero")
        if not path.is_file():
            raise CommandError(f"File not found: {path}")

        try:
            with path.open("rb") as file:
                if next(ijson.parse(file), None) != ("", "start_array", None):
                    raise CommandError("Expected the JSON root to be an array")

            with connection.cursor() as cursor:
                cursor.execute(
                    "TRUNCATE TABLE dictionary_kanji_entry "
                    "RESTART IDENTITY CASCADE"
                )

            counts = [0, 0, 0, 0]
            batch = []
            with path.open("rb") as file:
                for item_number, item in enumerate(ijson.items(file, "item"), 1):
                    batch.append((item_number, item))
                    if len(batch) == batch_size:
                        self._import_batch(batch, batch_size, counts)
                        batch.clear()
                if batch:
                    self._import_batch(batch, batch_size, counts)
        except (OSError, UnicodeError, ijson.JSONError) as exc:
            raise CommandError(f"Could not read {path}: {exc}") from exc

        self.stdout.write(
            self.style.SUCCESS(
                f"Imported {counts[0]} kanji, {counts[1]} readings, "
                f"{counts[2]} meanings, and {counts[3]} Sino-Vietnamese readings."
            )
        )

    def _import_batch(self, batch, batch_size, counts):
        entries = []
        child_values = []

        for item_number, item in batch:
            if not isinstance(item, dict):
                raise CommandError(f"Kanji item {item_number} must be an object")

            kanji = item.get("kanji")
            stroke_count = item.get("strokeCount")
            radicals = item.get("radicals", [])
            if (
                not isinstance(kanji, str)
                or len(kanji) != 1
                or not isinstance(stroke_count, int)
                or not isinstance(radicals, list)
                or not all(isinstance(value, str) for value in radicals)
            ):
                raise CommandError(f"Invalid kanji item {item_number}")

            jlpt_level = item.get("jlptLevel")
            if jlpt_level is not None and (
                not isinstance(jlpt_level, int) or jlpt_level not in range(1, 6)
            ):
                raise CommandError(f"Invalid JLPT level in kanji item {item_number}")

            entry = Kanji_entry(
                kanji=kanji,
                radicals=",".join(radicals) or None,
                stroke_count=stroke_count,
                pen_stroke=item.get("PenStrokes") or None,
                jlpt_level=jlpt_level or 0,
            )
            entries.append(entry)
            child_values.append((item_number, item, entry))

        Kanji_entry.objects.bulk_create(entries, batch_size=batch_size)

        readings = []
        meanings = []
        sino_vietnamese = []
        for item_number, item, entry in child_values:
            for reading_type in ("onyomi", "kunyomi"):
                values = item.get(reading_type, [])
                if not isinstance(values, list) or not all(
                    isinstance(value, str) for value in values
                ):
                    raise CommandError(
                        f"Invalid {reading_type} in kanji item {item_number}"
                    )
                for position, reading in enumerate(dict.fromkeys(values)):
                    readings.append(
                        Kanji_reading(
                            kanji_entry=entry,
                            reading_type=reading_type,
                            reading=reading,
                            position=position,
                        )
                    )

            values = item.get("meanings", {})
            if not isinstance(values, dict):
                raise CommandError(f"Invalid meanings in kanji item {item_number}")
            seen_meanings = set()
            for source_lang, lang in LANGUAGES.items():
                language_meanings = values.get(source_lang, [])
                if not isinstance(language_meanings, list) or not all(
                    isinstance(value, str) for value in language_meanings
                ):
                    raise CommandError(f"Invalid meanings in kanji item {item_number}")
                for position, meaning in enumerate(language_meanings):
                    if meaning in seen_meanings:
                        continue
                    seen_meanings.add(meaning)
                    meanings.append(
                        Kanji_meaning(
                            kanji_entry=entry,
                            lang=lang,
                            meaning=meaning,
                            position=position,
                        )
                    )

            values = item.get("sino_vietnamese", [])
            if not isinstance(values, list) or not all(
                isinstance(value, str) for value in values
            ):
                raise CommandError(
                    f"Invalid Sino-Vietnamese readings in kanji item {item_number}"
                )
            sino_vietnamese.extend(
                Kanji_sino_vietnamese(kanji_entry=entry, sino_vietnamese=value)
                for value in dict.fromkeys(values)
            )

        Kanji_reading.objects.bulk_create(readings, batch_size=batch_size)
        Kanji_meaning.objects.bulk_create(meanings, batch_size=batch_size)
        Kanji_sino_vietnamese.objects.bulk_create(
            sino_vietnamese, batch_size=batch_size
        )

        counts[0] += len(entries)
        counts[1] += len(readings)
        counts[2] += len(meanings)
        counts[3] += len(sino_vietnamese)
