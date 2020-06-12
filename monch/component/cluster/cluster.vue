<template>
    <div class="vueol-cluster" style="display: none;">
        <div class="featureOver clusterMulOver">
            <div class="featureList">
                <ul id="clusterList">
                    <li v-for="item in clusterList" @click="locateFeature(item.id,item.coord)">{{item.name}}</li>
                </ul>
                <div class="moreList" v-if="hasMore">...</div>
            </div>
        </div>
        <slot :selectFeature="selectPoint" :moveFeature="movePoint"></slot>
    </div>
</template>
<script>
    import {Vector as VectorLayer} from 'ol/layer';
    import {Vector as VectorSource, Cluster as ClusterSource} from 'ol/source';
    import {
        isDefined,
        deepClone,
        createFeature,
        createOverlay,
        removeOverlay,
        setLabelEvent,
        validCoords, transformStyle
    } from '../../util/helpers';
    import {olMapDefaults} from "../../util/olMapDefaults";
    import {unByKey} from 'ol/Observable'
    import * as loadingstrategy from 'ol/loadingstrategy.js';

    import Bus from '../../util/bus';

    export default {
        name: 'ol-cluster',
        inject: ['getMap'],
        props: {
            points: {
                type: Array,
                required: true,
                default() {
                    return []
                }
            },
            clusterStyle: {        //聚集样式
                type: [Object, Array, Function],
                default() {
                    return {
                        image: {
                            circle: {
                                radius: 10,
                                stroke: {
                                    color: '#fff'
                                },
                                fill: {
                                    color: '#3399CC'
                                }
                            }
                        },
                        text: {
                            text: "",
                            fill: {
                                color: '#fff'
                            }
                        }
                    }
                }
            },
            pointStyle: [Object, Array, Function],   //用作统一的单个图标样式
            fullCustomStyle: {   //设置为true，则组件内不再为聚集样式加上 size text，完全采用外部定义的样式
                type: Boolean,
                default: false
            },
            distance: {
                type: Number,
                default: 20
            },
            clusterListLabel: {   //设置为‘none’，可屏蔽默认聚集弹框
                type: String
            },
            overLabel: {   //设置为‘none’，可屏蔽默认名称弹框
                type: String
            },
            blankClear: {    //点击空白处是否设置selectPoint=null
                type: Boolean,
                default: true
            },
            selectPointId: [String, Number],
            zIndex: {
                type: Number,
                default: 0
            },
            projection: {
                type: String,
                default: 'EPSG:4326'
            }
        },
        data() {
            let gatherStyle = this.clusterStyle ? transformStyle(this.clusterStyle) : olMapDefaults.getDefaults().styles.marker;
            let commonStyle = transformStyle(this.pointStyle);
            return {
                layer: null,
                gatherStyle,
                commonStyle,
                nameLabel: null,  //单个图标的悬浮弹框
                clusterLabel: null,
                clusterList: [],   //事件触发时的聚集数组
                hasMore: false,
                exoticId: this.selectPointId,
                selectPoint: null,   //选中的点位
                movePoint: null
            }
        },
        watch: {
            points: {
                handler(nval) {
                    //console.log("聚集组件接收到数据0："+new Date().getTime());
                    const vm = this;
                    vm.selectPoint = null;
                    vm.getMap().then((mapObject) => {
                        vm.updateCluster(mapObject);
                    })
                },
                deep: true
            },
            clusterStyle: {
                handler(nval) {
                    const vm = this;
                    vm.gatherStyle = transformStyle(nval);
                    vm.layer.getSource().refresh();
                },
                deep: true
            },
            pointStyle: {
                handler(nval) {
                    this.commonStyle = transformStyle(nval);
                    this.layer.getSource().refresh();
                },
                deep: true
            },
            zIndex(zindex) {
                if (this.layer && this.layer.getZIndex() !== zindex) {
                    this.layer.setZIndex(zindex);
                }
            },
            selectPointId: {
                handler(nval) {
                    const vm = this;
                    if (!nval) {
                        vm.selectPoint = null;
                        return false;
                    }

                    //获取选中图标的信息并赋值给vm.selectPoint
                    vm.selectPoint = vm.checkPoint(nval);
                }
            },
            selectPoint(nval) {
                //双向数据绑定
                // 应用场景：点击列表，地图相应点位点击弹框显示；反之，点击点位，列表对应数据选中
                if (!nval) {
                    this.$emit('update:selectPointId', "");
                } else {
                    this.$emit('update:selectPointId', nval.id);
                }
            }
        },
        created() {
            this.init();
        },
        methods: {
            init() {
                const vm = this;

                let resolutionEventKey;  //地图缩放事件 悬浮弹框消失

                vm.getMap().then((mapObject) => {
                    vm.map = mapObject;
                    vm.createLayer(mapObject);
                    vm.updateCluster(mapObject);

                    //缩放地图，聚集弹框隐藏
                    const view = mapObject.getView();
                    if (resolutionEventKey) {
                        unByKey(resolutionEventKey);
                    }
                    resolutionEventKey = view.on("change:resolution", () => {
                        if (vm.clusterLabel) {
                            vm.clusterLabel.setPosition(undefined);
                        }
                    });

                    //事件监听
                    const mapId = mapObject.getTarget().id || "default";
                    vm.listen(mapObject, mapId);

                    //默认选中点位
                    if (vm.selectPointId) {
                        vm.selectPoint = vm.checkPoint(vm.selectPointId);
                    }
                })
            },
            createLayer(map) {
                this.layer = new VectorLayer({
                    source: new ClusterSource({
                        distance: this.distance,
                        source: new VectorSource({
                            strategy: loadingstrategy.bbox
                        })
                    }),
                    zIndex: this.zIndex
                })
                ;
                this.layer.set("cluster", true);
                map.addLayer(this.layer);
            },
            styleFunction(feature, resolution) {
                const size = feature.get('features').length;
                let style;
                if (size > 1) {
                    style = this.gatherStyle;
                    if (style instanceof Function) {
                        style = style(feature, resolution);
                    }
                    if (!this.fullCustomStyle) {
                        style.setZIndex(size);
                        if (style && style.getText()) {
                            let str = size.toString();
                            if (size > 99) {
                                str = '99+';
                            }
                            style.getText().setText(str);
                        }
                    }
                } else {
                    if (this.commonStyle) {
                        style = this.commonStyle;
                    } else {
                        let pointStyle = feature.get('features')[0].get("pointStyle");
                        style = transformStyle(pointStyle);
                    }
                    if (style instanceof Function) {
                        style = style(feature, resolution);
                    }
                }
                return style;
            },
            isRepeatId(points) {
                let arr = [];
                for (let value of points) {
                    if (!value.id) {
                        console.log("id缺失：" + JSON.stringify(value));
                        return true;
                    }
                    if (arr.indexOf(value.id) != -1) {
                        let result = points.filter(item => item.id == value.id);
                        console.log("id重复：" + JSON.stringify(result));
                        return true;
                    }
                    arr.push(value.id);
                }
                return false;
            },
            updateCluster(map) {
                // console.log("聚集组件接收到数据："+new Date().getTime());
                const nVal = this.points;

                //每个point必须有唯一的id
                if (this.isRepeatId(nVal)) {
                    console.error("聚集点位必须有唯一的id值");
                    return false;
                }
                //console.log("聚集组件接收到数据2："+new Date().getTime());

                const count = nVal.length;
                const viewProjection = map.getView().getProjection().getCode();
                let features = new Array();
                this.storeObject = {};   //以id为键值，存储数据

                // console.log("聚集组件接收到数据3："+new Date().getTime()+" "+count);
                for (let i = 0; i < count; i++) {
                    let point = {...nVal[i]};
                    if (point.coords) {
                        point.lon = point.coords[0];
                        point.lat = point.coords[1];
                    } else {
                        point.coords = [point.lon, point.lat];
                    }
                    if (point.lon && point.lat) {
                        if (this.projection == "EPSG:4326") {
                            if (!validCoords(point.lon, point.lat)) {
                                console.error("经纬度不规范！" + point.lon + ", " + point.lat);
                                continue;
                            }
                        }
                        let feature = createFeature({
                            projection: this.projection,
                            lat: parseFloat(point.lat),
                            lon: parseFloat(point.lon),
                            id: point.id,
                            name: point.name
                        }, viewProjection);
                        features.push(feature);

                        feature.set("featureInfo", {
                            type: "clusterFeature",
                            data: point
                        });
                        if (isDefined(point.style)) {
                            feature.set("pointStyle", point.style);
                        }

                        this.storeObject[point.id] = point;
                    } else {
                        console.error("经纬度缺失！");
                    }
                }

                this.layer.getSource().getSource().clear(true);
                this.layer.getSource().getSource().addFeatures(features);

                this.layer.setStyle(this.styleFunction);
                //console.log("聚集组件渲染成功："+new Date().getTime());

                this.$once('hook:beforeDestroy', function () {
                    features = [];
                })
            },
            showNameOverlay(map, feature, data) {
                //悬浮时，先移除其它的弹出框
                removeOverlay(map, null, "overLabel");

                let label = setLabelEvent(feature, map, data);
                if (label) {
                    label.set("overLabel", "true"); //与其他的弹出框区分
                }
                return label;
            },
            setMoveLay(map, feature) {    //鼠标悬浮聚集图标，生成聚集弹框
                const viewProjection = map.getView().getProjection().getCode();
                let features = feature.get("features");
                const len = features.length;

                if (len == 1) { //单点
                    const coords = features[0].getGeometry().getCoordinates();
                    if (this.overLabel === 'none') {  //屏蔽默认名称弹框
                        return false;
                    }
                    let data = {
                        lat: coords[1],
                        lon: coords[0],
                        projection: viewProjection,
                        label: {
                            classNm: "featureOver",
                            message: features[0].get("name") || "空"
                        }
                    }
                    this.nameLabel = this.showNameOverlay(map, features[0], data);
                } else {
                    let coords = feature.getGeometry().getCoordinates();
                    if (this.clusterListLabel === 'none') {  //屏蔽默认聚集列表弹框
                        return false;
                    }

                    //聚集图标上有点击弹框，则不会再生成悬浮弹框
                    if (this.clusterLabel && this.clusterLabel.get("clusterClickLabel")
                        && this.clusterLabel.getPosition()) {
                        return;
                    }

                    let fs = features.slice(0, 40);
                    this.clusterList = fs.map(f => ({
                        id: f.get("id"),
                        name: f.get("name") || "空",
                        coord: f.getGeometry().getCoordinates()
                    }))
                    if (features.length > 40) {
                        this.hasMore = true;
                    } else {
                        this.hasMore = false;
                    }

                    //悬浮时，先移除其它的弹出框（主要是名称弹框）
                    removeOverlay(map, null, "overLabel");

                    if (!this.clusterLabel) {
                        this.clusterLabel = createOverlay(this.$el.children[0], coords);
                        map.addOverlay(this.clusterLabel);

                        if (this.clusterLabel) {
                            this.clusterLabel.set("clusterMoveLabel", "true"); //与其他的弹出框区分
                        }
                    } else {
                        this.clusterLabel.setPosition(coords);
                        if (this.clusterLabel.get("clusterClickLabel")) { //如果已经转换成点击弹框
                            this.clusterLabel.unset("clusterClickLabel");
                            this.clusterLabel.getElement().classList.remove("clusterMulClick");
                            this.clusterLabel.set("clusterMoveLabel", "true"); //转成悬浮弹框
                        }
                    }
                }
            },
            listenerMove(data) {
                const vm = this;
                if (data.olLayer == vm.layer) {
                    vm.$emit("pointermove", data);

                    vm.setMoveLay(vm.map, data.feature);
                    let features = data.feature.get("features");
                    if (features.length === 1) {
                        vm.movePoint = vm.checkPoint(features[0].get("id"));
                    }
                }
            },
            listenerMove_blank() {
                const vm = this;
                vm.movePoint = null;
                if (vm.nameLabel) {  //移除名称弹框
                    vm.map.removeOverlay(vm.nameLabel);
                }
                if (vm.clusterLabel && vm.clusterLabel.get("clusterMoveLabel") && vm.clusterLabel.getPosition()) {   //聚集列表弹框还是悬浮状态
                    vm.clusterLabel.setPosition(undefined);
                }
            },
            listenerClick(data) {
                const vm = this;
                if (data.olLayer == vm.layer) {
                    vm.$emit("singleclick", data);

                    const feature = data.feature;
                    let features = feature.get("features");
                    const len = features.length;

                    if (len > 1) {
                        if (vm.clusterLabel && vm.clusterLabel.get("clusterMoveLabel")) { //如果已经悬浮产生列表
                            vm.clusterLabel.unset("clusterMoveLabel");
                            vm.clusterLabel.set("clusterClickLabel", "true"); //悬浮弹框变点击弹框
                            vm.clusterLabel.getElement().classList.add("clusterMulClick");

                            vm.selectPoint = null;
                        }
                    } else {
                        if (vm.clusterLabel) {
                            vm.clusterLabel.setPosition(undefined);
                        }

                        //获取选中图标的信息并赋值给vm.selectPoint
                        vm.selectPoint = vm.checkPoint(features[0].get("id"));
                    }
                }
            },
            listenerClick_blank() {
                const vm = this;
                if (vm.blankClear) {
                    vm.selectPoint = null;   //选中图标为空
                }

                if (vm.clusterLabel && vm.clusterLabel.get("clusterClickLabel")) {   //聚集列表弹框是点击固定状态
                    vm.clusterLabel.setPosition(undefined);
                }
            },
            listen(mapObject, mapId) {
                const vm = this;
                /*
                    *   聚集图标悬浮生成列表弹框，鼠标移至空白处弹框隐藏
                    *   聚集图标点击，列表悬浮弹框变成点击固定弹框，鼠标点击空白处隐藏
                    *   生成点击固定弹框之后，鼠标再次悬浮在对应图标上，不会再生成悬浮弹框，
                    *   若是悬浮在其他图标上，则弹框再次变为悬浮弹框，并重新设定位置
                    */
                Bus.$on(mapId + ".cluster.pointermove", vm.listenerMove);

                //地图空白处悬浮
                Bus.$on(mapId + ".pointermove.blank", vm.listenerMove_blank);

                Bus.$on(mapId + ".cluster.singleclick", vm.listenerClick);

                //地图空白处 点击
                Bus.$on(mapId + ".singleclick.blank", vm.listenerClick_blank);
            },
            locateFeature(id, coord) {    //聚集点 列表元素点击之后，地图放大并定位
                const vm = this;
                vm.getMap().then((map) => {
                    //移除弹框
                    vm.clusterLabel.setPosition(undefined);

                    const view = map.getView();
                    const maxZoom = view.getMaxZoom() || 18;
                    view.animate({
                        center: coord
                    }, {
                        zoom: maxZoom
                    }, function () {
                        //获取选中图标的信息并赋值给vm.selectPoint
                        vm.selectPoint = vm.checkPoint(id);
                    });
                });
            },
            checkPoint(id) {
                const vm = this;
                let point = vm.storeObject[id];
                if (point) {
                    return Object.assign({}, deepClone(point), {
                        coords: [point.lon, point.lat]
                    });
                }
                return null;
            },

            /**
             *  @description: 清除选中
             *  @author: xiarx
             *  @date 2019/6/17 15:53
             */
            clearSelect() {
                this.selectPoint = null;   //选中图标为空
            }
        },
        beforeDestroy() {
            const vm = this;
            vm.getMap().then((map) => {
                let source = vm.layer.getSource();
                if (source.clear) {
                    source.getFeatures().forEach(function (f) {
                        f.setStyle(null);
                    })
                    source.clear();
                }
                vm.layer.setSource(undefined);
                map.removeLayer(vm.layer);
                if (vm.clusterLabel) {
                    map.removeOverlay(vm.clusterLabel);
                }

                vm.selectPoint = null;  //选中为空

                const mapId = map.getTarget().id || "default";
                Bus.$off(mapId + ".cluster.pointermove", vm.listenerMove);
                Bus.$off(mapId + ".pointermove.blank", vm.listenerMove_blank);
                Bus.$off(mapId + ".cluster.singleclick", vm.listenerClick);
                Bus.$off(mapId + ".singleclick.blank", vm.listenerClick_blank);
            })
        }
    }
</script>
