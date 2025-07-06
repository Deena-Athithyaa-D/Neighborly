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
from math import radians, cos, sin, asin, sqrt
from rest_framework.views import APIView
from jose import jwt
import requests
from dotenv import load_dotenv
import os

load_dotenv('.env')
AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
API_IDENTIFIER = 'https://neighborly.api'
ALGORITHMS = ["RS256"]


class Auth0LoginView(APIView):
    def post(self, request):
        id_token = request.data.get('id_token')

        if not id_token:
            return Response({'success': False, 'error': 'Missing ID token'}, status=400)

        jwks_url = f'https://{AUTH0_DOMAIN}/.well-known/jwks.json'
        jwks = requests.get(jwks_url).json()

        try:
            unverified_header = jwt.get_unverified_header(id_token)
        except Exception:
            return Response({'success': False, 'error': 'Invalid token header'}, status=400)

        rsa_key = {}
        for key in jwks['keys']:
            if key['kid'] == unverified_header['kid']:
                rsa_key = {
                    'kty': key['kty'],
                    'kid': key['kid'],
                    'use': key['use'],
                    'n': key['n'],
                    'e': key['e']
                }
                break

        if not rsa_key:
            return Response({'success': False, 'error': 'RSA key not found'}, status=400)

        try:
            payload = jwt.decode(
            id_token,
            rsa_key,
            algorithms=ALGORITHMS,
            issuer=f"https://{AUTH0_DOMAIN}/",
            options={
                "verify_aud": False,
                "verify_at_hash": False,  
            }
        )

            email = payload.get("email")
            if not email:
                return Response({'success': False, 'error': 'Email not found in token'}, status=400)

            user, _ = User.objects.get_or_create(email=email)
            return Response({
                'success': True,
                'email': user.email,
                'uuid': str(user.id)
            })

        except jwt.ExpiredSignatureError:
            return Response({'success': False, 'error': 'Token expired'}, status=401)
        except jwt.JWTClaimsError as e:
            return Response({'success': False, 'error': f'Invalid claims: {str(e)}'}, status=401)
        except Exception as e:
            return Response({'success': False, 'error': f'Invalid token: {str(e)}'}, status=401)
        

@api_view(['GET','HEAD'])
def home(request):
    return HttpResponse("Hello World")

@api_view(['POST'])
def create_profile(request):
    new_profile = ProfileSerializer(data = request.data)
    if new_profile.is_valid():
        new_profile.save()
        return Response(new_profile.data, status = status.HTTP_201_CREATED)
    return Response(new_profile.errors, status = status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_profile(request, user_id):
    try:
        profile = Profile.objects.get(uuid = user_id)
        serializer = ProfileSerializer(profile)
    except:
        return Response({
                "status":300
            })
    return Response(serializer.data)

@api_view(['POST'])
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
def get_user_communities(request, user_id):
    communities = Join.objects.filter(user_id = user_id)
    serializer = JoinSerializer(communities, many = True)
    community_datas = []
    for data in serializer.data:
        community_details = Community.objects.get(id = data['comm_id'])
        community_data = {}
        community_data['id'] = data['id']
        community_data['name'] = community_details.comm_name
        community_data['location'] = community_details.location
        community_data['is_admin'] = data["is_admin"]
        community_datas.append(community_data)
    return Response(community_datas)

@api_view(['POST'])
def create_join(request):
    new_join = JoinSerializer(data = request.data)
    if new_join.is_valid():
        new_join.save()
        return Response(new_join.data, status = status.HTTP_201_CREATED)
    return Response(new_join.errors, status = status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def create_post(request):
    new_post = PostsSerializer(data = request.data)
    if new_post.is_valid():
        new_post.save()
        return Response(new_post.data, status = status.HTTP_201_CREATED)
    return Response(new_post.errors, status = status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_posts(request, comm_id):
    posts = Posts.objects.filter(comm_id= comm_id)
    serializer = PostsSerializer(posts, many = True)
    return Response(serializer.data)

@api_view(['POST'])
def create_offer(request):
    new_offer = OffersSerializer(data = request.data)
    if new_offer.is_valid():
        new_offer.save()
        return Response(new_offer.data, status = status.HTTP_201_CREATED)
    return Response(new_offer.errors, status = status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
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
        offer_data['status'] = data['status']
        offer_datas.append(offer_data)
        
    return Response(offer_datas)

@api_view(['GET'])
def get_offers_for_user(request, user_id, comm_id):
    offers = Offers.objects.filter(user_id = user_id).filter(comm_id = comm_id)
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
        offer_data['status'] = data['status']
        offer_datas.append(offer_data)
        
    return Response(offer_datas)

@api_view(['POST'])
def create_request(request):
    create_request = RequestsSerializer(data = request.data)
    if create_request.is_valid():
        create_request.save()
        return Response(create_request.data, status = status.HTTP_201_CREATED)
    return Response(create_request.errors, status = status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def view_public_requests(request, comm_id):
    requests = Requests.objects.filter(comm_id=comm_id).filter(offer_id = None)
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
        request_data['status'] = data['status']
        request_datas.append(request_data)
    return Response(request_datas)


@api_view(['GET'])
def view_user_requests(request, comm_id, user_id):
    requests = Requests.objects.filter(comm_id = comm_id).filter(user_id=user_id)
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
        request_data['status'] = data['status']
        request_datas.append(request_data)
    return Response(request_datas)

@api_view(['GET'])
def view_request_from_neighbours(request, offer_id):
    requests = Requests.objects.filter(offer_id = offer_id)
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
        request_data['status'] = data['status']
        request_datas.append(request_data)
    return Response(request_datas)

@api_view(['POST'])
def send_join_request(request):
    new_join_request = JoinRequestSerializer(data = request.data)
    if new_join_request.is_valid():
        new_join_request.save()
        return Response(new_join_request.data, status = status.HTTP_201_CREATED)
    return Response(new_join_request.errors, status = status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
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


@api_view(['PUT'])
def update_offer_status(request, offer_id, status):
    try:
        offer = Offers.objects.get(id=int(offer_id))
        offer.status = status
        offer.save()
        return Response({'message': 'Status updated'}, status=200)
    except Offers.DoesNotExist:
        return Response({'error': 'Offer not found'}, status=404)
    

@api_view(['PUT'])
def update_request_status(request, request_id, status, offer_id):
    try:
        request = Requests.objects.get(id=request_id)
        offer = Offers.objects.get(pk=offer_id)
        request.status = status
        request.offer = offer
        request.save()
        return Response({'message': 'Status updated'}, status=200)
    except Offers.DoesNotExist:
        return Response({'error': 'Request not found'}, status=404)
    

def haversine(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1 
    dlon = lon2 - lon1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371 
    return c * r


@api_view(['GET'])
def get_communities(request, latitude, longtitude):
    try:
        user_lat = float(latitude)
        user_lon = float(longtitude)
    except ValueError:
        return Response({"error": "Invalid latitude/longitude"}, status=400)

    nearby = []
    for community in Community.objects.all():
        try:
            comm_lat = float(community.latitude)
            comm_lon = float(community.longtitude)
            distance = haversine(user_lat, user_lon, comm_lat, comm_lon)
            if distance <= 1.0: 
                nearby.append(community)
        except ValueError:
            continue

    serializer = CommunitySerializer(nearby, many=True)
    return Response(serializer.data)