from flask import Flask
from flask_cors import CORS
from flask_restful import Api
from application.data.database import db
from application.config import localConfig
from application.jobs import workers
from flask_sse import sse
from flask_mail import Mail
from apscheduler.schedulers.background import BackgroundScheduler
# Initialize the Flask extensions

app = None
api = None
celery = None
mail = None

def create_app():
    """
    Creates and configures the Flask application.
    """
    flask_app = Flask(__name__)
    flask_app.config.from_object(localConfig)
    flask_app.secret_key = flask_app.config["SECRET_KEY"]

    # Initialize the extensions with the Flask app instance
    db.init_app(flask_app)
    mail = Mail(flask_app)
    flask_api = Api(flask_app)
    flask_app.app_context().push()

    # Setting up CORS
    CORS(flask_app, resources={r"/*": {"origins": "http://localhost:5000", "allow_headers": "Access-Control-Allow-Origin"}})

    # Configure Celery
    flask_celery = workers.celery
    flask_celery.conf.update(
        broker_url=flask_app.config["CELERY_BROKER_URL"],
        result_backend=flask_app.config["CELERY_RESULT_BACKEND"]
    )

    # Set custom context task for Celery
    flask_celery.Task = workers.ContextTask
    flask_celery.broker_connection_retry_on_startup = True

    # Register blueprints
 

    return flask_app, flask_api, flask_celery, mail

# Global variables assigned by calling create_app()
app, api, celery, mail = create_app()


# Import resources after app is created
from application.controller.controllers import *
from application.api.users import UserAPI, IsAdimn, IsPro
from application.api.services import ServiceAPI
from application.api.srvcreqs import ServiceRequestAPI
from application.api.login import UserLogin
from application.api.professional import ProfessionalAPI

# Add API resources
api.add_resource(UserAPI, "/api/user")
api.add_resource(ServiceAPI, "/api/service")
api.add_resource(ServiceRequestAPI, "/api/srvcreq")
api.add_resource(UserLogin, "/api/login")
api.add_resource(ProfessionalAPI, "/api/professional")
api.add_resource(IsAdimn, "/api/isadmin")
api.add_resource(IsPro, "/api/ispro")

if __name__ == '__main__':
    # Start the application
    app.run(port=5000, host="0.0.0.0", debug=True)
