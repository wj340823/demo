<script>
    import VectorTileLayer from "ol/layer/VectorTile";
    import {coordinateTransform, isFunction, transformStyle} from "../../util/helpers";
    import {layerMethods} from "../../util/layer";
    import Bus from "../../util/bus";

    export default {
        name: 'ol-tile-vector-layer',
        render(h) {
            return h('div', {
                    class: 'ol-tile-vector-layer',
                    style: {
                        display: 'none !important'
                    }
                },
                this.$scopedSlots.default ? this.$scopedSlots.default({
                    selectFeature: this.selectFeature,
                    moveFeature: this.moveFeature
                }) : []
            );
        },
        inject: ['getMap'],
        props: {
            options: {
                type: Object,
                default: function () {
                    return {
                        name: "tileVector",
                        source: {
                            type: 'TileVector',
                            format: 'MVT',
                            url: 'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/' +
                                'ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf'
                        }
                    }
                }
            },
            idProperty: {
                type: String,
                default: 'id'
            },
            layerStyle: [Object, Array, Function],    //矢量图层样式设置
            moveStyle: [Object, Array, Function],     //矢量图层悬浮样式设置
            clickStyle: [Object, Array, Function],     //矢量图层点击样式设置
            blankClear: {    //点击空白处是否设置selectFeature=null
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                selectFeature: null,
                moveFeature: null,
                selectionId: '',   //点击选中矢量的id
                moveId: ''      //悬浮矢量的id
            }
        },
        created() {
            this.init();
        },
        watch: {
            options: {
                handler() {
                    let vm = this;
                    vm.curClickFeature = null;
                    vm.selectFeature = null;
                    vm.curMoveFeature = null;
                    vm.moveFeature = null;
                    vm.getMap().then((mapObject) => {
                        vm.updateLayer(mapObject);
                    })
                },
                deep: true
            },
            layerStyle: {
                handler(layerStyle) {
                    if (!layerStyle) {
                        return false;
                    }
                    this.layer.setStyle(transformStyle(layerStyle));
                    this.layer.changed();
                },
                deep: true
            }
        },
        computed: {
            moveOlStyle() {
                return this.moveStyle ? transformStyle(this.moveStyle) : null;
            },
            clickOlStyle() {
                return this.clickStyle ? transformStyle(this.clickStyle) : null;
            },
            layerOptions() {
                let layerSourceOp = Object.assign({}, this.options.source, {
                    formatParams: {
                        idProperty: this.idProperty
                    }
                })
                return Object.assign({}, this.options, {source: layerSourceOp});
            }
        },
        methods: {
            initData() {
                this.map = null;
                this.layer = null;
                this.tempLayer = null;     //临时图层
            },
            init() {
                let vm = this;
                vm.initData();
                vm.getMap().then((mapObject) => {
                    vm.map = mapObject;
                    vm.layer = vm.addLayer(mapObject);
                    vm.tempLayer = vm.addEventLayer(mapObject, vm.layer.getSource());
                    if (vm.layerStyle) {
                        vm.layer.setStyle(transformStyle(vm.layerStyle));
                    }
                    vm.handleEvent(mapObject);
                })
            },
            addLayer(map) {
                let layer = layerMethods.createLayer(this.layerOptions, map.getView().getProjection());
                map.addLayer(layer);
                layer.set('tileVectorLayer', true);
                return layer;
            },
            removeLayer(map, layer) {
                if (layer) {
                    if (layer.getSource().clear) {
                        layer.getSource().clear();
                    }
                    map.removeLayer(layer);
                }
            },
            updateLayer(mapObject) {
                const vm = this;
                let projection = mapObject.getView().getProjection();
                if (vm.layer && options.refresh) {
                    if (vm.layer.getSource().clear) {
                        vm.layer.getSource().clear();
                    }
                    let oSource = layerMethods.createSource(vm.layerOptions.source, projection);
                    vm.layer.setSource(oSource);

                    if (typeof options.opacity !== 'undefined') {
                        vm.layer.setOpacity(options.opacity);
                    }
                    if (typeof options.visible !== 'undefined') {
                        vm.layer.setVisible(options.visible);
                    }
                    if (typeof options.zIndex !== 'undefined') {
                        vm.layer.setZIndex(options.zIndex);
                    }
                } else {
                    vm.removeLayer(mapObject, vm.layer);
                    vm.addLayer();
                    if (vm.layerStyle) {
                        vm.layer.setStyle(transformStyle(vm.layerStyle));
                    }
                }
                vm.tempLayer.setSource(vm.layer.getSource());
                vm.$emit('layer-created', vm.layer);
            },
            addEventLayer(map, source) {
                const vm = this;
                return new VectorTileLayer({   //事件临时图层
                    map,
                    renderMode: 'vector',
                    source,
                    style: function (feature, resolution) {
                        let style = null;
                        if (feature.getId() === vm.selectionId) {
                            style = vm.clickOlStyle;
                        } else if (feature.getId() === vm.moveId) {
                            style = vm.moveOlStyle;
                        }
                        if (style) {
                            if (typeof style === 'function') {
                                if (style(feature, resolution)) {
                                    return style(feature, resolution);
                                }
                            }
                            return style;
                        }
                    }
                })
            },
            getOutCoord(coords) {
                let outCoord = coords,
                    outProj = "";
                const projection = this.map.getView().getProjection().getCode();
                if (projection !== "pixel" && projection !== "xkcd-image") { //确保输出坐标的坐标系为4326
                    outCoord = coordinateTransform(coords, projection, "EPSG:4326");
                    outProj = "EPSG:4326";
                } else {
                    outProj = projection;
                }
                return {
                    coords: outCoord,
                    projection: outProj
                }
            },
            listenerEvent(event) {
                const vm = this;
                let {type} = event;  //pointermove  singleclick
                vm.layer.getFeatures(event.pixel).then(function (features) {
                    if (!features.length) {
                        if (type === 'pointermove') {
                            vm.moveFeature = null;
                            vm.moveId = '';
                        } else {
                            if (vm.blankClear) {
                                vm.selectFeature = null;
                                vm.selectionId = '';
                            }
                        }
                        vm.tempLayer.changed();
                        return;
                    }
                    let feature = features[0];
                    if (!feature) {
                        return;
                    }
                    if (type === 'pointermove') {
                        vm.moveId = feature.getId();
                        vm.moveFeature = {
                            ...vm.getOutCoord(event.coordinate),
                            ...feature.getProperties()
                        };
                        vm.$emit("pointermove", vm.moveFeature);
                    } else {
                        vm.selectionId = feature.getId();
                        vm.selectFeature = {
                            ...vm.getOutCoord(event.coordinate),
                            ...feature.getProperties()
                        };
                        vm.$emit("singleclick", vm.selectFeature);
                    }
                    vm.tempLayer.changed();
                });
            },
            handleEvent(map) {
                const vm = this;
                const mapId = map.getTarget().id || "default";
                Bus.$on(`${mapId}.pointermove`, vm.listenerEvent)
                Bus.$on(`${mapId}.singleclick`, vm.listenerEvent)
            }
        },
        beforeDestroy() {
            let vm = this;
            vm.getMap().then((mapObject) => {
                mapObject.removeLayer(vm.layer);
                vm.tempLayer.setMap(null);

                const mapId = mapObject.getTarget().id || "default";
                Bus.$off(`${mapId}.tileVectorLayer.pointermove`, vm.listenerMove);
                Bus.$off(mapId + ".pointermove.blank", vm.listenerMove_blank)
                Bus.$off(`${mapId}.tileVectorLayer.singleclick`, vm.listenerClick);
                Bus.$off(mapId + ".singleclick.blank", vm.listenerClick_blank);
            });
            vm.selectFeature = null;
            vm.moveFeature = null;
        }
    }
</script>