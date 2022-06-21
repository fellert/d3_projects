var margin = { left:75, right:50, top:50, bottom:100 },
    height = 600 - margin.top - margin.bottom,
    width = 1400 - margin.left - margin.right;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left +
        ", " + margin.top + ")");

var x = d3.scaleBand().rangeRound([0, width]).padding(0.1)
var y = d3.scaleLinear().rangeRound([0,(height - 200)]);

var color = d3.scaleOrdinal().range(["#98abc5",
                                     "#7b6888",
                                     "#a05d56",
                                     "#ff8c00"]);

var regions = ["West", "South", "Midwest", "Northeast"]

var legend = g.append("g")
    .attr("transform", "translate(" + (width-10) + "," + (height - 500) + ")");

regions.forEach(function(region, i) {
    var legendRow = legend.append("g")
        .attr("transform", "translate(0, " + (i*20) + ")");
    legendRow.append("rect")
        .attr("width",10)
        .attr("height",10)
        .attr("fill",color(region));
    legendRow.append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("font-family", "Didact Gothic, sans-serif")
        .attr("text-anchor", "end")
        .text(region);
});

var tip = d3.tip().attr("class","d3-tip")
    .html(function(d) {
        var text = "<strong>State: </strong>" + d["NAME"] + "<br>";
        text += "<strong>Value: </strong>" + d3.format(",.0f")(d[$("#measure-select").val()+$("#year").text()]) + "<br>";
        return text;
    });

g.call(tip);

g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + (height - 200) + ")");

g.append("g")
    .attr("class", "axis axis--y");

var xAxisCall = d3.axisBottom();
var yAxisCall = d3.axisLeft();


d3.csv("data/nst-est2017-alldata.csv").then(function(data) {

    $("#year-slider").slider( {
        min: 2011,
        max: 2017,
        step: 1,
        slide: function(event,ui) {
            $("#year").text(ui.value);
            if ($("#pie-button").text() == "Pie Chart") {
                update(data);
            }
            else {
                pie(data);
            }
        }
    });

    $("#measure-select")
        .on("change",function() {
            if ($("#pie-button").text() == "Pie Chart") {
                update(data);
            }
            else {
                pie(data);
            }
        });

    $("#pie-button")
        .on("click", function() {
            var button = $(this);
            if (button.text() == "Pie Chart") {
                button.text("Bar Chart")
                d3.selectAll(".bar").style("visibility", "hidden");
                d3.selectAll(".axis").style("visibility", "hidden");
                pie(data);
            }
            else {
                button.text("Pie Chart");
                d3.selectAll(".pie").remove()
                d3.selectAll(".bar").style("visibility", "visible");
                d3.selectAll(".axis").style("visibility", "visible");
            }
        });

    update(data);
});

var maxs = {"POPESTIMATE": 40000000, "INTERNATIONALMIG": 170000,
               "BIRTHS": 600000,"DEATHS": 550000,"NPOPCHG_": 500000,
               "DOMESTICMIG": 250000 };


function pie(data) {

  var measure = $("#measure-select").val();
  var year = $("#year").text();

  var radius = Math.min(width, height) / 2;
  var g = svg.append("g")
      .attr("class", "pie")
      .attr("transform", "translate(" + width / 2 + "," + (height - 200) + ")");

  var tip = d3.tip().attr("class","d3-tip")
      .html(function(d) {
          var text = "<strong>State: </strong>" + d.data["NAME"] + "<br>";
          text += "<strong>Value: </strong>" + d3.format(",.0f")(d.data[$("#measure-select").val()+$("#year").text()]) + "<br>";
          return text;
      });

  g.call(tip);

  var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d[measure+year]; });

  var path = d3.arc()
      .outerRadius(radius - 10)
      .innerRadius(radius - 100);

  var label = d3.arc()
      .outerRadius(radius)
      .innerRadius(radius);

  var arc = g.selectAll(".arc")
    .data(pie(data))
    .enter().append("g")
      .attr("class", "arc");

  arc.append("path")
      .attr("d", path)
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide)
      .attr("fill", function(d) { return color(d.data['REGION']); });

};


function update(data) {

    var measure = $("#measure-select").val();
    var year = $("#year").text();

    for (var i in data) {
        data[i][measure+year] = +data[i][measure+year];
        data[i]['REGION'] = +data[i]['REGION'];
    };

    data.sort(function(x,y) {
        return ((y["REGION"] - x["REGION"]) || (y[measure+year] - x[measure+year]));
    });

    var min = d3.min(data, function(d) { return d[measure+year]; })
    var max = d3.max(data, function(d) { return d[measure+year]; })

    x.domain(data.map(function(d) { return d['NAME']; }));
    y.domain([0,maxs[measure]]);

    var yAxisScale = d3.scaleLinear()
        .domain([min, maxs[measure]])
        .range([(height - 200) - y(min), 0])

    var rects =  g.selectAll(".bar")
				.data(data, function(d) { return d["NAME"];} );

    rects.exit()
      .transition()
        .attr("y", y(0))
        .remove();

    rects.enter()
        .append("rect")
          .attr("class","bar")
          .on("mouseover", tip.show)
          .on("mouseout", tip.hide)
          .merge(rects)
          .transition()
            .delay(500)
              .attr("x", function(d) { return x(d['NAME']); })
              .attr("y", function(d) { return (height - 200) - Math.max(0, y(d[measure+year])); })
              .attr("width", x.bandwidth())
              .attr("height", function(d) { return Math.abs(y(d[measure+year])); })
              .attr("fill", function(d) { return color(d['REGION'])})
              .style("opacity", 0.8);

    g.select(".axis--x")
      .transition()
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + (height - 200) + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
            .attr("font-family", "Didact Gothic, sans-serif")
            .attr("text-anchor", "end")
            .attr("dx", "-0.8em")
            .attr("transform", "rotate(-45)");

    g.select(".axis--y")
      .transition()
        .attr("class", "axis axis--y")
        .attr("transform", "translate(0,0)")
        .call(d3.axisLeft(yAxisScale).ticks(10));

};
