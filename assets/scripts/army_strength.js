(function(app){

  var armyStrength = function(data) {
    var blueStr = data['team0'];
    var redStr = data['team1'];

    var w = 533;
    var h = 400;
    var padding = 30;
    var radius = 10;
    var topMargin = 15;

    var blueTeamArea = [];
    var redTeamArea = [];

    var totalEvents = Math.max(blueStr.length, redStr.length);

    for (var pos = 0;pos < totalEvents;pos++) {
      var blueStrValue = blueStr[pos] || 0;
      var redStrValue = redStr[pos] || 0;
      var strDiff = (blueStrValue - redStrValue);

      // Blue above the x axis
      blueTeamArea.push(Math.max(0, strDiff));

      // Red below the x axis
      redTeamArea.push(Math.min(strDiff, 0));
    }

    //Create scale functions
    var xScale = d3.scale.linear()
        .domain([1, totalEvents])
        .rangeRound([padding, w - padding]);

    var yScale = d3.scale.linear()
        .domain([
          d3.min(redTeamArea) - padding / 10,
          d3.max(blueTeamArea) + padding / 10
        ])
        .rangeRound([h - padding, topMargin]);


    //Create SVG element
    var svg = d3.select("body")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    // Create grid
    var xGridAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

    var yGridAxis = d3.svg.axis()
        .scale(yScale)
        .orient("right");

    svg.append("g")
        .call(xGridAxis.tickSize(h - padding, 0, 0)
        .tickFormat(""))
        .attr("class", "gridAxis")
        .attr("transform", "translate(0," + topMargin + ")");

    svg.append("g")
        .call(yGridAxis.tickSize(w - padding * 2 , 0, 0)
        .tickFormat(""))
        .attr("class", "gridAxis")
        .attr("transform", "translate(" + padding + ", 0)");

    //Define X, Y axis
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickFormat(app.helpers.timeFormat);

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .tickFormat(Math.abs);

    svg.append("g")
        .call(xAxis)
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - padding) + ")");

    svg.append("g")
        .call(yAxis)
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)");

    var contextArea = d3.svg.area()
        .interpolate("basis")
        .x(function(d, i) { return xScale(i) })
        .y0(function(d, i) { return yScale(d) })
        .y1(yScale(0));

    svg.append("svg:path")
        .attr("d", contextArea(blueTeamArea))
        .attr("fill", "blue")
        .attr("fill-opacity", "0.4");

    svg.append("svg:path")
        .attr("d", contextArea(redTeamArea))
        .attr("fill", "red")
        .attr("fill-opacity", "0.4");
  }

  app.charts = app.charts || {};
  app.charts.armyStrength = armyStrength;
})(window.app || (window.app = {}));
