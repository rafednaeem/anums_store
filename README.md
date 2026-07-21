# Anums Store

Production-grade e-commerce platform for Anums Store, a Lahore-based Pakistani fashion brand. Built with Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase, and shadcn/ui.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **UI:** React 18, Tailwind CSS, shadcn/ui, Lucide icons
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **State:** React Context (cart), URL params (filters)
- **Forms:** react-hook-form + Zod validation
- **Email:** Resend / Console provider abstraction
- **Charts:** Recharts (admin dashboard)
- **Animations:** Framer Motion

## Core Features

### Storefront
- Product catalog with category filtering, search, and sorting
- Product detail with image gallery, size/color variant selection
- Shopping cart with guest (sessionStorage) and authenticated (DB) support
- 4-step checkout wizard (Shipping → Payment → Review → Confirm)
- Bank transfer payment with proof upload
- Cash on Delivery (city-restricted)
- Guest checkout support
- Order tracking with WhatsApp integration
- Wishlist (DB-backed)
- Product reviews with moderation
- Size guide

### Admin Panel
- Dashboard with KPI cards and charts
- Order management with status timeline and payment verification
- Product CRUD with image upload and variant management
- Category management (hierarchical)
- Customer management with order history
- Inventory tracking with inline editing
- Review moderation
- Contact form inquiries
- Site settings (key-value)
- Real-time notifications

### Authentication
- Email/password authentication
- Remember Me with session restoration
- Admin role via JWT app_metadata
- Guest-to-customer cart merge
- Password reset flow

### Email System
- Provider abstraction (Resend, Console)
- Order status email templates
- Deduplication (24-hour window)
- Retry with exponential backoff
- Email logging

### SEO
- Dynamic metadata per page
- JSON-LD structured data
- OpenGraph + Twitter cards
- Dynamic sitemap

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Fill in Supabase credentials

# Run development server
npm run dev

# Run database migrations
# Execute supabase/migrations/001_initial_schema.sql in Supabase SQL Editor
```

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Store
NEXT_PUBLIC_STORE_NAME=Anums Store
NEXT_PUBLIC_BASE_URL=https://avosira.com
NEXT_PUBLIC_STORE_EMAIL=info@avosira.com
NEXT_PUBLIC_STORE_PHONE=+923224183457
NEXT_PUBLIC_WHATSAPP_NUMBER=923224183457

# Email (optional)
RESEND_API_KEY=
EMAIL_FROM=Anums Store <auth@avosira.com>

# Analytics (optional)
NEXT_PUBLIC_GA_ID=
```

## Project Structure

```
src/
├── app/
│   ├── (store)/          # Storefront pages
│   ├── (admin)/          # Admin dashboard
│   ├── auth/             # Authentication pages
│   └── api/              # API routes
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── shared/           # Cross-cutting components
│   ├── store/            # Storefront components
│   └── admin/            # Admin components
├── hooks/                # Custom React hooks
├── lib/
│   ├── supabase/         # 5 Supabase client configs
│   ├── email/            # Email system
│   ├── admin/            # Server actions
│   └── ...               # Utilities
├── types/                # TypeScript types
└── constants/            # App constants
```

## Database

Run `supabase/migrations/001_initial_schema.sql` in your Supabase SQL Editor to create all tables, RLS policies, functions, and triggers.

Key tables: profiles, categories, products, product_images, product_variants, addresses, carts, cart_items, orders, order_items, order_timeline, payments, wishlists, reviews, inquiries, site_settings, email_logs, admin_notifications.

## License

Private - Anums Store
