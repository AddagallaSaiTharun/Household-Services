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
    CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND = os.environ.get("CELERY_RESULT_BACKEND")
    SSE_REDIS_URL = "redis://localhost:6379/0"
class test_config(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:" 
    PORT = 5000
    HOST = "localhost"
    DEBUG = True

class localConfig(Config):
    SQLITE_DB_DIR = os.path.join(cur_dir, "../db_directory")
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(SQLITE_DB_DIR, "fixupcrew.db")
    PORT = 5000
    HOST = "localhost"
    DEBUG = True
    REDIS_URL = "redis://localhost:6379/0"
    SSE_REDIS_URL = "redis://localhost:6379/0"

    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.environ.get('EMAIL_USER')  # Your Gmail address
    MAIL_PASSWORD = os.environ.get('EMAIL_PASS')  # Your Gmail password
    MAIL_DEFAULT_SENDER = os.environ.get('EMAIL_USER')  # Default sender for emails


class oAuth_cred():
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
    CONF_URL = os.environ.get('CONF_URL')
    

