<script setup lang="ts">
import * as Diff from 'diff'
import type { MessageType } from './MessageBox.vue'
import type { Sentence } from '~/pages/nce.vue'

export interface SentenceInfo {
  isAnswerVisible: boolean
  isMarked: boolean
  inputText: string
  sentence: Sentence
  diffChanges?: Diff.Change[]
  audioUrl: string
}

const emits = defineEmits<{
  (e: 'markClick', value: { sentence: Sentence, isMarked: boolean }): void
}>()
const formData = defineModel<SentenceInfo[]>({ default: [] })
const keyFnMap: Record<string, { name: string, fn: Function }> = {
  'v': {
    name: '隐藏答案',
    fn: () => {
      setAllVisible(false)
    },
  },
  'z': {
    name: '重置',
    fn: clear,
  },
  'enter': {
    name: '提交',
    fn: () => {},
  },
  'shift+enter': {
    name: '提交全部',
    fn: submit,
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
          })
        }
      })
    },
  },
  'j': {
    name: '下移',
    fn: throttle(() => {
      window.scrollBy({
        top: 300,
      })
    }, 200),
  },
  'k': {
    name: '上移',
    fn: throttle(() => {
      window.scrollBy({
        top: -300,
      })
    }, 200),
  },
}

const { messageBoxProps, copySentencePrompt } = usePromptIcon()
const { playSound, pauseSound } = useSound()

onUnmounted(() => {
  pauseSound()
})

function submitSingle(i: SentenceInfo) {
  formData.value = formData.value.map((item) => {
    if (i.sentence.zh === item.sentence.zh) {
      item.diffChanges = checkResult(item)
      item.isAnswerVisible = true
    }
    return item
  })
  playSound(i)
}

function submit() {
  formData.value = formData.value.map((item) => {
    item.diffChanges = checkResult(item)
    return item
  })
  setAllVisible(true)
}

function clearSingle(i: SentenceInfo) {
  formData.value = formData.value.map((item) => {
    if (i.sentence.zh === item.sentence.zh) {
      item.inputText = ''
      item.diffChanges = []
      item.isAnswerVisible = false
    }
    return item
  })
}

function clear() {
  setAllVisible(false)
  formData.value = formData.value.map((item) => {
    item.inputText = ''
    item.diffChanges = []
    item.isAnswerVisible = false
    return item
  })
}

function setAllVisible(visible: boolean) {
  formData.value = formData.value.map((item) => {
    item.isAnswerVisible = visible
    return item
  })
}

function checkResult(item: SentenceInfo): Diff.Change[] {
  return Diff.diffWords(item.inputText.trim(), item.sentence.en.trim())
}

function usePromptIcon() {
  const { copy: copyToClipboard } = useClipboard({ legacy: true })
  const messageBoxProps = reactive({
    visible: false,
    message: '',
    type: 'info' as MessageType,
    html: false,
  })
  async function copySentencePrompt({ sentence, inputText }: SentenceInfo) {
    const promptTemplate = `
  你扮演一位资深的英语教育者，请看下面三段文字：

    1. ${sentence.zh}。
    2. ${inputText}
    3. ${sentence.en}

  第一句,是中文原文。
  第二句,是我所翻译的英文。
  第三句,是新概念教材的英语原文。

  并做一下几件事
  1. 丝毫不修改地重复这三句话
  2. 对比我的翻译和新概念的原文的差异，需要逐词对比，对有差异的词组，进行对比分析差异，并以表格的形式输出。
  3. 进行整体表达的对比，对差异点、薄弱点和建议这三个维度进行分析和阐述，并在尽量不修改原文正确用词的基础上更正我的表达。
  4. 给出你认为更好更地道的英文表达方式。`

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

  return {
    messageBoxProps,
    copySentencePrompt,
  }
}

function useSound() {
  const { playAudio, pauseAudio, updateSource } = useAudio()

  function playSound(i: SentenceInfo) {
    if (i.audioUrl) {
      updateSource(i.audioUrl)
      playAudio(i.sentence.startAt, i.sentence.stopAt)
    }
  }

  return {
    playSound,
    pauseSound: pauseAudio,
  }
}

function handleMarkClick(info: SentenceInfo) {
  info.isMarked = !info.isMarked
  emits('markClick', { sentence: info.sentence, isMarked: info.isMarked })
}

defineExpose({
  keyFnMap,
})
</script>

<template>
  <article left="[50%]" translate-x="[-50%]" relative grid grid-cols-1 min-w-300px w-max gap-2rem text-lg>
    <div v-for="(eachItem, index) of formData" :key="eachItem.sentence.startAt">
      <div flex items-center justify-between>
        <slot name="index" :index="index" :sentence-info="eachItem">
          {{ index + 1 }}.
        </slot>
        <div mr-auto>
          {{ eachItem.sentence.zh }}
        </div>
        <div mx-2 flex items-center gap-2>
          <span
            icon="carbon-clean"
            cursor-pointer
            title="清除文本(ctrl+r)"
            @click="clearSingle(eachItem)"
          />
          <span
            icon="carbon-volume-up-filled"
            cursor-pointer
            title="播放语音"
            @click="playSound(eachItem)"
          />
          <span
            :icon="eachItem.isMarked ? 'carbon-star-filled' : 'carbon-star'" cursor-pointer title="加入收藏(ctrl+m)"
            :class="eachItem.isMarked ? 'text-yellow' : ''"
            @click="handleMarkClick(eachItem)"
          />
          <span
            icon="carbon-chat-bot" cursor-pointer title="复制提示词(ctrl+p)"
            @click="copySentencePrompt(eachItem)"
          />
        </div>
      </div>
      <div border-b="2px black" pl-1 focus-within-border-b-sky-500>
        <textarea
          v-model="eachItem.inputText"
          type="text"
          rows="1"
          w-full resize-none outline-none
          @keydown.enter.exact.prevent="submitSingle(eachItem)"
          @keydown.tab="keyFnMap.Tab.fn"
          @keydown.stop.exact
          @keydown.enter.shift.prevent="keyFnMap['shift+enter'].fn"
          @keydown.esc.exact="($event.target as HTMLElement).blur()"
          @keydown.r.ctrl="clearSingle(eachItem)"
          @keydown.m.ctrl="handleMarkClick(eachItem)"
          @keydown.p.ctrl="copySentencePrompt(eachItem)"
        />
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
  <MessageBox v-bind="messageBoxProps" />
</template>

<style scoped>

</style>
