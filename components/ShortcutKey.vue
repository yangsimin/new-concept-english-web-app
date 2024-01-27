<script setup lang="ts">
const props = defineProps<{
  keyFnMap: Record<string, { name: string, fn: Function }>
}>()
const { keyFnMap } = toRefs(props)

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})

function onKeyDown(event: KeyboardEvent) {
  const key = event.key
  if (keyFnMap.value[key]) {
    keyFnMap.value[key].fn()
  }
}
</script>

<template>
  <Teleport to="body">
    <div gap="x-10 y-4" fixed bottom-0 left-0 right-0 flex flex-wrap items-center justify-center bg-sky-100 py-4 dark:bg-sky-800>
      <div v-for="({ name }, key) in keyFnMap" :key="key">
        <span text="center white" mr-2 inline-block rounded bg-sky-500 px-2>{{ key }}</span>
        {{ name }}
      </div>
    </div>
  </Teleport>
</template>

<style scoped>

</style>
