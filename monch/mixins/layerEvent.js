import {coordinateTransform, removeOverlay, setLabelEvent, transformStyle} from "../util/helpers";
import Bus from "../util/bus";

export default {
    props: {
        nameOverLabel: {    //鼠标悬浮显示name字段 默认不显示
            type: Boolean,
            default: false
        },
        blankClear: {    //点击空白处是否设置selectFeature=null
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            layerName: 'vectorLayer',
            selectFeature: null,   //选中的矢量的属性  用于向外传递参数
            moveFeature: null,   //悬浮的矢量的属性  用于向外传递参数
            curClickFeature: null,  //点击的矢量
            curMoveFeature: null,  //悬浮的矢量
            curMoveNormalStyle: null,  //悬浮的矢量样式
            curClickStyle: null,
            moveLabel: null    //悬浮弹框
        }
    },
    computed: {
        moveOlStyle() {
            return this.moveStyle ? transformStyle(this.moveStyle) : null;
        },
        clickOlStyle() {
            return this.clickStyle ? transformStyle(this.clickStyle) : null;
        }
    },
    methods: {
        getOutCoord(coords) {
            let outCoord = coords,
                outProj = "";
            const projection = this.map.getView().getProjection().getCode();
            if (projection !== "pixel" && projection !== "xkcd-image") { //确保输出坐标的坐标系为4326
                outCoord = coordinateTransform(coords, projection, "EPSG:4326");
                outProj = "EPSG:4326";
            } else {
                outProj = projection;
            }
            return {
                coords: outCoord,
                projection: outProj
            }
        },
        createStyleFn(feature, resolution) {
            const vm = this;
            let style = null;
            if (feature === vm.curClickFeature) {
                style = vm.clickOlStyle;
            } else if (feature === vm.curMoveFeature) {
                style = vm.moveOlStyle;
            }
            if (style) {
                if (typeof style === 'function') {
                    if (style(feature, resolution)) {
                        return style(feature, resolution);
                    }
                }
                return style;
            }
            if(vm.options&&vm.options.style||vm.layerStyle) {
                let normalStyle = null;
                if(vm.layerStyle) {
                    normalStyle = transformStyle(vm.layerStyle);
                }else {
                    normalStyle = transformStyle(vm.options.style);
                }
                if(typeof normalStyle === 'function') {
                    return normalStyle(feature, resolution);
                }
                return normalStyle;
            }
        },
        showNameOverlay(map, feature, resultData) {
            //悬浮时，先移除其它的弹出框
            removeOverlay(map, null, "overLabel");

            let data = {
                lat: resultData.lat,
                lon: resultData.lon,
                projection: resultData.projection,
                label: {
                    classNm: "featureOver",
                    message: resultData.name,
                    stopEvent: false
                }
            }
            let label = setLabelEvent(feature, map, data);
            if (label) {
                label.set("overLabel", "true"); //与其他的弹出框区分
            }
            return label;
        },
        //矢量图层 悬浮样式
        listenerMove(data) {
            const vm = this;
            const feature = data.feature;

            //恢复前次标记的feature的样式
            if (vm.curMoveFeature && vm.curMoveFeature !== feature && vm.curMoveFeature !== vm.curClickFeature) {
                vm.curMoveFeature.setStyle(vm.curMoveNormalStyle);
                vm.curMoveFeature = null;
                vm.moveFeature = null;
            }

            //悬浮其他图层
            if (data.olLayer !== vm.layer) {
                return false;
            }

            /* 存储 feature 的正常样式，便于复原
            ** 排除鼠标悬浮事件在同一个 feature 中多次触发把悬浮样式赋值给 vm.curMoveNormalStyle 的情况
            */
            if (!vm.curMoveFeature || vm.curMoveFeature !== feature) {
                const style = feature.getStyle();
                vm.curMoveNormalStyle = style ? style : undefined;
            }

            //为feature设置悬浮样式
            const moveStyle = vm.moveStyle||feature.get('featureInfo').data.moveStyle;
            if (moveStyle && feature !== vm.curMoveFeature && feature !== vm.curClickFeature) {
                let isNull = false;   //样式函数返回的是否为空
                if(transformStyle(moveStyle) instanceof Function) {
                    let fn = transformStyle(moveStyle);
                    if(!fn(feature)){
                        isNull = true;
                    }
                }
                if(!isNull) {
                    feature.setStyle(transformStyle(moveStyle));
                    vm.curMoveFeature = feature;
                }
            }

            //名称弹框
            let name = feature.get('featureInfo').data.name;
            if (name && this.nameOverLabel) {
                vm.moveLabel = vm.showNameOverlay(vm.map, data.feature, {
                    lat: data.coord[1],
                    lon: data.coord[0],
                    projection: this.map.getView().getProjection().getCode(),
                    name
                });
            }

            vm.moveFeature = {
                ...vm.getOutCoord(data.coord),
                ...feature.getProperties()
            };

            vm.$emit("pointermove", vm.moveFeature);
        },
        listenerMove_blank() {
            const vm = this;
            if (vm.curMoveFeature && vm.curMoveFeature != vm.curClickFeature) {
                //恢复前次标记的feature的样式
                vm.curMoveFeature.setStyle(vm.curMoveNormalStyle);
            }
            vm.curMoveFeature = null;
            vm.moveFeature = null;

            if (vm.moveLabel) {   //默认name悬浮弹框
                vm.map.removeOverlay(vm.moveLabel);
            }
        },
        //矢量 点击样式
        listenerClick(data) {
            const vm = this;
            const feature = data.feature;

            //恢复前次标记的feature的样式
            if (vm.curClickFeature && vm.curClickFeature !== feature) {
                vm.curClickFeature.setStyle(vm.curClickStyle);
                vm.curClickFeature = null;
                vm.selectFeature = null;
            }

            if (data.olLayer !== vm.layer) {
                return false;
            }

            const clickStyle = vm.clickStyle||feature.get('featureInfo').data.clickStyle;

            if (clickStyle && vm.curClickFeature !== feature) {
                let isNull = false;   //样式函数返回的是否为空
                if(transformStyle(clickStyle) instanceof Function) {
                    let fn = transformStyle(clickStyle);
                    if(!fn(feature)){
                        isNull = true;
                    }
                }
                if(!isNull) {
                    vm.curClickStyle = vm.curMoveNormalStyle;
                    feature.setStyle(transformStyle(clickStyle));
                    vm.curClickFeature = feature;
                }
            }

            vm.selectFeature = {
                ...vm.getOutCoord(data.coord),
                ...feature.getProperties()
            };

            vm.$emit("singleclick", vm.selectFeature);
        },
        listenerClick_blank() {
            const vm = this;
            if (vm.blankClear) {
                if (vm.curClickFeature) {
                    //恢复前次标记的feature的样式
                    vm.curClickFeature.setStyle(vm.curClickStyle);
                    vm.curClickFeature = null;
                }

                vm.selectFeature = null;
            }
        },
        handleEvent(map) {
            const vm = this;
            const mapId = map.getTarget().id || "default";
            Bus.$on(`${mapId}.${vm.layerName}.pointermove`, vm.listenerMove)

            //地图空白处悬浮
            Bus.$on(mapId + ".pointermove.blank", vm.listenerMove_blank)

            Bus.$on(`${mapId}.${vm.layerName}.singleclick`, vm.listenerClick)

            //地图空白处 点击
            Bus.$on(mapId + ".singleclick.blank", vm.listenerClick_blank)
        }
    },
    beforeDestroy() {
        let vm = this;
        vm.getMap().then((mapObject) => {
            let source = vm.layer.getSource();
            if (source.clear && source.getFeatures) {
                source.getFeatures().forEach(function (f) {
                    f.setStyle(null);
                })
                source.clear();
            }
            vm.layer.setSource(undefined);
            mapObject.removeLayer(this.layer);

            const mapId = mapObject.getTarget().id || "default";
            Bus.$off(`${mapId}.${vm.layerName}.pointermove`, vm.listenerMove);
            Bus.$off(mapId + ".pointermove.blank", vm.listenerMove_blank)
            Bus.$off(`${mapId}.${vm.layerName}.singleclick`, vm.listenerClick);
            Bus.$off(mapId + ".singleclick.blank", vm.listenerClick_blank);
        });
        vm.selectFeature = null;
        vm.moveFeature = null;
        vm.curClickFeature = null;
        vm.curMoveFeature = null;
        vm.curMoveNormalStyle = null;
    }
}