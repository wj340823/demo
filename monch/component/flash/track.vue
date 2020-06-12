<template>
    <div class="vueol-track" style="display: none;">
        <slot :selectPoint="selectPoint"></slot>
    </div>
</template>
<script>
    import {Vector as VectorLayer, VectorImage as VectorImageLayer} from 'ol/layer';
    import {Vector as VectorSource} from 'ol/source';
    import Feature from 'ol/Feature';
    import {Point, LineString} from 'ol/geom';
    import {getVectorContext} from "ol/render";
    import {
        createStyle,
        validCoords,
        dateFormat,
        stringToStamp,
        getGeodesicDistance,
        removeOverlay,
        setLabelEvent,
        deepClone
    } from "../../util/helpers";
    import {transform} from "ol/proj";
    import {containsCoordinate} from "ol/extent";
    import {unByKey} from "ol/Observable";

    import Bus from '../../util/bus';

    export default {
        name: 'ol-track',
        inject: ['getMap'],
        props: {
            layerIndex: {   //轨迹播放基于哪个图层的渲染事件，要求该图层永远在视图内并且层级最高
              type: Number,
              default: 0
            },
            points: {   //轨迹点位坐标
                type: Array,
                required: true,
                default() {
                    return [];
                },
                validator(value) {
                    return value.length > 2;
                }
            },
            curIndex: {
                type: Number,
                default: 0
            },
            curTime: {   //和开始时间相差的毫秒数
                type: Number,
                default: 0
            },
            node: {  //轨迹节点样式
                type: Object,
                required: true,
                validator(value) {   //canvas渲染 样式必须预加载图片
                    return value.img && value.imgSize;
                }
            },
            marker: {
                type: Object,
                required: true,
                validator(value) {
                    return value.img && value.imgSize;
                }
            },
            lineStyle: {   //轨迹线样式
                type: Object,
                default() {
                    return {
                        stroke: {
                            color: '#2058A5',
                            width: 4
                        }
                    }
                }
            },
            nodeShow: {   //节点显示层级
                type: Number,
                default: 14
            },
            speed: {    //播放速度
                type: Number,
                default: 1
            },
            maxSpeed: {    //轨迹主体最大速度，间距过大，轨迹不真实，用虚线表现
                type: Number,
                default: 34
            },
            zIndex: {
                type: Number,
                default: 0
            },
            projection: {
                type: String,
                default: 'EPSG:4326'
            },
            isInterpolate: {   //是否需要插值计算
                type: Boolean,
                default: false
            },
            maxMinutes: {    //插值最大时间间隔
                type: Number,
                default: 2
            },
            overLabel: String   //是否显示默认悬浮弹框
        },
        data() {
            return {
                curNodeIndex: 0,
                curSegIndex: 0,
                selectPoint: null
            }
        },
        watch: {
            speed() {
                this.changeSpeed();
            },
            curIndex(nval) {
                this.curNodeIndex = nval;
                this.goStep(nval);
            },
            curNodeIndex(nval) {
                this.$emit("update:curIndex", nval);
                let start = this.normalizedPoints[0].timestamp;
                this.$emit("update:curTime", this.normalizedPoints[nval].timestamp - start);
            },
            curSegIndex(nval) {
                if (nval != -1 && this.isInterpolate) {
                    let start = this.normalizedPoints[0].timestamp;
                    if (!this.segVirPoints[nval]) {
                        console.log("seg", nval);
                        return;
                    }
                    this.$emit("update:curTime", this.segVirPoints[nval].timestamp - start);
                }
            },
            curTime(nval) {
                if (this.isInterpolate) {
                    this.goTime(nval / 1000);
                }
            }
        },
        methods: {
            init() {
                this.initData();  //变量初始化
                if (!this.isValid(this.points)) {
                    console.error("请检查经纬度是否有效！");
                    return false;
                }

                this.normalizedPoints = this.handlePoints(this.points);  //真实点位

                if (this.isInterpolate) {
                    this.segVirPoints = this.interpolateSegment(0, this.normalizedPoints);   //当前的虚拟路段点位数组
                }

                this.getMap().then((map) => {
                    this.map = map;
                    this.viewProjection = map.getView().getProjection().getCode();
                    this.virtualLayer = this.createLayer(map);   //虚拟点位图层
                    this.layer = this.createLayer(map);    //真实点位图层
                    this.source = this.layer.getSource();
                    this.drawMarker();  //绘制轨迹主体

                    //this.endPointLayer = this.drawEndPointLayer(map);

                    this.listenEvent();   //监听地图事件
                })
            },
            initData() {
                this.map = null;
                this.virtualLayer = null;   //虚拟图层
                this.layer = null;   //图层对象
                this.source = null;  //数据源对象
                this.currentGeo = null;   //轨迹回放主体
                this.featureGeo = null;   //轨迹回放主体
                this.endPointLayer = null;  //绘制起点、终点图标的图层

                this.normalizedPoints = [];   //真实点位
                this.segVirPoints = [];   //当前的虚拟路段点位数组
                this.segVirPoints_next = [];   //下一段的虚拟路段点位数组

                this.curNodeIndex = 0;   //当前真实点位位置序号
                this.curSegIndex = -1;   //当前虚拟路段序号

                //样式
                this.styles = {};
                let nodeImg = new Image();
                nodeImg.src = this.node.img;
                this.styles.node = createStyle({
                    image: {
                        icon: {
                            anchor: this.node.anchor || [0.5, 0.5],
                            img: nodeImg,
                            imgSize: this.node.imgSize
                        }
                    }
                });
                let markerImg = new Image();
                markerImg.src = this.marker.img;
                this.styles.marker = createStyle({
                    zIndex: 2,
                    image: {
                        icon: {
                            anchor: this.marker.anchor || [0.5, 0.5],
                            img: markerImg,
                            imgSize: this.marker.imgSize
                        }
                    }
                })
                this.styles.line = createStyle(this.lineStyle);

                this.hisTimer = null;   //定时器
                this.renderEventKey = null;   //地图渲染事件监听
                this.exsitIndex = [];   //已绘制过的矢量序号
            },

            /**
             *  @description: 判断点位数组是否合乎规范
             *  @param points: 组件外传入的轨迹点位数组
             *  @return Boolean
             *  @author xrx
             *  @date 2019/5/8 17:02
             */
            isValid(points) {
                let len = points.length;
                for (let i = 0; i < len; i++) {
                    let p = points[i];
                    let lon = p.lon,
                        lat = p.lat;
                    if (this.projection == "EPSG:4326") {
                        return validCoords(lon, lat);
                    }
                }
                return true;
            },

            /**
             *  @description: 为了使轨迹运动更流畅更直观，通过插值生成虚拟点位
             *  @param arr: 原生点位数组
             *  @return tempPoints：object 真实点位数组和虚拟点位数组
             *  @author xrx
             *  @date 2019/5/13 13:21
             */
            handlePoints(arr) {
                // console.log("遍历开始", dateFormat(new Date(), "yyyy-MM-dd HH:mm:ss"));
                let points = arr.map(p => {
                    let item = p;
                    item.lon = parseFloat(p.lon);
                    item.lat = parseFloat(p.lat);
                    if (typeof item.time == "string") {
                        item.timestamp = stringToStamp(item.time, "-", ":");
                    } else if (typeof item.time == "number") {
                        item.timestamp = item.time;
                        item.time = dateFormat(item.timestamp, "yyyy-MM-dd HH:mm:ss");
                    } else {
                        console.error("请检查time格式！");
                    }
                    return item;
                });
                //console.log("遍历结束", dateFormat(new Date(), "yyyy-MM-dd HH:mm:ss"));

                return points;
            },

            /**
             *  @description: 为了使轨迹运动更流畅更直观，通过对每一段真实轨迹插值生成虚拟点位
             *  @param  points: 原生点位数组
             *  @return tempPoints：object 虚拟点位数组
             *  @author xrx
             *  @date 2019/5/13 13:21
             */
            interpolateSegment(i, points) {
                if (!this.isInterpolate) {
                    return;
                }
                // console.log("开始插值", dateFormat(new Date(), "yyyy-MM-dd HH:mm:ss"));
                let tempPoints = [];
                let p1 = points[i],
                    p2 = points[i + 1];
                let tDiff = p2.timestamp - p1.timestamp;
                const COUNT = parseInt(tDiff / 1000);
                if (COUNT > 60 * this.maxMinutes) {  //时间间隔大于最大值
                    return [p1, p2];
                }
                const xDiff = p2.lon - p1.lon,
                    yDiff = p2.lat - p1.lat,
                    speddDiff = p2.speed - p1.speed;
                for (let j = 1; j <= COUNT; j++) {
                    let item = {
                        lon: p1.lon + xDiff * (j / COUNT),
                        lat: p1.lat + yDiff * (j / COUNT),
                        timestamp: p1.timestamp + tDiff * (j / COUNT),
                        time: dateFormat(p1.timestamp + tDiff * (j / COUNT), "yyyy-MM-dd HH:mm:ss"),
                        speed: p1.speed + speddDiff * (j / COUNT),
                        direction: p1.direction
                    }

                    /*if (isNaN(p1.lon + xDiff * (j / COUNT))) {
                        console.log(i);
                    }*/
                    tempPoints.push(item);
                }

                //console.log("插值结束", dateFormat(new Date(), "yyyy-MM-dd HH:mm:ss"));
                return tempPoints;
            },

            //创建图层
            createLayer(map) {
                const vm = this;
                let source = new VectorSource();
                let layer = new VectorImageLayer({
                    source,
                    zIndex: this.zIndex,
                    style(feature, resolution) {
                        if (feature.get('finished')) {
                            let type = feature.get('type');
                            if (feature.get('rotation') != null) { //图标
                                vm.styles[type].getImage().setRotation(feature.get('rotation'));
                            }

                            if (type == "line") {
                                if (feature.get("lineDash")) { //线
                                    vm.styles["line"].getStroke().setLineDash([4, 10]);
                                } else {
                                    vm.styles["line"].getStroke().setLineDash(undefined);
                                }
                                if(feature.get("lineColor")) {
                                    vm.styles["line"].getStroke().setColor(feature.get("lineColor"));
                                }else {
                                    let color = 'blue';
                                    if(vm.lineStyle.stroke&&vm.lineStyle.stroke.color) {
                                        color = vm.lineStyle.stroke.color;
                                    }
                                    vm.styles["line"].getStroke().setColor(color);
                                }
                            }
                            if (type == "node") {
                                const zoom = map.getView().getZoomForResolution(resolution);
                                if (zoom < vm.nodeShow) {
                                    vm.styles["node"].getImage().setOpacity(0);
                                } else {
                                    vm.styles["node"].getImage().setOpacity(1);
                                }
                            }

                            return vm.styles[type];
                        } else {
                            return null;
                        }
                    }
                });
                layer.set("trackLayer", true);
                map.addLayer(layer);

                return layer;
            },

            //绘制轨迹主体
            drawMarker() {
                let point = this.normalizedPoints[0];
                this.currentGeo = new Point([point.lon, point.lat]);
                this.currentGeo = this.currentGeo.transform(this.projection, this.viewProjection);
                this.featureGeo = new Feature(this.currentGeo);
                this.featureGeo.set("type", "marker");
                this.featureGeo.set("finished", true);
                this.source.addFeature(this.featureGeo);

                this.featureGeo.set("featureInfo", {
                    type: "trackMarker",
                    data: Object.assign(deepClone(point), {coords: [point.lon, point.lat]})
                })
            },

            /**
             *  @description: 在临时图层上绘制当前轨迹节点
             *  @param vectorContext: For canvas, this is an instance of module:ol/render/canvas/Immediate
             *  @author xrx
             *  @date 2019/5/8 16:33
             */
            createNodes(vectorContext) {
                let end = this.curNodeIndex-1;
                if(this.curSegIndex>=0) {
                    end = this.curNodeIndex;
                }
                for (let i = 0; i <= end; i++) {
                    let point = this.normalizedPoints[i];
                    let pointGeo = new Point([point.lon, point.lat]);
                    pointGeo = pointGeo.transform(this.projection, this.viewProjection);
                    let featurePoint = new Feature(pointGeo);
                    let style = this.styles.node;
                    const rotation = point.direction ? parseFloat(point.direction) / 180 * Math.PI : 0;
                    style.getImage().setRotation(rotation);
                    if (this.map.getView().getZoom() < this.nodeShow) {
                        style.getImage().setOpacity(0);
                    } else {
                        style.getImage().setOpacity(1);
                    }
                    vectorContext.drawFeature(featurePoint, style);
                }
            },

            createMarker(vectorContext) {
                let point;
                if (this.curSegIndex == -1) {
                    point = this.normalizedPoints[this.curNodeIndex];
                } else {
                    point = this.segVirPoints[this.curSegIndex];
                }

                let markerGeo = new Point([point.lon, point.lat]);
                markerGeo = markerGeo.transform(this.projection, this.viewProjection);
                let featureGeo = new Feature(markerGeo);
                let style = this.styles.marker;
                if (style && style.getImage() && (style.getImage().getRotation() != undefined)) {
                    let rotation = point.direction ? parseFloat(point.direction) / 180 * Math.PI : 0;
                    style.getImage().setRotation(rotation);
                }
                vectorContext.drawFeature(featureGeo, style);

                let requestedPosition;
                if (this.projection === 'pixel') {
                    requestedPosition = [point.lon, point.lat];
                } else {
                    requestedPosition = transform([point.lon, point.lat], this.projection, this.viewProjection);
                }

                //若车辆跑到了可视范围之外，移动地图居中
                let view = this.map.getView();
                let size = this.map.getSize();
                let extent = view.calculateExtent(size);
                if (!containsCoordinate(extent, requestedPosition)) {
                    view.setCenter(requestedPosition);
                }
            },

            /**
             *  @description: 在临时图层上绘制当前轨迹路线
             *  @param vectorContext: For canvas, this is an instance of module:ol/render/canvas/Immediate
             *  @author xrx
             *  @date 2019/5/8 16:34
             */
            createLine(point, point2) {
                let coords = [[point.lon, point.lat], [point2.lon, point2.lat]];
                let lineGeo = new LineString(coords);
                lineGeo = lineGeo.transform(this.projection, this.viewProjection);
                return new Feature(lineGeo);
            },
            getLineStyle(point, point2) {
                let style = this.styles.line.clone();
                if (point.timestamp) {
                    const s = getGeodesicDistance(this.projection, [point2.lon, point2.lat], [point.lon, point.lat]);
                    if (s > this.maxSpeed * (point2.timestamp - point.timestamp) / 1000) { //间距过大，轨迹不真实，用虚线表现
                        style.getStroke().setLineDash([4, 10]);
                    } else {
                        if (style.getStroke().getLineDash()) {
                            style.getStroke().setLineDash(undefined);
                        }
                    }
                }
                if(point.color) {
                    style.getStroke().setColor(point.color);
                }

                return style;
            },
            createLines(vectorContext) {
                for (let i = 1; i <= this.curNodeIndex; i++) {
                    let point = this.normalizedPoints[i - 1], point2 = this.normalizedPoints[i];
                    let style = this.getLineStyle(point, point2);
                    vectorContext.drawFeature(this.createLine(point, point2), style);
                }

                for (let i = 0; i <= this.curSegIndex; i++) {
                    let point, point2;
                    if (i == 0) {
                        point = this.normalizedPoints[this.curNodeIndex];
                        point2 = this.segVirPoints[i];
                    } else {
                        point = this.segVirPoints[i - 1];
                        point2 = this.segVirPoints[i];
                    }
                    let style = this.getLineStyle(point, point2);
                    vectorContext.drawFeature(this.createLine(point, point2), style);
                }
            },
            moveFeature(event) {
                const vm = this;
                let vectorContext = getVectorContext(event);

                vm.createLines(vectorContext);
                vm.createNodes(vectorContext);
                vm.createMarker(vectorContext);

                // tell OpenLayers to continue the postcompose animation
                this.map.render();
            },
            listenRender() {
                let layer = this.map.getLayers().item(this.layerIndex);
                this.renderEventKey = layer.on('postrender', this.moveFeature);
                this.map.render();
            },

            /**
             *  @description: 绘制真实轨迹图层和虚拟轨迹图层中的矢量
             *  @author xrx
             *  @date 2019/5/14 11:34
             */
            drawNode(point, i) {
                let coords = [point.lon, point.lat];
                let currentNode = new Point(coords);
                currentNode = currentNode.transform(this.projection, this.viewProjection);
                let featurePoint = new Feature({
                    geometry: currentNode,
                    type: "node",
                    index: i,
                    featureInfo: {
                        type: 'trackNode',
                        data: Object.assign(deepClone(point), {coords: [point.lon, point.lat]})
                    }
                });

                let rotation = point.direction ? parseFloat(point.direction) / 180 * Math.PI : 0;
                featurePoint.set("rotation", rotation);
                return featurePoint;
            },
            drawLine(i, point, point2) {
                let coords = [point.lon, point.lat],
                    coords2 = [point2.lon, point2.lat];

                //线
                let currentLine = new LineString([coords, coords2]);
                currentLine = currentLine.transform(this.projection, this.viewProjection);
                let featureLine = new Feature({
                    geometry: currentLine,
                    type: "line",
                    index: i + 1
                });
                if (point.timestamp) {
                    let s = getGeodesicDistance(this.projection, coords2, coords);
                    if (s > this.maxSpeed * (point2.timestamp - point.timestamp) / 1000) { //间距过大，轨迹不真实，用虚线表现
                        featureLine.set("lineDash", true);
                    } else {
                        featureLine.set("lineDash", false);
                    }
                }

                if(point.color) {
                    featureLine.set("lineColor", point.color);
                }
                return featureLine;
            },
            drawFact(index) {
                for (let i = 1; i <= index; i++) {
                    if (this.exsitIndex.indexOf(i) != -1) {
                        continue;
                    }

                    let point = this.normalizedPoints[i - 1],
                        point2 = this.normalizedPoints[i];
                    this.source.addFeature(this.drawLine(i - 1, point, point2));  //绘制线

                    this.source.addFeature(this.drawNode(this.normalizedPoints[i - 1], i - 1));   //绘制节点

                    this.exsitIndex.push(i);
                }

                if(this.curSegIndex>=0) {
                    this.source.addFeature(this.drawNode(this.normalizedPoints[index], index));
                }
            },
            draw() {
                this.drawFact(this.curNodeIndex);

                this.virtualLayer.getSource().clear();
                for (let i = 0; i <= this.curSegIndex; i++) {
                    let point, point2;
                    if (i == 0) {
                        point = this.normalizedPoints[this.curNodeIndex];
                        point2 = this.segVirPoints[i];
                    } else {
                        point = this.segVirPoints[i - 1];
                        point2 = this.segVirPoints[i];
                    }
                    this.virtualLayer.getSource().addFeature(this.drawLine(i - 1, point, point2));
                }
            },

            setMarkerPosition() {
                let point;
                if (this.curSegIndex == -1) {
                    point = this.normalizedPoints[this.curNodeIndex];
                } else {
                    point = this.segVirPoints[this.curSegIndex];
                }
                this.currentGeo.setCoordinates(transform([point.lon, point.lat], this.projection, this.viewProjection));
                this.featureGeo.set('finished', true);
                const rotation = point.direction ? parseFloat(point.direction) / 180 * Math.PI : 0;
                this.featureGeo.set("rotation", rotation);

                this.featureGeo.set("featureInfo", {
                    type: "trackMarker",
                    data: Object.assign(deepClone(point), {coords: [point.lon, point.lat]})
                })
            },

            /**
             *  @description: 播放 暂停 停止 跳转 改变速度
             *  @author xrx
             *  @date 2019/5/14 11:35
             */

            createTimer(interval) {
                const vm = this;
                vm.source.getFeatures().forEach(function (feature) {
                   // if (feature != vm.featureGeo) {
                        feature.set('finished', false);
                  //  }
                })
                vm.virtualLayer.getSource().getFeatures().forEach((feature) => {
                    feature.set('finished', false);
                })

                vm.hisTimer = setInterval(() => {
                    if (vm.curNodeIndex >= vm.normalizedPoints.length - 1) {
                        vm.pause();
                    } else {
                        if (this.isInterpolate) {
                            if (vm.curSegIndex == vm.segVirPoints.length - 1) {
                                vm.curNodeIndex++;
                                vm.segVirPoints = vm.segVirPoints_next;   //当前路段走完，走下一段
                                vm.curSegIndex = -1;
                            }

                            vm.curSegIndex++;
                            if (vm.curSegIndex == 0) {
                                //计算下一段插值
                                vm.segVirPoints_next = vm.interpolateSegment(vm.curNodeIndex + 1, vm.normalizedPoints);
                            }
                        } else {
                            vm.curNodeIndex++;
                        }
                        // vm.$emit("update:curIndex", vm.curNodeIndex);
                    }
                }, interval);
            },
            play() {
                let interval = 1000 / this.speed;
                this.listenRender();

                this.createTimer(interval);
            },
            pause() {
                if (this.hisTimer) {
                    clearInterval(this.hisTimer);
                    this.hisTimer = null;
                }

                unByKey(this.renderEventKey);
                this.draw();  //绘制矢量
                this.source.getFeatures().forEach((feature) => {
                    if (feature.get("index") <= this.curNodeIndex) {
                        feature.set('finished', true);
                    }
                })

                if (this.isInterpolate) {
                    this.virtualLayer.getSource().getFeatures().forEach((feature) => {
                        if (feature.get("index") <= this.curSegIndex) {
                            feature.set('finished', true);
                        }
                    })
                }

                this.setMarkerPosition();   //轨迹主体位置
            },
            stop() {
                if (this.hisTimer) {
                    clearInterval(this.hisTimer);
                    this.hisTimer = null;
                }
                this.curNodeIndex = 0;
                this.curSegIndex = -1;
                this.segVirPoints = this.interpolateSegment(0, this.normalizedPoints);
                //this.$emit("update:curIndex", this.curNodeIndex);

                unByKey(this.renderEventKey);

                this.source.getFeatures().forEach((feature) => {
                    feature.set('finished', false);
                })

                if (this.isInterpolate) {
                    this.virtualLayer.getSource().getFeatures().forEach((feature) => {
                        feature.set('finished', false);
                    })
                }

                this.setMarkerPosition();   //轨迹主体位置
            },

            /**
             *  @description: 跳转到真实节点
             *  @param index 为真实点位序号
             *  @author xrx
             *  @date 2019/5/14 11:47
             */
            goStep(index) {
                this.curNodeIndex = index;
                this.curSegIndex = -1;
                if (this.curNodeIndex < this.normalizedPoints.length - 1) {
                    this.segVirPoints = this.interpolateSegment(this.curNodeIndex, this.normalizedPoints);
                }

                if (!this.hisTimer) {
                    this.draw();
                    this.source.getFeatures().forEach((feature) => {
                        if (feature.get("index") <= this.curNodeIndex) {
                            feature.set('finished', true);
                        } else {
                            feature.set('finished', false);
                        }
                    })
                    this.virtualLayer.getSource().clear();

                    this.setMarkerPosition();   //轨迹主体位置
                }
            },
            changeSpeed() {
                let interval = 1000 / this.speed;
                if (this.hisTimer) {
                    clearInterval(this.hisTimer);
                    this.createTimer(interval);
                }
            },
            findValue(arr, ms) {
                let total = arr.length;
                if (total == 1) {
                    return arr[0].index;
                }
                let mid = parseInt(total / 2);
                if (arr[mid].timestamp > ms) {
                    return this.findValue(arr.slice(0, mid), ms);
                } else if (arr[mid].timestamp < ms) {
                    return this.findValue(arr.slice(mid), ms);
                } else {
                    return arr[mid].index;
                }
            },

            /**
             *  @description: 跳到转时间点
             *  @param seconds：number  和开始时间相差的秒数
             *  @return void
             *  @author xrx
             *  @date 2019/5/14 13:54
             */
            goTime(seconds) {
                if (!this.isInterpolate) {
                    return;
                }
                let start = this.normalizedPoints[0].timestamp;
                let arr = this.normalizedPoints.map((item, index) => {
                    item.index = index;
                    return item;
                })
                console.log("搜索位置", dateFormat(new Date(), "yyyy-MM-dd HH:mm:ss"));
                this.curNodeIndex = this.findValue(arr, start + seconds * 1000);
                console.log("搜索位置结束", dateFormat(new Date(), "yyyy-MM-dd HH:mm:ss"));
                this.curSegIndex = (start + seconds * 1000 - this.normalizedPoints[this.curNodeIndex].timestamp) / 1000 - 1;
                this.segVirPoints = this.interpolateSegment(this.curNodeIndex, this.normalizedPoints);
                // this.$emit("update:curIndex", this.curNodeIndex);

                if (!this.hisTimer) {
                    this.draw();
                    this.source.getFeatures().forEach((feature) => {
                        if (feature.get("index") <= this.curNodeIndex) {
                            feature.set('finished', true);
                        } else {
                            feature.set('finished', false);
                        }
                    })
                    this.virtualLayer.getSource().getFeatures().forEach((feature) => {
                        if (feature.get("index") <= this.curSegIndex) {
                            feature.set('finished', true);
                        } else {
                            feature.set('finished', false);
                        }
                    })

                    this.setMarkerPosition();   //轨迹主体位置
                }
            },
            showNameOverlay(map, feature, data) {
                const vm = this;
                //悬浮时，先移除其它的弹出框
                removeOverlay(map, null, "overLabel");

                let label = null;
                if (vm.overLabel == "none") {
                    return false;
                }
                label = setLabelEvent(feature, map, data);
                if (label) {
                    label.set("overLabel", "true"); //与其他的弹出框区分
                }
                return label;
            },
            listenerMove(data) {
                const vm = this;
                if (data.olLayer == vm.layer) {
                    vm.$emit("pointermove", data);
                    if (data.feature.get("type") == "node") {
                        const coords = data.feature.getGeometry().getCoordinates();
                        vm.showNameOverlay(vm.map, data.feature, {
                            lat: coords[1],
                            lon: coords[0],
                            projection: vm.viewProjection,
                            label: {
                                classNm: "featureOver trackOver",
                                message: data.feature.get("featureInfo").data.time || "空"
                            }
                        })
                    }
                }
            },
            listenerMove_blank() {
                const vm = this;
                removeOverlay(vm.map, null, "overLabel");   //移除名称弹框
            },
            listenerClick(data) {
                const vm = this;
                if (data.olLayer == vm.layer) {
                    vm.$emit("singleclick", data);

                    const feature = data.feature;
                    let type = feature.get("type");
                    if (type == "node" || type == "marker") {
                        vm.selectPoint = feature.get("featureInfo").data;
                    }
                }
            },
            listenerClick_blank() {
                const vm = this;
                vm.selectPoint = null;   //选中图标为空
            },
            listenEvent() {
                const vm = this;
                const mapId = this.map.getTarget().id || "default";
                Bus.$on(mapId + ".track.pointermove", vm.listenerMove);

                //地图空白处悬浮
                Bus.$on(mapId + ".pointermove.blank", vm.listenerMove_blank);

                Bus.$on(mapId + ".track.singleclick", vm.listenerClick);
                //地图空白处 点击
                Bus.$on(mapId + ".singleclick.blank", vm.listenerClick_blank);
            }
        },
        mounted() {
            this.init();
        },
        beforeDestroy() {
            const vm = this;
            vm.getMap().then((map) => {
                vm.source.clear();
                unByKey(this.renderEventKey);
                map.removeLayer(vm.layer);

                vm.virtualLayer.getSource().clear();
                map.removeLayer(vm.virtualLayer);

                const mapId = map.getTarget().id || "default";
                Bus.$off(mapId + ".track.pointermove", vm.listenerMove);
                Bus.$off(mapId + ".pointermove.blank", vm.listenerMove_blank);
                Bus.$off(mapId + ".track.singleclick", vm.listenerClick);
                Bus.$off(mapId + ".singleclick.blank", vm.listenerClick_blank);
            });

            this.curNodeIndex = 0;
            if (this.hisTimer) {
                clearInterval(this.hisTimer);
            }
        }
    }
</script>
