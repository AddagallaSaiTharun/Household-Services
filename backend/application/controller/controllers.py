from flask import current_app as app
from flask_restful import Resource
from flask import render_template, redirect, request ,make_response, jsonify,session,request
import jwt
import requests
from application.data.models import ServiceRequests, Services, Professionals
from application.controller.sse import server_side_event
from application.utils.validation import check_loggedIn_jwt_expiration,check_loggedIn_status,csrf_protect,check_role_prof,check_role_cust,check_role_admin,c
from application.jobs import tasks
from datetime import datetime




class HomePage(Resource):
    def get(self):
        if request.cookies.get('token')  is None:
            token_payload = {
                'username':"",
                'name': "",
                'role': "",
                'loggedIn':"0",
                'pic_url':"",
                'admin' : "0",
                'admin_u' : "",
            }
            token = jwt.encode(token_payload,app.config['SECRET_KEY'], algorithm='HS256')
            response = make_response(redirect("/"))
            response.set_cookie("token",token)
            return response
        return make_response(render_template('index.html'), 200, {'Content-Type': 'text/html'})




#Time being rendering to check the functionality of sse
@app.route('/api/admin')
def adminPage():
    return render_template('admin.html')




#Route to display customer service request details at professionals end
#On clicking the view button on the service request to be accepted by the professional request  will be sent to below route
@app.route('/api/cust_srvcreq/<string:srvcreq_id>',methods=['GET'])
@check_loggedIn_status
@check_role_prof
@csrf_protect
@check_loggedIn_jwt_expiration
def cust_srvcreq(srvcreq_id=None):
    srvcreq = ServiceRequests.query.filter_by(srvcreq_id = srvcreq_id).first()
    response = None
    if srvcreq:
        service = Services.query.filter_by(service_id = srvcreq.srvc_id).first()
        srvc_name = service.service_name if service else None
        response = make_response(jsonify({
                        'message': 'Srevice Request data retrieved.',
                        'flag' : 1,
                        'data' : {"srvcreq_id":srvcreq_id,"sevice":srvc_name,"name":srvcreq.srvc_usr.first_name + " " + srvcreq.srvc_usr.first_name,"phone": srvcreq.srvc_usr.phone,"address":srvcreq.srvc_usr.address
                                  ,"address_link":srvcreq.srvc_usr.address_link,"pincode":srvcreq.srvc_usr.pincode},
                        'status': 'success'
                    }), 200)
    else:
        response = make_response(jsonify({
            'message' : 'Service Request data could not be retrieved!! Try again later.',
            'flag' : 0,
            'status': 'failure'
        }),503)
    response.headers['Content-Type'] = 'application/json'
    return response



#Route for professional Approval of service  request
@app.route('/api/cust_srvcreq_approval/<string:srvcreq_id>/<string:approval>',methods=['GET'])
@check_loggedIn_status
@check_role_prof
@csrf_protect
@check_loggedIn_jwt_expiration
def cust_srvcreq_approval(srvcreq_id=None,approval=None):
    srvcreq = ServiceRequests.query.filter_by(srvcreq_id = srvcreq_id).first()
    if srvcreq:
        service = Services.query.filter_by(service_id = srvcreq.srvc_id).first()
        srvc_name = service.service_name if service else None
    response = None
    if srvcreq:
        data = {
        "srvcreq_id": srvcreq_id,  
        "srvc_status": approval
        }
        url = 'http://localhost:5000/api/srvc_req'  

        headers = {
            'Content-Type': 'application/json',
            'Authorization': session.get('csrf_token')
        }
        try:
            # Making the PUT request
            resp = requests.put(url, json=data, headers=headers, cookies=request.cookies)
            if resp.status_code == 200:
                #On navigating to the link below all the pending requests of customer will be shown
                server_side_event(msg = f"Your service request for `{srvc_name}` is {approval} by `{srvcreq.srvc_professional.usr.first_name}`.", link=f"http://localhost:5000/api/srvc_req/{srvcreq.customer_id}/1", type=f"professional_approval_{srvcreq.customer_id}")
                email = srvcreq.srvc_usr.user_name
                subject = "Update regarding your service request status"
                body = f"""
                        <p><b>This is from Household Services.</b></p>
                        <p>Status : {approval}</p>
                        <p>Service name : {srvc_name}</p>
                        <p>Professional name : {srvcreq.srvc_professional.usr.first_name} {srvcreq.srvc_professional.usr.last_name}</p>
                        <p>Professional phone number : {srvcreq.srvc_professional.usr.phone}</p>
                        <p>Professional will approach you within 48 hrs from {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
                        <p><b>Thank you and have a good day :)</b></p>
                    """
                job1 = tasks.send_registration_email.delay(email, subject, body)
                email1 = srvcreq.srvc_professional.usr.user_name
                subject1 = "Customer details for your accepted service request."
                body1 = f"""
                        <p><b>This is from Household Services.</b></p>
                        <p>Service name : {srvc_name}</p>
                        <p>Customer name : {srvcreq.srvc_usr.first_name} {srvcreq.srvc_usr.last_name}</p>
                        <p>Customer phone number : {srvcreq.srvc_usr.phone}</p>
                        <p>Customer Address : {srvcreq.srvc_usr.address}</p>
                        <p>Customer address Gmaps link : {srvcreq.srvc_usr.address_link}</p>
                        <p>Plese complete the service within 48 hrs from {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p>
                        <p><b>Thank you and have a good day :)</b></p>
                    """
                job2 = tasks.send_registration_email.delay(email1,subject1,body1)
                response = make_response(jsonify({
                    'message' : 'Service Request accepted successfully',
                    'flag' : 1,
                    'status': 'success'}), resp.status_code)
            else:
                response = make_response(jsonify({
                    'message':'Error. Internal server issue. Please try again!!!',
                    'flag' : 0,
                    'status': 'failure'
                    }),resp.status_code)
        except requests.exceptions.RequestException as e:
        # Handle errors in the request
            response = make_response(jsonify({
                    "message": "Could not reach servers.",
                    'flag' : 0, 
                    "status": "failure"}), 502)
    response.headers['Content-Type'] = 'application/json'
    return response



@app.route('/api/rating/cust/<string:srvcreq_id>',methods = ['POST'])
@check_loggedIn_status
@check_role_cust
@csrf_protect
@check_loggedIn_jwt_expiration
def customerRating(srvcreq_id=None):
    srvcreq = ServiceRequests.query.filter_by(srvcreq_id = srvcreq_id).first()
    response = None
    data = request.form
    if srvcreq:
        data = {
        "cust_rating": data['cust_rating'],  
        "cust_review": data['cust_review'] if data['cust_review'] else ""
        }
        url = 'http://localhost:5000/api/srvc_req'  

        headers = {
            'Content-Type': 'application/json',
            'Authorization': session.get('csrf_token')
        }
        try:
            # Making the PUT request
            resp = requests.put(url, json=data, headers=headers, cookies=request.cookies)
            if resp.status_code == 200:
                server_side_event(msg = f"Thank you for rating the service done by professional : `{srvcreq.srvc_professional.usr.first_name}`.", type=f"cust_rating_{srvcreq.customer_id}")
                response = make_response(jsonify({
                    'message' : 'Service Rating successfully',
                    'flag' : 1,
                    'status': 'success'}), resp.status_code)
            else:
                response = make_response(jsonify({
                    'message':'Error. Internal server issue. Please try again!!!',
                    'flag' : 0,
                    'status': 'failure'
                    }),resp.status_code)
        except requests.exceptions.RequestException as e:
        # Handle errors in the request
            response = make_response(jsonify({
                    "message": "Could not reach servers.",
                    'flag' : 0, 
                    "status": "failure"}), 502)
    response.headers['Content-Type'] = 'application/json'
    return response







@app.route('/api/rating/prof/<string:srvcreq_id>',methods = ['POST'])
@check_loggedIn_status
@check_role_prof
@csrf_protect
@check_loggedIn_jwt_expiration
def professionalRating(srvcreq_id=None):
    srvcreq = ServiceRequests.query.filter_by(srvcreq_id = srvcreq_id).first()
    response = None
    data = request.form
    if srvcreq:
        data = {
        "prof_rating": data['prof_rating'],  
        "prof_review": data['prof_review'] if data['prof_review'] else ""
        }
        url = 'http://localhost:5000/api/srvc_req'  

        headers = {
            'Content-Type': 'application/json',
            'Authorization': session.get('csrf_token')
        }
        try:
            # Making the PUT request
            resp = requests.put(url, json=data, headers=headers, cookies=request.cookies)
            if resp.status_code == 200:
                server_side_event(msg = f"Thank you for rating the customer : `{srvcreq.srvc_usr.first_name}`.", type=f"prof_rating_{srvcreq.prof_id}")
                response = make_response(jsonify({
                    'message' : 'Service Rating successfully',
                    'flag' : 1,
                    'status': 'success'}), resp.status_code)
            else:
                response = make_response(jsonify({
                    'message':'Error. Internal server issue. Please try again!!!',
                    'flag' : 0,
                    'status': 'failure'
                    }),resp.status_code)
        except requests.exceptions.RequestException as e:
        # Handle errors in the request
            response = make_response(jsonify({
                    "message": "Could not reach servers.",
                    'flag' : 0, 
                    "status": "failure"}), 502)
    response.headers['Content-Type'] = 'application/json'
    return response




#All admin routes below


@app.route('/api/pending_prof_approvals',methods = ["GET"])   #For admin only
@check_role_admin
@check_loggedIn_status
@csrf_protect
@check_loggedIn_jwt_expiration
def pendingProfApprovals():
    professionals = Professionals.query.filter_by(prof_ver = 0).all()
    result = []
    for professional in professionals:
        result.append({"prof_userid" : professional.prof_userid,
                       "prof_name" : professional.usr.first_name +" "+ professional.usr.last_name})
    response = make_response(jsonify({"message" : "Pending approvals retrieved successfully.",
                                      "data" : result,
                                      "flag" : 1,
                                      "status" : "failure"}),200)
    response.headers['Content-Type'] = 'application/json'
    return response




@app.route('/api/pending_prof_approvals/details/<string:prof_id>',methods = ["GET"])   #For admin only
@check_role_admin
@check_loggedIn_status
@csrf_protect
@check_loggedIn_jwt_expiration
def pendingProfApprovalsDetails(prof_id = None):
    if prof_id:
        professional = Professionals.query.filter_by(prof_userid = prof_id).first()

        result = {"prof_userid" : professional.prof_userid,
                    "prof_name" : professional.usr.first_name +" "+ professional.usr.last_name,
                    "prof_gender" : professional.usr.gender,
                    "prof_age" : professional.usr.age,
                    "prof_exp" : professional.prof_exp,
                    "prof_srvcname" : professional.prof_service.service_name,
                    "prof_dscp" : professional.prof_dscp,
                    "prof_phone" : professional.usr.phone,
                    "prof_address" : professional.usr.address,
                    "prof_address_link" : professional.usr.address_link,
                    "prof_address_pincode" : professional.usr.pincode}
        response = make_response(jsonify({"message" : "Pending approvals user details retrieved successfully.",
                                        "data" : result,
                                        "flag" : 1,
                                        "status" : "success"}),200)
    else:
        response = make_response(jsonify({"message" : "Pending approvals user details could not be retrieved.",
                                        "data" : result,
                                        "flag" : 0,
                                        "status" : "failure"}),400)
    response.headers['Content-Type'] = 'application/json'
    return response



@app.route('/api/professional_emails>',methods = ["GET"])
def getEmails():
    professionals = Professionals.query.all()
    emails = []
    for professional in professionals:
        emails.append([professional.prof_userid,professional.usr.user_name])
    response = make_response(jsonify({"message" : "Professional's emails retrieved successfully.",
                                      "flag" : 1,
                                      "data" : emails,
                                      "status" : "success"}),200)
    response.headers['Content-Type'] = 'application/json'
    return response
    
    


@app.route('/api/report_details/<string:prof_id>',methods =["GET"])
def reportDetails(prof_id = None):
    response = None
    if prof_id:
        professional = Professionals.query.firter_by(prof_userid = prof_id).first()
        details = dict()
        if professional:
            count_a = 0
            count_r = 0
            count = 0
            for srvc_req in professional.srvc_reqs:
                if srvc_req.srvc_status == "accepted":
                    count_a += 1
                if srvc_req.srvc_status == "rejected":
                    count_r += 1
                if srvc_req.cust_rating != None:
                    sum_rating += srvc_req.cust_rating
                    count += 1
            details = {"service_name" : professional.prof_service.service_name,
                       "srvcreqs_rcvd" : len(professional.srvc_reqs),
                       "srvcreqs_acpt" : count_a,
                       "srvcreqs_rjtd" : count_r,
                       "avg_rating" : sum_rating/count}
            response = make_response(jsonify({"message" : "Professional Monthly report details fetched successfully.",
                                              "flag" : 1,
                                              "data" : details,
                                              "status" : "success",}),200) 
        else:
            response = make_response(jsonify({"message" : "Professional with the given id not found!!",
                                              "flag" : 1,
                                              "data" : details,
                                              "status" : "success",}),200)
    else:
        response = make_response(jsonify({"message" : "Professional id missing!!",
                                              "flag" : 0,
                                              "status" : "failure",}),400)
    response.headers['Content-Type'] = 'application/json'
    return response









