# Inofficial interactive CryoFall Map

An interactive "CryoFall" map powered by Leaflet.

Visit https://lycano.github.com/cryofall-map/ to explore the application.

#### Structure
- `app/` - The front-end web application source.
- `public/` - The compiled and minified front-end code.
- `server/` - The Node.js API server code.
- `data_augmentation/` - A collection of scripts to augment the shapefile data with summary data scraped from various wikis.
- `geojson_preview` - A simple html page to preview geojson data on a map.

#### Setup

To setup the project, simply download or clone the project to your local machine and `npm install`.

The only extra step is adding a `.env` file in order to properly initialize the required environment variables.

Here's an example `.env` file with sensible defaults for local development -
```
PORT=5000
DATABASE_URL=
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGIN=http://localhost:6000
```

Run `npm run dev` to start the API server on `localhost:5000`, and to build/watch/serve the frontend code from `localhost:6000`.