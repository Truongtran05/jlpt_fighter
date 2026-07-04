import csv
import re
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from dictionary.models import Grammar_entry, Grammar_example


REQUIRED_COLUMNS = {
    "Grammar Point",
    "Meaning",
    "Formation",
    "Example (Japanese)",
    "Example (Romaji)",
    "Example (English)",
    "JLPT Level",
}

JLPT_LEVEL_RE = re.compile(r"^JLPT\s+N([1-5])$")


class Command(BaseCommand):
    help = "Import grammar from jlpt-grammar.csv"

    def add_arguments(self, parser):
        default_path = (
            Path(__file__).resolve().parents[4] / "data" / "jlpt-grammar.csv"
        )

        parser.add_argument(
            "--path",
            type=Path,
            default=default_path,
            help="Path to jlpt-grammar.csv",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=2000,
            help="Number of grammar rows to insert per batch (default: 2000)",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        path = options["path"]
        batch_size = options["batch_size"]

        if batch_size < 1:
            raise CommandError("--batch-size must be greater than zero")

        if not path.is_file():
            raise CommandError(f"File not found: {path}")

        rows = self.read_rows(path)

        # Grammar_entry.grammar is unique, while the CSV contains distinct rows
        # with the same grammar point. Use deterministic suffixes for duplicates
        # so every source row can be imported without losing meanings/examples.
        grammar_names = self.unique_grammar_names(rows)

        Grammar_entry.objects.all().delete()

        entries = []
        examples = []

        for row_number, (row, grammar_name) in enumerate(
            zip(rows, grammar_names),
            start=2,
        ):
            meaning = self.required_value(row, "Meaning", row_number)
            formation = self.optional_value(row["Formation"])

            self.validate_max_length(
                "Grammar Point",
                grammar_name,
                Grammar_entry._meta.get_field("grammar").max_length,
                row_number,
            )
            self.validate_max_length(
                "Meaning",
                meaning,
                Grammar_entry._meta.get_field("meaning").max_length,
                row_number,
            )
            self.validate_max_length(
                "Formation",
                formation,
                Grammar_entry._meta.get_field("formation").max_length,
                row_number,
            )

            entries.append(
                Grammar_entry(
                    grammar=grammar_name,
                    formation=formation,
                    meaning=meaning,
                    jlpt_level=self.parse_jlpt_level(
                        row["JLPT Level"],
                        row_number,
                    ),
                )
            )

        entries = Grammar_entry.objects.bulk_create(
            entries,
            batch_size=batch_size,
        )

        for row, entry in zip(rows, entries):
            examples.append(
                Grammar_example(
                    grammar_entry=entry,
                    example_japanses=self.optional_value(
                        row["Example (Japanese)"]
                    ),
                    example_romaji=self.optional_value(
                        row["Example (Romaji)"]
                    ),
                    example_english=self.optional_value(
                        row["Example (English)"]
                    ),
                )
            )

        Grammar_example.objects.bulk_create(
            examples,
            batch_size=batch_size,
        )

        duplicate_count = len(rows) - len(
            {row["Grammar Point"].strip() for row in rows}
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Imported {len(entries)} grammar entries and "
                f"{len(examples)} examples. "
                f"Renamed {duplicate_count} duplicate grammar points."
            )
        )

    def read_rows(self, path):
        try:
            with path.open("r", encoding="utf-8-sig", newline="") as file:
                reader = csv.DictReader(file)
                if reader.fieldnames is None:
                    raise CommandError("CSV file is empty")

                missing_columns = REQUIRED_COLUMNS - set(reader.fieldnames)
                if missing_columns:
                    columns = ", ".join(sorted(missing_columns))
                    raise CommandError(f"Missing required columns: {columns}")

                rows = list(reader)
        except OSError as exc:
            raise CommandError(f"Could not read {path}: {exc}") from exc

        if not rows:
            raise CommandError("CSV file has no data rows")

        return rows

    def unique_grammar_names(self, rows):
        seen = {}
        names = []

        for row_number, row in enumerate(rows, start=2):
            grammar = self.required_value(row, "Grammar Point", row_number)
            jlpt_level = self.required_value(row, "JLPT Level", row_number)

            count = seen.get(grammar, 0) + 1
            seen[grammar] = count

            if count == 1:
                names.append(grammar)
                continue

            suffix = f" [{jlpt_level}]"
            if count > 2:
                suffix = f" [{jlpt_level} #{count}]"

            names.append(f"{grammar}{suffix}")

        return names

    def parse_jlpt_level(self, value, row_number):
        value = self.clean_value(value)
        match = JLPT_LEVEL_RE.match(value)
        if not match:
            raise CommandError(
                f"Invalid JLPT Level on row {row_number}: {value!r}"
            )

        return int(match.group(1))

    def required_value(self, row, column, row_number):
        value = self.clean_value(row[column])
        if not value:
            raise CommandError(f"Missing {column!r} on row {row_number}")

        return value

    def optional_value(self, value):
        value = self.clean_value(value)
        return value or None

    def clean_value(self, value):
        return value.strip() if value is not None else ""

    def validate_max_length(self, column, value, max_length, row_number):
        if value is not None and len(value) > max_length:
            raise CommandError(
                f"{column!r} on row {row_number} is {len(value)} characters; "
                f"maximum is {max_length}"
            )
