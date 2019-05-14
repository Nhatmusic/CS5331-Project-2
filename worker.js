importScripts("js/tsne.js");
onmessage = function(e){
    const inputs = e.data;
    inputs.dim = 2; // dimensionality of the embedding (2 = default)

    const tsne = new tsnejs.tSNE(inputs); // create a tSNE instance

    alert("About to initialize tSNE with Raw Data");
    tsne.initDataRaw(inputs.dataset);
    alert("tSNE Initialization Complete");
    
    const dataSize = inputs.dataset.length;
    let Log_TSNE = function(iteration) {
      // noinspection JSConstructorReturnsPrimitive
      return "Data Size: " + dataSize +
             "<br>Learning Rate: " + inputs.epsilon +
             "<br>Perplexity: " + inputs.perplexity +
             "<br>Feature Set: " + inputs.feature_set +
             "<br>Features Per Set: " + inputs.features_per_set +
             "<br>Iteration: " + iteration;
    };
    
    for(let k = 0; k < inputs.iterations; k++) {
        tsne.step(); // every time you call this, solution gets better
            Updated_TSNE(tsne.getSolution(), Log_TSNE(k));
    }
    Completed_TSNE(tsne.getSolution(), Log_TSNE(inputs.iterations));
    alert("tSNE Complete. Scroll down to view tSNE result.")
};

// Tell the worker container in the main thread to send an alert
function alert(strMessage) {
    postMessage({status:"alert", content:strMessage});
}

// Tell the worker container in the main thread that the TSNE solution has been updated
function Updated_TSNE(tsneOutput, strMessage) {
  postMessage({status:"TSNE_Updated", content:tsneOutput, logMessage:strMessage});
}

// Tell the worker container in the main thread that the TSNE solution is complete
function Completed_TSNE(tsneResult, strMessage) {
    postMessage({status:"TSNE_Completed", content:tsneResult, logMessage:strMessage});
}