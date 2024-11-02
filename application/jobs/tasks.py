from application.jobs.workers import celery

@celery.task()
def hello_world():
    return "Hello_World"


