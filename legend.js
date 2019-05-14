var legendWidth = 1000, legendHeight = 150,
    legendMargin = {top: 10, right: 10, bottom: 10, left: 10},
    legendConntentWidth = legendWidth - legendMargin.left - legendMargin.right,
    legendContentHeight = legendHeight - legendMargin.top - legendMargin.bottom;

var legendSvg = d3.select("#legend-chart").append("svg").attr("width", legendConntentWidth).attr("height", legendContentHeight),
    legendG = legendSvg.append("g").attr("transform", "translate(" + legendMargin.left + "," + legendMargin.top + ")");

var legendisClicked = false;

var legendGenres = [];

function drawLegend() {

    legendGenres = topGenres20.map(g => g.genre).slice(0, 19);
    legendGenres.push("Others");

    var rectHeight = 13, rectWidth = 80;
    // var textX = rectWidth/2;

    legendG.append("g")
        .attr("class", "legend")
        .selectAll("rect")
        .data(legendGenres)
        .enter()
        .append("rect")
        // .attr("id",d=>{return "legendRect"+d;})
        .attr("x", (d, i) => {
            if (i < 10) return i * rectWidth;
            else return (i - 10) * rectWidth;
        })
        .attr("y", (d, i) => (i < 10) ? 0 : rectHeight * 2 + 30)
        .attr("width", rectWidth).attr("height", rectHeight)
        .style("fill", d => colorByTop20Genres(d))
        .on("mouseover", d => {
            legendMouseOver(d)
        })
        .on("mouseout", legendMouseOut)
        .on("click", d => {
            legendClick(d)
        })

    legendG.append("g")
        .attr("class", "legend")
        .selectAll("text")
        .data(legendGenres)
        .enter()
        .append("text")
        // .attr("id",d=>{return "legendText"+d;})
        .style("text-anchor", "middle")
        .style("font", "12px times")
        .attr("x", (d, i) => {
            if (i < 10) return i * rectWidth + rectWidth / 2;
            else return (i - 10) * rectWidth + rectWidth / 2;
        })
        .attr("y", (d, i) => (i < 10) ? rectHeight + 15 : (rectHeight + 30) * 2)
        .text(d => d)
        .on("mouseover", d => {
            legendMouseOver(d)
        })
        .on("mouseout", legendMouseOut)
        .on("click", d => {
            legendClick(d)
        })
}

function legendMouseOver(gen) {
    // legendGenres.forEach(d=>{
    //
    //     if(d != gen) {
    //         d3.select("#legendRect"+d).style("opacity","0.3");
    //         d3.select("#legendText"+d).style("opacity","0.3");
    //     }
    // });

    // foreground.style("opacity","0.5");
    var selected = [];
    foreground.style("display", function(d) {
        if(d.genre == gen){
            selected.push(d);
            return null;
        }
        return"none"});
    Draw_Scatterplot(selected);
}

function legendMouseOut() {
    if (!legendisClicked) {
        var selected = [];
        // foreground.style("opacity",minForegroundOpacity);
        foreground.style("display", d=>{
            selected.push(d);
            return null});


        Draw_Scatterplot(selected);

        // legendG.style("opacity","1");
        // legendGenres.forEach(d=>{
        //     d3.select("#legendRect"+d).style("opacity","1");
        //     d3.select("#legendText"+d).style("opacity","1");
        //
        // })
    }
}

function legendClick(gen) {
    if (legendisClicked)
        foreground.style("display", null);
    else
        legendMouseOver(gen);
    legendisClicked = !legendisClicked;
}












