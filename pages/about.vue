<script lang="ts" setup>
import json from '~/assets/data/volume1/1001.json'
console.log(json)
</script>
<template>
  <section>
    <p>This page will be displayed at the /about route.</p>
    <p>{{ json }}</p>
  </section>
</template>
