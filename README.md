# Carbon Flux Data Collector

A mobile-friendly web app for recording field metadata alongside carbon flux
measurements. Built for the Fulweiler Lab @ Boston University.

Field teams use this app on-site (phone or tablet) to log the context around
each flux sensor reading — location, timing, soil conditions, vegetation —
without a paper datasheet. Each entry is written directly to a Google Sheet,
so data is available immediately and doesn't need to be transcribed later.

## What it does

- **Sign in with Google** — authenticates via Google Identity Services /
  OAuth (`src/App.js`) to get access to Google Sheets on the user's account.
- **Start a new collection** — creates a new Google Sheet (titled
  `Flux Data M/D/YYYY`) for the day's session.
- **Record collection-level info** (`CollectionForm`) — field team, weather,
  and general notes, written as a header in the new sheet.
- **Log individual entries** (`EntryForm`) — for each sensor deployment,
  select or type a sensor name, then record:
  - GPS coordinates (via the browser's geolocation API)
  - Start/end timestamps for the measurement
  - Soil moisture and soil temperature
  - Vegetation height and type
  - Free-text notes

  Each entry is appended as a new row to the active spreadsheet.

## Tech stack

- React 18 (Create React App)
- Material UI (`@mui/material`) for form components
- Google API client (`gapi`) + Google Identity Services for OAuth and the
  Sheets API
- Deployed to GitHub Pages via `gh-pages`

## Getting started

```bash
npm install
npm start
```

Runs the app at [http://localhost:3000](http://localhost:3000). Note the
`start` script forces HTTPS, which Google OAuth requires even in local dev —
accept the browser's self-signed certificate warning to proceed.

### Other scripts

- `npm test` — run tests in watch mode
- `npm run build` — production build to `build/`
- `npm run deploy` — build and publish to GitHub Pages (`gh-pages`)

## Configuration

The app authenticates against a Google Cloud OAuth client and calls the
Sheets API. The client ID, OAuth scope, and Sheets discovery document are
configured in `public/index.html`. To point the app at a different Google
Cloud project, update the `SPARTINA` (client ID) constant there.
