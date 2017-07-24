require("./lib/social");
var d3 = require("d3");//Do not delete'

// this is set in the styles
var maxWidthDots = 1000;
var maxWidthRaces = 800;

// lists to enable me to generate charts automatically - these are the runners that we're using
var nameList = ["Jorge Maravilla","Balint Gal","Gene Dykes","Greg McQuaid","Hilary Shirazi","Iain Mickle","Lauren Elkins"];
var dataList = ["jorgeData","balintData","geneData","gregData","hilaryData","iainData","laurenData"];
var keyList = ["jorge","balint","gene","greg","hilary","iain","lauren"];
var chartHeatList = ["#jorge-heatmap","#balint-heatmap","#gene-heatmap","#greg-heatmap","#hilary-heatmap","#iain-heatmap","#lauren-heatmap"];
var shortkeyList = ["iain","lauren","hilary","jorge","balint","greg"];

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
      return "#E6B319";//#FFCC32";
    } else if (personName == "Gene Dykes") {
      return "#2274A5";
    } else if (personName == "Greg McQuaid") {
      return "#F25C00";//"#EB8F6A";
    } else if (personName == "Hilary Shirazi") {
      return "#45C16F";
    } else if (personName == "Iain Mickle") {
      return "#26532B";
    } else if (personName == "Jorge Maravilla") {
      return "#551E59";
    } else if (personName == "Lauren Elkins") {
      return "#C94EB2";
    }
  } else if (runnerID == "Hilary Shirazi" && personName == "Gene Dykes"){
    return "#2274A5";
  } else {
    return "#8C8C8C";
  }
}

function stroke_by_person(personName,runnerID) {
  // console.log(personName);
  // console.log(runnerID);
  if (personName == runnerID) {
    return 4;
  } else if (runnerID == "Hilary Shirazi" && personName == "Gene Dykes"){
    return 4;
  } else {
    return 1;
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
    return 0.9;
  }
}

function colorful_dots(personName) {
  if (personName == "Balint Gal") {
    return "#E6B319";
  } else if (personName == "Gene Dykes") {
    return "#2274A5";
  } else if (personName == "Greg McQuaid") {
    return "#F25C00";//"#EB8F6A";
  } else if (personName == "Hilary Shirazi") {
    return "#45C16F";
  } else if (personName == "Iain Mickle") {
    return "#26532B";
  } else if (personName == "Jorge Maravilla") {
    return "#551E59";//"#6D106A";
  } else if (personName == "Lauren Elkins") {
    return "#C94EB2";
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
    var height = 500 - margin.top - margin.bottom;
  } else if (screen.width <= 768 && screen.width > 480) {
    // var width = 440 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;
  } else if (screen.width <= 480 && screen.width > 340) {
    console.log("big phone");
    var margin = {
      top: 20,
      right: 60,
      bottom: 50,
      left: 50
    };
    // var width = 340 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;
  } else if (screen.width <= 340) {
    console.log("mini iphone")
    var margin = {
      top: 20,
      right: 55,
      bottom: 50,
      left: 50
    };
    // var width = 310 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;
  }
  var width = Math.min(windowWidth,maxWidthRaces) - 10 - margin.left - margin.right;

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
  yRight.domain([-9,1000])

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
          return x(d["mile"]);
        })
        .y(function(d) {
          return y(parsePace(d["pace"]))
        })
        .extent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

    var line = d3.line()
        .curve(d3.curveCardinal)
        .x(function(d) {
          return x(d["mile"]);
        })
        .y(function(d) {
          return y(parsePace(d["pace"]));
        });

    var elevationLine = d3.line()
        .curve(d3.curveCardinal)
        .x(function(d) {
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
        d3.select(".id"+d.data.athlete_id.toLowerCase().replace(/ /g,'')+runnerID.toLowerCase().replace(/ /g,'')).classed("line-hover-races", true);
        d3.select("#hover-race-name-"+runnerID.split(" ")[0].toLowerCase()).text(d.data.athlete_id);
        d3.select("#hover-race-pace-"+runnerID.split(" ")[0].toLowerCase()).text("Mile "+d.data.mile+" pace: "+d.data.pace);
        focus.attr("transform", "translate(" + x(d.data["mile"]) + "," + y(parsePace(d.data["pace"])) + ")");
      }

      function mouseout(d) {
        d3.select(".id"+d.data.athlete_id.toLowerCase().replace(/ /g,'')+runnerID.toLowerCase().replace(/ /g,'')).classed("line-hover-races", false);
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
    var height = 470 - margin.top - margin.bottom;
  } else if (screen.width <= 768 && screen.width > 480) {
    var height = 470 - margin.top - margin.bottom;
  } else if (screen.width <= 480 && screen.width > 340) {
    var margin = {
      top: 20,
      right: 30,
      bottom: 40,
      left: 55
    };
    // var width = 340 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;
  } else if (screen.width <= 340) {
    var margin = {
      top: 20,
      right: 30,
      bottom: 40,
      left: 55
    };
    // var width = 310 - margin.left - margin.right;
    var height = 370 - margin.top - margin.bottom;
  }
  var width = Math.min(windowWidth,maxWidthDots) - 10 - margin.left - margin.right;

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
        .attr("y", function(d) {
          if (screen.width <= 480) {
            return 30;
          } else {
            return 20;
          }
        })
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

  if (screen.width <= 480) {
    svg.append("text")
      .text("Marathon distance (26.2 miles)")
      .style("text-anchor","end")
      // .attr("dx",function(d){ return x(26.2); })
      // .attr("dy",function(d){ return y(parsePace("22:00")); })
      .attr("transform","translate("+x(32)+","+y(parsePace("22:00"))+") rotate(-90)")
  } else {
    svg.append("text")
      .text("Marathon distance (26.2 miles)")
      .style("text-anchor","end")
      // .attr("dx",function(d){ return x(26.2); })
      // .attr("dy",function(d){ return y(parsePace("22:00")); })
      .attr("transform","translate("+x(29)+","+y(parsePace("22:00"))+") rotate(-90)")
  }

  svg.selectAll("dot")
        .data(combinedData)
      .enter().append("circle")
        .attr("r", function(d) {
          if (d["Daily Elevation"] ) {
            if (screen.width <= 480) {
              return (d["Daily Elevation"]/1000+6)
            } else {
              return (d["Daily Elevation"]/500+6)
            }
          } else {
            return 5;
          }
        })
        .attr("cx", function(d) { return x(d["Daily Miles"]); })
        .attr("cy", function(d) { return y(d.paceObj); })
        .attr("opacity",function(d) {
          // all data displayed
          if (runnerID == "all") {
            if (d.Date == "2017-07-23"){ // <------------------------------------------------------- CHANGE THIS ON MONDAY!
              return 1.0;
            } else {
              return 0.3;
            }
          // data just for one runner is displayed and this is the one
          } else if (d.name.split(" ")[0].toLowerCase() == runnerID) {
            if (d.Date == "2017-07-23"){ // <------------------------------------------------------- CHANGE THIS ON MONDAY!
              return 1.0;
            } else {
              return 0.3;
            }
          // just one runner is displayed and this is not the one
          } else {
            // if (d.Date == "2017-07-01"){ // <------------------------------------------------------- CHANGE THIS ON MONDAY!
              // return 0.5;
            // } else {
              return 0.2;
            // }
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
if (screen.width <= 480) {
  dotChart("#dot-chart-races",75,"iain");
  var buttons = document.getElementsByClassName("button");
  buttons[0].classList.remove("active");
  buttons[1].classList.add("active");
} else {
  dotChart("#dot-chart-races",75,"all");
}

//----------------------------------------------------------------------------------
// RE-DRAW ALL THE CHARTS ON RESIZE
//----------------------------------------------------------------------------------

$(window).resize(function () {
  windowWidth = $(window).width();

  var buttons = document.getElementsByClassName("button");
  for (var idx=1; idx<buttons.length; idx++){
    buttons[idx].classList.remove("active");
  }
  if (screen.width <= 480) {
    dotChart("#dot-chart-races",75,"iain");
    var buttons = document.getElementsByClassName("button");
    buttons[0].classList.remove("active");
    buttons[1].classList.add("active");
  } else {
    dotChart("#dot-chart-races",75,"all");
    buttons[0].classList.add("active");
  }

  for (var jdx=0; jdx<dataList.length; jdx++) {
    var data = [];
    var chartID = chartHeatList[jdx];
    var data = eval(dataList[jdx]);

    hoverChart("#"+keyList[jdx]+"-race",900,"Total number of miles run","miles",nameList[jdx]);
  }

  // re-compute where sections begin and end
  var window_top = document.body.scrollTop-30;
  a = document.getElementById('profileiain').getBoundingClientRect().top + window_top;
  b = document.getElementById('profilelauren').getBoundingClientRect().top + window_top;
  c = document.getElementById('profilehilary').getBoundingClientRect().top + window_top;
  d = document.getElementById('profilejorge').getBoundingClientRect().top + window_top;
  e = document.getElementById('profilebalint').getBoundingClientRect().top + window_top;
  f = document.getElementById('profilegreg').getBoundingClientRect().top + window_top;
  scroll = [a,b,c,d,e,f];
  concdiv= document.getElementById('conclusion').getBoundingClientRect().top + window_top;

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

    var buttonRunnerID = group.id.split("-button")[0];
    if (buttonRunnerID != "all"){
      combinedData = [];
      for (var jdx=0; jdx<dataList.length; jdx++) {
        var data = [];
        if (keyList[jdx] != buttonRunnerID){
          data = eval(dataList[jdx]);
          data.forEach(function(d) {
            if (d["Daily Miles"]) {
              d.paceObj = parsePace(d["Daily Pace"]);
              d.name = nameList[jdx];
              combinedData.push(d);
            }
          });
        } else {
          var keyIDX = jdx;
        }
      }
      data = eval(buttonRunnerID+"Data");
      data.forEach(function(d) {
        if (d["Daily Miles"]) {
          d.paceObj = parsePace(d["Daily Pace"]);
          d.name = nameList[keyIDX];
          combinedData.push(d);
        }
      });
    }
    dotChart("#dot-chart-races",75,buttonRunnerID);
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
var profile_idx = -1;
var a,b,c,d,e,f,concdiv;
window.onload = function () {
  var window_top = document.body.scrollTop-30;
  a = document.getElementById('profileiain').getBoundingClientRect().top + window_top;
  b = document.getElementById('profilelauren').getBoundingClientRect().top + window_top;
  c = document.getElementById('profilehilary').getBoundingClientRect().top + window_top;
  d = document.getElementById('profilejorge').getBoundingClientRect().top + window_top;
  e = document.getElementById('profilebalint').getBoundingClientRect().top + window_top;
  f = document.getElementById('profilegreg').getBoundingClientRect().top + window_top;
  scroll = [a,b,c,d,e,f];
  concdiv= document.getElementById('conclusion').getBoundingClientRect().top + window_top;
}

var y;
var navDisplay = function() {
  // var y = window.scrollY;
  y = $(window).scrollTop();
  if (y >= navposition) {
    navID.className = "fixed show";
  } else {
    navID.className = "fixed hide";
  }
  if (y > concdiv || y < a) {
    for (var i=0; i<6; i++) {
      document.getElementById("prof-link-"+shortkeyList[i]).classList.remove('activelink');
    }
  } else {
    for (var i = 0; i < 6; i++) {
      if (y > scroll[i]) {
        profile_idx = i;
      }
    }
    if (shortkeyList[profile_idx]){
      for (var i=0; i<6; i++) {
        document.getElementById("prof-link-"+shortkeyList[i]).classList.remove('activelink');
      }
      document.getElementById("prof-link-"+shortkeyList[profile_idx]).classList.add('activelink');
    }
  }
};
window.addEventListener("scroll", navDisplay);
