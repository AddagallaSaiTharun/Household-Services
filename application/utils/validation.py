import jwt
from flask import current_app as app

def preprocesjwt(request):
    auth_header = request.headers.get('Authorization')
    if auth_header.startswith('Bearer '):
        token = auth_header.split(' ')[1] 
        try:
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            return payload.get('user_id'), payload.get('role'), payload.get('email'), False
        except :
            return None,None,None,True
    return None,None,None,True
    
