<template>
    <section class="section" v-if="groupList.length > 0">
        <div class="content">
            <h2>Gruppi creati</h2>
            <div class="buttons">
                <button class="tag is-primary" @click="goToInsertNewGroup()">Inserisci nuovo gruppo</button>
                <button class="tag is-primary" @click="downloaData()">Download Json di tutti i gruppi</button>
            </div>
        </div>
        <div class="tabs">
            <ul>
                <li :class="appStore.activeGroup == group.name ? 'is-active' : ''" v-for="group in groupList"
                    :key="group.key" @click="setActiveGroup(group.name)">
                    <a>{{ group.name }}</a>
                </li>
            </ul>
        </div>
        <GroupContent v-bind:group="appStore.getGroup(appStore.activeGroup)" />
    </section>
</template>

<script setup>
import { useAppStore } from '../stores/appStores'
import { reactive } from 'vue'
import GroupContent from './GroupContent.vue'
const appStore = useAppStore();
const groupList = reactive(appStore.groups)

function setActiveGroup(name) {
    appStore.setActiveGroup(name);
}
function goToInsertNewGroup() {
    appStore.setStatus('insert')
}
function downloaData() {
    const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appStore.groups));
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "allData.json";

    link.click();
}

</script>