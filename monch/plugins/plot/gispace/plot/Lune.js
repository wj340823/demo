import BaseMixin from "./BaseMixin";
import PlotTypes from "../PlotTypes";
import PlotUtils from "../PlotUtils";
import Constants from "../Constants";

import Polygon from "ol/geom/Polygon";

export default class Lune extends BaseMixin(Polygon) {
    constructor(points = []) {
        super(points);
        this.type = PlotTypes.LUNE;
        this.fixPointCount = 3;
        this.setPoints(points);
    }

    generate() {
        if(this.getPointCount()<2) {
            return;
        }
        let pnts = this.getPoints();
        if(this.getPointCount()==2){
            let mid = PlotUtils.mid(pnts[0], pnts[1]);
            let d = PlotUtils.distance(pnts[0], mid);
            let pnt = PlotUtils.getThirdPoint(pnts[0], mid, Constants.HALF_PI, d);
            pnts.push(pnt);
        }
        let pnt1 = pnts[0];
        let pnt2 = pnts[1];
        let pnt3 = pnts[2];
        let center = PlotUtils.getCircleCenterOfThreePoints(pnt1, pnt2, pnt3);
        let radius = PlotUtils.distance(pnt1, center);

        let angle1 = PlotUtils.getAzimuth(pnt1, center);
        let angle2 = PlotUtils.getAzimuth(pnt2, center);
        let startAngle, endAngle;
        if(PlotUtils.isClockWise(pnt1, pnt2, pnt3)){
            startAngle = angle2;
            endAngle = angle1;
        }
        else{
            startAngle = angle1;
            endAngle = angle2;
        }
        pnts = PlotUtils.getArcPoints(center, radius, startAngle, endAngle);
        pnts.push(pnts[0]);
        this.setCoordinates([pnts]);
    }
}