<template>
    <div>
        <suc-map
            ref="mapObject"
            :options="olMap.map"
            v-bind.sync="olMap.map.view"
            @singleclick-blank="getBlank"
            @singleclick="handleSingleClick"
            @pointermove="largeIcon"
            @pointermove-blank="resetIcon"
        >
            <template>
                <ol-layer
                    :options="layer"
                    v-for="layer in olMap.baseLayer"
                    :key="layer.name"
                />
            </template>
            <template>
                <ol-layer
                    :options="layer"
                    v-for="layer in olMap.baseLayer_other"
                    :key="layer.name"
                />
            </template>
            <template>
                <ol-layer
                    :options="layer"
                    v-for="(layer, index) in olMap.otherLayer"
                    :key="index"
                    v-if="layer.visible"
                />
            </template>
            <template>
                <ol-layer
                    :options="olMap.nextThreeDayLayers"
                    v-if="pagesShow['风暴潮']"
                />
            </template>
            <!--台风路径-->
            <template>
                <ol-mul-path
                    :grids="mapPath.grids"
                    :z-index="18"
                    v-if="mapPath.show"
                ></ol-mul-path>
            </template>
            <template>
                <ol-mul-path
                    :grids="mapPath.forecast"
                    :z-index="18"
                    v-if="mapPath.show"
                ></ol-mul-path>
            </template>
            <template>
                <ol-layer :options="olMap.solidLayers" />
            </template>
            <ol-layer
                :options="sjxLayer"
                class="self-ol-layer"
                v-if="sjxLayer.visible"
            />
            <ol-layer :options="initLayer" class="self-ol-layer"></ol-layer>

            <!-- 行政区域 -->
            <ol-layer :options="xzqyLayer" class="self-ol-layer" />
            <!--网格 浙江省-->
            <!--<ol-layer
                :options="pic"
                v-if="
                    $route.fullPath.match('next-three-day') != null &&
                        regionsForRenderState.show &&
                        regionsForRenderState.type == 3
                "
                class="self-ol-layer"
            ></ol-layer>-->
            <ol-layer
                :options="futureImg"
                class="self-ol-layer"
                v-if="
                    $route.fullPath.match('next-three-day') != null &&
                        regionsForRenderState.show
                "
            ></ol-layer>
            <!--网格其他-->
            <ol-layer
                :options="futureRainLayer"
                class="self-ol-layer"
                v-if="
                    $route.fullPath.match('next-three-day') != null &&
                        regionsForRenderState.show
                "
            />
            <ol-point-collection
                :points="markers"
                render-mode="image"
                @singleclick="openModel"
                :z-index="9"
            ></ol-point-collection>
            <template>
                <ol-overlay
                    v-if="mapPath.selectShow"
                    :position="mapPath.selectedData.coords"
                >
                    <storm-info :dataInfo="mapPath.selectedData"></storm-info>
                </ol-overlay>
            </template>
            <ol-plot
                :type="plot.type"
                :isSingle="plot.isSingle"
                :hasFeatures="plot.hasFeatures"
                :z-index="12"
            />
            <!--报汛流量点位-->
            <ol-markers :z-index="9">
                <ol-marker
                    :options="marker"
                    v-for="(marker, index) in flowPoint"
                    :key="index"
                ></ol-marker>
            </ol-markers>
            <!--洪水预警点位-->
            <ol-markers :z-index="9">
                <ol-marker
                    :options="marker"
                    v-for="(marker, index) in floodPoints"
                    :key="index"
                    @singleclick="openFloods(marker)"
                ></ol-marker>
                <template>
                    <ol-overlay
                        class="marker-overlay flood-vueol-overlay"
                        v-if="flood.layer.visible"
                        :position="[flood.layer.data.lon, flood.layer.data.lat]"
                        category="clickLabel"
                    >
                        <floodWarningOverlay />
                    </ol-overlay>
                </template>
            </ol-markers>
            <!--洪水分析点位-->
            <ol-markers :z-index="9">
                <ol-marker
                    :options="marker"
                    v-for="(marker, index) in flood.analyse.point"
                    :key="index"
                    @singleclick="openFloodAnalyse(marker)"
                ></ol-marker>
                <template>
                    <ol-overlay
                        class="marker-overlay floodAnalyseOverlay"
                        v-if="flood.analyse.show"
                        :position="[
                            flood.analyse.data.lon,
                            flood.analyse.data.lat
                        ]"
                        category="clickLabel"
                        :offset="[-480, 0]"
                    >
                        <floodAnalyseOverlay />
                    </ol-overlay>
                </template>
            </ol-markers>
            <!--预报展示点位-->
            <ol-markers :z-index="9">
                <ol-marker
                    :options="marker"
                    v-for="(marker, index) in forecast.point"
                    :key="index"
                    @singleclick="openForecast(marker)"
                />
                <template>
                    <ol-overlay
                        class="marker-overlay forecastOverlay"
                        v-if="forecast.show"
                        :position="[forecast.data.lon, forecast.data.lat]"
                        :offset="[-415, 0]"
                        category="clickLabel"
                    >
                        <forecastOverlayer />
                    </ol-overlay>
                </template>
            </ol-markers>
            <!--未来三天降雨点位-->
            <ol-markers :z-index="9">
                <ol-marker
                    v-for="(marker, index) in nextThreePoints"
                    :key="index"
                    :options="marker"
                    @singleclick="handleClickMarker(marker)"
                />
            </ol-markers>
            <!-- 未来三天降雨弹窗 -->
            <template>
                <ol-overlay
                    class="marker-overlay forecastOverlay padding-0"
                    v-if="nextThreeState.visible"
                    :position="[
                        nextThreeState.data.lon,
                        nextThreeState.data.lat
                    ]"
                    category="clickLabel"
                    :offset="[-400, 0]"
                >
                    <NextThreeOverlay />
                </ol-overlay>
            </template>
            <!--点位聚焦焦点-->
            <ol-flash
                :coords="flash.coords"
                :loops="flash.loops"
                :duration="flash.duration"
                :radius-range="flash.radiusRange"
                :circle-style="flash.style"
                :z-index="8"
            />
            <ol-markers :z-index="10">
                <ol-marker
                    :options="hoverPoint.options"
                    v-if="hoverPoint.show"
                ></ol-marker>
            </ol-markers>
            <!-- 测量 -->
            <!--  <ol-measure :type="measure.type" :trigger-new="again" @drawend="drawEnd"></ol-measure>-->
            <ol-measure
                type="LineString"
                :z-index="12"
                v-if="!measureDisabled"
            />
            <transition name="fade">
                <ol-overlay
                    :position="[detail.info.lon, detail.info.lat + 0.02]"
                    v-if="detail.show"
                    :offset="[-550, -446]"
                >
                    <mark-info
                        class="detailInfo"
                        @closeModal="closeModal"
                        :markInfo="detail.info"
                        :indexPoint="index"
                    />
                </ol-overlay>
            </transition>
            <!-- 将所有弹框放到 Overlay 中，随地图移动 -->
            <ol-overlay
                :position="dynamicComponentState.position"
                :offset="[-400, 100]"
                v-if="dynamicComponentState.visible"
            >
                <Component
                    :is="dynamicComponentState.name"
                    :prop="dynamicComponentState.data"
                />
            </ol-overlay>
            <transition name="fade">
                <ol-overlay
                    :position="mapState.overlay.position"
                    :offset="mapState.overlay.offset"
                    v-if="mapState.overlay.visible"
                >
                    <Component :is="mapState.overlay.name" />
                </ol-overlay>
            </transition>
            <!-- 地图点位 -->
            <ol-markers :z-index="9">
                <ol-marker
                    v-for="(item, index) in mapState.points"
                    :key="index"
                    :options="item"
                    @singleclick="handleClickCommonMarker(item)"
                />
            </ol-markers>
        </suc-map>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Emit, Watch } from "vue-property-decorator";
    import { MarkInfo, MoveLabel, StormInfo } from "@/components";
    import { State, Getter, Action, Mutation, namespace } from "vuex-class";
    import mapService from "@/utils/mapService";
    import moment from "moment";
    import floodWarningOverlay from "./pages/floodWarning/Overlay.vue";
    import forecastOverlayer from "./pages/forecastDisplay/Overlay.vue";
    import NextThreeOverlay from "./pages/nextThreeDays/Overlay.vue";
    import floodAnalyseOverlay from "./pages/floodAnalysis/Modal.vue";
    // 面雨量排频排位弹窗
    import RainfallRequencyOverlay from "./pages/rainfallFrequency/OverlayCopy.vue";
    // 土壤缺水量弹窗
    import SolidWaterDeficitOverlay from "./pages/solidWaterDeficit/Overlay.vue";
    // 水位排频
    import WaterFrequencyOverlay from "./pages/waterFrequency/Overlay.vue";
    // 未来将水点击网格后的弹窗
    import NextThreeOverlayLayer from "./pages/nextThreeDays/OverlayForLayer.vue";

    const SCALE = 0.7;
    const SolidWaterDeficit = namespace("solidWaterDeficit");
    const MapStore = namespace("mapCommon");
    const storm = namespace("storm");

    @Component({
        components: {
            StormInfo,
            MarkInfo,
            MoveLabel,
            floodWarningOverlay,
            forecastOverlayer,
            floodAnalyseOverlay,
            NextThreeOverlay,
            RainfallRequencyOverlay,
            SolidWaterDeficitOverlay,
            WaterFrequencyOverlay,
            NextThreeOverlayLayer
        }
    })
    export default class mapCon extends Vue {
        @Prop() olMap: any;
        @Prop() sendMarkers: any;
        @Prop() base!: number;
        @Prop() floodPoints: any;
        @Prop() sjxLayer: any;
        @State("point") point: any;
        @State("flowPoint") flowPoint: any;
        @State("netUrl") netUrl: any;
        @State("selectArea") selectAreas: any;
        @State("center") centerPoint: any;
        @State("cloud_pic") cloudUrl: any;
        @State("ld_pic") ldUrl: any;
        @State("jy_pic") jyUrl: any;
        @State("futureImgUrl") futureImgUrl: any;
        @State("solid_pic") solidUrl: any;
        @State("zoom") zoom: any;
        @State("plot") plot!: any;
        @State("flood") flood: any;
        @State("forecast") forecast: any;
        @State("selectDmId") selectDmId!: any;
        @State("alarmResult") alarmResult!: any;
        @State("hoverPoint") hoverPoint!: any;
        @State("regionsForRender") regionsForRenderState!: any;
        @State(state => state.map.points) nextThreePoints!: any;
        @State(state => state.map.overlay) overlayState!: any;
        @State(state => state.nextThree) nextThreeState!: any;
        @State(state => state.nextData) nextDataState!: any;
        @State(state => state.dynamicComponent) dynamicComponentState!: any;
        @State("pagesShow") pagesShow: any;
        @Mutation("getZoom") setZoom: any;
        @Mutation("getCenter") setMapCenter: any;
        @Mutation("getPoint") getPoint: any;
        @Mutation("getFlowPoint") getFlowPoint: any;
        @Mutation("openForecast") openForecastModal: any;
        @Mutation("closeForecast") closeForecast: any;
        @Mutation("openFloodModal") openFlood: any;
        @Mutation("openFloodAnalyseModal") openFloodAnalyseModal: any;
        @Mutation("openNextThreeOverlay") openNextThreeOverlayMutation: any;
        @Mutation("closeNextThreeOverlay") closeNextThreeOverlayMutation: any;
        @Mutation("closeUpdateOverlay") closeUpdateOverlayMutation: any;
        @Mutation("updateMapPoints") updateMapPoints: any;
        @MapStore.Mutation("updateMapPoints") updateMapPointsMutation: any;
        @State(state => state.measure.disabled) measureDisabled!: boolean;
        @SolidWaterDeficit.State(state => state.map.points)
        solidWaterDeficitPoints!: any;
        @MapStore.State(state => state) mapState!: any;
        @MapStore.Mutation("updateOverlay") updateOverlayMutation!: any;
        @MapStore.Mutation("closeOverlay") closeOverlay!: Function;
        @storm.State("mapPath") mapPath: any;
        @storm.Mutation("getForecastPath") getForecastPath: any;
        @storm.Mutation("controlSelectShow") controlSelectShow: any;
        @storm.Mutation("getSelectData") getSelectData: any;
        extent: any = null;
        pic: any = {
            name: "rect",
            source: {
                type: "EsriJSON",
                url: "/pic.json",
                local: true,
                projection: "EPSG:4326",
                style: function() {
                    return {
                        stroke: {
                            color: "rgba(0,0,0,.2)",
                            width: 1
                        },
                        fill: {
                            color: "rgba(0,0,0,0)"
                        }
                    };
                }
            },
            visible: true,
            zIndex: 4
        };
        xzqyLayer: any = null;
        initLayer: any = null;
        flash: any = {
            coords: [0, 0],
            loops: 3,
            duration: 3000,
            radiusRange: [1, 40],
            style: {
                image: {
                    circle: {
                        anchor: [0.5, 1],
                        fill: {
                            color: [250, 0, 0],
                            opacity: 0.5
                        }
                    }
                }
            }
        };
        futureRainLayer: any = null; //未来降雨网格线图层
        markers: any[] = [];
        img: any = require("@/assets/listIcon.png");
        futureImg: any = null;
        detail: any = {
            show: false,
            info: {
                coords: [0, 0]
            }
        };
        index: any = 0;
        prevFeature: any = null;
        movePoint: any = {
            show: false,
            coord: [],
            info: []
        };

        @Watch("regionsForRenderState", { deep: true })
        handleRegionsChange(n: any, o: any) {
            const vm = this;
            const colors = [
                "rgba(79,225,118,1)",
                "rgba(62,123,228,1)",
                "rgba(242,202,70,1)",
                "rgba(226,117,223,1)",
                "rgba(255,104,104,1)",
                "rgba(71,72,72,1)"
            ];
            if (n.type != 3) {
                this.futureImg.visible = false;
                this.futureRainLayer.visible = true;
                this.futureRainLayer.source.style = (f: any) => {
                    const id = f.get("ID");
                    let opacity =
                        this.regionsForRenderState.opacity / 100 > 0.8
                            ? 0.8
                            : this.regionsForRenderState.opacity / 100;
                    const geo: any = f.getGeometry();
                    const extent: number[] = geo.getExtent();
                    let boolColor: boolean = false;
                    let color = "rgba(0,0,0,0)";
                    if (vm.regionsForRenderState.data[id] != undefined) {
                        let val = vm.regionsForRenderState.data[id];
                        if (Number(val) < 10) {
                            color = colors[0].replace("1)", opacity + ")");
                        } else if (Number(val) < 25) {
                            color = colors[1].replace("1)", opacity + ")");
                        } else if (Number(val) < 50) {
                            color = colors[2].replace("1)", opacity + ")");
                        } else if (Number(val) < 100) {
                            color = colors[3].replace("1)", opacity + ")");
                        } else if (Number(val) < 250) {
                            color = colors[4].replace("1)", opacity + ")");
                        } else {
                            color = colors[5].replace("1)", opacity + ")");
                        }
                    }
                    return {
                        stroke: {
                            width: 1,
                            color: "rgba(0,0,0,.2)"
                        },
                        fill: {
                            color
                        }
                    };
                };
            } else {
                this.futureImg.visible = true;
                this.futureRainLayer.visible = false;
            }
        }

        @Watch("futureImgUrl", { deep: true })
        changeFutureImgUrl(n: any) {
            if (n) {
                this.futureImg = {
                    name: "zjImg",
                    source: {
                        type: "ImageStatic",
                        url: n.url,
                        projection: "EPSG:4326",
                        imageExtent: [118, 27.1, 123, 31.2]
                    },
                    opacity: n.opacity,
                    visible: n.show,
                    zIndex: 5
                };
            }
            if (this.regionsForRenderState.type == "3" && n.show) {
                this.futureImg.visible = true;
            } else {
                this.futureImg.visible = false;
            }
        }

        @Watch("base")
        onChange(nval: number) {
            let layers = this.olMap.baseLayer;
            layers[0].visible = !nval;
            layers[1].visible = !nval;
            layers[2].visible = !!nval;

            let layers2 = this.olMap.baseLayer_other;
            layers2[0].visible = nval;
            layers[3].visible = !!nval;
        }

        @Watch("sendMarkers", { deep: true })
        changePoint(n: any) {
            let newArr: any = this.$utils.deepCopy(n);
            let vm = this;
            vm.markers = [];
            setTimeout(() => {
                newArr.reverse().forEach(function(item: any, index: number) {
                    let img: any = require("@/assets/legend/" + item.img);
                    let name = item.zm + " " || "";
                    let zindex = 9;
                    if (item.yl) {
                        name += "&nbsp;&nbsp;" + item.yl + "mm";
                        if (item.yl > 10) {
                            zindex = 10;
                        } else if (item.yl > 25) {
                            zindex = 11;
                        } else if (item.yl > 50) {
                            zindex = 12;
                        } else if (item.yl > 100) {
                            zindex = 13;
                        } else if (item.yl > 250) {
                            zindex = 14;
                        }
                    }
                    if (item.sw) {
                        name +=
                            "<div>" +
                            vm.$utils.dateFormat(
                                new Date(item.sbsj),
                                "yyyy-MM-dd HH:mm"
                            ) +
                            "&nbsp;&nbsp;&nbsp;" +
                            item.sw +
                            "米</div>";
                    }

                    let marker = {
                        id: item.index || item.zh || "",
                        coords: [
                            item.jd || 120.70404052734372,
                            item.wd || 29.40969406712921
                        ],
                        name,
                        lon: item.jd || 120.70404052734372,
                        lat: item.wd || 29.40969406712921,
                        moveLabel: {},
                        info: item,
                        style: {
                            image: {
                                icon: {
                                    anchor: [0.5, 0.5],
                                    src: img,
                                    scale: SCALE
                                }
                            },
                            zIndex: zindex //最小值为9
                        }
                    };
                    vm.markers.push(marker);
                });
            });
        }

        @Watch("$route", { immediate: true })
        closeAll(n: any) {
            this.getFlowPoint([]);
            this.closeOverlay();
            this.closeUpdateOverlayMutation();
            this.closeNextThreeOverlayMutation();
            this.updateMapPoints({
                data: []
            });
            this.updateMapPointsMutation({
                data: []
            });
        }

        @Watch("zoom")
        changeZoom(n: any) {
            this.olMap.map.view.zoom = n;
        }

        @Watch("olMap.map.view.zoom")
        changeMapZoom(n: number) {
            this.setZoom(n);
        }

        @Watch("point")
        modalChange(n: any) {
            if (n.length) {
                this.detail.show = true;
                this.index++;
                let arr = n[0];
                if ((arr.lon || arr.jd) && (arr.lat || arr.wd) && arr.info) {
                    this.olMap.map.view.center.coord = [
                        arr.lon || arr.jd,
                        arr.lat || arr.wd
                    ];
                    this.flash.coords = [arr.lon || arr.jd, arr.lat || arr.wd];
                    this.setZoom(12);
                    this.detail.info = { ...arr.info };
                }
            } else {
                this.detail.show = false;
                this.flash.coords = [0, 0];
            }
        }

        moveModel(marker: any) {
            if (!this.detail.show) {
                this.movePoint.show = true;
                this.movePoint.coord = [marker.lon, marker.lat];
                this.movePoint.info = marker;
            }
        }

        openFullScreen() {
            const loading = this.$loading({
                lock: true,
                text: "Loading...",
                spinner: "el-icon-loading"
                //background: 'rgba(0, 0, 0, 0.7)'
            });
            return loading;
        }

        closeFullScreen(loading: any) {
            loading.close();
        }

        getBlank(e: any) {
            this.detail.show = false;
            console.log(e);
        }

        resetIcon() {
            let timer = null;
            let self = this;
            if (timer) {
                clearTimeout(timer);
            } else {
                this.controlSelectShow(false);
                timer = setTimeout(function() {
                    self.markers.forEach((item: any) => {
                        item.style.image.icon.scale = SCALE;
                    });
                }, 200);
            }
            this.movePoint.show = false;
        }

        openFloods(marker: any) {
            this.olMap.map.view.center.coord = [marker.lon, marker.lat];
            this.openFlood(marker);
        }

        openFloodAnalyse(marker: any) {
            this.setZoom(12);
            this.olMap.map.view.center.coord = [
                marker.lon + 0.02,
                marker.lat + 0.06
            ];
            this.openFloodAnalyseModal(marker);
        }

        openForecast(marker: any) {
            this.olMap.map.view.center.coord = [marker.lon, marker.lat];
            this.openForecastModal(marker);
        }

        closeModal() {
            this.detail.show = false;
        }

        // 点击未来三天降水的点位
        handleClickMarker(marker: any) {
            this.setMapCenter([marker.lon, marker.lat + 0.5]);
            this.openNextThreeOverlayMutation({ data: marker });
            // this.setZoom(12);
        }

        //点击点位 打开弹框
        openModel(marker: any) {
            this.setZoom(12);
            this.olMap.map.view.center.coord = [
                marker.coords[0],
                marker.coords[1] + 0.08
            ];
            this.flash.coords = marker.coords;
            this.detail.show = true;
            this.index++;
            this.detail.info = marker;
            // this.getPoint(marker)
        }

        openFloodModal(marker: any) {
            this.olMap.map.view.center.coord = [marker.lon, marker.lat];
        }

        largeIcon(e: any) {
            let arr: any;
            if (e.feature.get("id")) {
                arr = e.feature.get("id").split("_");
                if (arr.length == 2) {
                    let data = [
                        ...this.mapPath.grids,
                        ...this.mapPath.forecast
                    ].filter((item: any) => {
                        return item.id == e.feature.get("id");
                    });
                    if (data.length) {
                        this.controlSelectShow(true);
                        this.getSelectData(data[0]);
                    }
                }
            }
            let feature = e.feature;
            if (this.prevFeature) {
                this.prevFeature
                    .getStyle()
                    .getImage()
                    .setScale(SCALE);
            }
            if (feature.get("collectionInfo")) {
                feature
                    .getStyle()
                    .getImage()
                    .setScale(SCALE * 1.25);
                this.prevFeature = feature;
            }
        }

        // 点击地图
        handleSingleClick(e: any) {
            // 在未来降雨页面
            const { name } = this.$route.meta;
            let arr;
            let params;
            if (e.feature.get("id")) {
                arr = e.feature.get("id").split("_");
                params = {
                    id: arr[0],
                    time: arr[1]
                };
                if (arr.length == 2) {
                    this.getForecastPath(params);
                }
            }
            if (name === "next-three-day") {
                if (e.feature.get("ID")) {
                    const [lon, lat] = e.coord;
                    this.setMapCenter([lon, lat + 0.5]);
                    const data = {
                        lon,
                        lat,
                        component: "NextThreeOverlayLayer",
                        offset: [-450, -430],
                        data: {
                            id: e.feature.get("ID")
                        }
                    };
                    this.updateOverlayMutation({ data });
                } else {
                    return;
                }
            } else {
                return;
            }
        }

        @Watch("selectAreas")
        changeArea(n: any) {
            this.extent = null;
            this.locationBySjxLayer(this.selectAreas);
        }

        @Watch("centerPoint")
        changeCenter(n: any) {
            let vm = this;
            vm.olMap.map.view.center.coord = n;
        }

        @Watch("cloudUrl")
        changeCloudUrl(n: any) {
            if (n && n != "") {
                this.olMap.otherLayer[3].visible = true;
                this.olMap.otherLayer[3].source.url =
                    this.netUrl +
                    "/rest/rainAnalysis/getWxPic?picUrl=" +
                    n.slice(0, 12);
                /* "http://www.zjsq.net.cn:8010/MobileService/pic/SatelliteCloud/MAP/" +
                    n.slice(0, 12) +
                    ".png";*/
                // this.olMap.map.view.zoom = 5;
                this.olMap.map.view.center.coord = [121.333, 28.94];
            } else {
                this.olMap.otherLayer[3].visible = false;
            }
        }

        @Watch("ldUrl")
        changeldUrl(n: any) {
            if (n && n != "") {
                this.olMap.otherLayer[1].visible = true;
                //https://sqfb.zjsq.net.cn:8089/zj121/tile-service/img?Type=Radarhref&File=MOSAICHREF000.20200401.0000.latlon&opacity=0.9&x={x}&y={y}&z={z}
                this.olMap.otherLayer[1].source.url =
                    "https://sqfb.zjsq.net.cn:8089/zj121/tile-service/img?Type=Radarhref&File=" +
                    n +
                    "&opacity=0.9&x={x}&y={y}&z={z}";
            } else {
                this.olMap.otherLayer[1].visible = false;
            }
        }

        @Watch("$route", { deep: true })
        changeRoute(n: any) {
            this.markers = [];
            if (this.$route.fullPath != "/main/map/rainfall-analysis") {
                this.olMap.otherLayer[2].visible = false;
            }
            //隐藏洪水分析弹框
            this.flood.layer.visible = false;
            //隐藏预报展示弹框
            this.forecast.show = false;
            //隐藏洪水分析弹框
            this.flood.analyse.show = false;
            //隐藏未来降雨弹框
            this.nextThreeState.visible = false;
            //清空洪水分析模块点位
            this.flood.analyse.point = [];
            // 初始化选中flash
            this.flash.coords = [0, 0];
            //清空预报展示模块点位
            this.forecast.point = [];
            //清空台风路径
            this.getForecastPath([]);
            this.getSelectData([]);
        }

        @Watch("jyUrl", { deep: true })
        changeJyUrl(n: any) {
            if (n && n != "") {
                this.olMap.otherLayer[2].visible = true;
                this.olMap.otherLayer[2].opacity = n.opacity;
                //this.olMap.otherLayer[2].source.url = "/rest/rainAnalysis/getRainPictures?picUrl=" + n.name;
                // http://map.zjsw.cn
                this.olMap.otherLayer[2].source.url = n.name;
            } else {
                this.olMap.otherLayer[2].visible = false;
            }
        }

        @Watch("solidUrl", { deep: true })
        changeSolidUrl(n: any) {
            if (n && n != "") {
                this.olMap.solidLayers.visible = true;
                this.olMap.solidLayers.opacity = n.opacity;
                this.olMap.solidLayers.source.url =
                    this.netUrl +
                    "/rest/soilWaterDeficit/getPictureByUrl?picUrl=" +
                    n.name;
            }
        }

        lacationByFeature(feature: any, key: string, matchName: string) {
            let type: string = matchName.charAt(matchName.length - 1);
            let fname = feature.get(key);
            let checked: any = false;
            if (type == "1") {
                checked = fname.match(matchName.slice(0, 2)) != null;
            } else {
                checked = fname.match(matchName.slice(0, -1)) != null;
            }

            let extent: number[];
            if (checked) {
                const geo: any = feature.getGeometry();
                const extent: number[] = geo.getExtent();
                mapService.locationByExtent("baseMap", extent);
            }
            return {
                stroke: {
                    width: 2,
                    color: "rgba(0,0,0,0)"
                }
            };
        }

        // 点击公共组件中的点位时
        handleClickCommonMarker(data: any) {
            this.setZoom(16);
            this.setMapCenter([data.lon, data.lat + 0.02]);
            this.updateOverlayMutation({ data });
        }

        locationBySjxLayer(n: string) {
            const vm = this;
            let nn = "";
            n == "江苏省" ? (nn = "江苏") : (nn = n);
            n == "上海市" ? (nn = "上海") : (nn = n);
            let areasArr = [
                "安徽省",
                "江苏省",
                "上海市",
                "全部",
                "浙江省",
                "全省",
                null,
                ""
            ];
            let isInArr = false;
            areasArr.forEach(function(item: any) {
                if (n && n.slice(0, -1) == item) {
                    isInArr = true;
                    return;
                }
            });
            let type: any = n.charAt(n.length - 1);
            if (isInArr) {
                if (n.match("浙江省") != null) {
                    vm.olMap.map.view.center.coord = [121.333, 28.94];
                    vm.setZoom(8);
                } else if (n.match("江苏省") != null) {
                    vm.olMap.map.view.center.coord = [120.17, 31.96];
                    vm.setZoom(9);
                } else if (n.match("上海市") != null) {
                    vm.olMap.map.view.center.coord = [
                        121.409912109375,
                        31.109161376953125
                    ];
                    vm.setZoom(10);
                } else if (n.match("安徽省") != null) {
                    vm.olMap.map.view.center.coord = [
                        118.3172607421875,
                        29.85260009765625
                    ];
                    vm.setZoom(10);
                } else if (n == "太湖") {
                    vm.olMap.map.view.center.coord = [
                        120.16845703125,
                        31.22589111328125
                    ];
                    vm.setZoom(10);
                }
            } else {
                if (type == 1) {
                    this.xzqyLayer.source = {
                        type: "EsriJSON",
                        url: "/counties.json",
                        projection: "EPSG:4326",
                        local: true,
                        style: function(f: any) {
                            if (type == 0 || type == 1) {
                                vm.lacationByFeature(f, "NAMEC", n);
                            } else if (type == 2) {
                                vm.lacationByFeature(f, "ennm", n);
                            } else if (type == 3) {
                                vm.lacationByFeature(f, "RCD", n);
                            }
                            return {
                                stroke: {
                                    width: 1,
                                    color: "rgba(0,0,0,0)"
                                }
                            };
                        }
                    };
                } else {
                    this.xzqyLayer.source = {
                        type: "EsriJSON",
                        url:
                            this.netUrl +
                            "/arcgis/rest/services/LYXZQ/MapServer/" +
                            type +
                            "/query?where=1=1&outFields=*&f=pjson",
                        projection: "EPSG:4326",
                        style: function(f: any) {
                            if (type == 0 || type == 1) {
                                vm.lacationByFeature(f, "NAMEC", n);
                            } else if (type == 2) {
                                vm.lacationByFeature(f, "ennm", n);
                            } else if (type == 3) {
                                vm.lacationByFeature(f, "RCD", n);
                            }
                            return {
                                stroke: {
                                    width: 1,
                                    color: "rgba(0,0,0,0)"
                                }
                            };
                        }
                    };
                }
            }
        }

        initLayers() {
            let vm = this;
            const mapConfig = this.$getMapConfig();
            this.xzqyLayer = mapConfig.xzqyLayer;
            this.futureImg = this.olMap.futureImg;
            this.initLayer = {
                name: "wsly", //外省边界和流域
                source: {
                    type: "ImageArcGISRest",
                    url: this.netUrl + "/arcgis/rest/services/ZJSW/MapServer",
                    params: {
                        layers: "show:7,9,20,23"
                    },
                    projection: "EPSG:4326"
                },
                zIndex: 1
            };
            this.futureRainLayer = {
                name: "rect",
                source: {
                    type: "EsriJSON",
                    url: "/netGrid.json",
                    local: true,
                    projection: "EPSG:4326",
                    style: function(f: any) {
                        return {
                            stroke: {
                                width: 1,
                                color: "rgba(0,0,0,.1)"
                            }
                        };
                    }
                },
                visible: true,
                zIndex: 5
            };
        }

        created() {
            this.initLayers();
        }
    }
</script>

<style lang="scss" scoped>
    .detailInfo {
        width: 1140px;
        height: 530px;
        border-radius: 5px;
        background-color: #fff;
        z-index: 99;
    }
</style>
