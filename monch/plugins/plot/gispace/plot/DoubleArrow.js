import BaseMixin from "./BaseMixin";
import PlotTypes from "../PlotTypes";
import PlotUtils from "../PlotUtils" ;
import Constants from "../Constants";

import Polygon from "ol/geom/Polygon"

export default class DoubleArrow extends BaseMixin(Polygon) {
    constructor(points = []) {
        super(points);
        this.type = PlotTypes.DOUBLE_ARROW;
        this.headHeightFactor = 0.25;
        this.headWidthFactor = 0.3;
        this.neckHeightFactor = 0.85;
        this.neckWidthFactor = 0.15;
        this.connPoint = null;
        this.tempPoint4 = null;
        this.fixPointCount = 4;
        this.setPoints(points);
    }

    finishDrawing() {
        if (this.getPointCount() == 3 && this.tempPoint4 != null)
            this.points.push(this.tempPoint4);
        if (this.connPoint != null)
            this.points.push(this.connPoint);
    }

    generate() {
        let count = this.getPointCount();
        if(count < 2) {
            return;
        }
        if(count == 2) {
            this.setCoordinates([this.points]);
            return;
        }

        let pnt1 = this.points[0];
        let pnt2 = this.points[1];
        let pnt3 = this.points[2];

        if (count == 3)
            this.tempPoint4 = this.getTempPoint4(pnt1, pnt2, pnt3);
        else
            this.tempPoint4 = this.points[3];
        if (count == 3 || count == 4)
            this.connPoint = PlotUtils.mid(pnt1, pnt2);
        else
            this.connPoint = this.points[4];
        let leftArrowPnts, rightArrowPnts;
        if (PlotUtils.isClockWise(pnt1, pnt2, pnt3)) {
            leftArrowPnts = this.getArrowPoints(pnt1, this.connPoint, this.tempPoint4, false);
            rightArrowPnts = this.getArrowPoints(this.connPoint, pnt2, pnt3, true);
        } else {
            leftArrowPnts = this.getArrowPoints(pnt2, this.connPoint, pnt3, false);
            rightArrowPnts = this.getArrowPoints(this.connPoint, pnt1, this.tempPoint4, true);
        }
        let m = leftArrowPnts.length;
        let t = (m - 5) / 2;

        let llBodyPnts = leftArrowPnts.slice(0, t);
        let lArrowPnts = leftArrowPnts.slice(t, t + 5);
        let lrBodyPnts = leftArrowPnts.slice(t + 5, m);

        let rlBodyPnts = rightArrowPnts.slice(0, t);
        let rArrowPnts = rightArrowPnts.slice(t, t + 5);
        let rrBodyPnts = rightArrowPnts.slice(t + 5, m);

        rlBodyPnts = PlotUtils.getBezierPoints(rlBodyPnts);
        let bodyPnts = PlotUtils.getBezierPoints(rrBodyPnts.concat(llBodyPnts.slice(1)));
        lrBodyPnts = PlotUtils.getBezierPoints(lrBodyPnts);

        let pnts = rlBodyPnts.concat(rArrowPnts, bodyPnts, lArrowPnts, lrBodyPnts);
        this.setCoordinates([pnts]);
    }

    getArrowPoints(pnt1, pnt2, pnt3, clockWise) {
        let midPnt = PlotUtils.mid(pnt1, pnt2);
        let len = PlotUtils.distance(midPnt, pnt3);
        let midPnt1 = PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.3, true);
        let midPnt2 = PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.5, true);
        //let midPnt3=PlotUtils.getThirdPoint(pnt3, midPnt, 0, len * 0.7, true);
        midPnt1 = PlotUtils.getThirdPoint(midPnt, midPnt1, Constants.HALF_PI, len / 5, clockWise);
        midPnt2 = PlotUtils.getThirdPoint(midPnt, midPnt2, Constants.HALF_PI, len / 4, clockWise);
        //midPnt3=PlotUtils.getThirdPoint(midPnt, midPnt3, Constants.HALF_PI, len / 5, clockWise);

        let points = [midPnt, midPnt1, midPnt2, pnt3];
        // 计算箭头部分
        let arrowPnts = this.getArrowHeadPoints(points, this.headHeightFactor, this.headWidthFactor, this.neckHeightFactor, this.neckWidthFactor);
        let neckLeftPoint = arrowPnts[0];
        let neckRightPoint = arrowPnts[4];
        // 计算箭身部分
        let tailWidthFactor = PlotUtils.distance(pnt1, pnt2) / PlotUtils.getBaseLength(points) / 2;
        let bodyPnts = this.getArrowBodyPoints(points, neckLeftPoint, neckRightPoint, tailWidthFactor);
        let n = bodyPnts.length;
        let lPoints = bodyPnts.slice(0, n / 2);
        let rPoints = bodyPnts.slice(n / 2, n);
        lPoints.push(neckLeftPoint);
        rPoints.push(neckRightPoint);
        lPoints = lPoints.reverse();
        lPoints.push(pnt2);
        rPoints = rPoints.reverse();
        rPoints.push(pnt1);
        return lPoints.reverse().concat(arrowPnts, rPoints);
    }

    getArrowHeadPoints(points, tailLeft, tailRight) {
        let len = PlotUtils.getBaseLength(points);
        let headHeight = len * this.headHeightFactor;
        let headPnt = points[points.length - 1];
        let tailWidth = PlotUtils.distance(tailLeft, tailRight);
        let headWidth = headHeight * this.headWidthFactor;
        let neckWidth = headHeight * this.neckWidthFactor;
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

    // 计算对称点
    getTempPoint4(linePnt1, linePnt2, point) {
        let midPnt = PlotUtils.mid(linePnt1, linePnt2);
        let len = PlotUtils.distance(midPnt, point);
        let angle = PlotUtils.getAngleOfThreePoints(linePnt1, midPnt, point);
        let symPnt, distance1, distance2, mid;
        if (angle < Constants.HALF_PI) {
            distance1 = len * Math.sin(angle);
            distance2 = len * Math.cos(angle);
            mid = PlotUtils.getThirdPoint(linePnt1, midPnt, Constants.HALF_PI, distance1, false);
            symPnt = PlotUtils.getThirdPoint(midPnt, mid, Constants.HALF_PI, distance2, true);
        }
        else if (angle >= Constants.HALF_PI && angle < Math.PI) {
            distance1 = len * Math.sin(Math.PI - angle);
            distance2 = len * Math.cos(Math.PI - angle);
            mid = PlotUtils.getThirdPoint(linePnt1, midPnt, Constants.HALF_PI, distance1, false);
            symPnt = PlotUtils.getThirdPoint(midPnt, mid, Constants.HALF_PI, distance2, false);
        }
        else if (angle >= Math.PI && angle < Math.PI * 1.5) {
            distance1 = len * Math.sin(angle - Math.PI);
            distance2 = len * Math.cos(angle - Math.PI);
            mid = PlotUtils.getThirdPoint(linePnt1, midPnt, Constants.HALF_PI, distance1, true);
            symPnt = PlotUtils.getThirdPoint(midPnt, mid, Constants.HALF_PI, distance2, true);
        }
        else {
            distance1 = len * Math.sin(Math.PI * 2 - angle);
            distance2 = len * Math.cos(Math.PI * 2 - angle);
            mid = PlotUtils.getThirdPoint(linePnt1, midPnt, Constants.HALF_PI, distance1, true);
            symPnt = PlotUtils.getThirdPoint(midPnt, mid, Constants.HALF_PI, distance2, false);
        }
        return symPnt;
    }
}
