const { fetchAllHeroes, findHeroById, findHeroesPage, findHeroByName } = require('../_lib/heroes');

module.exports = async (req, res) => {
    const path = req.query.path;
    
    if (!path || path.length === 0) {
        return res.status(400).json({ error: 'Invalid path' });
    }
    
    const [action, param] = path;
    
    switch (action) {
        case 'page':
            return res.json(await findHeroesPage(parseInt(param)));
        case 'id':
            return res.json(await findHeroById(param));
        case 'search':
            return res.json(await findHeroByName(param));
        default:
            return res.json(await findHeroById(action));
    }
};