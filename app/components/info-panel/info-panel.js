import './info-panel.scss'
import template from './info-panel.html'
import { Component } from '../component'

/**
 * Info Panel Component
 * Download and display metadata for selected items.
 * @extends Component
 */
export class InfoPanel extends Component {
  constructor (placeholderId, props) {
    super(placeholderId, props, template)
    this.api = props.data.apiService

    // Toggle info panel on title click
    this.refs.title.addEventListener('click', () => this.refs.container.classList.toggle('info-active'))
  }

  /** Show info when a map item is selected */
  async showInfo (name, id, type) {
    // Display location title
    this.refs.title.innerHTML = `<h1>${name}</h1>`

    // Download and display information, based on location type
    this.refs.content.innerHTML = (type === 'region')
      ? await this.getRegionDetailHtml(id)
      : await this.getLocationDetailHtml(id, type)
  }

  /** Create region detail HTML string */
  async getRegionDetailHtml (id) {
    // Get region metadata
    let { regionSize: regionSize, townCount, regionSummary } = await this.api.getAllRegionDetails(id)

    // Convert size to an easily readable string
    regionSize = regionSize.toLocaleString(undefined, { maximumFractionDigits: 0 })

    // Format summary HTML
    const summaryHTML = this.getInfoSummaryHtml(regionSummary)

    // Return filled HTML template
    return `
      <h3>REGION</h3>
      <div>Size Estimate - ${regionSize} km<sup>2</sup></div>
      <div>Number of Castles - ${townCount}</div>
      ${summaryHTML}
      `
  }

  /** Create location detail HTML string */
  async getLocationDetailHtml (id, type) {
    // Get location metadata
    const locationInfo = await this.api.getLocationSummary(id)

    // Format summary template
    const summaryHTML = this.getInfoSummaryHtml(locationInfo)

    // Return filled HTML template
    return `
      <h3>${type.toUpperCase()}</h3>
      ${summaryHTML}`
  }

  /** Format location summary HTML template */
  getInfoSummaryHtml (info) {
    return `
      <h3>Summary</h3>
      <div>${info.summary}</div>
      <div><a href="${info.url}" target="_blank" rel="noopener">Read More...</a></div>`
  }
}