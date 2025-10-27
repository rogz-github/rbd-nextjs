# Vercel Production Setup for Admin Access

## Issue
Cannot access `/~admin/dashboard` in Vercel production environment.

## Root Causes
1. **Environment Variables**: `NEXTAUTH_URL` and `NEXTAUTH_SECRET` must be set correctly in Vercel
2. **Cookie Settings**: Session cookies need to be configured properly for production
3. **Middleware Matcher**: The middleware needs to properly match admin routes

## Required Environment Variables in Vercel

Go to your Vercel project settings → Environment Variables and ensure these are set:

### Required Variables:

```
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your-production-secret-key-here
DATABASE_URL=your-neon-postgres-connection-string
ENCRYPTION_KEY=your-encryption-key
```

### Important Notes:

1. **NEXTAUTH_URL**: Must be set to your production domain (e.g., `https://rbd-nextjs-rogzgithubs-projects.vercel.app`)
   - Do NOT use `http://localhost:3000` in production
   - Must be HTTPS for production

2. **NEXTAUTH_SECRET**: Must be a strong, random secret key
   - Generate using: `openssl rand -base64 32`
   - Must be the same for all environments if you want session compatibility

3. **DATABASE_URL**: Your Neon PostgreSQL connection string
   - Format: `postgresql://user:pass@host:port/db?sslmode=require`

## Changes Made to Fix the Issue

### 1. Middleware Updates (`src/middleware.ts`)
- Added comprehensive logging to debug admin route access
- Improved pathname matching for admin routes
- Better handling of edge cases

### 2. Auth Configuration (`src/lib/auth.ts`)
- Cookie settings are properly configured for production
- Secure flag is set based on environment
- SameSite policy set to 'lax' for better compatibility

### 3. Matcher Configuration
- Updated to properly match admin routes: `/~admin/:path*` and `/admin/:path*`
- Excludes static assets and API auth routes

## Testing Checklist

After deploying to Vercel:

1. ✅ Go to `https://your-domain.vercel.app/~admin`
2. ✅ Enter admin credentials (from Start Up.txt)
3. ✅ Should redirect to `https://your-domain.vercel.app/~admin/dashboard`
4. ✅ Verify session persists (no redirect loops)

## Admin Credentials (from Start Up.txt)

**Super Admin:**
- Email: super_admin@gmail.com
- Username: super_admin
- Password: Rbd@2k25

**Admin:**
- Email: admin@gmail.com
- Username: rbd_admin
- Password: @Rbd../2k23

## Troubleshooting

### If you still can't access the admin dashboard:

1. **Check Browser Console**: Look for authentication errors
2. **Check Vercel Logs**: Go to Vercel Dashboard → Logs to see server-side errors
3. **Verify Environment Variables**: Double-check all variables are set correctly
4. **Clear Browser Cookies**: Old session cookies might be causing issues
5. **Check Network Tab**: Verify session cookies are being set properly

### Common Issues:

- **Redirect Loop**: `NEXTAUTH_URL` is incorrect
- **Session Not Persisting**: `NEXTAUTH_SECRET` is missing or incorrect
- **403 Forbidden**: User role not set correctly in database
- **Database Connection**: `DATABASE_URL` is incorrect or expired

## Deployment Steps

1. Push changes to GitHub
2. Vercel will auto-deploy
3. Verify environment variables are set in Vercel
4. Test admin access at production URL

## Additional Notes

- The `~admin` route is a Next.js convention (routes starting with `~` are private)
- Admin routes are protected by middleware
- Client-side components use `useSession` hook for additional protection

