import jwt
from flask import current_app, request

def preprocesjwt(request):
    # Get the Authorization header
    auth_header = request.headers.get('Authorization', '')

    # Check if header starts with 'Bearer ' and has two parts
    if auth_header.startswith('Bearer ') and len(auth_header.split(' ')) == 2:
        token = auth_header.split(' ')[1]
        
        try:
            payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            return payload.get('user_id'), payload.get('role'), payload.get('email'), False
        except jwt.ExpiredSignatureError:
            print("Token has expired")
        except jwt.InvalidTokenError:
            print("Invalid token")
        except Exception as e:
            print(f"JWT decode error: {e}")
    else:
        print("Authorization header is missing or malformed")

    # Return defaults if an error occurs
    return None, None, None, True
