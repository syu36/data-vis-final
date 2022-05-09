Board games have been around throughout history as a source of entertainment for friends and family.
Today, there are hundreds of thousands of board games. These visualizations will provide some insights into some
of the top games, using data collected from one of the top board game listing/rating websites, Board Game Geek.

[Line Chart](linechart.html)  
[Scatterplot](scatterplot.html)  
[Radar Chart](radar.html)

<style>
    .title {
        font-size: 28px;
        font-family: "Trebuchet MS", sans-serif;
        text-anchor: middle;
        alignment-baseline: middle;
    }


    .grid {
        color: lightgray;
    }

    .label {
        font-size: 24px;
        font-family: "Trebuchet MS", sans-serif;
        text-anchor: middle;
        alignment-baseline: middle;
    }

    .axis text {
        font-family: "Trebuchet MS", sans-serif;
        font-size: 12px;
    }


    .radar-label {
        font-size: 12px;
        font-family: "Trebuchet MS", sans-serif;
        text-anchor: middle;
    }


    .num-label {
        font-size: 12px;
        font-family: "Trebuchet MS", sans-serif;
    }

    .dot {
        fill: cornflowerblue;
    }
</style>
<script src="https://d3js.org/d3.v7.min.js"></script>

<script>
let canvasWidth1 = 1200;
let canvasHeight1 = 800;
let xMargin = 100;
let yMargin = 100;
let width1 = canvasWidth1 - xMargin;
let height1 = canvasHeight1 - yMargin;

let svg1 = d3.select("body")
    .append("svg")
    .attr("height", height1)
    .attr("width", width1);

svg1.append("rect")
    .attr("fill", "rgb(240, 240, 240)")
    .attr("width", "100%")
    .attr("height", "100%");

svg1.append("text")
    .attr("class", "title")
    .attr("transform", "translate(" + (width1 / 2) + ", " + (yMargin / 2) + ")")
    .text("Board Games Published Over Time");

svg1.append("text")
    .attr("class", "label")
    .attr("transform", "translate(" + (width1 / 2) + ", " + (height1 - yMargin / 2) + ")")
    .text("Year");

svg1.append("text")
    .attr("class", "label")
    .attr("transform", "translate(" + (xMargin / 2) + ", " + (height1 / 2) + ") rotate(270)")
    .text("# of Board Games");

let xScale1 = d3.scaleTime().range([xMargin, width1 - xMargin]);
let yScale1 = d3.scaleLinear().range([height1 - yMargin * 2, 0]);

let grid_container1 = svg.append("g");

svg1.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", xMargin)
    .attr("width", width1 - xMargin * 2)
    .attr("height", height1 - yMargin);

let container1 = svg.append("g")
    .attr("clip-path", "url(#clip)")
    .attr("transform", "translate(" + 0 + ", " + yMargin + ")");

let parseDate1 = d3.timeParse("%Y");

let rowConverter1 = function(d) {
    return {
        year: parseDate(d["Year Published"]),
    };
};

let rowConverterFacts = function(d) {
    return {
        year: parseDate1(d["Year"]),
        fact: d["Fact"]
    }
};

let facts;
d3.csv("board_game_facts.csv", rowConverterFacts).then(data => {
    facts = data;
});

d3.csv("BGG_Data_Set.csv", rowConverter1).then(data => {
    data = data.filter(data => data.year !== null);

    let counts = d3.rollups(data, v => d3.count(v, d => d.year), d => d.year);

    counts = counts.sort((a, b) => a[0] - b[0]);

counts.forEach(count => {
        facts.forEach(fact => {
            if (count[0].toString() === fact.year.toString()) {
                fact.count = count[1]
            }
        })
    });

    counts.shift();

    counts.pop();

    xScale.domain(d3.extent(counts, function(d) {
        return d[0];
    }));

    yScale.domain([0, d3.max(counts, function(d) {
        return d[1];
    }) + 50]);

    let x_axis = svg1.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 0 + ", " + (height1 - yMargin) + ")")
        .call(d3.axisBottom(xScale1).tickSizeOuter(0)
            .ticks(d3.timeYear.every(100)));

    grid_container1.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + xMargin + ", " + yMargin + ")")
        .call(d3.axisRight(yScale1)
            .tickSize(width1 - xMargin * 2)
            .tickFormat("")
            .tickSizeOuter(0));

    svg1.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + xMargin + ", " + yMargin + ")")
        .call(d3.axisLeft(yScale1).tickSizeOuter(0));

    let line = d3.line()
        .x(function(d) {
            return xScale1(d[0]);
        })
        .y(function(d) {
            return yScale1(d[1]);
        });


    function zoomed(event) {
        let xz = event.transform.rescaleX(xScale1);
        x_axis.call(d3.axisBottom(xScale1).scale(xz).tickSizeOuter(0));

        line.x(function(d) {
            return xz(d[0]);
        });
        d3.selectAll(".line").attr("d", function(d) {
            return line(d)
        });

        d3.selectAll(".points").attr("cx", function(d) {
            return xz(d.year)
        })
    }

    const zoom = d3.zoom()
        .scaleExtent([1, 30])
        .extent([[xMargin, 0], [width1 - xMargin, height1]])
        .translateExtent([[xMargin, -Infinity], [width1 - xMargin, Infinity]])
        .on("zoom", zoomed);

    svg1.call(zoom)
        .transition()
        .duration(100)
        .call(zoom.scaleTo, 1);

    let tooltip = d3.select("body")
        .append("div")
        .style("opacity", 0)
        .attr("id", "tooltip")
        .style("background-color", "lightblue")
        .style("border-radius", "7px")
        .style("border", "solid")
        .style("border-color", "darkblue")
        .style("border-width", "2px")
        .style("padding", "5px")
        .style("position", "absolute");

    function hover(event, elem) {
        tooltip.style("left", event.x + 10 + "px")
            .style("top", event.y - 30 + "px")
            .style("opacity", 1)
            .html(elem.fact);

        d3.select(this)
            .attr("r", 5);
    }

    function mouseout() {
        tooltip.style("opacity", 0)
            .style("top", 0)
            .style("left", 0);

        d3.select(this)
            .attr("r", 4);
    }

    container1.append("path")
        .datum(counts)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "cornflowerblue")
        .attr("stroke-width", 3)
        .attr("d", function(d) {
            return line(d)
        });

    container1.selectAll("circle")
        .data(facts)
        .enter()
        .append("circle")
        .attr("class", "points")
        .attr("fill", "darkblue")
        .attr("cx", function(d) {
            return xScale1(d.year);
        })
        .attr("cy", function(d) {
            return yScale1(d.count);
        })
        .attr("r", 4)
        .on("mouseover", hover)
        .on("mouseout", mouseout)
});
</script>

This is the end of the page.