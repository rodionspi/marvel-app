# SuperHero App

React app with character cards, search, random character selection, and single character pages powered by the open [akabab superhero API](https://akabab.github.io/superhero-api/).

## Setup

Install dependencies:

```bash
npm install
```

No API token is required. The Express server loads `https://akabab.github.io/superhero-api/api/all.json`, caches the full hero list in memory, and serves local `/api/superhero/:id` and `/api/superhero/search/:name` endpoints for the React app.

## Available Scripts

Run the full development stack:

```bash
npm run dev
```

This starts the React app and the Express hero API server on port `5001`.

Run only the React development server:

```bash
npm start
```

Run only the hero API server:

```bash
npm run server
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## API Notes

The akabab superhero API provides a static list of 731 characters. The local Express server caches that list and supports lookup by akabab ID plus partial, case-insensitive name search. It does not provide Marvel-style comics endpoints, so the old comics section was removed and legacy `/comics` routes now redirect to the character list.

Image assets are loaded directly from jsDelivr CDN URLs in each character's `images.md` field by default. No image proxy is required.
