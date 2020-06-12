import BaseMixin from "./BaseMixin";
import PlotTypes from "../PlotTypes";
import PlotUtils from "../PlotUtils" ;
import Constants from "../Constants";

import Polygon from "ol/geom/Polygon"

export default class FineArrow extends BaseMixin(Polygon) {
    constructor(points = []) {
        super(points);
        this.type = PlotTypes.FINE_ARROW;
        this.tailWidthFactor = 0.15;
        this.neckWidthFactor = 0.2;
        this.headWidthFactor = 0.25;
        this.headAngle = Math.PI / 8.5;
        this.neckAngle = Math.PI / 13;
        this.fixPointCount = 2;
        this.setPoints(points);
    }

    generate() {
        let count = this.getPointCount();
        if(count < 2) {
            return;
        }
        let pnts = this.getPoints();
        let pnt1 = pnts[0];
        let pnt2 = pnts[1];
        let len = PlotUtils.getBaseLength(pnts);
        let tailWidth = len * this.tailWidthFactor;
        let neckWidth = len * this.neckWidthFactor;
        let headWidth = len * this.headWidthFactor;
        let tailLeft = PlotUtils.getThirdPoint(pnt2, pnt1, Constants.HALF_PI, tailWidth, true);
        let tailRight = PlotUtils.getThirdPoint(pnt2, pnt1, Constants.HALF_PI, tailWidth, false);
        let headLeft = PlotUtils.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, false);
        let headRight = PlotUtils.getThirdPoint(pnt1, pnt2, this.headAngle, headWidth, true);
        let neckLeft = PlotUtils.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, false);
        let neckRight = PlotUtils.getThirdPoint(pnt1, pnt2, this.neckAngle, neckWidth, true);
        let pList = [tailLeft, neckLeft, headLeft, pnt2, headRight, neckRight, tailRight];
        this.setCoordinates([pList]);
    }
}