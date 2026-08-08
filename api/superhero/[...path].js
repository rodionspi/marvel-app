const ALL_HEROES_URL = 'https://akabab.github.io/superhero-api/api/all.json';
const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cacheTtlMs = Number(process.env.HERO_CACHE_TTL_MS) || DEFAULT_CACHE_TTL_MS;

let heroesCache = null;
let heroesByIdCache = null;
let heroesPromise = null;
let heroesCacheExpiresAt = 0;

const isCacheFresh = () => heroesCache && heroesCacheExpiresAt > Date.now();

const saveHeroesCache = (heroes) => {
  heroesCache = heroes;
  heroesByIdCache = new Map(heroes.map((hero) => [hero.id, hero]));
  heroesCacheExpiresAt = Date.now() + cacheTtlMs;
};

const fetchAllHeroes = async () => {
  if (isCacheFresh()) {
    return heroesCache;
  }

  if (!heroesPromise) {
    heroesPromise = fetch(ALL_HEROES_URL, {
      headers: {
        'User-Agent': 'MarvelAppHeroApi/1.0',
        Accept: 'application/json',
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Hero API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Hero API returned an unexpected payload');
        }

        saveHeroesCache(data);
        return heroesCache;
      })
      .catch((error) => {
        heroesPromise = null;

        if (heroesCache) {
          console.error(`Failed to refresh hero cache, using stale data: ${error.message}`);
          return heroesCache;
        }

        throw error;
      })
      .finally(() => {
        heroesPromise = null;
      });
  }

  return heroesPromise;
};

const findHeroById = async (id) => {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId < 1) {
    return null;
  }

  await fetchAllHeroes();
  return heroesByIdCache.get(numericId) || null;
};

const findHeroesPage = async ({
  offset = 1,
  limit = 9,
  maxId = 731,
  initialFailureLimit = 3,
} = {}) => {
  await fetchAllHeroes();

  let nextId = Number(offset);
  let attempts = 0;
  let firstFailures = 0;
  const characters = [];

  if (!Number.isInteger(nextId) || nextId < 1) {
    nextId = 1;
  }

  while (characters.length < limit && nextId <= maxId) {
    const id = nextId;
    nextId += 1;
    attempts += 1;

    const hero = heroesByIdCache.get(id);

    if (hero) {
      characters.push(hero);
      continue;
    }

    if (attempts <= initialFailureLimit) {
      firstFailures += 1;
    }

    if (attempts === initialFailureLimit && firstFailures === initialFailureLimit) {
      throw new Error('The first three superhero IDs could not be loaded');
    }
  }

  return {
    characters,
    nextOffset: nextId,
    ended: nextId > maxId,
  };
};

const findHeroByName = async (name) => {
  const query = String(name || '').trim().toLowerCase();

  if (!query) {
    return [];
  }

  const heroes = await fetchAllHeroes();
  return heroes.filter((hero) => hero.name.toLowerCase().includes(query));
};

const handler = async (req, res) => {
  const path = req.query.path;

  if (!path || path.length === 0) {
    return res.status(400).json({ error: 'Invalid path' });
  }

  const [action, param] = path;

  try {
    switch (action) {
      case 'page':
        return res.status(200).json(await findHeroesPage({ offset: Number(param) }));
      case 'search': {
        const results = await findHeroByName(decodeURIComponent(param));
        return res.status(200).json({
          response: results.length ? 'success' : 'error',
          error: results.length ? undefined : 'character with given name not found',
          results,
        });
      }
      case 'id': {
        const hero = await findHeroById(String(param).replace(/\.json$/, ''));
        if (!hero) {
          return res.status(404).json({ response: 'error', error: 'character with given id not found' });
        }
        return res.status(200).json(hero);
      }
      default: {
        const hero = await findHeroById(action);
        if (!hero) {
          return res.status(404).json({ response: 'error', error: 'character with given id not found' });
        }
        return res.status(200).json(hero);
      }
    }
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Failed to load superhero data' });
  }
};

module.exports = handler;
module.exports.fetchAllHeroes = fetchAllHeroes;
module.exports.findHeroById = findHeroById;
module.exports.findHeroesPage = findHeroesPage;
module.exports.findHeroByName = findHeroByName;
