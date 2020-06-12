<template>
    <div class="vueol-view" style="display: none !important;">
        {{handleCenter}}
    </div>
</template>
<script>
    import View from 'ol/View'
    import {isEqual, coordinateTransform, extentTransform} from '../../util/helpers'
    import Projection from 'ol/proj/Projection.js';

    export default {
        name: 'ol-view',
        props: {
            /**
             * The center coordinate in the view projection.
             * @type {number[]}
             * @default [0, 0]
             * @vueSync
             */
            center: {
                type: Object,
                default: () => ({
                    'coord': [120, 30],
                    'projection': 'EPSG:4326'
                })
            },
            constrainRotation: {
                type: [Boolean, Number],
                default: true
            },
            enableRotation: {
                type: Boolean,
                default: true
            },
            /**
             * The extent that constrains the center defined in the view projection,
             * in other words, center cannot be set outside this extent.
             * @default undefined
             */
            extent: {
                type: Array,
                validator: value => value.length === 4
            },
            maxResolution: Number,
            minResolution: Number,
            /**
             * @default 28
             */
            maxZoom: {
                type: Number,
                default: 28
            },
            /**
             * @default 0
             */
            minZoom: {
                type: Number,
                default: 0
            },
            /**
             * @default EPSG:3857
             */
            projection: {
                type: [String, Object],
                default: 'EPSG:3857'
            },
            resolution: Number,
            resolutions: Array,
            /**
             * The initial rotation for the view in **radians** (positive rotation clockwise).
             * @type {number}
             * @vueSync
             */
            rotation: {
                type: Number,
                default: 0
            },
            /**
             * Zoom level used to calculate the resolution for the view as `int` value. Only used if `resolution` is not defined.
             * @type {number}
             * @default 0
             * @vueSync
             */
            zoom: {
                type: Number,
                default: 6
            },
            /**
             * @default 2
             */
            zoomFactor: {
                type: Number,
                default: 2
            }
        },
        data() {
            return {
                $view: null
            }
        },
        created() {

        },
        watch: {
            center: {
                handler(value) {
                    if (this.$view && !isEqual(value.coord, this.viewCenter)) {
                        if (typeof this.projection == 'object') {
                            /* 这里指pixel
                            * {
                                        code: 'xkcd-image',
                                        units: 'pixels',
                                        extent: [0, 0, 740, 832]
                                    }
                             */
                            if (value.animate) {
                                this.$view.animate({
                                    center: value.coord
                                })
                            } else {
                                this.$view.setCenter(value.coord);
                            }
                        } else {
                            const coord = coordinateTransform(value.coord, value.projection || "EPSG:4326", this.projection);
                            if (value.animate) {
                                this.$view.animate({
                                    center: coord
                                },{zoom: this.zoom})
                            } else {
                                this.$view.setCenter(coord);
                            }
                        }
                    }
                },
                deep: true
            },
            resolution(value) {
                if (this.$view && value !== this.viewResolution) {
                    this.$view.setResolution(value);
                }
            },
            zoom(value) {
                value = Math.round(value);
                if (this.$view && value !== this.viewZoom) {
                    this.$view.setZoom(value);
                }
            },
            rotation(value) {
                if (this.$view && value !== this.viewRotation) {
                    this.$view.setRotation(value);
                }
            },
            minZoom(value) {
                if (this.$view && value !== this.$view.getMinZoom()) {
                    this.$view.setMinZoom(value);
                }
            },
            maxZoom(value) {
                if (this.$view && value !== this.$view.getMaxZoom()) {
                    this.$view.setMaxZoom(value);
                }
            }
        },
        computed: {
            viewZoom() {
                if (this.$view) {
                    return Math.round(this.$view.getZoom());
                }

                return this.zoom;
            },
            viewRotation() {
                if (this.$view) {
                    return this.$view.getRotation();
                }

                return this.rotation;
            },
            viewResolution() {
                if (this.$view) {
                    return this.$view.getResolution();
                }

                return this.resolution;
            },
            viewCenter() {
                if (this.$view) {
                    return this.$view.getCenter();
                }
            }
        },
        methods: {
            handleCenter() {
                if (typeof this.projection == 'object') {
                    /* 这里指pixel
                    * {
                                code: 'xkcd-image',
                                units: 'pixels',
                                extent: [0, 0, 740, 832]
                            }
                     */
                    return this.center.coord;
                }
                return coordinateTransform(this.center.coord, this.center.projection || "EPSG:4326", this.projection);
            },
            handleExtent() {
                if(!this.extent) {
                    return undefined;
                }
                if (typeof this.projection == 'object') {
                    return this.extent;
                }
                return extentTransform(this.extent, this.center.projection || "EPSG:4326", this.projection);
            },
            /**
             * @return {ol.View}
             * @protected
             */
            createView() {
                let center = this.handleCenter();
                let extent = this.handleExtent();
                return new View({
                    center: center,
                    constrainRotation: this.constrainRotation,
                    enableRotation: this.enableRotation,
                    extent,
                    maxResolution: this.maxResolution,
                    minResolution: this.minResolution,
                    maxZoom: this.maxZoom,
                    minZoom: this.minZoom,
                    projection: typeof this.projection == 'object' ? new Projection(this.projection) : this.projection,
                    resolution: this.resolution,
                    resolutions: this.resolutions,
                    rotation: this.rotation,
                    zoom: this.zoom,
                    zoomFactor: this.zoomFactor,
                });
            },
            listenViewChange(mapObject) {
                const vm = this;
                mapObject.on('moveend', function () {
                    let coord = vm.$view.getCenter();
                    if (typeof vm.projection != 'object') {
                        coord = coordinateTransform(coord, vm.projection, vm.center.projection || "EPSG:4326");
                    }
                    let center = {
                        coord
                    }
                    if (vm.center.projection) {
                        center.projection = vm.center.projection;
                    }
                    vm.$emit('update:center', center);
                    vm.$emit('update:zoom', vm.$view.getZoom());
                });
                vm.$view.on('change:rotation', function () {
                    vm.$emit('update:rotation', vm.$view.getRotation());
                });
            }
        }
    }
</script>