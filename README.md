# NovaTech

NovaTech is an online electronics store built with Next.js, React and TypeScript, with Supabase (PostgreSQL) as the backend. Visitors can browse a catalog, search and filter products by detailed specifications, keep a wishlist, and place orders with or without an account.

It was developed as a pre-graduation internship project and covers the full cycle: requirements, UI design, database design, implementation and deployment on Vercel.

## Features

- **Catalog** loaded from Supabase, with sorting by price, name or newest
- **Filtering** by category, subcategory, brand, price range and technical specifications (RAM, storage, screen size, processor, GPU, panel type, resolution, battery, refresh rate)
- **Search** with a 300 ms debounce and autocomplete suggestions
- **Product details** in a modal window
- **Cart** with quantity changes and automatic totals
- **Checkout** with validation of email, recipient details and phone number, and three payment options: cash on delivery, online card (Card, Google Pay, Apple Pay) and installments
- **Guest orders**: checkout works without registration
- **Authentication** with Supabase Auth (JWT), with an extended profile (full name, phone)
- **Profile page** with three tabs: Profile, Orders (order history) and Wishlist
- **Wishlist** stored in the database; purchased items are removed from it after an order
- **Responsive UI** with light and dark themes

## Tech stack

| Area | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) 16.1.4 (App Router) |
| UI | [React](https://react.dev/) 19.2.3 |
| Language | [TypeScript](https://www.typescriptlang.org/) 5 |
| Backend | [Supabase](https://supabase.com/): PostgreSQL, Auth, Row Level Security |
| Styling | [Tailwind CSS](https://tailwindcss.com/) 4 |
| Linting | [ESLint](https://eslint.org/) 9 |
| Hosting | [Vercel](https://vercel.com/) |
| Version control | Git and GitHub |

## Architecture

NovaTech works as a single page application: after the first load, filtering, search and cart changes update the page without a full reload. The backend follows the Backend-as-a-Service model, and the frontend talks to Supabase through the client in `src/lib/supabase.ts`.

### Pages

| Route | Description |
|---|---|
| `/` (`app/page.tsx`) | Catalog. Holds the central state: products, cart, categories, price range, spec filters, sort order, search text, session user and wishlist |
| `/auth` | Sign in and registration. A `profiles` row is created automatically on sign-up |
| `/profile` | Profile editing, order history and wishlist. Redirects to `/auth` if there is no session |

### Components (`app/components`)

`Header` (search, cart, profile), `Sidebar` (category navigation), `ProductGrid`, `ProductDetailsModal`, `CartModal` (checkout), `FilterBar` (quick sorting), `FilterModal` (advanced filters) and `FormComponents` (reusable form elements).

### Hooks (`app/hooks`)

- `useProducts()` loads products from the `products` table
- `useCart()` adds, removes and changes the quantity of cart items

The wishlist is kept in the state of the main page and synchronized with the `wishlist` table (INSERT and DELETE).

### Filtering logic (`src/lib/filters.ts`)

Product specs are stored as JSON and normalized before they are compared:

- extra spaces are removed (`256 GB` becomes `256GB`)
- localized units are converted (`ГБ` becomes `GB`, `ТБ` becomes `TB`)
- storage type is detected automatically (`256GB` becomes `256GB SSD`)

The module also builds the list of available specs per category, applies multi-criteria filtering (price, category, brand, specs) and sorts sizes in correct numeric order. When the category or brand changes, previously selected spec filters are cleared.

### Validation (`src/lib/validation.ts`)

- email check with regular expressions
- phone check (at least 10 digits) and formatting to `+38 0XX XXX XX XX`, used on the checkout, registration and profile forms
- sanitizing of first and last name input
- locale-aware price formatting

`validateForm()` runs before an order is placed.

### Styling

Tailwind CSS plus `app/globals.css` for global styles and animations, and a `styles.ts` helper with shared form styles. The theme uses CSS variables for light and dark mode, with red (`#E31E25`) as the primary color.

## Database (Supabase)

| Table | Purpose |
|---|---|
| `products` | Product catalog |
| `profiles` | User data (separate columns for first name, patronymic, last name, plus phone) |
| `order_history` | Placed orders. `user_id` can be `NULL`, which allows guest orders |
| `wishlist` | Saved products per user |
| `categories` | Product categories |

`products` columns: `id` (UUID, primary key), `title`, `price`, `category`, `sub_category`, `brand`, `description`, `image_url`, `specs` (JSON) and `created_at`.

Row Level Security (RLS) limits users to their own records in `wishlist` and `order_history`. The SQL schema is not included in this repository.

### Order flow

1. Add products to the cart
2. Fill in the recipient form (prefilled from the profile for signed-in users)
3. Validate the data
4. Save the order to `order_history`
5. Update the user's profile
6. Clear the cart
7. Remove the purchased items from the wishlist

## Getting started

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |

### Environment variables

Create a `.env.local` file in the project root with the values from your Supabase project:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Project structure

```text
.
├── app/
│   ├── auth/          # Sign in and registration page
│   ├── components/    # Header, Sidebar, ProductGrid, modals, filters, form components
│   ├── hooks/         # useProducts, useCart
│   ├── profile/       # Profile, orders and wishlist page
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx       # Catalog page and central state
├── public/
│   └── icons/         # Category icons (SVG)
├── src/
│   └── lib/           # filters.ts, validation.ts, supabase.ts
├── eslint.config.mjs
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

## Screenshots

<!-- Add screenshots here: catalog, filters, cart and checkout, profile -->
