---
name: "Fix Login Page & Auth Flow"
overview: "Fix the login page header visibility, improve the layout/hero, remove Google login, add forgot-password flow, and update the Navbar to show a User icon that links to /auth/login alongside the CTA button."
todos:
  - id: "navbar"
    content: "Add forceSolid prop to Navbar and add separate User icon → /auth/login next to CTA"
    status: not_started
  - id: "login-page"
    content: "Fix login page: use forceSolid Navbar, remove Google button, add forgot password link"
    status: not_started
  - id: "prisma-schema"
    content: "Add PasswordResetToken model to prisma/schema.prisma"
    status: not_started
  - id: "auth-actions"
    content: "Add requestPasswordReset and resetPassword server actions in lib/actions/auth.ts"
    status: not_started
  - id: "email-fn"
    content: "Add sendPasswordResetEmail function to lib/email.ts"
    status: not_started
  - id: "forgot-page"
    content: "Create app/auth/forgot-password/page.tsx"
    status: not_started
  - id: "reset-page"
    content: "Create app/auth/reset-password/page.tsx"
    status: not_started
createdAt: "2026-05-13T11:02:00.181Z"
updatedAt: "2026-05-13T11:02:00.181Z"
---

# Fix Login Page & Auth Flow

## Problem Analysis

- **Navbar on login page is invisible**: Navbar starts transparent (`text-white/80`) but login page has `bg-background` (light), making white text invisible.
- **Google button must be removed**: Lines 276–285 in `app/auth/login/page.tsx`.
- **Forgot password missing**: No `/auth/forgot-password` page, no reset token model in Prisma, no reset email.
- **Navbar CTA**: Currently just one `<Link>` with User icon embedded. User wants CTA button + a separate User icon linking to `/auth/login`.

---

## Changes

### 1. `components/Navbar.tsx`
- Add `forceSolid?: boolean` prop that overrides scroll-based transparency (sets `isTransparent = false`).
- When **not logged in**, replace the single CTA link with two elements side-by-side:
  - CTA button → `ctaUrl` (existing behavior)
  - `<Link href="/auth/login">` with `<User />` icon (new)
- Style the User icon with the same `iconColor` variable as other icon buttons.

### 2. `app/auth/login/page.tsx`
- Pass `<Navbar forceSolid />` so the navbar appears solid/visible on the light background.
- Remove the Google divider + button (lines 276–285).
- Add a `<Link href="/auth/forgot-password">` link between the password field and the submit button.

### 3. `prisma/schema.prisma`
- Add `PasswordResetToken` model:
  ```prisma
  model PasswordResetToken {
    id        String   @id @default(cuid())
    token     String   @unique
    email     String
    expiresAt DateTime
    used      Boolean  @default(false)
    createdAt DateTime @default(now())
  }
  ```
- Requires running `npx prisma db push` (or `migrate dev`) after.

### 4. `lib/actions/auth.ts`
- Add `requestPasswordReset(formData)`: finds user by email, creates a `PasswordResetToken` (1-hour expiry), calls `sendPasswordResetEmail`.
- Add `resetPassword(formData)`: validates token (exists, not expired, not used), hashes new password, updates user, marks token as used.

### 5. `lib/email.ts`
- Add `sendPasswordResetEmail(email, name, resetUrl)` using same HTML template pattern as existing functions.

### 6. `app/auth/forgot-password/page.tsx` (NEW)
- Simple form with email input + submit. Uses `requestPasswordReset`.
- Shows success state: "Revisa tu correo" message.
- Includes `<Navbar forceSolid />`.

### 7. `app/auth/reset-password/page.tsx` (NEW)
- Reads `?token=` from URL params, shows new password + confirm form.
- Uses `resetPassword` action.
- On success, redirects to `/auth/login?registered=true`-style success message.
- Includes `<Navbar forceSolid />`.

---

## Files Modified
- `components/Navbar.tsx`
- `app/auth/login/page.tsx`
- `prisma/schema.prisma`
- `lib/actions/auth.ts`
- `lib/email.ts`

## Files Created
- `app/auth/forgot-password/page.tsx`
- `app/auth/reset-password/page.tsx`

## Post-implementation
Run `npx prisma db push` to apply the new schema model.
