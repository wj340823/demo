<template>
    <div class="vueol-baselayer" style="display: none !important;">
        <slot :selectFeature="selectFeature" :moveFeature="moveFeature"></slot>
    </div>
</template>
<script>
    import {Vector as VectorLayer} from 'ol/layer.js';
    import {layerMethods} from '../../util/layer';
    import {
        isFunction, convolve, normalize, transformStyle
    } from '../../util/helpers';
    import eventMixins from '../../mixins/layerEvent';

    export default {
        name: 'ol-layer',
        mixins: [eventMixins],
        inject: ['getMap'],
        props: {
            options: {
                type: Object,
                default: function () {
                    return {
                        name: "bd",
                        source: {
                            type: 'bdTileImage',
                            intranet: false   //默认采用外网百度地图；若使用内网地图，需配置url
                        }
                    }
                }
            },
            layerStyle: [Object, Array, Function],    //矢量图层样式设置
            moveStyle: [Object, Array, Function],     //矢量图层悬浮样式设置
            clickStyle: [Object, Array, Function],     //矢量图层点击样式设置
            params: Object,   //source.params 主要用于arcgis服务的配置
            filter: {    //图片图层滤镜
                type: String,
                default: ""
            }
        },
        data() {
            return {
                layer: null
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
                        vm.updateLayer(mapObject, Object.assign({},vm.options));
                    })
                },
                deep: true
            },
            layerStyle: {
                handler(layerStyle) {
                    if (!layerStyle) {
                        return false;
                    }
                    // not every layer has a setStyle method
                    if (this.layer.setStyle && isFunction(this.layer.setStyle)) {
                        this.layer.setStyle(transformStyle(layerStyle));
                        this.layer.changed();
                    }
                },
                deep: true
            },
            params: {
                handler(nval) {
                    if (this.layer && this.layer.getSource().updateParams) {
                        this.layer.getSource().updateParams(nval);
                    }
                },
                deep: true
            }
        },
        methods: {
            init() {
                let vm = this;
                vm.getMap().then((mapObject) => {
                    vm.map = mapObject;
                    let options = Object.assign({},this.options);
                    if (this.params) {
                        options.source.params = this.params;
                    }
                    vm.updateLayer(mapObject, options);
                    if(vm.layer instanceof VectorLayer) {
                        if (vm.layerStyle) {
                            // not every layer has a setStyle method
                            if (vm.layer.setStyle && isFunction(vm.layer.setStyle)) {
                                vm.layer.setStyle(transformStyle(vm.layerStyle));
                            }
                        }
                        vm.handleEvent(mapObject);
                    }
                })
            },
            updateLayer(mapObject, options) {
                const vm = this;
                let projection = mapObject.getView().getProjection();
                if (vm.layer && options.refresh) {
                    if (options.refresh) {
                        if (vm.layer.getSource().clear) {
                            vm.layer.getSource().clear();
                        }
                        let oSource = layerMethods.createSource(options.source, projection, options.onLayerCreated, options.onLayerFailFn);
                        vm.layer.setSource(oSource);
                    }

                    if (typeof options.opacity!=='undefined') {
                        vm.layer.setOpacity(options.opacity);
                    }
                    if (typeof options.visible!=='undefined') {
                        vm.layer.setVisible(options.visible);
                    }
                    if (typeof options.zIndex!=='undefined') {
                        vm.layer.setZIndex(options.zIndex);
                    }
                } else {
                    if (vm.layer) {
                        if (vm.layer.getSource().clear) {
                            vm.layer.getSource().clear();
                        }
                        mapObject.removeLayer(vm.layer);
                    }
                    vm.layer = layerMethods.createLayer(options, projection);
                    mapObject.addLayer(vm.layer);

                    if (vm.layerStyle) {
                        if (vm.layer.setStyle && isFunction(vm.layer.setStyle)) {
                            vm.layer.setStyle(transformStyle(vm.layerStyle));
                        }
                    }

                    if (vm.params) {
                        if (vm.layer && vm.layer.getSource().updateParams) {
                            vm.layer.getSource().updateParams(vm.params);
                        }
                    }

                    if (vm.filter) {
                        vm.layer.on('postcompose', function (event) {
                            convolve(event.context, normalize(vm.filter));
                            mapObject.render();
                        });
                    }
                }
            }
        }
    }
</script>
