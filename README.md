# SuperHero App

React app with character cards, search, random character selection, and single character pages powered by [SuperHero API](https://superheroapi.com/).

## Setup

Install dependencies:

```bash
npm install
```

Create a SuperHero API access token on https://superheroapi.com/ and provide it as an environment variable:

```bash
REACT_APP_SUPERHERO_API_TOKEN=your_token_here
```

For local development you can put the same value in a `.env` file in the project root. The app also falls back to `src/resources/apiKey.js`, where the placeholder can be replaced manually.

## Available Scripts

Run the development server:

```bash
npm start
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

SuperHero API supports character lookup by id and search by name. It does not provide Marvel-style comics endpoints, so the old comics section was removed and legacy `/comics` routes now redirect to the character list.
