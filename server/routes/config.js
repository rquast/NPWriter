'use strict'
var fs = require('fs')
var path = require('path')

const ConfigRoutes = {}


ConfigRoutes.getFilenameForConfig = () => {
    return path.join(__dirname, '/..', 'config', 'writer.json')
}

/**
 * Reads plugins.json file and parsing to json and sending respone to client
 * @param req
 * @param res
 */
ConfigRoutes.getConfig = (req, res) => {
    const filename = ConfigRoutes.getFilenameForConfig()
    fs.readFile(filename, 'utf8', function (err, data) {
        if (err) {
            console.error("Error loading writer.json", err)
        }
        let plugins = JSON.parse(data);
        res.contentType('application/json').status(200).send(plugins);
    });
}

ConfigRoutes.setConfig = (req, res) => {
    var fs = require('fs');

    const body = JSON.stringify(req.body, null, 4)
    console.log("BODY", body);

    fs.writeFile(ConfigRoutes.getFilenameForConfig(), body, function(err) {
        if(err) {
            res.contentType('application/json').status(400).send({status:'Bad request'});
            return console.log(err);
        }

        console.log("The file was saved!");
        res.contentType('application/json').status(204).send({status:'OK'});
    });
};


module.exports = ConfigRoutes