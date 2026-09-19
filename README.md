# Route Posts

A social media web app — feed, posts, comments, likes, bookmarks, notifications, and profile management — built with React, TypeScript, and Vite.

**🔗 Live demo:** [route-posts-pink.vercel.app](https://route-posts-pink.vercel.app/auth/login)

## API reference

Built against the [Route Posts API](https://route-posts.routemisr.com/#docs) — "a complete social API learning playground with professional docs, clear endpoint contracts, and fast testing workflow," provided by Route Academy. That page covers Auth & Users, Feed & Timeline, Comments & Mentions, and Notifications, plus links to the Postman documentation and a live API demo.

## Features

- **Auth** — sign up, log in, change password (with refreshed-token handling)
- **Feed** — personalized home feed of posts from people you follow
- **Community** — all public posts platform-wide
- **Posts** — create, edit, delete, like/unlike, bookmark/unbookmark, share
- **Comments** — create, edit, delete, like/unlike, reply
- **My Posts** — your own posts in one place
- **Saved** — posts you've bookmarked
- **Profile** — cover/profile photo upload with an interactive crop-and-zoom modal, followers/following/bookmarks stats
- **Notifications** — likes, comments, shares, and follows, with read/unread state and mark-all-as-read
- **Settings** — change password with client-side validation

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/) for dev server and builds
- [React Router](https://reactrouter.com/) for routing
- React's built-in [Context API](https://react.dev/reference/react/createContext) for global state — auth token (`AuthContext`) and current user data (`UserContext`)
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for form validation
- [Axios](https://axios-http.com/) for API requests
- [HeroUI](https://heroui.com/) for accessible UI primitives (dropdowns, buttons)
- [lucide-react](https://lucide.dev/) for icons
- [emoji-picker-react](https://www.npmjs.com/package/emoji-picker-react) for comment emoji input

## Getting started

### Prerequisites

- Node.js
- A running instance of the Route Posts API (see [Environment variables](#environment-variables))

### Clone

```bash
git clone https://github.com/rana-ahmed29/Route-Posts.git
cd Route-Posts
```

### Installation

```bash
npm install
```

### Environment variables

Create a `.env.local` file in the project root:

```
VITE_BASE_URL=https://route-posts.routemisr.com
```

### Development

```bash
npm run dev
```

Starts the Vite dev server with hot module replacement.

### Build

```bash
npm run build
```

Type-checks and builds a production bundle into `dist/`.

### Preview

```bash
npm run preview
```

Serves the production build locally for a final check before deploying.

## Project structure

```
src/
  components/       # shared components (PostCard, CommentsList, Navbar, Sidebar, ...)
  layouts/          # AuthLayout, MainLayout
  lib/schema/       # Zod validation schemas
  pages/            # route-level pages (Feed, Profile, Settings, Notifications, ...)
  services/         # API calls, grouped by resource (posts, comments, auth, notifications, profile)
  types/            # shared TypeScript types matching API response shapes
  App.tsx           # route definitions
  main.tsx          # app entry point
```

## Linting

```bash
npm run lint
```

Uses ESLint with TypeScript-aware rules. See `eslint.config.js` to adjust or extend the ruleset.
