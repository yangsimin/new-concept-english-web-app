<script setup lang="ts"></script>

<template>
  <NuxtLayout>
    <NuxtPage class="container"/>
  </NuxtLayout>
</template>

<style>
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
