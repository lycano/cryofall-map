import "./main.scss";
import template from "./main.html";

import { ApiService } from "./services/api";

import { Map } from "./components/map/map";
import { InfoPanel } from "./components/info-panel/info-panel";
import { LayerPanel } from "./components/layer-panel/layer-panel";

/** Main UI Controller Class */
class ViewController {
  /** Initialize Application */
  constructor() {
    document.getElementById("app").outerHTML = template;

    // Initialize API service
    if (window.location.hostname === "localhost") {
      this.api = new ApiService("http://localhost:9000/api/");
    } else {
      this.api = new ApiService("https://lycano.github.com/cryofall-map/");
    }

    this.searchService = new SearchService();
    this.locationPointTypes = ["region", "location", "landmark"];
    this.initializeComponents();
    this.loadMapData();
  }

  /** Initialize Components with data and event listeners */
  initializeComponents() {
    // Initialize Info Panel
    this.infoComponent = new InfoPanel("info-panel-placeholder", {
      data: { apiService: this.api }
    });

    // Initialize Map
    this.mapComponent = new Map("map-placeholder", {
      events: {
        locationSelected: event => {
          // Show data in infoComponent on "locationSelected" event
          const { name, id, type } = event.detail;
          this.infoComponent.showInfo(name, id, type);
        }
      }
    });

    // Initialize Layer Toggle Panel
    this.layerPanel = new LayerPanel("layer-panel-placeholder", {
      data: { layerNames: [...this.locationPointTypes] },
      events: {
        layerToggle:
          // Toggle layer in map controller on "layerToggle" event
          event => {
            this.mapComponent.toggleLayer(event.detail);
          }
      }
    });
  }

  /** Load map data from the API */
  async loadMapData() {
    // Download kingdom boundaries
    const regionsGeojson = await this.api.getRegions();

    // Add data to map
    this.mapComponent.addRegionGeojson(regionsGeojson);

    // Show region boundaries
    this.mapComponent.toggleLayer("region");

    // Download location point geodata
    for (let locationType of this.locationPointTypes) {
      // Download GeoJSON + metadata
      const geojson = await this.api.getLocations(locationType);

      // Add data to map
      this.mapComponent.addLocationGeojson(
        locationType,
        geojson,
        this.getIconUrl(locationType)
      );

      // Display location layer
      this.mapComponent.toggleLayer(locationType);
    }
  }

  /** Format icon URL for layer type  */
  getIconUrl(layerName) {
    return `./icons/${layerName}.png`;
  }
}

window.ctrl = new ViewController();
