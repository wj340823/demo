<template>
    <div class="vueol-pointLayer">
        <slot/>
    </div>
</template>
<script>
    import {Vector as VectorLayer} from 'ol/layer';
    import {Vector as VectorSource} from 'ol/source';
    import * as loadingstrategy from 'ol/loadingstrategy.js';
    import Collection from 'ol/Collection';
    import {Draw, Modify, Snap} from 'ol/interaction';
    import {toContext} from 'ol/render.js';
    import {transform as transformProjection} from 'ol/proj';
    import LineString from 'ol/geom/LineString';
    import {Fill, Icon, Stroke, Style} from 'ol/style.js';
    import {DEVICE_PIXEL_RATIO} from 'ol/has.js';
    import {transformStyle} from "../../util/helpers";
    import {unByKey} from "ol/Observable";

    export default {
        name: 'ol-draw-points',
        provide: function () {
            return {
                getLayer: this.getLayer
            }
        },
        inject: ['getMap'],
        props: {
            modifyColor: String | Array,  //编辑图标的颜色
            modifyId: Array,     //可编辑对象的id
            isAddModify: {                //是否绘制后就可编辑
                type: Boolean,
                default: true
            },
            isLoadModify: {               //是否加载后就可编辑
                type: Boolean,
                default: true
            },
            pixelTolerance: {   //图标热点区域半径，建议为图标最大宽度的一半
                type: Number,
                default: 20
            },
            icon: {   //图标样式
                type: [Object, Array, Function],
                default: function () {
                    return {
                        image: {
                            circle: {
                                radius: 6,
                                fill: {
                                    color: "#0099ff"
                                },
                                stroke: {
                                    color: "#fff",
                                    width: 1
                                }
                            }
                        }
                    }
                }
            },
            newId: [String, Number],   //新增触发器，用作新增feature的id
            isSingle: {   //是否每次只保留一个矢量
                type: Boolean,
                default: false
            },
            deleteId: Array,    //删除矢量
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
                modifyIdClone: []
            }
        },
        watch: {
            modifyId: {
                handler(nval) {
                    if(!nval) {
                        return false;
                    }
                    this.modifyIdClone = [...this.modifyId];
                    this.getModifyFeature();
                },
                deep: true
            },
            newId(nval) {
                if(!nval) {
                    return false;
                }
                this.getMap().then((map) => {
                    this.addPoint(map);
                })
            },
            deleteId: {
                handler(nval) {
                    if (!nval || !nval.length) {
                        return false;
                    }
                    this.deletePoints();
                },
                deep: true
            }
        },
        methods: {
            async init() {
                const vm = this;
                vm.initData();
                let mapObject = await vm.getMap();
                this.viewProjection = mapObject.getView().getProjection().getCode();
                vm.promise = new Promise(function (resolve, reject) {
                    vm.resolve = resolve;
                })
                vm.createLayer(mapObject);
            },
            initData() {
                this.promise = null;
                this.resolve = null;
                this.layer = null;
                this.source = null;
                this.viewProjection = '';
                this.draw = null;
                this.snap = null;
                this.modify = null;
                this.featuresCollection = new Collection();
            },
            createLayer(mapObject) {
                this.source = new VectorSource({
                    strategy: loadingstrategy.bbox
                });
                this.layer = new VectorLayer({
                    source: this.source,
                    zIndex: this.zIndex
                });
                this.layer.set("drawLayer", true);
                mapObject.addLayer(this.layer);
                this.resolve(this.layer);

                this.sourceAddEvent = this.source.on('addfeature',()=>{
                    this.getModifyFeature();
                })

                this.addModifyInteractions(mapObject);

                this.snap = new Snap({source: this.source});
                mapObject.addInteraction(this.snap);
            },
            getLayer() {
                return this.promise;
            },
            createCornerLine(radius) {
                let pixelRatio = DEVICE_PIXEL_RATIO;
                let canvas = document.createElement('canvas');
                let vectorContext = toContext(canvas.getContext('2d'),
                    {size: [2 * radius / pixelRatio, 2 * radius / pixelRatio], pixelRatio: pixelRatio});
                vectorContext.setStyle(new Style({
                    fill: new Fill({color: 'blue'}),
                    stroke: new Stroke({width: 4 / pixelRatio, color: this.modifyColor})
                }));
                const LENGTH = 5 / pixelRatio;
                let w = 2 * radius / pixelRatio;
                let cornerLines = [[[0, 0], [LENGTH, 0]],
                    [[w - LENGTH, 0], [w, 0]],
                    [[w, 0], [w, LENGTH]],
                    [[w, w - LENGTH], [w, w]],
                    [[w, w], [w - LENGTH, w]],
                    [[LENGTH, w], [0, w]],
                    [[0, w], [0, w - LENGTH]],
                    [[0, LENGTH], [0, 0]]
                ];

                cornerLines.forEach(pixel => {
                    let line = new LineString(pixel);
                    vectorContext.drawGeometry(line);
                })
                return canvas;
            },
            getModifyFeature() {    //通过 modifyId 获得featuresCollection
                this.featuresCollection.clear();
                if(!this.modifyIdClone||!this.modifyIdClone.length) {
                    return false;
                }
                const vm = this;
                vm.modifyIdClone.forEach((id)=>{
                    let feature = vm.source.getFeatureById(id);
                    if(feature) {
                        vm.featuresCollection.push(feature);
                    }
                })
            },
            addId(id) {
                this.modifyIdClone.push(id);
                this.getModifyFeature();
                this.$emit('update:modifyId', this.modifyIdClone);
            },
            addModifyInteractions(map) {
                const vm = this;
                vm.modify = new Modify({
                    features: vm.featuresCollection,
                    style: function (f) {
                        let r = vm.pixelTolerance;
                        let canvas = vm.createCornerLine(r);
                        return new Style({
                            image: new Icon({
                                anchor: [0.5, 0.5],
                                img: canvas,
                                imgSize: [canvas.width, canvas.height]
                            })
                        });
                    },
                    pixelTolerance: vm.pixelTolerance
                });
                map.addInteraction(vm.modify);

                function getTarget(evt) {
                    let fs = vm.featuresCollection;
                    let results = [];
                    fs.forEach(f => {
                        if(f.get('id')===evt.target.dragSegments_[0][0].feature.get('id')){
                            const coords = f.getGeometry().getCoordinates();
                            let requestedPosition;
                            if (vm.projection === 'pixel') {
                                requestedPosition = coords;
                            } else {
                                requestedPosition = transformProjection(coords, vm.viewProjection, vm.projection);
                            }

                            results.push({
                                coords: requestedPosition,
                                fId: f.get("id")
                            })
                        }
                    })
                    return results;
                }
                vm.modifyStartEvent = vm.modify.on('modifystart', evt => {
                    vm.$emit("modifystart", getTarget(evt));
                });
                vm.modifyStartEvent = vm.modify.on('modifyend', evt => {
                    vm.$emit("modifyend", getTarget(evt));
                })
            },
            addDrawInteractions(map) {
                this.draw = new Draw({
                    source: this.source,
                    type: 'Point',
                    style: transformStyle(this.icon)
                });
                map.addInteraction(this.draw);

                this.drawEndEvent = this.draw.on('drawend', evt => {
                    let feature = evt.feature;
                    feature.setStyle(transformStyle(this.icon));
                    feature.setId(this.newId);
                    feature.set("id", this.newId);
                    map.removeInteraction(this.draw);

                    if(this.isAddModify){   //添加即可编辑
                        this.addId(this.newId);
                    }

                    let requestedPosition;
                    if (this.projection === 'pixel') {
                        requestedPosition = feature.getGeometry().getCoordinates();
                    } else {
                        requestedPosition = transformProjection(feature.getGeometry().getCoordinates(),
                            map.getView().getProjection(), this.projection);
                    }
                    this.$emit("drawend", [{
                        coords: requestedPosition,
                        fId: feature.get("id")
                    }])
                })
            },
            addPoint(map) {
                if (this.isSingle) {
                    this.source.clear();
                }
                if (this.draw) {
                    map.removeInteraction(this.draw);
                }

                //map.removeInteraction(this.snap);

                this.addDrawInteractions(map);
            },
            deletePoints() {
                let fs = this.source.getFeatures();
                fs.forEach((f) => {
                    let id = f.get("id");
                    if (this.deleteId.indexOf(id) != -1) {
                        this.source.removeFeature(f);
                    }
                })
            },
            locateFeature(data) {    //重新定位feature
                if(!data.id||!data.coords) {
                    console.error('ol-draw-points 重新定位矢量必须 id 和 coords');
                    return false;
                }
                let fs = this.source.getFeatures();
                fs.forEach((f) => {
                    let id = f.get("id");
                    if (id === data.id) {
                        let coords = transformProjection(data.coords, this.projection, this.viewProjection);
                        f.getGeometry().setCoordinates(coords);
                    }
                })
            }
        },
        created() {
            this.init();
        },
        async beforeDestroy() {
            const vm = this;
            let map = await vm.getMap();
            let source = vm.layer.getSource();
            source.getFeatures().forEach(function (f) {
                f.setStyle(null);
            })
            source.clear();
            unByKey(this.sourceAddEvent);
            map.removeLayer(vm.layer);

            if (vm.draw) {
                unByKey(vm.drawEndEvent);
                map.removeInteraction(vm.draw);
            }
            unByKey(vm.modifyStartEvent);
            unByKey(vm.modifyEndEvent);
            map.removeInteraction(vm.snap)
            map.removeInteraction(vm.modify);
        }
    }
</script>