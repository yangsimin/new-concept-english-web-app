<script setup lang="ts">
import type { Sentence } from './nce.vue'
import type { SentenceInfo } from '~/components/SentencesWriting.vue'
import SentencesWriting from '~/components/SentencesWriting.vue'

const sentencesWritingRef = ref<InstanceType<typeof SentencesWriting>>()
const formData = ref(queryMarkedSentences())

function queryMarkedSentences(): SentenceInfo[] {
  const lessonKeys = Object.keys(localStorage).filter(key => key.startsWith('nce-lesson'))
  return lessonKeys.map((key) => {
    if (!localStorage[key]) {
      return []
    }
    const cache = JSON.parse(localStorage[key])
    return cache.formData
      .filter((each: SentenceInfo) => each.isMarked)
      .map((each: SentenceInfo) => ({
        isAnswerVisible: false,
        isMarked: true,
        inputText: '',
        sentence: each.sentence,
      }))
  }).flat()
}

function onMarkClick({ sentence, isMarked }: { sentence: Sentence, isMarked: boolean }) {
  const storageKey = `nce-lessonId-${sentence.lessonId}`
  const cache = localStorage.getItem(storageKey)
  if (!cache) {
    return
  }
  const sentenceInfoList: SentenceInfo[] = JSON.parse(cache).formData
  sentenceInfoList.forEach((info) => {
    if (info.sentence.sentenceId !== sentence.sentenceId) {
      return
    }
    info.isMarked = isMarked
  })
  localStorage.setItem(storageKey, JSON.stringify({ formData: sentenceInfoList }))
}
</script>

<template>
  <div box-border p="x-4 y-4">
    <header>
      <h1 text-2xl>
        精选句子练习
      </h1>
    </header>
    <main mt-20>
      <SentencesWriting v-if="formData.length" ref="sentencesWritingRef" v-model="formData" @mark-click="onMarkClick" />
      <div v-else text-center text-xl uppercase>
        Empty
      </div>
    </main>
    <footer v-if="formData.length" my-10 flex flex-col items-center justify-center>
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
      </div>
    </footer>
  </div>
</template>

<style scoped>

</style>
