import os
from dotenv import load_dotenv
from pathlib import Path

env_path = Path('.env')
load_dotenv(dotenv_path=env_path)

cur_dir = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'sqlite:///' + os.path.join(cur_dir, 'fixupcrew.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
class test_config(Config):
    SQLITE_DB_DIR = os.path.join(cur_dir, "../tests/test_db")
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(SQLITE_DB_DIR, "test_db.db")
    PORT = 5000
    HOST = "localhost"
    DEBUG = True

class localConfig(Config):
    SQLITE_DB_DIR = os.path.join(cur_dir, "../db_directory")
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(SQLITE_DB_DIR, "fixupcrew.db")
    PORT = 5000
    HOST = "localhost"
    DEBUG = True

class oAuth_cred():
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    CONF_URL = os.environ.get('CONF_URL')
    

