from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializer import UserSerializer, CommunitySerializer, JoinSerializer, PostsSerializer, OffersSerializer, RequestsSerializer,ProfileSerializer,JoinRequestSerializer
from .models import User,Community,Join,Posts,Offers,Requests,Profile,JoinRequest
from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from .auth import verify_firebase_token

def firebase_auth_required(view_func):
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        try:
            decoded_token = verify_firebase_token(request)
            request.user = decoded_token 
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_401_UNAUTHORIZED)
        return view_func(request, *args, **kwargs)
    return _wrapped_view

@api_view(['GET','HEAD'])
def home(request):
    return HttpResponse("Hello World")

@api_view(['POST'])
@firebase_auth_required
def create_profile(request):
    new_profile = ProfileSerializer(data = request.data)
    if new_profile.is_valid():
        new_profile.save()
        return Response(new_profile.data, status = status.HTTP_201_CREATED)
    return Response(new_profile.errors, status = status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@firebase_auth_required
def get_profile(request, user_id):
    profile = Profile.objects.get(uuid = user_id)
    serializer = ProfileSerializer(profile)
    return Response(serializer.data)

@api_view(['POST'])
@firebase_auth_required
def create_community(request):
    new_community = CommunitySerializer(data = request.data)
    if new_community.is_valid():
        new_community.save()
        return Response(new_community.data, status = status.HTTP_201_CREATED)
    return Response(new_community.errors, status = status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@firebase_auth_required
def get_user_communities(request, user_id):
    communities = Join.objects.filter(user_id = user_id)
    serializer = JoinSerializer(communities, many = True)
    return Response(serializer.data)

@api_view(['POST'])
@firebase_auth_required
def create_join(request):
    new_join = JoinSerializer(data = request.data)
    if new_join.is_valid():
        new_join.save()
        return Response(new_join.data, status = status.HTTP_201_CREATED)
    return Response(new_join.errors, status = status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@firebase_auth_required
def create_post(request):
    new_post = PostsSerializer(data = request.data)
    if new_post.is_valid():
        new_post.save()
        return Response(new_post.data, status = status.HTTP_201_CREATED)
    return Response(new_post.errors, status = status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@firebase_auth_required
def get_posts(request, comm_id):
    posts = Posts.objects.filter(comm_id= comm_id)
    serializer = PostsSerializer(posts, many = True)
    return Response(serializer.data)

@api_view(['POST'])
@firebase_auth_required
def create_offer(request):
    new_offer = OffersSerializer(data = request.data)
    if new_offer.is_valid():
        new_offer.save()
        return Response(new_offer.data, status = status.HTTP_201_CREATED)
    return Response(new_offer.errors, status = status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@firebase_auth_required
def get_offers(request, comm_id):
    offers = Offers.objects.filter(comm_id= comm_id)
    serializer = OffersSerializer(offers, many = True)
    return Response(serializer.data)

@api_view(['GET'])
@firebase_auth_required
def get_offers_for_user(request, user_id):
    offers = Offers.objects.filter(user_id = user_id)
    serializer = OffersSerializer(offers, many = True)
    return Response(serializer.data)

@api_view(['POST'])
@firebase_auth_required
def create_request(request):
    create_request = RequestsSerializer(data = request.data)
    if create_request.is_valid():
        create_request.save()
        return Response(create_request.data, status = status.HTTP_201_CREATED)
    return Response(create_request.errors, status = status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@firebase_auth_required
def view_public_requests(request, provider_id):
    requests = Requests.objects.filter(provider_id=None)
    serializer = RequestsSerializer(requests, many = True)
    return Response(serializer.data)

@api_view(['GET'])
@firebase_auth_required
def view_request_from_neighbours(request, comm_id):
    requests = Requests.objects.filter(provider_id=provider_id)
    serializer = RequestsSerializer(requests, many = True)
    return Response(serializer.data)

@api_view(['POST'])
@firebase_auth_required
def send_join_request(request):
    new_join_request = JoinRequestSerializer(data = request.data)
    if new_join_request.is_valid():
        new_join_request.save()
        return Response(new_join_request.data, status = status.HTTP_201_CREATED)
    return Response(new_join_request.errors, status = status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@firebase_auth_required
def view_join_requests(request, comm_id, user_id):
    join_requests = JoinRequest.objects.filter(comm_id= comm_id).filter(admin_id = user_id)
    serializer = JoinRequestSerializer(join_requests, many = True)
    profile_infos = []
    for data in serializer.data:
        profile_data = Profile.objects.get(uuid=data['member_id'])
        profile_info = {}
        profile_info['id'] = data['id']
        profile_info['accepted'] = data['accepted']
        profile_info['email'] = profile_data.email
        profile_info['name'] = profile_data.name
        profile_info['age'] = profile_data.age
        profile_info['profession'] = profile_data.profession
        profile_infos.append(profile_info)
        
    return Response(profile_infos)
