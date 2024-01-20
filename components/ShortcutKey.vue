<script setup lang="ts">
const { keyFnMap } = defineProps<{
  keyFnMap: Record<string, { name: string, fn: Function }>
}>()

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})

function onKeyDown(event: KeyboardEvent) {
  const key = event.key
  if (keyFnMap[key]) {
    keyFnMap[key].fn()
  }
}
</script>

<template>
  <div fixed bottom-0 left-0 right-0 my-4 flex items-center justify-center gap-10 opacity-80>
    <div v-for="({ name }, key) in keyFnMap" :key="key">
      <span text="center white" mr-2 inline-block w-30px rounded bg-sky-500>{{ key }}</span>{{ name }}
    </div>
  </div>
</template>

<style scoped>

</style>
