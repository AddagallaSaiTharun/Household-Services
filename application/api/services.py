from flask_restful import Resource
from flask import request,make_response,jsonify
from application.data.database import db
from application.data.models import Services
from application.utils.validation import gen_uuid,check_role_admin,check_loggedIn_status,check_loggedIn_jwt_expiration,csrf_protect,decodeutf8,base64encode
from PIL import Image
from io import BytesIO
import base64


class ServiceAPI(Resource):
    """
    API resource for managing services by Admin Only.
    """
    @check_role_admin
    @check_loggedIn_status
    @csrf_protect
    @check_loggedIn_jwt_expiration
    def get(self):
        # /api/services
        """
        Returns services based on the data in the request.
        If no data is provided, returns all services.
        """
        query = Services.query
        
        filter_args = {
            column: request.args.get(column)
            for column in ["service_id", "service_name", "time_req", "service_base_price", "service_image", "service_dscp"]
            if request.args.get(column) is not None
        }

        if filter_args:
            query = query.filter_by(**filter_args)

        services = query.all()
        result = []
        for service in services:
            # Create response content
            result.append({
                'service_id': service.service_id,
                'service_name': service.service_name,
                'time_req': service.time_req,
                'service_base_price': service.service_base_price,
                'service_image': "data:image/png;base64,"+decodeutf8(service.service_image),
                'service_dscp': service.service_dscp
            })
        response = make_response(jsonify({"content": result,"status":"success","flag":1}),200)
        response.headers['Content-Type'] = 'application/json'
        return response
        # return json.dumps({"content": result})
    

    @check_role_admin
    @check_loggedIn_status
    @csrf_protect
    @check_loggedIn_jwt_expiration
    def put(self):
        """
        Updates an existing service.
        """
        query = Services.query
        data = request.form
        response = None
        service = query.filter(Services.service_name == data["service_name"]).first()
        if not service:
            response = make_response(jsonify({"message":f"'{data['service_name']}' service not found.","flag" : 0,"status":"failure"}),404)
            response.headers['Content-Type'] = 'application/json'
            return response

        for column in ["service_name", "time_req", "service_base_price", "service_image", "service_dscp"]:
            if column in data:
                if column=="service_image":
                    service_image_io = base64encode(data[column])
                    setattr(service, column, service_image_io)
                else:    
                    setattr(service, column, data[column])
        try:
            db.session.commit()
            response = make_response(jsonify({"message":"Service updated successfully","flag":1,"status":"success"}),200)
        except Exception as e:
            print("Rolling back. Issue with database Insertion",e)
            db.session.rollback()
            response = make_response(jsonify({"message":"Service Updation failed. Database error. Please try again.",'flag':0,"status":"failure"}),503)
        response.headers['Content-Type'] = 'application/json'
        return response



    @check_role_admin
    @check_loggedIn_status
    @csrf_protect
    @check_loggedIn_jwt_expiration
    def delete(self):
        """
        Deletes a service.
        """
        service_name = request.agrs.get("service_name")
        response = None
        if not service_name:
            response = make_response(jsonify({"message":"Service name is missing!!","flag":0,"status":"failure"}),400)
            response.headers['Content-Type'] = 'application/json'
            return response

        service = Services.query.filter_by(service_name=service_name).first()
        if not service:
            response = make_response(jsonify({"message":f"Service with name '{service_name}' is not found!!","flag":0,"status":"failure"}),404)
            response.headers['Content-Type'] = 'application/json'
            return response
        try:
            db.session.delete(service)
            db.session.commit()
            response = make_response(jsonify({'message': f"Service with name '{service_name}' deleted successfully.",'flag':1,"status":"success"}),200)
        except Exception as e:
            print("Rolling back. Issue with database Insertion",e)
            db.session.rollback()
            response = make_response(jsonify({"message":"Service deletion failed. Database error. Please try again.",'flag':0,"status":"failure"}),503)
        response.headers['Content-Type'] = 'application/json'
        return response




    @check_role_admin
    @check_loggedIn_status
    @csrf_protect
    @check_loggedIn_jwt_expiration
    def post(self):
        """
        Creates a new service.
        """

        query = Services.query
        data = request.form
        response = None
        required_fields = ["service_name", "time_req", "service_base_price", "service_dscp"]
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return make_response(jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400)
        if not 'service_image' in request.files:
            return make_response(jsonify({"message": "Missing required field: service_image","status":"failure"}), 400)
        check_serviceName=query.filter(Services.service_name.lower()==data['service_name'].lower()).first()
        service_image=request.files['service_image']
        if check_serviceName is None:
            service_image_io = base64encode(service_image)
            service = Services(
                service_id=gen_uuid(),
                service_name=data['service_name'],
                time_req=data['time_req'],
                service_image=service_image_io,
                service_base_price=data['service_base_price'],
                service_dscp=data['service_dscp']
            )
            try:
                db.session.add(service)
                db.session.commit()
                response  = make_response(jsonify({"message":"Service registration successful.",'flag':1,"status":"success"}),201)
            except Exception as e:
                print("Rolling back. Issue with database Insertion",e)
                db.session.rollback()
                response = make_response(jsonify({"message":"Service registration failed. Database error. Please try again.",'flag':0,"status":"failure"}),503)
        else:
            response  = make_response(jsonify({"message":"Service registration failed. Service with same name alredy exists.",'flag':0,"status":"failure"}),503)
        response.headers['Content-Type'] = 'application/json'
        return response