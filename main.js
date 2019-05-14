var raw_dataset = [];
var dataset = [];
var audioData = [];
var topGenresAll = [];           // Must not be greater than the size of our precomputed
var topGenres20 = [];            // t-SNE result if we are using it

let features = [];
var selectedGenres = [];
var genres = [];
var genresByYear = {};
// var genresCount = [];

let testSizeString = prompt("Enter data test-size", "200");
const TEST_SIZE = +testSizeString; // The size of our test data for development speed

let featuresPerSetString = prompt("Enter the number of features per set:", "224");
const FEATURES_PER_SET = +featuresPerSetString;

let featureSet = prompt("Enter the number of the set you wish you analyze:", "0");
const FEATURE_SET = 0;

var featureFields = [];
d3.csv("./Dataset/dataset_full(echonest_features+tracks).csv")
    .row(function (d) {
        let featureSetOffset = FEATURE_SET * FEATURES_PER_SET;
        let featureKeys = [];
        let featureNumber;
        for (let i = 0; i < FEATURES_PER_SET; i++) {
            featureNumber = featureSetOffset + i;
            let featurePropertyName = "echonest_temporal_features" + featureNumber.toString();
          
            if (!featureFields.hasOwnProperty(featureNumber)) {
                featureFields[featureNumber] = [];
            }
            featureFields[featureNumber].push(+d[featurePropertyName]);
            featureKeys.push(+d[featurePropertyName]);
        }
        audioData.push([...featureKeys]);
        return d;
    })
    .get(function (error, songData) {
        raw_dataset = songData;     // Save a copy of the raw dataset
        audioData.columns = songData.columns;   // Gets erased later :( - not absolutely necessary, but could be useful to fix
        
        audioData = audioData.slice(0, TEST_SIZE); // Limit the test data for quick debugging
        dataset = songData.slice(0, TEST_SIZE);
        dataset.columns = songData.columns;
    
        featureFields = featureFields.map(function(field) {
            field = field.slice(0, TEST_SIZE);
            let rangeMinMax = d3.extent(field);
            field.minValue = rangeMinMax[0];
            field.maxValue = rangeMinMax[1];
            
            return field;
        });
    
        audioData = audioData.map(function(row, rowNumber) {
            row = row.map(function(featureValue, featureNumber) {
                let featurePropertyName = "echonest_temporal_features" + featureNumber.toString();
            
                featureValue = (featureValue - featureFields[featureNumber].minValue) / (featureFields[featureNumber].maxValue - featureFields[featureNumber].minValue);
            
                dataset[rowNumber][featurePropertyName] = featureValue;
                
                return featureValue;
            });
            
            return row;
        });

        //get audiodata for k-mean cluster, assign the genre for each datapoint
        audioData.forEach((d, i) => {
            d.genre = dataset[i].genre
        });

        // get features that used for mutlti-dimension coordinates
        features = songData.columns.slice(1, 10);
        features = features.concat(songData.columns.slice(15,15 + FEATURES_PER_SET));
        xScale.domain(features);

        // Doing Time Slider
        // Time
        dataset.forEach(d => {
            var year = d.tracks_track_date_created = +formatYear(parseTime(d.tracks_track_date_created));
            features.forEach(feature => {
                if (feature != "genre")
                    d[feature] = +d[feature];
            });
            // var gen = d["genre"];
            // // Create new element in genres count if the element is in first appears.
            // if (!genres.includes(gen)) {
            //     genres.push(gen);
            // }
            //Add genres by each year
            if (!genresByYear.hasOwnProperty(year)) {
                genresByYear[year] = [];
                genresByYear[year].push(d.genre);
            } else {
                if (!genresByYear[year].includes(d.genre))
                    genresByYear[year].push(d.genre);
            }
        });

        topGenresAll = CountGenres(dataset);
        topGenres20 = topGenresAll.slice(0, 20);

        // add genres after sorting
        genres = topGenresAll.map(d => d.genre);
    
        startWorker({dataset:audioData,
            epsilon: 1,        // epsilon is learning rate (10 = default)
            perplexity: 30,    // roughly how many neighbors each point influences (30 = default)
            iterations: 500,
            feature_set: FEATURE_SET, // The number for the set of features that are being analyzed
            features_per_set: FEATURES_PER_SET   // The amount of features in the set
        });
        
        //UpdateDataTSNE(bigdata.slice(0, TEST_SIZE));
        drawSlider();
        graphByYear(dataset, sliderTime.value());
        document.getElementById("genreContainer").style.display = "none";

        drawLegend();

        //Using k-mean for 10 clusters, apply count genre in each cluster;
        // getcluster(audioData)

        //Using hierachical cluster method (source: https://harthur.github.io/clusterfck/ )
        // var threshold = 14; // only combine two clusters with distance less than 14 ??? I still in question about the threshold
        // var clusters = clusterfck.hcluster(audioData, clusterfck.EUCLIDEAN_DISTANCE,
        //     clusterfck.AVERAGE_LINKAGE, threshold);
        // console.log(clusters)
    });

// Count the genres and return a descending frequency-ordered list of top genres
function CountGenres(data) {    // ***We could optimize this function further, but maybe later
    var genres = [];            // ***I think it has O(N^2) time complexity or more     ~Darien
    var count_genre = [];
    var genre_queue = [];
    //(data) get from d3.csv, push all genre to genres array
    data.forEach(d => { // Build the list of genre occurrences
        genres.push(d.genre);
    });

    var count;
    data.forEach((d) => {
        count = 0;
        if (!genre_queue.includes(d.genre)) {        // If this genre has not been counted
            for (i = 0; i < genres.length; i++) {   // Count the occurrences of this genre
                if (genres[i] === d.genre) {
                    count++;
                }
            }
            genre_queue.push(d.genre);              // Mark this genre as counted
            count_genre.push({genre: d.genre, number: count})    // Add the count of this genre
        }
    });

    //sort count_genre array
    count_genre.sort(function (a, b) {
        return b.number - a.number;
    });

    return count_genre;
}

const width = 600, height = 350,
    margin = {left: 20, top: 20, right: 20, bottom: 20},
    contentWidth = width - margin.left - margin.right,
    contentHeight = height - margin.top - margin.bottom;

const svg = d3.select("#theGraph")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const scatterplot = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.right})`)
    .attr("id", "snodes");


//create zoom handler
var zoom_handler = d3.zoom().scaleExtent([0.5, 6])
    .on("zoom", zoom);


//specify what to do when zoom event listener is triggered
function zoom() {
    scatterplot.attr("transform", d3.event.transform);
}

//add zoom behaviour to the svg element backing our graph.
zoom_handler(svg);


// Draw a scatterplot from the given t-SNE data
function TSNEDraw_Scatterplot(tsne_data) {
    UpdateDataTSNE(tsne_data);      // Update our data with the given t-SNE data
    Draw_Scatterplot(dataset);    // Draw the scatterplot with the updated data
}


// Update the data with the given t-SNE result
function UpdateDataTSNE(data) {
    data.forEach(function (d, i) {
        dataset[i].x = d[0];  // Add the t-SNE x result to the dataset
        dataset[i].y = d[1];  // Add the t-SNE y result to the dataset
    });
}

const circleRadius = 3;
const circleOpacity = "0.75";

// Draw a scatterplot from the given data
function Draw_Scatterplot(data) {
    if (legendisClicked) {
        data = data.filter(function(d) {
            return d.genre === globalLegendGenre;
        });
    }
    
    
    const xScale = d3.scaleLinear()
        .domain(getExtent(data, "x"))
        .range([0, contentWidth]);
    const yScale = d3.scaleLinear()
        .domain(getExtent(data, "y"))
        .range([0, contentHeight]);

    UpdateNodes(data);

    function UpdateNodes(data) {
        const selection = scatterplot.selectAll(".compute").data(data);
        //Exit
        selection.exit().remove();
        //Enter
      
        const newElements = selection.enter()
            .append('circle')
            .attr("class", "compute")
            .attr("id", d => "circle" + d.track_id)
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", circleRadius)
            .attr("data-legend", function (d) {
                return d.genre
            })
            .style("opacity", circleOpacity)
            .style("fill", d => colorByTop20Genres(d.genre))
            // .style("fill", function (d) {
            //     if (topGenres20.some(element => element.genre === d.genre)) {
            //         return color(d.genre);
            //     } else {
            //         return "black";
            //     }
            // })
            .on("mouseover", function (d) {
                MouseOverCircles(d);
                MouseOverLines(d);
                MouseOverTooltip(d);
            })
            .on("mouseout", function (d) {
                MouseOutCircles(d);
                MouseOutLines(d);

            });
        //Update
        selection
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", circleRadius)
            .style("opacity", circleOpacity)
            .style("fill", d => colorByTop20Genres(d.genre));
        // .style("fill", function (d) {
        //     if (topGenres20.some(element => element.genre === d.genre)) {
        //         return color(d.genre);
        //     } else {
        //         return "black";
        //     }
        // });
    }
}

function MouseOverCircles(d) {
    d3.select("#circle" + d.track_id)
        .attr("r", circleRadius * 3);
    d3.select("#circle" + d.track_id)
    // .append("title")
    // .text(function (d) {
    //     if (topGenres20.some(element => element.genre === d.genre)) {
    //         return "Top Genre: " + d.genre;
    //     } else {
    //         return "Genre: " + d.genre;
    //     }
    // }

}


// Define the div for the tooltip
let toolTipDiv = d3.select("body").append("div")
.attr("class", "tooltip")
.style("opacity", 0);

function MouseOverTooltip(d) {
    toolTipDiv.transition()
        .duration(200)
        .style("opacity", .9);
    toolTipDiv.html("Genre:" + d.genre + "<br/>" +
        "Acousticness:" + d.acousticness.toFixed(2) + "<br/>" +
        "Danceability:" + d.danceability.toFixed(2) + "<br/>" +
        "Duration:" + d.duration + "<br/>" +
        "Energy:" + d.energy.toFixed(2) + "<br/>" +
        "Instrumentalness:" + d.instrumentalness.toFixed(2) + "<br/>" +
        "Liveness:" + d.liveness.toFixed(2) + "<br/>" +
        "Speechiness:" + d.speechiness.toFixed(2) + "<br/>" +
        "Tempo:" + d.tempo);
}

function MouseOutCircles(d) {
    d3.select("#circle" + d.track_id)
        .attr("r", circleRadius);
    d3.select("#circle" + d.track_id)
        .select("text")
        .remove();
    toolTipDiv.transition()
        .duration(500)
        .style("opacity", 0);
}

/*function DrawLegend(colorScale, values) {

    values.forEach(function(d, i) {
        legend
        .append("rect")
            .attr("x", 5)
            .attr("y", i*5)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", d => colorScale(d.genre))


    });
}*/

function getExtent(data, key) {
    return d3.extent(data.map(d => d[key]));
}

// Get a set of cluster centroids based on the given data
function getcluster(data) {
    let clusterSet = [];
    let centroids = [];

    //give number of clusters we want
    clusters.k(10);

    //number of iterations (higher number gives more time to converge), defaults to 1000
    clusters.iterations(750);

    //data from which to identify clusters, defaults to []
    clusters.data(data);

    clusterSet = clusters.clusters();
    // clusterSet.forEach(function (d) { // Save the centroids of each cluster
    //     return centroids.push(d.centroid)
    // });
    //
    // console.log(centroids);
    // return centroids;
    var cluster_count_genre = [];
    var index;
    for (i = 1; i < clusterSet.length; i++) {
        cluster_count_genre.push(CountGenres(clusterSet[i].points))
    }
    console.log(cluster_count_genre)
}