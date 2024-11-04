from flask_restful import Resource
from flask import request
from application.utils.validation import preprocesjwt
from application.data.database import db
from application.data.models import Users, Professionals
import json
from flask_bcrypt import Bcrypt
from flask import current_app as app
import jwt
from application.utils.validation import server_side_event
from application.jobs import tasks


bcrypt = Bcrypt(app)

class UserLogin(Resource):
    def get(self):
        email = "varun.merugu1212@gmail.com"
        subject = "Registration"
        body = f"""
            <p><b>Welcome to Household Services.</b></p>
            <p>Login into the website with the registered username and password</p>
            <p>Looking forward to serve you :)</p>
            <p><b>Thank you for registering!</b></p>
        """
        # Call the Celery task
        job = tasks.send_registration_email.delay(email, subject, body)
        return "hell0"
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
            }, app.config['SECRET_KEY'], 
            )

            return json.dumps({
                'token': token, 
                'message': 'Login successful',
                'name': user.first_name,
                'role':user.role
            }), 200
        else:
            return json.dumps({'message': 'Invalid credentials'}), 401



