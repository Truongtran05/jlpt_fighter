from pathlib import Path

import ijson
from django.core.management.base import BaseCommand, CommandError
from django.db import connection, transaction

from dictionary.models import Grammar_entry, Grammar_example, Grammar_meaning


LANGUAGES = {"eng": "en", "vie": "vi"}


class Command(BaseCommand):
    help = "Import grammar from DataGrammar.json"

    def add_arguments(self, parser):
        parser.add_argument(
            "--path",
            type=Path,
            default=Path(__file__).resolve().parents[4] / "data" / "DataGrammar.json",
            help="Path to DataGrammar.json",
        )
        parser.add_argument(
            "--batch-size",
            type=int,
            default=2000,
            help="Number of grammar entries to insert per batch (default: 2000)",
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
                    "TRUNCATE TABLE dictionary_grammar_entry "
                    "RESTART IDENTITY CASCADE"
                )

            counts = [0, 0, 0]
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
                f"Imported {counts[0]} grammar entries, {counts[1]} meanings, "
                f"and {counts[2]} examples."
            )
        )

    def _import_batch(self, batch, batch_size, counts):
        entries = []
        child_values = []

        for item_number, item in batch:
            if not isinstance(item, dict):
                raise CommandError(f"Grammar item {item_number} must be an object")

            grammar = item.get("grammar")
            formation = item.get("formation") or None
            try:
                jlpt_level = int(item.get("jlptLevel"))
            except (TypeError, ValueError) as exc:
                raise CommandError(
                    f"Invalid JLPT level in grammar item {item_number}"
                ) from exc
            if (
                not isinstance(grammar, str)
                or not grammar
                or not isinstance(formation, (str, type(None)))
                or jlpt_level not in range(1, 6)
            ):
                raise CommandError(f"Invalid grammar item {item_number}")
            if len(grammar) > 255 or (formation and len(formation) > 255):
                raise CommandError(f"Grammar item {item_number} exceeds model limits")

            entry = Grammar_entry(
                grammar=grammar,
                formation=formation,
                jlpt_level=jlpt_level,
            )
            entries.append(entry)
            child_values.append((item_number, item, entry))

        Grammar_entry.objects.bulk_create(entries, batch_size=batch_size)

        meanings = []
        examples = []
        for item_number, item, entry in child_values:
            values = item.get("meaning", {})
            if not isinstance(values, dict):
                raise CommandError(f"Invalid meanings in grammar item {item_number}")
            for source_lang, lang in LANGUAGES.items():
                meaning = values.get(source_lang)
                if meaning is None or meaning == "":
                    continue
                if not isinstance(meaning, str):
                    raise CommandError(
                        f"Invalid {source_lang} meaning in grammar item {item_number}"
                    )
                meanings.append(
                    Grammar_meaning(
                        grammar_entry=entry,
                        lang=lang,
                        meaning=meaning,
                    )
                )

            values = item.get("examples", [])
            if not isinstance(values, list):
                raise CommandError(f"Invalid examples in grammar item {item_number}")
            seen_examples = set()
            for value in values:
                if not isinstance(value, dict) or value.get("lang") not in LANGUAGES:
                    raise CommandError(f"Invalid example in grammar item {item_number}")
                japanese = value.get("exampleJapanese") or None
                romaji = value.get("exampleRomaji") or None
                gloss = value.get("exampleGloss") or None
                if not all(
                    isinstance(field, (str, type(None)))
                    for field in (japanese, romaji, gloss)
                ):
                    raise CommandError(f"Invalid example in grammar item {item_number}")

                lang = LANGUAGES[value["lang"]]
                key = (japanese, lang)
                if key in seen_examples:
                    continue
                seen_examples.add(key)
                examples.append(
                    Grammar_example(
                        grammar_entry=entry,
                        lang=lang,
                        example_japanese=japanese,
                        example_romaji=romaji,
                        example_gloss=gloss,
                    )
                )

        Grammar_meaning.objects.bulk_create(meanings, batch_size=batch_size)
        Grammar_example.objects.bulk_create(examples, batch_size=batch_size)

        counts[0] += len(entries)
        counts[1] += len(meanings)
        counts[2] += len(examples)
