from main import mail
from application.jobs.workers import clry
# from celery import shared_task
from flask_mail import Message



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



@clry.task(bind=True, max_retries=3, default_retry_delay=60)
def send_monthly_report(self):
    #Here do a api call to backend to get emails of professionals and add to recipients list
    try:
        recipients = ["gurudurohith@gmail.com"] 
        subject = "Monthly Report"
        for recipient in recipients:
            #Do a api call to backend to get the report of a professional and include in body of mail
            try:
                body = "<h1>Your Monthly Report</h1><p>Here is the content of your monthly report.</p>"
                try:
                    msg = Message(subject, recipients=[recipient])
                    msg.html = body
                    mail.send(msg)
                    print(f"Monthly report sent to {recipient} successfully!")
                    return True
                except Exception as e:
                    print(f"Failed to send email to {recipient}: {e}")
                    self.retry(exc=e)
            except:
                pass
    except Exception as e:
        pass


