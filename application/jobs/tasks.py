from main import mail
from application.jobs.workers import clry
# from celery import shared_task
from flask_mail import Message
from flask import current_app as app


@clry.task(bind=True, max_retries=3, default_retry_delay=60)
def send_registration_email(self, to_email, subject, body):
    """Sends an email with retry on failure."""
    try:
        msg = Message(subject, recipients=[to_email])
        msg.html = body
        mail.send(msg)
        print(f"Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
        self.retry(exc=e)