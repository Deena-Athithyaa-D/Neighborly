from django.urls import path
from . import views

urlpatterns = [
    path('test/',views.test),
    path('create_user', views.create_user),
    path('create_community', views.create_community),
    path('create_join', views.create_join),
    path('create_post', views.create_post),
    path('create_offer', views.create_offer),
    path('create_request', views.create_request),
]
