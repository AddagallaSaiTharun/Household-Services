from flask import current_app as app
from flask import render_template, url_for, redirect, session, flash, request, jsonify
from authlib.integrations.flask_client import OAuth
from application.config import oAuth_cred
from application.data.models import Users
from flask_bcrypt import Bcrypt
from datetime import timedelta
from application.data.database import db
import jwt
from functools import wraps

oauth  = OAuth(app)
bcrypt = Bcrypt(app)


def token_required(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        token = request.args.get('token')
        
        if not token: 
            return redirect(url_for('index'))
        try:
            # Attempt to decode the token using the secret key
            payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            return jsonify({'Alert!': 'Token has expired!'}), 403
        except jwt.InvalidTokenError:
            return jsonify({'Alert!': 'Invalid Token!'}), 403
        
        return func(*args, **kwargs)  

    return decorated




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
            },app.config['SECRET_KEY'])
    
    return jsonify({
                'token': token, 
                'message': 'Login successful',
                'name' : user.given_name,
            }), 200

@app.route('/signup', methods=['POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        first_name = request.form['first_name']
        last_name = request.form.get('last_name')
        age = request.form.get('age')
        gender = request.form.get('gender')
        user_image_url = request.form.get('user_image_url') 
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        phone = request.form['phone']
        address = request.form['address']
        address_link = request.form['address_link']
        pincode = request.form['pincode']

        if Users.query.filter_by(email=email).first():
            return jsonify({'message': 'Email already exists'}), 400
        elif Users.query.filter_by(phone=phone).first():
            return jsonify({'message': 'Phone number already exists'}), 400
        elif password != confirm_password:
            return jsonify({'message': 'Passwords do not match'}), 400
        else:
            hashed_password = hashed_password = bcrypt.generate_password_hash(password)
            new_user = Users(
                email=email,
                first_name=first_name,
                last_name=last_name,
                age=age,
                gender=gender,
                user_image_url=user_image_url,
                password=hashed_password,
                phone=phone,
                address=address,
                address_link=address_link,
                pincode=pincode
            )
            db.session.add(new_user)
            db.session.commit()
            
            return jsonify({'message': 'signup successful'}), 200

   
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = Users.query.filter_by(email = email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            session.permanent = True  
            session['logged_in'] = True

            token = jwt.encode({
                'user_id': user.user_id,
                'email': user.email,
                'name' : user.first_name,
                'address' : user.address,
                'address_link' : user.address_link,
            },app.config['SECRET_KEY'])

            return jsonify({
                'token': token, 
                'message': 'Login successful',
                'name' : user.first_name,
            }), 200
        else:
            return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/logout', methods=['GET'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'}), 200



@app.route('/protected')
@token_required
def protected():
    return jsonify({'message': 'This is a protected route. Token is valid!'}), 200
