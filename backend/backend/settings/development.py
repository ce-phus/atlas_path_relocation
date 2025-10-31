from .base import *
from celery.schedules import crontab

EMAIL_HOST = env("EMAIL_HOST")
EMAIL_USE_TLS = env("EMAIL_USE_TLS")
EMAIL_HOST_USER = env("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")
EMAIL_PORT = env("EMAIL_PORT")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL")
DOMAIN = env("DOMAIN")
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
# EMAIL_BACKEND = "djcelery_email.backends.CeleryEmailBackend"

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }

DATABASES = {
    "default": {
        "ENGINE": env("POSTGRES_ENGINE"),
        "NAME": env("POSTGRES_DB"),
        "USER": env("POSTGRES_USER"),
        "PASSWORD": env("POSTGRES_PASSWORD"),
        "HOST": env("PG_HOST"),
        "PORT": env("PG_PORT"),
    }
}

CELERY_BROKER_URL = env("CELERY_BROKER")
CELERY_RESULT_BACKEND = env("CELERY_BACKEND")
CELERY_TIMEZONE = "Africa/Nairobi"
FLOWER_BASIC_AUTH = env("FLOWER_BASIC_AUTH")

CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_BROKER_CONNECTION_RETRY = True
CELERY_BROKER_HEARTBEAT = 10
CELERY_BROKER_POOL_LIMIT = None

CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": env("REDIS_URL"),
    }
}

PAYSTACK_SECRET_KEY= env("PAYSTACK_SECRET_KEY")
PAYSTACK_PUBLIC_KEY= env("PAYSTACK_PUBLIC_KEY")

PAYSTACK_PLANS = {
    'seller': 'PLN_h9l6aoao48u47jk',
    'agent': 'PLN_ld84da6leqyu96m',
    'top_agent': 'PLN_0gofzozhks3tlti'
}


# CELERY_BEAT_SCHEDULE = {
#     'process_recurring_billing': {
#         'task': 'apps.billing.tasks.process_recurring_billing',
#         'schedule': crontab(minute='*/1'),
#     },
# }