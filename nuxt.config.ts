import { appDescription } from './constants/index'

export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@unocss/nuxt', '@vueuse/nuxt', '@nuxt/ui'],
  features: {
    inlineStyles: false,
  },
  app: {
    head: {
      viewport: 'width=device-width,initial-scale=1',
      meta: [
        { name: 'description', content: appDescription },
      ],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  ssr: false,
  sourcemap: {
    server: true,
    client: true,
  },
  css: [
    '@unocss/reset/tailwind.css',
  ],
  compatibilityDate: '2024-08-22',
  unocss: {
    uno: false,
    preflight: false,
    icons: true,
  },
})
