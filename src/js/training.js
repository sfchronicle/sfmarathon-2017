require("./lib/social");
var d3 = require("d3");//Do not delete'
var calendar = require("calendar-heatmap-mini");

// this is set in the styles
var maxWidth = 1000;

// lists to enable me to generate charts automatically - these are the runners that we're using
var nameList = ["Balint Gal","Gene Dykes","Greg McQuaid","Hilary Shirazi","Iain Mickle","Jorge Maravilla","Lauren Elkins"];
var dataList = ["balintData","geneData","gregData","hilaryData","iainData","jorgeData","laurenData"];
var keyList = ["balint","gene","greg","hilary","iain","jorge","lauren"];
var chartHeatList = ["#balint-heatmap","#gene-heatmap","#greg-heatmap","#hilary-heatmap","#iain-heatmap","#jorge-heatmap","#lauren-heatmap"];
var chartElevationList = ["#hilary-elevation"];
var shortkeyList = ["iain","lauren","hilary","jorge","balint","greg"];

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
      return "purple";
    } else if (personName == "Lauren Elkins") {
      return "#AA4297";
    }
  } else if (runnerID == "Hilary Shirazi" && personName == "Gene Dykes"){
    return "#2274A5";
  } else {
    return "#8C8C8C";
  }
}

function stroke_by_person(personName,runnerID) {
  if (personName == runnerID) {
    return 3;
  } else if (runnerID == "Hilary Shirazi" && personName == "Gene Dykes"){
    return 3;
  } else {
    return 1;
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

//----------------------------------------------------------------------------------
// function to draw voronoi chart  ------------------------------------
//----------------------------------------------------------------------------------

function hoverChart(targetID,targetVal,maxval,yLabel,units,runnerID) {

  // show tooltip
  var tooltipDots = d3.select("body").append("div")
    .attr("class", "tooltip-dots");

  // create SVG container for chart components
  var margin = {
    top: 15,
    right: 40,
    bottom: 50,
    left: 50
  };
  if (screen.width > 768) {
    // var width = 440 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;
  } else if (screen.width <= 768 && screen.width > 480) {
    // var width = 440 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;
  } else if (screen.width <= 480 && screen.width > 340) {
    console.log("big phone");
    var margin = {
      top: 20,
      right: 40,
      bottom: 50,
      left: 40
    };
    // var width = 340 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;
  } else if (screen.width <= 340) {
    console.log("mini iphone")
    var margin = {
      top: 20,
      right: 40,
      bottom: 50,
      left: 40
    };
    // var width = 310 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;
  }
  if (windowWidth <= 800) {
    var width = Math.min(windowWidth,maxWidth) - 10 - margin.left - margin.right;
  } else {
    var width = halfWidth - 10 - margin.left - margin.right;
  }

  d3.select(targetID).select("svg").remove();
  var svg = d3.select(targetID).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  if (units != "hours") {

    // x-axis scale
    var x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]);

    x.domain([parseFullDate('2017-04-01'),parseFullDate('2017-07-16')]);
    y.domain([0,maxval]);

  } else {

    // x-axis scale
    var x = d3.scaleTime().range([0, width]),
        y = d3.scaleTime().range([height, 0]);

    x.domain([parseFullDate('2017-04-01'),parseFullDate('2017-07-16')]);
    y.domain([parseTime('00:00:00'),parseTime(String(maxval))]);

  }

  // Define the axes
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .ticks(5))
      .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", 35)
        .style("text-anchor", "end")
        .text("AXIS")

    if (units == "ft") {
      svg.append("g")
          .call(d3.axisLeft(y)
            .tickFormat(d3.format(".1s"))
            .ticks(5))
          .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("x", 0)
            .attr("fill","black")
            .style("text-anchor", "end")
            .text(yLabel)

    } else {
      svg.append("g")
          .call(d3.axisLeft(y)
            // .tickFormat(d3.timeFormat("%M:%S"))
            .ticks(5))
          .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 20)
            .attr("x", 0)
            .attr("fill","black")
            .style("text-anchor", "end")
            .text(yLabel)
    }

    var voronoi = d3.voronoi()
        // .interpolate("step-after")
        .x(function(d) { return x(parseFullDate(d["Date"])); })
        .y(function(d) {
          if (units != "hours"){
            return y(d[targetVal]);
          } else {
            return y(parseTime(d[targetVal]));
          }
        })
        .extent([[-margin.left, -margin.top], [width + margin.right, height + margin.bottom]]);

    var line = d3.line()
        .curve(d3.curveStepAfter)
        .x(function(d) { return x(parseFullDate(d["Date"])); })
        .y(function(d) {
          if (units != "hours"){
            return y(d[targetVal]);
          } else {
            return y(parseTime(d[targetVal]));
          }
        });

    dataNested.forEach(function(d) {
      var class_list = "line voronoi id"+d.key.toLowerCase().replace(/ /g,'')+targetVal.replace(/ /g,'')+runnerID.replace(/ /g,'');
      svg.append("path")
        .attr("class", class_list)
        .style("stroke", color_by_person(d.key,runnerID))//color_by_gender(d.values[0].gender))
        .style("opacity",0.9)
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
      .data(voronoi.polygons(d3.merge(dataNested.map(function(d) { return d.values; }))))
      .enter().append("path")
        .attr("d", function(d) { return d ? "M" + d.join("L") + "Z" : null; })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

      function mouseover(d) {
        d3.select(".id"+d.data.name.toLowerCase().replace(/ /g,'')+targetVal.replace(/ /g,'')+runnerID.replace(/ /g,'')).classed("line-hover", true);
        if (+d.data["Date"].split("-")[1] < 5){
          focus.style("text-anchor","begin")
        } else {
          focus.style("text-anchor","end")
        }
        d3.select("#hover-runner-"+targetVal.replace(/ /g,'')+"-"+runnerID.split(" ")[0].toLowerCase()).text(d.data.name);
        d3.select("#hover-number-"+targetVal.replace(/ /g,'')+"-"+runnerID.split(" ")[0].toLowerCase()).text(formatthousands(d.data[targetVal])+" "+units);
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
    bottom: 20,
    left: 100
  };
  if (screen.width > 768) {
    // var width = 900 - margin.left - margin.right;
    var height = 470 - margin.top - margin.bottom;
  } else if (screen.width <= 768 && screen.width > 480) {
    // var width = 720 - margin.left - margin.right;
    var height = 470 - margin.top - margin.bottom;
  } else if (screen.width <= 480 && screen.width > 340) {
    console.log("big phone");
    var margin = {
      top: 20,
      right: 30,
      bottom: 40,
      left: 55
    };
    // var width = 340 - margin.left - margin.right;
    var height = 350 - margin.top - margin.bottom;
  } else if (screen.width <= 340) {
    console.log("mini iphone")
    var margin = {
      top: 20,
      right: 30,
      bottom: 40,
      left: 55
    };
    // var width = 310 - margin.left - margin.right;
    var height = 370 - margin.top - margin.bottom;
  }
  var width = Math.min(windowWidth,maxWidth) - 10 - margin.left - margin.right;
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
              return (d["Daily Elevation"]/1000+5)
            } else {
              return (d["Daily Elevation"]/500+5)
            }
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
            return 0.3;
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
// functions to draw calendars ------------------------------------
//----------------------------------------------------------------------------------

function drawCalendarV2(dateData,chartID) {

  if (windowWidth <= 650) {
    var cellMargin = 2,
        cellSize = 16;
    var header_height = 40;
  } else {
    var cellMargin = 2,
        cellSize = 20;
    var header_height = 50;
  }
  var minDate = new Date("2017-04-01");
  var maxDate = new Date("2017-07-16");

  var day = d3.timeFormat("%w"), // day of the week
      week = d3.timeFormat("%U"), // week number of the year
      month = d3.timeFormat("%m"), // month number
      year = d3.timeFormat("%Y"),
      format = d3.timeFormat("%m/%d/%Y"),
      monthName = d3.timeFormat("%B"),
      months= d3.timeMonth.range(d3.timeMonth.ceil(minDate), d3.timeMonth.ceil(maxDate));

  var num_months = 4;
  if (windowWidth <= 650) {
    var num_months_in_a_row = 2;
    var num_rows = 2;
  } else {
    var num_months_in_a_row = 4;
    var num_rows = 1;
  }



  var color = d3.scaleLinear()
    .range(['white', '#CF0000'])
    .domain([0, 26.2]);

  var lookup = d3.nest()
    .key(function(d) {
      return format(parseFullDate(d["Date"]));
    })
    .rollup(function(leaves) {
      return d3.sum(leaves, function(d){ return parseInt(d["Daily Miles"]); });
    })
    .object(dateData);

  // something about clearing the SVG is NOT WORKING
  var svg = d3.select(chartID).selectAll("svg")
      // .data(d3.range([2017,2017]))
    .data("0")
    .enter().append("svg")
    .attr("width", 7*cellSize*num_months_in_a_row + 28*(num_months_in_a_row-1)) //2 months of 7 days a week with 25 px between them
    .attr("height", 7*cellSize*num_rows + header_height)
    .append("g")

  // making colored squares for dates
  var rect = svg.selectAll(".day")
      .data(function(d) {
        return d3.timeDays(minDate, maxDate);
      })
    .enter().append("rect")
      .attr("class", "day")
      .attr("width", cellSize-4)
      .attr("height", cellSize-4)
      .attr("rx", 3).attr("ry", 3) // rounded corners
      .attr("fill", function(d,didx) {
        if (lookup[format(d)]) {
          return color(lookup[format(d)]);
        } else {
          return "#eaeaea";
        }
      })
      .attr("x", function(d) {
        var month_padding = 1.2 * cellSize*7 * ((month(d)) % (num_months_in_a_row));
        return day(d) * cellSize + month_padding;
      })
      .attr("y", function(d) {
        var week_diff = week(d) - week(new Date(year(d), month(d)-1, 1) );
        var row_level = Math.ceil(month(d) / (num_months_in_a_row));
        var index = +month(d) - num_months;
        if(num_rows > 1) {
          return (week_diff*cellSize) + header_height+ Math.floor(index/num_months_in_a_row)*cellSize*8;
        } else {
          return (week_diff*cellSize) + header_height;
        }
      })
      .datum(format);

  var month_titles = svg.selectAll(".month-title")  // Jan, Feb, Mar and the whatnot
        .data(function(d) {
          return months; })
      .enter().append("text")
        .text(monthTitle)
        .attr("x", function(d, i) {
          var month_padding = 1.2 * cellSize*7* ((month(d)) % (num_months_in_a_row)) + 2.5*cellSize;
          return month_padding;
        })
        .attr("y", function(d, i) {
          var week_diff = week(d) - week(new Date(year(d), month(d)-1, 1) );
          var row_level = Math.ceil(month(d) / (num_months_in_a_row));
          if(num_rows > 1) {
            return (week_diff*cellSize) + header_height - 5 + Math.floor(i/num_months_in_a_row)*cellSize*8;
          } else {
            return (week_diff*cellSize) + header_height - 20;
          }
        })
        .attr("class", "month-title")
        .attr("d", monthTitle);

  //  Tooltip Object
  var tooltip = d3.select("body")
    .append("div").attr("id", "tooltip")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")

  //  Tooltip
  rect.on("mouseover", mouseover);
  rect.on("mouseout", mouseout);
  function mouseover(d) {
    tooltip.style("visibility", "visible");
    if (lookup[d]){
      var text = d+" : "+lookup[d]+ " miles";
    } else {
      var text = "";
    }
    tooltip.style("opacity",1)
    if (screen.width <= 480) {
      tooltip.html(text)
        .style("left",(d3.event.pageX)/2+10+"px")
        .style("top",(d3.event.pageY+20)+"px");//(d3.event.pageY+40)+"px")
    } else {
      tooltip.html(text)
        .style("left", (d3.event.pageX)+10 + "px")
        .style("top", (d3.event.pageY) + "px");
    }
  }
  function mouseout (d) {
    tooltip.style("opacity",0);
  }
  function monthTitle (t0) {
    return t0.toLocaleString("en-us", { month: "long" });
  }
}

//----------------------------------------------------------------------------------
// DRAW ALL CHARTS
//----------------------------------------------------------------------------------

for (var jdx=0; jdx<dataList.length; jdx++) {
  var data = [];
  var chartID = chartHeatList[jdx];
  var data = eval(dataList[jdx]);

  drawCalendarV2(data,chartID);

  hoverChart("#hover-chart-elevation-"+keyList[jdx],"Total Elevation",60000,"Elevation gain total (ft)","ft",nameList[jdx]);

  hoverChart("#hover-chart-miles-"+keyList[jdx],"Total Miles",900,"Total number of miles run","miles",nameList[jdx]);

}

dotChart("#dot-chart",75,"all");

//----------------------------------------------------------------------------------
// REDRAW ALL CHARTS ON RESIZE
//----------------------------------------------------------------------------------

$(window).resize(function () {
  windowWidth = $(window).width();
  halfWidth = Math.min((windowWidth/2),maxWidth/2);

  var buttons = document.getElementsByClassName("button");
  for (var idx=1; idx<buttons.length; idx++){
    buttons[idx].classList.remove("active");
  }
  buttons[0].classList.add("active");
  dotChart("#dot-chart",75,"all");

  for (var jdx=0; jdx<dataList.length; jdx++) {
    var data = [];
    var chartID = chartHeatList[jdx];
    var data = eval(dataList[jdx]);

    drawCalendarV2(data,chartID);

    hoverChart("#hover-chart-elevation-"+keyList[jdx],"Total Elevation",60000,"Elevation gain total (ft)","ft",nameList[jdx]);

    hoverChart("#hover-chart-miles-"+keyList[jdx],"Total Miles",900,"Total number of miles run","miles",nameList[jdx]);

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
    dotChart("#dot-chart",75,buttonRunnerID);
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
// if (windowWidth<= 480) {
  var window_top = document.body.scrollTop-30;
// } else {
  // var window_top = document.body.scrollTop;
// }
window.onload = function () {
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
