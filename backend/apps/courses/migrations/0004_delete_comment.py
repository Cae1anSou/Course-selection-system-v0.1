# Generated by Django 5.1.6 on 2025-02-16 10:29

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0003_comment"),
    ]

    operations = [
        migrations.DeleteModel(
            name="Comment",
        ),
    ]
