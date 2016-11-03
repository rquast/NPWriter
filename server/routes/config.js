'use strict'
var fs = require('fs')
var path = require('path')
var AWS = require('aws-sdk');
const ConfigurationLoader = require('../models/ConfigurationLoader')
var log = require('../utils/logger').child({api: 'Router'});

const ConfigRoutes = {}

/**
 * Returns file path to config file for writer
 * @param {bool} isProduction
 */
ConfigRoutes.getFilenameForConfig = (isProduction) => {
    if(isProduction) {
        return path.join(__dirname, '/..', 'config', 'writer.external.json')
    }
    return path.join(__dirname, '/..', 'config', 'writer.json')

}

/**
 * Reads plugins.json file and parsing to json and sending respone to client
 * @param req
 * @param res
 */
ConfigRoutes.getConfig = (req, res) => {
    const environmentVariables = process.env
    const environment = environmentVariables.NODE_ENV ?  environmentVariables.NODE_ENV : 'develop'
    const isProduction = environment === 'production';

    const configurationLoader = new ConfigurationLoader(environment, environmentVariables)

    if(isProduction) {
        configurationLoader.downloadWriterConfigFromS3().then(() => {
            fs.readFile(ConfigRoutes.getFilenameForConfig(true), 'utf8', function (err, data) {
                if (err) {
                    res.contentType('application/json').status(500).send({error: "Could not load config file"});
                    return
                }
                const config = JSON.parse(data);
                res.contentType('application/json').status(200).send(config);
            });
        })
    } else {



        fs.readFile(ConfigRoutes.getFilenameForConfig(false), 'utf8', function (err, data) {
            if (err) {
                console.error("Error loading writer.json", err)
            }

        /*    let map = new Map();
            map.set("action", "fetching config file");
            map.set("httpStatusCode", 200);
            map.set("configData", data);
            honey.add(map);
            honey.sendNow()*/


            let plugins = JSON.parse(data);
            res.contentType('application/json').status(200).send(plugins);
        });
    }




}

ConfigRoutes.setConfig = (req, res) => {
    var fs = require('fs');

    const body = JSON.stringify(req.body, null, 4)

    fs.writeFile(ConfigRoutes.getFilenameForConfig(), body, function(err) {
        if(err) {
            res.contentType('application/json').status(400).send({status:'Bad request'});
            return console.log(err);
        }

        res.contentType('application/json').status(204).send({status:'OK'});
    });
};



module.exports = ConfigRoutes