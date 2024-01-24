<script setup lang="ts">
import * as Diff from 'diff'
import type { MessageType } from './MessageBox.vue'
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

const storageKey = `nce-lessonId-${currentLesson.value.id}`
const { formData, isSubmitted, isAllVisible } = toRefs(useLocalStorage(storageKey, {
  formData: [] as SentenceInfo[],
  isSubmitted: false,
  isAllVisible: false,
}).value)

const messageBoxProps = reactive({
  visible: false,
  message: '',
  type: 'info' as MessageType,
  html: false,
})
const { copy: copyToClipboard } = useClipboard({ legacy: true })

const keyFnMap: Record<string, { name: string, fn: Function }> = {
  'h': {
    name: '上一课',
    fn: () => { emits('prevLesson') },
  },
  'l': {
    name: '下一课',
    fn: () => { emits('nextLesson') },
  },
  'v': {
    name: '显示/隐藏答案',
    fn: () => { isAllVisible.value = !isAllVisible.value },
  },
  'z': {
    name: '重置',
    fn: onClear,
  },
  'enter': {
    name: '提交',
    fn: () => {},
  },
  'shift+enter': {
    name: '提交所有',
    fn: () => {},
  },
  'Tab': {
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
}

if (!formData.value.length) {
  formData.value = currentLesson.value.sentences.map((sentence) => {
    return {
      isAnswerVisible: false,
      inputText: '',
      sentence,
    }
  })
}

watch(isAllVisible, () => {
  formData.value = formData.value.map((item) => {
    item.isAnswerVisible = isAllVisible.value
    return item
  })
}, { immediate: true })

function onSubmit() {
  formData.value = formData.value.map((item) => {
    item.diffChanges = checkResult(item)
    return item
  })
  isSubmitted.value = true
  isAllVisible.value = true
}

function onClear() {
  isSubmitted.value = false
  isAllVisible.value = false
  formData.value = formData.value.map((item) => {
    item.inputText = ''
    item.diffChanges = []
    return item
  })
}

function onSubmitSingle(i: SentenceInfo) {
  formData.value = formData.value.map((item) => {
    if (i.sentence.zh === item.sentence.zh) {
      item.diffChanges = checkResult(item)
      item.isAnswerVisible = true
    }
    return item
  })
}

function checkResult(item: SentenceInfo): Diff.Change[] {
  return Diff.diffWords(item.inputText.trim(), item.sentence.en.trim())
}

async function copySentencePrompt({ sentence, inputText }: SentenceInfo) {
  const promptTemplate = `
  你扮演一位资深的英语教育者，请看下面三段文字：

    1. ${sentence.zh}。
    2. ${inputText}
    3. ${sentence.en}

  第一句,是中文原文。
  第二句,是我所翻译的英文。
  第三句,是新概念教材的英语原文。

  先丝毫不修改地重复这三句话，然后对比我的翻译和新概念的原文的差异，对差异点、薄弱点和建议这三个维度进行分析和阐述，并指导我改进。最后，给出你认为更好更地道的英文表达方式。`

  await copyToClipboard(promptTemplate)

  const url = 'https://tongyi.aliyun.com/qianwen/'

  toast({
    message: `已拷贝，请前往 <a 
          href="${url}" target="_blank" 
          style="text-decoration:underline; margin:0 4px;"
        >《通义千问》</a>提问
    `,
    type: 'success',
    duration: 3000,
    html: true,
  })
}

function toast({ message, duration = 1000, type = 'info', html = false }: { message: string, duration?: number, type?: MessageType, html?: boolean }) {
  messageBoxProps.message = message
  messageBoxProps.type = type
  messageBoxProps.visible = true
  messageBoxProps.html = html
  setTimeout(() => {
    messageBoxProps.visible = false
  }, duration)
}
</script>

<template>
  <article grid grid-cols-1 mx-auto min-w-300px w-max gap-2rem text-lg>
    <div v-for="(eachItem, index) of formData" :key="eachItem.sentence.startAt">
      <div flex items-center justify-between>
        {{ index + 1 }}. {{ eachItem.sentence.zh }}
        <div mx-2 flex items-center gap-2>
          <span
            :icon="eachItem.isAnswerVisible ? 'carbon-view-filled' : ' carbon-view-off-filled'"
            @mouseenter="!isSubmitted && (eachItem.isAnswerVisible = true)"
            @mouseout="!isSubmitted && (eachItem.isAnswerVisible = false)"
          />
          <span icon="carbon-chat-bot" cursor-pointer title="复制提示词" @click="copySentencePrompt(eachItem)" />
        </div>
      </div>
      <div border-b="2px black" pl-1 focus-within-border-b-sky-500>
        <input
          v-model="eachItem.inputText"
          type="text"
          w-full
          outline-none
          @keydown.enter.exact="onSubmitSingle(eachItem)"
          @keydown.tab="keyFnMap.Tab.fn"
          @keydown.stop.exact
          @keydown.enter.shift="onSubmit"
        >
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
  <footer my-10 flex flex-col items-center justify-center gap-4>
    <div space-x-4>
      <button class="btn-primary" @click="onSubmit">
        提交
      </button>
      <button class="btn-primary" @click="isAllVisible = !isAllVisible">
        {{ isAllVisible ? '隐藏' : '显示' }}
      </button>
      <button class="btn-primary" @click="onClear">
        重置
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
  <MessageBox v-bind="messageBoxProps" />
  <ShortcutKey :key-fn-map="keyFnMap" />
</template>

<style scoped>
</style>
