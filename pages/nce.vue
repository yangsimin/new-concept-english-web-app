<script setup lang="ts">
// todo 0. 完善切换下一课,下一本书的逻辑
// done 1. 增加 mp3 播放
// done 2. 拆分句子, 增加间隔
// done 3. 按键映射
// todo 4. 重构代码
// done 5. 移除 mp3 的 git 同步
// todo 6. server 异常处理

import type { LocationQueryValue } from 'vue-router'

const route = useRoute()
const router = useRouter()

const book = ref<LocationQueryValue>('1')
const lessonId = ref<LocationQueryValue>('1001')

const lessonList = ref([])
const lessonTitle = ref<any>('')
const lessonAudioUrl = ref<string>('')
const sentenceIndex = ref(0)
const sentenceList = ref<any>('')
const currentSentence = computed(() => sentenceList.value[sentenceIndex.value])

const soundEnable = ref(true)
const enTextHidden = ref(true)
const { audioInstance, playAudio, pauseAudio, updateSource } = useAudio()

const keyFnMap: Record<string, { name: string, fn: Function }> = {
  j: {
    name: '下一步',
    fn: () => { onClickNextSentence() },
  },
  k: {
    name: '上一句',
    fn: () => { onClickPrevSentence() },
  },
  l: {
    name: '下一课',
    fn: () => { stepLesson(1) },
  },
  h: {
    name: '上一课',
    fn: () => { stepLesson(-1) },
  },
  m: {
    name: '静音切换',
    fn: () => { soundEnable.value = !soundEnable.value },
  },
}

watch(sentenceIndex, () => {
  enTextHidden.value = true
  pauseAudio()
})

watch(lessonAudioUrl, () => {
  updateSource(lessonAudioUrl.value)
})

watch(soundEnable, () => {
  if (soundEnable.value) {
    audioInstance.muted = false
  }
  else {
    audioInstance.muted = true
  }
})

watchEffect(() => {
  if (Number(book.value) >= 1 && Number(book.value) <= 4) {
    updateBook()
  }
})

watchEffect(async () => {
  if (!Array.isArray(route.query.book)) {
    book.value = route.query.book
  }
  else {
    book.value = ''
  }

  if (!Array.isArray(route.query.lessonId)) {
    lessonId.value = route.query.lessonId
  }
  else {
    lessonId.value = ''
  }

  if (!book.value || !lessonId.value) {
    return
  }

  await updateLesson()
})

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})

function onKeyDown(event: KeyboardEvent) {
  const key = event.key
  if (keyFnMap[key]) {
    keyFnMap[key].fn()
  }
}

async function updateLesson() {
  const { data } = await useFetch<any>('/api/nce/lesson', {
    query: {
      book: book.value,
      lessonId: lessonId.value,
    },
  })

  if (!data.value) {
    sentenceList.value = []
    return
  }

  lessonTitle.value = data.value.title
  lessonAudioUrl.value = data.value.audio_us
  sentenceList.value = data.value.data.slice(1)
  sentenceIndex.value = 0
  enTextHidden.value = true
}

async function updateBook() {
  const { data } = await useFetch<any>('/api/nce/book', {
    query: {
      book: book.value,
    },
  })
  lessonList.value = data.value
}

function onClickPrevSentence() {
  if (sentenceIndex.value > 0) {
    sentenceIndex.value--
  }
}

function onClickNextSentence() {
  if (enTextHidden.value) {
    enTextHidden.value = false
    if (soundEnable.value) {
      playAudio(Number(currentSentence.value.Timing), Number(currentSentence.value.EndTiming))
    }
    return
  }
  if (sentenceIndex.value < sentenceList.value.length - 1) {
    sentenceIndex.value++
  }
}

function stepLesson(step: number) {
  const nextLesson = Number(lessonId.value) + step
  if (nextLesson % 1000 < 1 || nextLesson % 1000 > lessonList.value.length - 1) {
    return
  }
  router.push({
    path: route.path,
    query: {
      book: book.value,
      lessonId: nextLesson,
    },
  })
}
</script>

<template>
  <div flex="~ col" box-border p="x-4 y-4">
    <header flex items-center>
      <div flex text="2xl">
        <strong mr-4>
          {{ `${book}-${Number(lessonId) % 1000}` }}
        </strong>
        <span>
          <strong>
            {{ lessonTitle.title }}
          </strong>
          <br>
          {{ lessonTitle.title_cn }}
        </span>
      </div>
    </header>
    <main v-if="currentSentence" mt-20>
      <article flex="~ col" items-center justify-center gap-8>
        <p relative flex items-center text-4xl>
          {{ currentSentence.Sentence_cn }}
          <label absolute right-0 mr--16 cursor-pointer text-2xl>
            <input v-model="soundEnable" type="checkbox" hidden>
            <span>{{ soundEnable ? '🔊' : '🔇' }}</span>
          </label>
        </p>
        <p flex gap-2 text-4xl>
          <span
            v-for="(piece, index) in currentSentence.Sentence.trim().split(/\s/)"
            :key="index"
            py-1
            border-b="4 solid sky-500"
          >
            <span :class="{ 'opacity-0': enTextHidden }" px-2>{{ piece }}</span>
          </span>
        </p>
      </article>
      <div grid-cols="[repeat(2,115px)]" grid mt-14 place-content-center gap-20px>
        <button class="btn" :disabled="sentenceIndex === 0" @click="onClickPrevSentence">
          上一句
        </button>
        <button class="btn" :disabled="sentenceIndex === sentenceList.length - 1 && !enTextHidden" @click="onClickNextSentence">
          下一步
        </button>
        <button class="btn" :disabled="Number(lessonId) % 1000 <= 1" @click="stepLesson(-1)">
          上一课
        </button>
        <button class="btn" :disabled="Number(lessonId) % 1000 >= lessonList.length - 1" @click="stepLesson(1)">
          下一课
        </button>
        <div v-for="({ name }, key) in keyFnMap" :key="key">
          <span text="center white" mr-2 inline-block w-30px rounded bg-sky-500>{{ key }}</span>{{ name }}
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.btn {
  @apply px-4 py-px rounded bg-sky-500 text-white cursor-pointer border-(sky-700 2px) hover:bg-opacity-80
  disabled:(cursor-default bg-gray-600 opacity-50 hover:bg-opacity-100);
}
</style>
