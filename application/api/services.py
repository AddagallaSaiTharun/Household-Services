from flask_restful import Resource
import json 
from flask import request
from application.utils.validation import preprocesjwt
from application.data.database import db
from application.data.models import Services
from PIL import Image
from io import BytesIO
import base64


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
            for column in ["service_id", "service_name", "time_req", "service_base_price", "service_image", "service_dscp", "category"]
            if request.args.get(column) is not None
        }

        if filter_args:
            query = query.filter(*(getattr(Services, key) == value for key, value in filter_args.items()))


        services = query.all()
        result = []
        for service in services:
            # Decode the base64 image
            decoded_image = base64.b64decode(service.service_image) if service.service_image else None


            # Create response content
            result.append({
                'service_id': service.service_id,
                'service_name': service.service_name,
                'time_req': service.time_req,
                'service_base_price': service.service_base_price,
                'service_image': base64.b64encode(decoded_image).decode('utf-8') if service.service_image else None,
                'service_dscp': service.service_dscp,
                "category":service.category
            })
        
        return json.dumps({"content": result})
    
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

        file = request.files['service_image']
        data = request.form
        required_fields = ["service_name", "time_req", "service_base_price", "service_dscp"]

        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return json.dumps({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        image_data = None

        if 'service_image' in request.files:
            img = Image.open(file)

            compressed = BytesIO()

            img.save(compressed, format = img.format, optimize = True, quality = 10)

            compressed_data = compressed.getvalue()

            image_data = base64.b64encode(compressed_data)
  
        service = Services(
            service_name=data['service_name'],
            time_req=data['time_req'],
            service_base_price=data['service_base_price'],
            service_image=image_data,
            service_dscp=data['service_dscp']
        )

        db.session.add(service)
        db.session.commit()

        return json.dumps({"message": "Service created successfully", "service_name": service.service_name}), 201