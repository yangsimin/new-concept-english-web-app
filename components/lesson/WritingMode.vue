<script setup lang="ts">
import type { Lesson, SentenceInfo } from '~/types/lesson'
import type WritingModeSentences from '~/components/lesson/WritingModeSentences.vue'

const props = defineProps<{
  currentLesson: Lesson
}>()

const emits = defineEmits(['nextLesson', 'prevLesson'])
const { currentLesson } = toRefs(props)

const sentencesWritingRef = ref<InstanceType<typeof WritingModeSentences>>()
const storageKey = `nce-lessonId-${currentLesson.value.id}`
const { formData } = toRefs(useLocalStorage(storageKey, {
  formData: [] as SentenceInfo[],
}).value)

const keyFnMap = ref<Record<string, { name: string, fn: () => void }>>({
  h: {
    name: '上一课',
    fn: () => { emits('prevLesson') },
  },
  l: {
    name: '下一课',
    fn: () => { emits('nextLesson') },
  },
})

onMounted(() => {
  if (!sentencesWritingRef.value) {
    return
  }
  keyFnMap.value = {
    ...keyFnMap.value,
    ...sentencesWritingRef.value.keyFnMap,
    enter: {
      name: '提交',
      fn: sentencesWritingRef.value.keyFnMap['shift+enter'].fn,
    },
  }
})

if (!formData.value.length) {
  formData.value = currentLesson.value.sentences.map((sentence) => {
    return {
      isAnswerVisible: false,
      isMarked: false,
      inputText: '',
      sentence,
      audioUrl: currentLesson.value.audioUrl,
    }
  })
}
</script>

<template>
  <LessonWritingModeSentences ref="sentencesWritingRef" v-model="formData" />
  <footer class="my-10 flex flex-col items-center justify-center gap-4">
    <div v-if="sentencesWritingRef" space-x-4>
      <button class="btn-primary" @click="keyFnMap.enter.fn">
        提交
      </button>
      <button class="btn-primary" @click="keyFnMap.v.fn">
        隐藏
      </button>
      <button class="btn-primary" @click="keyFnMap.z.fn">
        重置
      </button>
    </div>
    <div space-x-4>
      <button class="btn-primary" @click="keyFnMap.h.fn">
        上一课
      </button>
      <button class="btn-primary" @click="keyFnMap.l.fn">
        下一课
      </button>
    </div>
  </footer>
  <!-- <ShortcutKey :key-fn-map="keyFnMap" /> -->
</template>

<style scoped>
</style>
