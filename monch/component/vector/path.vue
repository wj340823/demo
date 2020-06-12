<template>
    <div class="vueol-path" style="display: none;"></div>
</template>
<script>
    import {Vector as VectorLayer} from 'ol/layer';
    import {Vector as VectorSource} from 'ol/source';
    import {olMapDefaults} from '../../util/olMapDefaults'
    import {
        createFeature, createStyle, isDefined, deepClone,
        getArcPoints, coordinateTransform, calcRadius
    } from '../../util/helpers'

    export default {
        name: 'ol-path',
        inject: ['getMap'],
        props: {
            options: {
                type: Object,
                default() {
                    return {
                        id: 'default',
                        type: 'Circle',
                        coords: [120, 30],
                        radius: 500,
                        style: {
                            fill: {
                                color: "rgba(255,0,0,0.2)"
                            },
                            stroke: {
                                color: 'blue',
                                width: 4
                            }
                        }
                    }
                }
            },
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
                layer: null,
                source: null,
                feature: null
            }
        },
        watch: {
            options: {
                handler() {
                    const vm = this;
                    vm.getMap().then(map => {
                        vm.update(map);
                    })
                },
                deep: true
            }
        },
        mounted() {
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
                this.layer.set("pathLayer", true);
                map.addLayer(this.layer);
            },
            update(map) {
                const viewProjection = map.getView().getProjection().getCode();
                const defaults = olMapDefaults.getDefaults();

                let defaultStyle = defaults.styles.feature;

                if (this.feature) {
                    if (this.options.type == "Circle") {
                        let data = deepClone(this.options);
                        if(this.projection!="pixel") {
                            data.coords = coordinateTransform(data.coords, this.projection, viewProjection);
                            data.radius = calcRadius(viewProjection, data.radius);
                        }
                        this.feature.getGeometry().setCenterAndRadius(data.coords, data.radius);
                    } else if(this.options.type == "Sector"){
                        let data = deepClone(this.options);
                        if(this.projection!="pixel") {
                            data.coords = coordinateTransform(data.coords, this.projection, viewProjection);
                            data.radius = calcRadius(viewProjection, data.radius);
                        }
                        let coords = getArcPoints(data.coords, data.radius, data.startAngle, data.endAngle);
                        coords.push(data.coords, coords[0]);
                        this.feature.getGeometry().setCoordinates([coords]);
                    }else{
                        this.feature.getGeometry().setCoordinates(this.options.coords);

                        if (this.projection != 'pixel') {
                            this.feature.getGeometry().transform(this.projection, viewProjection);
                        }
                    }

                    //样式更新
                    let style = deepClone(this.options.style) || defaultStyle;
                    if (isDefined(style)) {
                        if (style instanceof Array) {
                            let len = style.length;
                            for (let i = 0; i < len; i++) {
                                style[i] = createStyle(style[i]);
                            }
                        } else {
                            style = createStyle(style);
                        }

                        this.feature.setStyle(style);
                    }
                } else {
                    let data = deepClone(this.options);
                    data.style = data.style || defaultStyle;
                    data.projection = this.projection;
                    if (this.options.radius) {
                        if(this.projection!="pixel") {
                            data.coords = coordinateTransform(data.coords, this.projection, viewProjection);
                            data.radius = calcRadius(viewProjection, data.radius);
                            data.projection = viewProjection;
                        }
                    }
                    this.feature = createFeature(data, viewProjection);
                    this.source.addFeature(this.feature);
                    this.$emit('create-end', this.feature);
                }
            }
        },
        beforeDestroy() {
            const vm = this;
            vm.getMap().then((map) => {
                let source = vm.source;
                source.getFeatures().forEach(function (f) {
                    let s = f.getStyle();
                    s = null;
                    f = null;
                })
                source.clear();
                source = null;
                map.removeLayer(vm.layer);
            })
        }
    }
</script>