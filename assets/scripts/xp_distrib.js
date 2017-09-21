(function(app){

  var xpDistribution = function(data) {

    var totalXP = [0,0];
    var xpData = [Array(0), Array(0)];

    var colors = ['AA', 'BB', 'CC', 'DD', 'EE', 'AA', 'BB', 'CC', 'DD', 'EE'];
    for (var i in data) {
      var team = data[i]['team'];
      var heroXP = data[i]['totalXP'];
      var heroName = data[i]['heroName'];
      xpData[team].push([totalXP[team], heroXP + totalXP[team], colors[i], heroName]);
      totalXP[team] += heroXP;
    }

    for (var t in xpData) {

      // Scale for the chart pie, will return the angle
      svg = d3.select("body")
          .append("svg")
          .attr("width", w)
          .attr("height", h);

      chartScale = d3.scale.linear()
          .domain([0, totalXP[t]])
          .range([0, 2 * Math.PI]);


      for (var hero in xpData[t]) {

        //Create SVG element
        if (t == 1) {
          var baseColor = "#7777" + xpData[t][hero][2];
        }
        else {
          var baseColor = "#"+ xpData[t][hero][2] + "0000";
        }



        arc = d3.svg.arc()
            .innerRadius(100)
            .outerRadius(150)
            .startAngle(function () {
              return chartScale(xpData[t][hero][0]);
            })
            .endAngle(function () {
              return chartScale(xpData[t][hero][1]);
            });

        svg.append("path")
            .attr("d", arc)
            .style("fill", baseColor)
            .attr("transform", "translate("+h/2+","+w/2+")")
            .append("svg:title")
            .text(xpData[t][hero][3]);

        svg.append("text")
            .attr("id", "xpText")
            .attr("x", w/2 - (20*"112,312".length/2)-10 )
            .attr("y", h/2 + 10)
            .attr("fill", "black")
            .text("11,123");

      }
    }

  }

  app.charts = app.charts || {};
  app.charts.xpDistribution = xpDistribution;
})(window.app || (window.app = {}));
