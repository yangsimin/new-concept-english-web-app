<script setup lang="ts">
import { appName } from '~/constants'
import '~/assets/main.css'

useHead({
  title: appName,
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage class="container" />
  </NuxtLayout>
</template>

<style>
html,
body,
#__nuxt {
  height: 100vh;
  margin: 0;
  padding: 0;
}

html.dark {
  background: #222;
  color: white;
}

html {
  @apply font-sans;
}
.page-enter-active,
.page-leave-active {
  transition: all 0.3s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(0.3rem);
}
</style>
