require("./lib/social");
var d3 = require("d3");//Do not delete'
var calendar = require("calendar-heatmap-mini");

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

//
function color_by_person(personName,runnerID) {
  if (personName == runnerID) {
    return "#CF0000";
  } else {
    return "#8c8c8c";
  }
  // if (personName == "Balint Gal") {
  //   return "gray";
  // } else if (personName == "Gene Dykes") {
  //   return "green";
  // } else if (personName == "Greg McQuaid") {
  //   return "orange";
  // } else if (personName == "Hilary Dykes") {
  //   return "red";
  // } else if (personName == "Iain Mickle") {
  //   return "yellow";
  // } else if (personName == "Jorge Maravilla") {
  //   return "purple";
  // } else if (personName == "Lauren Elkins") {
  //   return "black";
  // }
}

function colorful_dots(personName) {
  if (personName == "Balint Gal") {
    return "gray";
  } else if (personName == "Gene Dykes") {
    return "green";
  } else if (personName == "Greg McQuaid") {
    return "orange";
  } else if (personName == "Hilary Dykes") {
    return "red";
  } else if (personName == "Iain Mickle") {
    return "yellow";
  } else if (personName == "Jorge Maravilla") {
    return "purple";
  } else if (personName == "Lauren Elkins") {
    return "black";
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
    right: 80,
    bottom: 60,
    left: 100
  };
  if (screen.width > 768) {
    var width = 400 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;
  } else if (screen.width <= 768 && screen.width > 480) {
    var width = 400 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;
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

  if (units != "hours") {

    // x-axis scale
    var x = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]);

    x.domain([parseFullDate('2017-04-01'),parseFullDate('2017-07-01')]);
    y.domain([0,maxval]);

  } else {

    // x-axis scale
    var x = d3.scaleTime().range([0, width]),
        y = d3.scaleTime().range([height, 0]);

    x.domain([parseFullDate('2017-04-01'),parseFullDate('2017-07-01')]);
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
        .style("stroke-width",2.5)
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
        console.log(".id"+d.data.name.toLowerCase().replace(/ /g,'')+targetVal.replace(/ /g,'')+runnerID.replace(/ /g,''));
        d3.select(".id"+d.data.name.toLowerCase().replace(/ /g,'')+targetVal.replace(/ /g,'')+runnerID.replace(/ /g,'')).classed("line-hover", true);
        if (units != "hours") {
          focus.attr("transform", "translate(" + x(parseFullDate(d.data["Date"])) + "," + y(d.data[targetVal]) + ")");
          focus.select("text").text(d.data.name+": "+formatthousands(d.data[targetVal])+" "+units);//+" on "+d.data.date
        } else {
          focus.attr("transform", "translate(" + x(parseFullDate(d.data["Date"])) + "," + y(parseTime(d.data[targetVal])) + ")");
          focus.select("text").text(d.data.name+": "+d.data[targetVal]+" "+units);//+" on "+d.data.date
        }

      }

      function mouseout(d) {
        d3.select(".id"+d.data.name.toLowerCase().replace(/ /g,'')+targetVal.replace(/ /g,'')+runnerID.replace(/ /g,'')).classed("line-hover", false);
        focus.attr("transform", "translate(-100,-100)");
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
    var height = 420 - margin.top - margin.bottom;
  } else if (screen.width <= 768 && screen.width > 480) {
    var width = 720 - margin.left - margin.right;
    var height = 420 - margin.top - margin.bottom;
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
        .text("Miles")

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
// functions to draw calendars ------------------------------------
//----------------------------------------------------------------------------------

function drawCalendarV2(dateData,chartID) {

  var cellMargin = 2,
      cellSize = 20;

  // var minDate = d3.min(dateData, function(d) { return new Date(d["Date"]) })
  // var maxDate = d3.max(dateData, function(d) { return new Date(d["Date"]) })
  // console.log(minDate);
  // console.log(maxDate);
  var minDate = new Date("2017-04-01");
  var maxDate = new Date("2017-06-30");

  var day = d3.timeFormat("%w"), // day of the week
      day_of_month = d3.timeFormat("%e"), // day of the month
      day_of_year = d3.timeFormat("%j"),
      week = d3.timeFormat("%U"), // week number of the year
      month = d3.timeFormat("%m"), // month number
      year = d3.timeFormat("%Y"),
      percent = d3.format(".1%"),
      format = d3.timeFormat("%m/%d/%Y"),
      // format = d3.timeFormat("%Y-%m-%d"),
      monthName = d3.timeFormat("%B"),
      months= d3.timeMonth.range(d3.timeMonth.ceil(minDate), d3.timeMonth.ceil(maxDate));

  console.log(months);
  var num_months_in_a_row = 3;//months.length();//Math.floor(width / (cellSize * 7 + 50));
  console.log(num_months_in_a_row);
  // var shift_up = cellSize * 1;
  var header_height = 50;

  var color = d3.scaleLinear()
    .range(['white', '#CF0000'])
    // .range(['#D8E6E7', '#218380'])
    .domain([0, 26.2]);

  var lookup = d3.nest()
    .key(function(d) {
      return format(parseFullDate(d["Date"]));
    })
    .rollup(function(leaves) {
      return d3.sum(leaves, function(d){ return parseInt(d["Daily Miles"]); });
    })
    .object(dateData);

  var svg = d3.select(chartID).selectAll("svg")
      // .data(d3.range([2017,2017]))
    .data("0")
    .enter().append("svg")
    .attr("width", 7*cellSize*num_months_in_a_row + 28*(num_months_in_a_row-1)) //2 months of 7 days a week with 25 px between them
    .attr("height", 5*cellSize + header_height)
    .append("g")

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
        // var format = d3.timeFormat("%Y-%m-%d");
        if (lookup[format(d)]) {
          return color(lookup[format(d)]);
        } else {
          return "#eaeaea";
        }
      })
      .attr("x", function(d) {
        var month_padding = 1.2 * cellSize*7 * ((month(d)-1) % (num_months_in_a_row));
        return day(d) * cellSize + month_padding;
      })
      .attr("y", function(d) {
        var week_diff = week(d) - week(new Date(year(d), month(d)-1, 1) );
        var row_level = Math.ceil(month(d) / (num_months_in_a_row));
        return (week_diff*cellSize) + header_height;
      })
      .datum(format);

  var month_titles = svg.selectAll(".month-title")  // Jan, Feb, Mar and the whatnot
        .data(function(d) {
          return months; })
      .enter().append("text")
        .text(monthTitle)
        .attr("x", function(d, i) {
          var month_padding = 1.2 * cellSize*7* ((month(d)-1) % (num_months_in_a_row));
          return month_padding;
        })
        .attr("y", function(d, i) {
          var week_diff = week(d) - week(new Date(year(d), month(d)-1, 1) );
          var row_level = Math.ceil(month(d) / (num_months_in_a_row));
          return (week_diff*cellSize) + header_height - 20;
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
      var text = d+" : 0 miles";
    }
    tooltip.style("opacity",1)
    tooltip.html(text)
                .style("left", (d3.event.pageX)+10 + "px")
                .style("top", (d3.event.pageY) + "px");
  }
  function mouseout (d) {
    tooltip.style("opacity",0);
  }

  // });

  function dayTitle (t0) {
    return t0.toString().split(" ")[2];
  }
  function monthTitle (t0) {
    return t0.toLocaleString("en-us", { month: "long" });
  }
  // function yearTitle (t0) {
  //   return t0.toString().split(" ")[3];
  // }
}

function drawCalendar(dateData){

  var weeksInMonth = function(month){
    var m = d3.timeMonth.floor(month)
    return d3.timeWeeks(d3.timeWeek.floor(m), d3.timeMonth.offset(m,1)).length;
  }

  var minDate = d3.min(dateData, function(d) { return new Date(d["Date"]) })
  var maxDate = d3.max(dateData, function(d) { return new Date(d["Date"]) })

  var cellMargin = 2,
      cellSize = 20;

  console.log(minDate);
  console.log(maxDate);

  // var colorRange = ['#D8E6E7', '#218380'];
  //
  // // color range
  // var color = d3.scaleLinear()
  //   .range(['#D8E6E7', '#218380'])
  //   .domain([0, 40]);

  var day = d3.timeFormat("%w"),
      week = d3.timeFormat("%U"),
      format = d3.timeFormat("%Y/%m/%d"),
      // titleFormat = d3.utcFormat("%a, %d-%b");
      monthName = d3.timeFormat("%B"),
      months= d3.timeMonth.range(d3.timeMonth.floor(minDate), maxDate);

  var svg = d3.select("#calendar").selectAll("svg")
    .data(months)
    .enter().append("svg")
    .attr("class", "month")
    .attr("height", ((cellSize * 7) + (cellMargin * 8) + 20) ) // the 20 is for the month labels
    .attr("width", function(d) {
      var columns = weeksInMonth(d);
      return ((cellSize * columns) + (cellMargin * (columns + 1)));
    })
    .append("g")

  svg.append("text")
    .attr("class", "month-name")
    .attr("y", (cellSize * 7) + (cellMargin * 8) + 15 )
    .attr("x", function(d) {
      var columns = weeksInMonth(d);
      return (((cellSize * columns) + (cellMargin * (columns + 1))) / 2);
    })
    .attr("text-anchor", "middle")
    .text(function(d) { return monthName(d); })

  var rect = svg.selectAll("rect.day")
    .data(function(d, i) { return d3.timeDays(d, new Date(d.getFullYear(), d.getMonth()+1, 1)); })
    .enter().append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("rx", 3).attr("ry", 3) // rounded corners
    .attr("fill", '#eaeaea') // default light grey fill
    // .attr('fill', function (d,i) {
    //   console.log(i);
    //   return color(jorgeData[i]["miles"]);
    // })
    .attr("y", function(d) { return (day(d) * cellSize) + (day(d) * cellMargin) + cellMargin; })
    .attr("x", function(d) { return ((week(d) - week(new Date(d.getFullYear(),d.getMonth(),1))) * cellSize) + ((week(d) - week(new Date(d.getFullYear(),d.getMonth(),1))) * cellMargin) + cellMargin ; })
    .on("mouseover", function(d) {
      d3.select(this).classed('hover', true);
    })
    .on("mouseout", function(d) {
      d3.select(this).classed('hover', false);
    })
    .datum(format);

  // rect.append("title")
  //   .text(function(d) { return titleFormat(new Date(d)); });

  var lookup = d3.nest()
    .key(function(d) { return d["Date"]; })
    .rollup(function(leaves) {
      return d3.sum(leaves, function(d){ return parseInt(d["Daily Miles"]); });
    })
    .object(dateData);

  console.log("DATE DATA IS HERE");
  console.log(dateData);
  console.log(lookup);

  var scale = d3.scaleLinear()
    .domain(d3.extent(dateData, function(d) { return parseInt(d["Daily Miles"]); }))
    .range([0.4,1]); // the interpolate used for color expects a number in the range [0,1] but i don't want the lightest part of the color scheme

  console.log("RECT IS HERE");
  console.log(rect);
  rect.filter(function(d) { console.log(d); return d in lookup;})
  rect.style("fill",function(d) { var res = d in lookup; console.log(d); return scale(lookup[d]);});//eturn d3.interpolatePuBu(scale(lookup[d]));});
    // .select("title")
    // .text(function(d) { return titleFormat(new Date(d)) + ":  " + lookup[d]; });

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
  drawCalendarV2(data,chartID);

  console.log("#dot-chart"+keyList[jdx]);
  dotChart("#dot-chart-"+keyList[jdx],80,nameList[jdx]);
  hoverChart("#hover-chart-elevation-"+keyList[jdx],"Total Elevation",60000,"Elevation gain total (ft)","ft",nameList[jdx]);
  hoverChart("#hover-chart-miles-"+keyList[jdx],"Total Miles",900,"Total number of miles run","miles",nameList[jdx]);
  // var elevID = chartElevationList[jdx];
  // // drawElevation(data,elevID);
  // if (elevID) {
  //   areaChart(elevID,data,"Total Elevation",60000);
  // }
}

dotChart("#dot-chart",80,"all");

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
