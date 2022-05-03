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

<script>
    let width = 800;
    let height = 800;

    let svg = d3.select("div#radarchart").append("svg")
        .attr("width", width)
        .attr("height", height);

    svg.append("text")
        .attr("transform", "translate(" + (width / 7) + ", 20)")
        .text("Number of Games Owned by Domain and Minimum Age Recommendation");

    let radialScale = d3.scaleLinear()
        .range([0, 250]);

    let rowConverter = function(d) {
        return {
            num_owned: +d["Owned Users"],
            domain: d["Domains"].trim(),
            age: +d["Min Age"]
        };
    };

    d3.csv("bgg_data_domains.csv", rowConverter).then(data => {
        let groupedData = d3.flatRollup(data, v => d3.sum(v, d => d.num_owned), d => {
            if (d.age >= 0 && d.age <= 5) {
                return "0-5";
            } else if (d.age >= 6 && d.age <= 11) {
                return "6-11";
            } else {
                return "12+";
            }
        }, d => d.domain);

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
            svg.append("circle")
                .attr("cx", 350)
                .attr("cy", 350)
                .attr("fill", "none")
                .attr("stroke", "gray")
                .attr("r", radialScale(t))
        );

        ticks.forEach(t =>
            svg.append("text")
                .attr("class", "num-label")
                .attr("x", 355)
                .attr("y", 350 - radialScale(t))
                .text(t.toString())
        );

        function angleToCoordinate(angle, value) {
            let x = Math.cos(angle) * radialScale(value);
            let y = Math.sin(angle) * radialScale(value);
            return {"x": 350 + x, "y": 350 - y};
        }

        for (let i = 0; i < features.length; i++) {
            let ftName = features[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
            let lineCoordinate = angleToCoordinate(angle, 8000000);
            let labelCoordinate = angleToCoordinate(angle, 9550000);

            svg.append("line")
                .attr("x1", 350)
                .attr("y1", 350)
                .attr("x2", lineCoordinate.x)
                .attr("y2", lineCoordinate.y)
                .attr("stroke", "black");

            svg.append("text")
                .attr("class", "label")
                .attr("x", labelCoordinate.x)
                .attr("y", labelCoordinate.y)
                .text(ftName);
        }

        let line = d3.line()
            .x(d => d.x)
            .y(d => d.y);

        let colors = ["darkorange", "gray", "navy"];

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
            let color = colors[i];
            let coordinates = getPathCoordinates(d);

            svg.append("path")
                .datum(coordinates)
                .attr("d", line)
                .attr("stroke-width", 3)
                .attr("stroke", color)
                .attr("fill", color)
                .attr("stroke-opacity", 1)
                .attr("opacity", 0.5)
        }
    })
</script>

<script>
    let canvasWidth = 1300;
    let canvasHeight = 800;
    let xMargin = 100;
    let yMargin = 100;
    let width = canvasWidth - xMargin;
    let height = canvasHeight - yMargin;
    let dotSize = 2;

    let svg = d3.select("div#scatterplot")
        .append("svg")
        .attr("height", height)
        .attr("width", width + xMargin);

    svg.append("text")
        .attr("class", "title")
        .attr("transform", "translate(" + (width / 2) + ", " + (yMargin / 2) + ")")
        .text("Rating vs Complexity of Board Games");

    svg.append("text")
        .attr("class", "label")
        .attr("transform", "translate(" + (width / 2) + ", " + (height - yMargin / 2) + ")")
        .text("Complexity Average");

    svg.append("text")
        .attr("class", "label")
        .attr("transform", "translate(" + (xMargin / 2) + ", " + (height / 2) + ") rotate(270)")
        .text("Rating Average");

    let xScale = d3.scaleLinear().range([0, width - xMargin * 2]);
    let yScale = d3.scaleLinear().range([height - yMargin * 2, 0]);

    let grid_container = svg.append("g");

    let container = svg.append("g")
        .attr("transform", "translate(" + xMargin + ", " + yMargin + ")");

    let parseDate = d3.timeParse("%Y");

    let rowConverter = function(d) {
        return {
            name: d["Name"],
            rating: +d["Rating Average"],
            complexity: +d["Complexity Average"],
            mechanics: d["Mechanics"].trim(),

        };
    };

    d3.csv("bgg_data_mechanics.csv", rowConverter).then(data => {
        data = data.filter(d => d.complexity >= 1);

        const initialData = Array.from(new Set(data.map(d => d.name)))
            .map(id => {
                return data.find(d => d.name === id)
            });

        xScale.domain(d3.extent(data, function(d) {
            return d.complexity;
        }));

        yScale.domain(d3.extent(data, function(d) {
            return d.rating;
        }));

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


        let circles = container.selectAll("circle");

        function update(selectedGroup) {
            if (selectedGroup !== "Game Mechanic") {
                let dataFilter = data.filter(function(d) {
                    return d.mechanics === selectedGroup;
                });

                circles = circles
                    .data(dataFilter)
                    .join("circle");

                circles
                    .transition()
                    .duration(1000)
                    .attr("fill", "steelblue")
                    .attr("cx", function(d) {
                        return xScale(d.complexity);
                    })
                    .attr("cy", function(d) {
                        return yScale(d.rating);
                    })
                    .attr("r", dotSize)

            } else {
                circles = circles.data(initialData)
                    .join('circle');

                circles
                    .transition()
                    .duration(0)
                    .attr("fill", "steelblue")
                    .attr("cx", function(d) {
                        return xScale(d.complexity);
                    })
                    .attr("cy", function(d) {
                        return yScale(d.rating);
                    })
                    .attr("r", dotSize);
            }
        }

        update("Game Mechanic");

        d3.select("#selectButton").on("change", function(d) {
            let selectedOption = d3.select(this).property("value");
            update(selectedOption);
        });

        grid_container.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(" + xMargin + ", " + (height - yMargin) + ")")
            .call(d3.axisTop(xScale)
                .tickSize(height - yMargin * 2)
                .tickFormat("")
                .tickSizeOuter(0));

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
            .call(d3.axisBottom(xScale).tickSizeOuter(0));

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + xMargin + ", " + yMargin + ")")
            .call(d3.axisLeft(yScale).tickSizeOuter(0));
    });
</script>

This is the end of the page.