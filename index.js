const USE_HTTP_INSTRUMENTATION    = true;
const USE_EXPRESS_INSTRUMENTATION = true;

const AWSXRay = require('aws-xray-sdk');

USE_HTTP_INSTRUMENTATION && AWSXRay.captureHTTPsGlobal(require('http'));

require('isomorphic-fetch');

const express                        = require('express');
const awsServerlessExpress           = require('aws-serverless-express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

const app = express();

USE_EXPRESS_INSTRUMENTATION && app.use(AWSXRay.express.openSegment('aws-xray-test'));
app.use(awsServerlessExpressMiddleware.eventContext());

app.get('/test', (req, res) =>
    fetch('https://www.amazon.com')
        .then(reply => {
            console.log(`request response: ${reply.status} ${reply.statusText}`);
            res.json({ statusCode: reply.status, statusText: reply.statusText });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.toString() });
        })
);

USE_EXPRESS_INSTRUMENTATION && app.use(AWSXRay.express.closeSegment());

const binaryMimeTypes = [];
const server  = awsServerlessExpress.createServer(app, null, binaryMimeTypes);
const handler = (event, context) => awsServerlessExpress.proxy(server, event, context);

module.exports = { handler };
