# TEN TEN — React + Firebase Web App

A ReactJS (Vite) + Firebase rebuild of the original static TEN TEN website,
built to meet Assignment 2 requirements: public marketing pages, full
authentication with two roles (user/admin), a protected admin dashboard, and
complete CRUD for products backed by Cloud Firestore. The original
black/white luxury design, copy, images, and branding are preserved
throughout.

## Tech Stack

- React 19 + Vite
- React Router v7 (nested routes, protected routes)
- Firebase Authentication (email/password, password reset)
- Cloud Firestore (products, users, contact messages)
- Bootstrap 5 + Bootstrap Icons
- React Toastify (toast notifications)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Firebase

Create a Firebase project at https://console.firebase.google.com, then:

1. Enable **Authentication → Sign-in method → Email/Password**.
2. Create a **Cloud Firestore** database.
3. Enable **Storage** (Build → Storage → Get started) — this is required
   for profile photo uploads on the user Account page. Any default
   bucket location works.
4. Apply the **Firebase Storage security rules** in the "Profile Photos"
   section below (Storage → Rules) — a fresh Storage bucket defaults to
   fully locked, so uploads will fail with a permission error until this
   is published.
5. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

6. Fill in your Firebase web app config values (Project Settings → General →
   Your apps → SDK setup and configuration) and your admin email list:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_ADMIN_EMAILS=you@example.com
```

**Important — `.env` formatting:** this is a plain `KEY=value` file, not
JSON or JavaScript.
- Do **not** wrap values in quotes: `VITE_FIREBASE_API_KEY=AIzaSy...`, not
  `VITE_FIREBASE_API_KEY="AIzaSy..."`.
- Do **not** add trailing commas at the end of a line.
- `VITE_ADMIN_EMAILS` accepts a comma-separated list *inside the value
  itself*: `VITE_ADMIN_EMAILS=a@x.com,b@x.com`.

7. Apply the Firestore Security Rules below in the Firebase Console
   (Firestore Database → Rules).

### 3. Run the app

```bash
npm run dev
```

Visit http://localhost:5173. Restart the dev server after any change to
`.env` — Vite only reads it at startup.

### 4. Build for production

```bash
npm run build
npm run preview
```

## Two Roles: User vs Admin

Anyone can register or log in — there's no restriction on who gets an
account. What's gated is the **admin dashboard** at `/dashboard`.

- `VITE_ADMIN_EMAILS` in `.env` is a comma-separated allowlist of emails.
- On registration, `registerUser()` checks that list and stores
  `role: "admin"` or `role: "user"` on the person's `users/{uid}` document.
- Logging in as an admin lands on `/dashboard`; a regular user lands on the
  public Home page.
- If a non-admin account tries to open `/dashboard` directly, `ProtectedRoute`
  redirects them to Home — they stay logged in, they just don't get
  dashboard access.
- If nobody is logged in at all, `/dashboard` redirects to `/login`.

**This client-side check is a UX convenience, not real security** — anyone
with browser dev tools can read the bundled JS. The Firestore Security
Rules below are what actually enforce who can write product/user data;
keep the email list in both places in sync.

### Creating your first admin account

1. Add your email to `VITE_ADMIN_EMAILS` in `.env` (and restart `npm run dev`).
2. Add the same email to the `isAdmin()` allowlist in your Firestore rules
   (see below) and publish the rules in the Firebase Console.
3. Go to `/register` and sign up with that exact email address.
4. You'll be redirected straight to `/dashboard`.

No passwords are stored anywhere in this repo — you choose your own
password at registration time, in the Firebase Console, or via the
"Forgot Password" flow.

### Self-healing `users/{uid}` documents

`registerUser()` is the only place that normally creates a `users/{uid}`
Firestore document. If an account was ever created a different way —
added directly in Firebase Console → Authentication → Add user, imported,
or created before this document existed in an older version of the
app — it won't have a matching Firestore document, and won't show up in
`/dashboard/users`.

To fix this without needing the Firebase Admin SDK, `AuthContext` calls
`ensureUserDocument(user)` (in `src/firebase/auth.js`) on every login and
every session resume (i.e. every page load while already logged in). It
checks whether `users/{uid}` exists and creates it — with the correct
`role` based on `VITE_ADMIN_EMAILS` — only if it's missing. It never
overwrites an existing document, so it's safe to run unconditionally.

**In practice:** if `/dashboard/users` is missing accounts that you know
exist in Firebase Authentication, just have that person log in once (or
refresh the page while already logged in) — the document gets created
automatically on the next auth state change, no manual steps needed.

## Suggested Firestore Security Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null &&
        request.auth.token.email in [
          'you@example.com'
        ];
    }

    match /products/{productId} {
      allow read: if true;
      allow create, update, delete: if isAdmin();
    }
    match /users/{userId} {
      // Anyone can create their own profile doc on registration;
      // only the user themself or an admin can read/update it.
      allow create: if request.auth != null && request.auth.uid == userId;
      allow read, update: if request.auth != null &&
        (request.auth.uid == userId || isAdmin());
      allow delete: if isAdmin();
    }
    match /contact_messages/{messageId} {
      // Anyone can submit a message from the public Contact page;
      // only admins can read, mark read/unread, or delete them —
      // this collection is never publicly readable.
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }
    match /carts/{userId} {
      // Each user's cart is private to them (and admins, for support).
      allow read, write: if request.auth != null &&
        (request.auth.uid == userId || isAdmin());
    }
    match /orders/{orderId} {
      // Anyone (including guests) can place an order; only the order's
      // own owner or an admin can read it back; only admins can change
      // its status or delete it.
      allow create: if true;
      allow read: if isAdmin() ||
        (request.auth != null && resource.data.uid == request.auth.uid);
      allow update, delete: if isAdmin();
    }
  }
}
```

This enforces, server-side:
- **Products**: anyone can read; only admins can create/update/delete.
- **Users**: a person can create/read/update their own profile; only
  admins can read/update everyone's, or delete one.
- **Contact messages**: anyone can submit; only admins can read them.
- **Carts**: private per user (plus admin visibility for support).
- **Orders**: anyone (guest or logged in) can place one; only the
  order's owner or an admin can read it; only admins can update status
  or delete.

**Note on the "My Account" feature below:** the `users` and `orders`
rules above already enforce "a person can only read their own data" —
they were written this way from the start, they just weren't used by
any UI until now. No rule changes were needed to add Account /
Order History.

## Firebase Storage Security Rules (Profile Photos)

Profile photo uploads use Firebase **Storage**, which has its own rules
system separate from Firestore. In the Firebase Console, go to
**Storage → Rules** and publish:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile_photos/{userId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.auth.uid == userId &&
        request.resource.size < 5 * 1024 * 1024 &&
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

This lets anyone view profile photos (they're shown in the navbar and
Account page), but only lets a user upload into their **own**
`profile_photos/{their-uid}/` folder, capped at 5MB and images only —
matching the client-side validation in `src/firebase/storage.js`.

## My Account (Normal Users)

Every signed-in user — not just admins — gets an account area:

- **`/account`** — profile header (photo, name, email, "Member since"
  date), an Edit Profile button, account stats (Orders / Pending /
  Completed / Total Spent), and a Recent Orders list.
- **`/account/orders`** — full order history with a status filter.
  Clicking "View" opens a read-only order detail modal.

Both routes are guarded by `UserProtectedRoute` (any logged-in user),
which is intentionally a **separate** component from the admin-only
`ProtectedRoute` — the two access rules never get mixed together.

**Data flow:** `Checkout.jsx` already stamped every order with
`uid: currentUser?.uid || null`. The Account pages call
`subscribeToUserOrders(uid, ...)` — a function that already existed in
`src/firebase/orders.js` from the shopping-cart build but had no caller
yet — which queries `where('uid', '==', uid)`, so a user only ever
receives their own orders, enforced both by the query and by the
Firestore rule above.

**Editing a profile:** `EditProfileModal.jsx` updates both the Firebase
Auth user (`displayName`/`photoURL`, kept as a fallback) and the
Firestore `users/{uid}` document (the actual source of truth the UI
reads from). Reading from Firestore via a live `onSnapshot`
(`useUserProfile.js`) means the page updates immediately after saving,
with no need to manually refresh the Auth context.

**Changing email is not supported.** The email field is shown read-only
on both the Account page and Edit Profile modal — it belongs to Firebase
Authentication, and Firebase requires a separate re-verification flow
(`verifyBeforeUpdateEmail`) to change it safely, which is out of scope
for this assignment.

## Products: Firestore Is the Single Source of Truth

`src/pages/Services.jsx` (public) and `src/pages/dashboard/Products.jsx`
(admin) both read live from the Firestore `products` collection via
`subscribeToProducts()` — there is **no static fallback data shown in
production**. If Firestore has no products yet, the Services page shows
"No products available." rather than silently displaying placeholder data.

`src/utils/seedProducts.js` still exists, but it is used for exactly one
thing: the **"Seed Sample Products"** button on `/dashboard/products`
(visible only when the collection is empty), which does a one-time bulk
write of the original 7-product catalogue into Firestore. Once any product
exists, that button disappears — it can't be used to create duplicates.

## Project Structure

```
src/
├── assets/            # global.css + brand images
├── components/        # Navbar, Footer, Modal, ProductCard, Sidebar, etc.
├── context/           # AuthContext (Firebase auth state)
├── firebase/          # firebase.js, auth.js, firestore.js — the data-access layer
├── hooks/              # useProducts (live Firestore subscription)
├── layouts/           # PublicLayout, DashboardLayout
├── pages/
│   ├── auth/           # Login, Register, ForgotPassword
│   ├── dashboard/     # Overview, Products, ProductForm, Users, Profile, Settings
│   ├── Home.jsx, About.jsx, Contact.jsx, Services.jsx, NotFound.jsx
├── routes/             # ProtectedRoute
├── utils/              # adminAllowlist.js, authErrors.js, seedProducts.js
├── App.jsx
└── main.jsx
```

## Routes

| Path | Description |
|---|---|
| `/` | Home |
| `/about` | About |
| `/services` | Products/Services — live Firestore data, search/filter/sort |
| `/cart` | Shopping cart — add/remove items, adjust quantity |
| `/checkout` | Delivery details form, places the order |
| `/order-confirmation/:orderId` | Order summary after checkout |
| `/account` | My Account — profile, stats, recent orders — **any signed-in user** |
| `/account/orders` | Full order history with status filter — **any signed-in user** |
| `/contact` | Contact form (writes to Firestore `contact_messages`) |
| `/login`, `/register`, `/forgot-password` | Auth (open to everyone) |
| `/dashboard` | Overview — **admin only** |
| `/dashboard/products` | Manage products — CRUD, search, sort, filter, delete confirmation, one-time seed |
| `/dashboard/products/new`, `/dashboard/products/:id/edit` | Product form |
| `/dashboard/orders` | Order history — view details, update status |
| `/dashboard/contact-messages` | Contact messages — search, filter, view (marks read), toggle read/unread, delete |
| `/dashboard/users` | Registered users list |
| `/dashboard/profile` | Admin profile |
| `/dashboard/settings` | Password reset, logout |
| `*` | 404 Not Found |

## Shopping Flow

- **Cart** (`src/context/CartContext.jsx`): guests get an in-memory cart
  that resets on refresh; logged-in users get their cart mirrored to
  Firestore at `carts/{uid}`, so it survives refreshes and device
  switches. Adding items while logged out and then logging in merges
  the guest cart into the saved one (quantities combined).
- **Checkout**: collects name/email/phone/address, validates the form,
  and creates a document in `orders` on submit. No real payment is
  processed — this is a demo checkout, which the page tells the shopper
  explicitly rather than pretending to charge a card.
- **Order Confirmation**: shown right after checkout with the order ID
  and a summary.
- **Admin → Orders**: every order shows up live in
  `/dashboard/orders`, with search/filter/sort and a status dropdown
  (pending → processing → completed/cancelled).

## Notes

- Deleting a product from the dashboard always shows a confirmation modal.
- All forms (contact, login, register, forgot password, product form,
  profile) are validated client-side before submission, with disabled
  submit buttons while a request is in flight to prevent duplicate
  submissions.
- Firebase Auth error codes are mapped to friendly messages in
  `src/utils/authErrors.js`, shared by Login, Register, and ForgotPassword.