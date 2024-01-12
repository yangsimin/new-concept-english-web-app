<script setup lang="ts">
import * as Diff from 'diff'
import { copyToClipboard } from '~/composables/utils'
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

const emits = defineEmits(['nextLesson', 'prevLesson'])
const { currentLesson } = toRefs(props)

const formData = ref<SentenceInfo[]>([])
const isSubmited = ref(false)
const [isAllVisible, toggleVisible] = useToggle(false)

const keyFnMap: Record<string, { name: string, fn: Function }> = {
  Tab: {
    name: '下一句',
    fn: () => {
      setTimeout(() => {
        const activeEl = window.document.activeElement
        if (!activeEl) {
          return
        }
        const { y } = activeEl.getBoundingClientRect()
        if (y > window.innerHeight * 0.4) {
          window.scrollBy({
            top: y - window.innerHeight / 4,
            behavior: 'smooth',
          })
        }
      })
    },
  },
  Enter: {
    name: '提交',
    fn: () => {
      onSubmit()
    },
  },
}

addListenKeyDown()

watchEffect(() => {
  formData.value = currentLesson.value.sentences.map((sentence) => {
    return {
      isAnswerVisible: false,
      inputText: '',
      sentence,
    }
  })
  isSubmited.value = false
  isAllVisible.value = false
})

watch(isAllVisible, () => {
  formData.value = formData.value.map((item) => {
    item.isAnswerVisible = isAllVisible.value
    return item
  })
})

function onSubmit() {
  formData.value = formData.value.map((item) => {
    item.diffChanges = checkResult(item)
    return item
  })
  isSubmited.value = true
  isAllVisible.value = true
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

function addListenKeyDown() {
  const onKeyDown = (event: KeyboardEvent) => {
    const key = event.key
    if (keyFnMap[key]) {
      keyFnMap[key].fn()
    }
  }
  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
  })
  onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown)
  })
}

async function copySentencePrompt({ sentence, inputText }: SentenceInfo) {
  const promptTemplate = `
  请你扮演一位资深的英语教育者，下面请看下面三段文字：

    1. ${sentence.zh}。
    2. ${inputText}
    3. ${sentence.en}

  第一句是需要被翻译成英文的中文句子。
  第二句是我所翻译的英文。
  第三句是新概念教材的英语原文。

  请对比我的翻译和新概念的原文的差异，分析差异点，并告诉我我的英语哪些方面薄弱，并指导我改进`

  await copyToClipboard(promptTemplate)

  const url = 'https://tongyi.aliyun.com/qianwen/'
  // eslint-disable-next-line no-alert
  alert(`已拷贝，请前往《通义千问》提问 ${url}`)
}
</script>

<template>
  <article grid grid-cols-2 mx-auto min-w-300px w-max gap-2rem text-lg lt-xl:grid-cols-1>
    <div v-for="(eachItem, index) of formData" :key="eachItem.sentence.startAt">
      <div flex items-center>
        {{ index + 1 }}. {{ eachItem.sentence.zh }}
        <div ml-2 flex items-center gap-2>
          <span
            :icon="eachItem.isAnswerVisible ? 'carbon-view-filled' : ' carbon-view-off-filled'"
            @mouseenter="!isSubmited && (eachItem.isAnswerVisible = true)"
            @mouseout="!isSubmited && (eachItem.isAnswerVisible = false)"
          />
          <span icon="carbon-chat-bot" cursor-pointer title="复制提示词" @click="copySentencePrompt(eachItem)" />
        </div>
      </div>
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
  <footer mt-10 flex flex-col items-center justify-center gap-4>
    <div space-x-4>
      <button class="btn-primary" @click="onSubmit">
        提交
      </button>
      <button class="btn-primary" @click="toggleVisible()">
        {{ isAllVisible ? '隐藏' : '显示' }}
      </button>
      <button class="btn-primary" @click="onClear">
        清除
      </button>
    </div>
    <div space-x-4>
      <button class="btn-primary" @click="emits('prevLesson')">
        上一课
      </button>
      <button class="btn-primary" @click="emits('nextLesson')">
        下一课
      </button>
    </div>
  </footer>
</template>

<style scoped>
</style>
