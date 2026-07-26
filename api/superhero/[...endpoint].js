const { findHeroById, findHeroesPage, findHeroByName } = require('../../heroApi');

const getEndpoint = (req) => {
  const endpointParam = req.query?.endpoint;

  if (Array.isArray(endpointParam)) {
    return `/${endpointParam.join('/')}`;
  }

  if (typeof endpointParam === 'string' && endpointParam.trim()) {
    return `/${endpointParam}`;
  }

  const requestUrl = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
  return requestUrl.pathname.replace(/^\/api\/superhero/, '') || '/';
};

const isValidSuperHeroApiPath = (value) => /^\/(\d+|id\/\d+\.json|page\/\d+|search\/[^/?#]+)$/.test(value);

const getHeroIdFromEndpoint = (endpoint) => {
  const match = endpoint.match(/^\/(?:id\/)?(\d+)(?:\.json)?$/);
  return match ? match[1] : null;
};

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const endpoint = getEndpoint(req);

  if (!isValidSuperHeroApiPath(endpoint)) {
    return res.status(400).json({ error: 'Invalid superhero API path' });
  }

  try {
    if (endpoint.startsWith('/page/')) {
      const offset = Number(endpoint.split('/')[2]);
      const page = await findHeroesPage({ offset });
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
};