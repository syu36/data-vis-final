let dotSize = 2.5;

let svg3 = d3.select("body")
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
    .attr("class", "label")
    .attr("transform", "translate(" + (width / 2) + ", " + (height - yMargin / 2) + ")")
    .text("Complexity Average");

svg3.append("text")
    .attr("class", "label")
    .attr("transform", "translate(" + (xMargin / 2) + ", " + (height / 2) + ") rotate(270)")
    .text("Rating Average")

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
        })

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
        .attr("value", "Game Mechanic")

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
        })

    let tooltip = d3.select("body")
        .append("div")
        .style("opacity", 0)
        .style("background-color", "lightblue")
        .style("border-radius", "7px")
        .style("border", "solid")
        .style("border-color", "darkblue")
        .style("border-width", "2px")
        .style("padding", "5px")
        .style("position", "absolute")


    function hover(event, elem) {
        tooltip.style("left", event.x + 5 + "px")
            .style("top", event.y - 30 + "px")
            .style("opacity", 1)
            .html(elem.name + "<br>Published " + elem.year)

        d3.select(this)
            .attr("r", 3)
    }

    function mouseout() {
        tooltip.style("opacity", 0)
            .style("top", 0)
            .style("left", 0)

        d3.select(this)
            .attr("r", dotSize)
    }


    let circles = container3.selectAll("circle");

    function update(selectedGroup) {
        if (selectedGroup !== "Game Mechanic") {
            let dataFilter = data.filter(function(d) {
                return d.mechanics === selectedGroup;
            })

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

    update("Game Mechanic")

    d3.select("#selectButton").on("change", function(d) {
        let selectedOption = d3.select(this).property("value")
        update(selectedOption)
    })
});