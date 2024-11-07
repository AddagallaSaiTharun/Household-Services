from flask_restful import Resource
from flask import request
from application.utils.validation import preprocesjwt
from application.data.database import db
from application.data.models import  Professionals, Users
import json
from application.jobs.sse import server_side_event
from datetime import datetime
import redis
from application.jobs import tasks




class ProfessionalAPI(Resource):
    def get(self):
        """
        Returns professionals based on the data in the request. 
        If no data is provided, returns all professionals.
        """
        user_id, role, _, error = preprocesjwt(request)
        if error:
            return json.dumps({'error': 'Unauthorized access'}), 401
        query = Professionals.query
        data = request.args.to_dict()
        
        if data:
            for column in ["prof_userid", 'prof_exp', 'prof_dscp', 'prof_srvcid', 'prof_ver', 'prof_join_date']:
                if column in data:
                    query = query.filter(getattr(Professionals, column) == data[column])
        
        if role == "admin":
            professionals = query.all()
            return json.dumps({"message": [{'username' : professional.usr.first_name,'email' : professional.usr.email,'url' : professional.usr.user_image_url,'prof_userid': professional.prof_userid, 'prof_exp': professional.prof_exp, 'prof_dscp': professional.prof_dscp, 'prof_srvcid': professional.prof_srvcid, 'prof_ver': professional.prof_ver, 'prof_join_date': professional.prof_join_date.isoformat()} for professional in professionals]})
        else:
            if "self" in data:
                query = query.filter_by(prof_userid=user_id)
            professionals = query.filter_by(prof_ver="1").all()
            return json.dumps({"message": [{'username' : professional.usr.first_name,'email' : professional.usr.email,'url' : professional.usr.user_image_url,'prof_userid': professional.prof_userid, 'prof_exp': professional.prof_exp, 'prof_dscp': professional.prof_dscp, 'prof_srvcid': professional.prof_srvcid, 'prof_ver': professional.prof_ver, 'prof_join_date': professional.prof_join_date.isoformat()} for professional in professionals]})

    def put(self):
        """
        Updates an existing professional.
        """
        user_id, role, _, error = preprocesjwt(request)
        if error or role == "user":
            return json.dumps({'error': 'Unauthorized access'}), 401

        data = request.get_json()
        if role == "professional":
            professional = Professionals.query.filter_by(prof_userid=user_id).first()
            if not professional:
                return json.dumps({"error": f"{user_id} not found "}), 400
            for column in ["prof_exp", "prof_dscp", "prof_srvcid", "prof_ver", "prof_join_date"]:
                if column in data:
                    setattr(professional, column, data[column])
            db.session.commit()
            return json.dumps({'message': 'Professional updated successfully'}), 200
        if role == "admin":
            professional = Professionals.query.filter_by(prof_userid=data["prof_userid"]).first()
            if not professional:
                return json.dumps({"error": f"{data['prof_userid']} not found "}), 400
            for column in ["prof_exp", "prof_dscp", "prof_srvcid", "prof_ver", "prof_join_date"]:
                if column in data:
                    setattr(professional, column, data[column])
            db.session.commit()
            return json.dumps({'message': 'Professional updated successfully'}), 200

    # def delete(self):
    #     """
    #     Deletes a professional.
    #     """
    #     user_id, role, _, error = preprocesjwt(request)
    #     if error or role == "user":
    #         return json.dumps({'error': 'Unauthorized access'}), 401

    #     data = request.get_json()
    #     if role=="professional":
    #         professional = Professionals.query.filter_by(prof_userid=user_id).first()
    #         if not professional:
    #             return json.dumps({"error": f"Professional '{user_id}' not found"}), 404
    #         db.session.delete(professional)
    #         db.session.commit()
    #         return json.dumps({'message': f"Professional '{user_id}' deleted successfully"}), 200
    #     if role=="admin":
    #         professional = Professionals.query.filter_by(prof_userid=data["prof_userid"]).first()
    #         if not professional:
    #             return json.dumps({"error": f"Professional '{data['prof_userid']}' not found"}), 404
    #         db.session.delete(professional)
    #         db.session.commit()
    #         return json.dumps({'message': f"Professional '{data['prof_userid']}' deleted successfully"}), 200   


    def post(self):
        """
        Creates a new professional.
        """
        user_id, role, _, error = preprocesjwt(request)
        if error or role!="user":
            return json.dumps({'error': 'Unauthorized access'}), 401
        data = request.form
        if role == "user":
            required_fields = ["prof_exp", "prof_dscp", "prof_srvcid", "prof_join_date"]
            if not all(field in data for field in required_fields):
                missing_fields = [field for field in required_fields if field not in data]
                return json.dumps({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
            user = Users.query.filter_by(user_id=user_id).first()
            user.role = "professional"
            prof = Professionals(
                prof_userid=user_id,
                prof_exp=data['prof_exp'],
                prof_dscp=data['prof_dscp'],
                prof_srvcid=data['prof_srvcid'],
                prof_join_date=datetime.strptime(data['prof_join_date'], '%Y-%m-%d').date()
            )
            data = dict(data)
            db.session.add(prof)
            db.session.commit()
            
            server_side_event({"msg" : "new request!"}) 
            return json.dumps({"message": "Professional created successfully","prof_userid": prof.prof_userid,}), 201
