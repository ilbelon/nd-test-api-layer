<template>
    <div class="box">
        <div class="content">
            <h5>Url1: {{ prop.group.url1 }} - Url2: {{ prop.group.url2 }}</h5>
            <div class="buttons">
                <button v-if="!fullTestIsRunning" class="tag is-primary" @click="runTestGroup()">Test Gruppo</button>
                <tag v-else class="tag">Test running...</tag>

                <button class="tag is-primary" @click="downloadAllData()">Download Json del gruppo</button>
                <div class="block">
                    <label class="checkbox">
                        <input type="checkbox" checked v-model="onlyErrors" />
                        Mostra solo errori
                    </label>
                </div>
            </div>
            <div class="blok" v-if="fullTestIsRunning">
                {{ testDone }}/{{ testTotal }}

                <progress class="progress is-warning" :value="testDone" :max="testTotal">
                    75%
                </progress>
            </div>
        </div>
        <div class="table-container">
            <table class="table is-striped">
                <thead>
                    <tr>
                        <th><abbr title="EndPoint">Endpoint</abbr></th>
                        <th><abbr title="Response Code 1">RC1</abbr></th>
                        <th><abbr title="Response Code 2">RC2</abbr></th>
                        <th><abbr title="Response Equal">RE</abbr></th>
                        <th><abbr title="Response Object Equal">ROE</abbr></th>
                        <th><abbr title="Last Run">Last Run</abbr></th>
                        <th><abbr title="Actions">Actions</abbr></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="endpoint in endpointToShow" :key="endpoint.key"
                        :class="endpoint.isRunning == true ? 'is-skeleton' : ''">
                        <td>{{ endpoint.endpoint }}</td>
                        <td
                            :class="endpoint.responseCode1 != '' && endpoint.responseCode1.toString()[0] != '2' ? 'has-text-danger' : 'has-text-success'">
                            {{ endpoint.responseCode1 }}</td>
                        <td
                            :class="endpoint.responseCode2 != '' && endpoint.responseCode2.toString()[0] != '2' ? 'has-text-danger' : 'has-text-success'">
                            {{ endpoint.responseCode2 }}</td>
                        <td><img v-if="endpoint.responseEqual" alt="true" class="icon"
                                src="../asset/small-check-mark-icon.png" />
                            <img v-else alt="false" class="icon" src="../asset/cross-icon.png" />
                        </td>
                        <td><img v-if="endpoint.responseObjectEqual" alt="true" class="icon"
                                src="../asset/small-check-mark-icon.png" />
                            <img v-else alt="false" class="icon" src="../asset/cross-icon.png" />
                        </td>
                        <td>{{ getLastRunDate(endpoint.lastRunDate) }}</td>
                        <td>
                            <div class="buttons">
                                <button v-if="!endpoint.isRunning && !fullTestIsRunning" class="tag is-primary"
                                    @click="runTest(endpoint)">Test</button>
                                <button v-else class="tag">Test running...</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
//import { reactive } from 'vue'
import { ref, computed } from 'vue'
const fullTestIsRunning = ref(false);
import _ from 'lodash';
// const testPercenteage = ref(0);
const testTotal = ref(0);
const testDone = ref(0);
const prop = defineProps({
    group: {}
})

const onlyErrors = ref(true);
// const tests = reactive([]);
async function runTest(endpoint) {
    endpoint.isRunning = true;
    const baseUrl = 'http://127.0.0.1:5000/webcaller?url=';
    const urlParam1 = prop.group.url1 + endpoint.endpoint;
    const response1 = await fetch(baseUrl + encodeURIComponent(urlParam1)).catch((err) => {
        // endpoint.responseCode1 = response1.status;
        endpoint.isRunning = false;
        endpoint.hasError = true;
        console.error(err);
    });
    const urlParam2 = prop.group.url2 + endpoint.endpoint;
    const response2 = await fetch(baseUrl + encodeURIComponent(urlParam2)).catch((err) => {
        // endpoint.responseCode2 = response2.status;
        endpoint.isRunning = false;
        endpoint.hasError = true;
        console.error(err);
    });
    const data1 = await response1.json().catch((err) => {
        endpoint.isRunning = false;
        endpoint.hasError = true;
        console.error(err);
    });
    const data2 = await response2.json().catch((err) => {
        endpoint.isRunning = false;
        endpoint.hasError = true;
        console.error(err);
    });
    endpoint.responseCode1 = response1.status;
    endpoint.responseCode2 = response2.status;
    if (response1.status.toString()[0] != '2' || response2.status.toString()[0] != '2') {
        endpoint.responseEqual = false;
        endpoint.responseObjectEqual = false;
        endpoint.response1 = data1;
        endpoint.response2 = data2;
        endpoint.hasError = true;
    } else {
        endpoint.responseEqual = JSON.stringify(data1) === JSON.stringify(data2);
        if (endpoint.responseEqual) {
            endpoint.responseObjectEqual = _.isEqual(data1, data2);
        } else {
            endpoint.responseObjectEqual = _.isEqual(data1, data2);
        }//TODO else controllare oggetto se è uguale
        if (!endpoint.responseEqual) {
            //per salvare spazio salva le risposte solo se risultano diverse
            endpoint.response1 = data1;
            endpoint.response2 = data2;
        }
    }
    endpoint.lastRunDate = new Date();
    endpoint.isRunning = false;
}
async function runTestGroup() {
    fullTestIsRunning.value = true;
    testTotal.value = prop.group.endpoints.length;
    testDone.value = 0;
    for (let i = 0; i < prop.group.endpoints.length; i++) {
        await runTest(prop.group.endpoints[i]);
        testDone.value++;
    }

    fullTestIsRunning.value = false;
}


function downloadAllData() {
    downloadDataAsJson(prop.group, prop.group.name + '.json');
}

function downloadDataAsJson(data, filename) {
    const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = filename;

    link.click();
}

function getLastRunDate(value) {
    if (value == null) return 'Never'
    else return value.toLocaleString()
}

const endpointToShow = computed(() => {
    if (onlyErrors.value) {
        return prop.group.endpoints.filter((endpoint) => endpoint.hasError);
    }
    else {
        return prop.group.endpoints
    }
})
</script>
<style scoped>
.icon {
    width: 24px;
    height: 24px;
}
</style>