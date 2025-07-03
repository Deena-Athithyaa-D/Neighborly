from django.urls import path
from . import views,auth


urlpatterns = [
    path('create_profile', views.create_profile),
    path('create_community/<user_id>', views.create_community),
    path('create_join', views.create_join),
    path('create_post', views.create_post),
    path('create_offer', views.create_offer),
    path('create_request', views.create_request),
    path('get_offers/<comm_id>', views.get_offers),
    path('get_posts/<comm_id>', views.get_posts),
    path('get_offers_for_user/<user_id>/<comm_id>', views.get_offers_for_user),
    path('view_request_from_neighbours/<offer_id>', views.view_request_from_neighbours),
    path('view_public_requests/<comm_id>', views.view_public_requests),
    path('view_user_requests/<comm_id>/<user_id>', views.view_user_requests),
    path('get_user_communities/<user_id>', views.get_user_communities),
    path('send_join_request', views.send_join_request),
    path('view_join_requests/<comm_id>/<user_id>', views.view_join_requests),
    path('get_profile/<user_id>', views.get_profile),
    path('update_offer_status/<offer_id>/<status>', views.update_offer_status),
    path('update_request_status/<request_id>/<status>/<user_id>', views.update_request_status),
    path('get_communities/<latitude>/<longtitude>', views.get_communities),
    # path('google_sign_in',auth.google_sign_in)
]
