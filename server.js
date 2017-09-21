var restify = require('restify');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: 'API'});
var pg = require('pg');
var config = require('./config');
var _ = require('lodash');
var AWS = require('aws-sdk');
var paginate = require('restify-paginate');
var jwt = require('jsonwebtoken');
var jwtRestify = require('restify-jwt');
var rf = require('./route_functions');

const conString = "postgres://" +
    config.postgres.user + ":" +
    config.postgres.password + "@" +
    config.server.host + "/" +
    config.server.db;

pg.defaults.poolIdleTimeout = config.server.poolTimeout;

// S3 upload conf
AWS.config.loadFromPath(config.s3.credentials);
AWS.config.update({region: config.server.region});

var server = restify.createServer({
    log: log,
    name: config.server.name,
    version: config.server.version,
    responseTimeFormatter: function (durationInMilliseconds) {
        return durationInMilliseconds / 1000;
    }
});

server.use(restify.queryParser());
server.use(restify.bodyParser(config.server.bodyParser));
server.use(restify.gzipResponse());
server.use(restify.requestLogger());

server.on('after', restify.auditLogger({
    log: log
}));
server.use(restify.acceptParser(server.acceptable));

server.pre(restify.CORS({
    origins: ['*'],
    credentials: false,
    headers: ['authorization']
}));

restify.CORS.ALLOW_HEADERS.push("authorization");
server.on( "MethodNotAllowed", function(req, res) {
    if(req.method.toUpperCase() === "OPTIONS" ) {
        // Send the CORS headers
        res.header("Access-Control-Allow-Headers", restify.CORS.ALLOW_HEADERS.join( ", " ));
        res.send(204);
    }
    else {
        res.send(new restify.MethodNotAllowedError());
    }
});

server.use(paginate(server));
/************* JWT **************/
server.use(jwtRestify({secret: config.jwt.secret}).unless({
    path: [
        '/login',
        '/upload',
	    '/register',
        '/winrates',
	    '/register',
        '/patches',
        'hero_info',
        new RegExp('/player/heroes/*', 'i'),
        new RegExp('/player/search/*', 'i'),
        new RegExp('/resetRequest/*', 'i'),
        new RegExp('/reset/*', 'i'),
        new RegExp('/checkReset/*', 'i'),
        new RegExp('/resetPassword/*', 'i'),
        new RegExp('/replays/*', 'i') ],
}));

server.pre(restify.pre.userAgentConnection());
server.get(/\/assets\//, restify.serveStatic({
    directory: __dirname,
    default: 'index.html'
}));

// ROUTES
//GET REQUESTS
server.get('/replays/:replayID', rf.getReplayInfo);
server.get('/replays/:replayID/heroes_stats', rf.getHeroesStats);
server.get('/heroes', rf.getHeroes);

// Player endpoints
server.get('/player/teammates', rf.getPlayerTeammates);
server.get('/player/search/:pattern', rf.searchESByName);
server.get('/player/search2/:pattern', rf.searchPlayerByName);
server.get('/player/:player/replays', rf.getPlayerReplays);
server.get('/player/heroes/:toonhandle?', rf.getPlayerHeroStats);
server.get('/player_stats/:player_id?', rf.getPlayerStats);
server.get('/list', rf.getAllReplays);

// Global endpoints
server.get('/winrates', rf.getWinRates);
server.get('/hero_info', rf.getHeroInfo);
server.get('/patches', rf.getPatches);

// User endpoints
server.get('/user', rf.userInfo);
server.get('/reset/:hashkey', rf.checkReset);
server.get('/checkReset/:hashkey', rf.checkReset);
server.get('/replays/check/:replayId', rf.checkReplay);

//POST REQUESTS
server.post('/login', rf.authUser);
server.post('/upload', rf.upload_replay);
server.post('/register', rf.register_user);
server.post('/resetRequest/:email', rf.resetRequest);

//PUT REQUESTS
server.put('/user', rf.update_user);
server.put('/resetPassword/:email/:newpassword', rf.resetPassword);

server.listen(8080, function () {
    console.log('%s listening at %s, %j', server.name, server.url, server.address()['address']);
});
