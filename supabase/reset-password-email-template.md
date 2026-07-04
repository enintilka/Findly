# Supabase password reset email template

Password reset links use your **Supabase Site URL**. If that is still `http://localhost:3000`, reset emails will send users to localhost even when they use the Vercel app.

## 1. Set production Site URL (required)

1. Open **Supabase Dashboard → Authentication → URL Configuration**
2. Set **Site URL** to your live app, for example:
   ```
   https://findly.vercel.app
   ```
   (Use your exact Vercel URL or custom domain — **not** localhost.)
3. Under **Redirect URLs**, add:
   ```
   https://YOUR-VERCEL-URL.vercel.app/auth/reset-password
   https://YOUR-VERCEL-URL.vercel.app/auth/confirm
   https://YOUR-VERCEL-URL.vercel.app/auth/callback
   http://localhost:3000/auth/reset-password
   http://localhost:3000/auth/confirm
   http://localhost:3000/auth/callback
   ```
4. Save.

## 2. Optional: set `NEXT_PUBLIC_SITE_URL` on Vercel

In **Vercel → Project → Settings → Environment Variables**, add:

```
NEXT_PUBLIC_SITE_URL=https://YOUR-VERCEL-URL.vercel.app
```

This keeps auth redirects correct if you use a custom domain later.

## 3. Email template

Update **Authentication → Email Templates → Reset password**:

```html
<h2>Reset your password</h2>
<p>Follow this link to reset your Findly password:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/reset-password">
    Reset password
  </a>
</p>
```

Save the template.

## 4. Request a new reset email

Old emails still contain the old localhost link. After steps 1–3, request a **new** reset email from the live Vercel site.
