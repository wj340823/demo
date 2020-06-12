import BaseMixin from "./BaseMixin";
import PlotTypes from "../PlotTypes";
import PlotUtils from "../PlotUtils";
import Constants from "../Constants";

import Polygon from "ol/geom/Polygon";

export default class GatheringPlace extends BaseMixin(Polygon) {
    constructor(points = []) {
        super(points);
        this.type = PlotTypes.GATHERING_PLACE;
        this.t = 0.4;
        this.fixPointCount = 3;
        this.setPoints(points);
    }

    generate() {
        let pnts = this.getPoints();
        if(pnts.length<2){
            return;
        }
        if(this.getPointCount()==2){
            let mid = PlotUtils.mid(pnts[0], pnts[1]);
            let d = PlotUtils.distance(pnts[0], mid)/0.9;
            let pnt = PlotUtils.getThirdPoint(pnts[0], mid, Constants.HALF_PI, d, true);
            pnts = [pnts[0], pnt, pnts[1]];
        }
        let mid = PlotUtils.mid(pnts[0], pnts[2]);
        pnts.push(mid, pnts[0], pnts[1]);

        let normals = [];
        for(let i=0; i<pnts.length-2; i++){
            let pnt1 = pnts[i];
            let pnt2 = pnts[i+1];
            let pnt3 = pnts[i+2];
            let normalPoints = PlotUtils.getBisectorNormals(this.t, pnt1, pnt2, pnt3);
            normals = normals.concat(normalPoints);
        }
        let count = normals.length;
        normals = [normals[count-1]].concat(normals.slice(0, count-1));
        let pList = [];
        for(let i=0; i<pnts.length-2; i++){
            let pnt1 = pnts[i];
            let pnt2 = pnts[i+1];
            pList.push(pnt1);
            for(let  t=0; t<=Constants.FITTING_COUNT; t++){
                let  pnt = PlotUtils.getCubicValue(t/Constants.FITTING_COUNT, pnt1, normals[i*2], normals[i*2+1], pnt2);
                pList.push(pnt);
            }
            pList.push(pnt2);
        }
        this.setCoordinates([pList]);
    }
}