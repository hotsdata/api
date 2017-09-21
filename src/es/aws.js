let AWS = require('aws-sdk');
var config = require('../../config');

AWS.config.update({ region: config.es.region });
AWS.config.update({
  credentials: new AWS.Credentials(config.es.accessKeyId, config.es.secretAccessKey)
});

let es = new AWS.ES({
  region: config.es.region,
  accessKeyId: config.es.accessKeyId,
  secretAccessKey: config.es.secretAccessKey,
  endpoint: config.es.endpoint
});

function testES() {
  es.listDomainNames((err, data) => {
    if (err) console.log(err, err.stack);
    else console.log(data);
  })
}

module.exports = {testES};
