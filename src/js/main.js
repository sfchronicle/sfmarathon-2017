require("./lib/social");
var d3 = require("d3");//Do not delete'
var calendar = require("calendar-heatmap-mini");

var dataList = ["hilaryData","geneData","iainData","jorgeData","gregData"];
var chartList = ["#hilary-heatmap","#gene-heatmap","#iain-heatmap","#jorge-heatmap","#greg-heatmap"];
console.log(dataList.length);
for (var jdx=0; jdx<dataList.length; jdx++) {
  console.log(idx);
  var data = [];
  var chartID = chartList[jdx];
  var chartData = [];
  var data = eval(dataList[jdx]);
  console.log(data);
  console.log(chartID);
  for (var idx=0; idx < data.length; idx++){
    if (data[idx]["miles"]){
      chartData.push({
        date: new Date(data[idx]["date"]),
        count: data[idx]["miles"]
      });
    }
  }
  var chart = new calendar()
                  .data(chartData)
                  .selector(chartID)
                  .tooltipEnabled(false)
                  .startDate(new Date("05/01/2017"))
                  .endDate(new Date("07/16/2017"))
                  .colorRange(["white","red"])
  chart();
}

//----------------------------------------------------------------------------------
// elevation gain from strava ------------------------------------
//----------------------------------------------------------------------------------

var	parseFullDate = d3.timeParse("%m/%d/%Y");
var	parseTime = d3.timeParse("%H:%M:%S");
var	parsePace = d3.timeParse("%M:%S");

var areaChart = function(targetID,targetData,targetVar,maxval) {

  // create new flat data structure
  var flatData = []; //var flatDataOutflow = [];
  targetData.forEach(function(d,idx){
    var dateObj = parseFullDate(d.date);
    flatData.push(
      {DateString: d.Date, Date: dateObj, Elevation: d[targetVar] }
    );
  });

  // show tooltip
  var tooltip = d3.select("body")
      .append("div")
      .attr("class","tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")

  // create SVG container for chart components
  var margin = {
    top: 15,
    right: 80,
    bottom: 60,
    left: 100
  };
  if (screen.width > 768) {
    var width = 900 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
  } else if (screen.width <= 768 && screen.width > 480) {
    var width = 720 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
  } else if (screen.width <= 480 && screen.width > 340) {
    console.log("big phone");
    var margin = {
      top: 20,
      right: 60,
      bottom: 50,
      left: 30
    };
    var width = 340 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;
  } else if (screen.width <= 340) {
    console.log("mini iphone")
    var margin = {
      top: 20,
      right: 55,
      bottom: 50,
      left: 32
    };
    var width = 310 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;
  }
  console.log(margin);
  var svg = d3.select(targetID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // x-axis scale
  var x = d3.scaleTime().range([0, width]),
      y = d3.scaleLinear().range([height, 0]);

  x.domain([parseFullDate('05/01/2017'),parseFullDate('07/01/2017')]);
  y.domain([0,maxval]);

  // Define the axes
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .ticks(5))
      // .append("text")
      //   .text("Date")

  svg.append("g")
      .call(d3.axisLeft(y)
        .ticks(5))
      .append("text")
        .text("Elevation gain")

  var areaElevation = d3.area()
      // .interpolate("monotone")//linear, linear-closed,step-before, step-after, basis, basis-open,basis-closed,monotone
      .x(function(d) {
        return x(d.Date);
      })
      .y0(height)
      .y1(function(d) {
        if (d.Elevation) {
          return y(d.Elevation);
        } else {
          return y(0);
        }
      });

  // Add the filled area
  svg.append("path")
      .datum(flatData)
      .attr("class", "area")
      .style("fill","#6790B7")
      .attr("d", areaElevation);

  var lineFlow = d3.line()
      // .interpolate("monotone")//linear, linear-closed,step-before, step-after, basis, basis-open,basis-closed,monotone
      .x(function(d) {
        return x(d.Date);
      })
      .y(function(d) {
        if (y(d.Elevation)) {
          return y(d.Elevation);
        } else {
          return y(0);
        }
      });

  svg.append("path")
    .data(flatData)
    .attr("class", "path voronoi")
    .style("stroke", "red")//cscale(d.key))//
    .attr("d", lineFlow(flatData));
}

var areaTimes = function(targetID,targetData,targetVar,targetVar2,maxval) {

  // create new flat data structure
  var flatData = []; //var flatDataOutflow = [];
  targetData.forEach(function(d,idx){
    var dateObj = parseFullDate(d.date);
    flatData.push(
      {DateString: d.Date, Date: dateObj, Var1: d[targetVar], Var2: d[targetVar2] }
    );
  });

  // show tooltip
  var tooltip = d3.select("body")
      .append("div")
      .attr("class","tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")

  // create SVG container for chart components
  var margin = {
    top: 15,
    right: 80,
    bottom: 60,
    left: 100
  };
  if (screen.width > 768) {
    var width = 900 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
  } else if (screen.width <= 768 && screen.width > 480) {
    var width = 720 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
  } else if (screen.width <= 480 && screen.width > 340) {
    console.log("big phone");
    var margin = {
      top: 20,
      right: 60,
      bottom: 50,
      left: 30
    };
    var width = 340 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;
  } else if (screen.width <= 340) {
    console.log("mini iphone")
    var margin = {
      top: 20,
      right: 55,
      bottom: 50,
      left: 32
    };
    var width = 310 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;
  }
  console.log(margin);
  var svg = d3.select(targetID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // x-axis scale
  var x = d3.scaleTime().range([0, width]),
      y = d3.scaleTime().range([height, 0]),
      yRight = d3.scaleTime().range([height,0]);

  x.domain([parseFullDate('05/01/2017'),parseFullDate('07/01/2017')]);
  y.domain([parseTime("0:00:00"),parseTime("50:00:00")]);
  yRight.domain([parsePace("0:00"),parsePace("12:00")]);

  // Define the axes
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .ticks(5))
      // .append("text")
      //   .text("Date")

  svg.append("g")
      .call(d3.axisLeft(y)
        .tickFormat(d3.timeFormat("%d %H"))
        .ticks(5))
      .append("text")
        .text("Elevation gain")

  svg.append("g")
      .attr("transform", "translate(" + width + ",0)")
      .call(d3.axisRight(yRight)
        .tickFormat(d3.timeFormat("%M:%S"))
        .ticks(6))
      .append("text")
        .text("Elevation gain")

  var areaElevation = d3.area()
      // .interpolate("monotone")//linear, linear-closed,step-before, step-after, basis, basis-open,basis-closed,monotone
      .x(function(d) {
        return x(d.Date);
      })
      .y0(height)
      .y1(function(d) {
        return y(parseTime(d.Var1));
      });

  // Add the filled area
  svg.append("path")
      .datum(flatData)
      .attr("class", "area")
      .style("fill","#6790B7")
      .attr("d", areaElevation);

  var lineFlow = d3.line()
      // .interpolate("monotone")//linear, linear-closed,step-before, step-after, basis, basis-open,basis-closed,monotone
      .x(function(d) {
        return x(d.Date);
      })
      .y(function(d) {
        console.log(parsePace(d.Var2));
        return yRight(parsePace(d.Var2));
      });

  svg.append("path")
    .data(flatData)
    .attr("class", "path voronoi")
    .style("stroke", "red")//cscale(d.key))//
    .attr("d", lineFlow(flatData));
}

areaChart("#jorge-elevation",jorgeData,"elevationsum",60000);
areaChart("#jorge-miles",jorgeData,"milessum",500);
areaTimes("#jorge-time",jorgeData,"timesum","pace",1);
areaTimes("#jorge-time2",jorgeData,"miles","pace",1);
areaTimes("#jorge-time3",jorgeData,"timesum","pace",1);
