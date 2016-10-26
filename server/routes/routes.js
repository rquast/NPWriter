const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser');
const ConfigRoutes = require('./config')
const NewsItemRoutes = require('./newsitem')
const SpellCheckRoutes = require('./spellcheck')

// ==================================
// Middleware to do some logging
// ==================================
router.use(function timeLog(req, res, next) {
    console.log({method: req.method, url: req.url});
    next();
});

router.use(bodyParser.json({limit: '50Mb', extended: true, type: "application/json"}));


router.route('/config').get(ConfigRoutes.getConfig);
router.route('/config').post(ConfigRoutes.setConfig);

// router.route('/newsitem/:uuid').get(PluginRoutes.getPlugins);
router.use(NewsItemRoutes)
router.use(SpellCheckRoutes)

module.exports = router;