FROM node:22.0 as dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --legacy-peer-deps

FROM node:22.0 as build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build