<template>
    <div class="box">
        <div class="content">
            <h5>Url1: {{ prop.group.url1 }} - Url2: {{ prop.group.url2 }}</h5>
            <div class="buttons">
                <button v-if="!fullTestIsRunning" class="tag is-primary" @click="runTestGroup()">Test Gruppo</button>
                <tag v-else class="tag is-warning">Test running...</tag>

                <button v-if="!fullTestIsRunning" class="tag is-primary" @click="runOnlyErrorsTestGroup()">Test Solo
                    endpoint con errori paginati</button>
                <tag v-else class="tag is-warning">Test running...</tag>

                <button class="tag is-primary" @click="downloadAllData()">Download Json del gruppo</button>
                <button class="tag is-primary" @click="downloadOnlyErrorData()">Download Json degli errori</button>
                <button class="tag is-primary" @click="downloadOnlyErrorDataInNrequestsBlocks()">Download Json degli
                    errori paginati</button>
                <div class="field">
                    <label for="" class="label">Index sottogruppo</label>
                    <input class="input" type="text" placeholder="Nome" v-model="index" />
                </div>
                <button class="tag is-error" @click="splitInGroups()">Separa in più gruppi</button>
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
                        <th><abbr title="R1 Length">R1 Length</abbr></th>
                        <th><abbr title="R2 Length">R2 Length</abbr></th>
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
                        <td class="wrap-content" v-text="JSON.stringify(endpoint.response1).length"></td>
                        <td class="wrap-content" v-text="JSON.stringify(endpoint.response2).length"></td>
                        <td>
                            <div class="buttons">
                                <button v-if="!endpoint.isRunning && !fullTestIsRunning" class="tag is-primary"
                                    @click="runTest(endpoint)">Test</button>
                                <button v-else class="tag">Test running...</button>
                            </div>
                            <button class="tag is-primary" @click="downloadThisData(endpoint)">Download Json di questa
                                risposta</button>
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
import { useAppStore } from '../stores/appStores';
const appStore = useAppStore();
const testTotal = ref(0);
const testDone = ref(0);
const prop = defineProps({
    group: {}
})
const index = ref('');
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
            endpoint.responseObjectEqual = true;
        } else {
            endpoint.responseObjectEqual = _.isEqual(data1, data2);
        }//TODO else controllare oggetto se è uguale
        if (!endpoint.responseEqual) {
            //per salvare spazio salva le risposte solo se risultano diverse
            endpoint.response1 = data1;
            endpoint.response2 = data2;
        }
        if (!(endpoint.responseEqual || endpoint.responseObjectEqual)) {
            endpoint.hasError = true;
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

async function runOnlyErrorsTestGroup() {
    fullTestIsRunning.value = true;
    testTotal.value = prop.group.endpoints.length;
    testDone.value = 0;
    for (let i = 0; i < prop.group.endpoints.length; i++) {
        if (prop.group.endpoints[i].responseEqual) continue;
        await runTest(prop.group.endpoints[i]);
        testDone.value++;
    }

    fullTestIsRunning.value = false;
}


function downloadAllData() {
    downloadDataAsJson(prop.group, prop.group.name + '.json');
}
function downloadOnlyErrorData() {
    let dataToExport = [];
    for (let i = 0; i < prop.group.endpoints.length; i++) {
        if (prop.group.endpoints[i].hasError) {
            dataToExport.push(prop.group.endpoints[i]);
        }
    }
    downloadDataAsJson(dataToExport, prop.group.name + '_ERROR.json');
}

function downloadOnlyErrorDataInNrequestsBlocks() {
    let page = 0;
    let dataToExport = [];
    for (let i = 0; i < prop.group.endpoints.length; i++) {
        if (prop.group.endpoints[i].hasError) {
            dataToExport.push(prop.group.endpoints[i]);
            if (dataToExport.length >= 250) {
                downloadDataAsJson(dataToExport, prop.group.name + '_ERROR_page' + page + '.json');
                dataToExport = [];
                page++;
            }
        }
    }
}

function downloadDataAsJson(data, filename) {
    const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = filename;

    link.click();
}

function downloadThisData(endpoint) {
    downloadDataAsJson(endpoint, prop.group.name + '_' + endpoint.endpoint + '.json')
}

function getLastRunDate(value) {
    if (value == null) return 'Never'
    else return value.toLocaleString()
}

function splitInGroups() {
    let indexNumber = Number(index.value);
    let objectToDownload = {};
    objectToDownload.name = prop.group.name + '_' + indexNumber + '_Errors';
    objectToDownload.url1 = prop.group.url1;
    objectToDownload.url2 = prop.group.url2;
    objectToDownload.endpoints = [];
    let end = false;
    let i = 0;
    let lastIndex = 0;
    while (end || i < 50) {
        let thisIndex = indexNumber + i;
        console.log(thisIndex);
        if (prop.group.endpoints[thisIndex] == undefined || prop.group.endpoints[thisIndex] == null) {
            end = true;
        } else {
            if (prop.group.endpoints[thisIndex].hasError) {
                objectToDownload.endpoints.push(prop.group.endpoints[thisIndex]);
                i++;
                lastIndex = thisIndex;
            }
        }
    }
    downloadDataAsJson(objectToDownload, objectToDownload.name + '_' + lastIndex + '.json');
}

function getRespPreview(value) {
    if (value == undefined || value == null) return '';
    else {
        if (value.length > 15) {
            return value.substring(0, 15);
        } else {
            return value;
        }
    }
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

.wrap-content {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    max-width: 150px;
}
</style>