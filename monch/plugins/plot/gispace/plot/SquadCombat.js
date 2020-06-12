import PlotTypes from "../PlotTypes";
import PlotUtils from "../PlotUtils";
import Constants from "../Constants";

import AttackArrow from "./AttackArrow";

export default class SquadCombat extends AttackArrow {
    constructor(points = []) {
        super(points);
        this.type = PlotTypes.SQUAD_COMBAT;
        this.headHeightFactor = 0.18;
        this.headWidthFactor = 0.3;
        this.neckHeightFactor = 0.85;
        this.neckWidthFactor = 0.15;
        this.tailWidthFactor = 0.1;
        this.setPoints(points);
    }

    generate() {
        //防止父级方法扰乱
        if(this.type!="SquadCombat"){
            return;
        }
        let count = this.getPointCount();
        if(count < 2) {
            return;
        }
        let pnts = this.getPoints();
        let tailPnts = this.getTailPoints(pnts);
        let headPnts = this.getArrowHeadPoints(pnts, tailPnts[0], tailPnts[1]);
        let neckLeft = headPnts[0];
        let neckRight = headPnts[4];
        let bodyPnts = this.getArrowBodyPoints(pnts, neckLeft, neckRight, this.tailWidthFactor);

        count = bodyPnts.length;
        let leftPnts = [tailPnts[0]].concat(bodyPnts.slice(0, count / 2));
        leftPnts.push(neckLeft);
        let rightPnts = [tailPnts[1]].concat(bodyPnts.slice(count / 2, count));
        rightPnts.push(neckRight);

        leftPnts = PlotUtils.getQBSplinePoints(leftPnts);
        rightPnts = PlotUtils.getQBSplinePoints(rightPnts);

        this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse())]);
    }

    getTailPoints(points) {
        let allLen = PlotUtils.getBaseLength(points);
        let tailWidth = allLen * this.tailWidthFactor;
        let tailLeft = PlotUtils.getThirdPoint(points[1], points[0], Constants.HALF_PI, tailWidth, false);
        let tailRight = PlotUtils.getThirdPoint(points[1], points[0], Constants.HALF_PI, tailWidth, true);
        return [tailLeft, tailRight];
    }
}