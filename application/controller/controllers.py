from flask import current_app as app

@app.route('/', methods=['GET'])
def home():
    return("Hello World")