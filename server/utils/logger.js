var bunyan = require('bunyan');

var log = bunyan.createLogger({
    name: 'writer',
    serializers: bunyan.stdSerializers,
    streams: [
        {
            type: 'rotating-file',
            path: process.env.LOG_PATH || "./writer.log",
            level: process.env.LOG_LEVEL || "debug",
            period: '1d',
            count: process.env.LOG_FILES || 2
        },
        {
            level: process.env.LOG_LEVEL || "debug",
            stream: process.stdout
        }
    ]
});

module.exports = log;

