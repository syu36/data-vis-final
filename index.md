# A Look Into Board Games

### Stephen Yu

Board games have been around throughout history as a source of entertainment for friends and family.
Today, there are hundreds of thousands of board games. These visualizations will provide some insights into some
of the top games, using data collected from one of the top board game listing/rating websites, Board Game Geek.

[Alpha Release](docs/Alpha%20Release.pdf)  
[Line Chart](linechart.html)  
[Scatterplot](scatterplot.html)  
[Radar Chart](radar.html)

<style>
div.linechart {
  font-family: "Trebuchet MS", sans-serif;
}

.axis text {
    font-family: "Trebuchet MS", sans-serif;
    font-size: 12px;
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

.title {
    font-size: 28px;
    font-family: "Trebuchet MS", sans-serif;
    text-anchor: middle;
    alignment-baseline: middle;
}
</style>
<script src="https://d3js.org/d3.v7.min.js"></script>

<div id="linechart"></div>
<div id="scatterplot"></div>
<div id="radarchart"></div>

<script>
    let canvasWidth = 1200;
    let canvasHeight = 800;
    let xMargin = 100;
    let yMargin = 100;
    let width = canvasWidth - xMargin;
    let height = canvasHeight - yMargin;

    let svg = d3.select("div#linechart")
        .append("svg")
        .attr("height", height)
        .attr("width", width);

    svg.append("rect")
        .attr("fill", "rgb(240, 240, 240)")
        .attr("width", "100%")
        .attr("height", "100%");

    svg.append("text")
        .attr("class", "title")
        .attr("transform", "translate(" + (width / 2) + ", " + (yMargin / 2) + ")")
        .text("Board Games Published Over Time");

    svg.append("text")
        .attr("class", "label")
        .attr("transform", "translate(" + (width / 2) + ", " + (height - yMargin / 2) + ")")
        .text("Year");

    svg.append("text")
        .attr("class", "label")
        .attr("transform", "translate(" + (xMargin / 2) + ", " + (height / 2) + ") rotate(270)")
        .text("# of Board Games");

    let xScale = d3.scaleTime().range([0, width - xMargin * 2]);
    let yScale = d3.scaleLinear().range([height - yMargin * 2, 0]);

    let grid_container = svg.append("g");

    let container = svg.append("g")
        .attr("transform", "translate(" + xMargin + ", " + yMargin + ")");

    let parseDate = d3.timeParse("%Y");

    let rowConverter = function(d) {
        return {
            year: parseDate(d["Year Published"]),
        };
    };

    d3.csv("BGG_Data_Set.csv", rowConverter).then(data => {
        data = data.filter(data => data.year !== null);
        let counts = d3.rollups(data, v => d3.count(v, d => d.year), d => d.year);
        counts = counts.sort((a, b) => a[0] - b[0]);

        counts.shift();

        counts.pop();

        xScale.domain(d3.extent(counts, function(d) {
            return d[0];
        }));

        yScale.domain([0, d3.max(counts, function(d) {
            return d[1];
        })]);

        container.append("path")
            .datum(counts)
            .attr("fill", "none")
            .attr("stroke", "cornflowerblue")
            .attr("stroke-width", 3)
            .attr("d", d3.line()
                .x(function(d) {
                    return xScale(d[0]);
                })
                .y(function(d) {
                    return yScale(d[1]);
                }));

        grid_container.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(" + xMargin + ", " + yMargin + ")")
            .call(d3.axisRight(yScale)
                .tickSize(width - xMargin * 2)
                .tickFormat("")
                .tickSizeOuter(0));

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + xMargin + ", " + (height - yMargin) + ")")
            .call(d3.axisBottom(xScale).tickSizeOuter(0)
                .ticks(d3.timeYear.every(100)));

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + xMargin + ", " + yMargin + ")")
            .call(d3.axisLeft(yScale).tickSizeOuter(0));
    });
</script>



This is the end of the page.