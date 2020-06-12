import BaseMixin from "./BaseMixin";
import PlotTypes from "../PlotTypes";

import PolygonOl from "ol/geom/Polygon";

export default class Polygon extends BaseMixin(PolygonOl) {
    constructor(points = []) {
        super(points);
        this.type = PlotTypes.POLYGON;
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