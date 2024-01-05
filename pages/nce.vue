<script setup lang="ts">
// todo 0. 完善切换下一课,下一本书的逻辑
// done 1. 增加 mp3 播放
// done 2. 拆分句子, 增加间隔
// done 3. 按键映射
// todo 4. 重构代码
// done 5. 移除 mp3 的 git 同步
// todo 6. server 异常处理

interface Lesson {
  id: number
  titleEn: string
  titleZh: string
  sentences: Sentence[]
  audioUrl: string
}

interface Sentence {
  startAt: number
  stopAt: number
  en: string
  zh: string
}

const route = useRoute()
const router = useRouter()

const book = ref(1)
const lessonId = ref(1001)
const lessonIdList = ref<number[]>([])
const currentLesson = ref<Lesson | undefined>()
const sentenceIndex = ref(0)
const sentenceList = computed<Sentence[]>(() => currentLesson.value?.sentences ?? [])
const currentSentence = ref<Sentence | undefined>()

const isSoundEnable = ref(true)
const isEnTextHidden = ref(true)
const { audioInstance, playAudio, pauseAudio, updateSource } = useAudio()
const isMenuVisible = ref(false)

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
    fn: () => { stepLesson(1) },
  },
  h: {
    name: '上一课',
    fn: () => { stepLesson(-1) },
  },
  m: {
    name: '静音切换',
    fn: () => { isSoundEnable.value = !isSoundEnable.value },
  },
}

addListenKeyDown()

watchEffect(async () => {
  if (!Array.isArray(route.query.book)) {
    book.value = Number(route.query.book)
  }
  else {
    book.value = 0
  }

  if (!Array.isArray(route.query.lessonId)) {
    lessonId.value = Number(route.query.lessonId)
  }
  else {
    lessonId.value = 0
  }
})

watchEffect(() => {
  currentSentence.value = sentenceList.value[sentenceIndex.value]
  isEnTextHidden.value = true
  pauseAudio()
})

watchEffect(() => {
  audioInstance.muted = !isSoundEnable.value
})

watchEffect(async () => {
  lessonIdList.value = await updateBook(book.value) ?? []
})

watchEffect(async () => {
  if (!book.value || !lessonId.value) {
    return
  }

  currentLesson.value = await requestLesson(book.value, lessonId.value) ?? undefined
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

async function requestLesson(book: number, lessonId: number): Promise<Lesson | null> {
  const { data } = await useFetch('/api/nce/lesson', {
    query: { book, lessonId },
    transform: (lesson: any) => ({
      id: lessonId,
      titleEn: lesson.title.title,
      titleZh: lesson.title.title_cn,
      sentences: lesson.data.slice(1).map((s: any) => ({
        startAt: Number(s.Timing),
        stopAt: Number(s.EndTiming),
        en: s.Sentence,
        zh: s.Sentence_cn,
      } satisfies Sentence)),
      audioUrl: lesson.audio_us,
    } satisfies Lesson),
  })
  return data.value
}

async function updateBook(book: number): Promise<number[] | null> {
  const { data } = await useFetch('/api/nce/book', {
    query: { book },
    transform: (data: any[]) => (data.map(lesson => Number(lesson.voa_id))),
  })
  return data.value
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
      playAudio(Number(currentSentence.value?.startAt), Number(currentSentence.value?.stopAt))
    }
    return
  }
  if (sentenceIndex.value < sentenceList.value.length - 1) {
    sentenceIndex.value++
  }
}

function stepLesson(step: number) {
  const nextLesson = lessonId.value + step
  if (nextLesson % 1000 < 1 || nextLesson % 1000 > lessonIdList.value.length - 1) {
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

function onMenuClick(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (target.dataset.lesson) {
    lessonId.value = Number(target.dataset.lesson)
    isMenuVisible.value = false
  }
}
</script>

<template>
  <div flex="~ col" box-border p="x-4 y-4">
    <header flex items-center justify-between>
      <div flex text="2xl">
        <strong mr-4>
          {{ `${book}-${lessonId % 1000}` }}
        </strong>
        <span>
          <strong>
            {{ currentLesson?.titleEn }}
          </strong>
          <br>
          {{ currentLesson?.titleZh }}
        </span>
      </div>
      <div relative>
        <button hover="bg-gray-700/20" rounded p1 text-3xl transition-200 @click="isMenuVisible = !isMenuVisible">
          🍞
        </button>
        <ol
          v-show="isMenuVisible"
          grid="~ cols-[repeat(auto-fill,minmax(30px,1fr))] gap-1"
          translate-x="-100%"
          border="2px sky-500"
          absolute z-1 max-w-500px w-70vw rounded bg-white text-sky-500 shadow-sm
          @click="onMenuClick"
        >
          <li
            v-for="(id, index) in lessonIdList" :key="id"
            :data-lesson="id"
            hover="bg-gray-700/20" table-cell cursor-pointer select-none rounded p-1 text-center align-middle transition-200
          >
            {{ index + 1 }}
          </li>
        </ol>
      </div>
    </header>
    <main v-if="currentSentence" mt-20>
      <article flex="~ col" items-center justify-center gap-8>
        <p relative flex items-center text-4xl>
          {{ currentSentence.zh }}
          <label absolute right-0 mr--16 cursor-pointer text-2xl>
            <input v-model="isSoundEnable" type="checkbox" hidden>
            <span>{{ isSoundEnable ? '🔊' : '🔇' }}</span>
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
        <button class="btn" :disabled="sentenceIndex === sentenceList.length - 1 && !isEnTextHidden" @click="onClickNextStep">
          下一步
        </button>
        <button class="btn" :disabled="lessonId % 1000 <= 1" @click="stepLesson(-1)">
          上一课
        </button>
        <button class="btn" :disabled="lessonId % 1000 >= lessonIdList.length - 1" @click="stepLesson(1)">
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
  @apply px-4 py-px rounded bg-sky-500 text-white border-(sky-700 2px) hover:bg-opacity-80
  disabled:(cursor-default bg-gray-600 opacity-50 hover:bg-opacity-100);
}
</style>
