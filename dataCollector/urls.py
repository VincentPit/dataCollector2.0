from django.urls import path
from .views import (
    register,
    login,
    protected_view,
    validate_link,
    download_link,
    dataset_choices, 
    modified_dataset_choices,
    DatasetItemsView, 
    DatasetItemDetailView,
    EditDatasetItemView,
)

urlpatterns = [
    path('api/register/', register, name='register'),
    path('api/login/', login, name='login'),
    path('api/protected/', protected_view, name='protected_view'),
    path('api/upload/validate/', validate_link, name='validate_link'),  # URL for validating links
    path('api/upload/download/', download_link, name='download_link'),  # URL for downloading files
    path('api/datasets/', dataset_choices, name='dataset_choices'),
    path('api/modified_datasets/', modified_dataset_choices, name='modified_dataset_choices'),
    path('api/modified_datasets/<str:dataset_id>/items/', DatasetItemsView.as_view(), name='dataset_items'),
    path('api/datasets/<str:dataset_id>/items/<int:item_id>/', DatasetItemDetailView.as_view(), name='dataset_item_detail'), 
    path('api/datasets/<str:dataset_id>/items/edit/<int:item_id>/', EditDatasetItemView.as_view(), name='edit_dataset_item'),
    path('api/datasets/<str:dataset_id>/items/', DatasetItemsView.as_view(), name='dataset_items'),
]