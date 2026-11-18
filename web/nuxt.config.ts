export default defineNuxtConfig({
  // The editor still uses Nuxt 3's root-level pages/, components/ and utils/.
  // Nuxt 4 defaults to app/; explicitly preserve the existing application
  // source directory until a separately tested file-layout migration.
  srcDir: ".",
  dir: { app: "app" },
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
