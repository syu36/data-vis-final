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

<script src="linechart.js"></script>
<script src="radar.js"></script>



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