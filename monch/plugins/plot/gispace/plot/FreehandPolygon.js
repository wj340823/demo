import BaseMixin from "./BaseMixin";
import PlotTypes from "../PlotTypes";

import Polygon from "ol/geom/Polygon";

export default class FreehandPolygon extends BaseMixin(Polygon) {
    constructor(points = []) {
        super(points);
        this.type = PlotTypes.FREEHAND_POLYGON;
        this.freehand = true;
        this.setPoints(points);
    }

    generate() {
        let count = this.getPointCount();
        if(count < 2) {
            return;
        }
        this.setCoordinates([this.points]);
    }
}