<template>
    <section class="section" v-if="!insertFromJson">
        <div class="content">
            <h2>Inserimento Nuovo gruppo di test.</h2>
            <div class="buttons">
                <button v-if="appStore.groups.length > 0" class="tag is-primary" @click="goToReadGroups()">Vedi gruppi
                    Inseriti</button>
                <button class="tag is-primary" @click="switchToJsonFileInput(true)">Importa dati da file JSON</button>
            </div>
        </div>

        <div class="box">
            <div class="fixed-grid has-3-cols ">
                <div class="grid">
                    <div class="field">
                        <label for="" class="label">Nome</label>
                        <input class="input" type="text" placeholder="Nome" v-model="nome" />
                    </div>
                    <span class="field">
                        <label for="" class="label">Url1</label>
                        <input class="input" type="text" placeholder="url1" v-model="url1" />
                    </span>
                    <span class="field">
                        <label for="" class="label">Url2</label>
                        <input class="input" type="text" placeholder="url2" v-model="url2" />
                    </span>
                </div>
            </div>

            <div class="field">
                <label for="" class="label">Endpoint</label>
                <textarea class="input" type="textArea" rows="10" placeholder="Endpoint separati da virgola"
                    style="height: 20%;" v-model="endpoint"></textarea>
            </div>

            <div class="buttons">
                <button class="button is-primary" @click="addGroup">Salva</button>
            </div>
        </div>
    </section>
    <section class="section" v-else>
        <div class="content">
            <h2>Importa gruppi da file JSON</h2>
            <div class="buttons">
                <button v-if="appStore.groups.length > 0" class="tag is-primary" @click="goToReadGroups()">Vedi gruppi
                    Inseriti</button>
                <button class="tag is-primary" @click="switchToJsonFileInput(false)">Inserisci nuovo gruppo
                    manualmente</button>
            </div>
        </div>
        <div class="block">
            <div class="field">
                <label class="label">File JSON di tutti i gruppi</label>
                <div class="control">
                    <input class="input" type="file" placeholder="import JSON" accept="application/json"
                        @change="onMultyGroupsFileChange">
                </div>
            </div>
        </div>
        <div class="block">
            <div class="field">
                <label class="label">File JSON singolo gruppo</label>
                <div class="control">
                    <input class="input" type="file" placeholder="import JSON" accept="application/json"
                        @change="onSingleGroupFileChange">
                </div>
            </div>
        </div>

    </section>
</template>
<script setup>
import { ref } from 'vue'
import { useAppStore } from '../stores/appStores'
//variabili pagina
const nome = ref('');
const url1 = ref('');
const url2 = ref('');
const endpoint = ref('');
const appStore = useAppStore();
const insertFromJson = ref(false);
//TODO -salvataggio gruppo -lettura gruppi
function addGroup() {
    let urls = [];
    urls.push(url1.value);
    urls.push(url2.value);
    let endpointArray = endpoint.value.split(',');
    for (let i = 0; i < endpointArray.length; i++) {
        endpointArray[i] = endpointArray[i].replace(url1.value, '');
        endpointArray[i] = endpointArray[i].replace(url2.value, '');
        endpointArray[i] = endpointArray[i].trim();
    }
    appStore.addGroup(nome.value, urls, endpointArray);
    nome.value = '';
    url1.value = '';
    url2.value = '';
    endpoint.value = '';
    appStore.setStatus('read');
}

function switchToJsonFileInput(value) {
    insertFromJson.value = value;
}

function onMultyGroupsFileChange(e) {
    let files = e.target.files || e.dataTransfer.files;
    if (!files.length) return;
    readMultyGroupsFile(files[0]);
}
function readMultyGroupsFile(file) {
    let reader = new FileReader();
    reader.onload = e => {
        console.log(e.target.result);
        appStore.addAllGroupsDataFrom(e.target.result);
        //let json = JSON.parse(e.target.result);
    };
    reader.readAsText(file);
}

function onSingleGroupFileChange(e) {
    let files = e.target.files || e.dataTransfer.files;
    if (!files.length) return;
    readSingleGroupFile(files[0]);
}
function readSingleGroupFile(file) {
    let reader = new FileReader();
    reader.onload = e => {
        console.log(e.target.result);
        appStore.addSingleGroupDataFrom(e.target.result);
        //let json = JSON.parse(e.target.result);
    };
    reader.readAsText(file);
}

function goToReadGroups() {
    appStore.setStatus('read');
}

</script>