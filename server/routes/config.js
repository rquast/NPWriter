'use strict'
var fs = require('fs')
var path = require('path')

module.exports = {

    /**
     * Reads plugins.json file and parsing to json and sending respone to client
     * @param req
     * @param res
     */
    getConfig: function (req, res) {
        const filename = path.join(__dirname, '/..', 'config', 'writer.json')
        fs.readFile(filename, 'utf8', function (err,data) {
            if (err) {
                console.error("Error loading writer.json", err)
            }
            let plugins = JSON.parse(data);
            res.contentType('application/json').status(200).send(plugins);
        });
    }
};