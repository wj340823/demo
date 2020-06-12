<template>
    <div class="vueol-marker" style="display: none;">
        <slot :selectPoint="selectPoint"></slot>
    </div>
</template>
<script>
    import {Point} from 'ol/geom';
    import {transform as transformProjection} from 'ol/proj'
    import {olMapDefaults} from '../../util/olMapDefaults';
    import {
        isDefined,
        isEqual,
        createFeature,
        removeOverlay,
        setLabelEvent,
        createStyle,
        deepClone,
        validCoords
    } from '../../util/helpers';

    import Bus from '../../util/bus'

    export default {
        name: 'ol-marker',
        inject: ['getMap', 'getLayer'],
        props: {
            options: {
                type: Object,
                default: function () {
                    return {
                        id: 'default',
                        lat: 30,
                        lon: 120,
                        projection: 'EPSG:4326',
                        info: "",
                        overLabel: 'name',
                        style: {
                            image: {
                                circle: {
                                    radius: 10,
                                    fill: {
                                        color: 'rgba(103, 58, 183, 0.5)'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            blankClear: {
                type: Boolean,
                default: true
            }  //点击空白处是否设置selectPoint=null
        },
        data() {
            return {
                marker: null,
                markerLayer: null,
                defaultProperties: {
                    id: "",
                    projection: 'EPSG:4326',
                    lat: 0,
                    lon: 0,
                    show: true,
                    showOnMouseOver: false,
                    showOnMouseClick: false,
                    keepOneOverlayVisible: true,
                    ngClick: false,
                    clickLabel: {},
                    overLabel: {},
                    info: {}
                },
                resultData: {},
                selectPoint: null
            }
        },
        mounted() {
            this.init();
        },
        watch: {
            options: {
                async handler(nval) {
                    const vm = this;
                    let mapObject = await vm.getMap();
                    vm.updateMarker(mapObject, nval);
                },
                deep: true
            }
        },
        methods: {
            listenerMove(data) {
                const vm = this;
                if (data.feature == vm.marker) {
                    vm.$emit("pointermove");
                    vm.label = vm.showNameOverlay(vm.map, data.feature);
                } else {
                    if (vm.label) {   //默认name悬浮弹框
                        vm.map.removeOverlay(vm.label);
                    }
                }
            },
            listenerMove_blank() {
                const vm = this;
                if (vm.label) {   //默认name悬浮弹框
                    vm.map.removeOverlay(vm.label);
                }
            },
            listenerClick(data) {
                const vm = this;
                if (data.feature == vm.marker) {
                    vm.$emit("singleclick");

                    //获取选中图标的信息
                    vm.selectPoint = Object.assign({}, deepClone(vm.options), {
                        coord: [vm.options.lon, vm.options.lat]
                    });
                } else {
                    vm.selectPoint = null;   //选中图标为空
                }
            },
            listenerClick_blank() {
                const vm = this;
                if (vm.blankClear) {
                    vm.selectPoint = null;   //选中图标为空
                }
            },
            init() {
                const vm = this;
                let label; //悬浮弹框
                vm.getMap().then((mapObject) => {
                    if (!vm.getLayer) {
                        console.error('[Vue - Openlayers] 缺少ol-markers');
                        return false;
                    }
                    vm.map = mapObject;
                    vm.getLayer().then((layer) => {
                        this.markerLayer = layer;
                        vm.updateMarker(mapObject, vm.options);
                    })

                    const mapId = mapObject.getTarget().id || "default";
                    Bus.$on(mapId + ".marker.pointermove", vm.listenerMove);

                    //地图空白处悬浮
                    Bus.$on(mapId + ".pointermove.blank", vm.listenerMove_blank);

                    Bus.$on(mapId + ".marker.singleclick", vm.listenerClick);

                    //地图空白处 点击
                    Bus.$on(mapId + ".singleclick.blank", vm.listenerClick_blank);

                })
            },
            updateMarker(mapObject, properties) {
                const vm = this;
                let marker = vm.marker;
                const data = vm.defaultProperties;
                const viewProjection = mapObject.getView().getProjection().getCode();
                const mapDefaults = olMapDefaults.getDefaults();

                properties.lon = parseFloat(properties.lon);
                properties.lat = parseFloat(properties.lat);

                if (!marker) {
                    //生成新的marker
                    data.id = properties.id ? properties.id : data.id;
                    data.projection = properties.projection ? properties.projection :
                        data.projection;
                    data.lat = !isNaN(properties.lat) ? properties.lat : data.lat;
                    data.lon = !isNaN(properties.lon) ? properties.lon : data.lon;
                    data.name = properties.name;
                    data.info = properties.info ? properties.info : data.info;
                    if ((!data.lat && data.lat != 0) || (!data.lon && data.lon != 0)) {
                        console.log("缺失经纬度");
                        return false;
                    }
                    if(data.projection=="EPSG:4326"){
                        if (!validCoords(data.lon, data.lat)) {
                            console.error("marker 经纬度不规范！", data);
                            return false;
                        }
                    }

                    //鼠标悬浮事件 标签
                    if (isDefined(properties.overLabel)) {
                        data.overLabel = properties.overLabel;
                    }

                    if (isDefined(properties.style)) {
                        data.style = properties.style;
                    } else {
                        data.style = mapDefaults.styles.marker;
                    }

                    marker = createFeature(data, viewProjection);
                    if (!isDefined(marker)) {
                        console.error('[Vue - Openlayers] Received invalid data on ' +
                            'the marker.');
                    }

                    // Add a link between the feature and the marker properties
                    marker.set('featureInfo', {
                        type: 'marker',
                        data: data
                    });

                    vm.markerLayer.getSource().addFeature(marker);
                    vm.marker = marker;
                } else {
                    let requestedPosition;
                    if (properties.projection === 'pixel') {
                        requestedPosition = properties.coord || [properties.lon, properties.lat];
                    } else {
                        requestedPosition = transformProjection([properties.lon, properties.lat], data.projection,
                            mapObject.getView().getProjection());
                    }

                    if (!isEqual(vm.marker.getGeometry().getCoordinates(), requestedPosition)) {
                        let geometry = new Point(requestedPosition);
                        marker.setGeometry(geometry);
                    }
                    if (isDefined(properties.style)) {
                        let requestedStyle = [];
                        if (properties.style instanceof Array) {
                            let len = properties.style.length;
                            for (let i = 0; i < len; i++) {
                                requestedStyle[i] = createStyle(properties.style[i]);
                            }
                        } else {
                            requestedStyle = createStyle(properties.style);
                        }
                        marker.setStyle(requestedStyle);
                    }

                    //显示着的overlay随着marker的移动而移动
                    if (marker.get("overLay") && marker.get("overLay").getMap()) {
                        marker.get("overLay").setPosition(requestedPosition);
                    }

                    //更新存储的属性
                    data.lat = properties.lat ? properties.lat : data.lat;
                    data.lon = properties.lon ? properties.lon : data.lon;
                    data.info = properties.info ? properties.info : data.info;
                    data.name = properties.name;

                    if (isDefined(properties.style)) {
                        data.style = properties.style;
                    }
                }

                vm.resultData = data;
            },
            showNameOverlay(map, feature) {
                const vm = this;
                //悬浮时，先移除其它的弹出框
                removeOverlay(map, null, "overLabel");

                let label = null;
                if (vm.options.overLabel == "none") {
                    return false;
                }
                if (!vm.options.overLabel || vm.options.overLabel == "name") {
                    if (vm.options.name) {
                        let data = {
                            lat: this.resultData.lat,
                            lon: this.resultData.lon,
                            projection: this.resultData.projection,
                            label: {
                                classNm: "featureOver",
                                message: this.resultData.name
                            }
                        }
                        label = setLabelEvent(feature, map, data);
                    }
                }
                if (label) {
                    label.set("overLabel", "true"); //与其他的弹出框区分
                }
                return label;
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
            vm.selectPoint = null;  //选中为空
            if (vm.marker) {
                vm.markerLayer.getSource().removeFeature(vm.marker);
            }

            if (vm.map) {
                const mapId = vm.map.getTarget().id || "default";
                Bus.$off(mapId + ".marker.pointermove", vm.listenerMove);
                Bus.$off(mapId + ".pointermove.blank", vm.listenerMove_blank)
                Bus.$off(mapId + ".marker.singleclick", vm.listenerClick);
                Bus.$off(mapId + ".singleclick.blank", vm.listenerClick_blank);
            }
        }
    }

</script>
