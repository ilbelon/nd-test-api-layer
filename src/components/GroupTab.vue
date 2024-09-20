<template>
    <li :class="appStore.activeGroup == prop.group.name ? 'is-active' : ''">
        <a>{{ prop.group.name }}</a>
    </li>
</template>
<script setup>
const prop = defineProps({
    group: {}
})

</script>