
import os
import logging
from celery import Celery
from backend.settings import base

logger = logging.getLogger(__name__)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "real_estate.settings.development")

app = Celery("real_estate")
# Using a string here means the worker doesn't have to serialize
app.config_from_object("backend.settings.development", namespace="CELERY")
app.autodiscover_tasks(lambda: base.INSTALLED_APPS)