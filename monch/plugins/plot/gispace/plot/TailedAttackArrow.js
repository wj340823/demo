import PlotTypes from "../PlotTypes";
import PlotUtils from "../PlotUtils";

import AttackArrow from "./AttackArrow";

export default class TailedAttackArrow extends AttackArrow {

    constructor(points = []) {
        super(points);
        this.type = PlotTypes.TAILED_ATTACK_ARROW;
        this.headHeightFactor = 0.18;
        this.headWidthFactor = 0.3;
        this.neckHeightFactor = 0.85;
        this.neckWidthFactor = 0.15;
        this.tailWidthFactor = 0.1;
        this.headTailFactor = 0.8;
        this.swallowTailFactor = 1;
        this.swallowTailPnt = null;
        this.setPoints(points);
    }

    generate() {
        //防止父级方法扰乱
        if(this.type!="TailedAttackArrow"){
            return;
        }
        let count = this.getPointCount();
        if(count < 2) {
            return;
        }
        if(this.getPointCount() == 2){
            this.setCoordinates([this.points]);
            return;
        }
        let pnts = this.getPoints();
        let tailLeft = pnts[0];
        let tailRight = pnts[1];
        if(PlotUtils.isClockWise(pnts[0], pnts[1], pnts[2])){
            tailLeft = pnts[1];
            tailRight = pnts[0];
        }
        let midTail = PlotUtils.mid(tailLeft, tailRight);
        let bonePnts = [midTail].concat(pnts.slice(2));
        let headPnts = this.getArrowHeadPoints(bonePnts, tailLeft, tailRight);
        let neckLeft = headPnts[0];
        let neckRight = headPnts[4];
        let tailWidth = PlotUtils.distance(tailLeft, tailRight);
        let allLen = PlotUtils.getBaseLength(bonePnts);
        let len = allLen * this.tailWidthFactor * this.swallowTailFactor;
        this.swallowTailPnt = PlotUtils.getThirdPoint(bonePnts[1], bonePnts[0], 0, len, true);
        let factor = tailWidth/allLen;
        let bodyPnts = this.getArrowBodyPoints(bonePnts, neckLeft, neckRight, factor);

        count = bodyPnts.length;
        let leftPnts = [tailLeft].concat(bodyPnts.slice(0, count/2));
        leftPnts.push(neckLeft);
        let rightPnts = [tailRight].concat(bodyPnts.slice(count/2, count));
        rightPnts.push(neckRight);

        leftPnts = PlotUtils.getQBSplinePoints(leftPnts);
        rightPnts = PlotUtils.getQBSplinePoints(rightPnts);

        this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse(), [this.swallowTailPnt, leftPnts[0]])]);
    }
}