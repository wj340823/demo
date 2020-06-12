<template>
    <div class="vueol-twinkle" style="display: none;"></div>
</template>
<script>
    import {Vector as VectorLayer} from 'ol/layer';
    import {Vector as VectorSource} from 'ol/source';
    import {easeOut} from 'ol/easing'
    import {unByKey} from 'ol/Observable'
    import {transform as transformProjection} from 'ol/proj'
    import Feature from 'ol/Feature.js';
    import {
        Point
    } from 'ol/geom';
    import {createStyle} from "../../util/helpers";

    export default {
        name: 'ol-twinkle',
        inject: ['getMap'],
        props: {
            coords: {
                type: Array
            },
            circleStyle: {
                type: Object,
                default(){
                    return {
                        image:{
                            circle:{
                                radius: 14,
                                snapToPixel: false,
                                fill: {
                                    color: [255, 0, 0, 1]
                                }
                            }
                        }
                    }
                }
            },
            duration: {
                type: Number,
                default: 1000
            },
            radius: {
                type: Number,
                default(){
                    return 10;
                }
            },
            zIndex: {
                type: Number,
                default: 0
            },
            projection: {
                type: String,
                default: 'EPSG:4326'
            },
        },
        data() {
            return {
                layer: null,
                source: null,
                feature: null,
                listenerKey: null,
            }
        },
        watch: {
            coords() {
                this.getMap().then((map) => {
                    this.update(map);
                })
            }
        },
        created() {
            this.init();
        },
        methods: {
            init(){
                this.getMap().then((map) => {
                    this.createLayer(map);
                    this.update(map);
                })
            },
            createLayer(map) {
                this.source = new VectorSource();
                this.layer = new VectorLayer({
                    source: this.source,
                    zIndex: this.zIndex
                });
                this.layer.set("twinkleLayer", true);
                map.addLayer(this.layer);
            },
            startFlash(map) {
                const vm = this;

                let style = createStyle(vm.circleStyle);

                function animate(event) {
                    let frameState = event.frameState;
                    let elapsed = frameState.time % vm.duration;
                    let elapsedRatio = elapsed / vm.duration * 2;
                    let opacity = elapsedRatio;
                    if(elapsedRatio>1){
                        opacity = 2 - elapsedRatio;
                    }

                    // 只设置颜色不会重新渲染，setRadius以强制样式渲染
                    style.getImage().setRadius(vm.radius);
                    let color = style.getImage().getFill().getColor();
                    style.getImage().getFill().setColor([color[0], color[1], color[2], opacity]);
                    vm.feature.setStyle(style);

                    // tell OpenLayers to continue postcompose animation
                    map.render();
                }

                if (vm.listenerKey) {
                    unByKey(vm.listenerKey);
                }
                vm.listenerKey = map.on('postcompose', animate);
            },
            update(map) {
                const vm = this;
                const viewProjection = map.getView().getProjection().getCode();
                this.source.clear();

                function createFeature() {
                    let geom;
                    if (vm.projection === 'pixel') {
                        geom = new Point(vm.coords);
                    } else {
                        geom = new Point(transformProjection(vm.coords, vm.projection, viewProjection));
                    }
                    return new Feature({
                        geometry: geom
                    });
                }

                vm.feature = createFeature();
                vm.source.addFeature(vm.feature);
                vm.startFlash(map);
            }
        },
        beforeDestroy() {
            const vm = this;
            vm.getMap().then((map) => {
                let s = vm.feature.getStyle();
                s = null;
                vm.feature.setStyle(null);
                vm.feature = null;
                vm.source.clear();
                map.removeLayer(vm.layer);
                if (this.listenerKey) {
                    unByKey(this.listenerKey)
                }
            })
        }
    }
</script>