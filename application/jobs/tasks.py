from application.jobs.workers import celery
import redis
import json

from flask_mail import Message



@celery.task(bind=True, max_retries=3, default_retry_delay=60)
def send_registration_email(self, to_email, subject, body):
    """Sends an email with retry on failure."""
    from main import MAIL
    try:
        msg = Message(subject, recipients=[to_email])
        msg.html = body
        MAIL.send(msg)
        print(f"Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        self.retry(exc=e)



redis_client = redis.Redis(host='localhost', port=6379, db=0)
@celery.task(bind = True, max_retries = 3, default_retry_delay = 60)
def verify_pro(self, prof_data):
    try:        
        print("Pushing...")
        # redis_client.lpush("requests",str(prof_data))
        
        print("Pushed!")
        return True
    except Exception as e:
        print(f"Failed to send email: {e}")
        self.retry(exc=e)


