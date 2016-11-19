#6.9.1, 6.9, 6 - boron
FROM node:boron
RUN mkdir -p /usr/api
COPY . /usr/api
WORKDIR /usr/api
RUN npm install

ENV PORT 3000
EXPOSE  $PORT

CMD ["npm", "start"]

#Cheat Sheet
# TODO: automate this environment

# Creates the microservice image image
# docker build -t series-microservice:0.1 .

# Starts the mongo image mapping its port to 27018
#docker run --name testdb -p 27018:27017 -d mongo:3

# Starts the microservice pointing to the mongo container
#docker run --name series-microservice -p 3000:3000 -d -e MONGO_HOST=testdb -e MONGO_PORT=27018 --link testdb series-microservice:0.1


