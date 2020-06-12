import BaseMixin from "./BaseMixin";
import PlotTypes from "../PlotTypes";
import PlotUtils from "../PlotUtils" ;
import Constants from "../Constants";

import Polygon from "ol/geom/Polygon";

export default class Circle extends BaseMixin(Polygon) {
    constructor(points=[]) {
        super(points);
        this.type = PlotTypes.CIRCLE;
        this.fixPointCount = 2;
        this.setPoints(points);
    }

    generate(){
        let count = this.getPointCount();
        if(count < 2) {
            return;
        }
        let center = this.points[0];
        let radius = PlotUtils.distance(center, this.points[1]);
        this.setCoordinates([this.generatePoints(center, radius)]);
    }

    generatePoints(center, radius){
        let x, y, angle, points=[];
        for(let i=0; i<= Constants.FITTING_COUNT; i++){
            angle = Math.PI*2*i/ Constants.FITTING_COUNT;
            x = center[0] + radius*Math.cos(angle);
            y = center[1] + radius*Math.sin(angle);
            points.push([x,y]);
        }
        return points;
    }
}

