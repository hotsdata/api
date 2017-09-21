var Elasticsearch = require('aws-es');
let AWS = require('aws-sdk');
var config = require('../../config');

AWS.config.update({ region: config.es.region });
AWS.config.update({
  credentials: new AWS.Credentials(config.es.accessKeyId, config.es.secretAccessKey)
});

let esCreds = new AWS.Credentials(config.es.accessKeyId, config.es.secretAccessKey);

function newESClient() {
  return require('elasticsearch').Client({
    hosts: config.es.hosts,
    keepAlive: true
  })
}

module.exports = {newESClient, esCreds};
