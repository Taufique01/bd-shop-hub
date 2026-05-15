# Hozoborolo — Facebook Seller Marketplace

A production-ready multi-tenant marketplace platform for Facebook-based sellers in Bangladesh.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Auth | Clerk (email, Google, Facebook) |
| Database | Neon PostgreSQL |
| ORM | Prisma 5 |
| Validation | Zod + React Hook Form |
| Notifications | Sonner |

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
Copy `.env.example` to `.env` and fill in:
- `DATABASE_URL` + `DIRECT_URL` — Neon PostgreSQL connection strings
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` — from [clerk.com](https://clerk.com)
- `FACEBOOK_APP_ID` + `FACEBOOK_APP_SECRET` — from [developers.facebook.com](https://developers.facebook.com)

### 3. Push database schema
```bash
npm run db:push
# or for proper migrations:
npm run db:migrate
```

### 4. Seed demo data
```bash
npm install -D ts-node
npm run db:seed
```

### 5. Start dev server
```bash
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run db:push` | Push schema changes to Neon |
| `npm run db:migrate` | Create migration and apply |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed demo data |
| `npm run db:generate` | Regenerate Prisma client |

## Features

### Phase 1 — Seller Discovery ✅
- Public shop directory with search and filters
- Sort by: newest, featured, rating, followers, likes, most reviewed
- Grid and list view toggle
- Shop public profile pages with SEO metadata
- Contact buttons: WhatsApp, Messenger, Facebook Page, Internal Shop

### Phase 2 — Mini Websites ✅ (server-side)
- Product catalog with categories
- Product detail pages
- 3 theme types: Modern Clean, Colorful Social, Minimal Boutique
- Internal order flow

### Phase 3 — Reviews & Trust ✅
- Platform-native shop and product reviews (1–5 stars)
- Seller reply to reviews
- Helpful votes and review reports
- Verified purchase badge
- Separate Facebook social proof section

### Phase 4 — Orders ✅
- Cart management
- Checkout with shipping address
- Order status: Pending → Delivered
- Buyer and seller order views

### Facebook Integration ✅
- Connect via Facebook OAuth (select from managed pages)
- Connect via Facebook Page URL
- Connect via Facebook Page ID
- Sync: followers, likes, rating, cover, profile picture
- Graceful "Unavailable" state for permission-restricted metrics
- Comments count: shows null/Unavailable (requires special FB permissions)
- Sync logs and error tracking

### Auth (Clerk) ✅
- Email/password sign up and login
- Facebook social login via Clerk
- Google auth via Clerk
- Multi-step onboarding (role selection → profile → shop)
- Protected routes via Clerk middleware

## Environment Variables Reference

```env
# Neon PostgreSQL
DATABASE_URL=               # Pooled connection URL (pgbouncer=true)
DIRECT_URL=                 # Direct URL for migrations (no pooler)

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Facebook Graph API
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/facebook/callback
FACEBOOK_API_VERSION=v19.0
NEXT_PUBLIC_FACEBOOK_APP_ID=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Facebook Integration Notes

- **Comments count** is not available via standard Graph API without special app review permissions. It stores `null` and shows "Unavailable" in the UI — this is intentional behavior, not a bug.
- **Rating data** requires `pages_read_engagement` permission grant. If not available, it also shows "Unavailable".
- **App Review**: For production use, you'll need to submit your Facebook app for review to get `pages_read_engagement` and `pages_show_list` permissions approved.
- For full metrics, sellers should connect via Facebook OAuth (not URL/Page ID), which gives page-level access tokens.

## Clerk Setup

1. Create an app at [clerk.com](https://clerk.com)
2. Enable Email, Google, and Facebook providers in Social Connections
3. Set redirect URLs to include `/onboarding`
4. Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env`

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Clerk auth pages
│   ├── api/
│   │   ├── facebook/    # OAuth callback, pages, sync
│   │   ├── onboarding/  # User role setup
│   │   ├── orders/      # Order CRUD
│   │   ├── products/    # Product CRUD
│   │   ├── shops/       # Shop directory + seller shop
│   │   └── user/        # User sync
│   ├── dashboard/       # Seller dashboard
│   ├── onboarding/      # Onboarding wizard
│   ├── shop/[slug]/     # Public shop page
│   ├── shops/           # Shop directory
│   ├── sign-in/         # Clerk sign-in
│   ├── sign-up/         # Clerk sign-up
│   ├── layout.tsx       # Root layout (ClerkProvider)
│   ├── page.tsx         # Homepage
│   ├── sitemap.ts       # Dynamic SEO sitemap
│   └── robots.ts        # robots.txt
├── lib/
│   ├── prisma.ts        # Singleton Prisma client
│   ├── utils.ts         # Utility functions
│   ├── validations.ts   # Zod schemas
│   ├── facebook.ts      # Graph API service
│   ├── facebook-sync.ts # Page sync orchestrator
│   └── user.ts          # User sync service
├── middleware.ts         # Clerk route protection
prisma/
├── schema.prisma        # Full database schema
└── seed.ts              # Demo data seed script
```
