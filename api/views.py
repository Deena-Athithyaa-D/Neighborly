from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET','HEAD'])
def home(request):
    return HttpResponse("Hello World")

@api_view(['GET','HEAD'])
def test(request):
    return HttpResponse("Testing.....")
