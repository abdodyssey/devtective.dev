
import { config, fields, collection, singleton } from "@keystatic/core";

export default config({
  storage: {
    kind: "local",
  },
  singletons: {
    about: singleton({
      label: "About Me",
      path: "src/content/about",
      format: { data: "json" },
      schema: {
        heroImage: fields.text({ label: "Hero Image URL", defaultValue: "/pfp.webp" }),
        heroName: fields.text({ label: "Hero Name", defaultValue: "M. Abdi Nugroho" }),
        heroHeadline: fields.text({ label: "Hero Headline", defaultValue: "TECH ENTHUSIAST · ID" }),
        heroDescription: fields.text({ label: "Hero Description", multiline: true }),
        bio: fields.text({
          label: "Biography",
          multiline: true,
        }),
        interests: fields.array(fields.text({ label: "Tinker / Exploration Item" }), {
          label: "Tinkering & Explorations",
          itemLabel: (props) => props.value || "Tinker Item",
        }),
        stack: fields.array(fields.text({ label: "Tool / Technology" }), {
          label: "Tools & Technologies",
          itemLabel: (props) => props.value || "Tool Item",
        }),
      },
    }),
  },
  collections: {
    journal: collection({
      label: "Journal (Private Blog)",
      slugField: "title",
      path: "src/content/journal/*",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        title: fields.slug({ name: { label: "Title" } }),
        date: fields.date({
          label: "Date",
          defaultValue: { kind: "today" },
        }),
        isPrivate: fields.checkbox({
          label: "Private Entry",
          description: "Jika aktif, jurnal ini hanya bisa dilihat setelah login.",
          defaultValue: true,
        }),
        content: fields.document({
          label: "Content",
          formatting: true,
          dividers: true,
          links: true,
          images: true,
        }),
      },
    }),
    threads: collection({
      label: "Threads (Microblog)",
      slugField: "id",
      path: "src/content/threads/*",
      format: { contentField: "content" },
      entryLayout: "content",
      schema: {
        id: fields.slug({ name: { label: "Thread ID (e.g. date-time)" } }),
        date: fields.datetime({
          label: "Date & Time",
          defaultValue: { kind: "now" },
        }),
        isPrivate: fields.checkbox({
          label: "Private Thread",
          description: "Jika aktif, thread ini hanya bisa dilihat setelah login.",
          defaultValue: false,
        }),
        content: fields.document({
          label: "Content",
          formatting: true,
          dividers: true,
          links: true,
          images: true,
        }),
      },
    }),
  },
});
