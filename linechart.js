let canvasWidth = 1200;
let canvasHeight = 800;
let xMargin = 100;
let yMargin = 100;
let width = canvasWidth - xMargin;
let height = canvasHeight - yMargin;

// set up svg
let svg = d3.select("body")
    .append("svg")
    .attr("height", height)
    .attr("width", width);

// background
svg.append("rect")
    .attr("fill", "rgb(240, 240, 240)")
    .attr("width", "100%")
    .attr("height", "100%");

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

let xScale = d3.scaleTime().range([xMargin, width - xMargin]);
let yScale = d3.scaleLinear().range([height - yMargin * 2, 0]);

// container for grid, so the grid is drawn first
let grid_container = svg.append("g");

// a zoom fix from: https://stackoverflow.com/questions/54828487/how-do-i-make-sure-the-zoom-doesnt-go-below-zero-and-avoid-the-zoomed-points-to
svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", xMargin)
    .attr("width", width - xMargin * 2)
    .attr("height", height - yMargin)

// container for all of the points
let container = svg.append("g")
    .attr("clip-path", "url(#clip)")
    .attr("transform", "translate(" + 0 + ", " + yMargin + ")");


let parseDate = d3.timeParse("%Y");

// make sure we can read numbers properly
let rowConverter = function(d) {
    return {
        year: parseDate(d["Year Published"]),
    };
};

let rowConverterFacts = function(d) {
    return {
        year: parseDate(d["Year"]),
        fact: d["Fact"]
    }
}

let facts;
d3.csv("board_game_facts.csv", rowConverterFacts).then(data => {
    facts = data;
});

d3.csv("BGG_Data_Set.csv", rowConverter).then(data => {
    data = data.filter(data => data.year !== null)
    // get averages
    let counts = d3.rollups(data, v => d3.count(v, d => d.year), d => d.year);
    console.log(counts)
    // sort array by year (asc)
    counts = counts.sort((a, b) => a[0] - b[0]);

    // need to compare data and add count to facts to properly position dot on y axis
    counts.forEach(count => {
        facts.forEach(fact => {
            if (count[0].toString() === fact.year.toString()) {
                console.log(true)
                fact.count = count[1]
            }
        })
    })

    console.log(facts)

    // year 0 is an outlier
    counts.shift()

    // 2022 isn't a complete year, so exclude as an outlier- more games to be published and rated eventually
    counts.pop()

    xScale.domain(d3.extent(counts, function(d) {
        return d[0];
    }));

    yScale.domain([0, d3.max(counts, function(d) {
        return d[1];
    }) + 50]);

    // draw x axis
    let x_axis = svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + 0 + ", " + (height - yMargin) + ")")
        .call(d3.axisBottom(xScale).tickSizeOuter(0)
            .ticks(d3.timeYear.every(100)));

    // draw horizontal grid lines
    grid_container.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + xMargin + ", " + yMargin + ")")
        .call(d3.axisRight(yScale)
            .tickSize(width - xMargin * 2)
            .tickFormat("")
            .tickSizeOuter(0));

    // draw y axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + xMargin + ", " + yMargin + ")")
        .call(d3.axisLeft(yScale).tickSizeOuter(0));

    let line = d3.line()
        .x(function(d) {
            // console.log(d[0])
            return xScale(d[0]);
        })
        .y(function(d) {
            return yScale(d[1]);
        });


    function zoomed(event) {
        // create new scale based off of zoom event using old x scale
        let xz = event.transform.rescaleX(xScale);
        // change scale of x axis
        x_axis.call(d3.axisBottom(xScale).scale(xz).tickSizeOuter(0));
        // update our line function to scale based on zoom
        line.x(function(d) {
            return xz(d[0]);
        });
        // // change line path to reflect scaled values with our line generator
        d3.selectAll(".line").attr("d", function(d) {
            return line(d)
        });

        d3.selectAll(".points").attr("cx", function(d) {
            return xz(d.year)
        })
    }

    const zoom = d3.zoom()
        .scaleExtent([1, 30])
        .extent([[xMargin, 0], [width - xMargin, height]])
        .translateExtent([[xMargin, -Infinity], [width - xMargin, Infinity]])
        .on("zoom", zoomed);

    svg.call(zoom)
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
        .style("position", "absolute")


    function hover(event, elem) {
        tooltip.style("left", event.x + 10 + "px")
            .style("top", event.y - 30 + "px")
            .style("opacity", 1)
            .html(elem.fact)

        d3.select(this)
            .attr("r", 5)
    }

    function mouseout() {
        tooltip.style("opacity", 0)
            .style("top", 0)
            .style("left", 0)

        d3.select(this)
            .attr("r", 4)
    }


    // draw line. reference: https://www.d3-graph-gallery.com/graph/line_basic.html
    container.append("path")
        .datum(counts)
        .attr("class", "line")
        .attr("fill", "none")
        .attr("stroke", "cornflowerblue")
        .attr("stroke-width", 3)
        .attr("d", function(d) {
            return line(d)
        });

    // draw fun fact points
    // sources: https://en.wikipedia.org/wiki/Board_game#History
    // https://boardgamesland.com/the-complete-history-of-board-games/
    // https://diceygoblin.com/the-full-history-of-board-games/
    container.selectAll("circle")
        .data(facts)
        .enter()
        .append("circle")
        .attr("class", "points")
        .attr("fill", "darkblue")
        .attr("cx", function(d) {
            return xScale(d.year);
        })
        .attr("cy", function(d) {
            return yScale(d.count);
        })
        .attr("r", 4)
        .on("mouseover", hover)
        .on("mouseout", mouseout)
});