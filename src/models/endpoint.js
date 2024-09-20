class EndpointModel {
  endpoint
  response1
  response2
  responseCode1
  responseCode2
  responseEqual
  responseObjectEqual
  isRunning
  lastRunDate
  hasError
  constructor(endpoint) {
    this.endpoint = endpoint
    this.isRunning = false
    this.responseCode1 = ''
    this.responseCode2 = ''
    this.lastRunDate = ''
    this.responseEqual = false
    this.responseObjectEqual = false
    this.lastRunDate = null
    this.hasError = false
  }
}
export { EndpointModel }
