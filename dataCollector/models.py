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


class ModifiedQA_ZRE(models.Model):
    original = models.ForeignKey(QA_ZRE, related_name='modifications', on_delete=models.CASCADE)
    relation = models.CharField(max_length=255)
    question = models.TextField()
    subject = models.CharField(max_length=255)
    context = models.TextField()
    answers = models.JSONField()  # List of modified answers
    is_modified = models.BooleanField(default=False)  # Indicates if this entity is modified

    def __str__(self):
        return f"Modified Question: {self.question}"

    def initialize_from_original(self):
        """
        Initialize the modified version with the same attributes as the original version.
        """
        self.relation = self.original.relation
        self.question = self.original.question
        self.subject = self.original.subject
        self.context = self.original.context
        self.answers = self.original.answers


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


class ModifiedCounterfact(models.Model):
    original = models.ForeignKey(Counterfact, related_name='modifications', on_delete=models.CASCADE)
    case_id = models.IntegerField()
    pararel_idx = models.IntegerField()
    requested_rewrite = models.OneToOneField(RequestedRewrite, related_name='modified_rewrite', on_delete=models.CASCADE)
    paraphrase_prompts = models.JSONField()  # List of modified paraphrase prompts
    neighborhood_prompts = models.JSONField()  # List of modified neighborhood prompts
    attribute_prompts = models.JSONField()  # List of modified attribute prompts
    generation_prompts = models.JSONField()  # List of modified generation prompts
    is_modified = models.BooleanField(default=False)  # Indicates if this entity is modified

    def __str__(self):
        return f"Modified Case {self.case_id}, Modified Rewrite {self.requested_rewrite.prompt}"

    def initialize_from_original(self):
        """
        Initialize the modified version with the same attributes as the original version.
        """
        self.case_id = self.original.case_id
        self.pararel_idx = self.original.pararel_idx
        self.requested_rewrite = self.original.requested_rewrite
        self.paraphrase_prompts = self.original.paraphrase_prompts
        self.neighborhood_prompts = self.original.neighborhood_prompts
        self.attribute_prompts = self.original.attribute_prompts
        self.generation_prompts = self.original.generation_prompts

from django.utils import timezone

class ModificationHistory(models.Model):
    modified_object = models.CharField(max_length=255)  # Name of the modified model
    object_id = models.IntegerField()  # ID of the modified object
    modification_time = models.DateTimeField(default=timezone.now)  # When the modification was made
    modified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)  # Who modified it
    previous_values = models.JSONField()  # Store the previous state of the object as JSON
    new_values = models.JSONField()  # Store the new state of the object as JSON

    def __str__(self):
        return f"Modification of {self.modified_object} (ID: {self.object_id}) by {self.modified_by}"
