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
  <div>
    <UCard>
      <div class="mt-4">
        <LessonWritingModeSentences ref="sentencesWritingRef" v-model="formData" />
      </div>

      <template #footer>
        <div class="py-4">
          <div v-if="sentencesWritingRef" class="flex justify-center gap-2 mb-4">
            <UButton class="w-32" block color="primary" variant="solid" @click="keyFnMap.enter.fn">
              提交
            </UButton>
            <UButton class="w-32" block color="gray" variant="outline" @click="keyFnMap.v.fn">
              隐藏
            </UButton>
            <UButton class="w-32" block color="gray" variant="outline" @click="keyFnMap.z.fn">
              重置
            </UButton>
          </div>
          <div class="flex justify-center gap-2">
            <UButton class="w-32" block color="primary" variant="outline" @click="keyFnMap.h.fn">
              上一课
            </UButton>
            <UButton class="w-32" block color="primary" variant="outline" @click="keyFnMap.l.fn">
              下一课
            </UButton>
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>

<style scoped>
</style>
