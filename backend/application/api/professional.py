from flask_restful import Resource
from flask import current_app as app
from flask import request,make_response,jsonify
from application.utils.validation import check_loggedIn_jwt_expiration,csrf_protect,check_role_admin,check_loggedIn_status,check_role_cust
from application.data.database import db
from application.data.models import  Professionals, Users, Services
from application.controller.sse import server_side_event
from application.jobs import tasks
import jwt
from datetime import datetime

class ProfessionalAPI(Resource):
    @check_role_admin
    @check_loggedIn_status
    @csrf_protect
    @check_loggedIn_jwt_expiration
    def get(self):
        """
        Returns professionals based on the data(prof_userid) in the request. 
        If no data(prof_userid) is provided, returns all professionals.(By admin)
        """
        query = Professionals.query
        data = request.args.to_dict() or None
        professionals = []
        response = None
        if data:
            professionals = query.filter(Professionals.prof_userid == data["prof_userid"]).all()
        else:
            professionals = query.all()
        if professionals:
            details = []
            for professional in professionals:
                details.append({'prof_userid': professional.prof_userid,
                                'prof_username': professional.usr_professional.user_name,
                                'prof_name': professional.usr_professional.first_name + professional.usr_professional.last_name,
                                'prof_exp': professional.prof_exp, 
                                'prof_dscp': professional.prof_dscp, 
                                'prof_srvcid': professional.prof_srvcid, 
                                'prof_service_name': professional.prof_service.service_name,
                                'prof_ver': professional.prof_ver, 
                                'prof_join_date': professional.prof_join_date})

            response = make_response(jsonify({
                "message": "Professionals details fetched successfully.",
                "data":details,
                "flag" :1,
                "status": "success",
            }),200)
        else:
            response = make_response(jsonify({
                "message": "No professionals found",
                "data":details,
                "flag" :1,
                "status": "success",
            }),200)
        response.headers['Content-Type'] = 'application/json'
        return response



    @check_role_admin
    @check_loggedIn_status
    @csrf_protect
    @check_loggedIn_jwt_expiration
    def put(self):
        """
        Updates an existing professional.(by admin upon approval)
        """
        data = request.get_json()
        response = None
        if "prof_id" in data and "approval_status":
            professional = Professionals.query.filter_by(prof_userid=data["prof_id"]).first()
            user = Users.query.filter_by(user_id = data["prof_id"])
            if professional:
                    try:
                        if data["approval_status"] == "accepted":
                            professional.prof_ver = 1
                            professional.prof_join_date = datetime.now().date()
                            user.role = 'prof'
                            db.session.commit()
                            email = professional.usr_professional.user_name
                            subject = "Request Approval."
                            body = f"""
                                <p><b>Household Services.</b></p>
                                <p>Welcome Back.</p>
                                <p>Your Request to register as Professional is accepted.<p/>
                                <p><b>Have a great day.</b></p>
                            """
                            job = tasks.send_registration_email.delay(email, subject, body)
                            response = make_response(jsonify({"message" : "User verified successfully and converted to professional.",
                                                            "flag": 1,
                                                            "status": "failure"}),200)
                        else:
                            email = professional.usr_professional.user_name
                            db.session.delete(professional)
                            db.session.commit()
                            subject = "Request Approval."
                            body = f"""
                                <p><b>Household Services.</b></p>
                                <p>Welcome Back.</p>
                                <p>Please note that your Request to register as Professional is rejected.<p/>
                            """
                            job = tasks.send_registration_email.delay(email, subject, body)
                            response = make_response(jsonify({"message" : "Professional is deleted successfully as the approval was rejected by admin.",
                                                            "flag": 1,
                                                            "status": "failure"}),200)
                    except Exception as e:
                        db.session.rollback()
                        response = make_response(jsonify({"message" : "Database error. Professional could not be updated. Try again.",
                                                          "flag" : 0,
                                                          "status" : "failure"}),503)
        response.headers['Content-Type'] = 'application/json'
        return response

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

    @check_role_cust
    @check_loggedIn_status
    @csrf_protect
    @check_loggedIn_jwt_expiration
    def post(self):
        """
        Creates a new professional.(By a user(customer))
        """
        
        data = request.form
        required_fields = ["prof_exp", "prof_dscp", "prof_service_name"]
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            response = make_response(jsonify({"message": f"Missing required fields: {', '.join(missing_fields)}",
                                          "flag": "0",
                                          "status": "failure" ,
                                          }), 400)
            response.headers['Content-Type'] = 'application/json'
            return response
        decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
        user = Users.query.filter_by(user_name=decoded_token['username']).first()
        id = user.user_id
        service = Services.query.filter_by(service_name=data["prof_service_name"]).first()
        srvc_id = service.service_id
        try:
            prof = Professionals(
                    prof_userid=id,
                    prof_exp=data['prof_exp'],
                    prof_dscp=data['prof_dscp'],
                    prof_srvcid=srvc_id
            )
            db.session.add(prof)
            db.session.commit()
            server_side_event(msg = f"Professional Approval Request : {user.first_name} {user.last_name}",link = "http://localhost:5000/api/pending_prof_approvals",type="admin")
            response =  make_response(jsonify({"message": "Professional created successfully",
                                               "flag":1,
                                               "status": "success",
                                          "prof_userid": prof.prof_userid
                                }), 200)
        except Exception as e:
            db.session.rollback()
            response = make_response(jsonify({"message" : "Database Error. Professional could not be created.Try again after some time",
                                              "flag" : 0,
                                              "status" : "failure"}),503)
        response.headers['Content-Type'] = 'application/json'
        return response
