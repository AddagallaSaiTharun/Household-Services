from flask import current_app as app
from flask import render_template, url_for, session
from authlib.integrations.flask_client import OAuth
from application.config import oAuth_cred
from application.data.database import db
import jwt
import json

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
