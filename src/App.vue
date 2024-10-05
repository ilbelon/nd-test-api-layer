<script setup>
import GruppiTest from './components/GruppiTest.vue'
import InsertGroup from './components/InsertGroup.vue'
import { useAppStore } from './stores/appStores'

const appStore = useAppStore();

</script>

<template>
  <section class="section">
    <h1 class="title is-1">ND Test Api Layer</h1>
    <p class="subtitle is-5">Verifica che api layer fornisca gli stessi risultati delle vecchie API</p>
  </section>

  <main>
    <InsertGroup v-if="appStore.status == 'insert'" />
    <GruppiTest v-if="appStore.status == 'read'" />
  </main>
</template>

<style scoped></style>
