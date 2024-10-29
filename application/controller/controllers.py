from flask import current_app as app
from flask import render_template ,url_for ,redirect ,session ,request ,make_response ,jsonify
import jwt
from application.data.database import db
from application.data.models import *
from application.jobs import tasks
from application.utils.validation import gen_uuid,inject_csrf_token,check_loggedIn_jwt_expiration,csrf_protect,checkEmpty,checkAge,checkPswd,replace_with_ascii,replace_with_chars,check_loggedIn_status,check_role_admin,check_role_cust,check_role_prof
from authlib.integrations.flask_client import OAuth
from datetime import datetime, timedelta, timezone
from main import bcrypt



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
@app.route('/',methods=['GET'])
@app.route('/index',methods=['GET'])
def index():
    # print("Cookie : ",request.cookies)
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
    return render_template('index.html')


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











