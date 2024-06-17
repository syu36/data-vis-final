let canvasWidth3 = 1100;
let canvasHeight3 = 800;
let width3 = canvasWidth3 - xMargin;
let height3 = canvasHeight3 - yMargin;
let dotSize = 2.5;

// set up svg
let svg3 = d3.select("#scatterplot")
    .append("svg")
    .attr("height", height3)
    .attr("width", width3);

// background
svg3.append("rect")
    .attr("fill", "rgb(240, 240, 240)")
    .attr("width", "100%")
    .attr("height", "100%");

// title
svg3.append("text")
    .attr("class", "title")
    .attr("x", "50%")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(" + 0 + ", " + (yMargin / 2) + ")")
    .text("Rating vs Complexity of Board Games");

// x label
svg3.append("text")
    .attr("class", "label")
    .attr("x", "50%")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(" + 0 + ", " + (height3 - yMargin / 2) + ")")
    .text("Complexity Average");

// y label
svg3.append("text")
    .attr("class", "label")
    .attr("y", "50%")
    .attr("text-anchor", "middle")
    .attr("transform", "translate(" + (-xMargin * 3) + ", " + (height3 / 2) + ") rotate(270)")
    .text("Rating Average")

let xScale = d3.scaleLinear().range([0, width3 - xMargin * 2]);
let yScale = d3.scaleLinear().range([height3 - yMargin * 2, 0]);

// container for grid, so the grid is drawn first
let grid_container = svg3.append("g");

// container for all of the points
let container = svg3.append("g")
    .attr("transform", "translate(" + xMargin + ", " + yMargin + ")");

// make sure we can read numbers properly
let rowConverter = function(d) {
    return {
        name: d["Name"],
        year: d["Year Published"],
        rating: +d["Rating Average"],
        complexity: +d["Complexity Average"],
        mechanics: d["Mechanics"].trim(),

    };
};

d3.csv("bgg_data_mechanics.csv", rowConverter).then(data => {
    // remove outliers with game complexity at 0- complexity scale from 1 to 5
    data = data.filter(d => d.complexity >= 1);
    // default data- remove copies

    // this method is a lot slower
    // let initialData = data.filter((v,i,a)=>a.findIndex(v2=>(v2.name===v.name))===i)

    const initialData = Array.from(new Set(data.map(d => d.name)))
        .map(id => {
            return data.find(d => d.name === id)
        })

    xScale.domain(d3.extent(data, function(d) {
        return d.complexity;
    }));

    yScale.domain(d3.extent(data, function(d) {
        return d.rating;
    }));

    // draw vertical grid lines
    grid_container.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + xMargin + ", " + (height3 - yMargin) + ")")
        .call(d3.axisTop(xScale)
            .tickSize(height3 - yMargin * 2)
            .tickFormat("")
            .tickSizeOuter(0));

    // draw horizontal grid lines
    grid_container.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + xMargin + ", " + yMargin + ")")
        .call(d3.axisRight(yScale)
            .tickSize(width3 - xMargin * 2)
            .tickFormat("")
            .tickSizeOuter(0));


    // draw x axis
    svg3.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + xMargin + ", " + (height3 - yMargin) + ")")
        .call(d3.axisBottom(xScale).tickSizeOuter(0));

    // draw y axis
    svg3.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + xMargin + ", " + yMargin + ")")
        .call(d3.axisLeft(yScale).tickSizeOuter(0));

    // get all of the mechanics from the data to list
    let options = data.map(d => d.mechanics)
        .filter(option => option !== "");

    options = options.filter((option, index) => options.indexOf(option) === index)
        .sort();


    // add a default option
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

    // reference: https://d3-graph-gallery.com/graph/interactivity_tooltip.html#template
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
        tooltip.style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 30 + "px")
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


    let circles = container.selectAll("circle");

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
                    return xScale(d.complexity);
                })
                .attr("cy", function(d) {
                    return yScale(d.rating);
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
                    return xScale(d.complexity);
                })
                .attr("cy", function(d) {
                    return yScale(d.rating);
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