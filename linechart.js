let canvasWidth = 1200;
let canvasHeight = 800;
let xMargin = 100;
let yMargin = 100;
let width = canvasWidth - xMargin;
let height = canvasHeight - yMargin;

// set up svg
let svg = d3.select("div#linechart")
    .append("svg")
    .attr("height", height)
    .attr("width", width);

// title
svg.append("text")
    .attr("class", "title")
    .attr("transform", "translate(" + (width / 2) + ", " + (yMargin / 2) + ")")
    .text("Board Games Published Over Time");

// x label
svg.append("text")
    .attr("class", "label")
    .attr("transform", "translate(" + (width / 2) + ", " + (height - yMargin / 2) + ")")
    .text("Year");

// y label
svg.append("text")
    .attr("class", "label")
    .attr("transform", "translate(" + (xMargin / 2) + ", " + (height / 2) + ") rotate(270)")
    .text("# of Board Games")

let xScale = d3.scaleTime().range([0, width - xMargin * 2]);
let yScale = d3.scaleLinear().range([height - yMargin * 2, 0]);

// container for grid, so the grid is drawn first
let grid_container = svg.append("g");

// container for all of the points
let container = svg.append("g")
    .attr("transform", "translate(" + xMargin + ", " + yMargin + ")");

let parseDate = d3.timeParse("%Y");

// make sure we can read numbers properly
let rowConverter = function(d) {
    return {
        year: parseDate(d["Year Published"]),
    };
};

d3.csv("BGG_Data_Set.csv", rowConverter).then(data => {
    data = data.filter(data => data.year !== null)
    // get averages
    let counts = d3.rollups(data, v => d3.count(v, d => d.year), d => d.year);
    // console.log(counts)
    // sort array by year (asc)
    counts = counts.sort((a, b) => a[0] - b[0]);
    // console.log(counts);

    // year 0 is an outlier
    counts.shift()

    // 2022 isn't a complete year, so it's an outlier- more games to be published and rated eventually
    counts.pop()

    xScale.domain(d3.extent(counts, function(d) {
        return d[0];
    }));

    yScale.domain([0, d3.max(counts, function(d) {
        return d[1];
    })]);

    // draw line. reference: https://www.d3-graph-gallery.com/graph/line_basic.html
    container.append("path")
        .datum(counts)
        .attr("fill", "none")
        .attr("stroke", "cornflowerblue")
        .attr("stroke-width", 3)
        .attr("d", d3.line()
            .x(function(d) {
                // console.log(d[0])
                return xScale(d[0]);
            })
            .y(function(d) {
                return yScale(d[1]);
            }));

    // draw horizontal grid lines
    grid_container.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + xMargin + ", " + yMargin + ")")
        .call(d3.axisRight(yScale)
            .tickSize(width - xMargin * 2)
            .tickFormat("")
            .tickSizeOuter(0));

    // draw x axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + xMargin + ", " + (height - yMargin) + ")")
        .call(d3.axisBottom(xScale).tickSizeOuter(0)
            .ticks(d3.timeYear.every(100)));

    // draw y axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + xMargin + ", " + yMargin + ")")
        .call(d3.axisLeft(yScale).tickSizeOuter(0));
});