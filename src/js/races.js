require("./lib/social");
var d3 = require("d3");//Do not delete'
var calendar = require("calendar-heatmap-mini");

// this is set in the styles
var maxWidth = 1000;

// lists to enable me to generate charts automatically - these are the runners that we're using
var nameList = ["Balint Gal","Gene Dykes","Greg McQuaid","Hilary Dykes","Iain Mickle","Jorge Maravilla","Lauren Elkins"];
var dataList = ["balintData","geneData","gregData","hilaryData","iainData","jorgeData","laurenData"];
var keyList = ["balint","gene","greg","hilary","iain","jorge","lauren"];
var chartHeatList = ["#balint-heatmap","#gene-heatmap","#greg-heatmap","#hilary-heatmap","#iain-heatmap","#jorge-heatmap","#lauren-heatmap"];
var chartElevationList = ["#hilary-elevation"];

// functions to parse dates
var	parseFullDate = d3.timeParse("%Y-%m-%d");
var	parseTime = d3.timeParse("%H:%M:%S");
var	parsePace = d3.timeParse("%M:%S");
var formatthousands = d3.format(",");

var windowWidth = $(window).width();;
console.log("window width = ");
console.log(windowWidth);
var halfWidth = Math.min((windowWidth/2),maxWidth/2);

function color_by_person(personName,runnerID) {
  if (personName == runnerID) {
    return "#CF0000";
    // if (personName == "Balint Gal") {
    //   return "#80A9D0";
    // } else if (personName == "Gene Dykes") {
    //   return "#2274A5";
    // } else if (personName == "Greg McQuaid") {
    //   return "#D13D59";//"#EB8F6A";
    // } else if (personName == "Hilary Dykes") {
    //   return "#81AD54";
    // } else if (personName == "Iain Mickle") {
    //   return "#FFCC32";
    // } else if (personName == "Jorge Maravilla") {
    //   return "purple";
    // } else if (personName == "Lauren Elkins") {
    //   return "#462255";
    // }
  } else if (runnerID == "Hilary Dykes" && personName == "Gene Dykes"){
    return "#CF0000";
  } else {
    return "#8c8c8c";
  }
}

function stroke_by_person(personName,runnerID) {
  // console.log(personName);
  // console.log(runnerID);
  if (personName == runnerID) {
    return 3;
  } else if (runnerID == "Hilary Dykes" && personName == "Gene Dykes"){
    return 3;
  } else {
    return 1;
  }
}

function opacity_by_person(personName,runnerID) {
  // console.log(personName);
  // console.log(runnerID);
  if (personName == runnerID) {
    return 0.9;
  } else if (runnerID == "Hilary Dykes" && personName == "Gene Dykes"){
    return 0,9;
  } else {
    return 0.4;
  }
}

function colorful_dots(personName) {
  if (personName == "Balint Gal") {
    return "#80A9D0";
  } else if (personName == "Gene Dykes") {
    return "#2274A5";
  } else if (personName == "Greg McQuaid") {
    return "#D13D59";//"#EB8F6A";
  } else if (personName == "Hilary Dykes") {
    return "#81AD54";
  } else if (personName == "Iain Mickle") {
    return "#FFCC32";
  } else if (personName == "Jorge Maravilla") {
    return "purple";
  } else if (personName == "Lauren Elkins") {
    return "#462255";
  }
}

// combining all the data into one huge data structure
var combinedData = [];
for (var jdx=0; jdx<dataList.length; jdx++) {
  var data = [];
  data = eval(dataList[jdx]);
  data.forEach(function(d) {
    if (d["Daily Miles"]) {
      d.paceObj = parsePace(d["Daily Pace"]);
      d.name = nameList[jdx];
      combinedData.push(d);
    }
  });
};

var dataNested = d3.nest()
  .key(function(d){ return d.name; })
  .entries(combinedData);

var raceDataNested = d3.nest()
  .key(function(d){ return d.athlete_id; })
  .entries(raceData);

//----------------------------------------------------------------------------------
// function to draw voronoi chart  ------------------------------------
//----------------------------------------------------------------------------------

function hoverChart(targetID,targetVal,maxval,yLabel,units,runnerID) {

  // show tooltip
  var tooltipDots = d3.select("body").append("div")
    .attr("class", "tooltip-lines");

  // create SVG container for chart components
  var margin = {
    top: 15,
    right: 40,
    bottom: 50,
    left: 60
  };
  if (screen.width > 768) {
    // var width = 440 - margin.left - margin.right;
    var height = 450 - margin.top - margin.bottom;
  } else if (screen.width <= 768 && screen.width > 480) {
    // var width = 440 - margin.left - margin.right;
    var height = 450 - margin.top - margin.bottom;
  } else if (screen.width <= 480 && screen.width > 340) {
    console.log("big phone");
    var margin = {
      top: 20,
      right: 60,
      bottom: 50,
      left: 30
    };
    // var width = 340 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;
  } else if (screen.width <= 340) {
    console.log("mini iphone")
    var margin = {
      top: 20,
      right: 55,
      bottom: 50,
      left: 32
    };
    // var width = 310 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;
  }
  // if (windowWidth <= 800) {
    var width = Math.min(windowWidth,maxWidth) - 10 - margin.left - margin.right;
  // } else {
    // var width = halfWidth - 10 - margin.left - margin.right;
  // }

  d3.select(targetID).select("svg").remove();
  var svg = d3.select(targetID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // x-axis scale
  var x = d3.scaleLinear().range([0, width]),
      y = d3.scaleTime().range([height, 0]);

  x.domain([0, 26.2]);
  y.domain([parsePace('00:00'),parsePace("30:00")]);

  // Define the axes
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .ticks(5))
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -10)
        .attr("fill","black")
        .style("text-anchor", "end")
        .text("Mile of the race")

    svg.append("g")
        .call(d3.axisLeft(y)
          .tickFormat(d3.timeFormat("%M:%S"))
          .ticks(5))
        .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", 20)
          .attr("x", 0)
          .attr("fill","black")
          .style("text-anchor", "end")
          .text("Pace per mile")

    var voronoi = d3.voronoi()
        // .curve(d3.curveBasis)
        .x(function(d) {
          return x(d["mileShort"]);
        })
        .y(function(d) {
          return y(parsePace(d["paceShort"]))
        })
        .extent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

    var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) {
          return x(d["mileShort"]);
        })
        .y(function(d) {
          return y(parsePace(d["paceShort"]));
        });

    raceDataNested.forEach(function(d) {

      // var class_list = "line voronoi"
      var class_list = "line voronoi id"+d.key.toLowerCase().replace(/ /g,'')+targetVal.replace(/ /g,'')+runnerID.replace(/ /g,'');
      svg.append("path")
        .attr("class", class_list)
        .style("stroke", color_by_person(d.key,runnerID))//color_by_gender(d.values[0].gender))
        .style("opacity",opacity_by_person(d.key,runnerID))
        .style("stroke-width",stroke_by_person(d.key,runnerID))
        .attr("d", line(d.values));//lineAllStrava(d.values));
    });

    var focus = svg.append("g")
        .attr("transform", "translate(-100,-100)")
        .attr("class", "focus");

    focus.append("circle")
        .attr("r", 3.5);

    focus.append("text")
        .attr("y", -10);

    var voronoiGroup = svg.append("g")
      .attr("class", "voronoi");

    voronoiGroup.selectAll("path")
      .data(voronoi.polygons(d3.merge(raceDataNested.map(function(d) { return d.values; }))))
      .enter().append("path")
        .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

      function mouseover(d) {
        console.log("mouseover");
        d3.select(".id"+d.data.name.toLowerCase().replace(/ /g,'')+targetVal.replace(/ /g,'')+runnerID.replace(/ /g,'')).classed("line-hover", true);
        // if (+d.data["Date"].split("-")[1] < 5){
        //   focus.style("text-anchor","begin")
        // } else {
        //   focus.style("text-anchor","end")
        // }
        // d3.select("#hover-runner-"+targetVal.replace(/ /g,'')+"-"+runnerID.split(" ")[0].toLowerCase()).text(d.data.name);
        // d3.select("#hover-number-"+targetVal.replace(/ /g,'')+"-"+runnerID.split(" ")[0].toLowerCase()).text(d.data[targetVal]+" "+units);
        if (units != "hours") {
          focus.attr("transform", "translate(" + x(parseFullDate(d.data["Date"])) + "," + y(d.data[targetVal]) + ")");
        } else {
          focus.attr("transform", "translate(" + x(parseFullDate(d.data["Date"])) + "," + y(parseTime(d.data[targetVal])) + ")");
        }
      }

      function mouseout(d) {
        d3.select(".id"+d.data.name.toLowerCase().replace(/ /g,'')+targetVal.replace(/ /g,'')+runnerID.replace(/ /g,'')).classed("line-hover", false);
        focus.attr("transform", "translate(-100,-100)");
        d3.select("#hover-runner-"+targetVal.replace(/ /g,'')+"-"+runnerID.split(" ")[0].toLowerCase()).text("");
        d3.select("#hover-number-"+targetVal.replace(/ /g,'')+"-"+runnerID.split(" ")[0].toLowerCase()).text("");
      }

}

//----------------------------------------------------------------------------------
// function to draw bubble chart  ------------------------------------
//----------------------------------------------------------------------------------

function dotChart(targetID,maxval,runnerID){

  // show tooltip
  var tooltipDots = d3.select("body").append("div")
    .attr("class", "tooltip-dots");

  // create SVG container for chart components
  var margin = {
    top: 15,
    right: 80,
    bottom: 60,
    left: 100
  };
  if (screen.width > 768) {
    var width = 900 - margin.left - margin.right;
    var height = 470 - margin.top - margin.bottom;
  } else if (screen.width <= 768 && screen.width > 480) {
    var width = 720 - margin.left - margin.right;
    var height = 470 - margin.top - margin.bottom;
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

  d3.select(targetID).select("svg").remove();
  var svg = d3.select(targetID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // x-axis scale
  var x = d3.scaleLinear().range([0, width]),
      y = d3.scaleTime().range([height, 0])

  x.domain([0,maxval]);
  y.domain([parsePace("4:00"),parsePace("22:00")]);

  // Define the axes
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .ticks(5))
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -10)
        .attr("fill","black")
        .style("text-anchor", "end")
        .text("Miles per day")

  svg.append("g")
      .call(d3.axisLeft(y)
        .tickFormat(d3.timeFormat("%M:%S"))
        .ticks(5))
      .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 20)
        .attr("x", 0)
        .attr("fill","black")
        .style("text-anchor", "end")
        .text("Average pace per mile")

  var line = d3.line()
      .x(function(d) { return x(26.2); })
      .y(function(d) { return y(parsePace(d)); })

  svg.append("path")
        .datum(["4:00","22:00"])
        .attr("fill", "none")
        .attr("class","annotation-path")
        .attr("d", line);

  svg.append("text")
      .text("Marathon distance (26.2 miles)")
      .style("text-anchor","end")
      // .attr("dx",function(d){ return x(26.2); })
      // .attr("dy",function(d){ return y(parsePace("22:00")); })
      .attr("transform","translate("+x(29)+","+y(parsePace("22:00"))+") rotate(-90)")

  svg.selectAll("dot")
        .data(combinedData)
      .enter().append("circle")
        .attr("r", function(d) {
          if (d["Daily Elevation"] ) {
            return (d["Daily Elevation"]/1000+5)
          } else {
            return 5;
          }
        })
        .attr("cx", function(d) { return x(d["Daily Miles"]); })
        .attr("cy", function(d) { return y(d.paceObj); })
        .attr("opacity",function(d) {
          if (runnerID == "all") {
            return 0.8;
          } else if (d.name == runnerID) {
            return 0.8;
          } else {
            return 0.4;
          }
        })
        .attr("fill",function(d) {
          if (runnerID == "all"){
            return colorful_dots(d.name);
          } else if (d.name == runnerID) {
            return "#CF0000";
          } else {
            return "#cccccc";
          }
          // return color_by_person(d.name);
        })
        .style("stroke","#a5a5a5")
        .on("mouseover", function(d) {
            tooltipDots.html(`
                <div><b class='name'>${d.name}</b></div>
                <div><b>${d["Daily Miles"]}</b> miles</div>
                <div><b>${formatthousands(d["Daily Elevation"])}</b> feet of elevation gain</div>
                <div><b>${d["Daily Pace"]}</b> average pace</div>
            `);
            tooltipDots.style("visibility", "visible");
        })
        .on("mousemove", function() {
          if (screen.width <= 480) {
            return tooltipDots
              .style("top",(d3.event.pageY+20)+"px")//(d3.event.pageY+40)+"px")
              .style("left",30+"px");
          } else {
            return tooltipDots
              .style("top", (d3.event.pageY+20)+"px")
              .style("left",(d3.event.pageX-80)+"px");
          }
        })
        .on("mouseout", function(){return tooltipDots.style("visibility", "hidden");});

}

//----------------------------------------------------------------------------------
// functions to draw line charts ------------------------------------
//----------------------------------------------------------------------------------

var areaChart = function(targetID,targetData,targetVar,maxval) {

  // create new flat data structure
  var flatData = []; //var flatDataOutflow = [];
  targetData.forEach(function(d,idx){
    var dateObj = parseFullDate(d["Date"]);
    flatData.push(
      {DateString: d["Date"], Date: dateObj, Elevation: d[targetVar] }
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

  x.domain([parseFullDate('2017-04-01'),parseFullDate('2017-07-01')]);
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
        return x(d["Date"]);
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
        return x(d["Date"]);
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
    var dateObj = parseFullDate(d["Date"]);
    flatData.push(
      {DateString: d["Date"], Date: dateObj, Var1: d[targetVar], Var2: d[targetVar2] }
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

  x.domain([parseFullDate('2017-04-01'),parseFullDate('2017-07-01')]);
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
        return x(d["Date"]);
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
        return x(d["Date"]);
      })
      .y(function(d) {
        // console.log(parsePace(d.Var2));
        return yRight(parsePace(d.Var2));
      });

  svg.append("path")
    .data(flatData)
    .attr("class", "path voronoi")
    .style("stroke", "red")//cscale(d.key))//
    .attr("d", lineFlow(flatData));
}

//----------------------------------------------------------------------------------
// MASTER LOOP
//----------------------------------------------------------------------------------

for (var jdx=0; jdx<dataList.length; jdx++) {
  var data = [];
  var chartID = chartHeatList[jdx];
  var data = eval(dataList[jdx]);

  hoverChart("#"+keyList[jdx]+"-race","Total Miles",900,"Total number of miles run","miles",nameList[jdx]);

  // drawCalendarV2(data,chartID);
  // window.addEventListener("resize", drawCalendarV2(data,chartID));
  //
  // hoverChart("#hover-chart-elevation-"+keyList[jdx],"Total Elevation",60000,"Elevation gain total (ft)","ft",nameList[jdx]);
  //
  // hoverChart("#hover-chart-miles-"+keyList[jdx],"Total Miles",900,"Total number of miles run","miles",nameList[jdx]);
  // window.addEventListener("resize",hoverChart("#hover-chart-miles-"+keyList[jdx],"Total Miles",900,"Total number of miles run","miles",nameList[jdx]));
  //
  // var timeVar = data[data.length-1]["Total Time"];
  // if (timeVar){
  //   timeVar = timeVar.split(":")[0];
  //   document.getElementById("total-time-text-"+keyList[jdx]).innerHTML = timeVar;
  //   document.getElementById("work-weeks-"+keyList[jdx]).innerHTML = Math.round(timeVar/520*100)+"%";
  // }
}


$(window).resize(function () {
  windowWidth = $(window).width();
  halfWidth = Math.min((windowWidth/2),450);
  // for (var jdx=0; jdx<dataList.length; jdx++) {
  //   var data = [];
  //   var chartID = chartHeatList[jdx];
  //   var data = eval(dataList[jdx]);
  //
  //   drawCalendarV2(data,chartID);
  //   window.addEventListener("resize", drawCalendarV2(data,chartID));
  //
  //   hoverChart("#hover-chart-elevation-"+keyList[jdx],"Total Elevation",60000,"Elevation gain total (ft)","ft",nameList[jdx]);
  //
  //   hoverChart("#hover-chart-miles-"+keyList[jdx],"Total Miles",900,"Total number of miles run","miles",nameList[jdx]);
  //   window.addEventListener("resize",hoverChart("#hover-chart-miles-"+keyList[jdx],"Total Miles",900,"Total number of miles run","miles",nameList[jdx]));
  //
  //   var timeVar = data[data.length-1]["Total Time"];
  //   if (timeVar){
  //     timeVar = timeVar.split(":")[0];
  //     document.getElementById("total-time-text-"+keyList[jdx]).innerHTML = timeVar;
  //   }
  // }
});

dotChart("#dot-chart-races",75,"all");
window.addEventListener("resize", dotChart("#dot-chart",75,"all"));


// hoverChart("#hover-chart-elevation","Total Elevation",60000,"Elevation gain total (ft)","ft");
// hoverChart("#hover-chart-elevation","Daily Elevation",15000,"Elevation gain total (ft)","ft");
// hoverChart("#hover-chart-miles","Total Miles",900,"Total number of miles run","miles");
// dotChart("#dot-chart",80,"Gene Dykes");
// hoverChart("#hover-chart-hours","Daily Time","30:00:00","Total number of hours run","hours");
// areaChart("#jorge-elevation",jorgeData,"Total Elevation",60000);
// areaChart("#jorge-miles",jorgeData,"milessum",500);
// areaTimes("#jorge-time",jorgeData,"timesum","pace",1);
// areaTimes("#jorge-time2",jorgeData,"miles","pace",1);
// areaTimes("#jorge-time3",jorgeData,"timesum","pace",1);
