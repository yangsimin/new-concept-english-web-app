<script setup lang="ts">
// todo 0. 完善切换下一课,下一本书的逻辑
// todo 1. 增加 mp3 播放
// todo 2. 拆分句子, 增加间隔
// todo 3. 按键映射
// todo 4. 重构代码
// todo 5. 移除 mp3 的 git 同步
// todo 6. server 异常处理

import type { LocationQueryValue } from 'vue-router';

const route = useRoute()
const router = useRouter()

const book = ref<LocationQueryValue>('1')
const lessonId = ref<LocationQueryValue>('1001')

const lessonList = ref([])
const lessonTitle = ref<any>({})
const sentenceIndex = ref(0)
const sentenceList = ref<any>([])
const currentSentence = computed(() => sentenceList.value[sentenceIndex.value])

const enTextHidden = ref(true)

watch(sentenceIndex, () => {
  enTextHidden.value = true
})

// todo update lessonList
watch(book, async () => {
  console.log('book change', book.value)
  await updateBook()
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

async function updateLesson() {
  const { data } = await useFetch('/api/nce/lesson', {
    query: {
      book: book.value,
      lessonId: lessonId.value,
    },
  })

  if (!data.value) {
    sentenceList.value = []
    return
  }

  sentenceList.value = data.value.data.slice(1)
  lessonTitle.value = data.value.title
}

async function updateBook() {
  const { data } = await useFetch('/api/nce/book', {
    query: {
      book: book.value,
    },
  })
  lessonList.value = data.value
}

function onClickPrev() {
  if (sentenceIndex.value > 0) {
    sentenceIndex.value--
  }
}

function onClickNext() {
  if (enTextHidden.value) {
    enTextHidden.value = false
    return
  }
  if (sentenceIndex.value < sentenceList.value.length - 1) {
    sentenceIndex.value++
  }
}

function onClickNextLesson() {
  router.push({
    path: route.path,
    query: {
      book: 2,
      lessonId: 2021,
    },
  })
}
</script>

<template>
  <div v-if="sentenceList.length > 0" flex="~ col" box-border h-100vh min-h-600px min-w-768px p="x-4 y-4" font-sans>
    <header h-100px>
      <h2 mt-0>
        新概念英语 1
      </h2>
      <div w-max pl-2em text="right xl" capitalize>
        <span mr-4 font-bold>
          {{ `Lesson${Number(lessonId) % 1000}` }}
        </span> {{ lessonTitle.title ?? '-' }}
        <br>
        {{ lessonTitle.title_cn ?? '-' }}
      </div>
    </header>
    <main v-if="currentSentence" flex-1>
      <article flex="~ col" h-full items-center justify-center gap-8 text-4xl>
        <div>{{ currentSentence.Sentence_cn }}</div>
        <div border-b="4 solid sky-500" pb-2>
          <span :class="{ 'opacity-0': enTextHidden }">
            {{ currentSentence.Sentence }}
          </span>
        </div>
        <div>
          <button @click="onClickPrev">
            Prev
          </button>
          <button @click="onClickNext">
            Next
          </button>
          <br>
          <button @click="onClickNextLesson">
            Next Lesson
          </button>
        </div>
      </article>
    </main>
    <footer h-100px />
  </div>
</template>

<style scoped>
</style>
