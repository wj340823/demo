<template>
    <div class="vueol-plot" style="display: none;">
        <slot :selectedFeature="selectedFeature">
            <template v-if="!noEdit">
                <ol-overlay class="editLay" :position="selectedFeature.layPosition" :projection="viewProjection"
                            :offset="layOffset" v-if="selectedFeature.layPosition.length==2">
                    <edit-overlay :type="selectedFeature.category" :data="selectedFeature.data"
                                  @change-stroke="refreshStroke"
                                  @change-line="refreshLine" @change-width="refreshWidth"
                                  @change-fill="refreshFill" @delete="deleteFeature"/>
                </ol-overlay>
            </template>
        </slot>
    </div>
</template>

<script>
    import {Vector as VectorLayer} from 'ol/layer';
    import {Vector as VectorSource} from 'ol/source';
    import Feature from 'ol/Feature';
    import {Point, LineString, Polygon} from 'ol/geom';
    import {Icon} from 'ol/style';
    import {unByKey} from 'ol/Observable';

    import {createStyle, createOverlay,
        isDefined} from "../../util/helpers";
    import {OlOverlay} from "../overlay";

    import Bus from '../../util/bus';
    import * as P from '../../plugins/plot/gispace';
    import '../../plugins/plot/p-ol3.css';
    import editOverlay from '../../plugins/plot/overlay/editOverlay.vue';

    export default {
        name: "ol-plot",
        inject: ['getMap'],
        props: {
            type: {
                type: String,
                required: true,
                default: "MARKER"
            },
            olStyle: {   //图标样式
                type: Object,
                default: function () {
                    return {
                        fill: {
                            color: [32, 88, 165, 0.4]
                        },
                        stroke: {
                            color: '#2058A5',
                            width: 3
                        },
                        image: {
                            circle: {
                                radius: 7,
                                fill: {
                                    color: "#0099ff"
                                },
                                stroke: {
                                    color: "#1F497D",
                                    width: 1
                                }
                            }
                        }
                    }
                }
            },
            noEdit: {
                type: Boolean,
                default: false
            },
            isSingle: {   //是否每次只保留一个矢量
                type: Boolean,
                default: false
            },
            zIndex: {
                type: Number,
                default: 0
            },
            projection: {
                type: String,
                default: 'EPSG:4326'
            },
            hasFeatures: {
                type: Array,
                default() {
                    return [];
                }
            }
        },
        components: {
            OlOverlay,
            editOverlay
        },
        data() {
            return {
                viewProjection: "EPSG:3857",
                selectedFeature: {
                    category: "",
                    layPosition: [],   //对应的编辑弹框的位置坐标
                    data: {}    //样式数据
                },
                layOffset: [0, 20]
            }
        },
        watch: {
            type(nval) {
                if (!nval) {
                    return false;
                }
                this.getMap().then((map) => {
                    this.addPlot(map);
                })
            },
            hasFeatures() {
                //清除地图数据
                this.plotEdit.deactivate();
                this.source.clear();
                this.plotDraw.deactivate(); //取消绘制
                this.sketch = true;

                //清空选中信息
                this.selectedFeature = {
                    category: "",
                    layPosition: [],
                    data: {}
                };

                this.getMap().then((map) => {
                    this.loadFeatures(map);
                })
            },
            noEdit(nval) {
                if (nval) {
                    this.plotEdit.deactivate();
                }
            }
        },
        methods: {
            init() {
                this.initData();  //变量初始化

                this.getMap().then((map) => {
                    this.map = map;
                    this.viewProjection = map.getView().getProjection().getCode();
                    this.createLayer(map);

                    //加载已有的点位
                    if (this.hasFeatures.length) {
                        this.loadFeatures(map);
                    }

                    this.plotDraw = new P.PlotDraw(map);  // 初始化标绘绘制工具，添加绘制结束事件响应
                    this.plotDrawEvent = this.plotDraw.on(P.Event.PlotDrawEvent.DRAW_END, this.onDrawEnd);

                    this.plotEdit = new P.PlotEdit(map);  // 初始化标绘编辑工具
                    this.plotEditMoveEvent = this.plotEdit.on(P.Event.PlotEditEvent.EDIT_MOVE, this.onEditMove);
                    this.plotEditEndEvent = this.plotEdit.on(P.Event.PlotEditEvent.EDIT_END, this.onEditEnd);

                    //开始标绘
                    this.addPlot(map);
                    this.listenEvent(map);
                })
            },

            /**
             　　*  @description: 地图组件里的ol上的对象不需要更新视图以及追踪变化，所以不必作为data选项
             　　*  @author xrx
             　　*  @date 2019/4/23 16:19
             　　*/
            initData() {
                this.map = null;
                this.layer = null;   //图层对象
                this.source = null;  //数据源对象

                /**
                 * 帮助提示框对象（The help tooltip element.）
                 * @type {Element}
                 */
                this.helpTooltipElement = null;
                /**
                 * 帮助提示框内容
                 * @type {String}
                 */
                this.helpTooltipHtml = "";
                /**
                 *帮助提示框显示的信息（Overlay to show the help messages.）
                 * @type {ol.Overlay}
                 */
                this.helpTooltip = null;
            },
            createLayer(map) {
                const vm = this;
                vm.source = new VectorSource();
                vm.layer = new VectorLayer({
                    source: vm.source,
                    zIndex: vm.zIndex
                });
                vm.layer.set("plotLayer", true);
                map.addLayer(this.layer);
            },

            /**
             * 创建一个新的帮助提示框（tooltip）
             */
            createHelpTooltip(map, name) {
                let helpTooltipElement = this.helpTooltipElement;
                let helpTooltip = this.helpTooltip;

                if (helpTooltipElement) {
                    helpTooltipElement.parentNode.removeChild(helpTooltipElement);
                }

                helpTooltipElement = document.createElement('div');
                helpTooltipElement.className = 'tooltip hidden';
                helpTooltip = createOverlay(helpTooltipElement, undefined, 'helpTooltip', false);
                helpTooltip.set("name", name);
                helpTooltip.setOffset([15, 30]);

                map.addOverlay(helpTooltip);

                this.helpTooltipElement = helpTooltipElement;
                this.helpTooltip = helpTooltip;
            },

            /**
             *  @description: 鼠标移出地图
             *  @author xrx
             *  @date 2019/4/23 17:20
             */
            outEvent() {
                const vm = this;
                if (vm.helpTooltipElement.className.indexOf("hidden") == -1) {
                    vm.helpTooltipElement.className += " hidden";
                }
            },

            /**
             *  @description: 右键取消绘制
             *  @author xrx
             *  @date 2019/4/23 17:28
             */
            disableContxet(e) {
                this.plotDraw.deactivate(); //取消绘制
                this.sketch = true;

                this.$emit("drawend", {
                    feature: ""
                });
                e.returnValue = false;
                return false; //禁用右键菜单
            },

            /**
             *  @description: 地图悬浮事件
             *  @author xrx
             *  @date 2019/4/23 18:21
             */
            listenerMove(evt) {
                const vm = this;
                if (evt.dragging) {
                    return;
                }
                vm.movePos = evt.coordinate;

                //判断是否在绘制设置相应的帮助提示信息
                if (vm.sketch) {
                    let classArr = vm.helpTooltipElement.className.split(" ");
                    const no = classArr.indexOf("hidden");
                    if (no == -1) {
                        vm.helpTooltipElement.className += " hidden";
                    }
                } else if (vm.type) {
                    vm.helpTooltipElement.innerHTML = vm.helpTooltipHtml; //将提示信息设置到对话框中显示
                    vm.helpTooltip.setPosition(evt.coordinate); //设置帮助提示框的位置
                    let classArr = vm.helpTooltipElement.className.split(" ");
                    const no = classArr.indexOf("hidden");
                    if (no != -1) {
                        classArr.splice(no, 1);
                        vm.helpTooltipElement.className = classArr.join(" ");
                    }
                }
            },

            /**
             *  @description: 根据小类获取大类类别
             *  @author xrx
             *  @date 2019/5/02 16:12
             */
            getPlotCategory(type) {
                let type2 = "";
                for (let key in P.PlotTypes) {
                    if (P.PlotTypes[key] == type) {
                        type2 = key;
                    }
                }
                let data = P.PlotCategory;
                for (let key in data) {
                    const value = data[key];
                    const len = value.length;
                    for (let i = 0; i < len; i++) {
                        let item = value[i];
                        if (item.value == type2) {
                            return key;
                        }
                    }
                }

                return "";
            },

            /**
             *  @description: 计算编辑弹框位置
             *  @author xrx
             *  @date 2019/5/02 19:27
             */
            getLayPos(feature) {
                const extent = feature.getGeometry().getExtent();
                const pos = [(extent[0] + extent[2]) / 2, extent[1]];
                return pos;
            },

            /**
             *  @description: 把数组颜色转成rgb(a)
             *  @author xrx
             *  @date 2019/5/05 14:02
             */
            transfromColor(color) {
                if (color instanceof Array) {
                    if (color.length == 3) {
                        return "rgb(" + color.join(",") + ")";
                    } else if (color.length == 4) {
                        return "rgba(" + color.join(",") + ")";
                    }
                }

                return color;
            },

            /**
             *  @description: 设置当前编辑的矢量对象的信息数据，以赋值给 selectedFeature 供弹框使用
             *  @param feature: 矢量对象
             *  @return result: Object对象；属性layPosition：弹框位置坐标；属性category：矢量对象所属类别（point，line，face，arrow）
             属性data：Object对象，点对象不包含属性；线对象包含strokeColor、width、lineStyle；
             面对象除此之外还包含fillColor属性
             *  @author xrx
             *  @date 2019/5/6 10:51
             */
            setFeatureInfo(feature) {
                let result = {
                    layPosition: this.getLayPos(feature),
                    category: this.getPlotCategory(feature.getGeometry().type),
                    data: {}
                }
                let style = feature.getStyle();
                let strokeColor, width, fillColor;
                if (style.getStroke()) {
                    let stroke = style.getStroke();
                    strokeColor = stroke.getColor();
                    width = stroke.getWidth();
                    result.data.strokeColor = this.transfromColor(strokeColor);
                    result.data.width = width;

                    if (stroke.getLineDash()) {
                        result.data.lineStyle = "dashed";
                    } else {
                        result.data.lineStyle = "solid";
                    }
                }
                if (style.getFill()) {
                    fillColor = style.getFill().getColor();
                    result.data.fillColor = this.transfromColor(fillColor);
                }
                return result;
            },

            /**
             *  @description: 地图点击事件
             *  @author xrx
             *  @date 2019/4/23 17:57
             */
            listenerClick(e) {
                const vm = this;
                // set sketch
                vm.sketch = true;
                vm.helpTooltipElement.className = 'tooltip hidden';

                if (vm.plotDraw.isDrawing()) {
                    return;
                }

                let feature;
                if (isDefined(e.feature)) {
                    //二维转的三维地图点击
                    feature = e.feature;
                } else {
                    //如果事件不是发生在openlayers画布上（这里主要是考虑二三维融合的情况），则退出事件回调
                    if (e.originalEvent.srcElement.className == "ol-cesium") {
                        return false;
                    }
                    feature = vm.map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
                        return feature;
                    });
                }

                if (feature && feature.getGeometry().isPlot && feature.getGeometry().isPlot()) {
                    if (vm.noEdit) { //不编辑
                        return false;
                    }
                    // 开始编辑
                    vm.plotEdit.activate(feature);
                    vm.selectedFeature = vm.setFeatureInfo(feature);
                } else {
                    // 结束编辑
                    vm.plotEdit.deactivate();

                    //清空选中信息
                    vm.selectedFeature = {
                        category: "",
                        layPosition: [],
                        data: {}
                    };
                }
            },
            listenEvent(map) {
                const vm = this;
                const mapId = map.getTarget().id || "default";
                Bus.$on(mapId + ".singleclick", vm.listenerClick);
                Bus.$on(mapId + ".pointermove", vm.listenerMove);

                //鼠标移出地图
                map.getViewport().addEventListener("mouseout", vm.outEvent);

                //鼠标右键
                map.getViewport().addEventListener("contextmenu", vm.disableContxet);
            },

            /**
             *  @description: 结束编辑，开始绘制
             *  @param type: 标绘类型 {String}
             *  @author xrx
             *  @date 2019/4/23 17:44
             */
            activate(type) {
                this.plotEdit.deactivate();
                this.selectedFeature = {
                    category: "",
                    layPosition: [],
                    data: {}
                };
                this.plotDraw.activate(type, {style: createStyle(this.olStyle)});

                // set sketch
                this.sketch = null; //激活绘制之后，开始绘制之前，显示提示语
            },
            addPlot(map) {
                let shape = this.type;
                if (shape) {
                    if (shape == "MARKER") {
                        this.helpTooltipHtml = "可左键点击想要标记的位置，右键退出";
                    } else if (shape == "FREEHAND_LINE" || shape == "FREEHAND_POLYGON") {
                        this.helpTooltipHtml = "点击左键开始绘制，再次点击结束绘制，右键退出";
                    } else if (shape == "CURVE" || shape == "POLYLINE" || shape == "CLOSED_CURVE" || shape == "POLYGON"
                        || shape == "ATTACK_ARROW" || shape == "TAILED_ATTACK_ARROW" || shape == "SQUAD_COMBAT"
                        || shape == "TAILED_SQUAD_COMBAT") {
                        this.helpTooltipHtml = "点击左键开始绘制，双击结束绘制，右键退出";
                    } else {
                        this.helpTooltipHtml = "点击左键开始绘制，右键退出";
                    }

                    if(this.isSingle){
                        this.source.clear();
                    }
                    this.activate(P.PlotTypes[shape]);
                }

                //激活绘制时，地图上显示帮助提示信息
                this.createHelpTooltip(map, "plot"); //创建帮助提示框
                if (!shape) {
                    this.helpTooltipElement.className = "tooltip hidden";
                }
            },

            /**
             *  @description: 获取矢量的地理坐标以及中心坐标点
             *  @param  feature：矢量对象
             *  @return (Array)：requestedPosition：矢量的地理坐标；centerPoint：矢量的中心坐标点
             * @author xrx
             *  @date 2019/5/6 10:21
             */
            getCoordData(feature) {
                let map = this.map;
                let geo = feature.getGeometry();
                if (this.projection != 'pixel') {
                    geo = geo.clone().transform(map.getView().getProjection(), this.projection);
                }
                let requestedPosition = geo.getCoordinates(), centerPoint;
                if (geo instanceof Point) {
                    centerPoint = requestedPosition;
                } else if (geo instanceof LineString) {
                    centerPoint = geo.getCoordinateAt(0.5);
                } else if (geo instanceof Polygon) {
                    let coord = geo.getInteriorPoint().getCoordinates();
                    centerPoint = [coord[0], coord[1]];
                }
                return [requestedPosition, centerPoint];
            },

            /**
             *  @description: 绘制结束回调函数
             *  @author xrx
             *  @date 2019/4/23 16:55
             */
            onDrawEnd(event) {
                let feature = event.feature;
                let style = createStyle(this.olStyle);
                feature.setStyle(style);

                //二维转三维 贴地
                feature.getGeometry().set("altitudeMode", "clampToGround");

                this.source.addFeature(feature);

                if (!this.noEdit) {
                    setTimeout(() => {
                        // 开始编辑
                        this.plotEdit.activate(feature);
                        this.selectedFeature = this.setFeatureInfo(feature);
                    }, 500)
                }

                //绘制结束
                let [coord, center] = this.getCoordData(feature);
                this.$emit("drawend", {
                    dataStore: {
                        type: feature.getGeometry().type,   //标绘类型
                        points: feature.getGeometry().getPoints(),   //标绘特有的坐标点数组
                    },
                    feature,
                    coord,   //地理坐标
                    center    //中心点坐标
                });
            },
            onEditMove(event) {
                let feature = event.feature;
                let [coord, center] = this.getCoordData(feature);

                //编辑弹框位置
                this.selectedFeature.layPosition = this.getLayPos(feature);

                //编辑中
                this.$emit("editmove", {
                    dataStore: {
                        type: feature.getGeometry().type,
                        points: feature.getGeometry().getPoints()
                    },
                    feature,
                    coord,
                    center
                });
            },
            onEditEnd(event) {
                let feature = event.feature;
                let [coord, center] = this.getCoordData(feature);

                //编辑中
                this.$emit("editend", {
                    dataStore: {
                        type: feature.getGeometry().type,
                        points: feature.getGeometry().getPoints()
                    },
                    feature,
                    coord,
                    center
                });
            },

            /**
             *  @description: 更新矢量样式
             *  @param 弹框中事件传值
             *  @author xrx
             *  @date 2019/5/6 10:19
             */
            refreshStroke(e) {
                const feature = this.plotEdit.activePlot;
                let style = feature.getStyle();
                if (style.getStroke()) {
                    style.getStroke().setColor(e);
                }
                feature.changed();
                this.source.changed();
            },
            refreshLine(e) {
                const feature = this.plotEdit.activePlot;
                let stroke = feature.getStyle().getStroke();
                if (!stroke) {
                    return;
                }
                if (e == "solid") {
                    if (stroke.getLineDash()) {
                        stroke.setLineDash(undefined);
                    }
                } else {
                    stroke.setLineDash([4, 4]);
                }
                feature.changed();
                this.source.changed();
            },
            refreshWidth(e) {
                const feature = this.plotEdit.activePlot;
                let stroke = feature.getStyle().getStroke();
                if (stroke) {
                    stroke.setWidth(e);
                }
                feature.changed();
                this.source.changed();
            },
            refreshFill(e) {
                const feature = this.plotEdit.activePlot;
                let style = feature.getStyle();
                if (style.getFill()) {
                    style.getFill().setColor(e);
                }
                feature.changed();
                this.source.changed();
            },

            /**
             *  @description: 删除矢量
             *  @author xrx
             *  @date 2019/5/6 10:20
             */
            deleteFeature() {
                const feature = this.plotEdit.activePlot;
                this.plotEdit.deactivate();
                this.selectedFeature.layPosition = [];
                this.selectedFeature.category = "";
                this.selectedFeature.data = {};

                this.$emit("delete", {
                    feature
                })
                this.source.removeFeature(feature);
                this.source.changed();
            },

            /**
             *  @description: 获取矢量对象的样式数据
             *  @param  feature：矢量对象
             *  @return 重新组装的style对象
             *  @author xrx
             *  @date 2019/5/6 11:41
             */
            getStyleInfo(feature) {
                let style = feature.getStyle();

                //点对象
                let pointStyle;
                if (style.getImage()) {
                    let obj = style.getImage();
                    if (obj instanceof Icon) {
                        let anchor = obj.getAnchor(),
                            size = obj.getSize();
                        pointStyle = {
                            image: {
                                icon: {
                                    anchor: [anchor[0] / size[0], anchor[1] / size[1]],
                                    src: obj.getSrc()
                                }
                            }
                        }
                        if (obj.getColor()) {
                            pointStyle.image.icon.color = obj.getColor();
                        }
                    } else {
                        pointStyle = {
                            image: {
                                circle: {
                                    radius: obj.getRadius()
                                }
                            }
                        }
                        if (obj.getFill()) {
                            pointStyle.image.circle.fill = {color: obj.getFill().getColor()};
                        }
                        if (obj.getStroke()) {
                            let stroke = obj.getStroke();
                            pointStyle.image.circle.stroke = {};
                            if (stroke.getColor()) {
                                pointStyle.image.circle.stroke.color = stroke.getColor();
                            }
                            if (stroke.getWidth()) {
                                pointStyle.image.circle.stroke.width = stroke.getWidth();
                            }
                        }
                    }
                }

                let fStyle = {};
                if (style.getStroke()) {
                    let stroke = style.getStroke();
                    fStyle.stroke = {
                        width: stroke.getWidth(),
                        color: stroke.getColor()
                    }

                    if (stroke.getLineDash()) {
                        fStyle.stroke.lineDash = stroke.getLineDash();
                    }
                }
                if (style.getFill()) {
                    fStyle.fill = {color: style.getFill().getColor()};
                }

                return Object.assign(fStyle, pointStyle);
            },

            /**
             *  @description: 获取标绘图层信息数据
             *  @return result(Array)
             *  @author xrx
             *  @date 2019/5/6 10:49
             */
            getLayerData() {
                let result = [];
                let fs = this.source.getFeatures();
                fs.forEach(f => {
                    let [coord, center] = this.getCoordData(f);
                    result.push({
                        dataStore: {
                            type: f.getGeometry().type,
                            points: f.getGeometry().getPoints(),
                            style: this.getStyleInfo(f)
                        },
                        coord,
                        center
                    });
                })
                return result;
            },

            /**
             *  @description: 加载已有矢量数据
             *  @author xrx
             *  @date 2019/5/6 10:20
             */
            loadFeatures(map) {
                let fs = [];
                if (this.hasFeatures.length) {
                    this.hasFeatures.forEach(item => {
                        let temp = item.dataStore;
                        let sector = P.PlotFactory.createPlot(temp.type, temp.points);
                        let plotFeature = new Feature(sector);
                        plotFeature.setStyle(createStyle(temp.style));
                        this.source.addFeature(plotFeature);

                        let [coord, center] = this.getCoordData(plotFeature);
                        fs.push({
                            dataStore: {
                                type: plotFeature.getGeometry().type,
                                points: plotFeature.getGeometry().getPoints()
                            },
                            coord,
                            center
                        });
                    })

                    //自适应屏幕
                    let extent = this.source.getExtent();
                    map.getView().fit(extent);
                }

                this.$emit("loadend", fs);   //加载已有feature完成
            }
        },
        mounted() {
            this.init();
        },
        beforeDestroy() {
            const vm = this;
            unByKey(this.plotDrawEvent);
            unByKey(this.plotEditMoveEvent);
            unByKey(this.plotEditEndEvent);
            this.plotEdit.deactivate();
            this.plotDraw.deactivate(); //取消绘制
            vm.getMap().then((map) => {
                vm.source.clear();
                map.removeLayer(vm.layer);

                map.getViewport().removeEventListener("mouseout", vm.outEvent);
                map.getViewport().removeEventListener("contextmenu", vm.disableContxet);
                map.removeOverlay(this.helpTooltip);

                const mapId = map.getTarget().id || "default";
                Bus.$off(mapId + ".pointermove", vm.listenerMove);
                Bus.$off(mapId + ".singleclick", vm.listenerClick);
            })
        }
    }
</script>

<style>
    .editLay.vueol-overlay {
        position: relative;
        width: auto;
        background: transparent;
        box-shadow: none;
        transform: none;
    }
</style>
