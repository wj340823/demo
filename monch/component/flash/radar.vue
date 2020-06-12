<template>
    <div class="vueol-radar" style="display: none;"></div>
</template>
<script>
    import {Vector as VectorLayer} from 'ol/layer';
    import {Vector as VectorSource} from 'ol/source';
    import Feature from "ol/Feature";
    import {Circle, Polygon} from "ol/geom";
    import {unByKey} from "ol/Observable";
    import Style from "ol/style/Style";
    import Fill from "ol/style/Fill";
    import {getVectorContext} from 'ol/render';
    import {createStyle, calcRadius, getArcPoints, coordinateTransform, colorRgb} from "../../util/helpers";

    export default {
        name: 'ol-radar',
        inject: ['getMap'],
        props: {
            center: {
                type: Array,
                required: true,
                validator: function (value) {
                    return value.length == 2;
                }
            },
            radius: {
                type: Number,
                default: 500
            },
            circleStyle: {
                type: Object,
                default() {
                    return {
                        stroke: {
                            width: 1,
                            color: '#12b5d0'
                        }
                    }
                }
            },
            sectorColor: {
                type: String,
                default: '#12b5d0'
            },
            speed: {
              type: String,
              default: 'normal',
              validator(value){
                  return ["slow", "normal"].indexOf(value)!=-1;
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
        watch: {
            center() {
                this.update();
            },
            radius() {
                this.update();
            },
            circleStyle: {
                handler(nval) {
                    this.circleFeature.setStyle(createStyle(nval));
                },
                deep: true
            }
        },
        computed: {
            normalizeColor(){
                let color = this.sectorColor;
                let c = colorRgb(color).split(",");
                c[0] = parseInt(c[0]);
                c[1] = parseInt(c[1]);
                c[2] = parseInt(c[2]);
                return c;
            }
        },
        methods: {
            init() {
                this.initData();

                this.getMap().then((map) => {
                    this.map = map;
                    this.layer = this.createLayer(map);
                    this.source = this.layer.getSource();

                    this.update();
                })
            },
            initData() {
                this.map = null;
                this.layer = null;
                this.source = null;
                this.circleFeature = null;

                this.renderEventKey = null;   //地图渲染事件监听
                this.curNo = 0;
                this.angleDiff = 5;   //每个小扇形的角度
                this.parts = 360 / this.angleDiff;
            },
            update() {
                this.source.clear();

                //把数据处理成和地图坐标系一致
                this.viewProjection = this.map.getView().getProjection();
                this.centerAfter = coordinateTransform(this.center, this.projection, this.viewProjection);
                this.radiusAfter = calcRadius(this.viewProjection, this.radius);

                this.createCircle();   //底下的圆
                this.listenRender();
            },
            createLayer(map) {
                let layer = new VectorLayer({
                    source: new VectorSource(),
                    zIndex: this.zIndex
                });
                layer.set("radar", true);
                map.addLayer(layer);
                return layer;
            },
            createCircle() {
                let geometry = new Circle(this.centerAfter, this.radiusAfter);
                let f = this.circleFeature = new Feature(geometry);
                f.setStyle(createStyle(this.circleStyle));

                //二维转三维 贴地
                geometry.set("altitudeMode", "clampToGround");

                this.source.addFeature(f);
            },
            createSector(max, vectorContext) {
                let radian = this.angleDiff / 180 * Math.PI;
                let min = Math.max(max - this.parts - 1, 0);
                for (let i = max; i >= min; i--) {
                    let startAngle = radian * i;
                    let coords = getArcPoints(this.centerAfter, this.radiusAfter, startAngle, startAngle + radian);
                    coords.push(this.centerAfter);
                    coords.push(coords[0]);
                    let geometry = new Polygon([coords]);
                    let f = new Feature(geometry);

                    let c = this.normalizeColor;
                    c[3] = 0.6 * Math.pow(0.95, max - i);
                    let style = new Style({
                        fill: new Fill({
                            color: this.normalizeColor
                        })
                    });

                    vectorContext.drawFeature(f, style);
                }
            },
            moveFeature(event) {
                let vectorContext = getVectorContext(event);
                this.createSector(parseInt(this.curNo), vectorContext);
                this.curNo += this.speed=="normal"?1:0.5;
                /*if (this.curNo > 360/this.angleDiff-1) {
                    this.curNo = 0;parseInt(this.curNo)
                }*/

                // tell OpenLayers to continue the postcompose animation
                this.map.render();
            },
            listenRender() {
                if (this.renderEventKey) {
                    unByKey(this.renderEventKey);
                }
                this.renderEventKey = this.layer.on('postrender', this.moveFeature);
                this.map.render();
            },
        },
        mounted() {
            this.init();
        },
        beforeDestroy() {
            const vm = this;
            vm.getMap().then((map) => {
                vm.source.clear();

                if (vm.renderEventKey) {
                    unByKey(vm.renderEventKey);
                }
                map.removeLayer(vm.layer);
            });
        }
    }
</script>