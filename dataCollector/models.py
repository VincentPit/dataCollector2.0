from django.db import models
from django.contrib.auth.models import User

class Prompt(models.Model):
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Label(models.Model):
    prompt = models.ForeignKey(Prompt, on_delete=models.CASCADE)
    user = models.CharField(max_length=100)  # Or use a user model
    label_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

