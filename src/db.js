var config = require('../config');
var pg = require('pg');

const conString = "postgres://" +
  config.postgres.user + ":" +
  config.postgres.password + "@" +
  config.postgres.host + "/" +
  config.postgres.db;

module.exports = conString;
