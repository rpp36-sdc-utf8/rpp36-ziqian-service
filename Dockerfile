# syntax=docker/dockerfile:1
FROM node:16.13.1
WORKDIR /app
COPY package.json /app/package.json
RUN npm install
COPY . /app

EXPOSE 2000
CMD ["node", "server/index.js"]