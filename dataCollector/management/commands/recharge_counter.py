from django.core.management.base import BaseCommand
from dataCollector.models import Counterfact, ModifiedCounterfact

class Command(BaseCommand):
    help = 'Clear ModifiedCounterfact table and copy entries from Counterfact'

    def handle(self, *args, **kwargs):
        # Clear all entries in the ModifiedCounterfact table
        ModifiedCounterfact.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Successfully cleared ModifiedCounterfact table.'))

        # Get all original Counterfact entries
        original_counterfacts = Counterfact.objects.all()

        # Create ModifiedCounterfact entries based on the originals
        for original in original_counterfacts:
            modified_counterfact = ModifiedCounterfact(
                original=original,
                case_id=original.case_id,
                pararel_idx=original.pararel_idx,
                requested_rewrite=original.requested_rewrite,
                paraphrase_prompts=original.paraphrase_prompts,
                neighborhood_prompts=original.neighborhood_prompts,
                attribute_prompts=original.attribute_prompts,
                generation_prompts=original.generation_prompts,
                is_modified=False  # Set to False initially
            )
            modified_counterfact.save()

        self.stdout.write(self.style.SUCCESS('Successfully copied entries from Counterfact to ModifiedCounterfact.'))
