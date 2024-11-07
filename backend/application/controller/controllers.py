from flask import current_app as app
from flask_restful import Resource
from flask import render_template, redirect, request ,make_response, jsonify,session,request
import jwt
import requests
from application.data.models import ServiceRequests, Services
from application.controller.sse import server_side_event
from application.utils.validation import check_loggedIn_jwt_expiration,check_loggedIn_status,csrf_protect,check_role_prof,check_role_cust
from application.jobs import tasks
from datetime import datetime




# oauth  = OAuth(app)
# google = oauth.register(
#     'google',
#     client_id=app.config.get('GOOGLE_CLIENT_ID'),
#     client_secret=app.config.get('GOOGLE_CLIENT_SECRET'),
#     access_token_url=app.config.get('GOOGLE_ACCESS_TOKEN_URL'),
#     authorize_url=app.config.get('GOOGLE_AUTHORIZE_URL'),
#     api_base_url=app.config.get('GOOGLE_API_BASE_URL'),
#     client_kwargs={'scope': 'email profile'},
# )



#Time being rendering the Home page 
# @app.route('/',methods=['GET'])
# @app.route('/index',methods=['GET'])
# def index():
#     # print("Cookie : ",request.cookies)
#     if request.cookies.get('token')  is None:
#         token_payload = {
#             'username':"",
#             'name': "",
#             'role': "",
#             'loggedIn':"0",
#             'pic_url':"",
#             'admin' : "0",
#             'admin_u' : "",
#         }
#         token = jwt.encode(token_payload,app.config['SECRET_KEY'], algorithm='HS256')
#         response = make_response(redirect("/"))
#         response.set_cookie("token",token)
#         return response
#     return render_template('index.html')


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
#On clicking the view button on the service request to be accepted by the professional request to below route will be sent  
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
                #########################################################################
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


#Time being Signup - GET and POST
# @app.route("/signup", methods=['POST','GET'])
# def signup():
#     if request.method == "GET":
#         return render_template("signup.html")
#     if request.method == "POST":
#         password = request.form['password']
#         confirm_password = request.form['conf_password']
#         username = request.form['email']
#         firstname = request.form['firstname']
#         lastname = request.form['lastname']
#         age = request.form['age']
#         gender = request.form['gender']
#         phone = request.form['phone']
#         pincode = request.form['pincode']
#         address = request.form['address']
#         address_link = request.form['address_link']
#         role = "cust"
#         response = None
#         if checkPswd(password,confirm_password) and checkEmpty(username) and checkEmpty(firstname) and checkEmpty(lastname) and checkEmpty(phone) and checkEmpty(gender) and checkEmpty(pincode) and checkEmpty(address) and checkEmpty(address_link) and checkEmpty(role) and checkAge(age):
#                 try:
#                     if 'offersCheck' in request.form:
#                         new_user=Users(user_id=gen_uuid(),user_name=username,role=role,password=bcrypt.generate_password_hash(password).decode('utf-8'),first_name=firstname,last_name=lastname,age=age,gender=gender,phone=phone,address=address,address_link=address_link,pincode=pincode,offers_mail=1)
#                     else:
#                         new_user=Users(user_id=gen_uuid(),user_name=username,role=role,password=bcrypt.generate_password_hash(password).decode('utf-8'),first_name=firstname,last_name=lastname,age=age,gender=gender,phone=phone,address=address,address_link=address_link,pincode=pincode)
#                     db.session.add(new_user)
#                     db.session.commit()
#                     response = make_response(jsonify({'message': 'Registration successful','flag':1,'status': 'success'}),200)
#                     # After successful registration
#                     email = request.form.get('email')
#                     subject = "Registration"
#                     body = f"""
#                         <p><b>Welcome to Household Services.</b></p>
#                         <p>Login into the website with the registered username and password</p>
#                         <p>Looking forward to serve you :)</p>
#                         <p><b>Thank you for registering!</b></p>
#                     """
#                     # Call the Celery task
#                     job = tasks.send_registration_email.delay(email, subject, body)
#                     # print("Job status : ",job.status)
#                 except Exception as e:
#                     print("Rolling back. Issue with database Insertion",e)
#                     db.session.rollback()
#                     response = make_response(jsonify({'message': 'User could not be registered due to database error.Try after sometime','flag' : 0,'status': 'failure'}),503)
#         else:
#             response = make_response(jsonify({'message': 'User could not be registered.Something missing','flag':0,'status': 'failure'}),400)
#         response.headers['Content-Type'] = 'application/json'
#         return response


#Time being Login - GET and POST
# @app.route('/login',methods=['GET','POST'])
# def login():
#     if request.method == "GET":
#         return render_template('login.html')
#     elif request.method == 'POST':
#         username = request.form['email']
#         password = request.form['password']
#         user_check=Users.query.filter(Users.user_name == username).first()
#         response = None
#         if user_check:
#             if bcrypt.check_password_hash(user_check.password, password):
#                 print("Password Check Successful.")
#                 inject_csrf_token()
#                 decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
#                 decoded_token["username"] = username
#                 decoded_token["name"] = user_check.first_name + user_check.last_name
#                 decoded_token["pic_url"] = user_check.user_image_url
#                 if user_check.role == "cust":
#                     decoded_token["role"] = "cust"
#                 elif user_check.role == "prof":
#                     decoded_token["role"] = "prof"
#                 else:
#                     decoded_token["role"] = "blckd"
#                 decoded_token["loggedIn"] = "1"
#                 decoded_token["exp"] = datetime.now(timezone.utc) + timedelta(hours=1)
#                 new_token = jwt.encode(decoded_token, app.config['SECRET_KEY'], algorithm='HS256')
#                 # print("Cookie token after login : ",request.cookies.get('token'))
#                 response = make_response(jsonify({
#                     'message': 'Login successful',
#                     'flag' : 1,
#                     'data' : {"name":user_check.first_name,"loggedIn":"1","role":user_check.role,"pic_url":user_check.user_image_url},
#                     'status': 'success'
#                 }), 200)
#                 response.set_cookie("token",new_token)
#             else:
#                 response = make_response(jsonify({
#                     'message': 'Login unsuccessful.Password Incorrect',
#                     'flag' : 0,
#                     'status': 'failure'
#                 }), 401)
#             response.headers['Content-Type'] = 'application/json'
#             return response
#         else:
#             response = make_response(jsonify({
#                 'message': 'Login unsuccessful.User not registered.',
#                 'flag' : 0,
#                 'status': 'failure'
#             }), 401)
#             response.headers['Content-Type'] = 'application/json'
#             return response




#Time being Google OAuth Login and Register 
# @app.route('/signin_google')
# def login_google():
#     # print(dir(google) )
#     # print("Cookie token before login : ",request.cookies.get('token'))
#     redirect_uri = url_for('authorized', _external=True)
#     return google.authorize_redirect(redirect_uri)



# @app.route('/signin/callback')
# def authorized():
#     resp = google.authorize_access_token()
#     # print("Response : ",resp)
#     if resp is None or resp.get('access_token') is None:
#         return 'Access denied: reason=%s error=%s' % (
#             request.args['error_reason'],
#             request.args['error_description']
#         )
#     session['google_token'] = (resp['access_token'],'')
#     # print("Session Token  : ",session['google_token'])
#     # print("Session : ",session)
#     # print("Token Getter : ",google.tokengetter)
#     user_info = google.get('userinfo')
#     # print("User Info : ",user_info)
#     user_data = user_info.json()  # Use .json() to get the data as a dictionary
#     # print('Logged in with id :  ' , user_data.get('email')," Name : ",user_data.get('name') , " Given name : ",user_data.get('given_name'), " Family Name : ",user_data.get('family_name'), " Picture : ",user_data.get('picture'))
#     username = user_data.get('email')
#     firstname = user_data.get('given_name')
#     lastname = user_data.get('family_name')
#     name = user_data.get('name')
#     picture = user_data.get('picture')
#     user_check=Users.query.filter(Users.user_name == username).first()
#     response = None
#     if user_check:
#         try:
#             user_check.user_name = username
#             user_check.first_name = firstname
#             user_check.last_name = lastname
#             user_check.user_image_url = picture
#             db.session.commit()
#             inject_csrf_token()
#             decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
#             decoded_token["username"] = username
#             decoded_token["name"] = name
#             decoded_token["pic_url"] = picture
#             if user_check.role == "cust":
#                 decoded_token["role"] = "cust"
#             elif user_check.role == "prof":
#                 decoded_token["role"] = "prof"
#             else:
#                 decoded_token["role"] = "blckd"
#             decoded_token["loggedIn"] = "1"
#             decoded_token["exp"] = datetime.now(timezone.utc) + timedelta(hours=1)
#             new_token = jwt.encode(decoded_token, app.config['SECRET_KEY'], algorithm='HS256')
#             # print("Cookie token after login : ",request.cookies.get('token'))
#             response = make_response(jsonify({
#                 'message': 'Login successful',
#                 'flag':1,
#                 'data' : {"name":user_check.first_name,"loggedIn":"1","role":user_check.role,"pic_url":user_check.user_image_url},
#                 'status': 'success'
#             }), 200)
#             response.set_cookie("token",new_token)
#         except Exception as e:
#             print("Rolling Back due to error : ",e)
#             db.session.rollback()
#             response = make_response(jsonify({
#                 'message': 'Login unsuccessful, database error. Try again',
#                 'flag':0,
#                 'status': 'failure'
#             }), 503)
#     else:
#         decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
#         decoded_token["loggedIn"] = "0"
#         decoded_token["username"] = username
#         decoded_token["name"] = name
#         decoded_token["pic_url"] = picture
#         print(picture)
#         encoded_url = replace_with_ascii(picture)
#         print(encoded_url)
#         new_token = jwt.encode(decoded_token, app.config['SECRET_KEY'], algorithm='HS256')
#         response = make_response(jsonify({
#             'message': 'OAuth Registration successful,check your mail for a link to fill in few more details.Only then you can login back.',
#             'flag':1,
#             'status': 'success'
#         }), 200)
#         response.set_cookie("token",new_token)
#         email = username
#         subject = "Registration (Fill few more details)"
#         link = f"http://localhost:5000/signup_details_google/{username}/{name}/{encoded_url}"
#         body = f"""
#             <p><b>Welcome to Household Services.</b></p>
#             <p>Thank you for your interest in us!<p/>
#             <p>Loking Forward to serve you :)</p>
#             <p>Please click the link below to complete your registration by filling in few more details(***Only then will you be able to login***):</p>
#             <p><a href="{link}">Complete Registration by clicking here!!</a></p>
#             <p><b>Thank you and have a great day.</b></p>
#         """
#         # Call the Celery task
#         job = tasks.send_registration_email.delay(email, subject, body)
#         # print("Job status : ",job.status)
#     response.headers['Content-Type'] = 'application/json'
#     return response


#Time being to further fill in details in case of Google OAuth Registration
# @app.route('/signup_details_google/<string:username>/<string:name>/<string:encoded_url>',methods=['GET'])
# def signup_details_google(username=None,name=None,encoded_url=None):
#     if username is not None and name is not None and encoded_url is not None:
#         if request.cookies.get('token')  is None:
#             token_payload = {
#                 'username' : username,
#                 'name': name,
#                 'role': "",
#                 'loggedIn':"0",
#                 'pic_url': replace_with_chars(encoded_url),
#                 'admin' : "0",
#                 'admin_u' : "",
#             }
#             token = jwt.encode(token_payload,app.config['SECRET_KEY'], algorithm='HS256')
#             response = make_response(redirect(f"/signup_details_google/{username}/{name}/{encoded_url}"))
#             response.set_cookie("token",token)
#             return response
#         return render_template('signup_details.html',username = username)
#     else:
#         response = make_response(jsonify({'message': 'Something missing','flag':0,'status': 'failure'}),400)
#         response.headers['Content-Type'] = 'application/json'
#         return response
        


# To Gather the details submitted via the link sent to mail and then register the user in the database
# @app.route('/submit_signup_details_google',methods=['POST'])
# def submit_signup_details_google():
#     decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
#     username = request.form['email']
#     firstname = " ".join(decoded_token['name'].split(' ')[:-1])
#     lastname = decoded_token['name'].split(' ')[-1]
#     age = request.form['age']
#     gender = request.form['gender']
#     phone = request.form['phone']
#     pincode = request.form['pincode']
#     address = request.form['address']
#     address_link = request.form['address_link']
#     role = "cust"
#     response=None
#     picture = decoded_token['pic_url']
#     user_check=Users.query.filter(Users.user_name == username).first()
#     if user_check:
#         response = make_response(jsonify({'message': 'User already registered','flag':1,'status': 'success'}),200)
#     else:
#         if checkEmpty(phone) and checkEmpty(gender) and checkEmpty(pincode) and checkEmpty(address) and checkEmpty(address_link) and checkEmpty(role) and checkAge(age):
#                     try:
#                         if 'offersCheck' in request.form:
#                             new_user=Users(user_id=gen_uuid(),user_name=username,role=role,first_name=firstname,last_name=lastname,age=age,gender=gender,phone=phone,address=address,address_link=address_link,pincode=pincode,offers_mail=1,user_image_url=picture)
#                         else:
#                             new_user=Users(user_id=gen_uuid(),user_name=username,role=role,first_name=firstname,last_name=lastname,age=age,gender=gender,phone=phone,address=address,address_link=address_link,pincode=pincode,user_image_url=picture)
#                         db.session.add(new_user)
#                         db.session.commit()
#                         response = make_response(jsonify({'message': 'Registration successful','flag':1,'status': 'success'}),200)
#                     except Exception as e:
#                         print("Rolling Back due to Database error  :",e)
#                         db.session.rollback()
#                         response = make_response(jsonify({
#                             'message': 'Database Error. Try again',
#                             'flag':0,
#                             'status': 'failure'
#                         }), 503)
#     response.headers['Content-Type'] = 'application/json'
#     return response



# @app.route('/logout')
# @csrf_protect
# @check_loggedIn_jwt_expiration
# def logout():
#     inject_csrf_token()
#     session.pop('google_token', None)
#     decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
#     decoded_token["loggedIn"] = "0"
#     decoded_token["username"] = ""
#     decoded_token["name"] = ""
#     decoded_token["pic_url"] = ""
#     decoded_token['role']= ""
#     decoded_token['admin']= "0"
#     decoded_token['admin_u'] = ""
#     decoded_token.pop('exp')
#     new_token = jwt.encode(decoded_token, app.config['SECRET_KEY'], algorithm='HS256')
#     # response = make_response(redirect("/"))
#     response = make_response(jsonify({'message': 'Successfully Logged Out','flag':1,'status': 'success'}),200)
#     response.set_cookie("token",new_token)
#     return response











