# Workshops Live Feed

A lightweight live feed for workshops. Participants post via code and see results on a shared screen in real-time.

**Live URL:** https://live.segunakinyemi.com

## What This Does

1. You give participants the endpoint URL and a secret `WorkshopKey`
2. They write code (Python, JavaScript, PowerShell, Bash, or cURL) to POST a message
3. Their post appears on the live feed within seconds
4. You display the feed on a projector for everyone to see

## Architecture

```
Student Code                    Vercel Function              Airtable
     |                               |                          |
     |  POST /api/post               |                          |
     |  {Name, Message, Workshop,    |                          |
     |   WorkshopKey}                |                          |
     |------------------------------>|                          |
     |                               |  Validate WorkshopKey    |
     |                               |  Write via Airtable API  |
     |                               |------------------------->|
     |                               |<-------------------------|
     |  {success: true}              |                          |
     |<------------------------------|                          |
```

- **Vercel** hosts the static site and serverless function
- **Airtable** stores posts and provides the embedded gallery view
- **WorkshopKey** prevents random internet submissions

## Required Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `Name` | string | Yes | Participant's name |
| `Message` | string | Yes | The message content |
| `Workshop` | string | Yes | Workshop name (e.g., "UNC Charlotte 2026") |
| `Tags` | string | No | Comma-separated tags |
| `WorkshopKey` | string | Yes | Secret password |

## Environment Variables

Set these in Vercel dashboard (Settings → Environment Variables):

| Variable | Description |
|----------|-------------|
| `AIRTABLE_API_KEY` | Your Airtable Personal Access Token |
| `AIRTABLE_BASE_ID` | Airtable base ID (e.g., `appC0ZE44OOVEtRsQ`) |
| `WORKSHOP_KEY` | The secret password participants need |

## Vercel Setup

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import `segunak/workshops-live-feed` from GitHub
4. Framework Preset: **Other**
5. Click **Deploy**
6. After deploy, go to **Settings** → **Environment Variables**
7. Add `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, and `WORKSHOP_KEY`
8. Redeploy for env vars to take effect

## Custom Domain Setup

1. In Vercel, go to **Settings** → **Domains**
2. Add `live.segunakinyemi.com`
3. In your DNS provider, add a CNAME record:
   - Name: `live`
   - Value: `cname.vercel-dns.com`
4. Wait for DNS propagation (usually minutes)

## Local Development

1. Copy `.env.example` to `.env` and fill in values
2. Run `npx vercel dev`
3. Open http://localhost:3000

## Airtable Setup

**Base ID:** `appC0ZE44OOVEtRsQ`

**Table:** `Posts` with fields:
- `Name` (Single line text)
- `Message` (Long text)
- `Workshop` (Single line text)
- `Tags` (Single line text or Multi-select)
- `Created` (Created time, auto)

**View:** Create a gallery or grid view for the embed. The embed URL is used in `public/index.html`.

## Workshop Usage

**Before the workshop:**
1. Test the endpoint using scripts in `tools/`
2. Clear old posts from Airtable if needed
3. Open the live feed page on a projector

**During the workshop:**
1. Share the URL: `https://live.segunakinyemi.com`
2. Give participants the `WorkshopKey` verbally
3. Tell them the `Workshop` value to use (e.g., "UNC Charlotte 2026")
4. Enable Live Mode on the feed page for auto-refresh

**After:**
- Export posts from Airtable if you want a record
- Posts stay in Airtable until you delete them

## Test Scripts

See `tools/` folder for test scripts in multiple languages.
