var { Client } = require('pg');
var conString = require('../db');
var {newESClient, esCreds} = require('./client');

let query = `
SELECT
  player_id,
  battletag,
  split_part(battletag, '#', 1) as name,
  toonhandle,
  case split_part(toonhandle, '-', 1) when '1' then 'NA' when '2' THEN 'EU' when '3' then 'KR' when '5' then 'CN' end as region
FROM battletag_toonhandle_lookup
WHERE battletag != ''
ORDER BY player_id
LIMIT $1
OFFSET $2
`;

// bulk load users
function bulkLoad(users) {
  let bulkBody = [];
  users.forEach(user => {
    bulkBody.push({
      index: {
        _index: 'hotsdata',
        _type: 'user',
        _id: user.player_id
      }
    });

    bulkBody.push(user);

    var esClient = newESClient();
    esClient.bulk({body: bulkBody})
    .then(response => {
    })
    esClient.close();

  })
}

function loadUsers(limit, offset) {
  let client = new Client(conString);

  client.connect();

  client.query(query, [limit, offset], (err, res) => {
    bulkLoad(res.rows);
    client.end();
  });
}


// load single user
function loadUser(user) {
  let record = {
    index: 'hotsdata',
    type: 'user',
    id: user.player_id,
    body: {
      "player_id": user.player_id,
      "name": user.name,
      "toonhandle": user.toonhandle,
      "region": user.region
    }
  }

  var esClient = newESClient();
  esClient.index(record, (err, res) => {
    console.log('result', res);
  });
  esClient.close();
  // esClient.exists({index: 'hotsdata', type: 'user', id: user.player_id}, (err, exists) => {
  //   if (exists === true) {
  //     console.log('it exists');
  //     esClient.update(record);
  //   } else {
  //     esClient.create(record);
  //   }
  // })
}

// search
function searchUsers(term) {
  var esClient = newESClient();
  return esClient.search({
    index: 'hotsdata',
    type: 'user',
    body: {
      size: 50,
      query: { wildcard: { name: `${term}`}}
    }
  });
}

function getByPlayerId(playerId) {
    var esClient = newESClient();
    esClient.get({index: 'hotsdata', type: 'user', id: playerId}, (err, resp) => {});
    console.log('resp', resp);
    esClient.close();
}

function deleteByPlayerId(playerId) {
  var esClient = newESClient();
  esClient.delete({index: 'hotsdata', type: 'user', id: playerId}, (err, resp) => {
  });
  esClient.close();
}

module.exports = {loadUsers, loadUser, searchUsers, getByPlayerId, deleteByPlayerId};
