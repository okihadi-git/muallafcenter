# HijrahApp — MVP starter

Mobile-first Islamic companion app built with Next.js App Router, TypeScript, Tailwind CSS and Lucide React.

## Included in this starter
- Responsive dashboard shell and bottom navigation
- Gregorian and Hijri date display via `Intl`
- GPS-based prayer schedule using Aladhan API
- Next-prayer countdown
- Daily ayat/motivation card (sample content)
- Daily fardhu and sunnah tracker persisted in localStorage
- Optional Supabase client scaffold (local-first if env vars are empty)

## Run locally
1. Install Node.js 20+.
2. Copy `.env.example` to `.env.local`.
3. Run `npm install`.
4. Run `npm run dev`.
5. Open http://localhost:3000.

Prayer times request browser location only after the user presses **Lokasi**. The app needs HTTPS in production for browser geolocation. Localhost is permitted during development.

## Prayer calculation
The Aladhan API method is configurable with `NEXT_PUBLIC_PRAYER_METHOD`. The starter defaults to method `20` as a starting point, not as a universal Indonesian authority setting. Confirm the calculation method, Asr juristic setting, timezone and local adjustments against the user's local mosque / Ministry of Religious Affairs calendar before production use.

## Important MVP notes
- `localStorage` is device- and browser-specific. Clearing browser data can remove the tracker.
- The Supabase client is only wired as an optional foundation. Authentication, database schema, row-level security and sync conflict handling still need to be implemented before enabling cloud sync.
- Hijri date uses the browser's `islamic-umalqura` calendar and may differ from local official announcements.
- The displayed ayat is static sample content. Production should use a verified Quran dataset and attribution.
- Notification and alarm behavior needs a service worker / push strategy for reliable background reminders. Browser timers alone cannot guarantee an alarm when the app is closed.
- Device compass support differs across browsers and requires a separate calibration / permission flow.
- Women's health guidance must be reviewed by qualified scholars and health professionals. Avoid automatically issuing religious rulings from cycle estimates; make the feature configurable and educational, with privacy-first local storage.

## Suggested next implementation milestones
1. Add full Quran dataset, audio recitations and Surah detail routes.
2. Build step-by-step wudhu and prayer guide with reviewed content.
3. Add Qibla bearing + device orientation calibration.
4. Add mosque map using OpenStreetMap / Overpass with attribution and rate limits.
5. Add opt-in Tahajud reminders with clear browser limitations.
6. Add optional Supabase auth, profile, tracker sync and RLS policies.
7. Build a private menstrual-cycle module with explicit consent and non-judgmental UX.
