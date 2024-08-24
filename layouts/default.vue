<template>
  <div class="h-full grid grid-rows-[auto_1fr]">
    <header class="container h-[4rem] flex items-center justify-end gap-2 text-xl">
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
          icon="solar-list-heart-bold"
          title="精选句子练习"
          variant="ghost"
          color="gray"
        />
      </NuxtLink>
      <DarkToggle />
      <UButton
        type="button"
        variant="ghost"
        icon="carbon-logo-github"
        color="gray"
        to="https://github.com/yangsimin/new-concept-english-web-app"
        target="_blank"
      />
    </header>
    <main class="container">
      <slot />
    </main>
  </div>
</template>

<style></style>
