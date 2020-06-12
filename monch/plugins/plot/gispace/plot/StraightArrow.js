import BaseMixin from "./BaseMixin";
import PlotTypes from "../PlotTypes";
import PlotUtils from "../PlotUtils";

import LineString from "ol/geom/LineString";

export default class StraightArrow extends BaseMixin(LineString) {

    constructor(points = []) {
        super(points);
        this.type = PlotTypes.STRAIGHT_ARROW;
        this.fixPointCount = 2;
        this.maxArrowLength = 3000000;
        this.arrowLengthScale = 5;
        this.setPoints(points);
    }

    generate() {
        if(this.getPointCount()<2) {
            return;
        }
        let pnts = this.getPoints();
        let pnt1 = pnts[0];
        let pnt2 = pnts[1];
        let distance = PlotUtils.distance(pnt1, pnt2);
        let len = distance / this.arrowLengthScale;
        len = len > this.maxArrowLength ? this.maxArrowLength : len;
        let leftPnt = PlotUtils.getThirdPoint(pnt1, pnt2, Math.PI/6, len, false);
        let rightPnt = PlotUtils.getThirdPoint(pnt1, pnt2, Math.PI/6, len, true);
        this.setCoordinates([pnt1, pnt2, leftPnt, pnt2, rightPnt]);
    }
}