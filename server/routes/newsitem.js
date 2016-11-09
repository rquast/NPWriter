'use strict';

var express = require('express');
var router = express.Router();
var request = require('request');
var bodyParser = require('body-parser');
var config = require('../models/ConfigurationManager');
var Backend = require('../models/Backend.js');
var os = require('os');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var log = require('../utils/logger').child({api: 'Router'});

// ==================================
// Middleware to do some logging
// ==================================

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

router.post('/external/:name', function(req, res) {
    var backend;

    try {
        backend = config.getBackend(req.params.name, req.body.method, req.body.path);
    }
    catch(ex) {
        log.error({err: ex.message}, "Could not find a configured backend to handle the request");
        res.contentType('application/json')
            .status(ex.code)
            .send({error: ex.message});
        return;
    }

    Backend.call(
        backend,
        req.body,
        (error, response, body) => {
            if (error) {
                log.error({err:error, response: response, headers: req.headers});
                res.contentType('application/json')
                    .status(response.statusCode)
                    .send({error: error});
            }
            else {
                res.set(response.headers)
                    .status(response.statusCode)
                    .send(body);
            }

        }
    );
});

/**
 * Get a newsitem
 */
router.get('/newsitem/:uuid', function (req, res) {
    var uuid = req.params.uuid,
        environment = config.get('environment'),
        imType = req.query.imType;

    if (imType === undefined) {
        Backend.defaultHandling(res, "Missing query parameter imType in request", "", "", null, req, uuid);
        return;
    }

    if ("demo" === uuid || "demo" === environment) {
        res.sendFile('newsitem-text.xml', {root: './data'});
        return;
    }
    else if ("demoimage" === uuid) {
        res.sendFile('newsitem-picture.xml', {root: './data'});
        return;
    }

    Backend.exec(
        '{"action":"get", "data": {"id":"' + uuid + '", "imType":"' + imType + '"}}',
        config.get('external.contentrepository'),
        (error, response, body) => {
            Backend.defaultHandling(res, error, response, body, null, req, uuid);
        }
    );
});

/**
 * Save newsitem to backend
 */
router.put('/newsitem/:uuid', function (req, res) {
    var uuid = req.params.uuid,
        toBase64 = req.body.toString('base64');

    log.info({id: uuid}, "Updating newsitem");

    Backend.exec(
        '{"action":"update", "data": {"id":"' + uuid + '", "document": "' + toBase64 + '"}}',
        config.get('external.contentrepository'),
        (error, response, body) => {
            Backend.defaultHandling(res, error, response, body, null, req, uuid);
        }
    );
});

/**
 * Create a new newsitem
 */
router.post('/newsitem', function (req, res) {
    var toBase64 = req.body.toString('base64');

    log.info("Creating newsitem");

    Backend.exec(
        '{"action":"create", "data": {"document": "' + toBase64 + '"}}',
        config.get('external.contentrepository'),
        (error, response, body) => {
            Backend.defaultHandling(res, error, response, body, null, req, "New item")
        }
    );
});

/**
 * Upload image and retrieve NewsML document with meta data
 *
 * Manually via curl
 * curl -X POST -F "image=@greenalien.jpg" http://192.168.99.100:8181/cxf/writer/images/upload
 */
router.post('/image', function (req, res) {

    log.info({clientFilename: req.headers['x-filename']}, "Downloading content to local file");

    var buffer = new Buffer(req.body),
        tmpfileName = path.join(
            os.tmpdir(),
            'writer_' + crypto.randomBytes(32).toString('hex')
        );

    log.debug({
        file: req.headers['x-filename'],
        length: buffer.byteLength,
        contentType: req.headers['content-type']
    }, 'Image uploaded');

    var fd = fs.openSync(tmpfileName, 'w');
    if (!fd) {
        log.error({filename: tmpfileName});
        Backend.defaultHandling(res, 'Failed opening temporary file', null, null, null, req,
            "download local file");
        return;
    }

    fs.write(fd, buffer, 0, buffer.byteLength, function (err, written, buffer) {
        fs.closeSync(fd);
        buffer = null;

        if (err) {
            log.error({filename: tmpfileName}, 'Failed writing to tmp file');
            fs.unlink(tmpfileName);
            Backend.defaultHandling(res, 'Failed writing to temporary file', null, null, null, req,
                "writing to local file");
            return;
        }

        log.info({clientFilename: req.headers['x-filename']}, "download done");

        var formData = {
            image: {
                value: fs.createReadStream(tmpfileName),
                options: {
                    filename: req.headers['x-filename'],
                    contentType: req.headers['content-type']
                }
            }
        };

        log.info({clientFilename: req.headers['x-filename']}, "Uploading content to backend");

        Backend.upload(
            formData,
            config.get('external.contentrepository'),
            (error, response, body) => {
                fs.unlink(tmpfileName);
                Backend.defaultHandling(res, error, response, body, null, req,
                    req.headers['x-filename']);
            }
        );

    });
});


router.get('/image', function (req, res) {
    var source = req.query.source;

    log.info({url: source}, "Uploading content from URL");

    Backend.uploadUrl(source, config.get('external.contentrepository'), (error, response, body) => {
        Backend.defaultHandling(res, error, response, body, null, req, source);
    });
});


/**
 * Get image newsitem
 */
router.get('/image/newsitem/:uuid', function (req, res) {
    var data = JSON.stringify({
        action: 'get',
        data: {
            id: req.params.uuid,
            itemClass: 'ninat:picture'
        }
    });

    Backend.exec(
        data,
        config.get('external.contentrepository'),
        (error, response, body) => {
            Backend.defaultHandling(res, error, response, body, null, req);
        }
    );
});

/**
 * Get url to imgix image
 */
router.get('/image/url/:uuid/:height?', function (req, res) {
    //var params = {
    //    id: req.params.uuid,
    //    w: "800"
    //};

    var params = req.query;
    params.id = req.params.uuid;
    params.w = "800";
    var imType = req.query.imType;

    if (!isNaN(parseInt(req.params.height))) {
        params.h = req.params.height.toString();
    }

    if (!isNaN(parseInt(req.query.width))) {
        params.w = req.query.width.toString();
    }

    var data = JSON.stringify(params);

    log.info({id: req.params.uuid}, "Getting image url");

    console.log("Getting imType", imType);

    var command = {
        action: "render_binary",
        data: {
            id: req.params.uuid,
            imType: 'x-im/image',
            params: params
        }

    }

    Backend.exec(
        JSON.stringify(command),
        config.get('external.contentrepository'),
        (error, response, body) => {
            Backend.defaultHandling(res, error, response, body, null, req, req.params.uuid);
        }
    );
});



/**
 * Fetch remote resource through local proxy
 */
router.get('/resourceproxy', function(req, res) {
    req.pipe(
        request(decodeURIComponent(req.query.url))
            .on('response', function(response) {
                if (response.statusCode != 200) {
                    log.error({status: response.statusCode, url: req.params.uuid}, "Failed fetching resource through proxy");
                }
            })
            .on('error', function(err) {
                log.error({err: err, url: req.params.uuid}, "Failed fetching resource through proxy");
            })
    ).pipe(res);
});

/**
 * Search authors route
 */
router.get('/search/concepts/authors', function (req, res) {
    var query = req.query.q;
    Backend.search('authors', query, res, req);
});

/**
 * Concept route
 */
router.get('/search/concepts/tags', function (req, res) {
    var query = req.query.q;
    Backend.search('tags', query, res, req);
});


/**
 * Search for places in Concepts backend
 */
router.get('/search/concepts/locations', function (req, res) {
    var query = req.query.q,
        filter = req.query.f,
        entity = 'locations';

    if (filter == 'position') {
        entity = 'position_locations';
    }
    else if (filter == 'polygon') {
        entity = 'polygon_locations';
    }

    Backend.exec(
        '{"action":"search", "data": {"entity": "' + entity + '", "query":"' + query + '"}}',
        config.get('external.conceptbackend'),
        (error, response, body) => {
            Backend.defaultHandling(res, error, response, body, null, req, "concept search");
        }
    );
});


/**
 * Search for channels in Concepts backend
 */
router.get('/search/concepts/channels', function (req, res) {
    var query = req.query.q;
    Backend.search('channels', query, res, req);
});


router.get('/search/concepts/articles', function (req, res) {
    var query = req.query.q;
    Backend.search('articles', query, res, req);
});

/**
 * Search for stories in Concepts backend
 */
router.get('/search/concepts/stories', function (req, res) {
    var query = req.query.q;
    Backend.search('stories', query, res, req);
});

/**
 * Search for content profiles / function-tags in Concepts backend
 */
router.get('/search/concepts/contentprofiles', function (req, res) {
    var query = req.query.q;
    Backend.search('contentprofiles', query, res, req);
});

/**
 * Search for content categories in Concepts backend
 */
router.get('/search/concepts/categories', function (req, res) {
    var query = req.query.q;
    Backend.search('categories', query, res, req);
});

/**
 * @param {string} twitterHandle - The username on twitter
 */
router.get('/concepts/author/:twitterHandle/thumbnail', function (req, res) {
    var twitterHandle = req.params.twitterHandle;

    log.info({twitterHandle: twitterHandle}, "Getting twitter handle");

    Backend.exec(
        '{"action":"thumbnail", "data": {"url":"https://twitter.com/' + twitterHandle + '"}}',
        config.get('external.conceptbackend'),
        (error, response, body) => {
            Backend.defaultHandling(res, error, response, body, 'text/html', req, twitterHandle);
        }
    );
});


/**
 * Proxy for plugins
 */
router.get('/proxy', function (req, res) {

    var url = req.query.url;

    request({
        method: 'GET',
        uri: url,
        headers: {
            'Content-Type': 'application/json'
        }
    }, (error, response, body) => {
        log.debug({url: url, body: body}, 'Get url through proxy');
        if (error) {
            log.error({url: url, err: error}, 'Get url through proxy');
            res.contentType('application/json').status(404).send({error: error});
        } else {
            res.contentType('application/json').status(response.statusCode).send(body);
        }
    });

});

/**
 * Fetch external resource through proxying
 */


/**
 * Error logging from browsers
 */
router.get('/err', function (req, res) {
    var err = req.query.error;

    log.error("Browser error", {error: err, headers: req.headers});

    res.status(204).send();
});


router.head('/healthcheck', function (req, res) {

    var rp = require('request-promise');

    var editorCfg = config.get('external.contentrepository');
    var conceptCfg = config.get('external.contentrepository');

    if (req.query.mode && req.query.mode === 'dependencies') {
        var editorHealthUrl = editorCfg.protocol + "//" + editorCfg.host + ":" + editorCfg.port + "/cxf/writer/healthcheck";

        rp({url: editorHealthUrl, method: 'HEAD', resolveWithFullResponse: true})
            .then(function (response) {
                if (response.statusCode && response.statusCode === 200) {
                    res.status(200).send();
                } else {
                    log.error({error: {statusCode: response.statusCode, body: response.body}}, "Health check failed for editorservice")
                    res.status(502).send();
                }
            })
            .catch(function (e) {
                log.error({message: e.message}, "Healthcheck failed for editorservice");
                res.status(502).send();
            });
    } else if (req.query.mode && req.query.mode === 'fullstack') {
        var templateUUID = config.get('newsItemTemplateUUID');

        Backend.exec(
            '{"action":"get", "data": {"id":"' + templateUUID + '"}}',
            config.get('external.contentrepository'),
            (error, response, body) => {
                if (error) {
                    log.error({error: error, response: response, uuid: templateUUID},
                        "Fetching template failed for editorservice during healthcheck");
                    res.status(502).send();
                } else if (response.statusCode !== 200) {
                    log.error({error: error, response: response.statusCode, uuid: templateUUID}, "Error fetching template from editorservice during healthcheck");
                    res.status(502).send();
                }
                res.status(200).send();
            });
    } else {
        res.status(200).send();
    }
});

module.exports = router;
