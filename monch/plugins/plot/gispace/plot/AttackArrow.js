import BaseMixin from "./BaseMixin";
import PlotTypes from "../PlotTypes";
import PlotUtils from "../PlotUtils" ;
import Constants from "../Constants";

import Polygon from "ol/geom/Polygon"

export default class AttackArrow extends BaseMixin(Polygon) {
    constructor(points = []) {
        super(points);
        this.type = PlotTypes.ATTACK_ARROW;
        this.headHeightFactor = 0.18;
        this.headWidthFactor = 0.3;
        this.neckHeightFactor = 0.85;
        this.neckWidthFactor = 0.15;
        this.headTailFactor = 0.8;
        this.setPoints(points);
    }

    generate() {
        if (this.getPointCount() < 2){
            return;
        }
        if (this.getPointCount() == 2) {
            this.setCoordinates([this.points]);
            return;
        }
        let pnts = this.getPoints();
        // 计算箭尾
        let tailLeft = pnts[0];
        let tailRight = pnts[1];
        if (PlotUtils.isClockWise(pnts[0], pnts[1], pnts[2])) {
            tailLeft = pnts[1];
            tailRight = pnts[0];
        }
        let midTail = PlotUtils.mid(tailLeft, tailRight);
        let bonePnts = [midTail].concat(pnts.slice(2));
        // 计算箭头
        let headPnts = this.getArrowHeadPoints(bonePnts, tailLeft, tailRight);
        let neckLeft = headPnts[0];
        let neckRight = headPnts[4];
        let tailWidthFactor = PlotUtils.distance(tailLeft, tailRight) / PlotUtils.getBaseLength(bonePnts);
        // 计算箭身
        let bodyPnts = this.getArrowBodyPoints(bonePnts, neckLeft, neckRight, tailWidthFactor);
        // 整合
        let count = bodyPnts.length;
        let leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2));
        leftPnts.push(neckLeft);
        let rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count));
        rightPnts.push(neckRight);

        leftPnts = PlotUtils.getQBSplinePoints(leftPnts);
        rightPnts = PlotUtils.getQBSplinePoints(rightPnts);

        this.setCoordinates([leftPnts.concat(headPnts, rightPnts.reverse())]);
    }

    getArrowHeadPoints(points, tailLeft, tailRight) {
        let len = PlotUtils.getBaseLength(points);
        let headHeight = len * this.headHeightFactor;
        let headPnt = points[points.length - 1];
        len = PlotUtils.distance(headPnt, points[points.length - 2]);
        let tailWidth = PlotUtils.distance(tailLeft, tailRight);
        if (headHeight > tailWidth * this.headTailFactor) {
            headHeight = tailWidth * this.headTailFactor;
        }
        let headWidth = headHeight * this.headWidthFactor;
        let neckWidth = headHeight * this.neckWidthFactor;
        headHeight = headHeight > len ? len : headHeight;
        let neckHeight = headHeight * this.neckHeightFactor;
        let headEndPnt = PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true);
        let neckEndPnt = PlotUtils.getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true);
        let headLeft = PlotUtils.getThirdPoint(headPnt, headEndPnt, Constants.HALF_PI, headWidth, false);
        let headRight = PlotUtils.getThirdPoint(headPnt, headEndPnt, Constants.HALF_PI, headWidth, true);
        let neckLeft = PlotUtils.getThirdPoint(headPnt, neckEndPnt, Constants.HALF_PI, neckWidth, false);
        let neckRight = PlotUtils.getThirdPoint(headPnt, neckEndPnt, Constants.HALF_PI, neckWidth, true);
        return [neckLeft, headLeft, headPnt, headRight, neckRight];
    }

    getArrowBodyPoints(points, neckLeft, neckRight, tailWidthFactor) {
        let allLen = PlotUtils.wholeDistance(points);
        let len = PlotUtils.getBaseLength(points);
        let tailWidth = len * tailWidthFactor;
        let neckWidth = PlotUtils.distance(neckLeft, neckRight);
        let widthDif = (tailWidth - neckWidth) / 2;
        let tempLen = 0, leftBodyPnts = [], rightBodyPnts = [];
        for (let i = 1; i < points.length - 1; i++) {
            let angle = PlotUtils.getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2;
            tempLen += PlotUtils.distance(points[i - 1], points[i]);
            let w = (tailWidth / 2 - tempLen / allLen * widthDif) / Math.sin(angle);
            let left = PlotUtils.getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true);
            let right = PlotUtils.getThirdPoint(points[i - 1], points[i], angle, w, false);
            leftBodyPnts.push(left);
            rightBodyPnts.push(right);
        }
        return leftBodyPnts.concat(rightBodyPnts);
    }
}