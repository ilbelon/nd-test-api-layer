<template>
    <img @click="test()" v-if="prop.check" alt="true" class="icon" src="../asset/small-check-mark-icon.png" />
    <img v-else alt="false" class="icon" src="../asset/cross-icon.png" />
</template>

<script setup>
const prop = defineProps(['check'])
function test() {
    console.log(prop.check);
}
</script>

<style scoped>
.icon {
    width: 24px;
    height: 24px;
}
</style>