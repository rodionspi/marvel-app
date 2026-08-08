const { findHeroById } = require('../../lib/heroes');

module.exports = async (req, res) => {
  try {
    const hero = await findHeroById(req.query.id);

    if (!hero) {
      return res.status(404).json({ response: 'error', error: 'character with given id not found' });
    }

    return res.status(200).json(hero);
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Failed to load superhero data' });
  }
};
