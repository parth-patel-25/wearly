---
name: centralized-route-management
description: Center all UI routes in a single ROUTES constant for React (react-router) and Next.js (App Router) apps. Use when adding, changing, or navigating to routes; creating Link components, useNavigate/router.push calls, breadcrumbs, sitemaps, redirects, or route configs.
---

# Centralized Route Management

## When to Use This Skill

Use when you are:

- Adding a new page/route to a React (react-router) or Next.js (App Router) app
- Creating `<Link>`, `Link` components, or navigating programmatically (`useNavigate`, `router.push`)
- Building breadcrumbs, sitemaps, redirects, or catch-all/navigation UI
- Renaming, restructuring, or refactoring URL paths
- Wiring route configs (`<Route>`, App Router layout/page files)
- Reviewing code that contains hardcoded path strings

Do NOT use for API endpoint paths — keep those in a separate centralized API routes constant.

## The Problem

Hardcoded route strings create 4 problems as an app grows:

1. **Maintenance** — changing `/blog` to `/articles` means hunting through the whole codebase
2. **Typos** — `/dashbord` instead of `/dashboard` slips into broken links until production
3. **No IntelliSense** — the editor cannot autocomplete or error-check string literals
4. **Inconsistency** — team members and AI assistants each pick different spellings

Centralization fixes all of these with one source of truth.

## Step 1: Create a Routes File

Create one file for all UI routes:

```
src/constants/routes.ts          # React / Next.js
```

For feature-based projects the file may instead live with the routing core (e.g. `src/core/routing/routes.ts`); the principle is identical — one file, single source of truth.

## Step 2: Define the ROUTES Object

```typescript
// src/constants/routes.ts
export const ROUTES = {
  // Public routes
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",
  PRICING: "/pricing",

  // Auth routes
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",

  // Dashboard routes
  DASHBOARD: "/dashboard",
  DASHBOARD_ANALYTICS: "/dashboard/analytics",
  DASHBOARD_SETTINGS: "/dashboard/settings",
  DASHBOARD_PROFILE: "/dashboard/profile",

  // Dynamic routes (functions, keep the template in ONE place)
  BLOG_DETAIL: (slug: string) => `/blog/${slug}`,
  BLOG_CATEGORY: (category: string) => `/blog/category/${category}`,
  USER_PROFILE: (userId: string) => `/user/${userId}`,
  USER_POSTS: (userId: string) => `/user/${userId}/posts`,
} as const

// Route groups for better organization
export const AUTH_ROUTES = {
  LOGIN: ROUTES.LOGIN,
  REGISTER: ROUTES.REGISTER,
  FORGOT_PASSWORD: ROUTES.FORGOT_PASSWORD,
} as const

export const DASHBOARD_ROUTES = {
  HOME: ROUTES.DASHBOARD,
  ANALYTICS: ROUTES.DASHBOARD_ANALYTICS,
  SETTINGS: ROUTES.DASHBOARD_SETTINGS,
  PROFILE: ROUTES.DASHBOARD_PROFILE,
} as const
```

Conventions:
- Static routes: UPPER_SNAKE_CASE keys, value is the path string
- Dynamic routes: arrow function taking the ID/slug, returning the built path
- Route groups (`AUTH_ROUTES`, `DASHBOARD_ROUTES`) for namespacing
- `as const` for literal types

## Step 3: Use Routes in Components

### Next.js (App Router)

```tsx
// components/Navbar.tsx
"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ROUTES, DASHBOARD_ROUTES } from "@/constants/routes"

export default function Navbar() {
  const router = useRouter()

  const handleProfileNavigation = () => {
    router.push(DASHBOARD_ROUTES.PROFILE)
  }

  return (
    <nav>
      <Link href={ROUTES.ABOUT}>About</Link>
      <Link href={ROUTES.CONTACT}>Contact</Link>
      <Link href={ROUTES.BLOG}>Blog</Link>
      <Link href={DASHBOARD_ROUTES.ANALYTICS}>Analytics</Link>
      <button onClick={handleProfileNavigation}>Profile</button>
    </nav>
  )
}
```

### React (react-router)

```tsx
// components/Navbar.tsx
import { Link, useNavigate } from "react-router-dom"
import { ROUTES, DASHBOARD_ROUTES } from "@/constants/routes"

export default function Navbar() {
  const navigate = useNavigate()

  return (
    <nav>
      <Link to={ROUTES.ABOUT}>About</Link>
      <Link to={ROUTES.CONTACT}>Contact</Link>
      <Link to={ROUTES.BLOG}>Blog</Link>
      <Link to={DASHBOARD_ROUTES.ANALYTICS}>Analytics</Link>
      <button onClick={() => navigate(DASHBOARD_ROUTES.PROFILE)}>Profile</button>
    </nav>
  )
}
```

## Step 4: Handle Dynamic Routes

### Next.js

```tsx
// components/BlogList.tsx
import Link from "next/link"
import { ROUTES } from "@/constants/routes"

interface BlogListProps {
  posts: { slug: string; title: string; category: string }[]
}

export default function BlogList({ posts }: BlogListProps) {
  return (
    <div>
      {posts.map((post) => (
        <article key={post.slug}>
          <Link href={ROUTES.BLOG_DETAIL(post.slug)}>{post.title}</Link>
          <Link href={ROUTES.BLOG_CATEGORY(post.category)}>
            Category: {post.category}
          </Link>
        </article>
      ))}
    </div>
  )
}
```

### React (react-router)

```tsx
import { Link } from "react-router-dom"
import { ROUTES } from "@/constants/routes"

// Route config uses the SAME constant
export const router = createBrowserRouter([
  { path: ROUTES.HOME, element: <Home /> },
  { path: ROUTES.BLOG_DETAIL(":slug"), element: <BlogPost /> },
  { path: "*", element: <Navigate to={ROUTES.HOME} replace /> },
])

// Dynamic link
<Link to={ROUTES.BLOG_DETAIL(post.slug)}>{post.title}</Link>
```

Never write `/blog/${slug}` inline in a component — the template string lives only in the route function.

## Step 5: Beyond Links

The same constant powers every navigation surface:

- **Redirects / guards**: `router.push(ROUTES.LOGIN)`, `<Navigate to={ROUTES.LOGIN} replace />`, `redirect(ROUTES.LOGIN)` (Next.js server)
- **Breadcrumbs**: `[{ label: "Home", href: ROUTES.HOME }, { label: "Blog", href: ROUTES.BLOG }]`
- **Sitemap** (Next.js `app/sitemap.ts`): return `[{ url: `https://site.com${ROUTES.ABOUT}` }]`
- **Footer / menus / tabs**: reference `ROUTES` entries, never re-type paths
- **Active-link states**: match `pathname` against `ROUTES` entries

## Checklist Before Shipping a Route

- [ ] Route string added to the central `ROUTES` constant FIRST
- [ ] `<Link>` / `navigate` / `router.push` use the constant or its function
- [ ] No hardcoded path strings (`"/about"`, `` `/blog/${slug}` ``) outside `routes.ts`
- [ ] Route config (`<Route path>` / dynamic segments) references the constant
- [ ] Redirects, breadcrumbs, sitemap, and fallbacks reuse `ROUTES`
- [ ] `/` rename touches exactly ONE file

## Benefits

- **No repetition** — define once, use everywhere
- **No typos** — the editor catches bad keys
- **Easy refactor** — one-file change updates the whole app
- **Scalable** — new routes are one line in one file
- **IntelliSense + type safety** — autocomplete and type checking in VSCode
- **Portable** — navbars, footers, sitemaps, breadcrumbs, and guards reuse the same values
- **Instant overview** — the routes file documents every page in the app