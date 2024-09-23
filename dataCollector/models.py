from django.db import models
from django.contrib.auth.models import User


class QA_ZRE(models.Model):
    relation = models.CharField(max_length=255)
    question = models.TextField()
    subject = models.CharField(max_length=255)
    context = models.TextField()
    answers = models.JSONField()  # Using JSONField to store the list of answers

    def __str__(self):
        return self.question
    

class Target(models.Model):
    target_id = models.CharField(max_length=255)
    target_str = models.TextField()

class RequestedRewrite(models.Model):
    prompt = models.TextField()
    relation_id = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    target_new = models.OneToOneField(Target, related_name='new_target', on_delete=models.CASCADE)
    target_true = models.OneToOneField(Target, related_name='true_target', on_delete=models.CASCADE)

class Counterfact(models.Model):
    case_id = models.IntegerField()
    pararel_idx = models.IntegerField()
    requested_rewrite = models.OneToOneField(RequestedRewrite, on_delete=models.CASCADE)
    paraphrase_prompts = models.JSONField()  # List of paraphrase prompts
    neighborhood_prompts = models.JSONField()  # List of neighborhood prompts
    attribute_prompts = models.JSONField()  # List of attribute prompts
    generation_prompts = models.JSONField()  # List of generation prompts

    def __str__(self):
        return f"Case {self.case_id}, Rewrite {self.requested_rewrite.prompt}"