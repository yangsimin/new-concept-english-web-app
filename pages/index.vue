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
  <main class="main">
    <div v-for="index in 4" :key="index" class="book" @click="onBookClick(index)">
      <span>
        {{ index }}
      </span>
    </div>
  </main>
</template>

<style scoped>
.main {
  display: grid;
  grid-template-columns: repeat(2, 150px);
  grid-template-rows: repeat(2, 150px);
  gap: 20px;
  justify-content: center;
  align-content: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

.book {
  @apply flex justify-center items-center
  bg-sky-500 text-white text-center text-4xl
  cursor-pointer rounded;
}
</style>
