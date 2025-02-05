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
def create_community(request, user_id):
    new_community = CommunitySerializer(data=request.data)
    
    if new_community.is_valid():
        community_instance = new_community.save()
        comm_id = community_instance.id 
        body = {
            "comm_id": comm_id,
            "user_id": user_id,
            "referral_code": "0",
            "is_admin": 1
        }
        new_join = JoinSerializer(data=body)
        if new_join.is_valid():
            new_join.save()
            return Response(new_join.data, status=status.HTTP_201_CREATED)
        return Response(new_join.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(new_community.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@firebase_auth_required
def get_user_communities(request, user_id):
    communities = Join.objects.filter(user_id = user_id)
    serializer = JoinSerializer(communities, many = True)
    community_datas = []
    for data in serializer.data:
        community_details = Community.objects.get(id = data['id'])
        community_data = {}
        community_data['id'] = data['id']
        community_data['name'] = community_details.comm_name
        community_data['location'] = community_details.location
        community_data['is_admin'] = data["is_admin"]
        community_datas.append(community_data)
    return Response(community_datas)

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
    offer_datas = []
    for data in serializer.data:
        user_details = Profile.objects.get(uuid=data['user_id'])
        offer_data = {}
        offer_data['id'] = data['id']
        offer_data['user_name'] = user_details.name
        offer_data['offer_type'] = data['offer_type']
        offer_data['title'] = data['title']
        offer_data['description'] = data['description']
        offer_datas.append(offer_data)
        
    return Response(offer_datas)

@api_view(['GET'])
@firebase_auth_required
def get_offers_for_user(request, user_id):
    offers = Offers.objects.filter(user_id = user_id)
    serializer = OffersSerializer(offers, many = True)
    offer_datas = []
    for data in serializer.data:
        user_details = Profile.objects.get(uuid=data['user_id'])
        offer_data = {}
        offer_data['id'] = data['id']
        offer_data['user_name'] = user_details.name
        offer_data['offer_type'] = data['offer_type']
        offer_data['title'] = data['title']
        offer_data['description'] = data['description']
        offer_datas.append(offer_data)
        
    return Response(offer_datas)

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
def view_public_requests(request, comm_id):
    requests = Requests.objects.filter(comm_id = comm_id).filter(provider_id=None)
    serializer = RequestsSerializer(requests, many = True)
    request_datas = []
    for data in serializer.data:
        user_details = Profile.objects.get(uuid=data['user_id'])
        request_data = {}
        request_data['id'] = data['id']
        request_data['user_name'] = user_details.name
        request_data['request_type'] = data['request_type']
        request_data['title'] = data['title']
        request_data['description'] = data['description']
        if data['from_time']:
            request_data['from_time'] = data['from_time']
        if data['to_time']:
            request_data['to_time'] = data['to_time']
        if data['from_date']:
            request_data['from_date'] = data['from_date']
        if data['to_date']:
            request_data['to_date'] = data['to_date']
        request_datas.append(request_data)
    return Response(request_datas)

@api_view(['GET'])
@firebase_auth_required
def view_request_from_neighbours(request, provider_id):
    requests = Requests.objects.filter(provider_id=provider_id)
    serializer = RequestsSerializer(requests, many = True)
    request_datas = []
    for data in serializer.data:
        user_details = Profile.objects.get(uuid=data['user_id'])
        request_data = {}
        request_data['id'] = data['id']
        request_data['user_name'] = user_details.name
        request_data['request_type'] = data['request_type']
        request_data['title'] = data['title']
        request_data['description'] = data['description']
        if data['from_time']:
            request_data['from_time'] = data['from_time']
        if data['to_time']:
            request_data['to_time'] = data['to_time']
        if data['from_date']:
            request_data['from_date'] = data['from_date']
        if data['to_date']:
            request_data['to_date'] = data['to_date']
        request_datas.append(request_data)
    return Response(request_datas)

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
        profile_info['pno'] = profile_data.pno
        profile_infos.append(profile_info)
        
    return Response(profile_infos)
