let w;
function startWorker(data){
    if(typeof(Worker)!== "undefined"){
        if(w===undefined){
            w = new Worker('worker.js');
            w.postMessage(data);
        }
        w.onmessage = function (event){
            // This workaround is necessary to handle different functions with a Web Worker
            if (event.data.status === "alert") {
              alert(event.data.content);
            } else if (event.data.status === "TSNE_Updated") {
              TSNEDraw_Scatterplot(event.data.content);
              d3.select("#TSNE_Text").html(event.data.logMessage);
            } else if (event.data.status === "TSNE_Completed") {
                // getcluster(event.data)
                // console.log(event.data) //show raw-result of t-sne
                TSNEDraw_Scatterplot(event.data.content); //plot the 2D datapoint.
                UpdateDataTSNE(event.data.content);
                d3.select("#TSNE_Text").html(event.data.logMessage);
            } else {
                alert("Unknown postMessage \'command\' arguments sent by worker!")
            }
        };
    }
    else{
        throw "Browser doesn't support web worker";
    }
}