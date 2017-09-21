(function(app){

  var timeline = function(data, mouseover, mouseout) {
    var topMargin = 15;
    var bottomMargin = 60;
    var leftMargin = 30;
    var rightMargin = 30;
    var iconSize = 18;

    _.forEach(data.tl, function(event) { event.minute = Math.floor(event.seconds / 60); });

    // List of unique event descriptors
    var uniqueEvents = _
      .chain(data.tl)
      .map('event')
      .uniq()
      .value();
    console.log(data);
    // Group events by minute
    var groupedEvents = _
      .chain(data.tl)
      .sort(function(a, b) { return a.seconds - b.seconds; })
      .groupBy(function(event) { return event.minute; })
      .value();

    // Get max amount of events on any given minute
    var maxStacked = _.chain(groupedEvents).map('length').max().value();

    // Get list of minutes
    var minuteLabels = _.keys(groupedEvents);


    var height = 60 + (iconSize + 4) * maxStacked;
    var width = 900;

    var xScale = d3.scale.ordinal()
        .domain(minuteLabels)
        .rangePoints([leftMargin, width - rightMargin]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");

    var svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
      .call(xAxis)
      .attr("class", "axis")
      .attr("transform", "translate(0," + (height - bottomMargin) + ")");

    // Draw timeline
    _.forEach(groupedEvents, function(events, minute) {
      events.forEach(function(event, index) {
        var color = parseInt(event.team, 10) === 1 ? 'red' : 'blue';
        var prefix = "";

        if (event.event === app.events.constants.heroDeath && event.soloDeath === true) {
          prefix = "solo";
        }
        if (event.event === app.events.constants.buildingDestroyed && event.unitName === app.events.constants.core) {
          prefix = "core";
        }

        var filePath = app.events.fileName(prefix, event.event, color);

        var xPosition = xScale(event.minute) - iconSize / 2;
        var yPosition = -1 * (index + 1) * (iconSize + iconSize / 5) +  (height - bottomMargin);

        //var img = svg.append("svg:image")
        //  .attr("xlink:href", filePath)
        //  .attr("class", "eventIcon")
        //  .attr("x", xPosition)
        //  .attr("y", yPosition)
        //  .attr("width", iconSize)
        //  .attr("height", iconSize)
        //  .on("mouseover", mouseover)
        //  .on("mouseout", mouseout);


        //svg
        //  .selectAll("circle")
        //  .data(deaths)
        //  .enter()
        //  .append("circle")
        //  .attr("cx", function(death){ return xScale(death.x); })
        //  .attr("cy", function(death){ return yScale(death.y); })
        //  .attr("r", 3)
        //  .style("fill", function(death){ return death.team === 0 ? "blue" : "red"; })
        //  .style("stroke", "white")
        //  .style("stroke-width", function(death) { return death.soloDeath ? 1.5 : 1; })
        //  .on('mouseover', mouseover)
        //  .on('mouseout', mouseout);

        var img = svg.selectAll("svg")
          .data(events)
          .enter()
          .append("svg:image")
          .attr("xlink:href", filePath)
          .attr("class", "eventIcon")
          .attr("x", xPosition)
          .attr("y", yPosition)
          .attr("width", iconSize)
          .attr("height", iconSize)
          .on("mouseover", mouseover)
          .on("mouseout", mouseout);

        // Position level text's x component
        if (event.event === app.events.constants.levelUp) {
          img.append("svg:title").text(event.level);

          var xTextPosition = xScale(event.minute) - (event.level < 10 ? 2 : 4);
          var yTextPosition = yPosition + 10;

          // Level info
          svg.append("text")
            .attr("x", xTextPosition)
            .attr("y", yTextPosition)
            .attr("font-size", "7px")
            .attr("fill", color)
            .text(event.level);
        }
      });
    });

    uniqueEvents.forEach(function (event, index) {
      var filePath = app.events.fileName("", event);

      var xPosition = leftMargin + index * iconSize * 5.5;

      var textPositionX = xPosition + iconSize * 1.1;

      var legendText = app.events.friendlyNames(event);

      svg
        .append("svg:image")
        .attr("xlink:href", filePath)
        .attr("class", "eventIcon")
        .attr("x", xPosition)
        .attr("y", height - bottomMargin / 2)
        .attr("width", iconSize)
        .attr("height", iconSize);

      svg
        .append("text")
        .attr("x", textPositionX)
        .attr("y", height - iconSize)
        .attr("font-size", "9px")
        .text(legendText);
    });
  };

  app.charts = app.charts || {};
  app.charts.timeline = timeline;

})(window.app || (window.app = {}));
