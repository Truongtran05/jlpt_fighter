import json
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from dictionary.models import Vocab_entry, Vocab_meaning, Vocab_writting


class Command(BaseCommand):
    help = "Import vocabulary from DataVocab.json"

    def add_arguments(self, parser):
        default_path = Path(__file__).resolve().parents[2] / "DataVocab.json"

        parser.add_argument(
            "--path",
            type=Path,
            default=default_path,
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
            with path.open("r", encoding="utf-8") as file:
                data = json.load(file)
        except (OSError, json.JSONDecodeError) as exc:
            raise CommandError(f"Could not read {path}: {exc}") from exc

        if not isinstance(data, list):
            raise CommandError("Expected the JSON root to be an array")

        # Vocab_entry has no natural key, so replace the vocabulary tables to
        # make the import deterministic and safe to rerun.
        Vocab_entry.objects.all().delete()

        writing_count = 0
        meaning_count = 0

        for start in range(0, len(data), batch_size):
            items = data[start : start + batch_size]
            entries = Vocab_entry.objects.bulk_create(
                [Vocab_entry() for _ in items],
                batch_size=batch_size,
            )

            writings = []
            meanings = []

            for offset, (item, entry) in enumerate(zip(items, entries)):
                item_number = start + offset + 1
                if not isinstance(item, dict):
                    raise CommandError(
                        f"Vocabulary item {item_number} must be an object"
                    )

                seen_writings = set()
                for writing_type in ("kanji", "kana"):
                    values = item.get(writing_type, [])
                    if not isinstance(values, list):
                        raise CommandError(
                            f"'{writing_type}' in item {item_number} must be an array"
                        )

                    for value in values:
                        if not isinstance(value, dict) or not isinstance(
                            value.get("text"), str
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
                                writting=value["text"],
                            )
                        )

                values = item.get("meaning", [])
                if not isinstance(values, list) or not all(
                    isinstance(value, str) for value in values
                ):
                    raise CommandError(
                        f"'meaning' in item {item_number} must be an array of strings"
                    )

                for meaning in dict.fromkeys(values):
                    meanings.append(
                        Vocab_meaning(
                            vocab_entry=entry,
                            meaning=meaning,
                        )
                    )

            Vocab_writting.objects.bulk_create(
                writings,
                batch_size=batch_size,
            )
            Vocab_meaning.objects.bulk_create(
                meanings,
                batch_size=batch_size,
            )

            writing_count += len(writings)
            meaning_count += len(meanings)

        self.stdout.write(
            self.style.SUCCESS(
                f"Imported {len(data)} vocabulary entries, "
                f"{writing_count} writings, and {meaning_count} meanings."
            )
        )
