Board games have been around throughout history as a source of entertainment for friends and family.
Today, there are hundreds of thousands of board games. These visualizations will provide some insights into some
of the top games, using data collected from one of the top board game listing/rating websites, BoardGameGeek.

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

    .axis-label {
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
<script src="https://cdnjs.cloudflare.com/ajax/libs/d3-legend/2.25.6/d3-legend.js"></script>

<div id="linechart"></div>
<div id="radar"></div>
<div id="scatter"></div>

Board games have been around and enjoyed for millenia.
The very first board game was quite possibly a dice game from around 5000BC, found at the Başur Höyük burial mound in southeast Turkey.
In Ancient Egypt, Senet (~3000BC) was popular amongst pharaohs.
Other games in ancient times include, but are not limited to Backgammon (~2000BC) from Mesopotamia, Go (~2000BC) from China,
and Hounds and Jackals (~2000BC), also from Ancient Egypt.
This chart shows a history of board game publication counts by year, and has some interesting facts along the timeline.
Hover over a point to learn something!
<script>
let canvasWidth1 = 1200;
let canvasHeight1 = 800;
let xMargin = 100;
let yMargin = 100;
let width1 = canvasWidth1 - xMargin;
let height1 = canvasHeight1 - yMargin;

let svg1 = d3.select("div#linechart")
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
    .attr("class", "axis-label")
    .attr("transform", "translate(" + (width1 / 2) + ", " + (height1 - yMargin / 2) + ")")
    .text("Year");

svg1.append("text")
    .attr("class", "axis-label")
    .attr("transform", "translate(" + (xMargin / 2) + ", " + (height1 / 2) + ") rotate(270)")
    .text("# of Board Games");

let xScale1 = d3.scaleTime().range([xMargin, width1 - xMargin]);
let yScale1 = d3.scaleLinear().range([height1 - yMargin * 2, 0]);

let grid_container1 = svg1.append("g");

svg1.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("x", xMargin)
    .attr("width", width1 - xMargin * 2)
    .attr("height", height1 - yMargin);

let container1 = svg1.append("g")
    .attr("clip-path", "url(#clip)")
    .attr("transform", "translate(" + 0 + ", " + yMargin + ")");

let parseDate1 = d3.timeParse("%Y");

let rowConverter1 = function(d) {
    return {
        year: parseDate1(d["Year Published"]),
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

    xScale1.domain(d3.extent(counts, function(d) {
        return d[0];
    }));

    yScale1.domain([0, d3.max(counts, function(d) {
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
        tooltip.style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 30 + "px")
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
<hr>

Board games fall under many domains, but the most common would have to be strategy and family games.
One of the available functions of being a member of the BoardGameGeek community is to be able to report what games you own. 
Below is a chart showing the kind of board games people own, grouped by the minimum recommended age of those games. 
Makes sense that most family games recommend children of ages 5+ for their games, and it seems interesting 
that many strategy games and thematic games that people own tend to be for ages 12 and up.
<script>
let canvasWidth2 = 1200;
let canvasHeight2 = 1200;
let width2 = canvasWidth2 - xMargin;
let height2 = canvasHeight2 - yMargin;

let svg2 = d3.select("div#radar").append("svg")
    .attr("width", width2)
    .attr("height", height2);

svg2.append("rect")
    .attr("fill", "rgb(240, 240, 240)")
    .attr("width", "100%")
    .attr("height", "100%");

svg2.append("text")
    .attr("class", "title")
    .attr("transform", "translate(" + (width2 / 2) + ", " + yMargin / 2 + ")")
    .text("Number of Games Owned by the BGG Community");

let radialScale = d3.scaleLinear()
    .range([0, 250]);

let colorScale = d3.scaleOrdinal()
    .range(["darkorange", "gray", "navy"]);

let rowConverter2 = function(d) {
    return {
        num_owned: +d["Owned Users"],
        domain: d["Domains"].trim(),
        age: +d["Min Age"]
    };
};

d3.csv("bgg_data_domains.csv", rowConverter2).then(data => {
    let groupedData = d3.flatRollup(data, v => d3.sum(v, d => d.num_owned), d => {
        if (d.age >= 0 && d.age <= 5) {
            return "0-5";
        } else if (d.age >= 6 && d.age <= 11) {
            return "6-11";
        } else {
            return "12+";
        }
    }, d => d.domain);

    colorScale.domain(["12+", "6-11", "0-5"]);

    groupedData = groupedData.filter(item => item[1] !== "");

    groupedData = groupedData.sort(function(a, b) {
        const nameA = a[1].toUpperCase();
        const nameB = b[1].toUpperCase();
        if (nameA < nameB) {
            return 1;
        }
        if (nameA > nameB) {
            return -1;
        }
        return 0;
    });

    let ageGroupedData = d3.groups(groupedData, d => d[0]);

    let features = ageGroupedData[0][1].map(d => d[1]);

    let ticks = [1600000, 3200000, 4800000, 6400000, 8000000];
    radialScale.domain([0, 8000000]);

    ticks.forEach(t =>
        svg2.append("circle")
            .attr("cx", width2 / 2)
            .attr("cy", height2 / 2)
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("r", radialScale(t))
    );

    ticks.forEach(t =>
        svg2.append("text")
            .attr("class", "num-label")
            .attr("x", width2 / 2 + 5)
            .attr("y", width2 / 2 - radialScale(t))
            .text(t.toString())
    );

    function angleToCoordinate(angle, value) {
        let x = Math.cos(angle) * radialScale(value);
        let y = Math.sin(angle) * radialScale(value);
        return {"x": width2 / 2 + x, "y": width2 / 2 - y};
    }

    for (let i = 0; i < features.length; i++) {
        let ftName = features[i];
        let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        let lineCoordinate = angleToCoordinate(angle, 8000000);
        let labelCoordinate = angleToCoordinate(angle, 9550000);

        svg2.append("line")
            .attr("x1", width2 / 2)
            .attr("y1", width2 / 2)
            .attr("x2", lineCoordinate.x)
            .attr("y2", lineCoordinate.y)
            .attr("stroke", "black");

        svg2.append("text")
            .attr("class", "radar-label")
            .attr("x", labelCoordinate.x)
            .attr("y", labelCoordinate.y)
            .text(ftName);
    }

    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);

    function getPathCoordinates(dataPoint) {
        let coordinates = [];
        for (let i = 0; i < features.length; i++) {
            let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
            coordinates.push(angleToCoordinate(angle, dataPoint[1][i][2]))
        }
        return coordinates;
    }

    for (let i = 0; i < ageGroupedData.length; i++) {
        let d = ageGroupedData[i];
        let color = colorScale(ageGroupedData[i][0]);
        let coordinates = getPathCoordinates(d);

        svg2.append("path")
            .datum(coordinates)
            .attr("d", line)
            .attr("stroke-width", 3)
            .attr("stroke", color)
            .attr("fill", color)
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.5);
    }

    svg2.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(20," + yMargin + ")");

    let legendOrdinal = d3.legendColor()
        .title("Minimum Recommend Age of Game")
        .scale(colorScale);

    svg2.select(".legendOrdinal")
        .call(legendOrdinal);
})
</script>
<hr>

Is the difficulty of learning and playing a board game linked in any way to the overall rating of a board game? 
This chart seems to show a very slight trend in which complexity might have a positive effect on rating, but it's nothing conclusive. 
Still, it's interesting to be able to filter through the mechanics of the games and check if there might be some correlation within 
a single mechanic group. Hover over a point to see the name of the game as well as the year it was published.
<script>
let canvasWidth = 1200;
let canvasHeight = 800;
let width = canvasWidth - xMargin;
let height = canvasHeight - yMargin;
let dotSize = 2.5;

let svg3 = d3.select("div#scatter")
    .append("svg")
    .attr("height", height)
    .attr("width", width);

svg3.append("rect")
    .attr("fill", "rgb(240, 240, 240)")
    .attr("width", "100%")
    .attr("height", "100%");

svg3.append("text")
    .attr("class", "title")
    .attr("transform", "translate(" + (width / 2) + ", " + (yMargin / 2) + ")")
    .text("Rating vs Complexity of Board Games");

svg3.append("text")
    .attr("class", "axis-label")
    .attr("transform", "translate(" + (width / 2) + ", " + (height - yMargin / 2) + ")")
    .text("Complexity Average");

svg3.append("text")
    .attr("class", "axis-label")
    .attr("transform", "translate(" + (xMargin / 2) + ", " + (height / 2) + ") rotate(270)")
    .text("Rating Average");

let xScale3 = d3.scaleLinear().range([0, width - xMargin * 2]);
let yScale3 = d3.scaleLinear().range([height - yMargin * 2, 0]);

let grid_container3 = svg3.append("g");

let container3 = svg3.append("g")
    .attr("transform", "translate(" + xMargin + ", " + yMargin + ")");

let rowConverter3 = function(d) {
    return {
        name: d["Name"],
        year: d["Year Published"],
        rating: +d["Rating Average"],
        complexity: +d["Complexity Average"],
        mechanics: d["Mechanics"].trim(),
    };
};

d3.csv("bgg_data_mechanics.csv", rowConverter3).then(data => {
    data = data.filter(d => d.complexity >= 1);

    const initialData = Array.from(new Set(data.map(d => d.name)))
        .map(id => {
            return data.find(d => d.name === id)
        });

    xScale3.domain(d3.extent(data, function(d) {
        return d.complexity;
    }));

    yScale3.domain(d3.extent(data, function(d) {
        return d.rating;
    }));
    
    grid_container3.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + xMargin + ", " + (height - yMargin) + ")")
        .call(d3.axisTop(xScale3)
            .tickSize(height - yMargin * 2)
            .tickFormat("")
            .tickSizeOuter(0));
    
    grid_container3.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + xMargin + ", " + yMargin + ")")
        .call(d3.axisRight(yScale3)
            .tickSize(width - xMargin * 2)
            .tickFormat("")
            .tickSizeOuter(0));

    
    svg3.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + xMargin + ", " + (height - yMargin) + ")")
        .call(d3.axisBottom(xScale3).tickSizeOuter(0));
    
    svg3.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + xMargin + ", " + yMargin + ")")
        .call(d3.axisLeft(yScale3).tickSizeOuter(0));

    let options = data.map(d => d.mechanics)
        .filter(option => option !== "");

    options = options.filter((option, index) => options.indexOf(option) === index)
        .sort();

    d3.select("#selectButton")
        .append('option')
        .text("Game Mechanic")
        .attr("value", "Game Mechanic");

    d3.select("#selectButton")
        .selectAll('myOptions')
        .data(options)
        .enter()
        .append('option')
        .text(function(d) {
            return d;
        })
        .attr("value", function(d) {
            return d;
        });
    
    let tooltip = d3.select("body")
        .append("div")
        .style("opacity", 0)
        .style("background-color", "lightblue")
        .style("border-radius", "7px")
        .style("border", "solid")
        .style("border-color", "darkblue")
        .style("border-width", "2px")
        .style("padding", "5px")
        .style("position", "absolute");


    function hover(event, elem) {
        tooltip.style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 30 + "px")
            .style("opacity", 1)
            .html(elem.name + "<br>Published " + elem.year);

        d3.select(this)
            .attr("r", 3);
    }

    function mouseout() {
        tooltip.style("opacity", 0)
            .style("top", 0)
            .style("left", 0);

        d3.select(this)
            .attr("r", dotSize);
    }


    let circles = container3.selectAll("circle");

    function update(selectedGroup) {
        if (selectedGroup !== "Game Mechanic") {
            let dataFilter = data.filter(function(d) {
                return d.mechanics === selectedGroup;
            });

            circles = circles
                .data(dataFilter)
                .join("circle")
                .on("mouseover", hover)
                .on("mouseout", mouseout);

            circles
                .transition()
                .duration(1000)
                .attr("fill", "steelblue")
                .attr("cx", function(d) {
                    return xScale3(d.complexity);
                })
                .attr("cy", function(d) {
                    return yScale3(d.rating);
                })
                .attr("r", dotSize)

        } else {
            circles = circles.data(initialData)
                .join('circle')
                .on("mouseover", hover)
                .on("mouseout", mouseout);

            circles
                .transition()
                .duration(0)
                .attr("fill", "steelblue")
                .attr("cx", function(d) {
                    return xScale3(d.complexity);
                })
                .attr("cy", function(d) {
                    return yScale3(d.rating);
                })
                .attr("r", dotSize)
        }
    }

    update("Game Mechanic");

    d3.select("#selectButton").on("change", function(d) {
        let selectedOption = d3.select(this).property("value");
        update(selectedOption)
    })
});
</script>
<select id="selectButton"></select>
<hr>