import { EndpointModel } from '@/models/endpoint'
import { GroupModel } from '@/models/group'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { reactive } from 'vue'
//import { computed } from 'vue'

export const useAppStore = defineStore('appStore', () => {
  const groups = reactive([])
  function addGroup(name, urls, endpoints) {
    let endpointObjects = []
    for (let i = 0; endpoints.length > i; i++) {
      endpointObjects.push(new EndpointModel(endpoints[i]))
    }
    let group = new GroupModel(name, urls, endpointObjects)
    groups.push(group)
    activeGroup.value = name
  }

  function getGroup(name) {
    if (name == undefined || name == null || name == '') {
      return groups[0]
    }
    for (let i = 0; groups.length; i++) {
      if (groups[i].name == name) return groups[i]
    }
  }

  function setActiveGroup(name) {
    activeGroup.value = name
  }
  const activeGroup = ref('')
  const status = ref('insert')
  function setStatus(newStatus) {
    status.value = newStatus
  }

  function addAllGroupsDataFrom(data) {
    let dataJson = JSON.parse(data)
    for (let i = 0; i < dataJson.length; i++) {
      groups.push(dataJson[i])
    }
    if (groups.length > 0) {
      setActiveGroup(dataJson[0].name)
      setStatus('read')
    }
  }
  function addSingleGroupDataFrom(data) {
    let dataJson = JSON.parse(data)
    groups.push(dataJson)
    if (groups.length > 0) {
      setActiveGroup(dataJson.name)
      setStatus('read')
    }
  }

  function splitInMoreGroups(name, index) {
    let groupToSplit = null
    for (let i = 0; groups.length; i++) {
      if (groups[i].name == name) {
        groupToSplit = groups[i]
      }
      let end = false
      let urls = []
      urls.push(groupToSplit.url1)
      urls.push(groupToSplit.url2)
      let endpoints = []
      let i = 0
      while (i < 100 || end) {
        if (
          groupToSplit.endpoints[index + i] == undefined ||
          groupToSplit.endpoints[index + i] == null
        ) {
          end = true
        } else {
          endpoints.push(groupToSplit.endpoints[index + i])
          i++
        }
      }
      let newGroupName = groupToSplit.name + 'page_' + index
      let newGroup = new GroupModel(newGroupName, urls, endpoints)
      groups.push(newGroup)
    }
  }

  return {
    groups,
    activeGroup,
    status,
    addGroup,
    getGroup,
    setActiveGroup,
    setStatus,
    addAllGroupsDataFrom,
    addSingleGroupDataFrom,
    splitInMoreGroups
  }
})
