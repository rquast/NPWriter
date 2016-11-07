const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser');
const ConfigRoutes = require('./config')
const NewsItemRoutes = require('./newsitem')
const SpellCheckRoutes = null
try {
  SpellCheckRoutes = require('./spellcheck')
} catch (err) {
  // nodehun does not work under Windows :/
}

var log = require('../utils/logger').child({api: 'Router'});

// ==================================
// Middleware to do some logging
// ==================================
router.use(function timeLog(req, res, next) {
    log.debug({method: req.method, url: req.url});
    next();
});

router.use(bodyParser.json({limit: '50Mb', extended: true, type: "application/json"}));


router.route('/config').get(ConfigRoutes.getConfig);
router.route('/config').post(ConfigRoutes.setConfig);

// router.route('/newsitem/:uuid').get(PluginRoutes.getPlugins);
router.use(NewsItemRoutes)
if (SpellCheckRoutes) {
  router.use(SpellCheckRoutes)
}

module.exports = router;