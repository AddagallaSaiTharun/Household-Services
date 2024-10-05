import uuid
from datetime import datetime
from sqlalchemy import func
from application.database import db

class Customers(db.Model):
    __tablename__ = "customers"
    customer_id = db.Column(db.String,primary_key = True, default=lambda: str(uuid.uuid4()))
    user_name = db.Column(db.String(50),nullable=False)
    email = db.Column(db.String(50),nullable=False,unique=True)
    password = db.Column(db.String(50),nullable=False)
    address = db.Column(db.String(50),nullable=False)
    pin = db.Column(db.Integer,nullable=False)
    phone = db.Column(db.String(50),nullable=False)
    professional_id = db.Column(db.String(50),nullable=True)
    role = db.Column(db.String(20), default ="user")


class Professional(db.Model):
    __tablename__ = "professional"
    id = db.Column(db.String,primary_key = True, default=lambda: str(uuid.uuid4()))
    professional_id = db.Column(db.String,db.ForeignKey('customers.customer_id'))
    service_id = db.Column(db.String(50), db.ForeignKey('services.service_id'), nullable = False)
    Experience = db.Column(db.Integer,nullable=False)
    description = db.Column(db.String(250), nullable = False)
    verified = db.Column(db.Boolean, default = False)
    join_date = db.Column(db.DateTime, nullable=False,default=datetime.utcnow)
    avg_rating = db.Column(db.Float, nullable=False, default=0.0)


class Services(db.Model):
    __tablename__ = "services"
    service_id = db.Column(db.String,primary_key = True, default=lambda: str(uuid.uuid4()))
    service_name = db.Column(db.String(50),nullable=False)
    timereq = db.Column(db.Float, nullable = False)
    description = db.Column(db.String(250), nullable = False)

class Service_price(db.Model):
    __tablename__ = "service_price"
    id = db.Column(db.String,primary_key = True, default=lambda: str(uuid.uuid4()))
    service_id = db.Column(db.String(50), db.ForeignKey('services.service_id') ,nullable = False)
    location = db.Column(db.String(50), nullable = False)
    experience = db.Column(db.Integer, nullable = False)
    price = db.Column(db.Float, nullable = False)

class Reviews(db.Model):
    __tablename__ = "reviews"
    id = db.Column(db.String,primary_key = True, default=lambda: str(uuid.uuid4()))
    professional_id = db.Column(db.String, db.ForeignKey('professional.professional_id'))
    customer_id = db.Column(db.String, db.ForeignKey('customers.customer_id'))
    service_request_id = db.Column(db.String, db.ForeignKey('service_history.id'))
    rating = db.Column(db.Float, nullable = False)
    review = db.Column(db.String(250), nullable = False)

class Service_history(db.Model):
    __tablename__ = "service_history"
    id = db.Column(db.String,primary_key = True, default=lambda: str(uuid.uuid4()))
    service_id = db.Column(db.String, db.ForeignKey('services.service_id'))
    user_id = db.Column(db.String, db.ForeignKey('customers.customer_id'))
    professional_id = db.Column(db.String, db.ForeignKey('professional.professional_id'))
    date_of_request = db.Column(db.DateTime, nullable=False,default=datetime.utcnow)
    date_of_completion = db.Column(db.DateTime, nullable=False)
    service_status = db.Column(db.String(50), nullable = False, default="pending")
    remarks = db.Column(db.String(250), nullable = True)