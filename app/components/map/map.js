import "./map.scss";
import L from "leaflet";
import "leaflet-draw";
import { Component } from "../component";

const template = '<div ref="mapContainer" class="map-container"></div>';

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
  constructor(mapPlaceholderId, props) {
    super(mapPlaceholderId, props, template);

    // Initialize Leaflet map
    this.map = L.map(this.refs.mapContainer, {
      center: [0, 0],
      zoom: 4,
      maxZoom: 7,
      minZoom: 0
      //maxBounds: [ [ 50, -30 ], [ -45, 100 ] ]
    });

    this.map.zoomControl.setPosition("topleft"); // Position zoom control
    this.layers = {}; // Map layer dict (key/value = title/layer)
    this.selectedRegion = null; // Store currently selected region

    // Render Carto GoT tile baselayer
    L.tileLayer("./tiles/{z}-{y}-{x}.png", {
      noWrap: true,
      minZoom: 0,
      maxZoom: 7,
      attribution: "Maptiles by CryoFall"
    }).addTo(this.map);

    // Leaflet.draw
    // Initialise the FeatureGroup to store editable layers
    var drawnItems = new L.FeatureGroup();
    this.map.addLayer(drawnItems);

    var drawPluginOptions = {
      position: "bottomright",
      draw: {
        polygon: {
          allowIntersection: false, // Restricts shapes to simple polygons
          drawError: {
            color: "#e1e100", // Color the shape will turn when intersects
            message: "<strong>Oh snap!<strong> you can't draw that!" // Message that will show when intersect
          },
          shapeOptions: {
            color: "#97009c"
          }
        },
        // disable toolbar item by setting it to false
        polyline: true,
        circle: true, // Turns off this drawing tool
        rectangle: false,
        marker: true
      },
      edit: {
        featureGroup: drawnItems, //REQUIRED!!
        remove: true
      }
    };

    // Initialise the draw control and pass it the FeatureGroup of editable layers
    var drawControl = new L.Control.Draw(drawPluginOptions);
    this.map.addControl(drawControl);

    this.map.on("draw:created", function(e) {
      var type = e.layerType,
        layer = e.layer;

      if (type === "marker") {
        layer.bindPopup("A popup!");
      }

      drawnItems.addLayer(layer);
    });

    this.map.on("draw:deleted", (e) => {
      console.log("drawnItems", drawnItems.toGeoJSON());
    })
  }

  addLocationGeojson(layerTitle, geojson, iconUrl) {
    // Initialize new geojson layer
    this.layers[layerTitle] = L.geoJSON(geojson, {
      // Show marker on location
      pointToLayer: (feature, latlng) => {
        return L.marker(latlng, {
          icon: L.icon({ iconUrl, iconSize: [24, 56] }),
          title: feature.properties.name
        });
      },
      onEachFeature: this.onEachLocation.bind(this)
    });
  }

  /** Assign Popup and click listener for each location point */
  onEachLocation(feature, layer) {
    // Bind popup to marker
    layer.bindPopup(feature.properties.name, { closeButton: false });
    layer.on({
      click: e => {
        this.setHighlightedRegion(null); // Deselect highlighed region
        const { name, id, type } = feature.properties;
        this.triggerEvent("locationSelected", { name, id, type });
      }
    });
  }

  addRegionGeojson(geojson) {
    // Initialize new geojson layer
    this.layers.region = L.geoJSON(geojson, {
      // Set layer style
      style: {
        color: "#222",
        weight: 1,
        opacity: 0.65
      },
      onEachFeature: this.onEachRegion.bind(this)
    });
  }

  /** Assign click listener for each region GeoJSON item  */
  onEachRegion(feature, layer) {
    layer.on({
      click: e => {
        const { name, id } = feature.properties;
        this.map.closePopup(); // Deselect selected location marker
        this.setHighlightedRegion(layer); // Highlight region polygon
        this.triggerEvent("locationSelected", { name, id, type: "region" });
      }
    });
  }

  /** Highlight the selected region */
  setHighlightedRegion(layer) {
    // If a layer is currently selected, deselect it
    if (this.selected) {
      this.layers.kingdom.resetStyle(this.selected);
    }

    // Select the provided region layer
    this.selected = layer;
    if (this.selected) {
      this.selected.bringToFront();
      this.selected.setStyle({ color: "blue" });
    }
  }

  /** Toggle map layer visibility */
  toggleLayer(layerName) {
    const layer = this.layers[layerName];
    if (this.map.hasLayer(layer)) {
      this.map.removeLayer(layer);
    } else {
      this.map.addLayer(layer);
    }
  }
}
