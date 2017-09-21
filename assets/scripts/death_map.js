(function(app){

  var deathMap = function(data, mouseover, mouseout) {
    var width = 533;
    var mapInfo = app.mapInfo(data.mapName, width);
    var height = width * mapInfo.factor;
    var deaths = _.union(data.deaths.team0, data.deaths.team1);

    var xScale = d3.scale.linear()
        .domain([0, mapInfo["mapSize"][0]])
        .range([0 + mapInfo["margins"][0][0], width + mapInfo["margins"][0][1]]);

    var yScale = d3.scale.linear()
        .domain([0, mapInfo["mapSize"][1]])
        .range([height + mapInfo["margins"][1][0], 0 + mapInfo["margins"][1][1]]);

    var svg = d3.select("#mapSvg")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("svg:image")
        .attr("xlink:href", mapInfo.image)
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height);

    svg
      .selectAll("circle")
      .data(deaths)
      .enter()
      .append("circle")
      .attr("cx", function(death){ return xScale(death.x); })
      .attr("cy", function(death){ return yScale(death.y); })
      .attr("r", 3)
      .style("fill", function(death){ return death.team === 0 ? "blue" : "red"; })
      .style("stroke", "white")
      .style("stroke-width", function(death) { return death.soloDeath ? 1.5 : 1; })
      .on('mouseover', mouseover)
      .on('mouseout', mouseout);

  };

  app.charts = app.charts || {};
  app.charts.deathMap = deathMap;

})(window.app || (window.app = {}));
