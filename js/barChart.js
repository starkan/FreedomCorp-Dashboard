/*
*    barChart.js
*    Source: https://bl.ocks.org/mbostock/3885304
*    Mastering Data Visualization with D3.js
*    FreedomCorp Dashboard
*/

// Constructor function
BarChart = function(_parentElement, _variable) {
    this.parentElement = _parentElement;
    this.variable = _variable;

    this.initVis();
}

// Add static elements
BarChart.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 30, right: 20, bottom: 20, left: 50};
    vis.width = 300 - vis.margin.left - vis.margin.right,
    vis.height = 125 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement)
        .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.t = function() { return d3.transition().duration(1000); }
    vis.keys = d3.values(d3.nest().key(function(d) {
            return d.category;
        }).entries(calls))
        .map(function(d) {
            return d.key;
        });

    vis.x_scale = d3.scaleBand()
        .domain(vis.keys)
        .rangeRound([0, vis.width]).padding(0.5);
    vis.y_scale = d3.scaleLinear().rangeRound([vis.height, 0]);

    vis.xAxisCall = d3.axisBottom().tickFormat(function(d) {
        return d.charAt(0).toUpperCase() + d.slice(1);
    }).scale(vis.x_scale);
    vis.yAxisCall = d3.axisLeft().ticks(4);

    vis.xAxis = vis.g.append("g").attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxisCall);
    vis.yAxis = vis.g.append("g").attr("class", "y axis");

    var label = "Units sold per call";
    if (vis.variable === "call_revenue") {
        label = "Average call revenue (USD)";
    } else if (vis.variable === "call_duration") {
        label = "Average call duration (seconds)";
    }
    vis.g.append("text")
        .attr("y", -vis.margin.top/2)
        .attr("x", -vis.margin.left)
        .attr("font-size", "11px")
        .attr("text-anchor", "start")
        .text(label);

    vis.wrangleData();
}

// Filter data
BarChart.prototype.wrangleData = function() {
    var vis = this;

    vis.barData = d3.nest()
        .key(function(d) { return d.category; })
        .rollup(function(d) { return d3.mean(d, function(v) { return v[vis.variable]; }); })
        .entries(callsFiltered);

    vis.updateVis();
}

// Trigger updates
BarChart.prototype.updateVis = function() {
    var vis = this;

    // Update y-scale
    vis.y_scale.domain([0, d3.max(vis.barData, function(d) { return d.value; })]);

    // Update y-axis
    vis.yAxisCall.scale(vis.y_scale);
    vis.yAxis.transition(vis.t()).call(vis.yAxisCall);

    // JOIN elements with new data.
    vis.bar = vis.g.selectAll(".bar")
        .data(vis.barData, function(d) { return d.key; });

    // EXIT old elements from the screen.
    vis.bar.exit()
        .transition(vis.t())
        .attr("y", vis.height)
        .attr("height", 0)
        .remove();

    // UPDATE elements still on the screen.
    vis.bar
        .transition(vis.t())
        .attr("y", function(d) { return vis.y_scale(d.value); })
        .attr("height", function(d) { return vis.height - vis.y_scale(d.value); });

    // ENTER new elements in the array.
    vis.bar.enter().append("rect")
        .attr("class", "bar")
        .style("fill", "gray")
        .attr("x", function(d) { return vis.x_scale(d.key); })
        .attr("y", function(d) { return vis.y_scale(d.value); })
        .attr("width", vis.x_scale.bandwidth())
        .attr("height", function(d) { return vis.height - vis.y_scale(d.value); });
}
