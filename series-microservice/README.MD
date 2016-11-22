# Tv Series Microservice

This module will offer all the API methods for interacting with TV Series and it's Episodes.

## Build / Run

### Manually (mongodb on localhost:27017 required)

```bash
git clone https://github.com/rafaelrpinto/TvTracker-Backend
cd series-microservice
npm install
npm start # or npm test
```
### Running each image with Docker

```bash
# Get the code
git clone https://github.com/rafaelrpinto/TvTracker-Backend
cd series-microservice

# Create the microservice image
docker build -t series-microservice:0.1 . 

# Start the mongo image mapping its 27017 port to the host's 27018 (to avoid conflict)
docker run --name testdb -p 27018:27017 -d mongo:3

# Start the microservice pointing to the mongo container
docker run --name series-microservice -p 3000:3000 -d -e MONGO_HOST=testdb -e MONGO_PORT=27018 --link testdb series-microservice:0.1
```
### Running everything with docker-compose

[See here](https://github.com/rafaelrpinto/TvTracker-Backend/blob/master/README.md)


## Search

Searches for TV Series.

`http://localhost:3000/series/search/Walking Dead`

Optionally inform a page number on the path:

`http://localhost:3000/series/search/Walking Dead/2`

And you will receive:

```javascript
{
  "pageResults": [
    {
      "title": "The Walking Dead",
      "imdbId": "tt1520211",
      "posterLink": "https://images-na.ssl-images-amazon.com/images/M/MV5BMTc5NTU3Njg0N15BMl5BanBnXkFtZTgwMzY4MjM0ODE@._V1_SX300.jpg"
    },
    {
      "title": "Fear the Walking Dead",
      "imdbId": "tt3743822",
      "posterLink": "https://images-na.ssl-images-amazon.com/images/M/MV5BMjQwODQ5ODYxOV5BMl5BanBnXkFtZTgwNDU3OTA0OTE@._V1_SX300.jpg"
    },
    ...
  ],
  "currentPage": 1,
  "totalResultCount": 13,
  "pageSize": 10,
  "totalPageCount": 2
}
```

## TODO

- Detailed search by IMDB id
- Episode search
- Authentication (jwt)
- Logging standard to integrate with ELK
- Helmet integration
- ....
