/*
*    donutChart.js
*    Source: Section 10, Lecture 5
*    Mastering Data Visualization with D3.js
*    FreedomCorp Dashboard
*/

DonutChart = function(_parentElement){
    this.parentElement = _parentElement;

    this.initVis();
};

DonutChart.prototype.initVis = function() {
    var vis = this;

    vis.margin = { left:20, right:20, top:20, bottom:0 };
    vis.width = 300 - vis.margin.left - vis.margin.right;
    vis.height = 125 - vis.margin.top - vis.margin.bottom;
    vis.radius = Math.min(vis.width, vis.height) / 2;

    vis.svg = d3.select(vis.parentElement)
        .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + (vis.margin.left + vis.radius) +
            ", " + (vis.margin.top + vis.radius) + ")");

    vis.t = function() { return d3.transition().duration(1000); }
    vis.keys = d3.values(d3.nest().key(function(d) {
            return d.company_size;
        }).entries(calls))
        .map(function(d) {
            return d.key;
        });
    vis.color = d3.scaleOrdinal(d3.schemeSet2).domain(vis.keys);

    vis.pie = d3.pie()
        .padAngle(0.03)
        .value(function(d) { return d.value; })
        .sort(null);
    vis.arc = d3.arc()
        .innerRadius(vis.radius - 10)
        .outerRadius(vis.radius - 25);

    vis.g.append("text")
        .attr("y", -vis.height/2)
        .attr("x", -vis.radius - vis.margin.left)
        .attr("font-size", "12px")
        .attr("text-anchor", "start")
        .text("Company size");

    vis.g.selectAll("legend")
        .data(vis.keys)
        .enter()
        .append("text")
          .attr("y", function(d, i) {return (i-1)*25;})
          .attr("x", vis.width / 2 - vis.margin.left - vis.margin.right)
          .style("fill", function(d) { return vis.color(d); })
          .attr("font-weight", "bold")
          .attr("font-size", "12px")
          .attr("text-anchor", "start")
          .text(function(d) { return d.charAt(0).toUpperCase() + d.slice(1); });

    vis.wrangleData();
}

DonutChart.prototype.wrangleData = function() {
    var vis = this;

    vis.donutData = d3.nest()
        .key(function(d) { return d.company_size; })
        .rollup(function (d) { return d.length; })
        .entries(callsFiltered);

    vis.updateVis();
}

DonutChart.prototype.updateVis = function() {
    var vis = this;

    vis.path = vis.g.selectAll(".size")
        .data(vis.pie(vis.donutData), function(d) { return d.data.key; });

    // EXIT old elements from the screen.
    vis.path.exit()
        .transition(vis.t())
        .attrTween("d", arcTween)
        .remove();

    // UPDATE elements still on the screen.
    vis.path.transition(vis.t())
        .attrTween("d", arcTween);

    // ENTER new elements in the array.
    vis.path.enter()
        .append("path")
        .attr("class", "size")
        .attr("fill", function(d) { return vis.color(d.data.key); })
        .transition(vis.t())
            .attrTween("d", arcTween);

    function arcTween(d) {
        var i = d3.interpolate(this._current, d);
        this._current = i(1);
        return function(t) { return vis.arc(i(t)); };
    }

}
