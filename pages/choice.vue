<script setup lang="ts">
import type { Sentence, SentenceInfo } from '~/types/lesson'
import type SentencesWriting from '~/components/lesson/WritingModeSentences.vue'
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
  <div class="p-4">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h1 class="text-2xl font-bold">
            精选句子练习
          </h1>
          <UButton icon="i-heroicons-arrow-left" label="返回" variant="ghost" @click="router.go(-1)" />
        </div>
      </template>

      <div class="mt-4">
        <LessonWritingModeSentences
          v-if="markedSentences.length"
          ref="sentencesWritingRef"
          v-model="markedSentences"
          @mark-click="onMarkClick"
        >
          <template #index="{ sentenceInfo, index }">
            <span class="mr-2">
              {{ index + 1 }}.
              <NuxtLink
                :to="`/nce/?book=${Math.floor(sentenceInfo.sentence.lessonId / 1000)}&lessonId=${sentenceInfo.sentence.lessonId}`"
                class="underline hover:text-primary-500"
              >
                [{{ Math.floor(sentenceInfo.sentence.lessonId / 1000) }}-{{ sentenceInfo.sentence.lessonId % 1000 }}]
              </NuxtLink>
            </span>
          </template>
        </LessonWritingModeSentences>
        <UAlert v-else icon="i-heroicons-information-circle" color="primary" variant="subtle" title="快去添加句子吧~" />
      </div>

      <template v-if="markedSentences.length && sentencesWritingRef" #footer>
        <div class="py-4">
          <div class="flex justify-center gap-2">
            <UButton class="w-32" block color="primary" variant="solid" @click="sentencesWritingRef.keyFnMap['shift+enter'].fn">
              提交
            </UButton>
            <UButton class="w-32" block color="gray" variant="outline" @click="sentencesWritingRef.keyFnMap.v.fn">
              隐藏
            </UButton>
            <UButton class="w-32" block color="gray" variant="outline" @click="sentencesWritingRef.keyFnMap.z.fn">
              重置
            </UButton>
            <!-- <UButton class="w-32" block color="gray" variant="outline" @click="shuffle">
              乱序
            </UButton> -->
          </div>
        </div>
      </template>
    </UCard>
  </div>
</template>

<style scoped>

</style>
