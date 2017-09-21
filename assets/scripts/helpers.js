// Helpers
(function(app) {
  var environment = 'dev-local';
  var getQueryStringValue = function (key) {
    return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
  };
  var getReplayId = function() {
    return getQueryStringValue("replayId") || 'bba75ae6efb5830a33a596ebe16177309a6fec815853311a43e6c37f17ee3910';
  };
  var timeFormat = function (arg) {
    var seconds = parseInt(arg, 10);
    var lengthFormat = seconds > 3600 ? "HH:mm:ss" : "mm:ss";
    return moment().startOf('day').seconds(seconds).format(lengthFormat);
  };
  var getApiUrl = function() {
    if (environment == 'dev-local') return "http://127.0.0.1:1234";
    else return "https://peaceful-lowlands-76958.herokuapp.com";
  };

  app.helpers = {
    getQueryStringValue: getQueryStringValue,
    getReplayId: getReplayId,
    timeFormat: timeFormat,
    getApiUrl: getApiUrl
  };
})(window.app || (window.app = {}));
