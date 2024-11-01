
from flask_restful import Resource
from flask import request,make_response,jsonify,render_template
from application.data.database import db
from application.data.models import Users
from application.utils.validation import checkEmpty,checkAge,gen_uuid,checkPswd
from application.jobs import tasks



class RegisterAPI(Resource):
    """
    Handle GET request to /api/register
    """
    def __init__(self):
        from main import bcrypt
    def get(self):
        return render_template("signup.html")
    """
    Handel POST request to /api/register
    """
    def post(self):
        password = request.form['password']
        confirm_password = request.form['conf_password']
        username = request.form['email']
        firstname = request.form['firstname']
        lastname = request.form['lastname']
        age = request.form['age']
        gender = request.form['gender']
        phone = request.form['phone']
        pincode = request.form['pincode']
        address = request.form['address']
        address_link = request.form['address_link']
        role = "cust"
        response = None
        if checkPswd(password,confirm_password) and checkEmpty(username) and checkEmpty(firstname) and checkEmpty(lastname) and checkEmpty(phone) and checkEmpty(gender) and checkEmpty(pincode) and checkEmpty(address) and checkEmpty(address_link) and checkEmpty(role) and checkAge(age):
                try:
                    if 'offersCheck' in request.form:
                        new_user=Users(user_id=gen_uuid(),user_name=username,role=role,password=bcrypt.generate_password_hash(password).decode('utf-8'),first_name=firstname,last_name=lastname,age=age,gender=gender,phone=phone,address=address,address_link=address_link,pincode=pincode,offers_mail=1)
                    else:
                        new_user=Users(user_id=gen_uuid(),user_name=username,role=role,password=bcrypt.generate_password_hash(password).decode('utf-8'),first_name=firstname,last_name=lastname,age=age,gender=gender,phone=phone,address=address,address_link=address_link,pincode=pincode)
                    db.session.add(new_user)
                    db.session.commit()
                    response = make_response(jsonify({'message': 'Registration successful','flag':1,'status': 'success'}),200)
                    # After successful registration
                    email = request.form.get('email')
                    subject = "Registration"
                    body = f"""
                        <p><b>Welcome to Household Services.</b></p>
                        <p>Login into the website with the registered username and password</p>
                        <p>Looking forward to serve you :)</p>
                        <p><b>Thank you for registering!</b></p>
                    """
                    # Call the Celery task
                    job = tasks.send_registration_email.delay(email, subject, body)
                    # print("Job status : ",job.status)
                except Exception as e:
                    print("Rolling back. Issue with database Insertion",e)
                    db.session.rollback()
                    response = make_response(jsonify({'message': 'User could not be registered due to database error.Try after sometime','flag' : 0,'status': 'failure'}),503)
        else:
            response = make_response(jsonify({'message': 'User could not be registered.Something missing','flag':0,'status': 'failure'}),400)
        response.headers['Content-Type'] = 'application/json'
        return response

