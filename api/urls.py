from django.urls import path
from . import views,auth

urlpatterns = [
    path('create_user', views.create_user),
    path('create_community', views.create_community),
    path('create_join', views.create_join),
    path('create_post', views.create_post),
    path('create_offer', views.create_offer),
    path('create_request', views.create_request),
    path('get_offers/<comm_id>', views.get_offers),
    path('get_posts/<comm_id>', views.get_posts),
    path('get_offers_for_user/<user_id>', views.get_offers_for_user),
    path('view_request_from_neighbours/<provider_id>', views.view_request_from_neighbours),
    path('view_public_requests/<provider_id>', views.view_public_requests),
    path('get_user_communities/<user_id>', views.get_user_communities),
    path('google_sign_in',auth.google_sign_in)
]
