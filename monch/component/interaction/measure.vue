<template>
    <div class="vueol-measure">
        <template v-for="item in deleteIcons">
            <div class="tooltip-close" :id="item.id">
                <img title="删除" src="../../assets/del.png" @click="delObj(item.id)">
            </div>
        </template>
    </div>
</template>
<script>
    import {Vector as VectorLayer} from 'ol/layer';
    import {Vector as VectorSource} from 'ol/source';
    import {Draw} from 'ol/interaction';
    import {
        LineString,
        Polygon
    } from 'ol/geom';
    import {unByKey} from 'ol/Observable';
    import {getLength, getArea} from "ol/sphere";
    import Overlay from "ol/Overlay";
    import {createFeature, createOverlay, createStyle} from "../../util/helpers";

    import Bus from '../../util/bus';

    export default {
        name: 'ol-measure',
        inject: ['getMap'],
        props: {
            type: {
                type: String,
                required: true,
                default: "LineString"
            },
            triggerNew: [String, Number],   //测量交互再次触发
            zIndex: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                layer: null,
                source: null,
                sketch: null,   //当前绘制的要素
                helpTooltipElement: null,  //帮助提示框对象
                helpTooltip: null,    //帮助提示框显示的信息
                measureTooltipElement: null,   //测量工具提示框对象
                measureTooltip: null,    //测量工具中显示的测量值
                distanceTooltipElement: null,   //距离提示框对象
                distanceTooltip: null,      //距离提示框显示的测量值
                movePos: null,   //鼠标当前位置
                draw: null,   //interaction 对象
                featureNum: 0,
                listenerClick: null,
                listenerChange: null,
                deleteIcons: []   //删除按钮
            }
        },
        watch: {
            type() {
                this.getMap().then((map) => {
                    this.addInteraction(map);
                })
            },
            triggerNew(nval) {
                if(!nval) {
                    return false;
                }
                this.getMap().then((map) => {
                    if(this.draw) {
                        this.draw.setActive(true);
                    }else {
                        this.addInteraction(map);
                    }
                })
            }
        },
        created() {
            this.init();
        },
        methods: {
            init() {
                this.getMap().then((map) => {
                    this.projection = map.getView().getProjection().getCode();
                    this.createLayer(map);
                    this.listenEvent(map);
                    this.addInteraction(map);
                })
            },
            createLayer(map) {
                this.source = new VectorSource(); //图层数据源
                let finishedStyle = createStyle({
                    fill: {
                        color: [142, 77, 209, 0.3]
                    },
                    stroke: {
                        color: '#8e4dd1', //边框颜色
                        width: 2 // 边框宽度
                    }
                });

                this.layer = new VectorLayer({
                    source: this.source,
                    style: finishedStyle,
                    zIndex: this.zIndex
                });
                this.layer.set("measureLayer", true);
                map.addLayer(this.layer);
            },
            createHelpTooltip(map, name) {   //创建一个新的帮助提示框
                if (this.helpTooltipElement) {
                    this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
                }

                this.helpTooltipElement = document.createElement('div');
                this.helpTooltipElement.className = 'tooltip hidden';
                this.helpTooltip = createOverlay(this.helpTooltipElement, undefined, 'helpTooltip', false);
                this.helpTooltip.set("name", name);
                this.helpTooltip.setOffset([15, 30]);

                map.addOverlay(this.helpTooltip);
            },
            createMeasureTooltip(map, name) {    //创建一个新的测量工具提示框
                if (this.measureTooltipElement) {
                    this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement);
                }

                this.measureTooltipElement = document.createElement('div');
                this.measureTooltipElement.className = 'tooltip tooltip-measure';
               // this.measureTooltip = createOverlay(this.measureTooltipElement, undefined, 'helpTooltip', false);
                this.measureTooltip = new Overlay({
                    id: 'helpTooltip',
                    element: this.measureTooltipElement,
                    positioning: 'top-left',
                    insertFirst: false,
                    stopEvent: false
                });

                this.measureTooltip.set("name", name);
                this.measureTooltip.setOffset([15, 30]);

                map.addOverlay(this.measureTooltip);
            },
            createDistanceTooltip(map, name) {   //创建一个新的节点距起点距离的提示框
                this.distanceTooltipElement = document.createElement('div');
                this.distanceTooltipElement.className = 'tooltip tooltip-distance';
               // this.distanceTooltip = createOverlay(this.distanceTooltipElement, undefined, 'distanceNum', false);
                this.distanceTooltip = new Overlay({
                    id: 'distanceNum',
                    element: this.distanceTooltipElement,
                    positioning: 'top-left',
                    insertFirst: true,
                    stopEvent: false
                });
                this.distanceTooltip.set("name", name);
                this.distanceTooltip.setOffset([10, 0]);

                map.addOverlay(this.distanceTooltip);
            },
            createDelTooltip(map, name, position, coords) {    //创建删除提示框
                this.$nextTick(() => {
                    let toolTip = createOverlay(document.getElementById(name), position, name, true);

                    //根据最后一个点和倒数第二点之间的左右位置，来决定删除按钮显示位置
                    let len = coords.length;
                    if (coords[len - 1][0] > coords[len - 2][0]) {
                        toolTip.setOffset([10, 0]);
                    } else {
                        toolTip.setOffset([-30, 0]);
                    }
                    toolTip.set("name", name);

                    map.addOverlay(toolTip);
                });
            },
            formatLength(line, proj) {   //测量长度输出
                const length = Math.round(getLength(line, {projection: proj}) * 100) / 100; //直接得到线的长度
                let output;
                if (length > 100) {
                    output = '<span>' + (Math.round(length / 1000 * 100) / 100) + '</span> ' + 'km'; //换算成KM单位
                } else {
                    output = '<span>' + (Math.round(length * 100) / 100) + '</span> ' + 'm'; //m为单位
                }
                return output; //返回线的长度
            },
            formatArea(polygon, proj) {   //测量面积输出
                const area = getArea(polygon, {projection: proj}); //直接获取多边形的面积
                let output;
                if (area > 10000) {
                    output = '<span>' + (Math.round(area / 1000000 * 100) / 100) + '</span> ' + 'km<sup>2</sup>'; //换算成KM单位
                } else {
                    output = '<span>' + (Math.round(area * 100) / 100) + '</span> ' + 'm<sup>2</sup>'; //m为单位
                }
                return output; //返回多边形的面积
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
                } else {
                    vm.helpTooltipElement.innerHTML = "单击确定起点"; //将提示信息设置到对话框中显示
                    vm.helpTooltip.setPosition(evt.coordinate); //设置帮助提示框的位置
                    let classArr = vm.helpTooltipElement.className.split(" ");
                    const no = classArr.indexOf("hidden");
                    if (no != -1) {
                        classArr.splice(no, 1);
                        vm.helpTooltipElement.className = classArr.join(" ");
                    }
                }
            },
            listenEvent(map) {
                const vm = this;
                const mapId = map.getTarget().id || "default";
                Bus.$on(mapId + ".pointermove", vm.listenerMove);
                map.getViewport().addEventListener("mouseout", vm.outEvent);
            },
            createPointStyle(map, coord, id) {
                let viewProjection = map.getView().getProjection().getCode();
                let data = {
                    coords: coord,
                    style: createStyle({
                        image: {
                            circle: {
                                radius: 4,
                                fill: {
                                    color: 'white'
                                },
                                stroke: {
                                    width: 2,
                                    color: '#005699'
                                }
                            }
                        }
                    })
                };
                let feature = createFeature(data, viewProjection);
                feature.set("id", id);
                this.source.addFeature(feature);
            },
            startDraw(map) {
                const vm = this;
                //绑定交互绘制工具开始绘制的事件
                vm.drawStartEvent = this.draw.on("drawstart", function (evt) {
                    vm.featureNum++;
                    vm.sketch = evt.feature; //绘制的要素

                    //给该feature以及其overlay一个唯一标识，以便于删除
                    const id = "measure" + vm.featureNum;
                    vm.sketch.set("id", id);
                    vm.createMeasureTooltip(map, id); //创建测量工具提示框

                    vm.listenerClick = map.on("click", function (evt) {
                        const coord = vm.sketch.getGeometry().getLastCoordinate();
                        if (vm.type == "LineString") {
                            vm.distanceTooltipElement = null; //置空测量工具提示框对象
                            vm.createDistanceTooltip(map, id);
                            vm.distanceTooltipElement.innerHTML = "起点";
                            vm.distanceTooltip.setPosition(coord);
                        }

                        vm.createPointStyle(map, coord, id);  //节点
                    });

                    //绑定change事件，根据绘制几何类型得到测量长度值或面积值，并将其设置到测量工具提示框中显示
                    vm.listenerChange = vm.sketch.getGeometry().on('change', function (evt) {
                        let geom = evt.target; //绘制几何要素
                        let output = "",
                            resultValue = "";
                        if (geom instanceof Polygon) {
                            resultValue = vm.formatArea(geom, vm.projection);
                            output += "<div>面积：" + resultValue + "</div><div>单击继续绘制，双击结束</div>"; //面积值
                        } else if (geom instanceof LineString) {
                            resultValue = vm.formatLength(geom, vm.projection);
                            output = "<div>总长：" + resultValue + "</div><div>单击继续绘制，双击结束</div>"; //长度值
                        }
                        vm.measureTooltipElement.innerHTML = output; //将测量值设置到测量工具提示框中显示
                        vm.measureTooltip.setPosition(vm.movePos); //设置测量工具提示框的显示位置

                        //添加多线段的中间点的距离信息
                        if (vm.listenerClick) {
                            unByKey(vm.listenerClick);
                        }
                        vm.listenerClick = map.on("click", function (evt) {
                            if (vm.type == "LineString") {
                                // vm.distanceTooltipElement = null; //置空测量工具提示框对象
                                vm.createDistanceTooltip(map, id);
                                vm.distanceTooltipElement.innerHTML = resultValue;
                                vm.distanceTooltip.setPosition(vm.movePos);
                            }

                            vm.createPointStyle(map, vm.movePos, id);
                        });
                    });
                }, this);
            },
            endDraw(map) {
                const vm = this;
                vm.drawEndEvent = vm.draw.on("drawend", function (evt) {
                    //绘制结束，测量提示框的内容变成最后结果
                    let geom = vm.sketch.getGeometry();
                    let output = "",
                        coords, len;
                    if (geom instanceof Polygon) {
                        output += "<div>面积：" + vm.formatArea(geom, vm.projection) + "</div>"; //面积值
                        let tooltipCoord = geom.getInteriorPoint().getCoordinates();
                        coords = geom.getCoordinates()[0]; //坐标
                        len = coords.length;
                        vm.measureTooltip.setPosition(tooltipCoord);
                        vm.measureTooltip.setOffset([0, -7]);
                    } else if (geom instanceof LineString) {
                        coords = geom.getCoordinates(); //坐标
                        len = coords.length;
                        output = "<div>总长：" + vm.formatLength(geom, vm.projection) + "</div>"; //长度值

                        //根据最后一个点和倒数第二点之间的上下位置，来决定测量值显示位置
                        if (coords[len - 1][1] > coords[len - 2][1]) {
                            vm.measureTooltip.setOffset([-5, -40]);
                        } else {
                            vm.measureTooltip.setOffset([-5, 20]);
                        }
                    }
                    vm.measureTooltipElement.innerHTML = output; //将测量值设置到测量工具提示框中显示
                    vm.measureTooltipElement.className = "tooltip tooltip-static"; //设置测量提示框的样式

                    vm.deleteIcons.push({
                        id: vm.sketch.get("id")
                    })
                    vm.createDelTooltip(map, vm.deleteIcons[vm.deleteIcons.length - 1].id, geom.getLastCoordinate(), coords);

                    vm.measureTooltipElement = null; //置空测量工具提示框对象
                    vm.distanceTooltipElement = null; //置空距离提示框对象
                    map.removeOverlay(vm.distanceTooltip);   //删除最后一个距离提示框
                    unByKey(vm.listenerChange);
                    unByKey(vm.listenerClick);

                    setTimeout(()=>{
                        vm.draw.setActive(false);
                        vm.$emit('drawend');
                    })
                }, this);
            },
            addInteraction(map) {
                if (this.draw) {
                    map.removeInteraction(this.draw);
                }
                this.sketch = null; //置空当前绘制的要素对象

                let styles = [];
                let drawStyle = createStyle({ //绘制过程中的样式
                    fill: {
                        color: [142, 77, 209, 0.3]
                    },
                    stroke: {
                        color: [142, 77, 209, 0.7],
                        lineDash: [10, 5],
                        width: 2
                    },
                    image: {
                        circle: {
                            radius: 2,
                            fill: {
                                color: 'white' //填充颜色
                            },
                            stroke: {
                                width: 2,
                                color: '#005699'
                            }
                        }
                    }
                });
                styles.push(drawStyle);
                this.draw = new Draw({
                    source: this.source, //测量绘制层数据源
                    type: this.type, //几何图形类型
                    style: drawStyle
                });
                map.addInteraction(this.draw);

                this.createHelpTooltip(map, "measure"); //创建帮助提示框

                //绑定交互绘制工具开始绘制的事件
                this.startDraw(map);

                //绑定交互绘制工具结束绘制的事件
                this.endDraw(map);
            },
            delObj(id) {
                const vm = this;

                //feature 删除
                let featureArr = vm.source.getFeatures();
                let total = featureArr.length;
                for (let i = total - 1; i >= 0; i--) {
                    if (featureArr[i].get("id") == id) {
                        vm.source.removeFeature(featureArr[i]);
                    }
                }

                vm.getMap().then((map) => {
                    let layArr = map.getOverlays();
                    const len = layArr.getLength();
                    for (let i = len - 1; i >= 0; i--) {
                        if (layArr.item(i).get("name") == id) {
                            layArr.removeAt(i);
                        }
                    }
                })

                //删除按钮元素清除
                /*let no =  vm.deleteIcons.filter((item, no)=>{
                    if(item.id==id){
                        return no;
                    }
                })[0];
                vm.deleteIcons.splice(no, 1);*/
            }
        },
        beforeDestroy() {
            const vm = this;
            vm.getMap().then((map) => {
                this.source.clear();
                map.removeLayer(vm.layer);

                if (vm.draw) {
                    unByKey(this.drawStartEvent);
                    unByKey(this.drawEndEvent);
                    map.removeInteraction(vm.draw);
                }

                let ls = map.getOverlays();
                let total = ls.getLength();
                for (let i = total - 1; i > -1; i--) {
                    if (ls.item(i).get("name").indexOf("measure") != -1) {
                        map.removeOverlay(ls.item(i));
                    }
                }

                map.getViewport().removeEventListener("mouseout", vm.outEvent);

                const mapId = map.getTarget().id || "default";
                Bus.$off(mapId + ".pointermove", vm.listenerMove);
            })
        }
    }
</script>