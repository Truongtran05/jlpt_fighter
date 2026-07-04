from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("dictionary", "0004_vocab_entry_vocab_meaning_vocab_writting"),
    ]

    operations = [
        migrations.AlterField(
            model_name="vocab_meaning",
            name="meaning",
            field=models.CharField(max_length=512),
        ),
    ]
