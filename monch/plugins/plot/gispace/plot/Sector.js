import BaseMixin from "./BaseMixin";
import PlotTypes from "../PlotTypes";
import PlotUtils from "../PlotUtils";

import Polygon from "ol/geom/Polygon";

export default class Sector extends BaseMixin(Polygon) {
    constructor(points = []) {
        super(points);
        this.type = PlotTypes.SECTOR;
        this.fixPointCount = 3;
        this.setPoints(points);
    }

    generate() {
        if(this.getPointCount()<2)
            return;
        if(this.getPointCount()==2)
            this.setCoordinates([this.points]);
        else{
            let pnts = this.getPoints();
            let center = pnts[0];
            let pnt2 = pnts[1];
            let pnt3 = pnts[2];
            let radius = PlotUtils.distance(pnt2, center);
            let startAngle = PlotUtils.getAzimuth(pnt2, center);
            let endAngle = PlotUtils.getAzimuth(pnt3, center);

            let pList = PlotUtils.getArcPoints(center, radius, startAngle, endAngle);
            pList.push(center, pList[0]);
            this.setCoordinates([pList]);
        }
    }
}