<script setup lang="ts">
function handleImportCache(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }
  const reader = new FileReader()
  reader.onload = (e: ProgressEvent<FileReader>) => {
    const text = e.target?.result // 获取读取的文本内容
    if (typeof text === 'string') {
      try {
        const jsonData = JSON.parse(text)
        Object.entries(jsonData).forEach(([key, value]) => {
          if (typeof value === 'object') {
            setLocalStorageJson(key, value)
          }
          else {
            localStorage.setItem(key, value as string)
          }
        })
      }
      catch (error) {
        // eslint-disable-next-line no-alert
        alert('无效的 JSON 文件！')
      }
    }
  }
  reader.readAsText(file)
}

function handleExportCache() {
  const keys = Object.keys(localStorage).filter(key => key.startsWith('nce'))
  const cache = keys.reduce((obj, key) => {
    obj[key] = JSON.parse(localStorage[key])
    return obj
  }, {} as any)
  downloadJson(cache)
}
</script>

<template>
  <div flex flex-col>
    <header class="nav-header container" h-4rem flex items-center justify-end gap-4 text-xl>
      <strong mr-auto cursor-pointer uppercase @click="$router.push('/')">
        New Concept English
      </strong>
      <NuxtLink to="/choice">
        <span icon="carbon-star-review" title="精选句子练习" />
      </NuxtLink>
      <DarkToggle />
      <a icon="carbon-logo-github" href="https://github.com/yangsimin/new-concept-english-web-app" target="_blank" />
      <span icon="carbon-download" title="导出缓存" cursor-pointer @click="handleExportCache" />
      <label>
        <span icon="carbon-upload" title="导入缓存" cursor-pointer />
        <input id="fileInput" type="file" accept=".json" hidden @change="handleImportCache">
      </label>
    </header>
    <main flex-1 class="container">
      <slot />
    </main>
    <footer class="container" h-56px />
  </div>
</template>

<style></style>
