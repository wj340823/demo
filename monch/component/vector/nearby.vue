<template>
    <div class="vueol-nearby">
        <div class="nearby-control-point">
            <a></a>
            <label @click="editDis($event)">
                <span v-if="!edit">{{initialRadius}}</span>
                <input type="number" class="nearby-control-input" v-model="initialRadius" v-else/>m
            </label>
        </div>
    </div>
</template>
<script>
    import {Vector as VectorLayer} from 'ol/layer';
    import {Vector as VectorSource} from 'ol/source';
    import {
        createOverlay,
        createFeature,
        getGeodesicDistance,
        coordinateTransform,
        createStyle, calcRadius
    } from "../../util/helpers";

    export default {
        name: 'ol-nearby',
        inject: ['getMap'],
        props: {
            center: {
                type: Array,
                required: true,
                default() {
                    return [120, 30]
                }
            },
            radius: {
                type: Number,
                default: 0
            },
            circleStyle: {
                type: Object,
                default() {
                    return {
                        fill: {
                            color: [110, 162, 228, 0.3]
                        },
                        stroke: {
                            width: 1,
                            color: [110, 162, 228]
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
                initialRadius: this.radius,
                layer: null,
                source: null,
                feature: null,
                label: null,
                edit: false,
                isDrag: false,
                mapCoord: []   //转换后的中心点坐标
            };
        },
        watch: {
            center: {
                handler() {
                    this.getMap().then((map) => {
                        this.update(map);
                    })
                },
                deep: true
            },
            radius() {
                this.getMap().then((map) => {
                    this.update(map);
                })
            },
            circleStyle: {
                handler() {
                    let s;
                    if (this.circleStyle instanceof Array) {
                        let len = this.circleStyle.length;
                        for (let i = 0; i < len; i++) {
                            s[i] = createStyle(this.circleStyle[i]);
                        }
                    } else {
                        s = createStyle(this.circleStyle);
                    }

                    this.feature.setStyle(s);
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
                    if (this.projection != "pixel") {
                        this.mapCoord = coordinateTransform(this.center, this.projection, map.getView().getProjection().getCode()); //圆心坐标
                    } else {
                        this.mapCoord = this.center;
                    }
                    this.createLayer(map);
                    this.createCircle(map);
                    this.createOverlay(map);
                    this.listenEvent(map);   //监听拖拽事件
                })
            },
            update(map) {
                const viewProjection = map.getView().getProjection().getCode();
                this.initialRadius = this.radius;
                if (this.projection != "pixel") {
                    this.mapCoord = coordinateTransform(this.center, this.projection, viewProjection); //圆心坐标
                } else {
                    this.mapCoord = this.center;
                }

                //circle
                const geo = this.feature.getGeometry();
                let r = calcRadius(viewProjection, this.initialRadius);
                geo.setCenterAndRadius(this.mapCoord, r);

                //弹框
                this.label.setPosition([this.mapCoord[0] + r, this.mapCoord[1]]);

                this.fitView(map);    //适应屏幕
            },
            createLayer(map) {
                this.source = new VectorSource();
                this.layer = new VectorLayer({
                    source: this.source,
                    zIndex: this.zIndex
                });
                this.layer.set("nearLayer", true);
                map.addLayer(this.layer);
            },
            fitView(map) {
                //适应屏幕
                let extent = this.source.getExtent();
                map.getView().fit(extent, {
                    size: map.getSize(),
                    padding: [15, 15, 15, 15],
                    duration: 1000
                });
            },
            createCircle(map) {
                const viewProjection = map.getView().getProjection().getCode();
                let data = {
                    type: "Circle",
                    coords: this.mapCoord,
                    radius: calcRadius(viewProjection, this.initialRadius),
                    projection: viewProjection,
                    style: this.circleStyle
                };
                this.feature = createFeature(data, viewProjection);
                this.source.addFeature(this.feature);

                this.fitView(map);    //适应屏幕
            },
            createOverlay(map) {
                const viewProjection = map.getView().getProjection().getCode();
                let r = calcRadius(viewProjection, this.initialRadius);
                const pos = [this.mapCoord[0] + r, this.mapCoord[1]];
                this.label = createOverlay(this.$el, pos);
                map.addOverlay(this.label);
            },
            windowToCanvas(canvas, x, y) {
                const bbox = canvas.getBoundingClientRect();
                return [x - bbox.left - (bbox.width - canvas.clientWidth) / 2, y - bbox.top - (bbox.height - canvas.clientHeight) / 2];
            },
            listenEvent(map) {
                const vm = this;
                const viewEle = map.getViewport();
                const ele = document.getElementsByClassName("nearby-control-point")[0].children[0];
                ele.addEventListener("mousedown", e => {
                    const preRadius = vm.feature.getGeometry().getRadius();
                    const prePos = vm.label.getPosition();
                    const downPos = map.getCoordinateFromPixel(vm.windowToCanvas(viewEle, e.clientX, e.clientY));

                    function calcDynamic(e) {
                        vm.isDrag = true;
                        const coordinate = map.getCoordinateFromPixel(vm.windowToCanvas(viewEle, e.clientX, e.clientY));
                        vm.label.setPosition([prePos[0] + coordinate[0] - downPos[0], vm.mapCoord[1]]);

                        const nowRadius = Math.abs(coordinate[0] - downPos[0] + preRadius);
                        vm.feature.getGeometry().setRadius(nowRadius);

                        const viewPro = map.getView().getProjection().getCode();
                        const radiusDis = getGeodesicDistance(viewPro, vm.mapCoord, [vm.mapCoord[0] + nowRadius, vm.mapCoord[1]]);
                        vm.initialRadius = parseInt(radiusDis);
                        return false;
                    }

                    viewEle.addEventListener('pointermove', calcDynamic);

                    function removeCalc() {
                        vm.fitView(map);   //适应屏幕
                        vm.label.setPosition([vm.mapCoord[0] + vm.feature.getGeometry().getRadius(), vm.mapCoord[1]]);

                        vm.$emit("update:radius", parseInt(vm.initialRadius));   //向上传递消息
                        vm.isDrag = false;

                        viewEle.removeEventListener('pointermove', calcDynamic);
                        viewEle.removeEventListener('pointerup', removeCalc);
                        return false;
                    }

                    viewEle.addEventListener('pointerup', removeCalc);
                })
            },
            editDis(e) {
                if (this.isDrag) {
                    return;
                }
                this.edit = true;

                this.$nextTick(() => {
                    const input = document.getElementsByClassName("nearby-control-input")[0];
                    input.focus();
                })

                e.stopPropagation();

                this.getMap().then((map) => {
                    this.listenBlank(map);   //点击空白处，按照 input 的 radius 刷新 circle
                })
            },
            listenBlank(map) {
                //点击空白处，按照 input 的 radius 刷新 circle
                const vm = this;
                const viewEle = map.getViewport();
                const viewProjection = map.getView().getProjection().getCode();

                function calc(e) {
                    if (vm.edit && e.target.tagName.toLowerCase() != "input") {
                        vm.edit = false;
                        const perDegree = getGeodesicDistance(viewProjection, vm.mapCoord, [vm.mapCoord[0] + 1, vm.mapCoord[1]]);
                        let radius = vm.initialRadius / perDegree;
                        vm.feature.getGeometry().setRadius(radius);
                        vm.label.setPosition([vm.mapCoord[0] + radius, vm.mapCoord[1]]);

                        vm.fitView(map); //适应屏幕

                        viewEle.removeEventListener("pointerdown", calc);
                        vm.$emit("update:radius", parseInt(vm.initialRadius));   //向上传递消息
                    }
                }

                viewEle.addEventListener("pointerdown", calc);
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

                map.removeOverlay(vm.label);
            })
        }
    }
</script>