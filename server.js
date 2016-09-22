var express = require('express');
var path = require('path');
var app = express();

var routes = require('./server/routes/routes')

const port = 5000,//config.get('server.port', process.env.PORT || 5000);
    host = '127.0.0.1', //config.get('server.host', '127.0.0.1');
    protocol = 'http' //config.get('server.protocol', 'http');

// Listen on traffic
app.listen(port, function () {
    console.log({protocol: protocol, host: host, port: port}, "The Writer is running");
});

app.use('/api', routes);
app.use(express.static(path.join(__dirname)));