from flask import current_app as app
from flask import render_template, url_for, session, Response, request, session
from authlib.integrations.flask_client import OAuth
from application.config import oAuth_cred
from application.data.database import db
from application.data.models import Professionals, Users, ServiceRequests, Services
import jwt
import json
from application.utils.validation import preprocesjwt
from application.jobs.sse import send_notification
import random
import requests

oauth  = OAuth(app)


@app.route('/')
def index():
    return render_template('/index.html')

@app.route('/google/')
def google():
    GOOGLE_CLIENT_ID = oAuth_cred.GOOGLE_CLIENT_ID
    GOOGLE_CLIENT_SECRET = oAuth_cred.GOOGLE_CLIENT_SECRET
    CONF_URL = oAuth_cred.CONF_URL
    oauth.register(
        name='google',
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        server_metadata_url=CONF_URL,
        client_kwargs={
            'scope': 'openid email profile'
        }
    )
    redirect_uri = url_for('google_auth', _external=True)
    return oauth.google.authorize_redirect(redirect_uri)
 
@app.route('/google/auth/')
def google_auth():
    token = oauth.google.authorize_access_token()
    user = token.get('userinfo')

    session['logged_in'] = True
    token = jwt.encode({
                'user_id': "none",
                'email': user.email,
                'name' : user.given_name,
                'address' : "none",
                'address_link' : "none",
                'role' : 'user'
            },app.config['SECRET_KEY'])
    
    return json.dumps({
                'token': token, 
                'message': 'Login successful',
                'name' : user.given_name,
            }), 200


import redis
from celery.result import AsyncResult
redis_client = redis.StrictRedis(host='localhost', port=6379, db=0)
channel_name = 'pro_verification_requests'  # Red


@app.route('/admin/notifications', methods=['GET'])
def admin_notifications():
    def stream():
        pubsub = redis_client.pubsub()
        pubsub.subscribe(channel_name)
        
        for message in pubsub.listen():
            print("message ", message)

            task = AsyncResult(message)


            if message['type'] == 'message':
                yield f"data: {message['data'].decode()}\n\n"
    
    return Response(stream(), mimetype='text/event-stream')

@app.route("/api/ispro", methods = ['GET'])
def isPro():
    _, role, _, error = preprocesjwt(request)
    if error:
        return json.dumps({'error': 'Unauthorized access'}), 401

    if role == "professional":
        return json.dumps({"message": True})
    else:
        return json.dumps({"message": False})
    
@app.route("/api/isadmin", methods = ['GET'])
def isAdmin():
    _, role, _, error = preprocesjwt(request)
    if error:
        return json.dumps({'error': 'Unauthorized access'}), 401

    if role == "admin":
        return json.dumps({"message": True})
    else:
        return json.dumps({"message": False})
    
@app.route("/api/getemail")
def getEmail():
    user_id, role, _, error = preprocesjwt(request)
    email = Users.query.filter_by(user_id=user_id).first().email
    return email


from datetime import datetime, timedelta, timezone


@app.route("/api/sendotp", methods=['POST'])
def sendOtp():
    _, _, _, error = preprocesjwt(request)
    if error:
        return json.dumps({'error': 'Unauthorized access'}), 401
    data = request.json
    service_id = data.get("service_id")
    user_id = ServiceRequests.query.filter_by(srvcreq_id=service_id).first().customer_id

    user_email = Users.query.filter_by(user_id=user_id).first().email
    print(user_email)
    otp = f"{random.randint(0, 999999):06}"  # Ensure OTP is a 4-digit number
    session['otp'] = otp
    session['otp_expiry'] = (datetime.now() + timedelta(minutes=3)).isoformat()  # Store as ISO format
    session['service_id'] = service_id  # Store service_id in the session

    send_notification({
        "msg": otp,
        "email": user_email
    })

    return json.dumps({"success": True, "message": "OTP sent successfully"})




@app.route('/api/verifyotp', methods=['POST'])
def verify_otp():
    _, _, _, error = preprocesjwt(request)
    if error:
        return json.dumps({'error': 'Unauthorized access'}), 401

    otp = request.json.get('otp')
    stored_otp = session.get('otp')
    otp_expiry = session.get('otp_expiry')
    service_id = session.get('service_id')

    # Ensure `otp_expiry` is converted back to a datetime object for comparison
    if otp_expiry:
        otp_expiry = datetime.fromisoformat(otp_expiry)

    # Check if OTP has expired
    if otp_expiry and datetime.now() > otp_expiry:
        session.pop('otp', None)  # Clear OTP data from session
        session.pop('otp_expiry', None)
        session.pop('service_id', None)
        return json.dumps({"success": False, "message": "OTP has expired"}), 400

    # Verify if the entered OTP matches the stored OTP
    if otp == stored_otp:
        # Update service request status
        res = requests.put("http://127.0.0.1:5000/api/srvcreq", json={"srvcreq_id": service_id, "srvc_status": "completed"}, headers={"Authorization": request.headers.get("Authorization")})

        # Clear OTP data from session after successful verification
        session.pop('otp', None)
        session.pop('otp_expiry', None)
        session.pop('service_id', None)
        return json.dumps({"success": True, "message": "Closed the service"}), 200
    else:
        return json.dumps({"success": False, "message": "Invalid OTP"}), 400
    
@app.route('/unique_categories', methods=['GET'])
def unique_categories():
    categories = Services.query.with_entities(Services.category).filter(Services.category.isnot(None)).distinct().all()
    return json.dumps({'categories': [category_en.category for category_en in categories]}), 200