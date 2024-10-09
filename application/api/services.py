from flask_restful import Resource
import json 
from flask import request
from application.utils.validation import preprocesjwt
from application.data.database import db
from application.data.models import Services

class ServiceAPI(Resource):
    """
    API resource for managing services.
    """
    def get(self):
        """
        Returns services based on the data in the request.
        If no data is provided, returns all services.
        """
        query = Services.query
        
        filter_args = {
            column: request.args.get(column)
            for column in ["service_name", "time_req", "service_base_price", "service_image", "service_dscp"]
            if request.args.get(column) is not None
        }

        if filter_args:
            query = query.filter_by(**filter_args)

        services = query.all()

        return json.dumps({
            "message": [
                {
                    'service_id': service.service_id,
                    'service_name': service.service_name,
                    'time_req': service.time_req,
                    'service_base_price': service.service_base_price,
                    'service_image': service.service_image,
                    'service_dscp': service.service_dscp
                } for service in services
            ]
        })
    
    def put(self):
        """
        Updates an existing service.
        """
        _, role, _, error = preprocesjwt(request)
        if error or role != "admin":
            return json.dumps({'error': 'Unauthorized access'}), 401

        data = request.get_json()
        service = Services.query.filter(Services.service_name == data["service_name"]).first()

        if not service:
            return json.dumps({"error": f"{data['service_name']} not found "}), 400

        for column in ["service_name", "time_req", "service_base_price", "service_image", "service_dscp"]:
            if column in data:
                setattr(service, column, data[column])

        db.session.commit()
        return json.dumps({'message': 'Service updated successfully'}), 200

    def delete(self):
        """
        Deletes a service.
        """
        _, role, _, error = preprocesjwt(request)
        if error or role != "admin":
            return json.dumps({'error': 'Unauthorized access'}), 401

        data = request.get_json()
        service_name = data.get("service_name")
        if not service_name:
            return json.dumps({"error": "service_name is required"}), 400

        service = Services.query.filter_by(service_name=service_name).first()
        if not service:
            return json.dumps({"error": f"Service '{service_name}' not found"}), 404

        db.session.delete(service)
        db.session.commit()

        return json.dumps({'message': f"Service '{service_name}' deleted successfully"}), 200

    def post(self):
        """
        Creates a new service.
        """
        _, role, _, error = preprocesjwt(request)
        if error or role != "admin":
            return json.dumps({'error': 'Unauthorized access'}), 401

        data = request.get_json()
        required_fields = ["service_name", "time_req", "service_base_price", "service_dscp"]

        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return json.dumps({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        service = Services(
            service_name=data['service_name'],
            time_req=data['time_req'],
            service_base_price=data['service_base_price'],
            # service_image=data['service_image'],
            service_dscp=data['service_dscp']
        )

        db.session.add(service)
        db.session.commit()

        return json.dumps({"message": "Service created successfully", "service_name": service.service_name}), 201