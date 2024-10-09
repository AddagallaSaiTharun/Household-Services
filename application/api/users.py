from flask_restful import Resource
from flask import request
from application.utils.validation import preprocesjwt
from application.data.database import db
from application.data.models import Users, Professionals
import json
from flask_bcrypt import Bcrypt
from flask import current_app as app
bcrypt = Bcrypt(app)

class UserAPI(Resource):
    def get(self):
        """
        Returns users based on the data in the request. 
        If no data is provided, returns all users.
        """
        user_id, role, _, error = preprocesjwt(request)
        if error:
            return json.dumps({'error': 'Unauthorized access'}), 401

        user_col = ["user_id", 'email', 'first_name', 'last_name', 'age', 'gender', 'role', 'user_image_url', 'password', 'phone', 'address', 'address_link', 'pincode']        

        if role == "user":
            user = Users.query.filter_by(user_id=user_id).first()
            if user:
                return json.dumps({"message": {'user_id': user.user_id, 'email': user.email, 'first_name': user.first_name, 'last_name': user.last_name, 'age': user.age, 'gender': user.gender, 'role': user.role, 'user_image_url': user.user_image_url, 'password': user.password, 'phone': user.phone, 'address': user.address, 'address_link': user.address_link, 'pincode': user.pincode}})
            else:
                return json.dumps({"error": "User not found"}), 404

        elif role == "professional":
            user = Users.query.filter_by(user_id=user_id).join(Professionals, Users.user_id==Professionals.prof_userid).first()
            if user:
                return json.dumps({"message": {"prof_userid": user.usr_professional.prof_userid, "prof_exp": user.usr_professional.prof_exp, "prof_dscp": user.usr_professional.prof_dscp, "prof_srvcid": user.usr_professional.prof_srvcid, "prof_ver": user.usr_professional.prof_ver, "prof_join_date": user.usr_professional.prof_join_date}})
            else:
                return json.dumps({"error": "Professional not found"}), 404

        elif role == "admin":
            query = Users.query
            data = request.args.to_dict()
            if data:
                for column in user_col:
                    if column in data:
                        query = query.filter(getattr(Users, column) == data[column])
            users = query.all()
            return json.dumps({"message": [{'user_id': user.user_id, 'email': user.email, 'first_name': user.first_name, 'last_name': user.last_name, 'age': user.age, 'gender': user.gender, 'role': user.role, 'user_image_url': user.user_image_url, 'password': user.password, 'phone': user.phone, 'address': user.address, 'address_link': user.address_link, 'pincode': user.pincode} for user in users]})
        
        return json.dumps({'error': 'Unauthorized access'}), 401

    def put(self):
        """
        Updates an existing user based on the user's role.
        """
        user_id, role, _, error = preprocesjwt(request)
        if error:
            return json.dumps({'error': 'Unauthorized access'}), 401

        data = request.get_json()

        if role == "user":
            user = Users.query.filter_by(user_id=user_id).first()
            if not user:
                return json.dumps({"error": f"{user_id} not found "}), 400
            user_col = ["email", "first_name", "last_name", "age", "gender", "user_image_url", "password", "phone", "address", "address_link", "pincode"]
            for col in user_col:
                if col in data:
                    setattr(user, col, data[col])
            db.session.commit()
            return json.dumps({'message': 'User updated successfully'}), 200

        elif role == "professional":
            user = Users.query.filter_by(user_id=user_id).join(Professionals, Users.user_id == Professionals.prof_userid).first()
            if not user:
                return json.dumps({"error": f"{user_id} not found "}), 400
            prof_col = ["prof_userid", "prof_exp", "prof_dscp", "prof_srvcid", "prof_ver", "prof_join_date"]
            for col in prof_col:
                if col in data:
                    setattr(user.usr_professional, col, data[col])
            db.session.commit()
            return json.dumps({'message': 'Professional updated successfully'}), 200

        elif role == "admin":
            if data["role"] == "user":
                user = Users.query.filter_by(user_id=data["user_id"]).first()
                if not user:
                    return json.dumps({"error": f"{data['user_id']} not found "}), 400
                for col in user_col:
                    if col in data:
                        setattr(user, col, data[col])
                db.session.commit()
                return json.dumps({'message': 'User updated successfully'}), 200
            if data["role"] == "professional":
                user = Users.query.filter_by(user_id=user_id).join(Professionals, Users.user_id == Professionals.prof_userid).first()
                if not user:
                    return json.dumps({"error": f"{user_id} not found "}), 400
                prof_col = ["prof_userid", "prof_exp", "prof_dscp", "prof_srvcid", "prof_ver", "prof_join_date"]
                for col in prof_col:
                    if col in data:
                        setattr(user.usr_professional, col, data[col])
                return json.dumps({'message': 'Professional updated successfully'}), 200
        
        return json.dumps({'error': 'Unauthorized access'}), 401

    # def delete(self):
    #     """
    #     Deletes a service.
    #     """
    #     user_id, role, _, error = preprocesjwt(request)
    #     if error:
    #         return  json.dumps({'error': 'Unauthorized access'}), 401
    #     if role=="user":
    #         user = Users.query.filter(Users.user_id == user_id).first()
    #         if not user:
    #             return  json.dumps({"error": f"{user_id} not found "}),400
    #         user.role = "blocked"
    #         db.session.commit()
    #         return  json.dumps({'message': 'User blocked successfully'}), 200
    #     if role=="professional":
    #         user = Users.query.filter(Users.user_id == user_id).usr_professional.first()
    #         if not user:
    #             return  json.dumps({"error": f"{user_id} not found "}),400
    #         user.role = "user"
    #         db.session.commit()
    #         return  json.dumps({'message': 'Professional blocked successfully'}), 200
    #     if role=="admin":
    #         data = request.get_json()
    #         if "role" not in data or "user_id" not in data:
    #             return  json.dumps({'error': 'Invalid request'}), 400
    #         user = Users.query.filter(Users.user_id == data["user_id"]).first()
    #         if data['role'] == "professional":
    #             user.role = "user"
    #         elif data["role"] == "user":
    #             user.role = "blocked"
    #         db.session.commit()
    #     return  json.dumps({'error': 'Unauthorized access'}), 401

    def post(self):
        """
        Creates a new user.
        """
        user_id, role, _, error = preprocesjwt(request)
        if error:
            return json.dumps({'error': 'Unauthorized access'}), 401

        data = request.get_json()

        if data['role'] == "user":
            required_fields = ["email", "first_name", "password", "phone", "address", "pincode"]
            if not all(field in data for field in required_fields):
                missing_fields = [field for field in required_fields if field not in data]
                return json.dumps({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
            if Users.query.filter_by(email=data["email"]).first():
                return json.dumps({"error": "User with this email already exists"}), 400
            hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
            user = Users(
                email=data['email'],
                first_name=data['first_name'],
                last_name=data.get('last_name'),
                age=data.get('age'),
                gender=data.get('gender'),
                role = data['role'],
                user_image_url=data.get('user_image_url'),
                password=hashed_password,
                phone=data['phone'],
                address=data['address'],
                address_link=data.get('address_link'),
                pincode=data['pincode']
            )
            db.session.add(user)
            db.session.commit()
            return json.dumps({"message": "success", "email": user.email}), 201

        elif role == "user":
            required_fields = ["prof_exp", "prof_dscp", "prof_srvcid", "prof_join_date"]
            if not all(field in data for field in required_fields):
                missing_fields = [field for field in required_fields if field not in data]
                return json.dumps({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
            
            prof = Professionals(
                prof_userid=user_id,
                prof_exp=data['prof_exp'],
                prof_dscp=data['prof_dscp'],
                prof_srvcid=data['prof_srvcid'],
                prof_join_date=data['prof_join_date']
            )
            db.session.add(prof)
            db.session.commit()
            return json.dumps({"message": "Professional created successfully","prof_userid": prof.prof_userid}), 201
        return json.dumps({'error': 'Unauthorized access'}), 401      