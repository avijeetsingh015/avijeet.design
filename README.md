# avijeet.design

Portfolio of Avijeet Singh, experience designer. Built with Astro, deployed on Vercel.

## Concept: Layers

Every project can be peeled back to show the layer underneath: wireframe under the interface,
raw footage under the grade, grid under the poster. Disciplines are layers you can show and hide.

## Filling in placeholders

Anything still to fill in shows on the site as a checkerboard box or as text with a dashed blue underline.

| What | Where |
| --- | --- |
| Projects (text, details, sections) | `src/content/work/<project>.md`, one file per project |
| Project cover and process images | Put files in `public/work/<project>/`, then set `cover:` and `process:` in that project's file, e.g. `cover: "/work/hatsu/cover.jpg"` |
| Images inside a case study | Replace a `<figure class="ph" ...>` line with `<img src="/work/<project>/image.jpg" alt="..." />` |
| Videos | Upload to Vimeo or YouTube, then replace the video placeholder with the embed `<iframe>` |
| Showreel | `reelEmbed` at the top of `src/pages/reel.astro` |
| Email, LinkedIn, résumé, tools, experience | `src/data/site.ts` |
| Signature sound | Put `signature.mp3` in `public/audio/` and set `USE_FILE = true` in `src/scripts/main.ts` |
| Portraits | `src/pages/index.astro` and `src/pages/about.astro` |

## Run locally

```sh
npm install
npm run dev
```
