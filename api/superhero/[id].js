const ALL_HEROES_URL = 'https://akabab.github.io/superhero-api/api/all.json';//url to fetch all heroes data from the superhero API
const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;//default cache time-to-live in milliseconds (24 hours)
const cacheTtlMs = Number(process.env.HERO_CACHE_TTL_MS) || DEFAULT_CACHE_TTL_MS;//cache time-to-live in milliseconds, can be overridden by environment variable

let heroesCache = null;//cache for all heroes data
let heroesByIdCache = null;//cache for heroes data indexed by ID
let heroesPromise = null;//promise for fetching all heroes data
let heroesCacheExpiresAt = 0;//timestamp for when the cache expires

const isCacheFresh = () => heroesCache && heroesCacheExpiresAt > Date.now();//check if the cache is still fresh based on the expiration timestamp

const saveHeroesCache = (heroes) => {
  console.log('Saving heroes cache with', heroes.length, 'heroes');
  console.log(heroes.slice(0, 3).map((hero) => hero.name).join(', '), '...');//log the first three hero names for debugging
  heroesCache = heroes;//cache for all heroes data
  heroesByIdCache = new Map(heroes.map((hero) => [hero.id, hero]));//cache for heroes data indexed by ID
  heroesCacheExpiresAt = Date.now() + cacheTtlMs;//set the cache expiration timestamp based on the current time and the cache TTL
};

const fetchAllHeroes = async () => {
  if (isCacheFresh()) {//if the cache is still fresh, return the cached heroes data
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

  await fetchAllHeroes();//fetch all heroes data and populate the cache if necessary
  return heroesByIdCache.get(numericId) || null;//return the hero data for the given ID from the cache, or null if not found
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

module.exports = {
  fetchAllHeroes,
  findHeroById,
  findHeroesPage,
  findHeroByName,
};
