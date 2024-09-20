class GroupModel {
  key
  name
  url1
  url2
  endpoints

  constructor(name, urls, endpoints) {
    this.name = name
    this.url1 = urls[0]
    this.url2 = urls[1]
    this.endpoints = endpoints
  }

  getData() {
    return {
      name: this.name,
      urls: this.urls
    }
  }

  // setData(dashBoardName, content) {
  //   this.dashBoardName = dashBoardName
  //   this.content = content
  // }

  setKey(key) {
    this.key = key
  }
}
export { GroupModel }
