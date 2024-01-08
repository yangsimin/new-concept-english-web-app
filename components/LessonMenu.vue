<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components'

const { lessonIdList, currentLessonId } = defineProps<{
  lessonIdList: number[]
  currentLessonId: number
}>()
const emits = defineEmits(['selectLessonId'])

const isMenuVisible = ref(false)

function onMenuClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.dataset.lesson && Number(target.dataset.lesson) !== currentLessonId) {
    emits('selectLessonId', Number(target.dataset.lesson))
    isMenuVisible.value = false
  }
}
</script>

<template>
  <div
    relative
  >
    <div inline-block @click="isMenuVisible = true">
      <slot />
    </div>
    <Transition>
      <div v-if="isMenuVisible" bg="black/50" fixed bottom-0 left-0 right-0 top-0 z-1 flex items-center justify-center overflow-auto>
        <ol
          v-on-click-outside="() => isMenuVisible = false"
          grid="~ cols-[repeat(auto-fill,minmax(2.5rem,1fr))] gap-1"
          border="2px sky-500" p="x-10 y-4"
          max-w-500px w-70vw rounded bg-white text-sky-500 shadow-sm dark:bg-hex-222
          @click="onMenuClick"
        >
          <li col-span-full text="center xl" font-bold>
            Lesson
          </li>
          <li
            v-for="id in lessonIdList" :key="id"
            :data-lesson="id"
            h-2.5rem cursor-pointer select-none rounded text-center leading-2.5rem transition-200
            :class="{ 'bg-sky-500 text-white': id === currentLessonId, 'hover:bg-sky-400/20': id !== currentLessonId }"
          >
            {{ id % 1000 }}
          </li>
        </ol>
      </div>
    </Transition>
  </div>
</template>

<style scoped>

</style>
