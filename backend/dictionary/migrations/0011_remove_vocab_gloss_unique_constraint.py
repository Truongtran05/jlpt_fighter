import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("dictionary", "0010_remove_grammar_entry_meaning_and_more"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="vocab_gloss",
            name="unique_vocab_gloss",
        ),
        migrations.AlterField(
            model_name="vocab_gloss",
            name="vocab_sense",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="glosses",
                to="dictionary.vocab_sense",
            ),
        ),
    ]
