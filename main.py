from flask import Flask
from flask_cors import CORS
from flask_restful import Resource, Api
from application.data.database import db
from application.jobs import workers
# from application.data import models
from application.config import localConfig
import os
from flask_mail import Mail
from flask_bcrypt import Bcrypt





app = None
api = None
clry = None
mail = None
bcrypt = None




def create_app():
    """
    Creates and configures the Flask application.

    This function initializes the Flask app, loads configuration settings,
    initializes the database, and creates a Flask-RESTful API instance.

    Returns:
        A tuple containing the Flask app and the Flask-RESTful API instance.
    """
    flask_app = Flask(__name__)
    flask_app.config.from_object(localConfig)
    flask_app.secret_key = flask_app.config.get('SECRET_KEY')
    bcrypt = Bcrypt(flask_app)
    # Initialize the database
    db.init_app(flask_app)

    # Initialize Flask-Mail
    mail = Mail(flask_app)

    flask_api = Api(flask_app)
    flask_app.app_context().push()


    # Create Celery
    clry = workers.clry
    print("BROKER URL : ",flask_app.config['CELERY_BROKER_URL'])
    print("BACKEND URL : ",flask_app.config['CELERY_RESULT_BACKEND'])
    clry.conf.update(
        broker_url = flask_app.config['CELERY_BROKER_URL'],
        result_backend = flask_app.config['CELERY_RESULT_BACKEND']
    )
    clry.Task = workers.ContextTask
    clry.conf.broker_connection_retry_on_startup = True
    # CORS(flask_app, resources={r"/*" : {"origins" : "http://localhost:5000", "allow_headers" : "*"}})
    return flask_app, flask_api ,mail ,clry ,bcrypt


app, api, mail, clry ,bcrypt = create_app()


from application.controller.controllers import *


if __name__ == '__main__':
    app.run(host=app.config.get('HOST', 'localhost'),
            port=app.config.get('PORT', 5000),
            debug=app.config.get('DEBUG', True))
