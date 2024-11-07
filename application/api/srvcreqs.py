import json
from datetime import datetime
from flask_restful import Resource
from flask import request
from application.utils.validation import preprocesjwt
from application.data.database import db
from application.data.models import ServiceRequests
from application.jobs.sse import prof_req
from application.jobs.sse import req_accept, prof_req





class ServiceRequestAPI(Resource):
    """
    API resource for managing service requests.
    """
    def get(self):
        """
        Retrieves service requests based on user role and provided filters.

        Returns:
            A JSON response containing a list of service requests or an error message.
        """
        user_id, role, _, error = preprocesjwt(request)
        if error:
            return json.dumps({'error': 'Unauthorized access'}), 401

        data = request.args.to_dict()
        query = ServiceRequests.query

        if role == "user":
            query = query.filter(ServiceRequests.customer_id == user_id)
        elif role == "professional":
            query = query.filter(ServiceRequests.prof_id == user_id, ServiceRequests.srvc_status!="rejected")
        for column in [
            "srvcreq_id", "srvc_id", "customer_id", "prof_id", 
            "date_srvcreq", "date_cmpltreq", "srvc_status", 
            "remarks", "cust_rating", "prof_rating", 
            "cust_review", "prof_review"
        ]:
            if column in data:
                query = query.filter(getattr(ServiceRequests, column) == data[column])
                

        srvcreqs = query.order_by(ServiceRequests.date_srvcreq.desc()).all()

        

        response = {
            "message": []
        }

        for srvcreq in srvcreqs:
            srvcreq_data = {
                'srvcreq_id': srvcreq.srvcreq_id, 
                'srvc_id': srvcreq.srvc_id, 
                'customer_id': srvcreq.customer_id, 
                'prof_id': srvcreq.prof_id, 
                'date_srvcreq': srvcreq.date_srvcreq.strftime('%Y-%m-%d'), 
                'date_cmpltreq': srvcreq.date_cmpltreq.strftime('%Y-%m-%d'), 
                'srvc_status': srvcreq.srvc_status, 
                'remarks': srvcreq.remarks, 
                'cust_rating': srvcreq.cust_rating, 
                'prof_rating': srvcreq.prof_rating, 
                'cust_review': srvcreq.cust_review, 
                'prof_review': srvcreq.prof_review
            }

            if role == "professional":
                srvcreq_data.update({
                    "email": srvcreq.usr.email,
                    "first_name": srvcreq.usr.first_name,
                    "last_name": srvcreq.usr.last_name,
                    "phone": srvcreq.usr.phone,
                    "address": srvcreq.usr.address,
                    "address_link": srvcreq.usr.address_link,
                    "pincode": srvcreq.usr.pincode,
                    "user_image_url": srvcreq.usr.user_image_url
                })
            elif role == "user":
                srvcreq_data.update({
                    'prof_exp': srvcreq.prof_service.prof_exp,
                    'prof_dscp': srvcreq.prof_service.prof_dscp,
                    'prof_srvcid': srvcreq.prof_service.prof_srvcid,
                    'prof_ver': srvcreq.prof_service.prof_ver,
                    'prof_join_date': srvcreq.prof_service.prof_join_date,
                })
            elif role == "admin":
                srvcreq_data.update({
                    "email": srvcreq.usr.email,
                    "first_name": srvcreq.usr.first_name,
                    "last_name": srvcreq.usr.last_name,
                    "phone": srvcreq.usr.phone,
                    "address": srvcreq.usr.address,
                    "address_link": srvcreq.usr.address_link,
                    "pincode": srvcreq.usr.pincode,
                    "user_image_url": srvcreq.usr.user_image_url,
                    "prof_exp": srvcreq.prof_service.prof_exp,
                    "prof_dscp": srvcreq.prof_service.prof_dscp,
                    "prof_srvcid": srvcreq.prof_service.prof_srvcid,
                    "prof_ver": srvcreq.prof_service.prof_ver,
                    "prof_join_date": srvcreq.prof_service.prof_join_date.strftime('%Y-%m-%d'),
                })

            response["message"].append(srvcreq_data)

        return json.dumps(response)

    def post(self):
        """
        Creates a new service request.

        Expects JSON data with the following fields:
            - srvc_id: ID of the service being requested.
            - prof_id: ID of the professional chosen for the service.
            - remarks: Any additional remarks from the customer.

        Returns:
            A JSON response with a success message and the created service request ID,
            or an error message if unauthorized or data is missing.
        """
        user_id, role, _, error = preprocesjwt(request)

        if error or role != "user":
            return json.dumps({'error': 'Unauthorized access'}), 401

        data = request.form
        required_fields = ["srvc_id", "prof_id", "remarks"]
        if not all(field in data for field in required_fields):
            missing_fields = [field for field in required_fields if field not in data]
            return json.dumps({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

        srvcreq = ServiceRequests(
            srvc_id=data["srvc_id"],
            customer_id=user_id,
            prof_id=data["prof_id"],
            date_srvcreq=datetime.strptime(data.get("date_srvcreq"), '%Y-%m-%d').date(),
            date_cmpltreq=datetime.strptime(data.get("date_cmpltreq"), '%Y-%m-%d').date(),
            srvc_status="pending",
            remarks=data["remarks"],
            cust_rating=None,
            prof_rating=None,
            cust_review=None,
            prof_review=None
        )
        db.session.add(srvcreq)
        db.session.commit()
        msg = {"msg" : "You have a new request!! Please reload your page🔄️"}
        prof_req(msg)
        return json.dumps({"message": "Service request created successfully", "srvcreq_id": srvcreq.srvcreq_id}), 201

    def put(self):
        """
        Updates an existing service request.

        Expects JSON data with the following fields:
            - srvcreq_id: ID of the service request to update.
            - (Optional) cust_rating: Customer rating for the service.
            - (Optional) cust_review: Customer review for the service.
            - (Optional) prof_rating: Professional rating for the customer.
            - (Optional) prof_review: Professional review for the customer.
            - (Optional) srvc_status: Status of the service request.

        Returns:
            A JSON response with a success message or an error message if unauthorized or data is missing.
        """
        user_id, role, _, error = preprocesjwt(request)
        if error:
            return json.dumps({'error': 'Unauthorized access'}), 401

        data = request.get_json()

        if role == "user":
            srvcreq = ServiceRequests.query.filter_by(srvcreq_id=data["srvcreq_id"], customer_id=user_id).first()
        elif role == "professional":
            srvcreq = ServiceRequests.query.filter_by(srvcreq_id=data["srvcreq_id"], prof_id=user_id).first()
        elif role == "admin":
            srvcreq = ServiceRequests.query.filter_by(srvcreq_id=data["srvcreq_id"]).first()
        else:
            return json.dumps({'error': 'Unauthorized access'}), 401

        if not srvcreq:
            return json.dumps({"error": f"{data['srvcreq_id']} not found "}), 400

        if role in ("user", "admin"):
            if "cust_rating" in data:
                srvcreq.cust_rating = data["cust_rating"]
            if "cust_review" in data:
                srvcreq.cust_review = data["cust_review"]
            if data['srvc_status'] == "canceled" and srvcreq.srvc_status == "pending":
                srvcreq.srvc_status = data['srvc_status']
                data = {"msg" : f"You have cancelled your request!! Retry again!"}
                prof_req(data)
            if data['srvc_status'] == "completed" and srvcreq.srvc_status == "accepted":
                srvcreq.srvc_status = data['srvc_status']
                data = {"msg" : f"You have successfully completed the task, Your stats have Updated!!🎉🎉"}
                prof_req(data)

        if role in ("professional", "admin"):
            if "prof_rating" in data:
                srvcreq.prof_rating = data["prof_rating"]
            if "prof_review" in data:
                srvcreq.prof_review = data["prof_review"]
            if "srvc_status" in data:
                if data['srvc_status'] in ("accepted","rejected") and srvcreq.srvc_status == "pending":
                    srvcreq.srvc_status = data['srvc_status']
                    data = {"msg" : f"Your request has been {data['srvc_status']} by the professional! check your orders!!"}
                    req_accept(data)
  
                
        


        db.session.commit()
        return json.dumps({'message': 'Service request updated successfully'}), 200
