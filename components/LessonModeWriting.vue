<script setup lang="ts">
import type { Lesson, Sentence } from '~/pages/nce.vue'

interface SentenceInfo {
  isAnswerVisible: boolean
  inputText: string
  sentence: Sentence
  status: 'pass' | 'fail' | 'unknown'
}

const props = defineProps<{
  currentLesson: Lesson
}>()

const statusColor: Record<SentenceInfo['status'], string> = {
  pass: 'text-green-500',
  fail: 'text-red-500',
  unknown: '',
}

const { currentLesson } = toRefs(props)

const formData = ref<SentenceInfo[]>([])
const isSubmited = ref(false)

watchEffect(() => {
  formData.value = currentLesson.value.sentences.map((sentence) => {
    return {
      isAnswerVisible: false,
      inputText: '',
      sentence,
      status: 'unknown',
    }
  })
})

function onSubmit() {
  isSubmited.value = true
  formData.value = formData.value.map((item) => {
    item.isAnswerVisible = true
    item.status = checkResult(item)
    return item
  })
}

function onReset() {
  isSubmited.value = false
  formData.value = formData.value.map((item) => {
    item.isAnswerVisible = false
    return item
  })
}

function onClear() {
  isSubmited.value = false
  formData.value = formData.value.map((item) => {
    item.isAnswerVisible = false
    item.inputText = ''
    item.status = 'unknown'
    return item
  })
}

function checkResult(item: SentenceInfo): SentenceInfo['status'] {
  if (item.inputText.trim() === item.sentence.en.trim()) {
    return 'pass'
  }
  else {
    return 'fail'
  }
}
</script>

<template>
  <article grid grid-cols-1 mx-auto min-w-300px w-fit gap-2rem lg:grid-cols-2>
    <div v-for="(eachItem, index) of formData" :key="eachItem.sentence.startAt">
      <p flex items-center>
        {{ index + 1 }}. {{ eachItem.sentence.zh }}
        <span
          :icon="eachItem.isAnswerVisible ? 'carbon-view-filled' : ' carbon-view-off-filled'" ml-2
          @mouseenter="!isSubmited && (eachItem.isAnswerVisible = true)"
          @mouseout="!isSubmited && (eachItem.isAnswerVisible = false)"
        />
      </p>
      <div border-b="2px black" p-1 focus-within-border-b-sky-500>
        <input v-model="eachItem.inputText" type="text" w-full outline-none>
      </div>
      <p p-1 :opacity="eachItem.isAnswerVisible ? 100 : 0" :class="[statusColor[eachItem.status]]">
        {{ eachItem.sentence.en }}
      </p>
    </div>
  </article>
  <footer flex justify-center gap-4>
    <button class="btn-primary" @click="onSubmit">
      提交
    </button>
    <button class="btn-primary" @click="onReset">
      隐藏
    </button>
    <button class="btn-primary" @click="onClear">
      清除
    </button>
  </footer>
</template>

<style scoped>
</style>
