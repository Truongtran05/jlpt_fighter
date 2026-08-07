from pathlib import Path

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from dictionary.models import Kanji_entry


DEFAULT_DATA_DIR = Path(__file__).resolve().parents[4] / "data"


class Command(BaseCommand):
    help = "Update kanji JLPT levels from N1_kanji.txt through N5_kanji.txt"

    def add_arguments(self, parser):
        parser.add_argument(
            "--data-dir",
            type=Path,
            default=DEFAULT_DATA_DIR,
            help="Directory containing N1_kanji.txt through N5_kanji.txt",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Validate and report changes without updating the database",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        levels = self._read_levels(options["data_dir"])
        kanji_to_level = {
            kanji: level for level, kanji_values in levels.items()
            for kanji in kanji_values
        }

        entries = list(
            Kanji_entry.objects.filter(kanji__in=kanji_to_level).only(
                "kanji_id", "kanji", "jlpt_level"
            )
        )
        existing = {entry.kanji for entry in entries}
        missing = sorted(set(kanji_to_level) - existing)
        changed = []
        for entry in entries:
            new_level = kanji_to_level[entry.kanji]
            if entry.jlpt_level != new_level:
                entry.jlpt_level = new_level
                changed.append(entry)

        if not options["dry_run"] and changed:
            Kanji_entry.objects.bulk_update(changed, ["jlpt_level"])

        action = "Would update" if options["dry_run"] else "Updated"
        self.stdout.write(
            self.style.SUCCESS(
                f"{action} {len(changed)} kanji; {len(entries) - len(changed)} "
                f"already had the correct level; {len(missing)} not found."
            )
        )
        if missing:
            self.stdout.write(
                self.style.WARNING("Kanji not found: " + " ".join(missing))
            )

    def _read_levels(self, data_dir):
        if not data_dir.is_dir():
            raise CommandError(f"Data directory not found: {data_dir}")

        levels = {}
        seen = {}
        for level in range(1, 6):
            path = data_dir / f"N{level}_kanji.txt"
            if not path.is_file():
                raise CommandError(f"File not found: {path}")
            try:
                values = path.read_text(encoding="utf-8-sig").split()
            except (OSError, UnicodeError) as exc:
                raise CommandError(f"Could not read {path}: {exc}") from exc

            invalid = [value for value in values if len(value) != 1]
            if invalid:
                raise CommandError(
                    f"Invalid kanji token in {path}: {invalid[0]!r}"
                )

            unique_values = list(dict.fromkeys(values))
            for kanji in unique_values:
                if kanji in seen:
                    raise CommandError(
                        f"Kanji {kanji!r} occurs in both N{seen[kanji]} and N{level}"
                    )
                seen[kanji] = level
            levels[level] = unique_values
        return levels
