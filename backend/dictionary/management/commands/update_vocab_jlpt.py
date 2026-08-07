import csv
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Prefetch

from dictionary.models import Vocab_entry, Vocab_writting


DEFAULT_PATH = Path(__file__).resolve().parents[4] / "data" / "jlpt_vocab.csv"
JLPT_LEVEL = re.compile(r"N([1-5])", re.IGNORECASE)


def normalize_writing(value):
    """Normalize Unicode width/forms and ignore whitespace used for formatting."""
    return "".join(unicodedata.normalize("NFKC", value).split())


class Command(BaseCommand):
    help = "Update vocabulary JLPT levels from data/jlpt_vocab.csv"

    def add_arguments(self, parser):
        parser.add_argument(
            "--path",
            type=Path,
            default=DEFAULT_PATH,
            help="Path to jlpt_vocab.csv",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=2000,
            help="Number of entries to update per query (default: 2000)",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Validate and report changes without updating the database",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        path = options["path"]
        batch_size = options["batch_size"]
        if batch_size < 1:
            raise CommandError("--batch-size must be greater than zero")

        csv_values = self._read_csv(path)
        writings = Vocab_writting.objects.only(
            "vocab_entry_id", "writting", "writting_type"
        ).order_by("vocab_writting_id")
        entries = Vocab_entry.objects.prefetch_related(
            Prefetch("writtings", queryset=writings, to_attr="jlpt_writings")
        ).only("vocab_id", "jlpt_level")

        changed = []
        matched = unchanged = ambiguous = 0
        matched_originals = set()
        for entry in entries.iterator(chunk_size=batch_size):
            kanji_values = {
                normalize_writing(writing.writting)
                for writing in entry.jlpt_writings
                if writing.writting_type == "kanji"
            }
            candidates = set()
            entry_originals = kanji_values & csv_values.keys()
            for original in entry_originals:
                candidates.update(csv_values[original])
            if not candidates:
                continue

            matched_originals.update(entry_originals)
            levels = {level for _, level in candidates}
            if len(levels) > 1:
                kana_values = {
                    normalize_writing(writing.writting)
                    for writing in entry.jlpt_writings
                    if writing.writting_type == "kana"
                }
                furigana_matches = {
                    level for furigana, level in candidates
                    if furigana and furigana in kana_values
                }
                if len(furigana_matches) == 1:
                    levels = furigana_matches

            if len(levels) != 1:
                ambiguous += 1
                continue

            matched += 1
            level = levels.pop()
            if entry.jlpt_level == level:
                unchanged += 1
                continue
            entry.jlpt_level = level
            changed.append(entry)
            if len(changed) == batch_size:
                self._update(changed, options["dry_run"], batch_size)
                changed.clear()

        self._update(changed, options["dry_run"], batch_size)
        # Full batches have already been cleared, so derive the total from matches.
        updated = matched - unchanged
        unmatched_csv = len(csv_values.keys() - matched_originals)
        action = "Would update" if options["dry_run"] else "Updated"
        self.stdout.write(self.style.SUCCESS(
            f"{action} {updated} vocabulary entries; {unchanged} already correct; "
            f"{ambiguous} ambiguous entries skipped; {unmatched_csv} CSV originals "
            "not found in kanji writings."
        ))

    def _update(self, entries, dry_run, batch_size):
        if entries and not dry_run:
            Vocab_entry.objects.bulk_update(
                entries, ["jlpt_level"], batch_size=batch_size
            )

    def _read_csv(self, path):
        if not path.is_file():
            raise CommandError(f"File not found: {path}")

        values = defaultdict(set)
        try:
            with path.open("r", encoding="utf-8-sig", newline="") as file:
                reader = csv.DictReader(file)
                required = {"Original", "Furigana", "JLPT Level"}
                if not reader.fieldnames or not required.issubset(reader.fieldnames):
                    raise CommandError(
                        "CSV must contain Original, Furigana, and JLPT Level columns"
                    )
                for row_number, row in enumerate(reader, 2):
                    original = normalize_writing(row["Original"] or "")
                    furigana = normalize_writing(row["Furigana"] or "")
                    level_match = JLPT_LEVEL.fullmatch((row["JLPT Level"] or "").strip())
                    if not original or not level_match:
                        raise CommandError(f"Invalid CSV data at row {row_number}")
                    values[original].add((furigana, int(level_match.group(1))))
        except (OSError, UnicodeError, csv.Error) as exc:
            raise CommandError(f"Could not read {path}: {exc}") from exc
        return values
