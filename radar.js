let canvasWidth2 = 1200;
let canvasHeight2 = 1200;
let width2 = canvasWidth2 - xMargin;
let height2 = canvasHeight2 - yMargin;

let svg2 = d3.select("body").append("svg")
    .attr("width", width2)
    .attr("height", height2);

svg2.append("rect")
    .attr("fill", "rgb(240, 240, 240)")
    .attr("width", "100%")
    .attr("height", "100%");

svg2.append("text")
    .attr("class", "title")
    .attr("transform", "translate(" + (width2 / 2) + ", " + yMargin / 2 + ")")
    .text("Number of Games Owned by the BGG Community")

let radialScale = d3.scaleLinear()
    .range([0, 250]);

let colorScale = d3.scaleOrdinal()
    .range(["darkorange", "gray", "navy"])

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
    }, d => d.domain)

    colorScale.domain(["12+", "6-11", "0-5"])

    groupedData = groupedData.filter(item => item[1] !== "")

    groupedData = groupedData.sort(function(a, b) {
        const nameA = a[1].toUpperCase()
        const nameB = b[1].toUpperCase()
        if (nameA < nameB) {
            return 1;
        }
        if (nameA > nameB) {
            return -1;
        }
        return 0;
    });

    let ageGroupedData = d3.groups(groupedData, d => d[0])

    let features = ageGroupedData[0][1].map(d => d[1])

    let ticks = [1600000, 3200000, 4800000, 6400000, 8000000];
    radialScale.domain([0, 8000000]);

    ticks.forEach(t =>
        svg2.append("circle")
            .attr("cx", width2 / 2)
            .attr("cy", height2 / 2)
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("r", radialScale(t))
    )

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
            .text(ftName)
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
        let coordinates = getPathCoordinates(d)

        svg2.append("path")
            .datum(coordinates)
            .attr("d", line)
            .attr("stroke-width", 3)
            .attr("stroke", color)
            .attr("fill", color)
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.5)
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