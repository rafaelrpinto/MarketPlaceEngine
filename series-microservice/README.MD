# Tv Series Microservice

This module will offer all the API methods for interacting with TV Series and it's Episodes.

## Build / Run

### Manually (mongodb on localhost:27017 required)

```bash
git clone https://github.com/rafaelrpinto/TvTracker-Backend
cd TvTracker-Backend/series-microservice/
npm install
npm start # or npm test
```
### Using docker (manually creating the containers)

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
### Using docker-compose (automatically creating/running all containers)

[See here](https://github.com/rafaelrpinto/TvTracker-Backend/blob/master/README.md)


## Search by Title

Searches for TV Series based on the informed title.

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

## Search by IMDB Id

Searches for TV Series based on it's IMDB Id.

`http://localhost:3000/series/tt0903747`

And you will receive:

```javascript
{
  "title": "Breaking Bad",
  "imdbId": "tt0903747",
  "posterLink": "https://images-na.ssl-images-amazon.com/images/M/MV5BMTQ0ODYzODc0OV5BMl5BanBnXkFtZTgwMDk3OTcyMDE@._V1_SX300.jpg",
  "startYear": 2008,
  "endYear": 2013,
  "releaseDate": "2008-01-20T00:00:00.000Z",
  "writer": "Vince Gilligan",
  "plot": "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
  "country": "USA",
  "imdbRating": 9.5,
  "totalSeasons": 5,
  "languages": [
    "English",
    " Spanish"
  ],
  "actors": [
    "Bryan Cranston",
    " Anna Gunn",
    " Aaron Paul",
    " Dean Norris"
  ],
  "genres": [
    "Crime",
    " Drama",
    " Thriller"
  ]
}
```
## Episodes Search

Searches for TV Series Episodes based on the serie's IMDB Id and season number.

`http://localhost:3000/episodes/tt1520211/6`

And you will receive:

```javascript
[
  {
    "title": "First Time Again",
    "imdbId": "tt4211958",
    "releaseDate": "2015-10-11T00:00:00.000Z",
    "imdbRating": 8.8,
    "episodeNumber": 1,
    "serieImdbId": "tt1520211",
    "season": 6
  },
  {
    "title": "JSS",
    "imdbId": "tt4452400",
    "releaseDate": "2015-10-18T00:00:00.000Z",
    "imdbRating": 9.4,
    "episodeNumber": 2,
    "serieImdbId": "tt1520211",
    "season": 6
  },
  ...
  {
    "title": "Last Day on Earth",
    "imdbId": "tt4589574",
    "releaseDate": "2016-04-03T00:00:00.000Z",
    "imdbRating": 6.1,
    "episodeNumber": 16,
    "serieImdbId": "tt1520211",
    "season": 6
  }
]
}
```

## TODO

- Authentication (jwt)
- Logging standard to integrate with ELK
- Helmet integration
- ....
