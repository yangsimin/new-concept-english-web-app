<script setup lang="ts">
import * as Diff from 'diff'
import type { Lesson, Sentence } from '~/pages/nce.vue'

interface SentenceInfo {
  isAnswerVisible: boolean
  inputText: string
  sentence: Sentence
  diffChanges?: Diff.Change[]
}

const props = defineProps<{
  currentLesson: Lesson
}>()

const { currentLesson } = toRefs(props)

const formData = ref<SentenceInfo[]>([])
const isSubmited = ref(false)
const [isAllVisible, toggleVisible] = useToggle(false)

watchEffect(() => {
  formData.value = currentLesson.value.sentences.map((sentence) => {
    return {
      isAnswerVisible: false,
      inputText: '',
      sentence,
    }
  })
})

watch(isAllVisible, () => {
  formData.value = formData.value.map((item) => {
    item.isAnswerVisible = isAllVisible.value
    return item
  })
})

function onSubmit() {
  isSubmited.value = true
  isAllVisible.value = true
  formData.value = formData.value.map((item) => {
    item.diffChanges = checkResult(item)
    return item
  })
}

function onClear() {
  isSubmited.value = false
  isAllVisible.value = false
  formData.value = formData.value.map((item) => {
    item.inputText = ''
    item.diffChanges = []
    return item
  })
}

function checkResult(item: SentenceInfo): Diff.Change[] {
  return Diff.diffWords(item.inputText.trim(), item.sentence.en.trim())
}
</script>

<template>
  <article grid grid-cols-2 mx-auto min-w-300px w-max gap-2rem text-lg lt-xl:grid-cols-1>
    <div v-for="(eachItem, index) of formData" :key="eachItem.sentence.startAt">
      <p flex items-center>
        {{ index + 1 }}. {{ eachItem.sentence.zh }}
        <span
          :icon="eachItem.isAnswerVisible ? 'carbon-view-filled' : ' carbon-view-off-filled'"
          ml-2
          @mouseenter="!isSubmited && (eachItem.isAnswerVisible = true)"
          @mouseout="!isSubmited && (eachItem.isAnswerVisible = false)"
        />
      </p>
      <div border-b="2px black" pl-1 focus-within-border-b-sky-500>
        <input v-model="eachItem.inputText" type="text" w-full outline-none>
      </div>
      <div pl-1 pr-20 :opacity="eachItem.isAnswerVisible ? 100 : 0">
        <p v-if="!eachItem.diffChanges?.length">
          {{ eachItem.sentence.en }}
        </p>
        <p v-else>
          <span
            v-for="(change, i) in eachItem.diffChanges" :key="i"
            :class="{ 'text-green-500': !change.removed, 'text-red-500': change.added }"
          >
            {{ change.removed ? '' : change.value }}
          </span>
        </p>
      </div>
    </div>
  </article>
  <footer mt-10 flex justify-center gap-4>
    <button class="btn-primary" @click="onSubmit">
      提交
    </button>
    <button class="btn-primary" @click="toggleVisible()">
      {{ isAllVisible ? '隐藏' : '显示' }}
    </button>
    <button class="btn-primary" @click="onClear">
      清除
    </button>
  </footer>
</template>

<style scoped>
</style>
