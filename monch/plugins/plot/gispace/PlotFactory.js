import * as Plot from "./plot/index"

let PlotFactory = {};
PlotFactory.createPlot = function(type, points){
    if(!type||!Plot[type]){
        return null;
    }
    return new Plot[type](points);
}

export default PlotFactory;