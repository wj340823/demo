import GoogEvent from "../goog/event";

class PlotEditEvent extends GoogEvent {
    constructor(type, feature){
        super(type);
        this.feature = feature;
    }
}
PlotEditEvent.EDIT_START = "edit_start";
PlotEditEvent.EDIT_MOVE = "edit_move";
PlotEditEvent.EDIT_END = "edit_end";

export default PlotEditEvent;