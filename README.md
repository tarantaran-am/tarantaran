# Next.js Starter Kit

![CI](https://github.com/tigraranaar/nextjs-starter-kit/actions/workflows/ci.yml/badge.svg)

Production-ready Next.js 16 template with TypeScript, Tailwind CSS v4, ESLint,
Prettier, Vitest and Playwright already wired together.

## What's inside

- **Next.js 16** — App Router, React Compiler enabled
- **TypeScript** — strict mode with `noUncheckedIndexedAccess`
- **Tailwind CSS v4** — automatic class sorting via Prettier
- **ESLint 9** — flat config, zero-warning policy
- **Prettier 3** — formatting enforced on commit through Husky and lint-staged
- **Vitest** + Testing Library — unit and component tests
- **Playwright** — end-to-end tests across Chromium, Firefox and WebKit
- **GitHub Actions** — typecheck, lint, format, unit and e2e tests on every push
- Error, not-found and loading boundaries, validated environment variables,
  security headers

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command                | Description                        |
| ---------------------- | ---------------------------------- |
| `npm run dev`          | Start the development server       |
| `npm run build`        | Create a production build          |
| `npm run start`        | Serve the production build         |
| `npm run lint`         | Run ESLint (warnings fail the run) |
| `npm run typecheck`    | Check types without emitting       |
| `npm run format`       | Format every file                  |
| `npm run format:check` | Verify formatting                  |
| `npm test`             | Run unit tests                     |
| `npm run analyze`      | Inspect bundle size                |
| `npx playwright test`  | Run end-to-end tests               |

## Project structure

```
src/
  app/            Routes, layouts and error boundaries
  env.ts          Validated environment variables
e2e/              Playwright tests
```

Unit tests live next to the file they cover, as `*.test.tsx`.

## Environment variables

Copy `.env.example` to `.env.local`, then declare each variable in `src/env.ts`.
The app fails to start when a required variable is missing, so a typo surfaces
at build time rather than in production.

Read values from `env` rather than `process.env` to keep them typed:

```ts
import { env } from "@/env";
```

## Error monitoring

Not included — pick your own provider. For Sentry:

```bash
npx @sentry/wizard@latest -i nextjs
```

## Requirements

Node.js 24 or newer.

## License

MIT
