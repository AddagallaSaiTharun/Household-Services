from flask import current_app as app
from flask import render_template, url_for, redirect, session, flash, request
from authlib.integrations.flask_client import OAuth
from application.config import oAuth_cred
from application.data.models import Users
from flask_bcrypt import Bcrypt
from datetime import timedelta
from application.data.database import db


oauth  = OAuth(app)
bcrypt = Bcrypt(app)
app.permanent_session_lifetime = timedelta(minutes=30)

@app.route('/')
def index():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('index.html', username = session['username'])

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
    session['username'] = user['name']
    print(user)
    return redirect('/')


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        first_name = request.form['first_name']
        last_name = request.form.get('last_name')  # Optional field
        age = request.form.get('age')
        gender = request.form.get('gender')
        user_image_url = request.form.get('user_image_url')  # Optional field
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        phone = request.form['phone']
        address = request.form['address']
        address_link = request.form['address_link']
        pincode = request.form['pincode']

        # Validation: Check if username or phone already exists
        if Users.query.filter_by(email=email).first():
            flash('Usersname already exists. Please choose another.', 'danger')
        elif Users.query.filter_by(phone=phone).first():
            flash('Phone number already exists. Please choose another.', 'danger')
        elif password != confirm_password:
            flash('Passwords do not match. Please try again.', 'danger')
        else:
            # Hash the password before storing it
            hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
            
            # Create a new user instance
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
            
            flash('Signup successful! Please login.', 'success')
            return redirect(url_for('login'))
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = Users.query.filter_by(email = email).first()
        if user and bcrypt.check_password_hash(user.password, password):
            session.permanent = True  
            session['username'] = user.first_name+user.last_name
            flash('Login successful!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid credentials. Please try again.', 'danger')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None) 
    flash('You have been logged out.', 'success')
    return redirect(url_for('login'))