import os
from django.core.management.base import BaseCommand
from datasets import load_dataset
from dataCollector.models import QA_ZRE, Counterfact, RequestedRewrite, Target

class Command(BaseCommand):
    help = "Populate the database from the downloaded datasets"

    def handle(self, *args, **kwargs):
        cache_directory = "./datasets"
        error_log_file = "error_log.txt"

        ds1 = load_dataset("community-datasets/qa_zre", cache_dir=os.path.join(cache_directory, "qa_zre"))
        ds2 = load_dataset("azhx/counterfact", cache_dir=os.path.join(cache_directory, "azhx/counterfact"))

        self.stdout.write(self.style.SUCCESS("Populating QA_ZRE dataset..."))
        for index, entry in enumerate(ds1['train']):
            try:
                qa_zre_obj = QA_ZRE(
                    relation=entry['relation'],
                    question=entry['question'],
                    subject=entry['subject'],
                    context=entry['context'],
                    answers=entry['answers']
                )
                qa_zre_obj.save()
                self.stdout.write(self.style.SUCCESS(f"Saved QA_ZRE entry {index}"))
            except Exception as e:
                error_message = (
                    f"Error saving QA_ZRE entry {index}: {e}\n"
                    f"Entry details:\n"
                    f"Relation: {entry['relation']}\n"
                    f"Question: {entry['question']}\n"
                    f"Subject: {entry['subject']}\n"
                    f"Context: {entry['context']}\n"
                    f"Answers: {entry['answers']}\n\n"
                )
                self.stdout.write(self.style.ERROR(error_message))
                
                # Write the error message to a text file
                with open(error_log_file, 'a') as f:
                    f.write(error_message)

        self.stdout.write(self.style.SUCCESS("Populating Counterfact dataset..."))
        for index, entry in enumerate(ds2['train']):
            try:
                target_new = Target.objects.create(
                    target_id=entry['requested_rewrite']['target_new']['id'],
                    target_str=entry['requested_rewrite']['target_new']['str']
                )
                target_true = Target.objects.create(
                    target_id=entry['requested_rewrite']['target_true']['id'],
                    target_str=entry['requested_rewrite']['target_true']['str']
                )

                requested_rewrite = RequestedRewrite.objects.create(
                    prompt=entry['requested_rewrite']['prompt'],
                    relation_id=entry['requested_rewrite']['relation_id'],
                    subject=entry['requested_rewrite']['subject'],
                    target_new=target_new,
                    target_true=target_true
                )

                counterfact_obj = Counterfact(
                    case_id=entry['case_id'],
                    pararel_idx=entry['pararel_idx'],
                    requested_rewrite=requested_rewrite,
                    paraphrase_prompts=entry['paraphrase_prompts'],
                    neighborhood_prompts=entry['neighborhood_prompts'],
                    attribute_prompts=entry['attribute_prompts'],
                    generation_prompts=entry['generation_prompts']
                )
                counterfact_obj.save()
            except Exception as e:
                error_message = f"Error saving Counterfact entry {index}: {e}\n"
                self.stdout.write(self.style.ERROR(error_message))
                
                # Write the error message to a text file
                with open(error_log_file, 'a') as f:
                    f.write(error_message)

        self.stdout.write(self.style.SUCCESS("Database populated successfully!"))
