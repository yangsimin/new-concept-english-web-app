// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@unocss/nuxt',
  ],
  features: {
    inlineStyles: false,
  },
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  ssr: false,
  sourcemap: {
    server: true,
    client: true,
  },
  css: ['@unocss/reset/tailwind.css']
})
