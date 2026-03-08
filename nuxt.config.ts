// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  // Runtime config — NUXT_PUBLIC_API_BASE in .env overrides at deploy time
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:4000/api'
    }
  },

  app: {
    head: {
      title: 'Batsaikhan Ookhnoi | Historian & Author',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Dr. Batsaikhan Ookhnoi — Doctor of Historical Sciences specialising in Mongolian sovereignty, 20th-century diplomacy, and the Bogd Khanate period.' }
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap'
        }
      ]
    }
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/',
        '/about',
        '/books',
        '/books/cart',
        '/interviews',
        '/articles',
        '/talks',
        '/media',
        '/search',
        '/contact'
      ]
    }
  },
  vite: {
  build: {
    target: 'es2015'
  }
}
})
