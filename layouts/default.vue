<template>
  <div flex flex-col>
    <header class="nav-header container" h-4rem flex items-center justify-end gap-4 text-xl>
      <strong mr-auto cursor-pointer uppercase @click="$router.push('/')">
        New Concept English
      </strong>
      <DarkToggle />
      <a icon="carbon-logo-github" href="https://github.com/yangsimin/new-concept-english-web-app" target="_blank" />
    </header>
    <main flex-1 class="container">
      <slot />
    </main>
    <footer class="container" h-56px />
  </div>
</template>

<style></style>
