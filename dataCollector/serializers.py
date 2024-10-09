from rest_framework import serializers
from .models import QA_ZRE, Counterfact, ModifiedQA_ZRE, ModifiedCounterfact, ModificationHistory

class QA_ZRESerializer(serializers.ModelSerializer):
    class Meta:
        model = QA_ZRE
        fields = ['relation', 'question', 'subject', 'context', 'answers']

class CounterfactSerializer(serializers.ModelSerializer):
    requested_rewrite = serializers.StringRelatedField()

    class Meta:
        model = Counterfact
        fields = ['case_id', 'pararel_idx', 'requested_rewrite', 'paraphrase_prompts', 'neighborhood_prompts', 'attribute_prompts', 'generation_prompts']

# New serializer for modified QA_ZRE
class ModifiedQA_ZRESerializer(serializers.ModelSerializer):
    class Meta:
        model = ModifiedQA_ZRE
        fields = ['original', 'relation', 'question', 'subject', 'context', 'answers', 'is_modified']  # Include all relevant fields

# New serializer for modified Counterfact
class ModifiedCounterfactSerializer(serializers.ModelSerializer):
    requested_rewrite = serializers.StringRelatedField()

    class Meta:
        model = ModifiedCounterfact
        fields = ['original', 'case_id', 'pararel_idx', 'requested_rewrite', 'paraphrase_prompts', 'neighborhood_prompts', 'attribute_prompts', 'generation_prompts', 'is_modified']  # Include all relevant fields

class ModificationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ModificationHistory
        fields = ['modified_object', 'object_id', 'modification_time', 'modified_by', 'previous_values', 'new_values']