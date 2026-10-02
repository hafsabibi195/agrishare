# AgriShare

AgriShare is a farm equipment rental platform for farmers and equipment owners in Pakistan.

## Test accounts

- Farmer: `farmer@agrishare.pk` / password `Agri@1234`
- Owner: `owner@agrishare.pk` / password `Agri@1234`
- Admin: `admin@agrishare.pk` / password `Agri@1234`

## Run locally

1. In the client folder, install dependencies if needed: `cd client && npm install`
2. Start the app: `cd client && npm run dev`
3. Open <http://localhost:3000>

The app is intentionally frontend-only for this product walkthrough. It does not depend on `/api/*` routes or any MongoDB/backend service.

## Live location

Live location uses Firebase Realtime Database when configured. Add these variables to `client/.env.local` for local development and to the Vercel project's Environment Variables for deployment:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

Use values from Firebase Console → Project settings → General, and the Realtime Database URL shown in the database console. These are public client configuration values; location read/write access is governed by your Realtime Database rules. The app uses mock app accounts, not Firebase Authentication, so do not treat client-side role checks as access control. Redeploy after adding or changing Vercel variables. Without Firebase configuration or when its connection is unavailable, same-browser tabs use BroadcastChannel and localStorage instead.

### Test in two laptop tabs

1. Run `cd client && npm run dev` and open the local site in Tab A.
2. Sign in to a farmer or owner account, open Find equipment, turn on **Share live location**, and allow location access.
3. Open the same origin in Tab B, sign in at `/admin/login` with the admin account, then open `/admin/map` and enable **Live users** if needed.
4. The user should appear in **Live now** and on the map. Without Firebase configuration the map status reads **Local mode**. Stop sharing or close the user tab to verify the user becomes inactive/last seen.

### Test phone and laptop after deploying to Vercel

1. Add all seven `NEXT_PUBLIC_FIREBASE_*` variables above in Vercel → Project → Settings → Environment Variables for the environments you will test, then redeploy.
2. Enable Realtime Database in Firebase Console and configure database rules that permit the intended clients to read and write `liveLocations/{userId}`.
3. On the laptop, open the deployed HTTPS URL, sign in as admin, and go to `/admin/map`; confirm **Live (Firebase)** appears.
4. On the phone, open the same deployed HTTPS URL, sign in as a farmer or owner, enable **Share live location**, and allow precise location access. Keep the page open while moving.
5. Confirm the phone appears on the laptop map and its position updates. Stop sharing or close the phone tab to verify it becomes inactive/last seen.

### Frontend routes

- `/` — public landing page
- `/login`, `/register`, `/verify-2fa` — authentication flow
- `/dashboard` — farmer/owner dashboard
- `/equipment/near-me` — equipment discovery and map view
- `/admin/login`, `/admin` — admin-only flow
- `/api-status` — app status page

### Verify

Run from the client folder:

```bash
cd client
npm run typecheck
npm run build
```