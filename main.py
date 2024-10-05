from flask import Flask
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy
import os
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
app.config.from_object(__name__)
CORS(app, resources={r"/*" : {"origins" : "http://localhost:5000", "allow_headers" : "Access-Control-Allow-Origin"}})

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False


cur_dir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(cur_dir, "fixupcrew.db")
db = SQLAlchemy(app)


@app.route('/', methods=['GET'])
def home():
    return("Hello World")


if __name__ == '__main__':
    app.run(port=5000, host="localhost", debug=True)