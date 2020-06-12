<template>
    <div class="vueol-map" :id="options.id" style="height: 100%;">
        <slot></slot>
    </div>
</template>
<script>
    import Map from 'ol/Map';
    import OlView from './view.vue';
    import {Heatmap} from 'ol/layer';
    import {coordinateTransform} from "../../util/helpers";

    import olData from "../../util/olData";
    import Bus from '../../util/bus'

    export default {
        name: 'suc-map',
        mixins: [OlView],
        props: {
            options: {
                type: Object,
                default: function () {
                    return {
                        id: 'default'
                    }
                }
            }
        },
        data() {
            return {
                mapObject: null,
                promise: null
            }
        },
        watch: {
            projection: {
                handler(value) {
                    //pixel
                    if (this.$view && this.$view.getProjection().getExtent() && value.extent && value.extent !== this.$view.getProjection().getExtent()) {
                        this.$view = this.createView();
                        this.mapObject.setView(this.$view);
                    }
                },
                deep: true
            }
        },
        created() {
            const vm = this;
            vm.promise = new Promise(function (resolve, reject) {
                vm.resolve = resolve;
            })
        },
        mounted() {
            this.init();
        },
        provide: function () {
            return {
                getMap: this.getMap
            }
        },
        methods: {
            init() {
                const vm = this;
                vm.mapObject = this.createMap();
                vm.$view = vm.createView();
                vm.mapObject.setView(vm.$view);

                //view 改变事件监听
                vm.listenViewChange(vm.mapObject);

                vm.resolve(vm.mapObject);   //getMap
                olData.setMap(vm.mapObject, vm.options.id);
                /*olData.getMap(vm.options.id).then(function (map) {
                    console.log(map)
                })*/

                //监听事件
                vm.options.events.forEach((event) => {
                    vm.listenEvent(vm.mapObject, event);
                })

                window.onresize = function () {
                    vm.mapObject.updateSize();
                }

            },
            createMap() {
                const map = new Map({
                    target: this.$el,
                    controls: []  //清除ol默认控件
                });

                return map;
            },
            getMap() {   //异步 子组件访问map对象
                return this.promise;
            },

            /**
             *  @description: 地图事件监听 并向组件（marker图层、聚集图层、esrijson 或 geojson 矢量图层、海量点位、轨迹图层）发送信息
             *  @param {String} eventType 事件类型 pointermove\singleclick
             *  @param {String} proj  坐标系
             *  @param {Array} coord  点击处坐标
             *  @param {Array} layerFeature 事件发生处的[layer, feature]
             *  @return void
             *  @author xrx
             *  @date 2019/5/22 10:17
             */
            emitEvent(eventType, proj, coord, layerFeature) {
                const vm = this;
                let mapId = vm.options.id || "default";

                if (layerFeature && layerFeature[1]) {
                    const olLayer = layerFeature[0],
                        feature = layerFeature[1];
                    let tempInfo = feature.get("featureInfo"),
                        featureType;
                    if (tempInfo) {
                        featureType = tempInfo.type;
                    }

                    if (feature.get("features")) { //汇聚而成的点位
                        featureType = "clusterFeature";
                    }

                    let map = {
                        marker: 'marker',              //marker图层矢量对象
                        clusterFeature: 'cluster',     //聚集图层矢量对象
                        esriFeature: 'vectorLayer',    // esrijson 或 geojson 矢量图层
                        geoFeature: 'vectorLayer',     // esrijson 或 geojson 矢量图层
                        collection: 'collection',     //海量点位
                        mulPath: 'mulPath'        //多矢量图层
                    }

                    if(olLayer&&olLayer.get("trackLayer")) {   //轨迹回放图层
                        Bus.$emit(`${mapId}.track.${eventType}`, {
                            feature,
                            olLayer,
                            coord
                        })
                    }else if(olLayer&&olLayer.get("tileVectorLayer")){  //切片矢量图层
                        Bus.$emit(`${mapId}.tileVectorLayer.${eventType}`, {
                            feature,
                            olLayer,
                            coord
                        })
                    }else {
                        if(!featureType&&!olLayer) {
                            return false;
                        }
                        let msg = {
                            feature,
                            olLayer,
                            coord
                        }
                        if(map[featureType]==='vectorLayer') {
                            msg.info = tempInfo.data;
                        }
                        if(map[featureType]==='collection') {   //点位坐标
                            msg.coord = feature.getGeometry().getCoordinates();
                        }
                        Bus.$emit(`${mapId}.${map[featureType]}.${eventType}`, msg);
                    }

                } else {
                    //空白地图
                    Bus.$emit((vm.options.id || "default") + "." + eventType + ".blank");
                }
            },
            listenEvent(map, eventType) {
                const vm = this;
                map.on(eventType, function (event) {
                    let proj = map.getView().getProjection().getCode();

                    //地理坐标
                    let coord = event.coordinate;
                    if (proj === "pixel" || proj === "xkcd-image") {
                        coord = coord.map(function (v) {
                            return parseInt(v, 10);
                        });
                    }

                    //像素坐标
                    let pixel;
                    if (eventType == "singleclick") {
                        pixel = event.pixel;
                    } else if (eventType == "pointermove") {
                        pixel = map.getEventPixel(event.originalEvent);
                    }

                    //向下级组件非定向性传递消息
                    Bus.$emit((vm.options.id || "default") + "." + eventType, event);

                    //如果事件不是发生在openlayers画布上（这里主要是考虑二三维融合的情况），则退出事件回调
                    if (event.originalEvent.srcElement.className == "ol-cesium") {
                        return false;
                    }

                    let layerFeature = map.forEachFeatureAtPixel(pixel, function (feature, olLayer) {
                        return [olLayer, feature];
                    }, {
                        layerFilter(layer) {
                            return !(layer instanceof Heatmap);
                        }
                    });
                    let outCoord = coord;
                    if (proj != "pixel" && proj != "xkcd-image") {
                        //确保输出坐标的坐标系为4326
                        outCoord = coordinateTransform(coord, proj, "EPSG:4326");
                    }

                    //自定义事件 向父级发送消息
                    if (layerFeature && layerFeature[1]) {
                        const olLayer = layerFeature[0],
                            feature = layerFeature[1];

                        //矢量对象点击
                        vm.$emit(eventType, {
                            coords: outCoord,   //事件发生处的坐标
                            projection: (proj === "pixel" || proj === "xkcd-image") ? proj : "EPSG:4326",
                            event: event,
                            layer: olLayer,
                            feature: feature
                        })
                    } else {
                        //空白处点击
                        vm.$emit(eventType + "-blank", {
                            coords: outCoord,
                            projection: (proj === "pixel" || proj === "xkcd-image") ? proj : "EPSG:4326"
                        })
                    }

                    //向下级组件定向性传递消息
                    vm.emitEvent(eventType, proj, coord, layerFeature);
                });
            }
        },
        beforeDestroy() {
            const vm = this;
            olData.resetMap(vm.options.id);
        }
    }
</script>
