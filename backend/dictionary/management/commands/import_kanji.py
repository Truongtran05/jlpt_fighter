import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction

from dictionary.models import (
    Kanji_entry,
    Kanji_meaning,
    Kanji_reading,
)


class Command(BaseCommand):
    help = "Import kanji from DataKanji.json"

    def add_arguments(self, parser):
        default_path = (
            Path(__file__).resolve().parents[2] / "DataKanji.json"
        )

        parser.add_argument(
            "--path",
            type=Path,
            default=default_path,
            help="Path to DataKanji.json",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        path = options["path"]

        if not path.exists():
            self.stderr.write(
                self.style.ERROR(f"File not found: {path}")
            )
            return

        with path.open("r", encoding="utf-8") as file:
            data = json.load(file)

        if not isinstance(data, list):
            raise ValueError("Expected the JSON root to be an array")

        kanji_objects = [
            Kanji_entry(
                kanji=item["kanji"],
                stroke_count=item["strokeCount"],
                jlpt_level=item.get("jlptLevel"),
            )
            for item in data
        ]

        Kanji_entry.objects.bulk_create(
            kanji_objects,
            batch_size=2000,
            update_conflicts=True,
            update_fields=["stroke_count", "jlpt_level"],
            unique_fields=["kanji"],
        )

        incoming_kanji = [item["kanji"] for item in data]

        Kanji_entry.objects.exclude(
            kanji__in=incoming_kanji
        ).delete()

        entries = Kanji_entry.objects.in_bulk(
            field_name="kanji"
        )

        # Rebuild child records so rerunning the command is safe.
        Kanji_reading.objects.all().delete()
        Kanji_meaning.objects.all().delete()

        readings = []
        meanings = []

        for item in data:
            entry = entries[item["kanji"]]

            for position, reading in enumerate(
                item.get("onyomi", [])
            ):
                readings.append(
                    Kanji_reading(
                        kanji_entry=entry,
                        reading_type="onyomi",
                        reading=reading,
                        position=position,
                    )
                )

            for position, reading in enumerate(
                item.get("kunyomi", [])
            ):
                readings.append(
                    Kanji_reading(
                        kanji_entry=entry,
                        reading_type="kunyomi",
                        reading=reading,
                        position=position,
                    )
                )

            for position, meaning in enumerate(
                item.get("meaning", [])
            ):
                meanings.append(
                    Kanji_meaning(
                        kanji_entry=entry,
                        meaning=meaning,
                        position=position,
                    )
                )

        Kanji_reading.objects.bulk_create(
            readings,
            batch_size=2000,
        )

        Kanji_meaning.objects.bulk_create(
            meanings,
            batch_size=2000,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Imported {len(kanji_objects)} kanji, "
                f"{len(readings)} readings, and "
                f"{len(meanings)} meanings."
            )
        )