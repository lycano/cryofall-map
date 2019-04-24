import './map.scss'
import L from 'leaflet'
import { Component } from '../component'

const template = '<div ref="mapContainer" class="map-container"></div>'

/**
 * Leaflet Map Component
 * Render GoT map items, and provide user interactivity.
 * @extends Component
 */
export class Map extends Component {
  /** Map Component Constructor
   * @param { String } placeholderId Element ID to inflate the map into
   * @param { Object } props.events.click Map item click listener
   */
  constructor (mapPlaceholderId, props) {
    super(mapPlaceholderId, props, template)

    // Initialize Leaflet map
    this.map = L.map(this.refs.mapContainer, {
      center: [ 0, 0 ],
      zoom: 4,
      maxZoom: 7,
      minZoom: 1,
      //maxBounds: [ [ 50, -30 ], [ -45, 100 ] ]
    })

    this.map.zoomControl.setPosition('topleft') // Position zoom control
    this.layers = {} // Map layer dict (key/value = title/layer)
    this.selectedRegion = null // Store currently selected region

    // Render Carto GoT tile baselayer
    L.tileLayer('./tiles/{z}-{y}-{x}.png', { 
        noWrap: true,
        minZoom: 0,
        maxZoom: 7,
        attribution: "Maptiles by CryoFall"
    }).addTo(this.map)
  }
}