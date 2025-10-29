FROM python:3.10.12

ENV APP_HOME=/django_app
RUN mkdir ${APP_HOME}
RUN mkdir ${APP_HOME}/staticfiles

WORKDIR ${APP_HOME}

LABEL maintainer="cephusluke@gmail.com"
LABEL description="Development image for Atlas Path Application"

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PYTHONPATH="${APP_HOME}/atlas_path:${PYTHONPATH}" 

RUN apt-get update \
  && apt-get install -y build-essential \
  && apt-get install -y libpq-dev \
  && apt-get install -y gettext \
  && apt-get install -y ffmpeg  \
  && apt-get -y install netcat-openbsd gcc postgresql \
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

COPY ./requirements.txt /django_app/requirements.txt

RUN pip3 install -r requirements.txt
RUN pip3 install --upgrade black click
RUN pip install 'urllib3<2'

RUN pip install 'requests<2.29.0'
RUN pip install flower
RUN mkdir -p /django_app/logs

COPY ./docker/local/django/entrypoint /entrypoint
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /entrypoint

COPY ./docker/local/django/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start

COPY ./docker/local/django/celery/worker/start /start-celeryworker
RUN sed -i 's/\r$//g' /start-celeryworker
RUN chmod +x /start-celeryworker

COPY ./docker/local/django/start-celerybeat /start-celerybeat
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /start-celerybeat

COPY ./docker/local/django/celery/flower/start /start-flower
RUN sed -i 's/\r$//g' /start-flower
RUN chmod +x /start-flower

ENTRYPOINT ["/entrypoint"]
