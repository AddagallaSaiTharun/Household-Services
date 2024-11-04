import jwt
from flask import current_app as app
from flask_sse import sse
import datetime


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
    
def get_data():
    data = list()
    data.append({'name': "tharun"})
    return data

def server_side_event():
    with app.app_context():
        sse.publish(get_data(), type='customer')
        print("New Customer Time: ",datetime.datetime.now())