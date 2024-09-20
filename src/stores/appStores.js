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
  return {
    groups,
    activeGroup,
    status,
    addGroup,
    getGroup,
    setActiveGroup,
    setStatus,
    addAllGroupsDataFrom,
    addSingleGroupDataFrom
  }
})
