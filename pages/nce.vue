<script setup lang="ts">
import { storageKeyLastLesson, storageKeyListenMode } from '~/constants'

export interface Lesson {
  id: number
  titleEn: string
  titleZh: string
  sentences: Sentence[]
  audioUrl: string
}

export interface Sentence {
  lessonId: number
  sentenceId: number
  startAt: number
  stopAt: number
  en: string
  zh: string
}

const route = useRoute()
const router = useRouter()

const bookId = ref(1)
const lessonId = ref(1001)
const lessonIdList = ref<number[]>([])
const currentLesson = ref<Lesson | undefined>()

const isListeningMode = useLocalStorage(storageKeyListenMode, true)

watchEffect(async () => {
  if (!Array.isArray(route.query.book)) {
    bookId.value = Number(route.query.book)
  }
  else {
    bookId.value = 0
  }

  if (!Array.isArray(route.query.lessonId)) {
    lessonId.value = Number(route.query.lessonId)
  }
  else {
    lessonId.value = 0
  }
})

watchEffect(async () => {
  const lessonIds = await requestBook(bookId.value) ?? []
  lessonIdList.value = lessonIds.filter(id => id % 2)
})

watchEffect(async () => {
  if (!bookId.value || !lessonId.value) {
    return
  }

  if (lessonIdList.value.findIndex(id => id === lessonId.value) < 0) {
    return
  }

  currentLesson.value = await requestLesson(bookId.value, lessonId.value) ?? undefined
  updateCache()
})

function updateCache() {
  const cache = getLocalStorageJson<any>(storageKeyLastLesson, {})
  setLocalStorageJson(storageKeyLastLesson, {
    ...cache,
    [bookId.value]: lessonId.value,
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
        lessonId,
        sentenceId: s.IdIndex,
      } satisfies Sentence)),
      audioUrl: lesson.audio_us,
    } satisfies Lesson),
  })
  return data.value
}

async function requestBook(book: number): Promise<number[] | null> {
  const { data } = await useFetch('/api/nce/book', {
    query: { book },
    transform: (data: any[]) => (data.map(lesson => Number(lesson.voa_id))),
  })
  return data.value
}

function stepLesson(step: number) {
  const nextLessonIndex = lessonIdList.value.findIndex(id => id === lessonId.value) + step
  if (nextLessonIndex < 0 || nextLessonIndex > lessonIdList.value.length - 1) {
    return
  }

  selectLesson(lessonIdList.value[nextLessonIndex])
  window.scrollTo(0, 0)
}

function selectLesson(lessonId: number) {
  router.push({
    path: route.path,
    query: {
      book: bookId.value,
      lessonId,
    },
  })
}
</script>

<template>
  <div flex="~ col" box-border p="x-4 y-4">
    <header flex items-center justify-start gap-2 lt-sm="text-xl" text-2xl>
      <div flex flex-1>
        <strong mr-4>
          {{ `${bookId}-${lessonId % 1000}` }}
        </strong>
        <span>
          <strong>
            {{ currentLesson?.titleEn }}
          </strong>
          <br>
          {{ currentLesson?.titleZh }}
        </span>
      </div>
      <button hover="bg-gray-400/20" rounded p1 transition-200 title="切换模式" @click="() => isListeningMode = !isListeningMode">
        <span :icon="isListeningMode ? 'carbon-edit' : 'carbon-headphones'" />
      </button>
      <LessonMenu
        :current-lesson-id="lessonId"
        :lesson-id-list="lessonIdList"
        @select-lesson-id="selectLesson($event)"
      >
        <button hover="bg-gray-400/20" rounded p1 transition-200 title="打开目录">
          <span icon="carbon-book" />
        </button>
      </LessonMenu>
    </header>
    <main v-if="currentLesson" mt-20>
      <LessonModeListening
        v-if="isListeningMode"
        :current-lesson="currentLesson"
        @next-lesson="stepLesson(1)"
        @prev-lesson="stepLesson(-1)"
      />
      <LessonModeWriting
        v-else
        :key="currentLesson.id"
        :current-lesson="currentLesson"
        @next-lesson="stepLesson(1)"
        @prev-lesson="stepLesson(-1)"
      />
    </main>
  </div>
</template>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: all 0.3s;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
