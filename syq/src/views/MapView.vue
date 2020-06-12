<template>
    <div class="main_view" style="overflow: hidden">
        <div class="mapView">
            <Map
                class="map"
                :base="mapBase"
                :ol-map="olMap"
                :sjx-layer="sjxLayer"
                @listSend="getList"
                :sendMarkers="markers"
                :floodPoints="floodPoints"
            />
            <div class="rightLine" v-if="data.show"></div>
            <div class="rightLine" style="right: 325px" v-if="data.show"></div>
            <right-list
                class="rightList"
                :data="data"
                :tb-list="list"
                :style="{ true: 'right:3px', false: 'right:-400px' }[data.show]"
                @closeRight="closeRight"
                @getMarkers="getData"
                @sendFloodPoints="getFloodPoints"
                @getAlarm="openAlarmDialog"
            ></right-list>
            <div
                style="position: absolute;right: 0;bottom: 10px;width: 400px;font-size: 14px;font-weight: bold;width: 400px;"
            >
                <div v-if="$utils.checkUser(userInfo.roles, 'super')">
                    <span>总访问人数：{{ data.allNum }}</span>
                    <span style="margin-left: 10px"
                        >当前访问人数：{{ data.onlineNum }}</span
                    >
                </div>
            </div>
            <div
                @click="openRight"
                class="rightOpen"
                :style="{ true: 'right:400px', false: 'right:0' }[data.show]"
            >
                <img src="@/assets/show.png" v-if="!data.show" alt />
                <img src="@/assets/hide.png" v-if="data.show" alt />
            </div>
            <left-nav
                class="left-check"
                v-if="userInfo.roles != 'middle'"
            ></left-nav>
            <div
                class="left-legend"
                v-show="pagesShow['气象雷达']"
                style="left:calc(100% - 750px);background-color: rgba(0,0,0,0)"
            >
                <img src="../assets/legend/ld.png" height="68" width="308" />
            </div>
            <div
                class="left-legend"
                v-if="
                    legendShow == 'realtime-rain' ||
                        (legendShow == 'next-three-day' && legendType == 1)
                "
                style="width: 100px"
                :class="[
                    userInfo.roles === 'middle' &&
                    legendShow === 'next-three-day'
                        ? 'locate-to-left-120'
                        : userInfo.roles === 'middle' &&
                          legendShow === 'realtime-rain'
                        ? 'locate-to-left'
                        : userInfo.roles !== 'middle' &&
                          legendShow === 'realtime-rain'
                        ? 'locate-to-left-210'
                        : userInfo.roles !== 'middle' &&
                          legendShow === 'next-three-day'
                        ? 'locate-to-left-340'
                        : ''
                ]"
            >
                <div>雨情图例</div>
                <div
                    v-for="(item, index) in yqLenged"
                    v-if="!(legendShow == 'next-three-day' && index == 0)"
                    class="legend-con"
                    :key="index"
                >
                    <img :src="item.src" alt />
                    {{ item.name }}
                </div>
            </div>
            <!--<div
                class="left-legend"
                v-if="legendShow == 'realtime-flow'"
                style="width: 124px"
                :class="[
                    userInfo.roles === 'middle' &&
                    legendShow === 'realtime-flow'
                        ? 'locate-to-left'
                        : 'locate-to-left-210'
                ]"
            >
                <div>可纳降雨量</div>
                <div
                    v-for="(item, index) in llLenged"
                    class="legend-con"
                    :key="index"
                    style="width: 110px"
                >
                    <img :src="item.src" alt />
                    {{ item.name }}
                </div>
      </div>-->
            <div
                class="left-legend"
                :class="userInfo.roles === 'middle' ? 'locate-to-left' : ''"
                v-if="legendShow == 'next-three-day'"
                style="width: 100px;"
            >
                <div>网格图例</div>
                <div
                    v-for="(item, index) in yqLenged"
                    v-if="!(legendShow == 'next-three-day' && index == 0)"
                    class="legend-con"
                    :key="index"
                >
                    <span
                        style="display: inline-block;width:15px;height: 15px;margin-right: 10px"
                        :style="{ background: item.color }"
                    ></span>
                    {{ item.name }}
                </div>
            </div>
            <div
                class="left-legend"
                v-if="
                    legendShow == 'realtime-water' ||
                        (legendShow == 'next-three-day' && legendType == 2)
                "
                style="width: 110px"
                :class="[
                    userInfo.roles === 'middle' &&
                    legendShow === 'next-three-day'
                        ? 'locate-to-left-120'
                        : userInfo.roles === 'middle' &&
                          legendShow === 'realtime-water'
                        ? 'locate-to-left'
                        : userInfo.roles !== 'middle' &&
                          legendShow === 'realtime-water'
                        ? 'locate-to-left-210'
                        : userInfo.roles !== 'middle' &&
                          legendShow === 'next-three-day'
                        ? 'locate-to-left-340'
                        : ''
                ]"
            >
                <div>水情图例</div>
                <div
                    v-for="(item, index) in sqLenged"
                    class="legend-con"
                    :key="index"
                >
                    <img :src="item.src" alt />
                    {{ item.name }}
                </div>
            </div>
            <div
                class="left-legend"
                v-if="legendShow == 'monitor-info'"
                style="width: 110px"
                :class="[
                    userInfo.roles === 'middle' && legendShow === 'monitor-info'
                        ? 'locate-to-left'
                        : 'locate-to-left-210'
                ]"
            >
                <div>预警图例</div>
                <div
                    v-for="(item, index) in yjLenged"
                    class="legend-con"
                    :key="index"
                >
                    <img :src="item.src" alt />
                    {{ item.name }}
                </div>
            </div>
            <!-- 切换底图 -->
            <div
                class="map-change"
                :class="[userInfo.roles === 'middle' ? 'locate-to-left' : '']"
            >
                <div @click="mapBase = 0" :class="{ active: mapBase === 0 }">
                    <i class="iconfont iconlujing4"></i>
                    地形图
                </div>
                <div @click="mapBase = 1" :class="{ active: mapBase === 1 }">
                    <i class="iconfont iconzu1"></i>
                    卫星图
                </div>
            </div>
            <div v-if="ld_time != null" class="ldtime">
                <span>雷达时间{{ ld_time }}</span>
            </div>
            <div v-if="yt_time != null" class="ldtime" style="top:70px">
                <span>云图时间{{ yt_time }}</span>
            </div>
            <!--底部提示-->
            <div
                class="footerWarning"
                v-if="userInfo.roles != 'middle'"
                ref="chrome"
                id="chrome"
            >
                <i class="el-icon-info"></i>
                推荐使用chrome浏览器
            </div>
            <div class="mapLoading" v-if="mapLoading">
                <img src="@/assets/loading1.gif" alt />
            </div>
            <el-dialog
                :visible.sync="alarmDialogShow"
                width="30%"
                :before-close="closeDialog"
                class="alarmDialog"
                :close-on-click-modal="false"
            >
                <el-button @click="closeDialog">关闭警铃</el-button>
                <!-- <el-button @click="closeDialog">关闭警铃</el-button>-->
            </el-dialog>
            <!--查看全部表格-->
            <el-dialog
                :visible.sync="allTableData.show"
                width="80%"
                :close-on-click-modal="false"
                v-if="allTableData.show"
                class="rain-info"
                ref="tb"
                :before-close="closeAllTable"
            >
                <h1 slot="title">
                    {{ allTableData.title }}
                    <i
                        class="el-icon-full-screen"
                        @click="fullScreen('tb')"
                    ></i>
                </h1>
                <el-table
                    class="moreInfo"
                    :data="allTableData.tblist"
                    stripe
                    border
                    style="margin-top: 10px;width: 100%;height: 100%"
                    :max-height="tableHeight"
                >
                    <el-table-column
                        type="index"
                        label="序"
                        fixed="left"
                    ></el-table-column>
                    <el-table-column
                        v-for="(item, index) in allTableData.th"
                        :key="index"
                        :prop="item.prop"
                        :label="item.label"
                        :fixed="item.fixed"
                        show-overflow-tooltip
                    >
                        <el-table-column
                            v-for="(child, index1) in item.children"
                            :key="index1"
                            :prop="child.prop"
                            :label="child.label"
                            show-overflow-tooltip
                        ></el-table-column>
                    </el-table-column>
                </el-table>
            </el-dialog>
            <!---->
            <el-dialog
                :visible.sync="rainInfoState.show"
                width="80%"
                :title="rainInfoState.title"
                :close-on-click-modal="false"
                v-if="rainInfoState.show"
                class="rain-info"
                ref="rain"
                :before-close="closeAllTable"
            >
                <h1 slot="title">
                    {{ rainInfoState.title }}
                    <i
                        class="el-icon-full-screen"
                        @click="fullScreen('rain')"
                    ></i>
                </h1>
                <div class="overview">
                    <p v-show="rainInfoState.data.rain != ''">
                        <span class="tit">[雨情]</span>
                        <span>{{ rainInfoState.data.rain }}</span>
                    </p>
                    <p v-show="rainInfoState.data.jhInfo != ''">
                        <span class="tit">[江河水情]</span>
                        <span>{{ rainInfoState.data.jhInfo }}</span>
                    </p>
                    <p v-show="rainInfoState.data.skInfo != ''">
                        <span class="tit">[大中型水库水情]</span>
                        <span>{{ rainInfoState.data.skInfo }}</span>
                    </p>
                    <p v-show="rainInfoState.data.forecast != ''">
                        <span class="tit">[天气预报]</span>
                        <span>{{ rainInfoState.data.forecast }}</span>
                    </p>
                </div>
            </el-dialog>
            <!--降雨图-->
            <el-dialog
                :visible.sync="rainImgState.show"
                width="80%"
                :title="rainImgState.title"
                :close-on-click-modal="false"
                v-if="rainImgState.show"
                class="rain-info"
                ref="img"
                :before-close="closeAllTable"
                style="text-align: center;"
            >
                <h4 slot="title">
                    <span class="rain-img-state-title">{{
                        rainImgState.title
                    }}</span>
                    <i
                        class="el-icon-full-screen"
                        @click="fullScreen('img')"
                    ></i>
                </h4>
                <img :src="rainImgState.url" alt />
                <div
                    class="dzmtl"
                    style="position: absolute;left: 20px;bottom: 20px"
                >
                    <p>等值面图列 (mm)</p>
                    <ul class="dzmtl-ul">
                        <li>
                            <div></div>
                            <p>0</p>
                        </li>
                        <li>
                            <div></div>
                            <p>10</p>
                        </li>
                        <li>
                            <div></div>
                            <p>25</p>
                        </li>
                        <li>
                            <div></div>
                            <p>50</p>
                        </li>
                        <li>
                            <div></div>
                            <p>100</p>
                        </li>
                        <li>
                            <div></div>
                            <p>250</p>
                        </li>
                    </ul>
                </div>
                <!-- <img src="@/assets/legend/jylegend.png" style="position: absolute;left: 20px;bottom: 20px" /> -->
            </el-dialog>
        </div>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Watch } from "vue-property-decorator";
    import { RightList, LeftNav } from "@/components";
    import Map from "./Map.vue";
    import { State, Getter, Action, Mutation, namespace } from "vuex-class";
    import mapService from "@/utils/mapService";

    const tableStore: any = namespace("waterAndRain");
    @Component({
        components: { Map, RightList, LeftNav }
    })
    export default class MapView extends Vue {
        @State("userInfo") userInfo: any;
        @State("netUrl") netUrl: any;
        @State("selectArea") selectArea: any;
        @State("ld_time") ld_time: any;
        @State("yt_time") yt_time: any;
        @State("alarmType") alarmType: any;
        @State alarmDialogShow!: boolean;
        @State zjsData: any;
        @State legendType: any;
        @State mapLoading!: boolean;
        @State("pagesShow") pagesShow: any;
        @Mutation("closeAlarm") closeAlarm: any;
        @Mutation("getLdTime") getLdTime: any;
        @Mutation("getYtTime") getYtTime: any;
        @Mutation("getSelectArea") getSelectArea: any;
        @Mutation closeAlarmDialog: any;
        @Mutation closeAlarmAudio: any;
        @Mutation getCenter: any;
        @tableStore.State("allTableData") allTableData: any;
        @tableStore.State("rainInfo") rainInfoState: any;
        @tableStore.State("rainImg") rainImgState: any;
        tableHeight: number = 500;
        mapBase = 0;
        //alarmDialogShow: boolean = false;
        olMap: any = this.$getMapConfig();
        sjxLayer: any = {};
        list: any = [];
        markers: any[] = [];
        floodPoints: any[] = [];
        legendShow: string = "";
        data: any = {
            type: "实时水情",
            show: true,
            onlineNum: 0,
            allNum: 0
        };
        yqLenged: any = [
            {
                name: "无数据",
                src: require("@/assets/legend/rain_null.png"),
                color: "#4fe176"
            },
            {
                name: "<10",
                src: require("@/assets/legend/rain_0.png"),
                color: "#4fe176"
            },
            {
                name: "10-25",
                src: require("@/assets/legend/rain_10.png"),
                color: "#3e7be4"
            },
            {
                name: "25-50",
                src: require("@/assets/legend/rain_25.png"),
                color: "#f2ca46"
            },
            {
                name: "50-100",
                src: require("@/assets/legend/rain_50.png"),
                color: "#e275df"
            },
            {
                name: "100-250",
                src: require("@/assets/legend/rain_100.png"),
                color: "#ff6868"
            },
            {
                name: ">250",
                src: require("@/assets/legend/rain_250.png"),
                color: "#474848"
            }
        ];
        llLenged: any = [
            {
                name: "> 300 mm",
                src: require("@/assets/bxll/water_1.png"),
                color: "#4fe176"
            },
            {
                name: "200 ~ 300 mm",
                src: require("@/assets/bxll/water_2.png"),
                color: "#3e7be4"
            },
            {
                name: "100 ~ 200 mm",
                src: require("@/assets/bxll/water_3.png"),
                color: "#f2ca46"
            },
            {
                name: "50 ~ 100 mm",
                src: require("@/assets/bxll/water_4.png"),
                color: "#e275df"
            },
            {
                name: "1 ~ 50 mm",
                src: require("@/assets/bxll/water_5.png"),
                color: "#ff6868"
            },
            {
                name: "null",
                src: require("@/assets/bxll/water_0.png"),
                color: "#4fe176"
            }
        ];
        sqLenged: any = [
            {
                name: "超汛限",
                src: require("@/assets/legend/water_xx.png")
            },
            {
                name: "超保证",
                src: require("@/assets/legend/water_bzz.png")
            },
            {
                name: "超警戒",
                src: require("@/assets/legend/water_jjz.png")
            },
            {
                name: "一般站",
                src: require("@/assets/legend/water_nz.png")
            }
        ];
        yjLenged: any = [
            {
                name: "超汛限",
                src: require("@/assets/legend/water_jjz.png")
            },
            {
                name: "超保证",
                src: require("@/assets/legend/water_bzz.png")
            },
            {
                name: "超警戒",
                src: require("@/assets/legend/water_jjz.png")
            },
            {
                name: "雨量超警",
                src: require("@/assets/legend/rain_25.png")
            }
        ];

        init() {
            let vm = this;
            this.sjxLayer = {
                name: "rect",
                source: {
                    type: "EsriJSON",
                    url: this.netUrl + "/arcgis/rest/services/LYXZQ/MapServer",
                    projection: "EPSG:4326",
                    crossOrigin: "anonymous",
                    style: function(f: any) {
                        return {
                            stroke: {
                                width: 2,
                                color: "rgba(0,0,0,0)"
                            },
                            img: null
                        };
                    }
                },
                visible: true,
                zIndex: 4
            };
        }

        getList(arr: any) {
            this.list = arr;
        }

        openRight() {
            this.data.show = !this.data.show;
        }

        closeRight() {
            this.data.show = false;
        }

        getData(data: any) {
            this.markers = data;
        }

        getFloodPoints(data: any) {
            this.floodPoints = data;
        }

        openAlarmDialog() {
            //this.alarmDialogShow = true;
            this.openAlarmDialog();
        }
        fullScreen(key: any) {
            if (document.getElementsByClassName("rain-info").length) {
                let dialog: any = document
                    .getElementsByClassName("rain-info")[0]
                    .getElementsByClassName("el-dialog")[0];
                if (dialog.classList.value.match("bigMore")) {
                    dialog.classList.remove("bigMore");
                    this.tableHeight = 500;
                } else {
                    dialog.classList.add("bigMore");
                    this.tableHeight = 810;
                }
                let dzmtlUl: any = document.getElementsByClassName(
                    "dzmtl-ul"
                )[0];
                if (dzmtlUl.classList.value.match("bigMore")) {
                    dzmtlUl.classList.remove("bigMore");
                } else {
                    dzmtlUl.classList.add("bigMore");
                }
            }
        }
        closeAllTable(done: any) {
            if (document.getElementsByClassName("rain-info").length) {
                let dialog: any = document
                    .getElementsByClassName("rain-info")[0]
                    .getElementsByClassName("el-dialog")[0];
                dialog.classList.add("bigMore");
            }
            this.tableHeight = 500;
            done();
        }
        closeDialog() {
            //this.alarmDialogShow = false;
            //this.closeAlarm(false);
            this.closeAlarmDialog();
            this.closeAlarmAudio();
        }

        showTl(route: string) {
            let self = this;
            self.getLdTime(null);
            self.getYtTime(null);
            self.legendShow = "";
            let arr = [
                "realtime-rain",
                "realtime-water",
                "realtime-flow",
                "monitor-info",
                "weather-radar",
                "next-three-day"
            ];
            arr.forEach(function(item: string) {
                if (route.match(item)) {
                    self.legendShow = item;
                }
            });
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
                //console.log(extent);
                mapService.locationByExtent("baseMap", extent);
            }
            return {
                stroke: {
                    width: 2,
                    color: "rgba(0,0,0,0)"
                }
            };
        }

        @Watch("selectArea")
        changeArea(n: any) {
            let vm = this;
            let nn = "";
            this.sjxLayer.visible = true;
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
                if (n == "" || item == n.slice(0, -1)) {
                    isInArr = true;
                }
            });
            let type = n.charAt(n.length - 1);
            let params = null;
            if (isInArr) {
                this.sjxLayer.visible = false;
            } else {
                if (type == "0") {
                    params = {
                        layerDefs: JSON.stringify({
                            "0": "NAMEC='" + n.slice(0, -1) + "'"
                        }),
                        layers: "show:0"
                    };
                } else if (type == "1") {
                    params = {
                        layerDefs: JSON.stringify({
                            "1": "NAMEC='" + n.slice(0, -1) + "'"
                        }),
                        layers: "show:1"
                    };
                } else if (type == "2") {
                    params = {
                        layerDefs: JSON.stringify({
                            "2": "ennm='" + n.slice(0, -1) + "'"
                        }),
                        layers: "show:2"
                    };
                } else if (type == "3") {
                    params = {
                        layerDefs: JSON.stringify({
                            "3": "RCD='" + n.slice(0, -1) + "'"
                        }),
                        layers: "show:3"
                    };
                }

                this.sjxLayer.source = {
                    type: "ImageArcGISRest",
                    url: this.netUrl + "/arcgis/rest/services/LYXZQ/MapServer",
                    params: params,
                    crossOrigin: "anonymous",
                    projection: "EPSG:4326"
                };
            }
            //this.locationByLy(n);
            //this.locationByArea(n);
        }

        @Watch("$route", { deep: true })
        changeRoute(n: any) {
            if (n.fullPath.match("satellite-images") == null) {
                this.olMap.map.view.center.coord = [121.333, 28.94];
            }
            this.olMap.map.view.zoom = 8;
            this.showTl(n.fullPath);
            this.getSelectArea("");
            if (this.$route.fullPath != "/main/map/flood-warning") {
                this.floodPoints = [];
            }
        }

        created() {
            this.init();
            this.showTl(this.$route.fullPath);
            this.$http
                .get("/rest/basic/getOnlineNumber")
                .then((res: any) => {
                    this.data.allNum = res.data.allNum;
                    this.data.onlineNum = res.data.onlineNum;
                })
                .catch(() => {
                    this.$message("获取访问量失败！");
                });
        }
    }
</script>

<style scoped lang="scss">
    .mapView {
        height: 100%;
        width: 100%;
        position: relative;

        .map {
            position: relative;
            width: 100%;
            background-color: #ddd;
        }

        .rightLine {
            position: absolute;
            top: 0;
            right: 50px;
            border: 1px solid #0169e1;
            height: 10px;
        }

        .rightList {
            position: absolute;
            right: 3px;
            top: 10px;
            width: 400px;
            // height: calc(100% +);
            // max-height: 860px;
            box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.15);
            border-radius: 4px;
            transition: all 0.5s;
            z-index: 6;
        }

        .rightOpen {
            position: absolute;
            top: 80px;
            width: 30px;
            transition: all 0.5s;
            z-index: 5;
            line-height: 30px;
            text-align: center;
            cursor: pointer;
        }

        .left-check {
            position: absolute;
            top: 0px;
            left: 0px;
            width: 234px;
            padding-top: 15px;
            padding-right: 40px;
            background: url("../assets/leftbg.png") no-repeat;
            background-size: 100% 100%;
            height: 100%;

            .yq {
                background-color: rgba(9, 204, 229); //36 122 214
                height: 90px;
                padding-left: 15px;
                line-height: 90px;
                border-radius: 10px;
                margin-bottom: 10px;
                color: #fff;
                font-weight: 200;
                font-size: 30px;
                cursor: pointer;
            }

            .sq {
                background-color: rgba(36, 122, 214);
            }
        }

        .left-legend {
            position: absolute;
            left: 230px;
            bottom: 20px;
            width: 84px;
            padding: 5px 8px;
            background-color: rgba(255, 255, 255, 0.5);
            color: #000;

            .legend-con {
                width: 100px;
                line-height: 25px;

                span {
                    display: inline-block;
                    width: 15px;
                    height: 15px;
                    margin-right: 12px;
                    vertical-align: middle;
                }

                img {
                    vertical-align: middle;
                    margin-right: 14px;
                    width: 14px;
                }
            }
        }

        .ldtime {
            position: absolute;
            top: 40px;
            left: calc(50% - 150px);
            font-size: 26px;
        }

        .footerWarning {
            position: absolute;
            left: calc(50% - 131px);
            bottom: 0px;
            font-weight: bold;
            font-size: 16px;
            background: rgba(255, 255, 255, 0.5);
            padding: 0 10px;
            letter-spacing: 5px;
            font-family: "宋体";
        }

        .mapLoading {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            text-align: center;
            line-height: 100%;
            z-index: 1000;
            background-color: rgba(0, 0, 0, 0.1);

            img {
                margin-top: 300px;
            }
        }

        .map-change {
            position: absolute;
            left: 275px;
            top: 26px;
            height: 35px;
            padding: 7px 0;
            line-height: 21px;
            font-size: 14px;
            background-color: #fff;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
            border-radius: 4px;
            cursor: pointer;

            > div {
                display: inline-block;
                width: 100px;
                height: 100%;
                text-align: center;

                i {
                    margin-right: 10px;
                    font-size: 14px;
                }

                &:hover,
                &.active {
                    color: #0d69df;
                }

                & + div {
                    border-left: 1px solid #e5e5e5;
                }
            }
        }
        .rain-info {
            .rain-img-state-title {
                font-size: 20px;
            }
        }
        .dzmtl {
            p:first-child {
                text-align: left;
                color: #000;
            }
            ul {
                text-align: center;
                li {
                    display: inline-block;
                    margin-right: 1px;
                    div {
                        width: 55px;
                        height: 22px;
                    }
                    p {
                        text-align: left;
                        font-size: 12px;
                        color: #000;
                    }
                }
                li:nth-child(1) {
                    div {
                        background-color: #4fe176;
                    }
                }
                li:nth-child(2) {
                    div {
                        background-color: #3e7be4;
                    }
                }
                li:nth-child(3) {
                    div {
                        background-color: #f2ca46;
                    }
                }
                li:nth-child(4) {
                    div {
                        background-color: #e275df;
                    }
                }
                li:nth-child(5) {
                    div {
                        background-color: #ff6868;
                    }
                }
                li:nth-child(6) {
                    div {
                        background-color: #474848;
                    }
                }
            }
        }
    }
</style>
