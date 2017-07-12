require("./lib/social");
var d3 = require("d3");//Do not delete'
var calendar = require("calendar-heatmap-mini");

// this is set in the styles
var maxWidthDots = 1000;
var maxWidthRaces = 800;

// lists to enable me to generate charts automatically - these are the runners that we're using
var nameList = ["Balint Gal","Gene Dykes","Greg McQuaid","Hilary Shirazi","Iain Mickle","Jorge Maravilla","Lauren Elkins"];
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
// var halfWidth = Math.min((windowWidth/2),maxWidth/2);

function color_by_person(personName,runnerID) {
  if (personName == runnerID) {
    // return "#CF0000";
    if (personName == "Balint Gal") {
      return "#FFCC32";
    } else if (personName == "Gene Dykes") {
      return "#2274A5";
    } else if (personName == "Greg McQuaid") {
      return "#F25C00";//"#EB8F6A";
    } else if (personName == "Hilary Shirazi") {
      return "#45C16F";
    } else if (personName == "Iain Mickle") {
      return "#26532B";
    } else if (personName == "Jorge Maravilla") {
      return "purple";
    } else if (personName == "Lauren Elkins") {
      return "#AA4297";
    }
  } else if (runnerID == "Hilary Shirazi" && personName == "Gene Dykes"){
    return "#2274A5";
  } else {
    return "#cccccc";
  }
}

function stroke_by_person(personName,runnerID) {
  // console.log(personName);
  // console.log(runnerID);
  if (personName == runnerID) {
    return 3;
  } else if (runnerID == "Hilary Shirazi" && personName == "Gene Dykes"){
    return 3;
  } else {
    return 2;
  }
}

function opacity_by_person(personName,runnerID) {
  // console.log(personName);
  // console.log(runnerID);
  if (personName == runnerID) {
    return 0.9;
  } else if (runnerID == "Hilary Shirazi" && personName == "Gene Dykes"){
    return 0,9;
  } else {
    return 0.5;
  }
}

function colorful_dots(personName) {
  if (personName == "Balint Gal") {
    return "#FFCC32";
  } else if (personName == "Gene Dykes") {
    return "#2274A5";
  } else if (personName == "Greg McQuaid") {
    return "#F25C00";//"#EB8F6A";
  } else if (personName == "Hilary Shirazi") {
    return "#45C16F";
  } else if (personName == "Iain Mickle") {
    return "#26532B";
  } else if (personName == "Jorge Maravilla") {
    return "purple";
  } else if (personName == "Lauren Elkins") {
    return "#AA4297";
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

function hoverChart(targetID,maxval,yLabel,units,runnerID) {

  // show tooltip
  var tooltipDots = d3.select("body").append("div")
    .attr("class", "tooltip-lines");

  // create SVG container for chart components
  var margin = {
    top: 15,
    right: 60,
    bottom: 40,
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
    var width = Math.min(windowWidth,maxWidthRaces) - 10 - margin.left - margin.right;
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
      y = d3.scaleTime().range([height, 0]),
      yRight = d3.scaleLinear().range([height,0]);

  x.domain([0, 26.2]);
  y.domain([parsePace('00:00'),parsePace("20:00")]);
  yRight.domain([-7,1000])

  // Define the axes
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .ticks(5))
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", 40)
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
          .text("Pace (minutes per mile)")

    svg.append("g")
        .attr("transform", "translate( " + width + ", 0 )")
        .call(d3.axisRight(yRight)
          // .tickFormat(d3.timeFormat("%M:%S"))
          .ticks(5))
        .append("text")
          .attr("class", "label")
          .attr("transform", "rotate(-90)")
          .attr("y", -15)
          .attr("x", 0)
          .attr("fill","black")
          .style("text-anchor", "end")
          .text("Elevation profile (ft)")

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
        .curve(d3.curveCardinal)
        .x(function(d) {
          return x(d["mileShort"]);
        })
        .y(function(d) {
          return y(parsePace(d["paceShort"]));
        });

    var elevationLine = d3.line()
        .curve(d3.curveCardinal)
        .x(function(d) {
          console.log(d);
          return x(d["distance"]);
        })
        .y(function(d) {
          return yRight(d["elevation"]);
        });

    svg.append("path")
        .attr("class","elevationprofile")
        .attr("d",elevationLine(elevationData))

    raceDataNested.forEach(function(d) {

      // var class_list = "line voronoi"
      var class_list = "line voronoi id"+d.key.toLowerCase().replace(/ /g,'')+runnerID.toLowerCase().replace(/ /g,'');
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
        d3.select(".id"+d.data.athlete_id.toLowerCase().replace(/ /g,'')+runnerID.toLowerCase().replace(/ /g,'')).classed("line-hover", true);
        d3.select("#hover-race-name-"+runnerID.split(" ")[0].toLowerCase()).text(d.data.athlete_id);
        d3.select("#hover-race-pace-"+runnerID.split(" ")[0].toLowerCase()).text("Mile "+d.data.mileShort+" pace: "+d.data.paceShort);
        focus.attr("transform", "translate(" + x(d.data["mileShort"]) + "," + y(parsePace(d.data["paceShort"])) + ")");
      }

      function mouseout(d) {
        d3.select(".id"+d.data.athlete_id.toLowerCase().replace(/ /g,'')+runnerID.toLowerCase().replace(/ /g,'')).classed("line-hover", false);
        focus.attr("transform", "translate(-100,-100)");
        d3.select("#hover-race-name-"+runnerID.split(" ")[0].toLowerCase()).text("");
        d3.select("#hover-race-pace-"+runnerID.split(" ")[0].toLowerCase()).text("");
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
    bottom: 20,
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
            return (d["Daily Elevation"]/500+5)
          } else {
            return 5;
          }
        })
        .attr("cx", function(d) { return x(d["Daily Miles"]); })
        .attr("cy", function(d) { return y(d.paceObj); })
        .attr("opacity",function(d) {
          if (runnerID == "all") {
            return 0.7;
          } else if (d.name.split(" ")[0].toLowerCase() == runnerID) {
            return 1.0;
          } else {
            return 0.1;
          }
        })
        .attr("fill",function(d) {
          if (runnerID == "all"){
            return colorful_dots(d.name);
          } else if (d.name.split(" ")[0].toLowerCase() == runnerID) {
            return colorful_dots(d.name);
          } else {
            return "#cccccc";
          }
          // return color_by_person(d.name);
        })
        .style("stroke","#cccccc")
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
// DRAW ALL THE CHARTS
//----------------------------------------------------------------------------------

for (var jdx=0; jdx<dataList.length; jdx++) {
  var data = [];
  var chartID = chartHeatList[jdx];
  var data = eval(dataList[jdx]);

  hoverChart("#"+keyList[jdx]+"-race",900,"Total number of miles run","miles",nameList[jdx]);
}
dotChart("#dot-chart-races",75,"all");

//----------------------------------------------------------------------------------
// RE-DRAW ALL THE CHARTS ON RESIZE
//----------------------------------------------------------------------------------

$(window).resize(function () {
  windowWidth = $(window).width();
  // halfWidth = Math.min((windowWidth/2),450);

  var buttons = document.getElementsByClassName("button");
  for (var idx=1; idx<buttons.length; idx++){
    buttons[idx].classList.remove("active");
  }
  buttons[0].classList.add("active");
  dotChart("#dot-chart-races",75,"all");

  for (var jdx=0; jdx<dataList.length; jdx++) {
    var data = [];
    var chartID = chartHeatList[jdx];
    var data = eval(dataList[jdx]);

    hoverChart("#"+keyList[jdx]+"-race",900,"Total number of miles run","miles",nameList[jdx]);
  }
});

//----------------------------------------------------------------------------------
// REDRAW DOT CHART ON BUTTON CLICKS
//----------------------------------------------------------------------------------

var qsa = s => Array.prototype.slice.call(document.querySelectorAll(s));
qsa(".button").forEach(function(group,index) {
  group.addEventListener("click", function(e) {
    var buttons = document.getElementsByClassName("button");
    for (var idx=0; idx<buttons.length; idx++){
      buttons[idx].classList.remove("active");
    }
    group.classList.add("active");
    dotChart("#dot-chart-races",75,group.id.split("-button")[0]);
    // console.log(e);
  });
});

//----------------------------------------------------------------------------------
// SMOOTH SCROLLING
//----------------------------------------------------------------------------------

$(document).on('click', 'a[href^="#"]', function(e) {

    // target element id
    var id = $(this).attr('href');

    // target element
    var $id = $(id);
    if ($id.length === 0) {
        return;
    }

    // prevent standard hash navigation (avoid blinking in IE)
    e.preventDefault();

    // top position relative to the document
    var pos = $(id).offset().top;

    // animated top scrolling
    $('body, html').animate({scrollTop: pos});
});

var navID = document.getElementById("nav");
var navposition = 400;//document.getElementById("link-nav").offsetTop+40;
var navDisplay = function() {
  var y = window.scrollY;
  if (y >= navposition) {
    navID.className = "fixed show";
  } else {
    navID.className = "fixed hide";
  }
};
window.addEventListener("scroll", navDisplay);
