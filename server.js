const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { fetchAllHeroes, findHeroById, findHeroesPage, findHeroByName } = require('./heroApi');

const app = express();
const port = process.env.PORT || 5001;
const buildPath = path.join(__dirname, 'build');

const isValidSuperHeroApiPath = (value) => {
  if (typeof value !== 'string' || !value.trim()) {
    return false;
  }

  return /^\/(\d+|id\/\d+\.json|page\/\d+|search\/[^/?#]+)$/.test(value);
};

const getHeroIdFromEndpoint = (endpoint) => {
  const match = endpoint.match(/^\/(?:id\/)?(\d+)(?:\.json)?$/);
  return match ? match[1] : null;
};

const getPageOffsetFromEndpoint = (endpoint) => {
  const match = endpoint.match(/^\/page\/(\d+)$/);
  return match ? match[1] : null;
};

app.get('/api/superhero/page/:offset', async (req, res) => {
  try {
    const page = await findHeroesPage({ offset: Number(req.params.offset) });
    return res.status(200).json(page);
  } catch (error) {
    return res.status(502).json({
      error: error.message || 'Failed to load superhero page',
    });
  }
});

app.get('/api/superhero/*', async (req, res) => {
  const endpoint = `/${req.params[0]}`;

  if (!isValidSuperHeroApiPath(endpoint)) {
    return res.status(400).json({ error: 'Invalid superhero API path' });
  }

  try {
    const pageOffset = getPageOffsetFromEndpoint(endpoint);

    if (pageOffset) {
      const page = await findHeroesPage({ offset: Number(pageOffset) });
      return res.status(200).json(page);
    }

    if (endpoint.startsWith('/search/')) {
      const query = decodeURIComponent(endpoint.replace('/search/', ''));
      const results = await findHeroByName(query);

      return res.status(200).json({
        response: results.length ? 'success' : 'error',
        error: results.length ? undefined : 'character with given name not found',
        results,
      });
    }

    const heroId = getHeroIdFromEndpoint(endpoint);
    const hero = await findHeroById(heroId);

    if (!hero) {
      return res.status(404).json({
        response: 'error',
        error: 'character with given id not found',
      });
    }

    return res.status(200).json(hero);
  } catch (error) {
    return res.status(502).json({
      error: error.message || 'Failed to load superhero data',
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
    console.log(`Hero API server is already running on http://localhost:${port}`);
    process.exit(0);
  }

  throw error;
});

server.listen(port, () => {
  console.log(`Hero API server is running on http://localhost:${port}`);
  fetchAllHeroes().catch((error) => {
    console.error(`Failed to warm hero cache: ${error.message}`);
  });
});
