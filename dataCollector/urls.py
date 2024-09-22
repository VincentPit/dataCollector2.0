from django.urls import path
from .views import register, login

urlpatterns = [
    path('api/register/', register, name='register'),
    path('api/login/', login, name='login'),
]
