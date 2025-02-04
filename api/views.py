from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializer import UserSerializer, CommunitySerializer, JoinSerializer, PostsSerializer, OffersSerializer, RequestsSerializer

@api_view(['GET','HEAD'])
def home(request):
    return HttpResponse("Hello World")

@api_view(['GET','HEAD'])
def test(request):
    return HttpResponse("Testing.....")

@api_view(['POST'])
def create_user(request):
    new_user = UserSerializer(data = request.data)
    if new_user.is_valid():
        new_user.save()
        return Response(new_user.data, status = status.HTTP_201_CREATED)
    return Response(new_user.errors, status = status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def create_community(request):
    new_community = CommunitySerializer(data = request.data)
    if new_community.is_valid():
        new_community.save()
        return Response(new_community.data, status = status.HTTP_201_CREATED)
    return Response(new_community.errors, status = status.HTTP_400_BAD_REQUEST)

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

@api_view(['POST'])
def create_offer(request):
    new_offer = OffersSerializer(data = request.data)
    if new_offer.is_valid():
        new_offer.save()
        return Response(new_offer.data, status = status.HTTP_201_CREATED)
    return Response(new_offer.errors, status = status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def create_request(request):
    create_request = RequestsSerializer(data = request.data)
    if create_request.is_valid():
        create_request.save()
        return Response(create_request.data, status = status.HTTP_201_CREATED)
    return Response(create_request.errors, status = status.HTTP_400_BAD_REQUEST)

