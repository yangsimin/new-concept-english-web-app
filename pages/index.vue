<script setup lang="ts">
import { storageKeyLastLesson } from '~/constants'

const router = useRouter()

function onBookClick(index: number) {
  const cache: Record<string, number> = getLocalStorageJson(storageKeyLastLesson, {})
  router.push({
    path: '/nce',
    query: {
      book: index,
      lessonId: cache[index] ?? index * 1000 + 1,
    },
  })
}
</script>

<template>
  <main
    grid="~ cols-[repeat(2,150px)] rows-[repeat(2,150px)] gap-20px"
    pointer-events-none absolute inset-0 place-content-center
  >
    <UButton
      v-for="index in 4"
      :key="index"
      size="xl"
      pointer-events-auto
      block text-xl
      variant="solid"
      @click="onBookClick(index)"
    >
      {{ index }}
    </UButton>
  </main>
</template>
