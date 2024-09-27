# dataCollector/management/commands/create_modified_entries.py
from django.core.management.base import BaseCommand
from dataCollector.models import QA_ZRE, Counterfact, ModifiedQA_ZRE, ModifiedCounterfact, Target, RequestedRewrite

class Command(BaseCommand):
    help = 'Create incipient entries in the database for modified versions'

    def handle(self, *args, **kwargs):
        self.create_incipient_modified_entries()

    def create_incipient_modified_entries(self):
        # Create ModifiedQA_ZRE entries
        """for qa in QA_ZRE.objects.all():
            modified_qa = ModifiedQA_ZRE(
                original=qa,              # Reference to the original entry
                relation=qa.relation,      # Copy original attributes
                question=qa.question,
                subject=qa.subject,
                context=qa.context,
                answers=qa.answers,
                is_modified=False         # Initially not modified
            )
            modified_qa.save()
            self.stdout.write(self.style.SUCCESS(f"Created ModifiedQA_ZRE for question: {qa.question}"))"""

        # Create ModifiedCounterfact entries
        for cf in Counterfact.objects.all():
            # Duplicate the Targets
            target_new = Target.objects.create(
                target_id=cf.requested_rewrite.target_new.target_id,
                target_str=cf.requested_rewrite.target_new.target_str
            )
            target_true = Target.objects.create(
                target_id=cf.requested_rewrite.target_true.target_id,
                target_str=cf.requested_rewrite.target_true.target_str
            )

            # Duplicate the RequestedRewrite
            requested_rewrite = RequestedRewrite.objects.create(
                prompt=cf.requested_rewrite.prompt,
                relation_id=cf.requested_rewrite.relation_id,
                subject=cf.requested_rewrite.subject,
                target_new=target_new,
                target_true=target_true
            )

            # Create the ModifiedCounterfact
            modified_cf = ModifiedCounterfact(
                original=cf,  # Reference to the original entry
                case_id=cf.case_id,  # Copy original attributes
                pararel_idx=cf.pararel_idx,
                requested_rewrite=requested_rewrite,
                paraphrase_prompts=cf.paraphrase_prompts,
                neighborhood_prompts=cf.neighborhood_prompts,
                attribute_prompts=cf.attribute_prompts,
                generation_prompts=cf.generation_prompts,
                is_modified=False  # Initially not modified
            )
            modified_cf.save()
            self.stdout.write(self.style.SUCCESS(f"Created ModifiedCounterfact for case: {cf.case_id}"))
