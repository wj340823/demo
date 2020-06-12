import BaseMixin from "./BaseMixin";
import PlotTypes from "../PlotTypes";

import Polygon from "ol/geom/Polygon";

export default class Rectangle extends BaseMixin(Polygon) {
    constructor(points = []) {
        super(points);
        this.type = PlotTypes.RECTANGLE;
        this.fixPointCount = 2;
        this.setPoints(points);
    }

    generate() {
        let count = this.getPointCount();
        if(count<2) {
            return;
        }else{
            let pnt1 = this.points[0];
            let pnt2 = this.points[1];
            let xmin = Math.min(pnt1[0], pnt2[0]);
            let xmax = Math.max(pnt1[0], pnt2[0]);
            let ymin = Math.min(pnt1[1], pnt2[1]);
            let ymax = Math.max(pnt1[1], pnt2[1]);
            let tl = [xmin, ymax];
            let tr = [xmax, ymax];
            let br = [xmax, ymin];
            let bl = [xmin, ymin];
            this.setCoordinates([[tl, tr, br, bl]]);
        }
    }
}