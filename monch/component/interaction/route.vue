<template>
    <div class="vueol-interaction-route" style="display: none;">
        <slot :selectPoint="selectPoint"></slot>
    </div>
</template>

<script>
    import {Vector as VectorLayer} from 'ol/layer';
    import {Vector as VectorSource} from 'ol/source';
    import {Point, LineString} from 'ol/geom';
    import {Draw, Modify, Snap} from 'ol/interaction';
    import {transform as transformProjection} from 'ol/proj';
    import {unByKey} from 'ol/Observable';
    import {Style, Circle, Fill, Stroke} from 'ol/style';
    import {DoubleClickZoom} from 'ol/interaction';
    import {createFeature, transformStyle, createStyle} from "../../util/helpers";

    export default {
        name: "ol-draw-route",
        inject: ['getMap'],
        props: {
            isModify: {
                type: Boolean,
                default: true
            },
            icon: {   //图标样式
                type: Object,
                default: function () {
                    return {
                        image: {
                            circle: {
                                radius: 6,
                                fill: {
                                    color: "#0099ff"
                                },
                                stroke: {
                                    color: "#fff",
                                    width: 1
                                }
                            }
                        }
                    }
                }
            },
            lineStyle: {   //轨迹线样式
                type: Object,
                default() {
                    return {
                        stroke: {
                            color: '#2058A5',
                            width: 2
                        }
                    }
                }
            },
            modifyColor: {
                type:String | Array,
                default: '#1d94f7'
            },
            zIndex: {
                type: Number,
                default: 0
            },
            projection: {
                type: String,
                default: 'EPSG:4326'
            },
            hasFeatures: {
                type: Array,
                default() {
                    return [];
                }
            },
            newId: [String, Number],   //新增触发器，用作新增feature的id
            isSingle: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                selectPoint: null
            }
        },
        watch: {
            hasFeatures() {
                this.source.clear();
                this.getMap().then((map) => {
                    this.loadFeatures(map);
                })
            },
            isModify(nval) {
                this.modify.setActive(nval);
            },
            newId() {
                this.getMap().then((map) => {
                    this.addFeature(map);
                })
            }
        },
        created() {
            this.init();
        },
        methods: {
            init() {
                this.initData();
                this.getMap().then((map) => {
                    this.map = map;
                    this.viewProjection = map.getView().getProjection().getCode();
                    this.layer = this.createLayer(map);
                    this.pointLayer = this.createPointLayer(map);

                    this.modify = this.addModify();
                    map.addInteraction(this.modify);

                    //加载已有数据
                    this.loadFeatures();

                    this.listenEvent();
                })
            },
            initData() {
                this.layer = null;
                this.source = null;
                this.pointLayer = null;
                this.pointSource = null;
                this.draw = null;
                this.snap = null;
                this.modify = null;
                this.curFeature = null;  //当前绘制的线段矢量
                this.style = null;   //线样式
                this.drawing = false;  //是否正在绘制
                this.listenChanges = [];   //feature的change事件监听器
                this.listener = null;  //地图点击事件监听器
            },

            //去掉双击放大交互
            removeDblZoom() {
                let result = this.map.getInteractions();
                result.forEach(r => {
                    if (r instanceof DoubleClickZoom) {
                        this.map.removeInteraction(r);
                    }
                });
            },
            //添加双击放大交互
            addDblZoom() {
                let result = this.map.getInteractions(), flag = false;
                result.forEach(r => {
                    if (r instanceof DoubleClickZoom) {
                        flag = true;
                    }
                });
                if (!flag) {
                    this.map.addInteraction(new DoubleClickZoom());
                }
            },
            modifyEnd(evt) {
                const vm = this;
                vm.drawing = false;
                let fs = vm.source.getFeatures();
                let arr = fs.filter(f => {
                    let geo = f.getGeometry();
                    return geo instanceof LineString;
                });
                let results = arr.map(f => {
                    let geo = f.getGeometry();
                    if (vm.projection != 'pixel') {
                        geo = geo.clone().transform(vm.map.getView().getProjection(), vm.projection);
                    }
                    let requestedPosition = geo.getCoordinates();

                    return {
                        coords: requestedPosition,
                        fId: f.get("id")
                    }
                })
                vm.$emit("modifyend", results);  //把线的坐标数据传出
            },
            addModify() {
                const vm = this;
                let modify = new Modify({
                    source: vm.pointSource,
                    deleteCondition: function (e) {
                        return false;
                    },
                    insertVertexCondition() {
                        return false;
                    },
                    style: function() {
                        return new Style({
                            image: new Circle({
                                radius: 5,
                                fill: new Fill({
                                    color: vm.modifyColor
                                }),
                                stroke: new Stroke({
                                    width: 1,
                                    color: 'white'
                                })
                            })
                        })
                    }
                });
                modify.setActive(vm.isModify);
                vm.modifyStartEvent = modify.on('modifystart', e => {
                    vm.drawing = true;
                    vm.selectPoint = null;
                    vm.$emit("modifystart", e);
                });
                vm.modifyEndEvent = modify.on('modifyend', vm.modifyEnd);

                return modify;
            },
            createLayer(map) {
                const vm = this;
                vm.source = new VectorSource();
                let layer = new VectorLayer({
                    source: vm.source,
                    style: function () {
                        return transformStyle(Object.assign({}, vm.lineStyle, vm.icon));
                    },
                    zIndex: vm.zIndex
                });
                layer.set("routeLayer", true);
                map.addLayer(layer);

                return layer;
            },
            createPointLayer(map) {
                const vm = this;
                vm.pointSource = new VectorSource();
                let layer = new VectorLayer({
                    source: vm.pointSource,
                    style: function () {
                        return transformStyle(Object.assign({zIndex: 2}, vm.icon));
                    },
                    zIndex: vm.zIndex
                });
                layer.set("routeLayer", true);
                map.addLayer(layer);
                return layer;
            },
            createNode(data) {
                let {id} = data;
                let feature = createFeature(data, this.viewProjection);
                feature.set("name", "drawNode");
                feature.set("nodeIndex", id.split("-")[1]);
                feature.setId(id);
                this.pointSource.addFeature(feature);

                //监听节点变化 更新线坐标
                let listenChange = feature.on("change", (evt) => {
                    let {target} = evt;
                    let fidArr = target.getId().split("-");
                    let lineId = fidArr[0], nodeIndex = target.get("nodeIndex");
                    let line = this.source.getFeatureById(lineId).getGeometry();
                    let lineCoords = line.getCoordinates();
                    let nodeCoords = target.getGeometry().getCoordinates();
                    lineCoords[nodeIndex] = nodeCoords;  //更新线节点坐标
                    line.setCoordinates(lineCoords);
                })
                this.listenChanges.push(listenChange);
            },
            drawStart(evt) {
                const vm = this;
                vm.drawing = true;
                vm.curFeature = evt.feature; //绘制的要素
                vm.curFeature.set("id", vm.newId);
                vm.curFeature.setId(vm.newId);
            },
            drawEnd() {
                const vm = this;
                let feature = vm.curFeature;
                let geo = feature.getGeometry();
                let coords = geo.getCoordinates();
                coords.forEach((p, index) => {
                    vm.createNode({coords:p, id:`${vm.newId}-${index}`});
                })
                vm.map.removeInteraction(vm.draw);

                if (vm.projection != 'pixel') {
                    geo = geo.clone().transform(vm.map.getView().getProjection(), vm.projection);
                }
                let requestedPosition = geo.getCoordinates();

                vm.$emit("drawend", [{   //向外传送线的坐标数据
                    coords: requestedPosition,
                    fId: feature.get("id")
                }])

                vm.curFeature = null;  //清除
                if (vm.isModify) {
                    vm.modify.setActive(true);
                }
                vm.drawing = false;
                setTimeout(function () {
                    vm.addDblZoom();   //添加双击放大交互
                })
            },
            styleFunction(feature) {   //绘制过程中的样式
                const vm = this;
                let lineStyle = Object.assign({lineDash: [10, 5]}, vm.lineStyle.stroke || {});
                let drawStyle = transformStyle(Object.assign({stroke: lineStyle}, vm.icon));

                let styles = [drawStyle];
                let geometry = feature.getGeometry();
                if (geometry instanceof LineString) {
                    let first = false;
                    geometry.forEachSegment(function (start, end) {
                        if (!first) {
                            styles.push(new Style({
                                geometry: new Point(start),
                                image: createStyle(vm.icon, "image")
                            }));
                            first = true;
                        }
                        styles.push(new Style({
                            geometry: new Point(end),
                            image: createStyle(vm.icon, "image")
                        }));
                    })
                }

                return styles;
            },
            addInteractions(map) {
                const vm = this;
                vm.draw = new Draw({
                    source: vm.source,
                    type: 'LineString',
                    style: vm.styleFunction
                });
                map.addInteraction(vm.draw);
                vm.drawStartEvent = vm.draw.on("drawstart", vm.drawStart);
                vm.drawEndEvent = vm.draw.on('drawend', vm.drawEnd);

                this.snap = new Snap({source: vm.source});
                map.addInteraction(vm.snap);
                this.removeDblZoom();

                if (vm.isModify) {
                    vm.modify.setActive(false);
                }
            },
            addFeature(map) {
                if (this.draw) {
                    map.removeInteraction(this.draw);
                }
                map.removeInteraction(this.snap);

                if (this.isSingle) {
                    //清除其他feature
                    this.source.clear();
                    this.pointSource.clear();
                }

                this.addInteractions(map);
            },
            loadFeatures() {
                const vm = this;
                let features = new Array();
                const count = vm.hasFeatures.length;
                for (let i = 0; i < count; i++) {
                    let featureData = vm.hasFeatures[i];
                    if (featureData.coords) {
                        let data = {
                            type: 'LineString',
                            projection: vm.projection,
                            coords: featureData.coords,
                            id: featureData.fId,
                        }
                        if(featureData.style) {
                            data.style = featureData.style;
                        }
                        let feature = createFeature(data, vm.viewProjection);
                        features.push(feature);
                        featureData.coords.forEach((coords, index)=>{
                            vm.createNode({
                                coords,
                                id:`${featureData.fId}-${index}`,
                                style:featureData.style,
                                projection: vm.projection
                            });
                        })
                    }
                }

                this.source.addFeatures(features);
            },
            listenClick(e) {
                if (this.drawing) {
                    return false;
                }
                let layerFeature = [], isNode = false;
                this.map.forEachFeatureAtPixel(e.pixel, function (feature, olLayer) {
                    layerFeature.push([olLayer, feature]);
                });
                layerFeature.forEach((item) => {
                    if (item[0] && item[1]) {
                        if (item[1].get("name") == "drawNode") {
                            const olLayer = item[0],
                                feature = item[1];
                            if (olLayer.get("routeLayer")) {
                                isNode = true;
                                if (feature.getGeometry() instanceof Point) {
                                    let coords = feature.getGeometry().getCoordinates();
                                    if (this.projection != 'pixel') {
                                        coords = transformProjection(coords, this.viewProjection, this.projection)
                                    }
                                    this.selectPoint = {
                                        coords,
                                        id: feature.get("id")
                                    };
                                }
                            }
                        }
                    }
                })
                if (!isNode) {
                    //其他地方 点击
                    this.selectPoint = null;
                }
            },
            listenEvent() {
                this.listener = this.map.on("click", this.listenClick);
            },

            /**
             *  @description: 改变节点的样式
             *  @param nodeId 节点id
             *  @param style  节点样式
             *  @author xrx
             *  @date 2019/9/25 10:17
             */
            changeNodeStyle(nodeId, style) {
                let feature = this.pointSource.getFeatureById(nodeId);
                if (feature) {
                    feature.setStyle(transformStyle(style));
                    this.selectPoint = null;
                } else {
                    console.error('id 不存在');
                }
            },

            /**
             *  @description: 删除某一节点
             *  @param nodeId 要删除的节点的id
             *  @author xrx
             *  @date 2019/9/23 16:11
             */
            deleteNode(nodeId) {
                let id = nodeId.split('-')[0];
                let feature = this.source.getFeatureById(id),
                    node = this.pointSource.getFeatureById(nodeId);
                if (feature) {
                    let coords = feature.getGeometry().getCoordinates(),
                        nodeCoord = node.getGeometry().getCoordinates();
                    coords.forEach((c, index) => {
                        if (c[0] === nodeCoord[0] && c[1] === nodeCoord[1]) {
                            coords.splice(index, 1);
                        }
                    })
                    if (coords.length < 2) {
                        alert("节点不能少于两个！");
                    } else {
                        feature.getGeometry().setCoordinates(coords);

                        if (node) {
                            this.pointSource.removeFeature(node);
                            let nodes = this.pointSource.getFeatures();
                            let delIndex = node.get("nodeIndex");
                            nodes.forEach(n=>{
                                let index = n.get("nodeIndex");
                                if(index>delIndex) {
                                    n.set("nodeIndex", index-1);
                                }
                            })
                        }
                    }

                    this.selectPoint = null;
                } else {
                    console.error('id 不存在');
                }
            }
        },
        beforeDestroy() {
            const vm = this;
            vm.getMap().then((map) => {
                vm.source.clear();
                map.removeLayer(vm.layer);
                vm.pointSource.clear();
                map.removeLayer(vm.pointLayer);

                if (vm.draw) {
                    unByKey(vm.drawStartEvent);
                    unByKey(vm.drawEndEvent);
                    map.removeInteraction(vm.draw);
                }
                unByKey(vm.modifyStartEvent);
                unByKey(vm.modifyEndEvent);
                map.removeInteraction(vm.snap);
                map.removeInteraction(vm.modify);

                vm.listenChanges.forEach(l => {
                    if (l) {
                        unByKey(l);
                    }
                })
                if (vm.listener) {
                    unByKey(vm.listener);
                }
            })
        }
    }
</script>

<style scoped>

</style>
