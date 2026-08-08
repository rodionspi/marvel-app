const { findHeroByName } = require('../../../lib/heroes');

module.exports = async (req, res) => {
  try {
    const results = await findHeroByName(decodeURIComponent(req.query.name));

    return res.status(200).json({
      response: results.length ? 'success' : 'error',
      error: results.length ? undefined : 'character with given name not found',
      results,
    });
  } catch (error) {
    return res.status(502).json({ error: error.message || 'Failed to load superhero data' });
  }
};
