export class MarkLine {
    constructor(from, to, options) {
        this.from = from;
        this.to = to;
        this.id = options.id;
        this.options = options;
        this.path = [];
        this.steps = {};  //一条路线上多个飞线
    }

    setStep(batch, num) {
        if (!this.steps[batch]) {
            this.steps[batch] = {step: 0, progress: 0};
        }
        this.steps[batch].step = num;
    }

    getStep(batch) {
        return this.steps[batch] ? this.steps[batch].step : 0;
    }

    setProgress(batch, num) {
        if (!this.steps[batch]) {
            this.steps[batch] = {step: 0, progress: 0};
        }
        this.steps[batch].progress = num;
    }

    getProgress(batch) {
        return this.steps[batch] ? this.steps[batch].progress : 0;
    }

    getPointList(fromPixel, toPixel) {
        let points = [
            fromPixel, toPixel
        ];
        let ex = points[1][0];
        let ey = points[1][1];
        points[3] = [ex, ey];
        points[1] = this.getOffsetPoint(points[0], points[3]);
        points[2] = this.getOffsetPoint(points[3], points[0]);
        points = this.smoothSpline(points, false);
        //修正最后一点在插值产生的偏移
        points[points.length - 1] = [ex, ey];
        return points;
    }

    getOffsetPoint(start, end) {
        let distance = this.getDistance(start, end) / 3; //除以3？
        let angle, dX, dY;
        let mp = [start[0], start[1]];
        let deltaAngle = -0.2; //偏移0.2弧度
        if (start[0] != end[0] && start[1] != end[1]) { //斜率存在
            let k = (end[1] - start[1]) / (end[0] - start[0]);
            angle = Math.atan(k);
        } else if (start[0] == end[0]) { //垂直线
            angle = (start[1] <= end[1] ? 1 : -1) * Math.PI / 2;
        } else { //水平线
            angle = 0;
        }
        if (start[0] <= end[0]) {
            angle -= deltaAngle;
            dX = Math.round(Math.cos(angle) * distance);
            dY = Math.round(Math.sin(angle) * distance);
            mp[0] += dX;
            mp[1] += dY;
        } else {
            angle += deltaAngle;
            dX = Math.round(Math.cos(angle) * distance);
            dY = Math.round(Math.sin(angle) * distance);
            mp[0] -= dX;
            mp[1] -= dY;
        }
        return mp;
    }

    smoothSpline(points, isLoop) {
        let len = points.length;
        let ret = [];
        let distance = 0;
        for (let i = 1; i < len; i++) {
            distance += this.getDistance(points[i - 1], points[i]);
        }
        let segs = distance / 2;
        segs = segs < len ? len : segs;
        for (let i = 0; i < segs; i++) {
            let pos = i / (segs - 1) * (isLoop ? len : len - 1);
            let idx = Math.floor(pos);
            let w = pos - idx;
            let p0;
            let p1 = points[idx % len];
            let p2;
            let p3;
            if (!isLoop) {
                p0 = points[idx === 0 ? idx : idx - 1];
                p2 = points[idx > len - 2 ? len - 1 : idx + 1];
                p3 = points[idx > len - 3 ? len - 1 : idx + 2];
            } else {
                p0 = points[(idx - 1 + len) % len];
                p2 = points[(idx + 1) % len];
                p3 = points[(idx + 2) % len];
            }
            let w2 = w * w;
            let w3 = w * w2;

            ret.push([
                this.interpolate(p0[0], p1[0], p2[0], p3[0], w, w2, w3),
                this.interpolate(p0[1], p1[1], p2[1], p3[1], w, w2, w3)
            ]);
        }
        return ret;
    }

    interpolate(p0, p1, p2, p3, t, t2, t3) {
        let v0 = (p2 - p0) * 0.5;
        let v1 = (p3 - p1) * 0.5;
        return (2 * (p1 - p2) + v0 + v1) * t3 + (-3 * (p1 - p2) - 2 * v0 - v1) * t2 + v0 * t + p1;
    }

    getDistance(p1, p2) {
        return Math.sqrt(
            (p1[0] - p2[0]) * (p1[0] - p2[0]) +
            (p1[1] - p2[1]) * (p1[1] - p2[1])
        );
    }

    drawLinePath(context) {
        let fromPixel = this.options.map.getPixelFromCoordinate(this.from.location),
            toPixel = this.options.map.getPixelFromCoordinate(this.to.location);
        let pointList = this.path = this.getPointList(fromPixel, toPixel);
        let len = pointList.length;
        context.save();
        context.beginPath();
        context.lineWidth = this.options.lineWidth;
        context.strokeStyle = this.from.color;

        if (!this.options.lineType || this.options.lineType == 'solid') {
            context.moveTo(pointList[0][0], pointList[0][1]);
            for (let i = 0; i < len; i++) {
                context.lineTo(pointList[i][0], pointList[i][1]);
            }
        } else if (this.options.lineType == 'dashed' || this.options.lineType == 'dotted') {
            for (let i = 1; i < len; i += 2) {
                context.moveTo(pointList[i - 1][0], pointList[i - 1][1]);
                context.lineTo(pointList[i][0], pointList[i][1]);
            }
        }
        context.stroke();
        context.restore();
    }

    drawMoveCircle(context, batch, speed) {
        let fromPixel = this.options.map.getPixelFromCoordinate(this.from.location),
            toPixel = this.options.map.getPixelFromCoordinate(this.to.location);
        let pointList = this.path || this.getPointList(fromPixel, toPixel);

        if (!this.steps[batch]) {
            this.steps[batch] = {step: 0, progress: 0};
        }
        this.steps[batch].step = this.steps[batch].progress * pointList.length;
        let step = parseInt(this.steps[batch].step);
        if (step >= pointList.length) {
            delete this.steps[batch];
            return false;
        }

        context.save();
        context.fillStyle = this.options.fillColor;
        context.shadowColor = this.options.shadowColor;
        context.shadowBlur = this.options.shadowBlur;
        context.beginPath();
        let point = pointList[step];
        context.arc(point[0], point[1], this.options.moveRadius, 0, Math.PI * 2, true);
        context.fill();
        context.closePath();
        context.restore();
        let next = this.steps[batch].step + speed;
        if(this.steps[batch].step<pointList.length-1&&next>= pointList.length){
            this.steps[batch].step = pointList.length-1;
        }else{
            this.steps[batch].step = next;
        }

        if (this.steps[batch].step >= pointList.length) {
            if (this.options.repeat) {
                this.steps[batch].step = 0;
            }
        }
        this.steps[batch].progress = this.steps[batch].step / this.path.length;
    }
}