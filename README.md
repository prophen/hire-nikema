<img src="assets/icon.svg" width="64" height="64" alt="">

# hire nikema

Job-search page for developer relations roles. Astro for pages, React components with Storybook stories, published to Chromatic.

## Run it

```sh
npm install
npm run dev          # site at http://localhost:4321
npm run storybook    # Storybook at http://localhost:6006 (Storybook MCP at /mcp)
npm test             # runs every story as a test (interactions + accessibility) in headless Chromium
```

## Edit content

All copy lives in `src/data/profile.ts`. Lines marked `DRAFT` still need a real-person review.

- **Intro video:** set `video.src` (and `captions`) once it's recorded. Until then the hero shows a "recording in progress" slot with the transcript open.
- **Testimonials:** add to `testimonials`. The section stays hidden while the list is empty.
- **Per-company pages:** add entries to `src/data/companies.ts`, and each becomes `/for/<slug>`. These pages are set to `noindex`.
- **Role-fit checker keywords:** these live in `src/data/skills.ts`.
- **`/nikema.md`:** the page content in agent-readable person.md format, generated from `profile.ts`.

## Agent tooling

- **Storybook MCP** (local): run `npm run storybook`, then add it to your agent with `claude mcp add --transport http storybook http://localhost:6006/mcp`.
- **Chromatic MCP**: the project is already set up and `chromatic.config.json` has its ID. Publish with `CHROMATIC_PROJECT_TOKEN=… npm run chromatic`. Keep the token out of the repo. Connect the MCP server with `claude mcp add --transport http --scope user chromatic https://mcp.chromatic.com/mcp`, then authorize it through `/mcp`.
