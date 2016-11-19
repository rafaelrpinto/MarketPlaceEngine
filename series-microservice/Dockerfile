#6.9.1, 6.9, 6 - boron
FROM node:boron
RUN mkdir -p /usr/api
COPY . /usr/api
WORKDIR /usr/api
RUN npm install

ENV PORT 3000
EXPOSE  $PORT

CMD ["npm", "start"]