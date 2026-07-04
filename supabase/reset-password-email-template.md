# Supabase password reset setup (required for production)

If reset emails open **localhost:3000**, Supabase is still using your local dev URL.
Fix **both** sections below, then request a **new** reset email.

## 1. URL Configuration (required)

Open **Supabase Dashboard → Authentication → URL Configuration**

### Site URL
Set this to your live Vercel URL (example):
```
https://findly.vercel.app
```
**Do not leave this as `http://localhost:3000` for production.**

### Redirect URLs
Add every URL below (replace with your real Vercel URL):
```
https://YOUR-VERCEL-URL.vercel.app/auth/reset-password
https://YOUR-VERCEL-URL.vercel.app/auth/confirm
https://YOUR-VERCEL-URL.vercel.app/auth/callback
http://localhost:3000/auth/reset-password
http://localhost:3000/auth/confirm
http://localhost:3000/auth/callback
```

Click **Save**.

## 2. Reset password email template (required)

Open **Authentication → Email Templates → Reset password**

Use the **default Supabase link** (recommended — uses the redirect URL from the app):

```html
<h2>Reset your password</h2>
<p>Follow this link to reset your Findly password:</p>
<p><a href="{{ .ConfirmationURL }}">Reset password</a></p>
```

**Do not use** `{{ .SiteURL }}` in the link unless Site URL (step 1) is already your Vercel URL.

Click **Save**.

## 3. Vercel environment variable (recommended)

In **Vercel → Project → Settings → Environment Variables**, add:

```
NEXT_PUBLIC_SITE_URL=https://YOUR-VERCEL-URL.vercel.app
```

Redeploy after saving.

## 4. Request a new email

Old emails still contain the old localhost link. After steps 1–3:

1. Wait for Vercel redeploy (if you changed env vars)
2. Open the **Vercel** forgot-password page
3. Request a **new** reset email
4. Click the **new** link only

## Checklist

- [ ] Site URL = Vercel URL (not localhost)
- [ ] Redirect URLs include Vercel `/auth/*` paths
- [ ] Email template uses `{{ .ConfirmationURL }}`
- [ ] `NEXT_PUBLIC_SITE_URL` set on Vercel
- [ ] New reset email requested after changes
