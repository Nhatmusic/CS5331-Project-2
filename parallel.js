// console.log('1111111111');

// Info to show visualization
var parallelWidth = 900, parallelHeight = 600,
    parallelMargin = {top: 30, right: 20, bottom: 30, left: 30},
    parallelContentWidth = parallelWidth - parallelMargin.left - parallelMargin.right,
    parallelContentHeight = parallelHeight - parallelMargin.top - parallelMargin.bottom;

//Time Format and Parsing
const parseTime = d3.timeParse("%m/%d/%Y %H:%M");
const formatYear = d3.timeFormat("%Y");

var parallelSvg = d3.select("#chart-area").append("svg").attr("width",parallelWidth+60).attr("height",parallelHeight),
    g = parallelSvg.append("g").attr("transform","translate("+parallelMargin.left+","+parallelMargin.top+")"),
    titleGroup = parallelSvg.append("g").attr("transform","translate("+(parallelContentHeight/2+15)+","+(parallelMargin.top-15)+")");

// x, y, and color Scale
var xScale = d3.scalePoint().range([0,parallelContentWidth]),
    yScale = {},
    color = d3.scaleOrdinal().range(d3.schemeCategory20);

// axises definition
var xAxis = d3.axisBottom(xScale),
    yAxis = d3.axisLeft(yScale).ticks(5);


// Axis Group
var xAxisGroup;

// Define line
var line = d3.line(),
    //Background and foreground line
    foreground;

//drag object
var dragging = {};

let features = [];
// console.log('44444444');
var selectedGenres=[];
var genres = [];
var genresByYear = {};
// var genresCount = [];
let data = [];
d3.csv("dataset/dataset_full(optimal).csv",function (error, songs) {
    // console.log('222222222');
    // get features that used for mutlti-dimension coordinates
    features = songs.columns.slice(1, 13);
    features.splice(8,3);
    xScale.domain(features);


    // Doing Time Slider
    // Time
    songs.forEach(d=>{
        var year = d.tracks_track_date_created = formatYear(parseTime(d.tracks_track_date_created));
        features.forEach(feature=>{
            if (feature != "genre")
                d[feature] = +d[feature];
        });
        var gen = d["genre"];
        // Create new element in genres count if the element is in first appears.
        if(!genres.includes(gen)) {
            genres.push(gen);
            // genresCount.push(1);
        }
        // // or else increase count for that genres by 1
        // else {
        //     genresCount[genres.indexOf(gen)]++;
        // }
        //
        //Add genres by each year
        if(!genresByYear.hasOwnProperty(year)) {
            genresByYear[year] = [];
            genresByYear[year].push(d.genre);
        }
        else {
            if (!genresByYear[year].includes(d.genre))
                genresByYear[year].push(d.genre);
        }
    });

    data = songs;
    // console.log(genresByYear["2008"]);
    // console.log(genresCount);
    drawSlider();


    graphByYear(data,sliderTime.value());

    document.getElementById("genreContainer").style.display = "none";

});

function drawSlider() {
    var timeRange = d3.extent(data,d=>{return d.tracks_track_date_created});
    var dataTime = d3.range(Number(timeRange[0]),Number(timeRange[1])+1).map(d=>{
        // console.log(d);
        return d;
    });


    sliderTime = d3.sliderBottom()
        .min(timeRange[0])
        .max(timeRange[1])
        .step(1)
        .width(300)
        .tickFormat(d3.format(".0f"))
        .tickValues(dataTime)
        .default(dataTime[4])
        .on('onchange', val => {
            d3.select('p#value-time').text((val));
            graphByYear(data,sliderTime.value());
        });

    var gTime = d3
        .select('#slider-time')
        .append('svg')
        .attr("id","slider")
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gTime.call(sliderTime);

    d3.select('p#value-time').text((sliderTime.value()));
}

function resetAll() {
    d3.select("svg#slider").remove();
    drawSlider();
    graphByYear(data,sliderTime.value());
    addCheckBoxes(genres);
    document.getElementById("slider").style.display = "block";
    document.getElementById("genreContainer").style.display = "none";
}

function chooseOption() {
    var yearChart = document.getElementById("slider"),
        genreChart = document.getElementById("genreContainer"),
        yearChoice = document.getElementById("year"),
        genreChoice = document.getElementById("genre")

    if(yearChoice.checked) {
        yearChart.style.display = "block";
        genreChart.style.display = "none";
        graphByYear(data,sliderTime.value());

    }

    if(genreChoice.checked){
        // Add check boxes of genres
        addCheckBoxes(genres);
        graphByGenre();
        yearChart.style.display = "none";
        genreChart.style.display = "block";

    }
}

function graphByGenre() {
    var selectedSongs=[];
    genres.forEach(d=>{
        var genChecked = document.getElementById(d);


        if(genChecked.checked && !selectedGenres.includes(d))
            selectedGenres.push(d);
        else if (!genChecked.checked && selectedGenres.includes(d))
            selectedGenres.splice(selectedGenres.indexOf(d),1);
    });
    selectedGenres.forEach(gen=>{
        data.forEach(song=>{
            if(song.genre === gen)
                selectedSongs.push(song);
        })
    });
    drawGraph(selectedSongs,0,selectedGenres);
    console.log(selectedGenres);
}
function addCheckBoxes(array) {
    // console.log(array);
    var genreContainer = document.getElementById("genreContainer");
    array.forEach((d,i)=>{
        //Add if checkbox not show
        if(document.getElementById(d)==null) {
            let checkbox = document.createElement('input');
            checkbox.type = "checkbox";
            checkbox.name = d;
            checkbox.value = d;
            checkbox.id = d;
            checkbox.onclick = graphByGenre;

            var label = document.createElement('label')
            label.htmlFor = d;
            label.appendChild(document.createTextNode(d));

            genreContainer.appendChild(checkbox);
            genreContainer.appendChild(label);
            genreContainer.appendChild(document.createElement("br"));
        }

        // Set default check box
        let checkbox = document.getElementById(d);
        if(i===0) checkbox.checked = true;
        else checkbox.checked = false;
    })
}

function graphByYear(songs, year) {
    var selectedSongs = [];
    songs.forEach(d=>{
        if(d.tracks_track_date_created == year)
            selectedSongs.push(d);
    });
    drawGraph(selectedSongs,year,null);
}

const maxForegroundOpacity = "1";
const minForegroundOpacity = "0.1";


// Draw graph from songs data, and year (0: draw all year, else: draw by year)
function drawGraph(songs,year,selectedGenres) {
    // console.log(year+ ": "+songs.length);
    d3.selectAll(".foreground").remove();
    d3.selectAll(".dimension").remove();
    // Make yScale for each dimension
    features.forEach((d) => {

        // Add Scale for each axis
        if (d=="genre") {
            if(year == 0)
                yScale[d] = d3.scalePoint().range([parallelContentHeight,0]).domain(selectedGenres);
            else
                yScale[d] = d3.scalePoint().range([parallelContentHeight,0]).domain(genresByYear[year]);
        }
        else if(d=="tempo"){
            yScale[d] = d3.scaleLinear().range([parallelContentHeight, 0])
                .domain(d3.extent(songs, function (fea) {
                    return fea[d];
                }))
            // console.log(temp);
        }
        else
            yScale[d] = d3.scaleLinear().range([parallelContentHeight, 0]).domain([0,1]);
    });
    
    // Add blue foreground lines for focus.
    foreground = g.append("g")
        .attr("class", "foreground")
        .style("opacity", maxForegroundOpacity)
        .selectAll("path")
        .data(songs)
        .enter()
        .append("path")
        .attr("id",d=>{return "path"+ d.track_id;})
        .attr("d", path)
        .attr("stroke",d=>{return color(d.genre);})
        .on("mouseover",d=>{
            d3.select("#path"+ d.track_id).style("stroke-width","4px").style("opacity", maxForegroundOpacity);

            // Show title - genre (Year)
            titleGroup.append("text")
                .style("font-weight","bold")
                .attr("y", -5)
                .attr("class","title")
                .text(d.title + " - " + d.genre + " ("+d.tracks_track_date_created+")");

            titleGroup.append("rect")
                .attr("class","title")
                .attr("x",-17)
                .attr("y",-15)
                .attr("width",10).attr("height",10)
                .style("fill",function (){return color(d.genre)});

            //Show song info to the graph
            xAxisGroup.append("text").attr("class","title")
                .style("text-anchor","middle")
                .style("font","10px times")
                .attr("y",-5)
                .text(feature=>{
                    if(feature != "genre")
                        return d[feature];
                });
        })
        .on("mouseout",d=>{
            // console.log("mouse out");
            // brush();
            d3.select("#path"+ d.track_id).style("stroke-width","1px").style("opacity", minForegroundOpacity);
            d3.selectAll(".title").remove();
        });
    foreground.style("opacity", minForegroundOpacity);

    // Add a group element for each dimension.
    xAxisGroup = g.selectAll(".dimension")
        .data(features)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", d => {
            return "translate(" + xScale(d) + ")";
        })
        .call(d3.drag()
            .subject(function(d) { return {x: xScale(d)}; })
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Add an axis and title.
    xAxisGroup.append("g")
        .attr("class", "axises")
        .each(function (d) {
            // Call y-axises
            if(d!="genre")
                d3.select(this).call(d3.axisLeft(yScale[d]).ticks(5));
            else
                d3.select(this).call(d3.axisRight(yScale[d]));
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", parallelContentHeight + 15)
        .text(function (d) {
            return d;
        });

    // Add and store a brush for each axis.
    xAxisGroup.append("g")
        .attr("class", "brush")
        .each(function (d) {
            d3.select(this).call(yScale[d].brush = d3.brushY()
                .extent([[-10, 0], [10, parallelContentHeight]])
                .on("brush", brush)
                .on("end", brush)
            );
        });
}

function path(d) {
    // console.log('333333')
    return line(features.map(function(p) {return [position(p), yScale[p](d[p])]; }));
}

function position(d) {
    var v = dragging[d];
    return v == null ? xScale(d) : v;
}
function dragstarted(d) {
    dragging[d] = xScale(d);
    foreground.style("opacity", minForegroundOpacity / 2);
}

function dragged(d) {
    dragging[d] = Math.min(parallelWidth, Math.max(0, d3.event.x));
    foreground.attr("d", path);

    features.sort(function(a, b) { return position(a) - position(b); });
    xScale.domain(features);
    xAxisGroup.attr("transform", function(da) {
        // console.log((da));
        return "translate(" + position(da) + ")"; })
}


function transition(g) {
    return g.transition().duration(500);
}
function dragended(d) {
    console.log("drag end");
    delete dragging[d];
    d3.select(this).attr("transform", "translate(" + xScale(d) + ")");
    transition(foreground).attr("d", path);

    foreground.style("opacity", minForegroundOpacity);

}

// Handles a brush event, toggling the display of foreground lines.
function brush() {

    var actives = [];
    parallelSvg.selectAll(".brush")
        .filter(function(d) {
            // console.log(d3.brushSelection(this));
            yScale[d].brushSelectionValue = d3.brushSelection(this);
            return d3.brushSelection(this);
        })
        .each(function(d) {
            // Get extents of brush along each active selection axis (the Y axes)
            actives.push({
                feature: d,
                extent: d3.brushSelection(this).map(yScale[d].invert)
            });
        });

    var selected = [];
    // Update foreground to only display selected values
    // foreground.style("opacity",function(d) {
    //         return actives.every(function(active) {
    //             let result = active.extent[1] <= d[active.feature] && d[active.feature] <= active.extent[0];
    //             if(result)selected.push(d);
    //             return result;
    //         }) ? "1" : "0.1";
    //     });
    foreground.style("display", function(d) {
        return actives.every(function(active) {
            let result = active.extent[1] <= d[active.feature] && d[active.feature] <= active.extent[0];
            if(result)selected.push(d);
            return result;
        }) ? null : "none";
    });
    // (actives.length>0)?out.text(d3.tsvFormat(selected.slice(0,24))):out.text(d3.tsvFormat(sample_data.slice(0,24)));;

}

