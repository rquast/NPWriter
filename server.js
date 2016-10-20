var express = require('express');
var path = require('path');
var app = express();
var routes = require('./server/routes/routes')
var config = require('./server/models/ConfigurationManager');

var isProduction = process.env.NODE_ENV === 'production';
var port = isProduction ? process.env.PORT : 5000;
var publicPath = path.resolve(__dirname, 'dist');

// Load configuration
var configFileName = 'server.json';
if (process.env.CONFIG_FILE) {
    configFileName = process.env.CONFIG_FILE + '.json';
}

config.load(path.join(__dirname, 'server', 'config/' + configFileName));

const host = config.get('server.host', '127.0.0.1'),
    protocol = config.get('server.protocol', 'http')


app.use('/', express.static(publicPath));
app.use('/api', routes);
app.use(express.static(path.join(__dirname)));

// Listen on traffic
app.listen(port, function () {
    console.log({protocol: protocol, host: host, port: port}, "The Writer is running");
});
