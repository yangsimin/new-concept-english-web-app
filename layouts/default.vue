<template>
  <div flex flex-col>
    <header class="nav-header container" h-4rem flex items-center justify-end gap-4 text-xl>
      <DarkToggle />
      <a i-carbon-logo-github href="https://github.com/yangsimin/new-concept-english-web-app" target="_blank" />
    </header>
    <main flex-1 class="container">
      <slot />
    </main>
    <footer class="container" h-56px />
  </div>
</template>

<style></style>
