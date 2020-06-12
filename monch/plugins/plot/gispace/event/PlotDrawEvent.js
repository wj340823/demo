import GoogEvent from "../goog/event";

class PlotDrawEvent extends GoogEvent{
    constructor(type, feature){
        super(type);
        this.feature = feature;
    }
}

PlotDrawEvent.DRAW_START = "draw_start";
PlotDrawEvent.DRAW_END = "draw_end";

export default PlotDrawEvent;
