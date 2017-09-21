var Elasticsearch = require('aws-es');
let AWS = require('aws-sdk');
var {newESClient} = require('../src/es/client');
var {searchUsers} = require('../src/es/users');

var client = newESClient();

searchUsers("mar").then(resp => {
  console.log(resp.hits.hits);
});

// PING
// client.ping({
//   requestTimeout: 30000,
// }, function (error) {
//   if (error) {
//     console.error('elasticsearch cluster is down!');
//   } else {
//     console.log('All is well');
//   }
// });

// SEARCH
// client.search({
//   index: 'hotsdata',
//   type: 'user',
//   body: {
//     size: 50,
//     query: {
//       wildcard: {
//         name: "*maro*"
//       }
//     }
//   }
// }).then(function (resp) {
//     console.log('resp', resp);
//     console.log('hits', resp.hits);
// }, function (err) {
//     console.trace(err.message);
// });

// CREATE
// client.create({
//   index: 'hotsdata_users',
//   type: 'user',
//   id: '1474',
//   body: {
//      "name": "BTYMarod",
//      "player_id": 1474,
//      "toonhandle": "1-Hero-1-8129169",
//      "region": "NA"
//   }
// }, function (error, response) {
//   // ...
// });
