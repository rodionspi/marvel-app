const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;
const superheroApiKey = process.env.REACT_APP_SUPERHERO_API_TOKEN || 'YOUR_SUPERHERO_API_TOKEN';
const allowedHosts = new Set(['superherodb.com', 'www.superherodb.com']);
const cache = new Map();
const cacheTtlMs = 24 * 60 * 60 * 1000;
const maxImageBytes = 8 * 1024 * 1024;

const buildPath = path.join(__dirname, 'build');

const isValidSuperHeroApiPath = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return false;
  }

  return /^\/(\d+|search\/[A-Za-z0-9%._-]+)$/.test(value);
};

const isValidSuperHeroImageUrl = (value) => {
  try {
    const url = new URL(value);

    if (url.protocol !== 'https:') {
      return false;
    }

    if (!allowedHosts.has(url.hostname)) {
      return false;
    }

    if (!url.pathname.startsWith('/pictures')) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

const getCachedImage = (url) => {
  const cached = cache.get(url);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    cache.delete(url);
    return null;
  }

  return cached;
};

const storeCachedImage = (url, payload) => {
  cache.set(url, {
    ...payload,
    expiresAt: Date.now() + cacheTtlMs,
  });
};

const fetchImage = async (url) => {
  const upstream = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': 'https://www.superherodb.com/',
      'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8'
    }
  });

  if (!upstream.ok) {
    console.log('Внешний сайт ответил:', upstream.status, upstream.statusText);
    const body = await upstream.text().catch(() => '');
    console.log('Тело ответа:', body.slice(0, 300));
    return res.status(502).json({ error: `Upstream responded ${upstream.status}` });
  }

  const contentType = upstream.headers.get('content-type') || 'application/octet-stream';

  if (!contentType.startsWith('image/')) {
    throw new Error(`Unexpected content type: ${contentType}`);
  }

  const arrayBuffer = await upstream.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length > maxImageBytes) {
    throw new Error('Image is too large to proxy safely');
  }

  return {
    buffer,
    contentType,
  };
};

const fetchSuperHeroApi = async (endpoint) => {
  // This is the upstream JSON API URL from SuperHeroAPI, not a browser URL.
  const upstreamUrl = `https://superheroapi.com/api/${superheroApiKey}${endpoint}`;
  const upstream = await fetch(upstreamUrl, {
      headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SuperHeroApiProxy/1.0)',
      Referer: 'https://www.superherodb.com/',
      Accept: 'application/json',
    },
  });

  if (!upstream.ok) {
    throw new Error(`Upstream request failed with status ${upstream.status}`);
  }

  return upstream.json();
};

app.get('/api/superhero/*', async (req, res) => {
  const endpoint = `/${req.params[0]}`;

  if (!isValidSuperHeroApiPath(endpoint)) {
    return res.status(400).json({ error: 'Invalid superhero API path' });
  }

  try {
    const data = await fetchSuperHeroApi(endpoint);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({
      error: error.message || 'Failed to proxy superhero API request',
    });
  }
});

app.get('/api/image-proxy', async (req, res) => {
  const url = req.query.url;

  if (typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }

  // The frontend passes the original SuperHeroDB image URL here.
  // The proxy fetches that exact URL server-side so the browser never loads it directly.
  if (!isValidSuperHeroImageUrl(url)) {
    return res.status(400).json({ error: 'Only superherodb.com image URLs are allowed' });
  }

  const cached = getCachedImage(url);

  // This is the upstream image URL from SuperHeroDB, not a local API route.
  if (cached) {
    res.set({
      'Content-Type': cached.contentType,
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
    });

    return res.status(200).send(cached.buffer);
  }

  try {
    const image = await fetchImage(url);

    storeCachedImage(url, image);

    res.set({
      'Content-Type': image.contentType,
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'X-Content-Type-Options': 'nosniff',
    });

    return res.status(200).send(image.buffer);
  } catch (error) {
    return res.status(502).json({
      error: error.message || 'Failed to proxy image',
    });
  }
});

if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    return res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const server = http.createServer(app);

server.once('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Image proxy server is already running on http://localhost:${port}`);
    process.exit(0);
  }

  throw error;
});

server.listen(port, () => {
  console.log(`Image proxy server is running on http://localhost:${port}`);
});
