import { appDescription } from './constants/index'

export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: [
    '@unocss/nuxt',
    '@vueuse/nuxt',
  ],
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
})
