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
        alert('导入完成，页面将会刷新。')
        location.reload()
      }
      catch (error) {
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
  <header class="container h-[var(--header-height)] flex items-center justify-end gap-2 text-xl">
    <UButton
      variant="ghost"
      size="xl"
      class="mr-auto font-bold uppercase"
      @click="$router.push('/')"
    >
      New Concept English
    </UButton>
    <NuxtLink to="/choice">
      <UButton
        icon="ph-list-star"
        title="精选句子练习"
        variant="ghost"
        color="gray"
      />
    </NuxtLink>
    <LayoutDarkToggle />
    <UButton
      type="button"
      variant="ghost"
      icon="simple-icons-github"
      color="gray"
      to="https://github.com/yangsimin/new-concept-english-web-app"
      target="_blank"
    />
    <span icon="carbon-download" title="导出缓存" cursor-pointer @click="handleExportCache" />
    <label>
      <span icon="carbon-upload" title="导入缓存" cursor-pointer />
      <input id="fileInput" type="file" accept=".json" hidden @change="handleImportCache">
    </label>
  </header>
</template>
