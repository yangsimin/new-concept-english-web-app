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
    <DarkToggle />
    <UButton
      type="button"
      variant="ghost"
      icon="simple-icons-github"
      color="gray"
      to="https://github.com/yangsimin/new-concept-english-web-app"
      target="_blank"
    />
  </header>
</template>
