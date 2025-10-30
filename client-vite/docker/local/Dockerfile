ARG NODE_VERSION=22.0

FROM node:${NODE_VERSION} as node

FROM node as client-local-build

ARG APP_HOME=/app

WORKDIR ${APP_HOME}

COPY ./package*.json .

RUN npm install --legacy-peer-deps

COPY . ${APP_HOME}

RUN npm run build