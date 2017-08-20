const AWSXRay = require('aws-xray-sdk');
AWSXRay.captureHTTPsGlobal(require('http'));

require('isomorphic-fetch');

const express                        = require('express');
const awsServerlessExpress           = require('aws-serverless-express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

const app = express();

app.use(AWSXRay.express.openSegment('aws-xray-test'));
app.use(awsServerlessExpressMiddleware.eventContext());

app.get('/test', (req, res) =>
    fetch('https://www.amazon.com')
        .then(res => {
            console.log(`request response: ${res.status} ${res.statusText}`);
            res.json({ statusCode: res.status, statusText: res.statusText });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: err.toString() });
        })
);

app.use(AWSXRay.express.closeSegment());

const binaryMimeTypes = [];
const server  = awsServerlessExpress.createServer(app, null, binaryMimeTypes);
const handler = (event, context) => awsServerlessExpress.proxy(server, event, context);

module.exports = { handler };
