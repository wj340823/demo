/*
* 多个feature加载 比使用多个olPath组件性能高
* 并且对交互基本没有要求
* 所以特意为此写了一个组件
* type种类Point, LineString, MultiLineString, Polygon等
*/
<template>
    <div class="vueol-mulpath" style="display: none;">
        <slot :selectFeature="selectFeature" :moveFeature="moveFeature"></slot>
    </div>
</template>
<script>
    import {Vector as VectorLayer, VectorImage as VectorImageLayer} from 'ol/layer';
    import {Vector as VectorSource} from 'ol/source';
    import {
        createFeature,
        deepClone,
        coordinateTransform,
        calcRadius,
        transformStyle
    } from '../../util/helpers';
    import eventMixins from '../../mixins/layerEvent';

    export default {
        name: 'ol-mul-path',
        mixins: [eventMixins],
        inject: ['getMap'],
        props: {
            grids: {
                type: Array,
                required: true
            },
            isFit: {       //是否在初始化时设置图层自适应屏幕
                type: Boolean,
                default: false
            },
            renderMode: {
                type: String,
                default: 'vector'
            },
            layerStyle: [Object, Array, Function],
            moveStyle: [Object, Array, Function],     //矢量图层悬浮样式设置
            clickStyle: [Object, Array, Function],     //矢量图层点击样式设置
            selectFeatureId: [String, Number],
            blankClear: {    //点击空白处是否设置selectPoint=null
                type: Boolean,
                default: true
            },
            zIndex: {
                type: Number,
                default: 0
            },
            declutter: {type: Boolean, default: false},
            projection: {
                type: String,
                default: 'EPSG:4326'
            }
        },
        data() {
            return {
                layerName: 'mulPath',
                selectFeature: null
            }
        },
        watch: {
            grids: {
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
            selectFeatureId: {
                handler(nval) {
                    const vm = this;
                    if (!nval) {
                        vm.selectFeature = null;
                        return false;
                    }
                    let featureData = vm.storeObject[nval];
                    if (featureData) {
                        vm.selectFeature = {
                            coords: featureData.coords,
                            projection: vm.projection,
                            featureInfo: {
                                type: "mulPath",
                                data: featureData
                            },
                            mulPathInfo: featureData
                        };
                    } else {
                        vm.selectFeature = null;
                    }
                }
            },
            selectFeature(nval) {
                //双向数据绑定
                // 应用场景：点击列表，地图相应矢量点击弹框显示；反之，点击矢量，列表对应数据选中
                if (!nval) {
                    this.$emit('update:selectFeatureId', "");
                } else {
                    this.$emit('update:selectFeatureId', nval.featureInfo.data.id);
                }
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            init() {
                this.initData();
                this.getMap().then((map) => {
                    this.map = map;
                    this.createLayer(map);

                    this.storeObject = {};   //以id为键值，存储数据
                    this.update(map);

                    this.handleEvent(map);

                    if (this.isFit) {
                        map.getView().fit(this.source.getExtent());
                    }
                })
            },
            initData() {
                this.map = null;
                this.layer = null;
                this.source = null;
            },
            createLayer(map) {
                this.source = new VectorSource();
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
                this.layer.set("mulPathLayer", true);
                map.addLayer(this.layer);

                if (this.layerStyle) {
                    const style = transformStyle(this.layerStyle);
                    this.layer.setStyle(style);
                }
            },
            isRepeatId(grids) {
                let arr = [];
                for (let value of grids) {
                    if (!value.id) {
                        console.error("id缺失：" + JSON.stringify(value));
                        return true;
                    }
                    if (arr.indexOf(value.id) != -1) {
                        let result = grids.filter(item => item.id == value.id);
                        console.error("id重复：" + JSON.stringify(result));
                        return true;
                    }
                    arr.push(value.id);
                }
                return false;
            },
            addFeature(featureData, viewProjection) {
                const vm = this;
                let data = Object.assign({},featureData);
                data.projection = vm.projection;
                if (featureData.radius) {   //Circle或者Sector
                    if (vm.projection != "pixel") {
                        data.coords = coordinateTransform(data.coords, vm.projection, viewProjection);
                        data.radius = calcRadius(viewProjection, data.radius);
                        data.projection = viewProjection;
                    }
                }
                let feature = createFeature(data, viewProjection);
                feature.setId(featureData.id);
                if (featureData.style) {
                    feature.setStyle(transformStyle(featureData.style));
                }
                feature.set("featureInfo", {
                    type: "mulPath",
                    data: featureData
                });
                feature.set("mulPathInfo", featureData);

                this.storeObject[featureData.id] = featureData;
                return feature;
            },
            updateFeature(featureData, viewProjection) {
                let f = this.source.getFeatureById(featureData.id);
                if (f) {
                    let geo = f.getGeometry().clone();
                    if (featureData.radius) {   //Circle或者Sector
                        let center = coordinateTransform(featureData.coords, this.projection, viewProjection);
                        let radius = calcRadius(viewProjection, featureData.radius);
                        geo.setCenter(center);
                        geo.setRadius(radius);
                    }else {
                        geo.setCoordinates(featureData.coords);
                        if (this.projection != "pixel") {
                            geo = geo.transform(this.projection, viewProjection);
                        }
                    }
                    f.setGeometry(geo);

                    if (featureData.style) {
                        f.setStyle(transformStyle(featureData.style));
                    } else {
                        f.setStyle(null);
                    }

                    f.set("featureInfo", {
                        type: "mulPath",
                        data: featureData
                    });
                    f.set("mulPathInfo", featureData);
                    this.storeObject[featureData.id] = featureData;
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

                //每个feature必须有唯一的id
                if (vm.isRepeatId(vm.grids)) {
                    console.error("多矢量组件中每个矢量必须有唯一的id值");
                    return false;
                }

                let nVal = vm.grids;
                let features = new Array();
                const idSet = new Array();
                nVal.forEach(function (featureData) {
                    if (vm.storeObject[featureData.id]) {
                        vm.updateFeature(featureData, viewProjection);
                    } else {
                        let feature = vm.addFeature(featureData, viewProjection);
                        if (feature) {
                            features.push(feature);
                        }
                    }
                    idSet.push(featureData.id);
                });
                vm.source.addFeatures(features);

                for (let key in vm.storeObject) {
                    if (idSet.indexOf(key) == -1) {
                        vm.deleteFeature(key);
                    }
                }

                vm.$emit("loadFinished", {
                    source: vm.source
                })
            }
        }
    }
</script>