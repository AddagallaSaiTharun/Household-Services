from flask_restful import Resource
from application.data.database import db
from application.data.models import Users, Professionals , Services
from flask import request,make_response,jsonify
from application.utils.validation import check_loggedIn_jwt_expiration,csrf_protect,check_role_admin,check_loggedIn_status,check_role_cust
import jwt
from flask import current_app as app
from datetime import datetime





class UserAPI(Resource):
    @check_role_admin
    @check_loggedIn_status
    @csrf_protect
    @check_loggedIn_jwt_expiration
    def get(self):
        """
        Returns users based(user_id) on the data in the request. 
        If no data(user_id) is provided, returns all users.(By admin only)
        """
        query = Users.query
        data = request.args.to_dict() or None
        users = []
        response = None
        if data:
            users = query.filter(Users.user_id == data["user_id"]).all()
        else:
            users = query.all()
        if users:
            details = []
            for user in users:
                details.append({'cust_userid': user.user_id,
                                'cust_username': user.user_name,
                                'cust_fullname': user.first_name + user.last_name,
                                'cust_age': user.age, 
                                'cust_gender': user.gender, 
                                'cust_phone': user.phone, 
                                'cust_role': user.role,
                                })

            response = make_response(jsonify({
                "message": "Customers details fetched successfully.",
                "data":details,
                "flag" :1,
                "status": "success",
            }),200)
        else:
            response = make_response(jsonify({
                "message": "No customers found",
                "data":details,
                "flag" :1,
                "status": "success",
            }),200)
        response.headers['Content-Type'] = 'application/json'
        return response

 
class ServicesListAPI(Resource):
    @check_role_cust
    @check_loggedIn_status
    @csrf_protect
    @check_loggedIn_jwt_expiration
    def get(self):
        servicesList = dict()
        services = Services.query.all()
        for service in services:
            professionals = service.professional_opted
            details = []
            for professional in professionals:
                sum_rating = 0
                count = 0
                for srvc_req in professional.srvc_reqs:
                    if srvc_req.cust_rating != None:
                        sum_rating += srvc_req.cust_rating
                        count += 1
                details.append({"service_image" : service.service_image,
                                "service_base_price" : service.service_base_price,
                                "prof_userid" : professional.prof_userid,
                                "prof_name" : professional.usr.first_name + professional.usr.last_name,
                                "prof_gender" : professional.usr.gender,
                                "prof_age" : professional.age,
                                "prof_exp" : professional.prof_exp,
                                "prof_join_date" : professional.prof_join_date,
                                "service_reqs_completed" : len(professional.srvc_reqs),
                                "avg_rating" : sum_rating/count if count != 0 else 0,
                                })
            servicesList[service.sercice_name] = details
        response = make_response(jsonify({"message" : "All services by professional fetched successfully.",
                                         "data" : servicesList,
                                         "flag" : 1,
                                         "status" : "success"}),200)
        response.headers['Content-Type'] = 'application/json'
        return response

