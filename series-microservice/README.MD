# Tv Series Microservice

This module will offer all the API methods for interacting with TV Series and it's Episodes.

## Build

```bash
git clone https://github.com/rafaelrpinto/TvTracker-Backend
cd series-microservice
npm install
npm test or npm start
```

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
- Container script
- ....
