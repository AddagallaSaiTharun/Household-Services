from flask import Flask
from flask_cors import CORS
from flask_restful import Resource, Api
from application.data.database import db
from application.config import localConfig
from application.jobs import workers

APP = None
API = None
CELERY = None

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
    flask_app.secret_key = flask_app.config["SECRET_KEY"]
    db.init_app(flask_app)
    flask_api = Api(flask_app)
    flask_app.app_context().push()
    CORS(flask_app, resources={r"/*" : {"origins" : "http://localhost:5000", "allow_headers" : "Access-Control-Allow-Origin"}})

    # flask_celery = workers.celery
    # flask_celery.conf.update(
    #     broker_url = flask_app.config["CELERY_BROKER_URL"],
    #     result_backend = flask_app.config["CELERY_RESULT_BACKEND"]
    # )

    # flask_celery.Task = workers.ContextTask
    # flask_app.app_context().push()
    # return flask_app, flask_api,flask_celery

    return flask_app, flask_api

APP,API = create_app()
# APP,API,CELERY = create_app()

from application.controller.controllers import *

if __name__ == '__main__':
    APP.run(port=5000,host="0.0.0.0",debug=True)