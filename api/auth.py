from firebase_admin import auth
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import User
from rest_framework.exceptions import AuthenticationFailed

@csrf_exempt
def google_sign_in(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body)
            id_token = body.get('idToken')

            if not id_token:
                return JsonResponse({'error': 'ID token is required.'}, status=400)

            decoded_token = auth.verify_id_token(id_token)
            email = decoded_token.get('email')

            if not email:
                return JsonResponse({'error': 'Email not found in token.'}, status=400)

            user, created = User.objects.get_or_create(email=email)

            return JsonResponse({
                'message': 'Sign-in successful',
                'email': user.email,
                'uuid': str(user.uuid),
                'is_new_user': created
            })

        except auth.InvalidIdTokenError:
            return JsonResponse({'error': 'Invalid ID token.'}, status=400)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method.'}, status=405)


def verify_firebase_token(request):
    auth_header = request.META.get("HTTP_AUTHORIZATION")
    if not auth_header:
        raise AuthenticationFailed("Authorization header is missing.")
    try:
        token = auth_header.split(" ")[1]
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise AuthenticationFailed(f"Invalid Firebase token: {str(e)}")