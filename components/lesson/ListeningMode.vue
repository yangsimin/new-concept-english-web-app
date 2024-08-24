<script setup lang="ts">
import type { Lesson, Sentence } from '~/types/lesson'
import { storageKeySoundEnable } from '~/constants'

const props = defineProps<{
  currentLesson: Lesson
}>()
const emits = defineEmits(['nextLesson', 'prevLesson'])
const { currentLesson } = toRefs(props)

const sentenceIndex = ref(0)
const currentSentence = ref<Sentence | undefined>()

const isSoundEnable = useLocalStorage(storageKeySoundEnable, true)
const isEnTextHidden = ref(true)
const { audioInstance, playAudio, pauseAudio, updateSource } = useAudio()

const keyFnMap: Record<string, { name: string, fn: () => void }> = {
  h: {
    name: '上一课',
    fn: () => { emits('prevLesson') },
  },
  j: {
    name: '下一步',
    fn: () => { onClickNextStep() },
  },
  k: {
    name: '上一句',
    fn: () => { onClickPrevSentence() },
  },
  l: {
    name: '下一课',
    fn: () => { emits('nextLesson') },
  },
  m: {
    name: '静音切换',
    fn: () => { isSoundEnable.value = !isSoundEnable.value },
  },
}

onUnmounted(() => {
  pauseAudio()
})

watchEffect(() => {
  currentSentence.value = currentLesson.value.sentences[sentenceIndex.value]
  isEnTextHidden.value = true
  pauseAudio()
})

watchEffect(() => {
  audioInstance.muted = !isSoundEnable.value
})

watchEffect(() => {
  if (!currentLesson.value) {
    return
  }

  sentenceIndex.value = 0
  isEnTextHidden.value = true
  updateSource(currentLesson.value.audioUrl)
})

function onClickPrevSentence() {
  if (sentenceIndex.value > 0) {
    sentenceIndex.value--
  }
}

function onClickNextStep() {
  if (isEnTextHidden.value) {
    isEnTextHidden.value = false
    if (isSoundEnable.value) {
      playAudio(Number(currentSentence.value!.startAt), Number(currentSentence.value!.stopAt))
    }
    return
  }
  if (sentenceIndex.value < currentLesson.value.sentences.length - 1) {
    sentenceIndex.value++
  }
}
</script>

<template>
  <article v-if="currentSentence" class="min-h-[14rem] flex flex-col items-center justify-center gap-8 text-[4xl] lt-sm:gap-2 lt-sm:text-lg">
    <p class="relative flex items-center">
      {{ currentSentence.zh }}
      <label class="absolute right-0 mr--16 cursor-pointer text-2xl lt-sm:mr--8 lt-sm:text-base">
        <span :icon="isSoundEnable ? 'carbon-volume-up-filled' : 'carbon-volume-mute-filled'" @click="isSoundEnable = !isSoundEnable" />
      </label>
    </p>
    <p class="flex flex-wrap justify-center gap-2">
      <span
        v-for="(piece, index) in currentSentence.en.trim().split(/\s/)"
        :key="index"
        class="border-b-4 border-b-sky-500 border-b-solid py-1"
      >
        <span :class="{ 'opacity-0': isEnTextHidden }" class="px-2">{{ piece }}</span>
      </span>
    </p>
  </article>
  <div class="grid grid-cols-[repeat(2,115px)] mt-14 place-content-center gap-[20px] text-base lt-sm:text-sm">
    <button class="btn-primary" :disabled="sentenceIndex === 0" @click="onClickPrevSentence">
      上一句
    </button>
    <button class="btn-primary" :disabled="sentenceIndex === currentLesson!.sentences.length - 1 && !isEnTextHidden" @click="onClickNextStep">
      下一步
    </button>
    <button class="btn-primary" @click="emits('prevLesson')">
      上一课
    </button>
    <button class="btn-primary" @click="emits('nextLesson')">
      下一课
    </button>
  </div>
  <!-- <ShortcutKey :key-fn-map="keyFnMap" /> -->
</template>
