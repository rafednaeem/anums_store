# Anums Store

Production-oriented Next.js storefront for Anums Store, a Lahore-based fashion brand with ready-to-wear and bridal catalog flows.

## Tech Stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- Sanity for product catalog content and images
- Supabase for auth, inquiries, and order storage
- Zustand for persisted cart state
- `react-hot-toast` for customer feedback
- `next-sitemap` for SEO sitemap generation

## Core Routes

- `/` home, featured products, categories, promotional sections
- `/all-products` searchable/filterable product catalog
- `/ready-to-wear` category catalog
- `/bridal` bridal catalog with occasion filters
- `/product/[id]` product detail, gallery, size selection, related products
- `/checkout` validated checkout with COD, Safepay, and Cashmaal options
- `/order-confirmation?id=...` order receipt and tracking contact
- `/login`, `/register`, `/forgot-password`, `/reset-password`, `/account`
- `/admin` and `/seller` operational roadmap dashboards

## Environment Variables

Create `.env.local` from `.env.example`.

```bash
NEXT_PUBLIC_SITE_URL=https://anumsstore.pk

NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SAFEPAY_SECRET=
CASHMAAL_API_KEY=
CASHMAAL_SECRET=

NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_WHATSAPP_NUMBER=923224183457
```

## Supabase Tables

Minimum `orders` columns:

- `id` uuid primary key
- `customer_name`, `customer_last_name`, `phone`, `address`, `city`, `postal_code`
- `items` jsonb
- `subtotal`, `shipping`, `total`
- `payment_method`, `payment_status`, `status`
- `created_at`

Minimum `inquiries` columns:

- `id` uuid primary key
- `name`, `contact`, `message`
- `created_at`

Enable row level security before launch. Public inserts can be allowed for checkout/contact, but order reads and admin operations must be role-protected.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

On Windows PowerShell, if script execution blocks `npm`, use:

```bash
npm.cmd run dev
npm.cmd run build
```

## Build

```bash
npm run build
npm run start
```

`npm run build` also runs sitemap generation through `postbuild`.

## Deployment

1. Add all environment variables to Vercel or your hosting provider.
2. Configure Sanity CORS for the deployed domain.
3. Configure Supabase Auth redirect URLs:
   - `/account`
   - `/reset-password`
4. Create Supabase tables and RLS policies.
5. Add payment gateway credentials only in server-side environment variables.
6. Run `npm run build` before promoting.

## Production Readiness Notes

- Product catalog is Sanity-backed and resilient when Sanity env vars are missing.
- Order totals are calculated server-side to prevent client tampering.
- Supabase/payment routes return clear service errors when env vars are missing.
- Remote Google font fetching was removed; local bundled fonts are used for reliable builds.
- Admin and seller dashboards define the management modules, but full role-protected CRUD requires Supabase role policies and CMS workflow decisions.

## Future Scalability

- Add Supabase service-role server client for protected admin APIs.
- Add order history keyed to authenticated user IDs.
- Add coupon table and server-validated coupon redemption.
- Add inventory reservation and stock decrement after payment/order confirmation.
- Add review moderation tables and CMS-backed homepage banners.
- Add Stripe or a finalized Pakistan payment provider implementation with webhook signature verification.
