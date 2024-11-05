def server_side_event():
    from flask_sse import sse
    from flask import current_app as app
    with app.app_context():
        sse.publish("hello", type='customer')
