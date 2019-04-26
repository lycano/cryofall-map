import { CancelToken, get } from 'axios'

/** API Wrapper Service Class */
export class ApiService {
  constructor (url = 'http://localhost:5000/') {
    this.url = url
    this.cancelToken = CancelToken.source()
  }

  async httpGet (endpoint = '') {
    this.cancelToken.cancel('Cancelled Ongoing Request')
    this.cancelToken = CancelToken.source()
    const response = await get(`${this.url}${endpoint}`, { cancelToken: this.cancelToken.token })
    return response.data
  }

  getLocations (type) {
    return this.httpGet(`locations/${type}`)
  }

  getLocationSummary (id) {
    return this.httpGet(`locations/${id}/summary`)
  }

  getRegions () {
    return this.httpGet('regions')
  }

  getRegionSize (id) {
    return this.httpGet(`regions/${id}/size`)
  }

  getTownCount (id) {
    return this.httpGet(`regions/${id}/towns`)
  }

  getRegionSummary (id) {
    return this.httpGet(`regions/${id}/summary`)
  }

  async getAllRegionDetails (id) {
    return {
      regionSize: await this.geRegionSize(id),
      townCount: await this.getTownCount(id),
      regionSummary: await this.getRegionSummary(id)
    }
  }
}