/*
*    stackedAreaChart.js
*    Source: https://bl.ocks.org/mbostock/3885211
*    Mastering Data Visualization with D3.js
*    FreedomCorp Dashboard
*/

// Constructor function
StackedAreaChart = function(_parentElement, _variable) {
    this.parentElement = _parentElement;
    this.variable = _variable;

    this.initVis();
}

// Add static elements
StackedAreaChart.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 50, right: 100, bottom: 20, left: 80};
    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 350 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select(vis.parentElement)
        .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.t = function() { return d3.transition().duration(1000); }

    vis.keys = d3.values(d3.nest().key(function(d) {
            return d.team;
        }).entries(calls))
        .map(function(d) {
            return d.key;
        });
    // vis.keys.splice(vis.keys.length - 2, 0, vis.keys.pop());

    vis.x_scale = d3.scaleTime().range([0, vis.width]);
    vis.y_scale = d3.scaleLinear().range([vis.height, 0]);
    vis.color = d3.scaleOrdinal(d3.schemePastel1).domain(vis.keys);

    vis.stack = d3.stack().keys(vis.keys);
    vis.area = d3.area()
        .x(function(d) { return vis.x_scale(parseTime(d.data.date)); })
        .y0(function(d) { return vis.y_scale(d[0]); })
        .y1(function(d) { return vis.y_scale(d[1]); });

    vis.xAxisCall = d3.axisBottom().ticks(3);
    vis.yAxisCall = d3.axisLeft();
    vis.xAxis = vis.g.append("g").attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height + ")");
    vis.yAxis = vis.g.append("g").attr("class", "y axis");

    vis.g.selectAll("legend")
        .data(vis.keys)
        .enter()
        .append("text")
          .attr("y", -vis.margin.top/2)
          .attr("x", function(d, i) { return vis.margin.left + i*150; })
          .style("fill", function(d) { return vis.color(d); })
          .attr("font-weight", "bold")
          .attr("font-size", "12px")
          .attr("text-anchor", "start")
          .text(function(d) { return d.charAt(0).toUpperCase() + d.slice(1); });

    vis.wrangleData();
}

// Filter data
StackedAreaChart.prototype.wrangleData = function() {
    var vis = this;

    vis.variable = $("#var-select").val();

    var nestedData = d3.nest()
        .key(function(d) { return formatTime(d.date); })
        .key(function(d) { return d.team; })
        .rollup(function(d) {
              return d3.sum(d, function (v) { return v[vis.variable]; });
        })
        .entries(callsFiltered);

    vis.dataFiltered = nestedData
        .map(function(day){
            return {
                date: day.key,
                west: day.values.find(function(d) {
                    return d.key === "west";
                }).value,
                south: day.values.find(function(d) {
                    return d.key === "south";
                }).value,
                northeast: day.values.find(function(d) {
                    return d.key === "northeast";
                }).value,
                midwest: day.values.find(function(d) {
                    return d.key === "midwest";
                }).value
            }
        });

    vis.updateVis();
}

// Trigger updates
StackedAreaChart.prototype.updateVis = function() {
    var vis = this;

    // Update scales
    vis.x_scale.domain(d3.extent(vis.dataFiltered, function (d) { return parseTime(d.date); }));
    vis.y_scale.domain([0,
        d3.max(vis.dataFiltered, function(d) {
            return d.northeast + d.south + d.midwest + d.west;
        })
    ]);

    // Update axes
    vis.xAxisCall.scale(vis.x_scale);
    vis.xAxis.transition(vis.t()).call(vis.xAxisCall);
    vis.yAxisCall.scale(vis.y_scale);
    vis.yAxis.transition(vis.t()).call(vis.yAxisCall);

    // JOIN elements with new data.
    vis.team = vis.g.selectAll(".team")
        .data(vis.stack(vis.dataFiltered), function(d) { return d.key; });

    // UPDATE elements still on the screen.
    vis.team.select(".area")
        .attr("d", vis.area);

    // ENTER new elements in the array.
    vis.team.enter().append("g")
        .attr("class", "team")
        .append("path")
            .attr("class", "area")
            .style("fill", function(d) { return vis.color(d.key); })
            .attr("d", vis.area);
}
