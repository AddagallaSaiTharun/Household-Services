import jwt
import json
from flask import current_app as app

def preprocesjwt(request):
    token = request.args.get('token')
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload.get('user_id'), payload.get('role'), payload.get('email'), False
    except :
        return None,None,None,True
