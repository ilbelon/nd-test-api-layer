<template>
    <div class="box">
        <div class="content">
            <h5>Url1: {{ prop.group.url1 }} - Url2: {{ prop.group.url2 }}</h5>
            <div class="buttons">
                <button v-if="!fullTestIsRunning" class="tag is-primary" @click="runTestGroup()">Test Gruppo</button>
                <tag v-else class="tag is-warning">Test running...</tag>
                <button v-if="!fullTestIsRunning" class="tag is-primary" @click="runOnlyErrorsTestGroup()">Test Gruppo
                    solo mancanti</button>
                <button v-if="!fullTestIsRunning" class="tag is-primary" @click="runCheckCallBackResponses()">Test
                    callback</button>
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
            <div class="block">
                <h6>Trovati {{ numberOfEndpointsWithError }} errori su {{ numberOfEndpoints }} totali</h6>
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
                        <th><abbr title="R1-R2">R1-R2</abbr></th>
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
                        <td v-if="endpoint.response1 != undefined && endpoint.response1 != null" class="wrap-content"
                            v-text="JSON.stringify(endpoint.response1).length"></td>
                        <td v-else></td>
                        <td v-if="endpoint.response2 != undefined && endpoint.response2 != null" class="wrap-content"
                            v-text="JSON.stringify(endpoint.response2).length"></td>
                        <td v-else></td>
                        <td v-if="endpoint.response1 != undefined && endpoint.response1 != null && endpoint.response2 != undefined && endpoint.response2 != null"
                            class="wrap-content"
                            v-text="JSON.stringify(endpoint.response1).length - JSON.stringify(endpoint.response2).length">
                        </td>
                        <td v-else></td>
                        <td>
                            <div class="buttons">
                                <button v-if="!endpoint.isRunning" class="tag is-primary"
                                    @click="runTest(endpoint)">Test</button>
                                <button v-else class="tag">Test running...</button>
                                <button v-if="!endpoint.isRunning" class="tag is-primary"
                                    @click="checkCallBack(endpoint)">Test
                                    callback</button>
                                <button class="tag is-primary" @click="downloadThisData(endpoint)">Json
                                    risposta</button>
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

    let data1String = await response1.text();
    let data2String = await response2.text();

    let isJson = true;
    let data1 = null;
    // await JSON.parse(data1String).catch((err) => {
    //     isJson = false;
    //     console.error(err);
    // });
    try {
        data1 = await JSON.parse(data1String)
    }
    catch (err) {
        isJson = false;
        console.error(err);
    }
    let data2 = null;
    // = await JSON.parse(data2String).catch((err) => {
    //     isJson = false;
    //     console.error(err);
    // });
    try {
        data2 = await JSON.parse(data2String)
    }
    catch (err) {
        isJson = false;
        console.error(err);
    }
    endpoint.responseCode1 = response1.status;
    endpoint.responseCode2 = response2.status;

    if (response1.status.toString()[0] != '2' || response2.status.toString()[0] != '2') {
        endpoint.responseEqual = false;
        endpoint.responseObjectEqual = false;
        if (isJson) {
            endpoint.response1 = data1;
            endpoint.response2 = data2;
        } else {
            endpoint.response1 = data1String;
            endpoint.response2 = data2String;
        }

        endpoint.hasError = true;
    } else {
        if (isJson) {
            console.log('confronto json');
            endpoint.responseEqual = JSON.stringify(data1) === JSON.stringify(data2);
        } else {
            console.log('confronto stringhe');
            console.log(endpoint.endpoint);
            endpoint.responseEqual = data1String === data2String;
        }
        if (endpoint.responseEqual) {
            endpoint.responseObjectEqual = true;
        } else {
            if (isJson) {
                endpoint.responseObjectEqual = _.isEqual(data1, data2);
            } else {
                endpoint.responseObjectEqual = false;
            }
        }//TODO else controllare oggetto se è uguale
        if (!endpoint.responseEqual) {
            //per salvare spazio salva le risposte solo se risultano diverse
            if (isJson) {
                endpoint.response1 = data1;
                endpoint.response2 = data2;
            } else {
                endpoint.response1 = data1String;
                endpoint.response2 = data2String;
            }

        } else {
            endpoint.response1 = null;
            endpoint.response2 = null;
            // if (isJson) {
            //     endpoint.response1 = data1;
            //     endpoint.response2 = data2;
            // } else {
            //     endpoint.response1 = data1String;
            //     endpoint.response2 = data2String;
            // }
        }
        if (!endpoint.responseEqual) {
            endpoint.hasError = true;
        } else {
            endpoint.hasError = false;
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

async function runCheckCallBackResponses() {
    fullTestIsRunning.value = true;
    testTotal.value = prop.group.endpoints.length;
    testDone.value = 0;
    for (let i = 0; i < prop.group.endpoints.length; i++) {
        await checkCallBack(prop.group.endpoints[i]);
        testDone.value++;
    }

    fullTestIsRunning.value = false;
}

async function checkCallBack(endpoint) {
    if (!endpoint.hasError) return;
    if (endpoint.response1 != undefined && endpoint.response1 != null && endpoint.response2 != undefined && endpoint.response2 != null && endpoint.response1.includes('MY_CALLBACK') && endpoint.response2.includes('MY_CALLBACK')) {
        let response1JsonString = endpoint.response1.substring(12, endpoint.response1.length - 1);
        let response2JsonString = endpoint.response2.substring(12, endpoint.response2.length - 1);
        console.log(response1JsonString);
        console.log(response2JsonString);
        let data1;
        let data2;
        try {
            data1 = await JSON.parse(response1JsonString)
        }
        catch (err) {
            console.error(err);
            return;
        }
        try {
            data2 = await JSON.parse(response2JsonString)
        }
        catch (err) {
            console.error(err);
            return;
        }
        endpoint.responseObjectEqual = JSON.stringify(data1) === JSON.stringify(data2);
        if (!endpoint.responseEqual) {
            endpoint.hasError = true;
        } else {
            endpoint.hasError = false;
        }
    }
}


async function runOnlyErrorsTestGroup() {
    fullTestIsRunning.value = true;
    testTotal.value = prop.group.endpoints.length;
    testDone.value = 0;
    for (let i = 0; i < prop.group.endpoints.length; i++) {
        if (prop.group.endpoints[i].lastRunDate == null) {
            await runTest(prop.group.endpoints[i]);
        }
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

function downloadThisData(endpoint) {
    downloadDataAsJson(endpoint, prop.group.name + '_' + endpoint.endpoint + '.json')
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

const numberOfEndpointsWithError = computed(() => {
    return prop.group.endpoints.filter((endpoint) => endpoint.hasError).length;
})

const numberOfEndpoints = computed(() => {
    return prop.group.endpoints.length;
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