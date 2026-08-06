from pathlib import Path

import ijson
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from dictionary.models import Vocab_entry, Vocab_meaning, Vocab_sense, Vocab_writting


LANGUAGES = {"eng": "en", "vie": "vi"}


class Command(BaseCommand):
    help = "Import vocabulary from DataVocab.json"

    def add_arguments(self, parser):
        parser.add_argument(
            "--path",
            type=Path,
            default=Path(__file__).resolve().parents[4] / "data" / "DataVocab.json",
            help="Path to DataVocab.json",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=2000,
            help="Number of vocabulary entries to insert per batch (default: 2000)",
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

            Vocab_entry.objects.all().delete()
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
                f"Imported {counts[0]} vocabulary entries, {counts[1]} writings, "
                f"{counts[2]} senses, and {counts[3]} meanings."
            )
        )

    def _import_batch(self, batch, batch_size, counts):
        entries = []
        writings = []
        senses = []
        meaning_values = []

        for item_number, item in batch:
            if not isinstance(item, dict):
                raise CommandError(f"Vocabulary item {item_number} must be an object")

            try:
                vocab_id = int(item["id"])
            except (KeyError, TypeError, ValueError) as exc:
                raise CommandError(
                    f"Vocabulary item {item_number} has an invalid 'id'"
                ) from exc
            if vocab_id < 1:
                raise CommandError(f"Vocabulary item {item_number} has an invalid 'id'")

            entry = Vocab_entry(vocab_id=vocab_id)
            entries.append(entry)

            seen_writings = set()
            for writing_type in ("kanji", "kana"):
                values = item.get(writing_type, [])
                if not isinstance(values, list):
                    raise CommandError(
                        f"'{writing_type}' in item {item_number} must be an array"
                    )
                for value in values:
                    if (
                        not isinstance(value, dict)
                        or not isinstance(value.get("text"), str)
                        or not isinstance(value.get("common", False), bool)
                    ):
                        raise CommandError(
                            f"Invalid {writing_type} writing in item {item_number}"
                        )
                    key = (writing_type, value["text"])
                    if key in seen_writings:
                        continue
                    seen_writings.add(key)
                    writings.append(
                        Vocab_writting(
                            vocab_entry=entry,
                            writting_type=writing_type,
                            common=value.get("common", False),
                            writting=value["text"],
                        )
                    )

            values = item.get("sense", [])
            if not isinstance(values, list):
                raise CommandError(f"'sense' in item {item_number} must be an array")
            for position, value in enumerate(values):
                if not isinstance(value, dict) or value.get("lang") not in LANGUAGES:
                    raise CommandError(f"Invalid sense in item {item_number}")

                part_of_speech = value.get("partOfSpeech", [])
                applied_to_kanji = value.get("appliesToKanji", ["*"])
                applied_to_kana = value.get("appliesToKana", ["*"])
                meanings = value.get("gloss", [])
                if not all(
                    isinstance(field, list)
                    and all(isinstance(text, str) for text in field)
                    for field in (part_of_speech, applied_to_kanji, applied_to_kana)
                ) or not isinstance(meanings, list):
                    raise CommandError(f"Invalid sense in item {item_number}")

                sense = Vocab_sense(
                    vocab_entry=entry,
                    part_of_speech=",".join(part_of_speech) or None,
                    position=position,
                    lang=LANGUAGES[value["lang"]],
                    applied_to_kanji=",".join(applied_to_kanji) or "*",
                    applied_to_kana=",".join(applied_to_kana) or "*",
                )
                senses.append(sense)

                seen_meanings = set()
                texts = []
                for meaning in meanings:
                    if not isinstance(meaning, dict) or not isinstance(
                        meaning.get("text"), str
                    ):
                        raise CommandError(f"Invalid meaning in item {item_number}")
                    if meaning["text"] not in seen_meanings:
                        seen_meanings.add(meaning["text"])
                        texts.append(meaning["text"])
                meaning_values.append((sense, texts))

        Vocab_entry.objects.bulk_create(entries, batch_size=batch_size)
        Vocab_writting.objects.bulk_create(writings, batch_size=batch_size)
        Vocab_sense.objects.bulk_create(senses, batch_size=batch_size)
        meanings = [
            Vocab_meaning(vocab_sense=sense, meaning=text)
            for sense, texts in meaning_values
            for text in texts
        ]
        Vocab_meaning.objects.bulk_create(meanings, batch_size=batch_size)

        counts[0] += len(entries)
        counts[1] += len(writings)
        counts[2] += len(senses)
        counts[3] += len(meanings)
