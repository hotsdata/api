/**
 * Created by crorella on 5/9/17.
 */
var randomstring = require("randomstring");
var config = require('./config');
var AWS = require('aws-sdk');
var queries = require('./queries');
var validator = require("email-validator");
var pg = require('pg');
var jwt = require('jsonwebtoken');
var validator = require("email-validator");
var sha256 = require("sha256");
var _ = require("lodash");
var format = require('pg-format');
var mailgun = require('mailgun-js')({apiKey: config.mailgun.api_key, domain: config.mailgun.domain});
var needle = require('needle');
var regex = new RegExp("^[a-zA-ZñÑáàéàíìóòúùäëïöüâêîôûçÇÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÂÊÎÔÛ]([\\wñÑáàéàíìóòúùäëïöüâêîôûçÇÁÉÍÓÚÀÈÌÒÙÄËÏÖÜÂÊÎÔÛ\\d]){2,12}#\\d{4,5}");
const heroprotocol = require('heroprotocol');
var fs = require('fs');
var {searchUsers} = require('./src/es/users');


const API_TMP_FOLDER = '/tmp/';
const MIN_USERNAME_LENGTH = 3;
const MIN_PASSWORD_LENGTH = 6;
const MAX_USERNAME_LENGTH = 15;
const MAX_PASSWORD_LENGTH = 256;

const conString = "postgres://" +
    config.postgres.user + ":" +
    config.postgres.password + "@" +
    config.postgres.host + "/" +
    config.postgres.db;


module.exports = {

    userInfo: function(req, res, next) {
      var token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, config.jwt.secret, function (err, decoded) {

        if (err) {
            console.error("Error while trying to retrieve teammates: ", err);
            res.send(401);
        }

        let user = {
          email: decoded.email,
          toonhandle: decoded.toonHandle,
          userId: decoded.user_id,
          battletag: decoded.battleTag
        }

        res.contentType = 'json';
        res.send(user);
      })
    },

    register_user: function(req, res, next) {

        var user_tz;
        // check we have user/password/email
        if (!req.params.password) {
            res.status(401);
            res.send({'msg' : 'Password can\'t be empty'})
        }
        if (!req.params.email) {
            res.status(401);
            res.send({'msg' : 'Email can\'t be empty'})
        }
        if(!regex.test(req.params.battletag))
        {
            res.status(401);
            res.send({'msg' : 'Battle-tag not valid.'})
        }
        if(!req.params.tz)
        {
         user_tz = 'UTC';
        }else{
            user_tz = req.params.tz;
        }
        if(res.statusCode == 200)
        {
            if (validator.validate(req.params.email)
                && req.params.password.length >= MIN_PASSWORD_LENGTH
                && req.params.password.length <= MAX_PASSWORD_LENGTH
                ) {
                    // Check the email is not taken
                    pg.connect(conString, function (err, client, done) {
                        // no need to escape the parameter, since pg already does it to prevent SQL injection
                        client.query(queries.check_user, [ req.params.email], function (err, result) {
                            done();
                            if (err){console.log(err)}
                            if (result == null) res.send({"msg": "Unable to retrieve users"});
                            //res.contentType = 'json';
                            if (parseInt(result.rows[0]['val']) == 0) {
                                var email = req.params.email.toLowerCase();
                                var pass = sha256(req.params.password);
                                var battletag = req.params.battletag;
                                var toonhandle = req.params.toonhandle;

                                client.query(queries.insert_user, [email, pass, battletag, toonhandle, user_tz], function (err, result) {
                                 done();
                                    if (err)
                                    {console.log(err)}
                                    if (result == null) {
                                        res.send({"msg": "Unable to insert user"});
                                    }
                                    else {
                                        client.query(queries.get_user_id, [req.params.email], function (err, result) {
                                            done();
                                            if (err) {console.log(err)};
                                            if (result == null) res.send({"msg": "Error when retrieving user_id"});
                                            var claim = {
                                                toonHandle: req.params.toonhandle || result.rows[0]['toonhandle'] || null,
                                                user_id: result.rows[0]['user_id'],
                                                battleTag: req.params.battletag || null,
                                                email: email
                                            };
                                            jwt.sign(claim, config.jwt.secret, function(err, token)
                                            {
                                                needle.get('https://slack.com/api/chat.postMessage?token=SLACK_TOKEN&channel=%23web-events&text='+email+'%20just%20registered&pretty=1', function(error, response) {
                                                    if (!error && response.statusCode == 200)
                                                        console.log("Failed to report to slack channel");
                                                });
                                                res.status(200);
                                                res.json({'user': {'email': email, 'battletag': battletag}, token: token});
                                            });
                                        });
                                    }
                                });
                            }
                            else if (parseInt(result.rows[0]['val']) >= 1) {
                                res.send({"msg": "Email already registered"});
                            }
                        })
                    });
                }
            else {
                res.status(500);
                res.send({'msg': 'Password must be between ' + MIN_PASSWORD_LENGTH + ' and ' + MAX_PASSWORD_LENGTH + ' characters long'})
            }
        }
    },

    update_user: function(req, res, next) {
        var token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, config.jwt.secret, function (err, decoded) {

            if (err) {
                console.error("/update error: ", err);
                res.send(401);
            }

            var new_password =  req.params.password || '';
            var new_battletag = req.params.battletag|| '';
            var new_toonhandle = req.params.toonhandle || '';
            var new_tz = req.params.tz || '';


            // if there is a new password, then encode it
            if (new_password.length > 0) {
                new_password = sha256(new_password);
            }

            // if email is not being used
            pg.connect(conString, function (err, client, done) {
                client.query(queries.update_user, [decoded.user_id, new_password, new_battletag, new_toonhandle, new_tz], function (err, result) {
                    done();
                    if (err) {console.log(err)};
                    if (result == null) res.send({"msg": "Unable to update player"});
                    res.contentType = 'json';
                    var claim = {
                        toonHandle: new_toonhandle || decoded.toonhandle,
                        user_id: decoded.user_id,
                        battleTag: new_battletag || decoded.battletag,
                        email: decoded.email
                    };
                    jwt.sign(claim, config.jwt.secret, function(err, token)
                    {
                        res.json({result: true, 'user': {'email': claim.email, 'battletag': claim.battleTag}, token: token});
                    });

                })
            })
        })
    },

    authUser: function (req, res, next) {
        var email = req.params.email.toLowerCase() || '';
        var password = req.params.password || '';

        if (email.length == 0)
        {
            res.send({"msg": "Error - missing email"});
        }

        if (password.length > 0) {
            password = sha256(password);
        }
        else {
            res.send({"msg": "Error - missing password"});
        }

        pg.connect(conString, function (err, client, done) {
            client.query(queries.validate_user, [email, password], function (err, result) {
                done();
                if (err) {console.log(err)};
                if (result == null) res.send({"msg": "Unable to retrieve player"});
                res.contentType = 'json';

                if (result.rows.length == 0) {
                    res.send({"msg": "Error - Could not login with the provided credentials"});
                }
                battletag = result.rows[0]['battletag'];
                var claim = {
                    toonHandle: result.rows[0]['toonhandle'],
                    user_id: result.rows[0]['user_id'],
                    battleTag: battletag,
                    email: email
                };
                jwt.sign(claim, config.jwt.secret, function(err, token)
                {
                    res.json({result: true, 'user': {'email': email, 'battletag': battletag}, token: token});
                });
            })
        })
    },

    upload_replay: function (req, res, next) {
        if (req.params.replay === undefined || !req.files.replay.name.endsWith("StormReplay")) {
            return next(new restify.InvalidContentError('Invalid JSON in the POST body or file not valid'));
        }
        var replay_name = randomstring.generate() + ".StormReplay";
        var wstream = fs.createWriteStream(API_TMP_FOLDER + replay_name);
        wstream.on('finish', function () {
            const details = heroprotocol.get(heroprotocol.DETAILS, API_TMP_FOLDER + replay_name);
            var match_ts = details.m_timeUTC;
            // TODO Agree on return codes so the uploader can report that
            if (details.m_title == 'Sandbox (Cursed Hollow)') {
                console.log("Sandbox map not supported");
                res.send(200);
                return next();
            }
            if (details.m_playerList.length < 10) {
                console.log("Less than 10 players");
                res.send(200);
                return next();
            }
            for (var p in details.m_playerList) {
                if (details.m_playerList[p].m_toon.m_id == 0) {
                    console.log("Skipped vs A.I. game");
                    res.send(200);
                    return next();
                }
            }
            // TODO: Check why the file is not deleted
            fs.unlink(API_TMP_FOLDER + replay_name, function () {;});
            var data = {
                Key: match_ts + '_' + replay_name,
                Body: req.params.replay
            };
            // TODO: change this timestamp to last 3 months since current date
            if (match_ts > 131380800010001000) {
                var s3bucket = new AWS.S3({params: {Bucket: config.s3.bucket}});
                AWS.config.loadFromPath('credentials.json');
                AWS.config.update({region: config.server.region});
                s3bucket.putObject(data, function (err, data) {
                    if (err) {
                        res.send(500);
                        return next();
                    } else {
                        res.send(200);
                        return next();
                    }
                });
            }
            // if it's an old replay, move it to the low pri queue
            else {
                var s3bucket = new AWS.S3({params: {Bucket: config.s3.lowpri_bucket}});
                AWS.config.loadFromPath('credentials.json');
                AWS.config.update({region: config.server.region});
                s3bucket.putObject(data, function (err, data) {
                    if (err) {
                        res.send(500);
                        return next();
                    } else {
                        res.send(200);
                        return next();
                    }
                });
            }
        });
        wstream.write(req.params.replay);
        wstream.end();
    },

    getPlayerTeammates: function (req, res, next) {
      var token = req.headers.authorization.split(' ')[1];
      jwt.verify(token, config.jwt.secret, function (err, decoded) {

        if (err) {
            console.error("Error while trying to retrieve teammates: ", err);
            res.send(401);
        }

        pg.connect(conString, function (err, client, done) {
            var sql = format(queries.get_teammates, decoded.toonHandle);
            client.query(sql, function (err, result) {
                done();
                if (err) {console.log(err)}
                if (result == null) res.send({"msg": "Unable to retrieve teammates"});
                res.contentType = 'json';
                res.send(result.rows);
            })
        })
    })
},
    getReplayInfo: function (req, res, next) {
        if (req.params.replayID.length != 64) {
            res.send({"msg": "Invalid id"});
        }
        pg.connect(conString, function (err, client, done) {
            client.query(queries.replay_info, [req.params.replayID], function (err, result) {
                done();
                if (err) {console.log(err)};
                if (result == null || result.rowCount == 0) res.send({"msg": "Replay not found"});
                res.contentType = 'json';
                res.send(result.rows);
            })
        });
    },

    getAllReplays: function (req, res, next) {

        var token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, config.jwt.secret, function (err, decoded) {

            if (err) {
                console.error("/list error: ", err);
                res.send(401);
            }

            pg.connect(conString, function (err, client, done) {

                var sql = format(queries.all_replays, decoded.battleTag, ((req.paginate.page - 1) * req.paginate.per_page), req.paginate.per_page);

                client.query(sql, function (err, result) {
                    done();
                    if (err) {console.log(err)};
                    if (result == null) res.send({"msg": "Unable to retrieve replays"});
                    res.contentType = 'json';
                    var response = res.paginate.getResponse(result.rows);
                    //var reply = _.map(result.rows, 'doc');
                    //res.send();
                    res.send(response);
                })
            })
        })
    },

    searchPlayerByName: function (req, res, next) {
        if (req.params.pattern.length < 3) {
            res.send({"msg": "At least 3 characters needed"});
        }
        pg.connect(conString, function (err, client, done) {

            var sql = format(queries.search_players, req.params.pattern);
            console.log('sql', sql);

            client.query(sql, function (err, result) {
                done();
                if (err) {console.log(err)};
                if (result == null) res.send({"msg": "Unable to search players"});
                res.contentType = 'json';
                //var response = res.paginate.getResponse(result.rows);
                //var reply = _.map(result.rows, 'doc');
                //res.send();
                res.send(result.rows);
            })
        })
    },

    searchESByName: function(req, res, next) {
      if (req.params.pattern.length < 3) {
          res.send({"msg": "At least 3 characters needed"});
      }
      searchUsers(req.params.pattern)
      .then(resp => {
        let results = resp.hits.hits.map(hit => {
          return hit._source;
        })

        res.send(results);
      })
    },

    getHeroesStats: function (req, res, next) {
        if (req.params.replayID.length != 64) {
            res.send({"msg": "Invalid id"});
        }
        pg.connect(conString, function (err, client, done) {
            client.query(queries.heroes_stats, [req.params.replayID], function (err, result) {
                done();
                if (err) {
                    console.log(err)
                }
                if (result == null) res.send({"msg": "Replay not found"});
                res.contentType = 'json';
                var greply = _.map(result.rows, 'gdoc');
                var mreply = _.map(result.rows, 'mdoc');
                res.send(result.rows);
            });
        })
    },

    checkReplay: function (req, res, next) {
        if (req.params.replayId.length != 64) {
            res.send({"msg": "Invalid id"});
        }

        pg.connect(conString, function (err, client, done) {
            client.query(queries.check_replay, [req.params.replayId], function (err, result) {
                done();
                if (err) {
                    console.log(err)
                }
                if (result == null ) res.send({msg: "Unable to check replays"});
                if (parseInt(result.rows[0]['val']) == 0) res.send(false);
                res.send(true);
            });
        });
    },


    getPlayerReplays: function (req, res, next) {
        if (req.params.player.length == 0) {
            res.send({"msg": "No player provided"});
        }
        //TODO change player filter for the toonhandle
        pg.connect(conString, function (err, client, done) {
            client.query(queries.get_user_replays, [req.params.player], function (err, result) {
                done();
                if (err)
                {
                 {console.log(err)};
                }
                if (result == null) {
                    res.send({"msg": "Player not found"})
                };
                res.contentType = 'json';
                res.send(result.rows);
            });
        });
    },

    getPlayerHeroStats: function(req, res, next)
    {
        /* Common parameters */
        var start_date = req.params.start_date || '2014-01-01';
        var end_date = req.params.end_date || '2020-12-31';
        var metric = req.params.metric || "'overall'";
        var mapname = req.params.mapname || "'overall'";
        mapname = mapname.replace("'","\'");
        var heroes = req.params.heroes || "'overall'";
        heroes = heroes.replace("'","\'");
        // If the  map is not overall then quote it
        // TODO: validate date parameters
        if (mapname !=  "'overall'") {
            mapname = "'" + mapname + "'";
        }

        if (metric !=  "'overall'") {
            //we have actual metrics to retrieve
            metric = metric.split(',');
            metric = _.invokeMap(metric, function() {
                return "'" + this + "'";
            });

            metric = _.join(metric, ",");

        }
        if (heroes !=  "'overall'") {
            //we have actual heroes to retrieve
            heroes = heroes.split(',');
            heroes = _.invokeMap(heroes, function() {
                return "'" + this + "'";
            });
            heroes = _.join(heroes, ",");
        }

        /* Check if user is authenticated, if so, retrieve the toonhandle from the token in case
        * is not in the parameter list*/
        if (req.headers.authorization) {
            var token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, config.jwt.secret, function (err, decoded)
            {
                if(err)
                {
                    res.status(401);
                } else
                {
                    var toonhandle = req.params.toonhandle || decoded.toonHandle || '';
                    console.log('toonhandle', toonhandle);

                    if (toonhandle.length == 0)
                    {
                        res.status(403);
                        res.send({'msg': 'You need to specify the toonhandle parameter'});
                    }
                    /* Run the query*/
                    pg.connect(conString, function (err, client, done)
                    {
                        var sql = format(queries.get_user_stats_per_hero,
                            toonhandle,
                            metric,
                            metric,
                            start_date,
                            end_date,
                            mapname,
                            mapname,
                            heroes,
                            heroes);

                        client.query(sql, function (err, result)
                        {
                            done();
                            if (err)
                            {
                                console.log(err);
                            }
                            if (result == null)
                            {
                                res.send({"msg": "Player not found"})
                            }
                            res.contentType = 'json';
                            res.send(result.rows);
                        });
                    });

                }

            });
        }
        /* if the user is not authenticated, then retrieve the toonhandle directly from the parameters */
        else {
            var toonhandle = req.params.toonhandle || '';

            if (toonhandle.length == 0)
            {
                res.status(403);
                res.send({'msg': 'You need to specify the toonhandle parameter'});
            }
            /* Run the query*/
            pg.connect(conString, function (err, client, done)
            {
                var sql = format(queries.get_user_stats_per_hero,
                    toonhandle,
                    metric,
                    metric,
                    start_date,
                    end_date,
                    mapname,
                    mapname,
                    heroes,
                    heroes);

                client.query(sql, function (err, result)
                {
                    done();
                    if (err)
                    {
                        console.log(err);
                    }
                    if (result == null)
                    {
                        res.send({"msg": "Player not found"})
                    }
                    res.contentType = 'json';
                    res.send(result.rows);
                });
            });
        }
    },

    getPlayerStats: function(req, res, next)
    {
        //player_id = player_id of the player you want to compare yourself against if 0 or empty then the end point will give you your stats only
        //start_date = format YYYY-MM-DD, starting date to calculate the metric(s), if not given then will calculate the metric(s) for the whole history, regardless if end_date is set
        //end_date = format YYYY-MM-DD, starting date to calculate the metric(s), if not given then will calculate the metric(s) for the whole history, regardless if start_date is set
        //mapname = name of the map if not given then the metric(s) are calculated overall
        //metrics = name of the metrics, comma separated, if not given then all metrics are calculated

        var token = req.headers.authorization.split(' ')[1];
        var battleTag = '';
        var start_date;
        var end_date;
        var metric;
        var heroes;
        jwt.verify(token, config.jwt.secret, function (err, decoded)
        {
            if(err)
            {
                res.status(401);
            } else
            {
                // If no parameter is specified then ask for the battletag of the player
                // The idea here is, as a user, you can either request your stats or someone else's stats
                // mostly for the player comparison functionality
                toonhandle = decoded.toonHandle;
                playerId = req.params.player_id || 0;

                start_date = req.params.start_date || '2017-01-01';
                end_date = req.params.end_date || '2020-12-31';
                // TODO: Validate date paremeters
                metric = req.params.metric ||  "'overall'";
                mapname = req.params.mapname ||  "'overall'";
                mapname = mapname.replace("'","\'");
                // If the  map is not overall then quote it
                if (mapname !=  "'overall'") {
                    mapname = "'" + mapname + "'";
                }

                if (metric !=  "'overall'") {
                //we have actual metrics to retrieve
                metric = metric.split(',');
                metric = _.invokeMap(metric, function() {
                    return "'" + this + "'";
                });
                metric = _.join(metric, ",");
            }

                pg.connect(conString, function (err, client, done)
                {
                    var sql = format(queries.get_user_stats,
                                    playerId,
                                    playerId,
                                    toonhandle,
                                    toonhandle,
                                    metric,
                                    metric,
                                    start_date,
                                    end_date,
                                    mapname,
                                    mapname);
                    client.query(sql, function (err, result)
                    {
                        done();
                        if (err)
                        {
                            console.log(err);
                        }
                        if (result == null)
                        {
                            res.send({"msg": "Player not found"})
                        }
                        res.contentType = 'json';
                        res.send(result.rows);
                    });
                });

            }

        });

    },

    getWinRates: function(req, res, next)
    {
        game_version = req.params.game_version || '';
        map_name = req.params.map_name || 'overall';

        if (game_version.length == 0)
        {
            res.send({"msg": "You need to specify a game version"});
        }

        pg.connect(conString, function (err, client, done)
        {
            client.query(queries.get_win_rates, [game_version, map_name], function (err, result) {
                done();
                if (err) {console.log(err)};
                if (result == null || result.rowCount == 0 || result.rows[0]['data'] == null)
                {
                  res.send({"msg": "No winrate info available"});
                }
                else
                {
                    res.contentType = 'json';
                    res.send(result.rows);
                }
            })
        });

    },

    getPatches: function(req, res, next)
    {
        pg.connect(conString, function (err, client, done)
        {
            client.query(queries.get_patches, function (err, result) {
                done();
                if (err) {console.log(err)};
                if (result == null || result.rowCount == 0)
                {
                    res.send({"msg": "No patch info available"});
                } else
                {
                    res.contentType = 'json';
                    res.send(result.rows);
                }
            })
        });
    },

    getHeroInfo: function(req, res, next)
    {
        pg.connect(conString, function (err, client, done)
        {
            client.query(queries.get_hero_info, function (err, result) {
                done();
                if (err) {console.log(err)};
                if (result == null || result.rowCount == 0)
                {
                    res.send({"msg": "No hero info available"});
                } else
                {
                    res.contentType = 'json';
                    res.send(result.rows);
                }
            })
        });
    },

    getHeroes: function(req, res, next) {
      pg.connect(conString, function (err, client, done)
      {
          client.query(queries.get_hero_info, function (err, result) {
              done();
              if (err) {console.log(err)};
              if (result == null || result.rowCount == 0)
              {
                  res.send({"msg": "No hero info available"});
              } else
              {
                  res.contentType = 'json';
                  res.send(result.rows);
              }
          })
      });
    },

    resetRequest: function(req, res, next)
    {

        var date = new Date();
        var mail = req.params.email;
        var hashKey = sha256(mail + Date.now());
        var expiration_date = date.getHours()*60 + date.getMinutes();
        pg.connect(conString, function(err, client, done)
        {
            if(err)
            {
                console.log(err);
            }
            client.query(queries.get_user_id, [mail], function(err, result)
            {
                done();
                if(err){console.log(err)}
                if (result.rowCount > 0)
                {
                    var user_id = result.rows[0]['user_id'];

                    client.query(queries.check_active_requests, [mail], function(err, result)
                    {

                        if(result.rowCount == 0)
                        {
                            pg.connect(conString, function (err, client, done)
                            {
                                client.query(queries.insert_reset_key, [mail, hashKey, expiration_date], function (err, result)
                                {
                                    done();
                                    if (err)
                                    {
                                        console.log(err)
                                    }else
                                    {

                                        var data =
                                        {
                                          from: 'Hotsdata <reset@hotsdata.com>',
                                          to: mail,
                                          subject: 'Password reset request',
                                          text: 'This request will expire in 1 hour, please click in the following link to reset your password www.hotsdata.com/reset/' + hashKey
                                      };

                                      mailgun.messages().send(data, function (error, body)
                                      {
                                        if(error){
                                            res.status(500);
                                            res.send({'msg': 'Error sending mail'});
                                            console.log(error)
                                        }else
                                        {
                                            res.status(200);
                                            res.send({'msg': 'Mail sent correctly'});
                                        }
                                    });
                                  }
                              });
                            });
                        }else
                        {
                            res.status(403);
                            res.send({'msg': 'There is a pending request, please check your inbox'});
                        }
                    });
                }else
                {
                    res.status(200);
                    res.send({'msg':'Mail sent correctly'})
                }
            });
        });
    },

    checkReset: function(req, res, next)
    {
        var date = new Date();
        var hashKey = req.params.hashkey;
        var now = date.getHours()*60 + date.getMinutes();
        var email;

        pg.connect(conString, function (err, client, done)
        {
            client.query(queries.check_reset_key, [hashKey], function (err, result)
            {
                if (result.rowCount > 0)
                {
                    var expiration_date = result.rows[0]['expiration_date'];
                    done();
                    if (err)
                    {
                        console.log(err)
                    }else
                    {

                        if((now - expiration_date)>60)
                        {

                            res.status(403);
                            res.send({'msg': 'The request has expired, please perform a new one if needed'});

                            client.query(queries.resolve_reset_request,[hashKey], function(err, result)
                            {
                                if (err)
                                {
                                    console.log(err)
                                }
                            });

                        }
                        else
                        {
                            res.status(200);
                            res.send({'msg': 'OK'});
                            email = result.rows[0]['email'];

                        }

                    }
                }
                else
                {
                    res.status(403);
                    res.send({'msg': 'No request found under that identifier'});
                }

            });
        });

    },

    resetPassword: function(req, res, next)
    {
        var email = req.params.email;
        var userID;

        if(req.params.newpassword.length >= MIN_PASSWORD_LENGTH
                && req.params.newpassword.length <= MAX_PASSWORD_LENGTH)
        {
            var newPassword = sha256(req.params.newpassword);
            pg.connect(conString, function (err, client, done)
            {

               client.query(queries.get_user_id, [email], function (err, result)
                {
                    done();
                    if(err)
                    {
                        console.log('Error querying user');
                    }else
                    {
                        userID = result.rows[0]['user_id'];
                    }

                });

               client.query(queries.update_pass, [email, newPassword], function(err,result)
               {
                done();
                    if(err)
                    {
                        res.status(500);
                        res.send('Error updating user, /resetPassword')
                        console.log(err)

                    }else
                    {
                        res.status(200);
                        res.send({'msg': 'Password reset successfully'})
                        client.query(queries.resolve_reset_request,[hashKey], function(err, result)
                        {
                            if (err)
                            {
                                console.log(err)
                            }
                        });
                    }
               });

            });
        }
        else
        {
            res.status(401);
            res.send({'msg': 'Password must be between ' + MIN_PASSWORD_LENGTH + ' and ' + MAX_PASSWORD_LENGTH + ' characters long'})
        }

    }
}
