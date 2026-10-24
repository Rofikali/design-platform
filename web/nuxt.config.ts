export default defineNuxtConfig({
  devtools: { enabled: false },
  typescript: {
    strict: true,
    typeCheck: true,
  },
  app: {
    head: {
      title: "Design Platform",
      meta: [
        { name: "description", content: "A template-driven design editor prototype." },
      ],
    },
  },
});
