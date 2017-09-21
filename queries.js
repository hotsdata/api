/**
 * Created by crorella on 5/9/17.
 */

module.exports = {
    replay_info: "SELECT r.replayid, " +
    "r.doc - 'id' AS replay_data, " +
    "account.account_info, " +
    "player_stats, " +
    "talents, " +
    "jsonb_agg(t.doc || mts.doc) AS teams_stats " +
    "FROM " +
    "replayinfo r " +
    "JOIN teamgeneralstats t " +
    "ON r.replayid = t.replayid " +
    "JOIN teammapstats mts " +
    "ON (mts.replayid = r.replayid AND mts.team = t.team) " +
    "JOIN " +
    "( SELECT gs.replayid, jsonb_agg(gs.doc - 'pickedTalents' || ms.doc) AS player_stats, " +
    "jsonb_agg(jsonb_build_object('hero', gs.heroname, 'team', gs.team, 'player', player, 'matchResult', matchResult, 'talents', gs.talents)) " +
    "AS talents " +
    "FROM " +
    "(SELECT replayid, " +
    "heroname, " +
    "team, " +
    "doc, " +
    "player, " +
    "matchResult, " +
    "jsonb_agg(jsonb_build_object('talent_name', hi.name, 'talent_icon', SPLIT_PART(hi.icon,'.',1), 'talent_seconds', talent_seconds, 'description', '')) AS talents " +
    "FROM " +
    "( SELECT gs.replayid, " +
    "gs.heroname, " +
    "(r.doc->>'gameVersion')::INTEGER AS gameVersion, " +
    "p.doc ->> 'name' AS player, " +
    "CASE (p.doc->>'gameResult')::integer WHEN 1 THEN 'Victory' WHEN 2 THEN 'Defeat' ELSE 'Undecided' END AS matchResult, " +
    "gs.team, " +
    "gs.doc, " +
    "(jsonb_array_elements(gs.doc -> 'pickedTalents') ->> 'seconds') :: INTEGER AS talent_seconds, " +
    "jsonb_array_elements(gs.doc -> 'pickedTalents') ->> 'talent_name' AS talent_name " +
    "FROM generalstats gs " +
    "JOIN players p " +
    "ON (p.replayid = gs.replayid AND p.team = gs.team AND p.heroname = gs.heroname) " +
    "JOIN replayInfo r ON (r.replayid = p.replayid)" +
    "WHERE p.replayid = $1 ) gs " +
    "LEFT OUTER JOIN talents hi " +
    "ON (hi.id = gs.talent_name AND gs.heroname = hi.hero AND hi.patch = gs.gameVersion) " +
    "GROUP BY " +
    "replayid, " +
    "heroname, " +
    "team, " +
    "doc, " +
    "player, " +
    "matchResult " +
    "ORDER BY team) gs " +
    "JOIN mapstats ms " +
    "ON (gs.replayid = ms.replayid AND gs.heroname = ms.heroname AND gs.team = ms.team) " +
    "WHERE gs.replayid = $1 GROUP BY 1) pms " +
    "ON (pms.replayid = r.replayid) " +
    "JOIN (SELECT replayid, jsonb_agg(doc - 'battleTag') AS account_info FROM players WHERE replayid = $1 GROUP BY replayid) account " +
    "ON (account.replayid = r.replayid) " +
    "WHERE r.replayid = $1 " +
    "GROUP BY 1, 2, 3, 4, 5;"

        ,

    all_replays: "SELECT ri.doc ->> 'mapName' AS mapName, " +
    "(ri.doc ->> 'gameLoops') :: INTEGER / 16 AS duration, " +
    "ri.doc ->> 'gameType'AS gameType, " +
    "to_char(ri.updated_at, 'mm/dd/yyyy HH:MI:SS') AS uploaded_at, " +
    "to_char((ri.doc ->> 'startTime') :: TIMESTAMP, 'mm/dd/yyyy HH:MI:SS') AS played_at, " +
    "ri.replayId, string_agg(p.doc ->> 'name', ',') AS players, " +
    "p.heroname, p.doc->>'heroLevel' AS heroLevel, " +
    "CASE (p.doc->>'gameResult')::integer " +
    "WHEN  1 THEN 'Victory' " +
    "WHEN 2 THEN 'Defeat' " +
    "ELSE 'Undecided' END AS matchResult " +
    "FROM replayInfo ri " +
    "JOIN players p " +
    "ON (ri.replayId = p.replayId) " +
    "WHERE p.doc @> '{\"battleTag\": \"%s\"}' " +
    "AND (p.doc->>'gameResult')::integer IN (1,2) " +
    "GROUP BY ri.doc, ri.updated_at, ri.replayId, p.heroname, p.doc " +
    "ORDER BY (ri.doc ->> 'startTime') :: TIMESTAMP DESC " +
    "OFFSET %s LIMIT %s;",

    heroes_stats: "SELECT g.doc AS gdoc, " +
    "m.doc AS mdoc, " +
    "p.doc#>>'{name}' AS playerName, " +
    "p.doc#>>'{heroLevel}' AS heroLevel " +
    "FROM generalStats g " +
    "JOIN mapStats m ON " +
    "(g.replayId = m.replayId AND g.heroName = m.heroName AND g.team = m.team) " +
    "JOIN players p ON (g.replayId = p.replayId AND g.heroName = p.heroName AND g.team = p.team) " +
    "WHERE g.replayId = $1",

    check_user: "SELECT COUNT(1) AS val FROM hotsdata_user WHERE email = $1",

    check_replay: "SELECT COUNT(1) AS val FROM replayInfo where replayId = $1",

    check_email: "SELECT COUNT(1) AS val FROM hotsdata_user WHERE email = $1 AND user_id <> $2",

    search_players: "SELECT split_part(battletag,'#',1) as name, player_id, toonHandle," +
      "case split_part(toonhandle, '-', 1 ) WHEN '1' THEN 'NA' when '2' THEN 'EU' WHEN '98' THEN 'PTR' end as region " +
      "FROM battletag_toonhandle_lookup WHERE battletag iLIKE '%s%' ORDER BY battletag",

    insert_user: "INSERT INTO hotsdata_user (email, password, verified, battletag, toonhandle, user_tz) VALUES ($1, $2, 'f',$3,$4,$5)",

    update_user: "UPDATE hotsdata_user " +
    "SET password = CASE WHEN (password <> $2 AND LENGTH(COALESCE($2,'')) > 0) THEN $2 ELSE password END," +
    "battletag = CASE WHEN (battletag <> $3 AND LENGTH(COALESCE($3,'')) > 0) THEN $3 ELSE battletag END, " +
    "toonhandle = CASE WHEN (toonhandle <> $4 AND LENGTH(COALESCE($4,'')) > 0) THEN $4 ELSE toonhandle END, " +
    "user_tz = CASE WHEN (user_tz <> $5 AND LENGTH(COALESCE($5,'')) > 0) THEN $5 ELSE user_tz END " +
    "WHERE user_id = $1;",

    validate_user: "SELECT user_id, toonhandle, battletag FROM hotsdata_user WHERE lower(email) = lower($1) AND password = $2",

    get_user_id: "SELECT u.user_id, MIN(l.toonhandle) AS toonhandle FROM hotsdata_user u LEFT OUTER JOIN battletag_toonhandle_lookup l ON " +
    "(l.battletag = u.battletag) WHERE email = $1 GROUP BY u.user_id",

    get_teammates: "SELECT DISTINCT split_part(btl.battletag, '#', 1) as name, tm.toonhandle_2 as toonhandle, games " +
    "FROM teammates tm " +
    "INNER join battletag_toonhandle_lookup btl on btl.toonhandle = tm.toonhandle_2 " +
    "WHERE toonhandle_1 = '%s' " +
    "ORDER BY games desc " +
    "LIMIT 50;",

    get_user_stats: "SELECT player_name, player_id, jsonb_agg(stats) AS stats FROM ( " +
    "SELECT " +
    "player_name, " +
    "player_id, " +
    "jsonb_build_object('map', mapname, 'hero_stats', " +
    "jsonb_agg(jsonb_build_object('metric', metric, 'value', value, 'games', games))) AS stats " +
    "FROM ( " +
    "SELECT " +
    "name AS player_name, " +
    "player_id, " +
    "mapname, " +
    "metric, " +
    "SUM(value) AS value, " +
    "SUM(games) AS games " +
    "FROM stg_player_stats_agg " +
    "WHERE ((CASE WHEN %s > 0 THEN player_id = %s END) " +
    "OR (CASE WHEN LENGTH(%L) > 0 THEN toonhandle = %L END)) " +
    "AND (CASE WHEN 'overall' IN (%s) THEN 1=1 ELSE metric IN (%s) END) " +
    "AND match_date BETWEEN CAST(%L AS TIMESTAMP) AND CAST(%L AS TIMESTAMP) " +
    "AND (CASE WHEN 'overall' = %s THEN 1=1 ELSE mapname = %s END) " +
    "AND player_id > 0" +
    "GROUP BY name, mapname, metric, player_id " +
    "ORDER BY name ASC) A " +
    "GROUP BY player_name, player_id, mapname) B " +
    "GROUP BY player_name, player_id",

   // rank_users_by_stat: "SELECT "

    get_user_stats_per_hero: "SELECT AGG.toonhandle, split_part(battletag, '#', 1) as name, jsonb_agg(stats) AS stats FROM " +
    "( SELECT toonhandle, jsonb_build_object('hero', heroname, 'hero_stats', jsonb_agg(jsonb_build_object('metric', metric, 'value', value, 'games', games))) AS stats " +
    "FROM (SELECT toonhandle, heroname, COUNT(1) AS games, key AS metric, SUM(value::integer) AS value " +
    "FROM fct_player_stats_agg, jsonb_each_text(stats) WHERE toonhandle = %L " +
    "AND (CASE WHEN 'overall' IN (%s) THEN 1=1 ELSE key IN (%s) END) " +
    "AND match_date BETWEEN CAST(%L AS TIMESTAMP) AND CAST(%L AS TIMESTAMP) " +
    "AND (CASE WHEN 'overall' = %s THEN 1=1 ELSE mapname = %s END) " +
    "AND (CASE WHEN 'overall' IN (%s) THEN 1=1 ELSE heroname IN (%s) END) " +
    "AND player_id > 0 " +
    "GROUP BY key, heroname, toonhandle ) metrics GROUP BY heroname, toonhandle " +
    "ORDER BY heroname ASC) AGG INNER JOIN battletag_toonhandle_current btc on AGG.toonhandle = btc.toonhandle GROUP BY AGG.toonhandle, battletag",

    get_user_replays: "select pl.doc ->> 'gameResult' as gameResult, pl.doc ->> 'hero'::varchar as hero, " +
    "pl.doc ->> 'heroLevel' as heroLevel, ri.doc ->> 'mapName' as mapName, ri.doc ->> 'startTime' as startDate, " +
    "(ri.doc ->> 'gameLoops') :: INTEGER as gameDuration FROM replayinfo ri, " +
    "players pl WHERE pl.replayid = ri.replayid AND (pl.doc ->> 'name') like $1;",

    get_win_rates: "SELECT jsonb_agg(info) AS data " +
    "FROM ( SELECT jsonb_build_object('hero', heroname, 'stats', jsonb_agg(stats), 'role', v.role) AS info " +
    "FROM ( SELECT w.heroname, " +
    "heroes.role, " +
    "tot_games, " +
    "jsonb_build_object(w.game_type, jsonb_build_object('games', SUM(games_l90), 'winrate', ROUND(SUM(wins_l90) / SUM(games_l90), 2), 'banned', COALESCE(b.banned_games, 0), 'popularity', ROUND( (100 * (SUM(games_l90) + COALESCE(b.banned_games, 0)) / total_games.tot_games), 2))) AS stats " +
    "FROM stats_historical_winrates w " +
    "LEFT OUTER JOIN " +
    "(SELECT SUM(games_l90) AS tot_games, game_type FROM stats_historical_winrates WHERE gameversion = $1 AND (CASE WHEN 'overall' = $2 THEN 1=1 ELSE mapname = $2 END) GROUP BY game_type) " +
    "total_games ON (w.game_type = total_games.game_type) " +
    "LEFT OUTER JOIN (SELECT SUM(banned_games) AS banned_games, heroname, gameversion, game_type " +
    "FROM stats_hero_bans WHERE gameversion = $1 AND (CASE WHEN 'overall' = $2 THEN 1=1 ELSE mapname = $2 END)" +
    "GROUP BY heroname, gameversion, game_type) b " +
    "ON (w.heroname = b.heroname AND w.gameversion = b.gameversion AND w.game_type = b.game_type) " +
    "LEFT OUTER JOIN heroes ON (heroes.name = w.heroname) " +
    "WHERE w.gameversion = $1 AND (CASE WHEN 'overall' = $2 THEN 1=1 ELSE mapname = $2 END)" +
    "GROUP BY w.heroname, b.banned_games, w.game_type, heroes.role, tot_games) v GROUP BY heroname, role) data;",

    get_hero_info_old: "SELECT hero_id, hero_info, hero_talents FROM hero_data WHERE CASE WHEN $1 <> '' THEN hero_info->>'hero_name' = $1 ELSE 1=1 END",

    get_hero_info: "SELECT name, role from heroes",

    insert_reset_key: "INSERT INTO reset_password_requests(email,hashkey,expiration_date) VALUES($1,$2,$3);",

    check_reset_key: "SELECT email, expiration_date from reset_password_requests WHERE hashkey = $1;",

    update_pass: "UPDATE hotsdata_user SET password = $2 where email = $1;",

    check_active_requests: "SELECT email from reset_password_requests WHERE email = $1 and resolved = '0';",

    resolve_reset_request: "UPDATE reset_password_requests SET resolved = '1' WHERE hashkey = $1",

    get_patches: "SELECT array_agg(gameversion) AS gameversion FROM patches ORDER BY gameversione;"
}
