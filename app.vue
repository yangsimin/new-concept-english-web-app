<script setup lang="ts">
import json from '~/assets/data/volume1/1001.json'

const title = json.data[0]
const lines = json.data.slice(1)

const index = ref(0)
const curLine = computed(() => lines[index.value])
</script>

<template>
  <main h-100vh>
    <article flex="~ col" h-full items-center justify-center gap-8 text-4xl font-sans>
      <div>{{ curLine.Sentence_cn }}</div>
      <article border-b="4 solid sky-500">
        <span>
          {{ curLine.Sentence }}
        </span>
      </article>div>
    </article>
  </main>
</template>

<style scoped></style>
