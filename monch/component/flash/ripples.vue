<template>
    <div class="vueol-flash" style="display: none;"></div>
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
        name: 'ol-flash',
        inject: ['getMap'],
        props: {
            coords: {
                type: Array,
                validator: function (value) {
                    return value.length==2;
                }
            },
            circleStyle: {
                type: Object,
                default() {
                    return {
                        image: {
                            circle: {
                                radius: 0,
                                fill: {
                                    color: [255, 0, 0]
                                }
                            }
                        }
                    }
                }
            },
            duration: {   //一圈的动画周期
                type: Number,
                default: 3000
            },
            loops: {   //圈数
                type: Number,
                default: 3
            },
            radiusRange: {
                type: Array,
                default() {
                    return [0, 30];
                },
                validator(value) {
                    return value.length == 2 && value[0] <= value[1];
                }
            },
            hasCenter: {
                type: Object,
                validator(value) {
                    return value.radius&&value.color;
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
                features: [],
                listenerKey: null
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
            init() {
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
                this.layer.set("flashLayer", true);
                map.addLayer(this.layer);
            },
            startFlash(map) {
                const vm = this;

                let style = [];
                for (let i = 0; i < vm.loops; i++) {
                    style.push(createStyle(vm.circleStyle));
                }

                function handleStyle(elapsed, style) {
                    if (elapsed >= 0) {
                        let elapsedRatio = elapsed / vm.duration;
                        let radius = elapsedRatio * (vm.maxRadius - vm.minRadius) + vm.minRadius;
                        let opacity = 1 - elapsedRatio;
                        style.getImage().setRadius(radius);

                        if (style.getImage().getFill()) {
                            let color = style.getImage().getFill().getColor();
                            style.getImage().getFill().setColor([color[0], color[1], color[2], opacity]);
                        }

                        return style;
                    }

                    return undefined;
                }

                function animate(event) {
                    let frameState = event.frameState;

                    for (let i = 0; i < vm.loops; i++) {
                        let elapsed = (frameState.time - parseInt(vm.duration / vm.loops * i)) % vm.duration;
                        vm.features[i].setStyle(handleStyle(elapsed, style[i]));
                    }

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

                if (vm.listenerKey) {
                    unByKey(vm.listenerKey);
                }

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

                vm.features = [];
                for (let i = 0; i < vm.loops; i++) {
                    vm.features.push(createFeature());
                }

                vm.source.addFeatures(vm.features);

                if(vm.hasCenter) {
                    let f = createFeature();
                    f.setStyle(createStyle({
                        image:{
                            circle:{
                                radius: vm.hasCenter.radius,
                                fill: {
                                    color: vm.hasCenter.color
                                }
                            }
                        }
                    }))
                    vm.source.addFeature(f);
                }

                vm.startFlash(map);
            }
        },
        computed: {
            minRadius() {
                return this.radiusRange[0];
            },
            maxRadius() {
                return this.radiusRange[1];
            }
        },
        beforeDestroy() {
            const vm = this;
            if (this.listenerKey) {
                unByKey(this.listenerKey)
            }
            vm.getMap().then((map) => {
                vm.features.forEach(function (f) {
                    let s = f.getStyle();
                    s = null;
                    f.setStyle(null);
                    f = null;
                })
                vm.source.clear();
                map.removeLayer(vm.layer);
            })
        }
    }
</script>