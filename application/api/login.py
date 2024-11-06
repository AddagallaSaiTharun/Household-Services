from flask_restful import Resource
from flask import request
from application.utils.validation import preprocesjwt
from application.data.database import db
from application.data.models import Users, Professionals
import json
from flask_bcrypt import Bcrypt
from flask import current_app as app
import jwt
from application.jobs import tasks
from application.jobs.sse import server_side_event
from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
bcrypt = Bcrypt(app)

class UserLogin(Resource):
    def post(self):
        """
        Logs in user with credentials from request body (JSON)
        """
        data = request.get_json()
        if not data:
            return json.dumps({'error': 'Missing request body'}), 400
        password = data.get('password')
        user = Users.query.filter_by(email=data.get('email')).first()
        if user and bcrypt.check_password_hash(user.password, password):
            token = jwt.encode({
                'user_id': user.user_id,
                'email': user.email,
                'role': user.role,
                'name': user.first_name,
                'address': user.address,
                'address_link': user.address_link,
                'exp': datetime.utcnow() + timedelta(minutes=30)
            }, app.config['SECRET_KEY'], 
            )
            if user.role == "professional":
                ver = Professionals.query.filter_by(prof_userid=user.user_id).first().prof_ver
                if ver == 0:
                    server_side_event({"request" : True})
            return json.dumps({
                'token': token, 
                'message': 'Login successful',
                'name': user.first_name,
                'role':user.role
            }), 200
        else:
            return json.dumps({'message': 'Invalid credentials'}), 401



