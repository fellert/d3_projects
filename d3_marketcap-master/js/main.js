var width = document.getElementById("chart-area").clientWidth;
var height = document.getElementById("chart-area").clientHeight;

var pack = d3.pack()
    .size([width, height])
    .radius(d => a(d.value))
    .padding(1.5);

var svg = d3.select("#chart-area").append("svg")
    .attr("class", ".svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("preserveAspectRatio", "xMinYMin meet");

var legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (width - 75) + "," + (height - 350) + ")");


var a = d3.scaleLinear()
    .domain([200000, 1000000])
		.range([65,130]);

var colors = ["#1abc9c", "#7ed6df", "#74b9ff", "#ff7675", "#e67e22", "#f1c40f",
              "#D980FA", "#fab1a0", "#e74c3c", "#fd79a8", "#fdcb6e", "#cf6a87"]

var color = d3.scaleOrdinal(colors);

$("#year-search").on("click", function() {
    if ($(this).val() == "search for a year") {
        $(this).val("")
    };
});



d3.json("data/data.json").then(function(data) {

  var years = d3.keys(data);
  for (year of years.splice(1)) {
    d3.select(".year-select")
        .append("option")
        .attr("value", year)
        .text(year);
  };

  $("#year-search").on('keyup', function (e) {
      if (e.keyCode == 13) {
          if ($("#year-search").val() in data) {
              addCircles(data);
          }
      }
  });

  window.addEventListener("resize", function() {
        if ($("#year-search").val() in data) {
            resize(data);
        }

      });

});

function resize(data) {

  d3.selectAll("svg").remove();
  d3.selectAll(".legend").remove();

  var width = document.getElementById("chart-area").clientWidth;
  var height = document.getElementById("chart-area").clientHeight;

  var pack = d3.pack()
      .size([width, height])
      .radius(d => a(d.value))
      .padding(1.5);

  var svg = d3.select("#chart-area").append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", "0 0 " + width + " " + height)
      .attr("preserveAspectRatio", "xMinYMin meet");

  var legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + (width - 75) + "," + (height - 350) + ")");

  addCircles(data);

};


function addCircles(data) {

  var width = document.getElementById("chart-area").clientWidth;
  var height = document.getElementById("chart-area").clientHeight;

  var pack = d3.pack()
      .size([width, height])
      .radius(d => a(d.value))
      .padding(1.5);

  data = data[+$("#year-search").val()];

  var tip = d3.tip().attr("class","d3-tip")
      .html(function(d) {
          return d.data.Stock;
      });

  var svg = d3.selectAll("svg");
  var legend = d3.selectAll(".legend");

  svg.call(tip);

  var h = d3.hierarchy({children: data})
      .sum(d => d.Cap)

  var circle = svg.selectAll(".circle")
      .data(pack(h).leaves(), d => d.data.Stock)

  var text = svg.selectAll(".label")
      .data(pack(h).leaves(), d => d.data.Stock)

  circle.exit()
      .style("fill", "#c0392b")
      .transition().delay(500)
          .attr("r", 0)
          .remove();

  text.exit()
      .transition().delay(500)
          .attr("opacity", 0)
          .remove();

  circle.enter().append("circle")
    .attr("class", "circle")
    .attr("r", 0)
    .merge(circle)
    .transition().delay(500)
      .attr("cx", function(d){ return d.x; })
      .attr("cy", function(d){ return d.y; })
      .style("fill", function(d) { return color(d.data.Industry)  ; })
      .attr("r", function(d) { return d.r; });

  text.enter().append("text")
    .attr("class", "label")
    .on("mouseover", tip.show)
    .on("mouseout", tip.hide)
    .merge(text)
    .transition().delay(500)
      .attr("x", function(d){ return d.x; })
      .attr("y", function(d){ return d.y; })
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .text(function(d) { return d3.format("$.3s")(d.data.Cap).replace(/k/,"B"); });

  legend_vals = d3.map(data, function(d){return d.Industry;}).keys();
  svg.selectAll(".legendRow").remove();
  addLegend(data,legend_vals,legend);

};


function addLegend(data,vals,legend) {

  vals.forEach(function(industry, i) {
      var legendRow = legend.append("g")
          .attr("transform", "translate(0, " + (i*30) + ")")
          .attr("class", "legendRow");
      legendRow.append("rect")
          .attr("width",10)
          .attr("height",10)
          .attr("fill",color(industry));
      legendRow.append("text")
          .attr("x", -10)
          .attr("y", 10)
          .attr("font-family", "Muli")
          .attr("font-size", "14px")
          .attr("text-anchor", "end")
          .style("fill", "#000")
          .text(industry);
  });

};
