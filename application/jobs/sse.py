from flask_sse import sse
from flask import current_app as app
import json
app.register_blueprint(sse, url_prefix='/events')

def server_side_event(data):
    with app.app_context():
        sse.publish(data, type='customer')
        return
   