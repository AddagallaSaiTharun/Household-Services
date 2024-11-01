from application.jobs.workers import clry
from application.jobs.tasks import send_monthly_report
from celery.schedules import crontab

# Schedule the task to run monthly on the 1st day at midnight
clry.conf.beat_schedule = {
    'send-monthly-report': {
        'task': 'application.jobs.tasks.send_monthly_report',
        'schedule': crontab(day_of_month=20, hour=16, minute=59),
    }
}

clry.conf.timezone = 'Asia/Kolkata'

if __name__ == '__main__':
    clry.start()
