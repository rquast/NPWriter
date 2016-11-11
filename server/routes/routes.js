const express = require('express')
const router = express.Router()
const bodyParser = require('body-parser');
const ConfigRoutes = require('./config')
const NewsItemRoutes = require('./newsitem')
const SpellCheckRoutes = require('./spellcheck')
const ConceptItemRoutes = require('./conceptitem')
const ErrorRoutes = require('./error')
const HealthCheckRoutes = require('./healthcheck')
const ProxyRoutes = require('./proxy')

var log = require('../utils/logger').child({api: 'Router'});

/**
 * Middleware to do some logging
 */
router.use(function timeLog(req, res, next) {
    log.debug({method: req.method, url: req.url});
    next();
});

router.use(bodyParser.json({limit: '50Mb', extended: true, type: "application/json"}));
router.use(bodyParser.raw({limit: '50Mb', extended: true, type: "application/xml"}));
router.use(bodyParser.raw({limit: '50Mb', extended: true, type: "image/jpg"}));
router.use(bodyParser.raw({limit: '50Mb', extended: true, type: "image/jpeg"}));
router.use(bodyParser.raw({limit: '50Mb', extended: true, type: "image/png"}));
router.use(bodyParser.raw({limit: '50Mb', extended: true, type: "image/gif"}));

router.route('/config').get(ConfigRoutes.getConfig);
router.route('/config').post(ConfigRoutes.setConfig);

router.use(NewsItemRoutes)
router.use(SpellCheckRoutes)
router.use(ConceptItemRoutes)
router.use(ErrorRoutes)
router.use(HealthCheckRoutes)
router.use(ProxyRoutes)

module.exports = router;