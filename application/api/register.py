from flask_restful import Resource
from flask import request
from application.data.database import db
from application.data.models import Users
import json
from flask_bcrypt import Bcrypt
from flask import current_app as app

bcrypt = Bcrypt(app)

class UserRegister(Resource):
    def post(self):
        """
        Registers a new user with the provided details.
        """  
        data = request.get_json()

        email = data.get('email')
        first_name = data.get('first_name')
        last_name = data.get('last_name', None)
        age = data.get('age', None)
        gender = data.get('gender', None)
        user_image_url = data.get('user_image_url', None)
        password = data.get('password')
        phone = data.get('phone')
        address = data.get('address')
        address_link = data.get('address_link', None)
        pincode = data.get('pincode')

        if Users.query.filter_by(email=email).first():
            return json.dumps({"error": "User with this email already exists"}), 400

        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        new_user = Users(
            email=email,
            first_name=first_name,
            last_name=last_name,
            age=age,
            gender=gender,
            user_image_url=user_image_url,
            password=hashed_password, 
            phone=phone,
            address=address,
            address_link=address_link,
            pincode=pincode
        )

        db.session.add(new_user)
        db.session.commit()

        return json.dumps({"message": "success", "email": new_user.email}), 201
