<script setup lang="ts">
import type { Lesson, Sentence } from '~/pages/nce.vue'

const props = defineProps<{
  currentLesson: Lesson
}>()
const emits = defineEmits(['nextLesson', 'prevLesson'])
const { currentLesson } = toRefs(props)

const sentenceIndex = ref(0)
const currentSentence = ref<Sentence | undefined>()

const isSoundEnable = ref(true)
const isEnTextHidden = ref(true)
const { audioInstance, playAudio, pauseAudio, updateSource } = useAudio()

const keyFnMap: Record<string, { name: string, fn: Function }> = {
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
  h: {
    name: '上一课',
    fn: () => { emits('prevLesson') },
  },
  m: {
    name: '静音切换',
    fn: () => { isSoundEnable.value = !isSoundEnable.value },
  },
}

addListenKeyDown()

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
  <article v-if="currentSentence" flex="~ col" items-center justify-center gap-8>
    <p relative flex items-center text-4xl>
      {{ currentSentence.zh }}
      <label absolute right-0 mr--16 cursor-pointer text-2xl>
        <input v-model="isSoundEnable" type="checkbox" hidden>
        <span :icon="isSoundEnable ? 'carbon-volume-up-filled' : 'carbon-volume-mute-filled'" />
      </label>
    </p>
    <p flex gap-2 text-4xl>
      <span
        v-for="(piece, index) in currentSentence.en.trim().split(/\s/)"
        :key="index"
        py-1
        border-b="4 solid sky-500"
      >
        <span :class="{ 'opacity-0': isEnTextHidden }" px-2>{{ piece }}</span>
      </span>
    </p>
  </article>
  <div grid="~ cols-[repeat(2,115px)]" mt-14 place-content-center gap-20px>
    <button class="btn" :disabled="sentenceIndex === 0" @click="onClickPrevSentence">
      上一句
    </button>
    <button class="btn" :disabled="sentenceIndex === currentLesson!.sentences.length - 1 && !isEnTextHidden" @click="onClickNextStep">
      下一步
    </button>
    <button class="btn" @click="emits('prevLesson')">
      上一课
    </button>
    <button class="btn" @click="emits('nextLesson')">
      下一课
    </button>
    <div v-for="({ name }, key) in keyFnMap" :key="key">
      <span text="center white" mr-2 inline-block w-30px rounded bg-sky-500>{{ key }}</span>{{ name }}
    </div>
  </div>
</template>

<style scoped>
.btn {
  @apply px-4 py-px rounded bg-sky-500 text-white border-(sky-700 2px) hover:bg-opacity-80
  disabled:(cursor-default bg-gray-600 opacity-50 hover:bg-opacity-100);
}
</style>
