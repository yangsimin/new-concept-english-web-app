<script setup lang="ts">
import type { Sentence } from './nce.vue'
import type { SentenceInfo } from '~/components/nce/SentencesWriting.vue'
import SentencesWriting from '~/components/nce/SentencesWriting.vue'
import { storageKeyChoice } from '~/constants'

const router = useRouter()
const sentencesWritingRef = ref<InstanceType<typeof SentencesWriting>>()
const markedSentences = useLocalStorage<SentenceInfo[]>(storageKeyChoice, [])

updateCache()

function updateCache() {
  const latestMarkedSentences = queryMarkedSentences()
  markedSentences.value = latestMarkedSentences.sort((a, b) => {
    return (a.sentence.lessonId * 100 + Number(a.sentence.sentenceId))
      - (b.sentence.lessonId * 100 + Number(b.sentence.sentenceId))
  }).map((latestItem) => {
    const cacheItem = markedSentences.value.find((cacheItem) => {
      if (cacheItem.sentence.lessonId === latestItem.sentence.lessonId
        && cacheItem.sentence.sentenceId === latestItem.sentence.sentenceId) {
        return true
      }
      return false
    })
    if (cacheItem && !cacheItem.audioUrl) {
      cacheItem.audioUrl = latestItem.audioUrl
    }
    return cacheItem || latestItem
  })
}

function queryMarkedSentences(): SentenceInfo[] {
  const lessonKeys = Object.keys(localStorage).filter(key => key.startsWith('nce-lesson'))
  return lessonKeys.map((key) => {
    const cache = getLocalStorageJson<any>(key)
    if (!cache) {
      return []
    }
    return cache.formData
      .filter((each: SentenceInfo) => each.isMarked)
      .map((each: SentenceInfo) => ({
        ...each,
        isAnswerVisible: false,
        isMarked: true,
        inputText: '',
      }))
  }).flat()
}

function onMarkClick({ sentence, isMarked }: { sentence: Sentence, isMarked: boolean }) {
  const storageKey = `nce-lessonId-${sentence.lessonId}`
  const cache = getLocalStorageJson<any>(storageKey)
  if (!cache) {
    return
  }
  const sentenceInfoList: SentenceInfo[] = cache.formData
  sentenceInfoList.forEach((info) => {
    if (info.sentence.sentenceId !== sentence.sentenceId) {
      return
    }
    info.isMarked = isMarked
  })
  setLocalStorageJson(storageKey, { formData: sentenceInfoList })
}

function shuffle() {
  markedSentences.value = markedSentences.value.sort(() => Math.random() - 0.5)
}
</script>

<template>
  <div box-border p="x-4 y-4">
    <header flex items-center justify-between>
      <h1 text-2xl>
        精选句子练习
      </h1>
      <div>
        <button class="btn-primary py-8" @click="router.go(-1)">
          返回
        </button>
      </div>
    </header>
    <main mt-20>
      <SentencesWriting
        v-if="markedSentences.length"
        ref="sentencesWritingRef"
        v-model="markedSentences"
        @mark-click="onMarkClick"
      >
        <template #index="{ sentenceInfo, index }">
          <span mr-2>
            {{ index + 1 }}.
            <NuxtLink tabindex="-1" :to="`/nce/?book=${Math.floor(sentenceInfo.sentence.lessonId / 1000)}&lessonId=${sentenceInfo.sentence.lessonId}`" underline>
              [{{ Math.floor(sentenceInfo.sentence.lessonId / 1000) }}-{{ sentenceInfo.sentence.lessonId % 1000 }}]
            </NuxtLink>
          </span>
        </template>
      </SentencesWriting>
      <div v-else text-center text-xl uppercase>
        Empty
      </div>
    </main>
    <footer v-if="markedSentences.length" my-10 flex flex-col items-center justify-center>
      <div v-if="sentencesWritingRef" space-x-4>
        <button class="btn-primary" @click="sentencesWritingRef.keyFnMap['shift+enter'].fn">
          提交
        </button>
        <button class="btn-primary" @click="sentencesWritingRef.keyFnMap.v.fn">
          隐藏
        </button>
        <button class="btn-primary" @click="sentencesWritingRef.keyFnMap.z.fn">
          重置
        </button>
        <button class="btn-primary" @click="shuffle">
          乱序
        </button>
      </div>
    </footer>
  </div>
</template>

<style scoped>

</style>
