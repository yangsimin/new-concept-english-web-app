<script setup lang="ts">
import * as Diff from 'diff'
import type { Sentence, SentenceInfo } from '~/types/lesson'

const emits = defineEmits<{
  (e: 'markClick', value: { sentence: Sentence, isMarked: boolean }): void
}>()
const formData = defineModel<SentenceInfo[]>({ default: [] })
const keyFnMap: Record<string, { name: string, fn: () => void }> = {
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

const { copySentencePrompt } = usePromptIcon()
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
  const toast = useToast()
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

    const description = `已拷贝，请前往 <a
          href="${url}" target="_blank"
          style="text-decoration:underline; margin:0 4px;"
        >《通义千问》</a>提问
    `
    toast.add({
      title: 'Success',
      description,
      color: 'green',
    })
    // toast({
    //   message: ,
    //   type: 'success',
    //   duration: 3000,
    //   html: true,
    // })
  }

  return {
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
  <article class="flex flex-col mx-auto w-max gap-4 text-lg">
    <div v-for="(eachItem, index) of formData" :key="eachItem.sentence.startAt">
      <div class="flex items-center justify-between">
        <slot name="index" :index="index" :sentence-info="eachItem">
          {{ index + 1 }}.
        </slot>
        <div class="mr-auto">
          {{ eachItem.sentence.zh }}
        </div>
        <div class="mx-2 flex items-center gap-2">
          <UButton
            icon="carbon-clean"
            class="cursor-pointer"
            title="清除文本"
            @click="clearSingle(eachItem)"
          />
          <UButton
            icon="carbon-volume-up-filled"
            class="cursor-pointer"
            title="播放语音"
            @click="playSound(eachItem)"
          />
          <UButton
            :icon="eachItem.isMarked ? 'carbon-star-filled' : 'carbon-star'" cursor-pointer title="加入收藏"
            :class="eachItem.isMarked ? 'text-yellow' : ''"
            @click="handleMarkClick(eachItem)"
          />
          <UButton
            icon="carbon-chat-bot" cursor-pointer title="复制提示词"
            @click="copySentencePrompt(eachItem)"
          />
        </div>
      </div>
      <div class="border-b-[2px] border-b-black pl-1 focus-within-border-b-sky-500">
        <input
          v-model="eachItem.inputText"
          type="text"
          class="w-full outline-none"
          @keydown.enter.exact="submitSingle(eachItem)"
          @keydown.tab="keyFnMap.Tab.fn"
          @keydown.stop.exact
          @keydown.enter.shift="keyFnMap['shift+enter'].fn"
          @keydown.esc.exact="($event.target as HTMLElement).blur()"
        >
      </div>
      <div class="pl-1 pr-20" :class="{ opacity: 'eachItem.isAnswerVisible ? 100 : 0' }">
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
  <!-- <MessageBox v-bind="messageBoxProps" /> -->
</template>

<style scoped>

</style>
