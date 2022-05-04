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