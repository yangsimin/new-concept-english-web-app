<template>
  <div flex flex-col>
    <header class="nav-header container" h-4rem flex items-center justify-end gap-2 text-xl>
      <UButton
        variant="ghost"
        size="xl"
        mr-auto font-bold uppercase
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
    <main flex-1 class="container">
      <slot />
    </main>
    <footer class="container" h-56px />
  </div>
</template>

<style></style>
