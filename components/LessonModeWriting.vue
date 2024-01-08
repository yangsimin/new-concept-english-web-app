<script setup lang="ts">
import type { Lesson } from '~/pages/nce.vue'

const props = defineProps<{
  currentLesson: Lesson
}>()
const { currentLesson } = toRefs(props)

const formData = ref<any[]>([])
formData.value = currentLesson.value.sentences.map((sentence) => {
  return {
    isAnswerVisible: false,
    inputText: '',
    sentence,
  }
})
</script>

<template>
  <article grid grid-cols-2 mx-auto min-w-300px w-fit gap-2rem>
    <div v-for="(eachItem, index) of formData" :key="eachItem.sentence.startAt">
      <p flex items-center>
        {{ index + 1 }}. {{ eachItem.sentence.zh }}
        <span ml-2 cursor-pointer icon="carbon-volume-up-filled" />
        <span :icon="eachItem.isAnswerVisible ? 'carbon-view-filled' : ' carbon-view-off-filled'" ml-2 @mouseenter="eachItem.isAnswerVisible = true" @mouseout="eachItem.isAnswerVisible = false" />
      </p>
      <div border-b="2px black" p-1 focus-within-border-b-sky-500>
        <input type="text" w-full outline-none>
      </div>
      <p p-1 :opacity="eachItem.isAnswerVisible ? 100 : 0">
        {{ eachItem.sentence.en }}
      </p>
    </div>
  </article>
  <button class="btn" mx-auto block text-center>
    提交
  </button>
</template>

<style scoped>
</style>
