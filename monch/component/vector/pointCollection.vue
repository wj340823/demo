<template>
    <div class="vueol-collection" style="display: none;">
        <slot :selectFeature="selectFeature" :moveFeature="moveFeature"></slot>
    </div>
</template>
<script>
    import {Vector as VectorLayer, VectorImage as VectorImageLayer} from 'ol/layer';
    import {Vector as VectorSource} from 'ol/source';
    import Feature from 'ol/Feature.js';
    import Point from 'ol/geom/Point';
    import {bbox} from 'ol/loadingstrategy';
    import {containsCoordinate} from 'ol/extent';

    import {
        coordinateTransform,
        deepClone,
        validCoords, transformStyle
    } from '../../util/helpers';
    import eventMixins from '../../mixins/layerEvent';

    export default {
        name: 'ol-point-collection',
        mixins: [eventMixins],
        inject: ['getMap'],
        props: {
            points: {
                type: Array,
                default() {
                    return [{
                        id: 'default',
                        coords: [120, 30],
                        style: {
                            fill: {
                                color: "rgba(255,0,0,0.2)"
                            },
                            stroke: {
                                color: 'blue',
                                width: 4
                            }
                        }
                    }]
                }
            },
            isFit: {       //是否在初始化时设置图层自适应屏幕
                type: Boolean,
                default: false
            },
            layerStyle: [Object, Array, Function],
            moveStyle: [Object, Array, Function],     //矢量图层悬浮样式设置
            clickStyle: [Object, Array, Function],     //矢量图层点击样式设置
            onlyVisible: {   //是否只加载可见视图内的点位;在快速刷新点位的情境下适用，并且点位数量不能太大（几千？）
                type: Boolean,
                default: false
            },
            selectPointId: [String, Number],
            /*
            ** Render mode for vector layers:
            **   1, 'image': Vector layers are rendered as images. Great performance,
            **         but point symbols and texts are always rotated with the view and pixels are scaled during zoom animations.
            **   2, 'vector': Vector layers are rendered as vectors. Most accurate rendering even during animations,
            **        but slower performance.
            */
            renderMode: {
                type: String,
                default: 'vector'
            },
            declutter: {type: Boolean, default: false},
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
            return {
                layerName: 'collection',
                layer: null,
                source: null,
                storeObject: {}
            }
        },
        watch: {
            points: {
                handler() {
                    const vm = this;
                    vm.getMap().then(map => {
                        vm.curClickFeature = null;
                        vm.selectFeature = null;
                        vm.curMoveFeature = null;
                        vm.moveFeature = null;
                        vm.update(map);
                    })
                },
                deep: true
            },
            zIndex(zindex) {
                if (this.layer && this.layer.getZIndex() !== zindex) {
                    this.layer.setZIndex(zindex);
                }
            },
            layerStyle: {
                handler() {
                    if (this.layerStyle) {
                        const style = transformStyle(this.layerStyle);
                        this.layer.setStyle(style);
                    }
                },
                deep: true
            },
            selectPointId: {
                handler(nval) {
                    const vm = this;
                    if (!nval) {
                        vm.selectFeature = null;
                        return false;
                    }
                    let point = vm.storeObject[nval];
                    if (point) {
                        vm.selectFeature = {
                            coords: point.coords,
                            projection: vm.projection,
                            featureInfo: {
                                type: "collection",
                                data: point
                            },
                            collectionInfo: point
                        };
                    } else {
                        vm.selectFeature = null;
                    }
                }
            },
            selectFeature(nval) {
                //双向数据绑定
                // 应用场景：点击列表，地图相应点位点击弹框显示；反之，点击点位，列表对应数据选中
                if (!nval) {
                    this.$emit('update:selectPointId', "");
                } else {
                    this.$emit('update:selectPointId', nval.featureInfo.data.id);
                }
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {
                const vm = this;
                this.getMap().then((map) => {
                    this.map = map;
                    this.createLayer(map);

                    this.storeObject = {};   //以id为键值，存储数据
                    this.update(map);

                    this.handleEvent(map);

                    if (this.isFit) {
                        map.getView().fit(this.source.getExtent(), {
                            padding: [10, 10, 10, 10]
                        });
                    }

                    //加载矢量之后，处理选中状态
                    if (vm.selectPointId) {
                        let point = vm.storeObject[vm.selectPointId];
                        if (point) {
                            vm.selectFeature = deepClone(point);
                        } else {
                            vm.selectFeature = null;
                        }
                    }
                })
            },
            createLayer(map) {
                this.source = new VectorSource({
                    strategy: bbox
                });
                if (this.renderMode == 'image') {
                    this.layer = new VectorImageLayer({
                        source: this.source,
                        declutter: this.declutter,
                        zIndex: this.zIndex
                    });
                } else {
                    this.layer = new VectorLayer({
                        source: this.source,
                        declutter: this.declutter,
                        zIndex: this.zIndex
                    });
                }

                this.layer.set("collectionLayer", true);
                map.addLayer(this.layer);

                if (this.layerStyle) {
                    const style = transformStyle(this.layerStyle);
                    this.layer.setStyle(style);
                }
            },
            isRepeatId(points) {
                let arr = [];
                for (let value of points) {
                    if (!value.id) {
                        console.error("id缺失：" + JSON.stringify(value));
                        return true;
                    }
                    if (arr.indexOf(value.id) != -1) {
                        let result = points.filter(item => item.id == value.id);
                        console.error("id重复：" + JSON.stringify(result));
                        return true;
                    }
                    arr.push(value.id);
                }
                return false;
            },
            addFeature(point, viewProjection) {
                if (this.projection == "EPSG:4326") {
                    if (!validCoords(point.coords[0], point.coords[1])) {
                        console.error("海量点位 经纬度不规范！", point);
                        return null;
                    }
                }
                let geometry = new Point(point.coords);
                if(this.projection!=='pixel') {
                    geometry = geometry.transform(this.projection, viewProjection);
                }

                const feature = new Feature({
                    id: point.id,
                    geometry: geometry
                })
                feature.setId(point.id);
                if (point.style) {
                    feature.setStyle(transformStyle(point.style));
                }
                feature.set("featureInfo", {
                    type: "collection",
                    data: point
                });
                feature.set("collectionInfo", point);

                this.storeObject[point.id] = point;
                return feature;
            },
            updateFeature(point, viewProjection) {
                if (this.projection == "EPSG:4326") {
                    if (!validCoords(point.coords[0], point.coords[1])) {
                        console.error("海量点位 经纬度不规范！", point);
                        return false;
                    }
                }
                let f = this.source.getFeatureById(point.id);
                if (f) {
                    let geo = f.getGeometry();
                    let coords = point.coords;
                    if(this.projection!=='pixel') {
                        coords = coordinateTransform(point.coords, this.projection, viewProjection);
                    }
                    geo.setCoordinates(coords);

                    if (point.style) {
                        f.setStyle(transformStyle(point.style));
                    } else {
                        f.setStyle(null);
                    }
                    f.set("featureInfo", {
                        type: "collection",
                        data: point
                    });
                    f.set("collectionInfo", point);
                    this.storeObject[point.id] = point;
                }
            },
            deleteFeature(id) {
                let f = this.source.getFeatureById(id);
                if (f) {
                    this.source.removeFeature(f);
                    delete this.storeObject[id];
                }
            },
            update(map) {
                const vm = this;
                const viewProjection = map.getView().getProjection().getCode();

                //每个point必须有唯一的id
                if (vm.isRepeatId(vm.points)) {
                    console.error("海量点位必须有唯一的id值");
                    return false;
                }

                const features = new Array();
                const idSet = new Array();
                let extent = map.getView().calculateExtent(map.getSize());
                vm.points.forEach(function (p) {
                    let isIn = true;
                    if (vm.onlyVisible) {
                        //判断是否在可见视图内
                        let coords = p.coords;
                        if(vm.projection!=='pixel') {
                            coords = coordinateTransform(p.coords, vm.projection, viewProjection);
                        }
                        isIn = containsCoordinate(extent, coords);
                    }
                    if (isIn) {
                        if (vm.storeObject[p.id]) {
                            vm.updateFeature(p, viewProjection);
                        } else {
                            let feature = vm.addFeature(p, viewProjection);
                            if (feature) {
                                features.push(feature);
                            }
                        }
                        idSet.push(p.id);
                    }
                })
                vm.source.addFeatures(features);

                for (let key in vm.storeObject) {
                    if (idSet.indexOf(key) == -1) {
                        vm.deleteFeature(key);
                    }
                }

                vm.$emit("load-finished", {
                    source: vm.source
                })
            }
        }
    }
</script>
