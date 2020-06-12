import BaseMixin from "./BaseMixin";
import PlotTypes from "../PlotTypes";

import Point from "ol/geom/Point";

export default class Marker extends BaseMixin(Point) {
    constructor(points = []) {
        super(points);
        this.type = PlotTypes.MARKER;
        this.fixPointCount = 1;
        this.setPoints(points);
    }

    generate() {
        let pnt = this.points[0];
        this.setCoordinates(pnt);
    }
}

