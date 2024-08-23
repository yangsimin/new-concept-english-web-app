<script setup lang="ts">
const colorMode = useColorMode()
const isDark = computed({
  get() {
    return colorMode.value === 'dark'
  },
  set() {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  },
})
</script>

<template>
  <UButton outline-none variant="ghost" color="gray" @click="isDark = !isDark">
    <div icon="carbon-sun" dark-icon="carbon-moon" />
  </UButton>
</template>
