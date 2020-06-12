import BaseMixin from "./BaseMixin";
import PlotTypes from "../PlotTypes";
import PlotUtils from "../PlotUtils" ;

import LineString from "ol/geom/LineString";

export default class Curve extends BaseMixin(LineString) {
    constructor (points=[]){
        super(points);
        this.type = PlotTypes.CURVE;
        this.t = 0.3;
        this.setPoints(points);
    }

    generate(){
        let count = this.getPointCount();
        if(count < 2) {
            return;
        }
        if(count == 2) {
            this.setCoordinates(this.points);
        } else {
            this.setCoordinates(PlotUtils.getCurvePoints(this.t, this.points));
        }
    }
}
