/**
 * API Routes Module
 */

const Router = require("koa-router");
const joi = require("joi");
const validate = require("koa-joi-validate");
const router = new Router();

let database;
switch (process.env.DATABASE_DRIVER) {
  case "lowdb":
    database = require("./database/lowdb");
    break;
  default:
    database = require("./database/postgres");
    break;
}

// make cache optional
if (process.env.USE_CACHE == "true") {
  const cache = require("./cache");

  // Check cache before continuing to any endpoint handlers
  router.use(cache.checkResponseCache);

  // Insert response into cache once handlers have finished
  router.use(cache.addResponseToCache);
}

// Check that id param is valid number
const idValidator = validate({
  params: {
    id: joi
      .number()
      .min(0)
      .max(1000)
      .required()
  }
});

// Check that query param is valid location type
const typeValidator = validate({
  params: {
    type: joi
      .string()
      .valid(["area", "region", "location", "landmark"])
      .required()
  }
});

// Hello World Test Endpoint
router.get("/status", async ctx => {
  ctx.body = "Up";
});

// Get time from DB
router.get("/time", async ctx => {
  const result = await database.queryTime();
  ctx.body = result;
});

// Respond with locations of specified type
router.get("/locations/:type", typeValidator, async ctx => {
  const type = ctx.params.type
  const results = await database.getLocations(type)
  if (results.length === 0) {
    ctx.throw(404)
  }

  // Add row metadata as geojson properties
  const locations = results.map(row => {
    let geojson = JSON.parse(row.st_asgeojson)
    geojson.properties = { name: row.name, type: row.type, id: row.gid }
    return geojson
  });

  ctx.body = locations;
});

// Respond with summary of location, by id
router.get("/locations/:id/summary", idValidator, async ctx => {
  const id = ctx.params.id;
  const result = await database.getSummary("locations", id);
  ctx.body = result || ctx.throw(404);
});

// Respond with boundary geojson for all kingdoms
router.get("/regions", async ctx => {
  const results = await database.getRegionBoundaries()
  if (results.length === 0) {
    ctx.throw(404)
  }

  // Add row metadata as geojson properties
  const boundaries = results.map(row => {
    let geojson = JSON.parse(row.st_asgeojson)
    geojson.properties = { name: row.name, id: row.gid }
    return geojson
  });

  ctx.body = boundaries
});

// Respond with calculated area of kingdom, by id
router.get("/regions/:id/size", idValidator, async ctx => {
  const id = ctx.params.id;
  const result = await database.getRegionSize(id);
  if (!result) {
    ctx.throw(404);
  }

  // Convert response (in square meters) to square kilometers
  const sqKm = result.size * 10 ** -6;
  ctx.body = sqKm;
});

// Respond with summary of region, by id
router.get("/regions/:id/summary", idValidator, async ctx => {
  const id = ctx.params.id;
  const result = await database.getSummary("kingdoms", id);
  ctx.body = result || ctx.throw(404);
});

// Respond with number of castle in region, by id
router.get("/regions/:id/areas", idValidator, async ctx => {
  const regionId = ctx.params.id;
  const result = await database.countCastles(regionId);
  ctx.body = result ? result.count : ctx.throw(404);
});

module.exports = router;
