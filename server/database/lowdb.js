/**
 * Postgres DB Module
 */
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('store/storage.json')
const client = low(adapter)

const log = require('../logger')
const dateFormat = require('dateformat')

const turf = require('@turf/turf')

const initLocations = require('../../store/init_locations.json')
const initRegions = require('../../store/init_regions.json')

const lowdb = {
  init: async () => {
    await client.defaults({
      locations: [],
      regions: []
    }).write()

    if (client.get('locations').size().value() === 0) {
      initLocations.forEach(item => {
        client
          .get('locations')
          .push(item)
          .write()
      })
    }

    if (client.get('regions').size().value() === 0) {
      initRegions.forEach(item => {
        client.get('regions')
          .push(item)
          .write()
      })
    }
  },

  transformItemToGeoJSON(item) {
    let geojson = JSON.parse(JSON.stringify(item))
    geojson.st_asgeojson = JSON.stringify(item.st_asgeojson)
    return geojson
  },

  /** Query the current time */
  queryTime: async () => {
    // 2017-03-18 08:21:36.175627+07
    return dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss')
  },

  /** Query the locations as geojson, for a given type */
  getLocations: async type => {
    const locationQuery = `
      SELECT ST_AsGeoJSON(geog), name, type, gid
      FROM locations
      WHERE UPPER(type) = UPPER($1);`

    const filteredLocations = []
    await client.get('locations').value().forEach(item => {
      if (item.type.toLowerCase() === type.toLowerCase()) {
        filteredLocations.push(lowdb.transformItemToGeoJSON(item))
      }
    })

    return filteredLocations
  },

  /** Query the kingdom boundaries */
  getRegionBoundaries: async () => {
    const boundaryQuery = `
      SELECT ST_AsGeoJSON(geog), name, gid
      FROM regions;`

    let transformed = []
    await client.get('regions').value().forEach(item => {
      transformed.push(lowdb.transformItemToGeoJSON(item))
    })

    return transformed
  },

  /** Calculate the area of a given region, by id */
  getRegionSize: async id => {
    const sizeQuery = `
      SELECT ST_AREA(geog) as size
      FROM kingdoms
      WHERE gid = $1
      LIMIT(1);`

    const regionSize = await client.get('regions').find({
      gid: id
    }).value()

    return lowdb.transformItemToGeoJSON(regionSize)
  },

  /** Count the number of areas in a region, by id */
  countAreas: async regionId => {
    throw new Error('Not implemented yet.')
  },

  /** Get the summary for a location or region, by id */
  getSummary: async (table, id) => {
    if (table !== 'regions' && table !== 'locations') {
      throw new Error(`Invalid Table - ${table}`)
    }

    const summaryQuery = `
      SELECT summary, url
      FROM ${table}
      WHERE gid = $1
      LIMIT(1);`
    return client
      .get(table)
      .find({
        gid: id
      })
      .value()
  }
}

lowdb.init()

module.exports = lowdb