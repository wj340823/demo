import BaseMixin from "./BaseMixin";
import PlotTypes from "../PlotTypes";
import PlotUtils from "../PlotUtils" ;
import Constants from "../Constants";

import Polygon from "ol/geom/Polygon"

export default class Ellipse extends BaseMixin(Polygon) {
    constructor(points = []) {
        super(points);
        this.type = PlotTypes.ELLIPSE;
        this.fixPointCount = 2;
        this.setPoints(points);
    }

    generate() {
        let count = this.getPointCount();
        if(count < 2) {
            return;
        }
        let pnt1 = this.points[0];
        let pnt2 = this.points[1];
        let center = PlotUtils.mid(pnt1, pnt2);
        let majorRadius = Math.abs((pnt1[0]-pnt2[0])/2);
        let minorRadius = Math.abs((pnt1[1]-pnt2[1])/2);
        this.setCoordinates([this.generatePoints(center, majorRadius, minorRadius)]);
    }

    generatePoints(center, majorRadius, minorRadius) {
        let x, y, angle, points = [];
        for (let i = 0; i <= Constants.FITTING_COUNT; i++) {
            angle = Math.PI * 2 * i / Constants.FITTING_COUNT;
            x = center[0] + majorRadius * Math.cos(angle);
            y = center[1] + minorRadius * Math.sin(angle);
            points.push([x, y]);
        }
        return points;
    }
}

