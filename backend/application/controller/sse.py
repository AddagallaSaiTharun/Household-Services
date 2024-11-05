from flask_sse import sse
from flask import current_app as app
from datetime import datetime


app.register_blueprint(sse, url_prefix='/events')

def server_side_event():
    with app.app_context():
        sse.publish("Tharun", type='customer')
        print("New Customer Time: ",datetime.now())