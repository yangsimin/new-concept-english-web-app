<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components'

const props = defineProps<{
  lessonIdList: number[]
  currentLessonId: number
}>()
const emits = defineEmits(['selectLessonId'])

const { lessonIdList, currentLessonId } = toRefs(props)

const isMenuVisible = ref(false)

function onMenuClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.dataset.lesson && Number(target.dataset.lesson) !== currentLessonId.value) {
    emits('selectLessonId', Number(target.dataset.lesson))
    isMenuVisible.value = false
  }
}
</script>

<template>
  <div
    relative
  >
    <div class="inline-block" @click="isMenuVisible = true">
      <slot />
    </div>
    <Transition>
      <div v-if="isMenuVisible" class="fixed bottom-0 left-0 right-0 top-0 z-1 flex items-center justify-center overflow-auto bg-black/50">
        <ol
          v-on-click-outside="() => isMenuVisible = false"
          class="grid grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))] max-w-[500px] w-[70vw] gap-1 border-2px border-sky-500 rounded bg-white px-10 py-4 text-sky-500 shadow-sm dark:bg-hex-222"
          @click="onMenuClick"
        >
          <li class="col-span-full text-center text-xl font-bold">
            Lesson
          </li>
          <li
            v-for="id in lessonIdList" :key="id"
            :data-lesson="id"
            class="h-[2.5rem] cursor-pointer select-none rounded text-center leading-[2.5rem] transition-200"
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
