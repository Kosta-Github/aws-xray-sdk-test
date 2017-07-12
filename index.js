require('aws-xray-sdk');

module.exports.handler = (event, context, callback) => {
    return callback(null, { hello: 'world' });
};
