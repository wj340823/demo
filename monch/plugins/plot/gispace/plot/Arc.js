import BaseMixin from "./BaseMixin";
import PlotTypes from "../PlotTypes";
import PlotUtils from "../PlotUtils" ;

import LineString from "ol/geom/LineString";

export default class Arc extends BaseMixin(LineString) {
    
    constructor(points=[]) {
        super(points);
        this.type = PlotTypes.ARC;
        this.fixPointCount = 3;
        this.setPoints(points);
    }

    generate(){
        const count = this.getPointCount();
        if(count < 2){
            return;
        }
        if(count==2) {
            this.setCoordinates(this.points);
        }else{
            let pnt1 = this.points[0];
            let pnt2 = this.points[1];
            let pnt3 = this.points[2];
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
            this.setCoordinates(PlotUtils.getArcPoints(center, radius, startAngle, endAngle));
        }
    }
}


















