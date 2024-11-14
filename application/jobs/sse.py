from flask_sse import sse
from flask import current_app as app
import json
app.register_blueprint(sse, url_prefix='/events')
   
def send_notification(d):
    with app.app_context():
        data = d['msg']
        email = d['email']
        if 'show_review_form' in d:
            open_review_form(d)
        sse.publish(data, type=email)
        return


def open_review_form(d):
    with app.app_context():
        data = d['show_review_form']
        email = d['email']
        sse.publish(data, type=email)
        return