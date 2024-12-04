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
from application.jobs.sse import send_notification
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
        if not user:
            return json.dumps({'error': 'No user Found'}), 401
        if not bcrypt.check_password_hash(user.password, password):
            return json.dumps({'error': 'Invalid password'}), 401
        token = jwt.encode({
            'user_id': user.user_id,
            'email': user.email,
            'role': user.role,
            'name': user.first_name,
            'address': user.address,
            'address_link': user.address_link,
            'exp': datetime.utcnow() + timedelta(minutes=120)
        }, app.config['SECRET_KEY'], 
        )
        if user.role == "professional":
            admins = Users.query.filter_by(role = "admin").all()
            emails = [a.email for a in admins]
            ver = Professionals.query.filter_by(prof_userid=user.user_id).first().prof_ver
            if ver == 0:
                for email in emails:
                    data = {"msg" : "professionals are wiating for your approval!!", "email" : email}
                    # send_notification(data)
        return json.dumps({
            'token': token, 
            'message': 'Login successful',
            'name': user.first_name,
            'email' : user.email,
            'role':user.role
        }), 200