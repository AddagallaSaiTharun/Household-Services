# tests/conftest.py
import base64
import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from application.data.database import db
from application.data.models import Services, Users, Professionals, ServiceRequests
from flask import Flask
from flask_bcrypt import Bcrypt
from datetime import datetime
from application.config import test_config





@pytest.fixture(scope='session')
def app():
    cur_dir = os.path.abspath(os.path.dirname(__file__))
    app = Flask(__name__)
    app.config.from_object(test_config)
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test_secret_key'
    with app.app_context():
        db.init_app(app)
        db.create_all()  # Create tables

        yield app  # Provide the app to tests

        db.drop_all()  # Tear down the database

@pytest.fixture(scope='function')
def client(app):
    # Use a new client for each test function
    with app.test_client() as client:
        yield client

@pytest.fixture(scope='function')
def init_database(app):
    with app.app_context():
        db.drop_all()
        db.create_all()
        bcrypt = Bcrypt(app)

        service_request = ServiceRequests(
            srvcreq_id=11,
            srvc_id = 1,
            customer_id=1234,
            prof_id=1235,
            date_srvcreq=datetime.now(),
            date_cmpltreq=datetime.now(),
            srvc_status="Pending",
            remarks="Sample request",
            cust_rating=None,
            prof_rating=None,
            cust_review=None,
            prof_review=None
        )
        db.session.add(service_request)



        # Add a test admin user
        admin_user = Users(
            user_id=12,
            email="test_admin@example.com",
            first_name = "Test",
            last_name = "User_admin",
            age = 25,
            gender = "Male",
            role = "admin",
            user_image_url = None,
            password=bcrypt.generate_password_hash("testpass").decode('utf-8'),
            phone="1234567893",
            address="123 Test St",
            address_link="test_address_link",
            pincode="123456"
        )
        db.session.add(admin_user)

        image_data = base64.b64encode(b"dummy_image_data")

        # Add a test service
        service = Services(
            service_id=1,
            service_name="Test Service",
            time_req=30,
            service_base_price=100,
            service_image=image_data,
            service_dscp="Description of test service"
        )
        db.session.add(service)

        test_user = Users(
            user_id=1234,
            email="test@example.com",
            first_name = "Test",
            last_name = "User",
            age = 25,
            gender = "Male",
            role = "user",
            user_image_url = None,
            password=bcrypt.generate_password_hash("testpass").decode('utf-8'),
            phone="1234567890",
            address="123 Test St",
            address_link="test_address_link",
            pincode="123456"
        )
        db.session.add(test_user)

        test_user_professional = Users(
            user_id=1235,
            email="test_pro@example.com",
            first_name = "Test",
            last_name = "User_pro",
            age = 20,
            gender = "Male",
            role = "professional",
            user_image_url = None,
            password=bcrypt.generate_password_hash("testpass").decode('utf-8'),
            phone="1234567898",
            address="123 Test St",
            address_link="test_address_link",
            pincode="123456"
        )
        db.session.add(test_user_professional)

        pro = Professionals(
            prof_userid=1235,
            prof_exp="5 years",
            prof_dscp="Test Professional",
            prof_srvcid=123,
            prof_ver=1,
            prof_join_date=datetime(2022, 1, 1)
        )
        db.session.add(pro)

        db.session.commit()
