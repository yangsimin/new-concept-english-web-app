<template>
  <div flex flex-col>
    <header class="nav-header container" h-4rem flex items-center justify-end>
      <nav flex gap-8>
        <a class="nav-link-active" href="javascript:;">课文回译 (逐句)</a>
        <a class="nav-link" href="javascript:;">课文回译 (全文)</a>
      </nav>
      <DarkToggle />
      <a i-carbon-logo-github href="https://github.com/antfu/vitesse-nuxt3" target="_blank" />
    </header>
    <main flex-1 class="container">
      <slot />
    </main>
    <footer class="container" h-56px />
  </div>
</template>

<style>
.nav-link-active {
  @apply decoration-none bg-sky-500 text-white rounded px-4 py-2;
}
.nav-link {
  @apply decoration-none  border-sky-500 text-sky-500 rounded px-4 py-2 border border-solid;
}
</style>
