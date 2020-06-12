<template>
    <div class="vueol-heat" style="display: none;"></div>
</template>
<script>
    import {Heatmap} from 'ol/layer';
    import {Vector as VectorSource} from 'ol/source';
    import {createFeature, validCoords} from '../../util/helpers';

    export default {
        name: 'ol-heat-map',
        inject: ['getMap'],
        props: {
            opacity: {
                type: Number,
                default: 1,
                validator(value) {
                    return value>=0&&value<=1;
                }
            },
            gradient: {
                type: Array,
                default() {
                    return ['#00f', '#0ff', '#0f0', '#ff0', '#f00'];
                }
            },
            radius: {
                type: Number,
                default: 8
            },
            blur: {
                type: Number,
                default: 15
            },
            points: {
                type: Array,
                required: true,
                default() {
                    return []
                }
            },
            zIndex: {
                type: Number,
                default: 2
            },
            projection: {
                type: String,
                default: 'EPSG:4326'
            }
        },
        watch: {
            points: {
                handler() {
                    const vm = this;
                    vm.getMap().then(map => {
                        vm.update(map);
                    })
                },
                deep: true
            },
            opacity(value) {
                if(this.layer&&this.layer.getOpacity()!==value) {
                    this.layer.setOpacity(value);
                }
            },
            gradient: {
                handler(value) {
                    if(this.layer) {
                        this.layer.setGradient([...value]);
                    }
                },
                deep: true
            },
            radius(value) {
                if(this.layer&&this.layer.getRadius()!==value) {
                    this.layer.setRadius(value);
                }
            },
            blur(value) {
                if(this.layer&&this.layer.getBlur()!==value) {
                    this.layer.setBlur(value);
                }
            },
            zIndex(zindex) {
                if (this.layer && this.layer.getZIndex() !== zindex) {
                    this.layer.setZIndex(zindex);
                }
            }
        },
        data() {
            return {
                source: null,
                layer: null
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
                this.layer = new Heatmap({
                    source: this.source,
                    opacity: this.opacity,
                    gradient: this.gradient,
                    radius: this.radius,
                    blur: this.blur,
                    zIndex: this.zIndex
                });
                this.layer.set("heatLayer", true);
                map.addLayer(this.layer);
            },
            validPoints(points) {
                let badPoint = points.find((p)=>!validCoords(p.lon, p.lat));
                if(badPoint) {
                    console.error("点位 经纬度不规范！", badPoint);
                    return false;
                }
                return true;
            },
            update(map) {
                const vm = this;
                const viewProjection = map.getView().getProjection().getCode();
                const count = this.points.length;
                let features = new Array();

                for (let i = 0; i < count; i++) {
                    let point = this.points[i];
                    if (point.coords) {
                        point.lon = point.coords[0];
                        point.lat = point.coords[1];
                    }
                }
                if(vm.projection==='EPSG:4326') {
                    if (!this.validPoints(this.points)) {
                        return false;
                    }
                }
                for (let i = 0; i < count; i++) {
                    let point = this.points[i];
                    if (point.lon && point.lat) {
                        let feature = createFeature({
                            projection: vm.projection,
                            lat: parseFloat(point.lat),
                            lon: parseFloat(point.lon),
                            id: point.id
                        }, viewProjection);
                        if (point.weight) {
                            feature.set('weight', point.weight);
                        }
                        features.push(feature);

                        feature.set("featureInfo", {
                            type: "heatFeature",
                            data: {}
                        });

                    }
                }

                this.source.clear(true);
                this.source.addFeatures(features);
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