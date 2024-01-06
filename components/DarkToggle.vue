<script setup lang="ts">
const color = useColorMode()

function toggleDark() {
  color.value = color.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <button outline-none @click="toggleDark">
    <div icon="carbon-sun" dark-icon="carbon-moon" />
  </button>
</template>
