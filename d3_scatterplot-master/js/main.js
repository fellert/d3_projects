/*
*    main.js
*    Mastering Data Visualization with D3.js
*    Project 2 - Gapminder Clone
*/

var margin = {left:100, right:10, top:50, bottom:100};

var width = 1000 - margin.left - margin.right;
var height = 500 - margin.bottom - margin.top;

var svg = d3.select("#chart-area").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

var x = d3.scaleLog()
		.base(10)
    .domain([100, 150000])
    .range([0,width]);

var y = d3.scaleLinear()
		.domain([0,100])
    .range([height,0]);

var a = d3.scaleLinear()
    .domain([0, 1400000000])
		.range([50,50000]);

// var color = d3.scaleOrdinal().range(["#98abc5","#7b6888","#a05d56","#ff8c00"]);

var color = d3.scaleOrdinal(d3.schemePastel1)

g.append("text")
    .attr("y", height + 75)
    .attr("x", width / 2)
    .attr("font-family", "Work Sans")
    .attr("fill", "#fff")
    .text("Income");

g.append("text")
    .attr("y", -75)
    .attr("x", -(height / 2))
    .attr("font-family", "Work Sans")
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .attr("fill", "#fff")
    .text("Life Expectancy");

g.append("g")
    .attr("transform", "translate(0 ," + height + ")")
    .attr("class", "x-axis")
    .call(d3.axisBottom(x)
        .tickValues([500, 5000, 50000])
        .tickFormat(d3.format("$")));

g.append("g")
    .attr("class", "y-axis")
    .call(d3.axisLeft(y));

// var year = svg.append("g")
//     .attr("transform", "translate(" + (width+50) + "," + (height + 35) + ")")
//     .append("text")
//         .attr("font-family", "Open Sans")
//         .attr("font-size", 24)
//         .text("1800");

// LEGEND

var continents = ["europe", "asia", "americas", "africa"]

var legend = g.append("g")
    .attr("transform", "translate(" + (width-10) + "," + (height - 125) + ")");

continents.forEach(function(continent, i) {
    var legendRow = legend.append("g")
        .attr("transform", "translate(0, " + (i*20) + ")");
    legendRow.append("rect")
        .attr("width",10)
        .attr("height",10)
        .attr("fill",color(continent));
    legendRow.append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .attr("fill", "#fff")
        .text(continent);
});

// TOOL-TIP

var tip = d3.tip().attr("class","d3-tip")
    .html(function(d) {
        var text = "<strong>Country: </strong>" + d.country + "<br>";
        text += "<strong>Population: </strong>" + d3.format(",.0f")(d.population) + "<br>";
        text += "<strong>Income: </strong>" + d3.format("$,.0f")(d.income) + "<br>";
        text += "<strong>Life Expectancy: </strong>" + d.life_exp + "<br>";
        return text
    });

g.call(tip);

var index = 0;
var interval;
var updatedData = [];

d3.json("data/data.json").then(function(data) {

		for (var i in data) {
				var year = []
				for (var j of data[i].countries) {
						if ((j.life_exp != null) && (j.income != null)) {
								// j.income = +j.income;
								// j.life_exp = +j.life_exp;
								year.push({"country": j.country,
                           "income": j.income,
													 "life_exp": j.life_exp,
                           "population": j.population,
                           "continent": j.continent
                         })
						};
				};
				updatedData.push(year);
		};

    d3.select("#country-select").selectAll("option")
        .data(updatedData[0])
        .enter()
          .append("option")
          .attr("value", function(d) { return d.country; })
          .text(function(d) { return d.country; });

    update(updatedData[0]);
});

$("#play-button")
    .on("click", function() {
        var button = $(this);
        if (button.text() == "Start") {
            button.text("Stop")
            interval = setInterval(step,50);
        }
        else {
            button.text("Start");
            clearInterval(interval);
        }
    });

$("#reset-button")
    .on("click", function() {
        index = 0;
        update(updatedData[0]);
    });

$("#date-slider").slider( {
    min: 1800,
    max: 2014,
    step: 1,
    slide: function(event,ui) {
        index = ui.value - 1800;
        update(updatedData[index],$("#country-select").val());
    }
});

$("#country-select")
    .on("change", function() {
        update(updatedData[index],$("#country-select").val());
    });

function step() {
    index = (index < 214) ? index+1 : 0;
    update(updatedData[index],$("#country-select").val());
}

function filterCountries(data,country) {
    filteredData = []

    if (country === "all") {
        return data;
    }
    else {
      for (i of data) {
          if (i.country === country) { filteredData.push(i) }
      };
      return filteredData;
    };
};

function update(d,country) {

    data = filterCountries(d,$("#country-select").val());

    var t = d3.transition().duration(50);

		var circles = g.selectAll("circle")
				.data(data, function(d) { return d.country; } );

    circles.exit()
        .remove();

		circles.enter()
				.append("circle")
        .attr("fill", function(d) { return color(d.continent); })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide)
        .merge(circles)
        .transition(t)
						.attr("cy", function(d) { return y(d.life_exp); })
						.attr("cx", function(d) { return x(d.income); })
						.attr("r", function(d) { return Math.sqrt(a(d.population)) / Math.PI; });

    // year.text(+"1800" + index);
    $("#year")[0].innerHTML = +(index + 1800);
    $("#date-slider").slider("value", +(index + 1800));

};
