<template>
    <div class="vueol-interaction-point" style="display: none;"></div>
</template>
<script>
    import {transform as transformProjection} from 'ol/proj';
    import {createFeature, validCoords, transformStyle} from "../../util/helpers";

    export default {
        name: 'ol-draw-point',
        inject: ['getMap', 'getLayer'],
        props: {
            id: {
                required: true,
                type: String,
            },
            coords: {
                required: true,
                type: Array
            },
            icon: [Object, Array, Function]   //图标样式
        },
        data() {
            return {}
        },
        watch: {
            coords: {
                async handler(nval) {
                    let map = await this.getMap();
                    if (!this.isValid(nval)) {  //坐标是否规范
                        return false;
                    }
                    let requestedPosition;
                    if (this.$parent.projection === 'pixel') {
                        requestedPosition = nval;
                    } else {
                        requestedPosition = transformProjection(nval,
                            this.$parent.projection, map.getView().getProjection());
                    }
                    if (this.feature) {
                        this.feature.getGeometry().setCoordinates(requestedPosition);
                    } else {
                        this.loadPoint(map);
                    }
                },
                deep: true
            },
            icon: {
                handler(nval) {
                    let style = transformStyle(nval);
                    if (this.feature) {
                        this.feature.setStyle(style);
                    }
                },
                deep: true
            }
        },
        methods: {
            async init() {
                let map = await this.getMap();
                if (!this.getLayer) {
                    console.error('[Vue - Openlayers] 缺少ol-draw-points');
                    return false;
                }
                this.layer = await this.getLayer();
                this.loadPoint(map);
            },
            initData() {
                this.layer = null;
                this.feature = null;
            },
            isValid(coords) {
                if (coords[0] && coords[1]) {
                    let lon = parseFloat(coords[0]);
                    let lat = parseFloat(coords[1]);
                    if (this.$parent.projection == "EPSG:4326") {
                        if (!validCoords(lon, lat)) {
                            console.error("经纬度不规范！");
                            return false;
                        }
                    }
                    return true;
                }else {
                    return false;
                }
            },
            loadPoint(map) {
                let style = transformStyle(this.icon || this.$parent.icon);
                const viewProjection = map.getView().getProjection().getCode();
                if (this.coords[0] && this.coords[1]) {
                    let lon = parseFloat(this.coords[0]);
                    let lat = parseFloat(this.coords[1]);
                    if (!this.isValid(this.coords)) {
                        return false;
                    }

                    this.feature = createFeature({
                        projection: this.$parent.projection,
                        lat,
                        lon,
                        id: this.id
                    }, viewProjection);
                    this.feature.setId(this.id);
                    this.feature.setStyle(style);

                    this.layer.getSource().addFeature(this.feature);

                    if (this.$parent.isLoadModify) {
                        this.$parent.addId(this.id);
                    }
                }
            }
        },
        created() {
            this.init();
        },
        beforeDestroy() {

        }
    }
</script>