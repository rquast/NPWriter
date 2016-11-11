'use strict';

var express = require('express');
var router = express.Router();
var request = require('request');
var log = require('../utils/logger').child({api: 'Router'});

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
 * Fetch remote resource through local proxy
 */
router.get('/resourceproxy', function (req, res) {
    req.pipe(
        request(decodeURIComponent(req.query.url))
            .on('response', function (response) {
                if (response.statusCode != 200) {
                    log.error({
                        status: response.statusCode,
                        url: req.params.uuid
                    }, "Failed fetching resource through proxy");
                }
            })
            .on('error', function (err) {
                log.error({err: err, url: req.params.uuid}, "Failed fetching resource through proxy");
            })
    ).pipe(res);
});

module.exports = router;