import BaseMixin from "./BaseMixin";
import PlotTypes from "../PlotTypes";
import PlotUtils from "../PlotUtils" ;
import Constants from "../Constants";

import Polygon from "ol/geom/Polygon";

export default class ClosedCurve extends BaseMixin(Polygon) {
    constructor (points=[]){
        super(points);
        this.type = PlotTypes.CLOSED_CURVE;
        this.t = 0.3;
        this.setPoints(points);
    }

    generate(){
        let count = this.getPointCount();
        if(count < 2) {
            return;
        }
        if(count == 2) {
            this.setCoordinates([this.points]);
        }
        else{
            let pnts = this.getPoints();
            pnts.push(pnts[0], pnts[1]);
            let normals = [];
            for(let i=0; i<pnts.length-2; i++){
                let normalPoints = PlotUtils.getBisectorNormals(this.t, pnts[i], pnts[i+1], pnts[i+2]);
                normals = normals.concat(normalPoints);
            }
            let count = normals.length;
            normals = [normals[count-1]].concat(normals.slice(0, count-1));

            let pList = [];
            for(let i=0; i<pnts.length-2; i++){
                let pnt1 = pnts[i];
                let pnt2 = pnts[i+1];
                pList.push(pnt1);
                for(let t=0; t<= Constants.FITTING_COUNT; t++){
                    let pnt = PlotUtils.getCubicValue(t / Constants.FITTING_COUNT, pnt1, normals[i*2], normals[i*2+1], pnt2);
                    pList.push(pnt);
                }
                pList.push(pnt2);
            }
            this.setCoordinates([pList]);
        }
    }
}
