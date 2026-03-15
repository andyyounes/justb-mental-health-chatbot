# JustB Deployment Guide 🚀

This guide will help you deploy JustB to production.

## Prerequisites

- [Supabase](https://supabase.com) account
- [Groq](https://groq.com) API key
- [Vercel](https://vercel.com) or similar hosting (optional for frontend)

## Step 1: Supabase Setup

### 1.1 Create a New Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details
4. Wait for project initialization

### 1.2 Get Your Credentials

From your Supabase project dashboard:
1. Go to **Settings** → **API**
2. Copy the following:
   - `Project URL` → This is your `SUPABASE_URL`
   - `anon/public` key → This is your `SUPABASE_ANON_KEY`
   - `service_role` key → This is your `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **NEVER** commit `SUPABASE_SERVICE_ROLE_KEY` to Git or expose it in frontend code!

### 1.3 Database Setup

The `kv_store_97cb3ddd` table will be created automatically by the Edge Function on first run. No manual SQL required!

## Step 2: Groq API Setup

### 2.1 Get API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to **API Keys**
4. Create a new API key
5. Copy the key → This is your `GROQ_API_KEY`

## Step 3: Deploy Supabase Edge Function

### 3.1 Install Supabase CLI

```bash
npm install -g supabase
```

### 3.2 Login to Supabase

```bash
supabase login
```

### 3.3 Link Your Project

```bash
supabase link --project-ref your-project-ref
```

You can find your project ref in the Supabase dashboard URL:
`https://app.supabase.com/project/[your-project-ref]`

### 3.4 Set Environment Variables

```bash
# Set Groq API key
supabase secrets set GROQ_API_KEY=your_groq_api_key

# Verify secrets
supabase secrets list
```

### 3.5 Deploy the Edge Function

```bash
supabase functions deploy make-server-97cb3ddd
```

### 3.6 Verify Deployment

Test the function:
```bash
curl -i --location --request POST \
  'https://your-project-ref.supabase.co/functions/v1/make-server-97cb3ddd/health' \
  --header 'Authorization: Bearer your-anon-key'
```

Expected response:
```json
{"status":"healthy"}
```

## Step 4: Deploy Frontend

### Option A: Vercel (Recommended)

#### 4.1 Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import `andyyounes/justb-mental-health-chatbot`
4. Configure project:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

#### 4.2 Set Environment Variables

In Vercel project settings → Environment Variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

⚠️ Note: Do NOT add `SUPABASE_SERVICE_ROLE_KEY` or `GROQ_API_KEY` here - they should only be in Supabase Edge Function secrets!

#### 4.3 Deploy

Click "Deploy" and wait for build to complete.

### Option B: Self-Hosting

#### 4.1 Build the Project

```bash
npm install
npm run build
```

#### 4.2 Serve Static Files

The `dist/` folder contains your built application. Serve it with:

- **Nginx**
- **Apache**
- **Caddy**
- Any static file server

Example with `serve`:
```bash
npm install -g serve
serve -s dist -l 3000
```

## Step 5: Post-Deployment Checks

### 5.1 Test Authentication

1. Visit your deployed app
2. Click "Get Started" or "Sign Up"
3. Create an account
4. Verify you can sign in

### 5.2 Test Chat Functionality

1. Send a test message
2. Verify AI responds
3. Try quick topic buttons
4. Check if action cards appear

### 5.3 Test Activities Page

1. Navigate to Activities
2. Try a breathing exercise
3. Check if animations work

### 5.4 Test Theme Toggle

1. Open profile dropdown
2. Switch between System/Dark/Light modes
3. Verify theme persists on page reload

## Step 6: Monitoring & Logs

### Supabase Edge Function Logs

View logs in real-time:
```bash
supabase functions logs make-server-97cb3ddd
```

Or in Supabase Dashboard:
**Functions** → **make-server-97cb3ddd** → **Logs**

### Database Monitoring

Check database activity:
**Database** → **Logs** in Supabase dashboard

## Troubleshooting

### "Failed to fetch" errors

**Problem**: Frontend can't reach Edge Function

**Solution**:
1. Check CORS is enabled in `/supabase/functions/server/index.tsx`
2. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
3. Check Edge Function is deployed: `supabase functions list`

### "GROQ_API_KEY is not set"

**Problem**: Missing API key in Edge Function

**Solution**:
```bash
supabase secrets set GROQ_API_KEY=your_key
supabase functions deploy make-server-97cb3ddd
```

### "Unauthorized" errors

**Problem**: Invalid auth tokens

**Solution**:
1. Check `SUPABASE_ANON_KEY` matches your project
2. Clear browser localStorage and re-authenticate
3. Verify anonymous auth is enabled in Supabase:
   **Authentication** → **Settings** → Enable "Anonymous sign-ins"

### Build fails on Vercel

**Problem**: Missing dependencies or wrong Node version

**Solution**:
1. Set Node.js version in Vercel: **Settings** → **General** → Node.js Version: `18.x`
2. Check `package.json` has all dependencies
3. Try `npm install` locally first

### Theme not persisting

**Problem**: localStorage not working

**Solution**:
1. Check browser allows localStorage
2. Verify `html[data-theme]` attribute is being set
3. Check `/styles/globals.css` has theme overrides

## Security Checklist

- [ ] `SUPABASE_SERVICE_ROLE_KEY` is ONLY in Supabase secrets
- [ ] `GROQ_API_KEY` is ONLY in Supabase secrets
- [ ] `.gitignore` includes `.env` files
- [ ] Frontend only uses `SUPABASE_ANON_KEY`
- [ ] CORS is properly configured
- [ ] Rate limiting is considered for production

## Optional: Custom Domain

### Vercel

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

### Supabase Edge Function (optional)

You can also set up a custom domain for your Edge Function:
**Settings** → **API** → **Custom Domains**

## Performance Optimization

### Frontend

1. **Enable caching** in your hosting provider
2. **CDN** for static assets (Vercel does this automatically)
3. **Compression** (gzip/brotli) for smaller bundle sizes

### Backend

1. **Enable Supabase connection pooling** for database
2. **Monitor Edge Function cold starts** (Supabase keeps functions warm with recent activity)
3. **Consider caching** frequent queries in KV store

## Backup & Recovery

### Database Backup

Supabase automatically backs up your database daily.

Manual backup:
```bash
supabase db dump -f backup.sql
```

### Environment Variables Backup

Keep a secure copy of all environment variables in a password manager.

## Support

For issues or questions:
- [GitHub Issues](https://github.com/andyyounes/justb-mental-health-chatbot/issues)
- [Supabase Docs](https://supabase.com/docs)
- [Groq Docs](https://console.groq.com/docs)

---

**Congratulations! 🎉** Your JustB mental health chatbot is now live and helping people!
