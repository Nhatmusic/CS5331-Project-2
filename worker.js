importScripts("js/tsne.js");
onmessage = function(e){
    const opt = {}
    opt.epsilon = 1; // epsilon is learning rate (10 = default)
    opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
    opt.dim = 2; // dimensionality of the embedding (2 = default)

    const tsne = new tsnejs.tSNE(opt); // create a tSNE instance

    tsne.initDataDist(e.data);

    // for(var k = 0; k < 10; k++) {
    //     tsne.step(); // every time you call this, solution gets better
    //     if(k%1==0){
            postMessage(tsne.getSolution());
    //     }
    // }
}