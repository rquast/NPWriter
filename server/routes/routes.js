var express = require('express')
var router = express.Router()

var ConfigRoutes = require('./config')
const NewsItemRoutes = require('./newsitem')

// ==================================
// Middleware to do some logging
// ==================================
router.use(function timeLog(req, res, next) {
    console.log({method: req.method, url: req.url});
    next();
});

router.route('/config').get(ConfigRoutes.getConfig);
// router.route('/newsitem/:uuid').get(PluginRoutes.getPlugins);
router.use(NewsItemRoutes)

module.exports = router;