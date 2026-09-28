---
description: Enforce centralized UI route management with a single ROUTES constant, never hardcode route strings in components or router config
globs: ["**/*.ts", "**/*.tsx"]
---

# Centralized Routing Rules (MANDATORY)

## Centralized UI Routes

### Location
All UI route strings MUST be defined in a single source of truth:
```
src/core/routing/routes.ts
```

### Why Centralized Routes?
- Single source of truth for every page route in the app
- Change a route in one place, it updates everywhere (navbar, footer, sitemap, breadcrumbs, redirects)
- Eliminates typos like `/dashbord` that ship to production
- Full IntelliSense / autocomplete support in editors
- Consistent pattern for you AND AI assistants writing code
- Instant overview of every page in the app from one file

## Rules

### 1. Define the ROUTES Object First
```typescript
// src/core/routing/routes.ts
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

  // Dynamic routes (functions, NOT template strings)
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

### 2. Use ROUTES in the Router Config
```tsx
// src/core/routing/index.tsx
import { ROUTES } from "@/core/routing/routes"

export const router = createBrowserRouter([
  { path: ROUTES.HOME, element: <Home /> },       // ✅
  { path: ROUTES.DASHBOARD, element: <Dashboard /> },
  { path: ROUTES.LOGIN, element: <Auth /> },
  { path: "*", element: <Navigate to={ROUTES.HOME} replace /> },
])

// ❌ BAD - Hardcoded paths
{ path: "/", element: <Home /> }
<Navigate to="/" replace />
```

### 3. Use ROUTES in Components
```tsx
// components/Navbar.tsx
import { Link, useNavigate } from "react-router-dom"
import { ROUTES, DASHBOARD_ROUTES } from "@/core/routing/routes"

const navigate = useNavigate()

// Navigation
navigate(DASHBOARD_ROUTES.PROFILE)      // ✅
navigate("/dashboard/profile")          // ❌

// Links
<Link to={ROUTES.ABOUT}>About</Link>    // ✅
<Link to="/about">About</Link>          // ❌
```

### 4. Dynamic Routes MUST Use Route Functions
```tsx
// src/features/blog/BlogList.tsx
import { Link } from "react-router-dom"
import { ROUTES } from "@/core/routing/routes"

// ✅ GOOD - route function keeps the shape in one place
posts.map((post) => (
  <Link key={post.slug} to={ROUTES.BLOG_DETAIL(post.slug)}>
    {post.title}
  </Link>
))

// ❌ BAD - hardcoded template string in the component
posts.map((post) => (
  <Link key={post.slug} to={`/blog/${post.slug}`}>
    {post.title}
  </Link>
))
```

### 5. NEVER Hardcode Route Strings
```typescript
router.push("/dashboard/user/profile")   // ❌ direct string in imperative navigation
<Link to="/blog">Blog</Link>             // ❌ string in JSX
<Route path="/dashboard" />               // ❌ string in router config
navigate(`/user/${userId}/posts`)         // ❌ dynamic template string in component
```

## Import Convention
- Components and features import ROUTES from `@core/routing/routes` (or `@/core/routing/routes` fallback)
- NEVER redefine route strings locally or re-export ROUTES from feature files
- Feature-local sub-routes (e.g. a tab under the dashboard) MUST be derived FROM the parent `ROUTES` entry, not hardcoded

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-09-15 | Initial centralized UI routing rules |