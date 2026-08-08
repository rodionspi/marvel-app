const { findHeroesPage } = require('../../../lib/heroes');

module.exports = async (req, res) => {
  try {
    const page = await findHeroesPage({ offset: Number(req.query.offset) });
    return res.status(200).json(page);
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Failed to load superhero page' });
  }
};
