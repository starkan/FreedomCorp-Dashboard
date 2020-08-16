/*
*    main.js
*    Mastering Data Visualization with D3.js
*    FreedomCorp Dashboard
*/

// Global variables that the page will use
var areaChart, timeline, donutChart0, barChart1, barChart2, barChart3;
var currentSelection = "call_revenue";
var calls = [], callsFiltered = [];
var parseTime = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%d/%m/%Y");

// All the events
function brushed() {
    var selection = d3.event.selection || timeline.x_scale.range();
    var newValues = selection.map(timeline.x_scale.invert);

    $("#date-slider")
        .slider('values', 0, newValues[0])
        .slider('values', 1, newValues[1]);
    $("#dateLabel1").text(formatTime(newValues[0]));
    $("#dateLabel2").text(formatTime(newValues[1]));

    // Filter data based on selections
    callsFiltered = calls.filter(function(d) {
        return ((d.date >= newValues[0]) && (d.date <= newValues[1]))
    });

    areaChart.wrangleData();
    donutChart0.wrangleData();
    barChart1.wrangleData();
    barChart2.wrangleData();
    barChart3.wrangleData();
}

d3.select("#var-select")
    .on("change", function() {
        currentSelection = this.value;
        areaChart.wrangleData();
        timeline.wrangleData();
});

d3.json("data/calls.json").then(function(data){
    // Handle all the data loading for the page
    // for (var call in data) {
    data.forEach(function(d, i){
        calls[i] = {};
        calls[i]["call_duration"] = d["call_duration"];
        calls[i]["call_revenue"] = d["call_revenue"];
        calls[i]["category"] = d["category"];
        calls[i]["company_size"] = d["company_size"];
        calls[i]["date"] = parseTime(d["date"]);
        calls[i]["team"] = d["team"];
        calls[i]["units_sold"] = d["units_sold"];
    });
    callsFiltered = calls;

    // create new instances of each of our visualization objects
    areaChart = new StackedAreaChart("#stacked-area", currentSelection);
    timeline = new Timeline("#timeline");

    donutChart0 = new DonutChart("#company-size");
    barChart1 = new BarChart("#units-sold", "units_sold");
    barChart2 = new BarChart("#revenue", "call_revenue");
    barChart3 = new BarChart("#call-duration", "call_duration");

});
