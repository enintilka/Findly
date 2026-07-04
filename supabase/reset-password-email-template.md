# Supabase password reset email template

For password reset links to work reliably in Next.js (including when opened from Gmail or another browser), update the **Reset password** email template in Supabase.

1. Open **Supabase Dashboard → Authentication → Email Templates → Reset password**
2. Replace the reset link with:

```html
<h2>Reset your password</h2>
<p>Follow this link to reset your Findly password:</p>
<p>
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/reset-password">
    Reset password
  </a>
</p>
```

3. Save the template.

Also add these **Redirect URLs** under **Authentication → URL Configuration**:

```
http://localhost:3000/auth/reset-password
http://localhost:3000/auth/confirm
https://YOUR-VERCEL-URL.vercel.app/auth/reset-password
https://YOUR-VERCEL-URL.vercel.app/auth/confirm
```

After saving, request a **new** reset email. Old emails will not work.
