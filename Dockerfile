# syntax=docker/dockerfile:1

# from the node image available in Docker hub
FROM node:16.13.1

# make a working dir in the image as app
WORKDIR /app

# copy package.json to the app dir in the image
COPY package.json /app/package.json

# run the install
RUN npm install

# copy the rest of the code to the app dir in the image
COPY . /app


EXPOSE 2000
# run server when running the container
CMD ["node", "server/index.js"]