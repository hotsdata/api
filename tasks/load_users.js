var { Client } = require('pg');
var conString = require('../src/db');

var { searchUsers, loadUser, getByPlayerId, deleteByPlayerId } = require('../src/es/users');

let query = `
  SELECT
    player_id,
    battletag,
    split_part(battletag, '#', 1) as name,
    toonhandle,
    case split_part(toonhandle, '-', 1) when '1' then 'NA' when '2' THEN 'EU' when '3' then 'KR' when '5' then 'CN' end as region
  FROM battletag_toonhandle_lookup
  WHERE battletag = 'Arik#1705'
`;

// let client = new Client(conString);
//
// client.connect();
//
// client.query(query, (err, res) => {
//   res.rows.forEach(user => {
//     loadUser(user);
//     // getByPlayerId(user.player_id);
//   })
// });

// searchUsers(null, "arik");
// getByPlayerId(543);
// getByPlayerId(6755);
// deleteByPlayerId(543);
