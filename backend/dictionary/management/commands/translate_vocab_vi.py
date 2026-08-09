import csv
import json
import time
import unicodedata
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import Prefetch

from dictionary.models import Vocab_entry, Vocab_meaning, Vocab_sense, Vocab_writting


DEFAULT_PATH = Path(__file__).resolve().parents[4] / "data" / "jlpt_vocab.csv"
DEFAULT_API_URL = "http://127.0.0.1:5000"


def normalize_writing(value):
    return "".join(unicodedata.normalize("NFKC", value).split())


class LibreTranslateClient:
    def __init__(self, base_url, timeout=30, retries=2):
        self.url = f"{base_url.rstrip('/')}/translate"
        self.timeout = timeout
        self.retries = retries

    def translate(self, text):
        payload = json.dumps(
            {
                "q": text,
                "source": "en",
                "target": "vi",
                "format": "text",
            }
        ).encode("utf-8")
        request = Request(
            self.url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        for attempt in range(self.retries + 1):
            try:
                with urlopen(request, timeout=self.timeout) as response:
                    result = json.loads(response.read().decode("utf-8"))
                translated = result.get("translatedText")
                if not isinstance(translated, str) or not translated.strip():
                    raise ValueError("response does not contain translatedText")
                return translated.strip()
            except (
                HTTPError,
                URLError,
                TimeoutError,
                UnicodeError,
                json.JSONDecodeError,
                ValueError,
            ) as exc:
                if attempt == self.retries:
                    raise CommandError(
                        f"LibreTranslate request failed for {text!r}: {exc}"
                    ) from exc
                time.sleep(0.5 * (attempt + 1))


class Command(BaseCommand):
    help = "Translate English senses for JLPT vocabulary into Vietnamese"

    def add_arguments(self, parser):
        parser.add_argument("--path", type=Path, default=DEFAULT_PATH)
        parser.add_argument("--api-url", default=DEFAULT_API_URL)
        parser.add_argument("--timeout", type=float, default=30)
        parser.add_argument("--retries", type=int, default=2)
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Only report matching entries and senses; do not translate or write",
        )
        parser.add_argument(
            "--limit",
            type=int,
            help="Process at most this many English senses (useful for testing)",
        )

    def handle(self, *args, **options):
        if options["timeout"] <= 0:
            raise CommandError("--timeout must be greater than zero")
        if options["retries"] < 0:
            raise CommandError("--retries cannot be negative")
        if options["limit"] is not None and options["limit"] < 1:
            raise CommandError("--limit must be greater than zero")

        originals = self._read_originals(options["path"])
        entries = self._matching_entries(originals)
        client = LibreTranslateClient(
            options["api_url"], options["timeout"], options["retries"]
        )

        matched_entries = processed = created = deleted = meanings = 0
        for entry in entries:
            matched_entries += 1
            selected_senses = []
            for english_sense in entry.english_senses:
                if options["limit"] is not None and processed >= options["limit"]:
                    break
                processed += 1
                selected_senses.append(english_sense)

            if not selected_senses:
                if options["limit"] is not None and processed >= options["limit"]:
                    break
                continue

            existing_count = Vocab_sense.objects.filter(
                vocab_entry=entry, lang="vi"
            ).count()
            if options["dry_run"]:
                deleted += existing_count
                created += len(selected_senses)
                meanings += sum(
                    len(sense.english_meanings) for sense in selected_senses
                )
            else:
                translated_senses = [
                    (
                        english_sense,
                        [
                            client.translate(item.meaning)
                            for item in english_sense.english_meanings
                            if item.meaning
                        ],
                    )
                    for english_sense in selected_senses
                ]
                with transaction.atomic():
                    Vocab_sense.objects.filter(
                        vocab_entry=entry, lang="vi"
                    ).delete()
                    for english_sense, translated in translated_senses:
                        vietnamese_sense = Vocab_sense.objects.create(
                            vocab_entry=entry,
                            position=english_sense.position,
                            lang="vi",
                            part_of_speech=english_sense.part_of_speech,
                            applied_to_kanji=english_sense.applied_to_kanji,
                            applied_to_kana=english_sense.applied_to_kana,
                        )
                        Vocab_meaning.objects.bulk_create(
                            [
                                Vocab_meaning(
                                    vocab_sense=vietnamese_sense, meaning=text
                                )
                                for text in translated
                            ]
                        )
                deleted += existing_count
                created += len(translated_senses)
                meanings += sum(
                    len(translated)
                    for _, translated in translated_senses
                )
            if options["limit"] is not None and processed >= options["limit"]:
                break

        action = "Would create" if options["dry_run"] else "Created"
        delete_action = "would delete" if options["dry_run"] else "deleted"
        self.stdout.write(
            self.style.SUCCESS(
                f"Matched {matched_entries} vocabulary entries and {processed} "
                f"English senses. {action} {created} Vietnamese senses and "
                f"{meanings} meanings; {delete_action} {deleted} existing "
                "Vietnamese senses."
            )
        )

    def _read_originals(self, path):
        if not path.is_file():
            raise CommandError(f"File not found: {path}")
        try:
            with path.open("r", encoding="utf-8-sig", newline="") as file:
                reader = csv.DictReader(file)
                if not reader.fieldnames or "Original" not in reader.fieldnames:
                    raise CommandError("CSV must contain an Original column")
                return {
                    normalize_writing(row["Original"] or "")
                    for row in reader
                    if normalize_writing(row["Original"] or "")
                }
        except (OSError, UnicodeError, csv.Error) as exc:
            raise CommandError(f"Could not read {path}: {exc}") from exc

    def _matching_entries(self, originals):
        english_senses = Vocab_sense.objects.filter(lang="en").order_by(
            "position", "vocab_sense_id"
        ).prefetch_related(
            Prefetch(
                "meanings",
                queryset=Vocab_meaning.objects.order_by("vocab_meaning_id"),
                to_attr="english_meanings",
            )
        )
        queryset = Vocab_entry.objects.prefetch_related(
            Prefetch(
                "writtings",
                queryset=Vocab_writting.objects.only("vocab_entry_id", "writting"),
                to_attr="translation_writings",
            ),
            Prefetch("senses", queryset=english_senses, to_attr="english_senses"),
        ).order_by("vocab_id")
        return [
            entry
            for entry in queryset
            if any(
                normalize_writing(item.writting) in originals
                for item in entry.translation_writings
            )
        ]
