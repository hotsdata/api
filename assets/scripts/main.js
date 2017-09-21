
var xpBreakdown = [{'level': 1, 'seconds': 60, 'CreepXP': 0, 'StructureXP': 0, 'MinionXP': 1176, 'team': 0, 'TrickleXP': 500, 'HeroXP': 0}, {'level': 2, 'seconds': 120, 'CreepXP': 0, 'StructureXP': 0, 'MinionXP': 1911, 'team': 0, 'TrickleXP': 1700, 'HeroXP': 0}, {'level': 4, 'seconds': 180, 'CreepXP': 102, 'StructureXP': 0, 'MinionXP': 3098, 'team': 0, 'TrickleXP': 2900, 'HeroXP': 1364}, {'level': 5, 'seconds': 240, 'CreepXP': 206, 'StructureXP': 0, 'MinionXP': 4587, 'team': 0, 'TrickleXP': 4100, 'HeroXP': 1364}, {'level': 6, 'seconds': 300, 'CreepXP': 449, 'StructureXP': 0, 'MinionXP': 5851, 'team': 0, 'TrickleXP': 5300, 'HeroXP': 1364}, {'level': 7, 'seconds': 360, 'CreepXP': 449, 'StructureXP': 0, 'MinionXP': 7701, 'team': 0, 'TrickleXP': 6500, 'HeroXP': 2114}, {'level': 9, 'seconds': 420, 'CreepXP': 449, 'StructureXP': 2000, 'MinionXP': 9454, 'team': 0, 'TrickleXP': 7700, 'HeroXP': 2114}, {'level': 10, 'seconds': 480, 'CreepXP': 559, 'StructureXP': 2000, 'MinionXP': 11670, 'team': 0, 'TrickleXP': 8900, 'HeroXP': 2114}, {'level': 11, 'seconds': 540, 'CreepXP': 559, 'StructureXP': 2000, 'MinionXP': 12816, 'team': 0, 'TrickleXP': 10100, 'HeroXP': 3131}, {'level': 11, 'seconds': 600, 'CreepXP': 972, 'StructureXP': 2000, 'MinionXP': 13909, 'team': 0, 'TrickleXP': 11300, 'HeroXP': 3131}, {'level': 13, 'seconds': 660, 'CreepXP': 1038, 'StructureXP': 2000, 'MinionXP': 16485, 'team': 0, 'TrickleXP': 12500, 'HeroXP': 4384}, {'level': 13, 'seconds': 720, 'CreepXP': 1038, 'StructureXP': 2000, 'MinionXP': 17945, 'team': 0, 'TrickleXP': 13700, 'HeroXP': 4384}, {'level': 15, 'seconds': 780, 'CreepXP': 1160, 'StructureXP': 2000, 'MinionXP': 20185, 'team': 0, 'TrickleXP': 14900, 'HeroXP': 10130}, {'level': 17, 'seconds': 840, 'CreepXP': 1348, 'StructureXP': 4000, 'MinionXP': 23306, 'team': 0, 'TrickleXP': 16100, 'HeroXP': 12464}, {'level': 18, 'seconds': 900, 'CreepXP': 1607, 'StructureXP': 5850, 'MinionXP': 24502, 'team': 0, 'TrickleXP': 17300, 'HeroXP': 12464}, {'level': 19, 'seconds': 960, 'CreepXP': 1607, 'StructureXP': 5850, 'MinionXP': 26590, 'team': 0, 'TrickleXP': 18500, 'HeroXP': 14829}, {'level': 20, 'seconds': 1020, 'CreepXP': 1737, 'StructureXP': 5850, 'MinionXP': 27305, 'team': 0, 'TrickleXP': 19700, 'HeroXP': 17212}, {'level': 20, 'seconds': 1080, 'CreepXP': 2073, 'StructureXP': 5850, 'MinionXP': 27933, 'team': 0, 'TrickleXP': 20900, 'HeroXP': 19688}, {'level': 21, 'seconds': 1140, 'CreepXP': 2199, 'StructureXP': 8600, 'MinionXP': 30724, 'team': 0, 'TrickleXP': 22100, 'HeroXP': 22065}, {'level': 21, 'seconds': 1200, 'CreepXP': 2451, 'StructureXP': 8600, 'MinionXP': 34125, 'team': 0, 'TrickleXP': 23300, 'HeroXP': 22065}, {'level': 22, 'seconds': 1260, 'CreepXP': 2451, 'StructureXP': 8600, 'MinionXP': 36879, 'team': 0, 'TrickleXP': 24500, 'HeroXP': 22065}];
for (var e in xpBreakdown) {
    console.log(xpBreakdown[e].level);
}



var data = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
        {
            label: "My First dataset",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: [65, 59, 80, 81, 56, 55, 40]
        },
        {
            label: "My Second dataset",
            fillColor: "rgba(151,187,205,0.2)",
            strokeColor: "rgba(151,187,205,1)",
            pointColor: "rgba(151,187,205,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: [28, 48, 40, 19, 86, 27, 90]
        }
    ]
};

var options = {

    ///Boolean - Whether grid lines are shown across the chart
    scaleShowGridLines : true,

    //String - Colour of the grid lines
    scaleGridLineColor : "rgba(0,0,0,.05)",

    //Number - Width of the grid lines
    scaleGridLineWidth : 1,

    //Boolean - Whether to show horizontal lines (except X axis)
    scaleShowHorizontalLines: true,

    //Boolean - Whether to show vertical lines (except Y axis)
    scaleShowVerticalLines: true,

    //Boolean - Whether the line is curved between points
    bezierCurve : true,

    //Number - Tension of the bezier curve between points
    bezierCurveTension : 0.4,

    //Boolean - Whether to show a dot for each point
    pointDot : true,

    //Number - Radius of each point dot in pixels
    pointDotRadius : 4,

    //Number - Pixel width of point dot stroke
    pointDotStrokeWidth : 1,

    //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
    pointHitDetectionRadius : 20,

    //Boolean - Whether to show a stroke for datasets
    datasetStroke : true,

    //Number - Pixel width of dataset stroke
    datasetStrokeWidth : 2,

    //Boolean - Whether to fill the dataset with a colour
    datasetFill : true,
    responsive:true,
    maintainAspectRatio: false,

    //String - A legend template
    legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

};

$( document ).ready(function() {
  var ctx = $("#myChart").get(0).getContext("2d");
  var myLineChart = new Chart(ctx).Line(data, options);


//   var width = $('canvas').parent().width();
//   $('canvas').attr("width",width);
//   new Chart(ctx).Line(data,options);
// window.onresize = function(event){
//     var width = $('canvas').parent().width();
//     $('canvas').attr("width",width);
//     new Chart(ctx).Line(data,options);
// };
});
