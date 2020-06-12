import {MarkLine} from "./MarkLine";

export class MoveLine {
    constructor(map, userOptions) {
        this.width = map.getSize()[0];
        this.height = map.getSize()[1];
        this.options = Object.assign({}, {
            //marker点半径
            markerRadius: 3,
            //marker点颜色,为空或null则默认取线条颜色
            markerColor: '#fff',
            //线条类型 solid、dashed、dotted
            lineType: 'solid',
            //线条宽度
            lineWidth: 1,
            //线条颜色
            colors: ['#F9815C', '#F8AB60', '#EDCC72', '#E2F194', '#94E08A', '#4ECDA5'],
            //移动点半径
            moveRadius: 2,
            //移动点颜色
            fillColor: '#fff',
            //移动点阴影颜色
            shadowColor: '#fff',
            //移动点阴影大小
            shadowBlur: 5,
            //数据源
            data: [],
            //是否重复动画
            repeat: false
        }, userOptions);
        this.map = map;                     //地图对象
        this.lineLayer = null;              //连线
        this.animationLayer = null;         //飞线
        this.markLines = [];                //连线对象
        this.steps = [];
        this.animationFlag = true;
        this.batchArr = [];                 //对不同批次的数据设置id
        this.speedArr = {};                 //不同批次的速度集合
        this.progressArr = {};              //不同批次的进度集合
        this.nowDataIds = {};               //当前展示的数据对象
        this.dataSource = [];               //数据源
        this.init();
    }

    addMarkLine() {
        //this.markLines = [];
        let dataset = this.dataSource;
        let nowIds = {};
        dataset.forEach((line, i) => {
            let id = line.from.location.join(',') + '/' + line.to.location.join(',');
            if (!this.nowDataIds[id]) {
                this.nowDataIds[id] = 1;

                let total = this.options.colors.length;
                let color = this.options.colors[parseInt(i % total)];
                let markLine = new MarkLine({
                    city: line.from.city,
                    location: line.from.location,
                    color
                }, {
                    city: line.to.city,
                    location: line.to.location,
                    color
                }, Object.assign({
                    id,
                    map: this.map,
                    speed: line.speed
                }, this.options));

                this.markLines.push(markLine);
            }
            nowIds[id] = 1;
        });
        for(let key in this.nowDataIds) {  //删除不再显示的连线
            if(!nowIds[key]) {
                delete this.nowDataIds[key];
                this.markLines.forEach((l, index)=>{
                    if(l.id===key) {
                        this.markLines.splice(index, 1);
                    }
                })
            }
        }
    }

    brush() {
        const that = this;
        let baseCtx = this.lineLayer.getContext('2d');
        if (!baseCtx) {
            return;
        }

        if (this.markLines.length) {
            this.markLines.forEach((l, index) => {
                this.batchArr.forEach((batch) => {
                    if (!this.progressArr[batch]) {
                        this.progressArr[batch] = [];
                    }
                    this.progressArr[batch][index] = l.getProgress(batch);
                })
            })
        }

        this.addMarkLine();

        baseCtx.clearRect(0, 0, this.width, this.height);

        this.markLines.forEach((line, index) => {
            line.drawLinePath(baseCtx);
            this.batchArr.forEach((batch) => {
                if (this.progressArr[batch][index]) {
                    line.setProgress(batch, this.progressArr[batch][index]);
                }
            })
        });
    }

    //上层canvas渲染，动画效果
    render() {
        let animationCtx = this.animationLayer.getContext('2d');
        if (!animationCtx) {
            return;
        }

        if (!this.animationFlag) {
            animationCtx.clearRect(0, 0, this.width, this.height);
            this.lineLayer.getContext('2d').clearRect(0, 0, this.width, this.height);
            return;
        }

        animationCtx.fillStyle = 'rgba(0,0,0,.93)';
        let prev = animationCtx.globalCompositeOperation;
        animationCtx.globalCompositeOperation = 'destination-in';
        animationCtx.fillRect(0, 0, this.width, this.height);
        animationCtx.globalCompositeOperation = prev;

        this.batchArr.forEach((batch, index) => {
            let isComplete = true;
            for (let i = 0; i < this.markLines.length; i++) {
                let markLine = this.markLines[i];
                if (markLine.getProgress(batch) < 1) {
                    markLine.drawMoveCircle(animationCtx, batch, this.speedArr[batch][i]); //移动圆点
                    isComplete = false;
                }
            }
            if (isComplete) {
                delete this.progressArr[batch];
                delete this.speedArr[batch];
                this.batchArr.splice(index, 1);
            }
        });
    }

    mouseInteract() {
        this.map.addEventListener('movestart', () => {
            this.animationFlag = false;
        });

        this.map.addEventListener('moveend', () => {
            this.brush();
            this.animationFlag = true;
        });
    }

    init() {
        const that = this;
        let canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        canvas.style.cssText = 'position:absolute;z-index:3;';
        this.animationLayer = canvas;
        this.map.getViewport().appendChild(canvas);

        let canvas2 = document.createElement('canvas');
        canvas2.width = this.width;
        canvas2.height = this.height;
        canvas2.style.cssText = 'position:absolute;z-index:2;';
        this.lineLayer = canvas2;
        this.map.getViewport().appendChild(canvas2);

        this.mouseInteract();

        this.pushBatch(this.options.data);

        (function drawFrame() {
            let start = new Date().getTime();
            requestAnimationFrame(drawFrame);
            that.render();
            console.log(new Date().getTime()-start);
        }());
    }

    pushBatch(data) {
        this.dataSource = data;
        this.brush();
        let batch = new Date().getTime() + Math.round(Math.random() * 100) + '';
        this.batchArr.push(batch);
        this.speedArr[batch] = [];
        data.forEach((item, index) => {
            this.speedArr[batch][index] = item.speed || 1;
        })
    }
}