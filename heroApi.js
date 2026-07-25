const ALL_HEROES_URL = 'https://akabab.github.io/superhero-api/api/all.json';

let heroesCache = null;
let heroesPromise = null;

const fetchAllHeroes = async () => {
  if (heroesCache) {
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

        heroesCache = data;
        return heroesCache;
      })
      .catch((error) => {
        heroesPromise = null;
        throw error;
      });
  }

  return heroesPromise;
};

const findHeroById = async (id) => {
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId < 1) {
    return null;
  }

  const heroes = await fetchAllHeroes();
  return heroes.find((hero) => hero.id === numericId) || null;
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
  findHeroByName,
};
