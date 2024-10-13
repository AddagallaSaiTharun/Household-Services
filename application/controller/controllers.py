from flask import current_app as app
from flask import render_template ,url_for ,redirect ,session ,request ,make_response ,jsonify ,abort
from functools import wraps
import jwt
import urllib.parse
import secrets
from application.data.database import db
from application.data.models import *
from application.jobs import tasks
from authlib.integrations.flask_client import OAuth
from datetime import datetime, timedelta, timezone
import uuid
from main import bcrypt



oauth  = OAuth(app)
google = oauth.register(
    'google',
    client_id=app.config.get('GOOGLE_CLIENT_ID'),
    client_secret=app.config.get('GOOGLE_CLIENT_SECRET'),
    access_token_url=app.config.get('GOOGLE_ACCESS_TOKEN_URL'),
    authorize_url=app.config.get('GOOGLE_AUTHORIZE_URL'),
    api_base_url=app.config.get('GOOGLE_API_BASE_URL'),
    client_kwargs={'scope': 'email profile'},
)



def gen_uuid():
    return str(uuid.uuid4())


def generate_csrf_token():
    session['csrf_token'] = secrets.token_hex(32)
    # print(session['csrf_token'])
    return session['csrf_token']

@app.context_processor
def inject_csrf_token():
    return {'csrf_token': generate_csrf_token()}





#Custom decorator
def check_loggedIn_jwt_expiration(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.cookies.get('token')

        if not token:
            # If no token is found, redirect or return an error response
            return jsonify({"message": "Token is missing!"}), 403

        try:
            # Simply trying to Decode the token is enough here
            # If the token expires then bolow line throws exception `jwt.ExpiredSignatureError` 
            decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            return f(*args, **kwargs)
            # elif decoded_token.get("loggedIn") == 0:
            #     # If not logged in return a message useful in case of api calls
            #     return jsonify({"message": "Unauthorized user!!!!"}), 401
                

        except jwt.ExpiredSignatureError:
            # If token has expired (based on 'exp' claim)
            # print("Expired and changed...................")
            inject_csrf_token()
            # print("CSRF Token : ",session.get('csrf_token'))
            session.pop('google_token', None)
            session.pop('csrf_token',None)
            response = make_response(redirect("/"))
            response.set_cookie('token', '',expires=0)  # Clear the token cookie
            return response
            # return jsonify({"message": "Token has expired!"}), 401

        except jwt.InvalidTokenError:
            # If the token is invalid
            return jsonify({"message": "Invalid token!"}), 403

    return decorated_function



# Custom CSRF protection decorator
def csrf_protect(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        csrf_token = request.headers.get('X-CSRF-Token')
        
        if not csrf_token or csrf_token != session.get('csrf_token'):
            abort(403, description="Invalid or missing CSRF token")
        # print("CSRF Token : ",session.get('csrf_token'))
        # print("checked")
        return f(*args, **kwargs)
    
    return decorated_function





def checkEmpty(x):
    if not x:
        return False
    return True


def checkPswd(x1,x2):
    if not x1:
        return False
    else:
        if x1==x2:
            return True
def checkAge(x):
    if not x:
        return 0
    else:
        return x




def replace_with_ascii(input_str):
    # Create a mapping of characters to their ASCII values
    ascii_map = {
        '.': '@',
        '/': '*',
        ':': '#'
    }

    # Replace characters in the input string with their ASCII values
    for char, ascii_value in ascii_map.items():
        input_str = input_str.replace(char, ascii_value)
    
    return input_str


def replace_with_chars(input_str):
    # Create a mapping of ASCII values to their characters
    char_map = {
        '@': '.',
        '*': '/',
        '#': ':'
    }

    # Replace ASCII values in the input string with their corresponding characters
    for ascii_value, char in char_map.items():
        input_str = input_str.replace(ascii_value, char)
    
    return input_str


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


@app.route("/signup", methods=['POST','GET'])
def signup():
    if request.method == "GET":
        return render_template("signup.html")
    if request.method == "POST":
        password = request.form['password']
        confirm_password = request.form['conf_password']
        username = request.form['email']
        firstname = request.form['firstname']
        lastname = request.form['lastname']
        age = request.form['age']
        gender = request.form['gender']
        phone = request.form['phone']
        pincode = request.form['pincode']
        address = request.form['address']
        address_link = request.form['address_link']
        role = "cust"
        response = None
        if checkPswd(password,confirm_password) and checkEmpty(username) and checkEmpty(firstname) and checkEmpty(lastname) and checkEmpty(phone) and checkEmpty(gender) and checkEmpty(pincode) and checkEmpty(address) and checkEmpty(address_link) and checkEmpty(role) and checkAge(age):
            with app.app_context():
                try:
                    if 'offersCheck' in request.form:
                        new_user=Users(user_id=gen_uuid(),user_name=username,role=role,password=bcrypt.generate_password_hash(password).decode('utf-8'),first_name=firstname,last_name=lastname,age=age,gender=gender,phone=phone,address=address,address_link=address_link,pincode=pincode,offers_mail=1)
                    else:
                        new_user=Users(user_id=gen_uuid(),user_name=username,role=role,password=bcrypt.generate_password_hash(password).decode('utf-8'),first_name=firstname,last_name=lastname,age=age,gender=gender,phone=phone,address=address,address_link=address_link,pincode=pincode)
                    db.session.add(new_user)
                    db.session.commit()
                    response = make_response(jsonify({'message': 'Registration successful','flag':1,'status': 'success'}),200)
                    # After successful registration
                    email = request.form.get('email')
                    subject = "Registration"
                    body = f"""
                        <p><b>Welcome to Household Services.</b></p>
                        <p>Login into the website with the registered username and password</p>
                        <p>Looking forward to serve you :)</p>
                        <p><b>Thank you for registering!</b></p>
                    """
                    # Call the Celery task
                    job = tasks.send_registration_email.delay(email, subject, body)
                    # print("Job status : ",job.status)
                except Exception as e:
                    print("Rolling back. Issue with database Insertion",e)
                    db.session.rollback()
                    response = make_response(jsonify({'message': 'User could not be registered due to database error.Try after sometime','flag' : 0,'status': 'failure'}),503)
        else:
            response = make_response(jsonify({'message': 'User could not be registered.Something missing','flag':0,'status': 'failure'}),400)
        response.headers['Content-Type'] = 'application/json'
        return response



@app.route('/login',methods=['GET','POST'])
def login():
    if request.method == "GET":
        return render_template('login.html')
    elif request.method == 'POST':
        username = request.form['email']
        password = request.form['password']
        user_check=Users.query.filter(Users.user_name == username).first()
        response = None
        if user_check:
            if bcrypt.check_password_hash(user_check.password, password):
                print("Password Check Successful.")
                inject_csrf_token()
                decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
                decoded_token["username"] = username
                decoded_token["name"] = user_check.first_name + user_check.last_name
                decoded_token["pic_url"] = user_check.user_image_url
                if user_check.role == "cust":
                    decoded_token["role"] = "cust"
                elif user_check.role == "prof":
                    decoded_token["role"] = "prof"
                else:
                    decoded_token["role"] = "blckd"
                decoded_token["loggedIn"] = "1"
                decoded_token["exp"] = datetime.now(timezone.utc) + timedelta(hours=1)
                new_token = jwt.encode(decoded_token, app.config['SECRET_KEY'], algorithm='HS256')
                # print("Cookie token after login : ",request.cookies.get('token'))
                response = make_response(jsonify({
                    'message': 'Login successful',
                    'flag' : 1,
                    'data' : {"name":user_check.first_name,"loggedIn":"1","role":user_check.role,"pic_url":user_check.user_image_url},
                    'status': 'success'
                }), 200)
                response.set_cookie("token",new_token)
            else:
                response = make_response(jsonify({
                    'message': 'Login unsuccessful.Password Incorrect',
                    'flag' : 0,
                    'status': 'success'
                }), 200)
            response.headers['Content-Type'] = 'application/json'
            return response
        else:
            response = make_response(jsonify({
                'message': 'Login unsuccessful.User not registered.',
                'flag' : 0,
                'status': 'success'
            }), 200)
            response.headers['Content-Type'] = 'application/json'
            return response






@app.route('/signin_google')
def login_google():
    # print(dir(google) )
    # print("Cookie token before login : ",request.cookies.get('token'))
    redirect_uri = url_for('authorized', _external=True)
    return google.authorize_redirect(redirect_uri)



@app.route('/signin/callback')
def authorized():
    resp = google.authorize_access_token()
    # print("Response : ",resp)
    if resp is None or resp.get('access_token') is None:
        return 'Access denied: reason=%s error=%s' % (
            request.args['error_reason'],
            request.args['error_description']
        )
    session['google_token'] = (resp['access_token'],'')
    # print("Session Token  : ",session['google_token'])
    # print("Session : ",session)
    # print("Token Getter : ",google.tokengetter)
    user_info = google.get('userinfo')
    # print("User Info : ",user_info)
    user_data = user_info.json()  # Use .json() to get the data as a dictionary
    # print('Logged in with id :  ' , user_data.get('email')," Name : ",user_data.get('name') , " Given name : ",user_data.get('given_name'), " Family Name : ",user_data.get('family_name'), " Picture : ",user_data.get('picture'))
    username = user_data.get('email')
    firstname = user_data.get('given_name')
    lastname = user_data.get('family_name')
    name = user_data.get('name')
    picture = user_data.get('picture')
    user_check=Users.query.filter(Users.user_name == username).first()
    response = None
    if user_check:
        try:
            user_check.user_name = username
            user_check.first_name = firstname
            user_check.last_name = lastname
            user_check.user_image_url = picture
            db.session.commit()
            inject_csrf_token()
            decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
            decoded_token["username"] = username
            decoded_token["name"] = name
            decoded_token["pic_url"] = picture
            if user_check.role == "cust":
                decoded_token["role"] = "cust"
            elif user_check.role == "prof":
                decoded_token["role"] = "prof"
            else:
                decoded_token["role"] = "blckd"
            decoded_token["loggedIn"] = "1"
            decoded_token["exp"] = datetime.now(timezone.utc) + timedelta(hours=1)
            new_token = jwt.encode(decoded_token, app.config['SECRET_KEY'], algorithm='HS256')
            # print("Cookie token after login : ",request.cookies.get('token'))
            response = make_response(jsonify({
                'message': 'Login successful',
                'flag':1,
                'data' : {"name":user_check.first_name,"loggedIn":"1","role":user_check.role,"pic_url":user_check.user_image_url},
                'status': 'success'
            }), 200)
            response.set_cookie("token",new_token)
        except Exception as e:
            print("Rolling Back due to error : ",e)
            db.session.rollback()
            response = make_response(jsonify({
                'message': 'Login unsuccessful, database error. Try again',
                'flag':0,
                'status': 'failure'
            }), 503)
    else:
        decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
        decoded_token["loggedIn"] = "0"
        decoded_token["username"] = username
        decoded_token["name"] = name
        decoded_token["pic_url"] = picture
        print(picture)
        encoded_url = replace_with_ascii(picture)
        print(encoded_url)
        new_token = jwt.encode(decoded_token, app.config['SECRET_KEY'], algorithm='HS256')
        response = make_response(jsonify({
            'message': 'OAuth Registration successful,check your mail for a link to fill in few more details.Only then you can login back.',
            'flag':1,
            'status': 'success'
        }), 200)
        response.set_cookie("token",new_token)
        email = username
        subject = "Registration (Fill few more details)"
        link = f"http://localhost:5000/signup_details_google/{username}/{name}/{encoded_url}"
        body = f"""
            <p><b>Welcome to Household Services.</b></p>
            <p>Thank you for your interest in us!<p/>
            <p>Loking Forward to serve you :)</p>
            <p>Please click the link below to complete your registration by filling in few more details(***Only then will you be able to login***):</p>
            <p><a href="{link}">Complete Registration by clicking here!!</a></p>
            <p><b>Thank you and have a great day.</b></p>
        """
        # Call the Celery task
        job = tasks.send_registration_email.delay(email, subject, body)
        # print("Job status : ",job.status)
    response.headers['Content-Type'] = 'application/json'
    return response



@app.route('/signup_details_google/<string:username>/<string:name>/<string:encoded_url>',methods=['GET'])
def signup_details_google(username=None,name=None,encoded_url=None):
    if username is not None and name is not None and encoded_url is not None:
        if request.cookies.get('token')  is None:
            token_payload = {
                'username' : username,
                'name': name,
                'role': "",
                'loggedIn':"0",
                'pic_url': replace_with_chars(encoded_url),
                'admin' : "0",
                'admin_u' : "",
            }
            token = jwt.encode(token_payload,app.config['SECRET_KEY'], algorithm='HS256')
            response = make_response(redirect(f"/signup_details_google/{username}/{name}/{encoded_url}"))
            response.set_cookie("token",token)
            return response
        return render_template('signup_details.html',username = username)
    else:
        response = make_response(jsonify({'message': 'Something missing','flag':0,'status': 'failure'}),400)
        response.headers['Content-Type'] = 'application/json'
        return response
        



@app.route('/submit_signup_details_google',methods=['POST'])
def submit_signup_details_google():
    decoded_token = jwt.decode(request.cookies.get('token'), app.config['SECRET_KEY'], algorithms=['HS256'])
    username = request.form['email']
    firstname = " ".join(decoded_token['name'].split(' ')[:-1])
    lastname = decoded_token['name'].split(' ')[-1]
    age = request.form['age']
    gender = request.form['gender']
    phone = request.form['phone']
    pincode = request.form['pincode']
    address = request.form['address']
    address_link = request.form['address_link']
    role = "cust"
    response=None
    picture = decoded_token['pic_url']
    user_check=Users.query.filter(Users.user_name == username).first()
    if user_check:
        response = make_response(jsonify({'message': 'User already registered','flag':1,'status': 'success'}),200)
    else:
        if checkEmpty(phone) and checkEmpty(gender) and checkEmpty(pincode) and checkEmpty(address) and checkEmpty(address_link) and checkEmpty(role) and checkAge(age):
            with app.app_context():
                    try:
                        if 'offersCheck' in request.form:
                            new_user=Users(user_id=gen_uuid(),user_name=username,role=role,first_name=firstname,last_name=lastname,age=age,gender=gender,phone=phone,address=address,address_link=address_link,pincode=pincode,offers_mail=1,user_image_url=picture)
                        else:
                            new_user=Users(user_id=gen_uuid(),user_name=username,role=role,first_name=firstname,last_name=lastname,age=age,gender=gender,phone=phone,address=address,address_link=address_link,pincode=pincode,user_image_url=picture)
                        db.session.add(new_user)
                        db.session.commit()
                        response = make_response(jsonify({'message': 'Registration successful','flag':1,'status': 'success'}),200)
                    except Exception as e:
                        print("Rolling Back due to Database error  :",e)
                        db.session.rollback()
                        response = make_response(jsonify({
                            'message': 'Database Error. Try again',
                            'flag':0,
                            'status': 'failure'
                        }), 503)
    response.headers['Content-Type'] = 'application/json'
    return response











