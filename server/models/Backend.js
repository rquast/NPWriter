'use strict';

var request = require('request');
var config = require('../models/ConfigurationManager');
var log = require('../utils/logger').child({model:'Backend'});
var b64 = require('b64');
let ocSanitize = require('../utils/oc-search-sanitizer');

function Backend() {}

Backend.exec = function(body, cfg, cb) {
    var port = "";
    if (cfg.port !== undefined && cfg.port !== undefined) {
        port = ":" + cfg.port;
    }
    var uri = cfg.protocol + "//" + cfg.host + port + "/" + cfg.endpoint;

    log.debug({url: uri, body: body}, 'Execute backend request');

    request({
        method: 'POST',
        uri: uri,
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    }, (error, response, body) => {
        cb(error, response, body);
    });
};

/**
 * Make a call to an external backend
 *
 * @param {object} backend Backend speification object
 * @param {object} op Call operation configuration object
 * @param {Function} cb Callback function for handling response
 */
Backend.call = function(backend, op, cb) { //method, path, contentType, body, cb) {
    var uri = backend.protocol + "://" + backend.host + ":" + backend.port,
        requestObj = {
            method: op.method,
            uri: uri,
            headers: {
                'Content-Type': op.contentType
            }
        };

    if (op.headers) {
        for (var header in op.headers) {
            requestObj.headers[header] = op.headers[header];
        }
    }

    if (op.path) {
        requestObj.uri += op.path;
    }

    var parameters = 0;
    if (op.query) {
        for (var param in op.query) {
            requestObj.uri += (parameters++) ? '&' : '?';
            requestObj.uri += param + '=' + encodeURIComponent(op.query[param]);
        }
    }

    if (op.body) {
        requestObj.body = b64.decode(new Buffer(op.body, 'utf8')).toString();
    }

    log.debug({url: requestObj.uri, body: requestObj.body}, 'Proxy backend request');

    request(requestObj, (error, response, body) => {
        cb(error, response, body);
    });
};

/**
 * Search for an entity in concepts backend
 * @param {string} entity Type of entity
 * @param {string} query
 * @param {*} res
 */
Backend.search = function(entity, query, res, req) {
    var sanitizedQuery = ocSanitize(query);
    if (sanitizedQuery.length === 0) {
        res.contentType('application/json').status(200).send([]);
        return;
    } else {
        sanitizedQuery += "*";
    }

    Backend.exec('{"action":"search", "data": {"entity": "'+entity+'", "query":"' + sanitizedQuery + '"}}',
        config.get('external.conceptbackend'),
        (error, response, body) => {
            Backend.defaultHandling(res, error, response, body, 'application/json', req, "search");
        });
};

Backend.upload = function(formData, cfg, cb) {
    request.post({
        url: cfg.protocol + "//" + cfg.host + ":" + cfg.port + "/" + cfg.upload,
        formData: formData
    }, (err, response, body) => {
        log.debug({response:response, body:body}, 'Server response after upload');
        cb(err, response, body);
    });
};

Backend.uploadUrl = function(url, cfg, cb) {
    request.get({
        url: cfg.protocol + "//" + cfg.host + ":" + cfg.port + "/" + cfg.upload + "?source=" + encodeURIComponent(url),
    }, (err, response, body) => {
        log.debug({response:response, body:body}, 'Server response after url upload');
        cb(err, response, body);
    });
};


Backend.defaultHandling = function(res, error, response, body, contentType, req, context) {
    if (error) {
        log.error({err:error, response: response, headers: req.headers, context: context});
        res.contentType('application/json')
            .status(404)
            .send({error: error});
    } else {
        log.info({context: context}, "operation finished");

        res.contentType(contentType || 'application/xml')
            .status(response.statusCode)
            .send(body);
    }
};


module.exports = Backend;
