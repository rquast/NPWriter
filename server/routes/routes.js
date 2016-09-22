var express = require('express');
var router = express.Router();

var PluginRoutes = require('./plugins');


// ==================================
// Middleware to do some logging
// ==================================
router.use(function timeLog(req, res, next) {
    console.log({method: req.method, url: req.url});
    next();
});

router.route('/plugins').get(PluginRoutes.getPlugins);

module.exports = router;