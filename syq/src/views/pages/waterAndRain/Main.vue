<template>
    <div class="details spec" :style="{ height: heightMixin }">
        <el-tabs v-model="data.type" type="card">
            <el-tab-pane name="水雨情简况" label="水雨情简况">
                <div class="tab" v-if="$utils.checkUser(userInfo.roles,'middle')">
                    <div
                        class="item"
                        style="border-right: 1px solid #ddd; width: 25%"
                        :class="data.alarmInfo == 0 ? 'act' : ''"
                        @click="changeTabMenu(0)"
                    >
                        水雨情简报
                        <span v-show="data.alarmInfo == 0"></span>
                    </div>
                    <div
                        class="item"
                        style="border-right: 1px solid #ddd; width: 25%"
                        :class="data.alarmInfo == 1 ? 'act' : ''"
                        @click="changeTabMenu(1)"
                    >
                        雨量概况
                        <span v-show="data.alarmInfo == 1"></span>
                    </div>
                    <!--class="item" style="border-right: 1px solid #ddd; width: 33%"-->
                    <div
                        class="item"
                        style="width: 25%;border-right: 1px solid #ddd;"
                        :class="data.alarmInfo == 2 ? 'act' : ''"
                        @click="changeTabMenu(2)"
                    >
                        水库报表
                        <span v-show="data.alarmInfo == 2"></span>
                    </div>
                    <div
                        class="item"
                        style="width: 23%"
                        :class="data.alarmInfo == 3 ? 'act' : ''"
                        @click="changeTabMenu(3)"
                    >
                        水情信息
                        <span v-show="data.alarmInfo == 3"></span>
                    </div>
                </div>
                <vue-perfect-scrollbar
                    class="result"
                    :style="{ height: parseInt(heightMixin) - 80 + 'px' }"
                >
                    <div
                        v-show="data.alarmInfo == 0"
                        class="overview"
                        v-loading="result.loading1"
                        style="height: 100%"
                    >
                        <div style="height: 60%;overflow: auto;cursor: move;" @click="getMore">
                            <p v-show="data.rain != ''">
                                <span class="tit">[雨情]</span>
                                <span>{{ data.rain }}</span>
                            </p>
                            <p v-show="data.jhInfo != ''">
                                <span class="tit">[江河水情]</span>
                                <span>{{ data.jhInfo }}</span>
                            </p>
                            <p v-show="data.skInfo != ''">
                                <span class="tit">[大中型水库水情]</span>
                                <span>{{ data.skInfo }}</span>
                            </p>
                            <p v-show="data.forecast != ''">
                                <span class="tit">[天气预报]</span>
                                <span>{{ data.forecast }}</span>
                            </p>
                        </div>
                        <div>
                            <h3 style="text-align: center;background: #eee;margin-top: 3px;">水文简报</h3>
                            <pdf-list
                                :tableHeight="
                                    (parseInt(heightMixin) - 80) * 0.4 - 30
                                "
                            ></pdf-list>
                        </div>
                    </div>
                    <div v-show="data.alarmInfo == 1" v-loading="result.rainLoading">
                        <rain-info
                            :rainPoint="result.rainPoint"
                            :tabIndex="data.alarmInfo"
                            @refreshRainData="getRainInfo"
                            @setRainPoint="setRainPoint"
                            @setDefaultPoint="setDefaultPoint"
                        ></rain-info>
                    </div>
                    <div v-show="data.alarmInfo == 2">
                        <reservoir-report
                            :data="result.rsvPoints"
                            :tbHeight="heightMixin"
                            :tabIndex="data.alarmInfo"
                            @setRsvPoint="setWaterPoint"
                        ></reservoir-report>
                    </div>
                    <div v-show="data.alarmInfo == 3">
                        <water-info
                            :tbList="result.waterInfoPoint"
                            :tbHeight="heightMixin"
                            :tabIndex="data.alarmInfo"
                            @setWaterPoint="setWaterPoint"
                            @setWaterLevel="setWaterLevel"
                        ></water-info>
                    </div>
                </vue-perfect-scrollbar>
            </el-tab-pane>

            <el-tab-pane name="气象雷达" label="气象雷达" v-if="pagesShow['气象雷达']">
                <weatherRadar></weatherRadar>
            </el-tab-pane>
            <el-tab-pane name="风暴潮" label="风暴潮" v-if="pagesShow['风暴潮']">
                <storm-surge></storm-surge>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts">
import "../../../styles/mapView/right.scss";
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { State, Mutation, Action, namespace } from "vuex-class";
import weatherRadar from "../weatherRadar/Main.vue";
import reservoirReport from "./components/reservoirReport.vue";
import rainInfo from "./components/rainInfo.vue";
import waterInfo from "./components/waterInfo.vue";
import pdfList from "./components/pdfList.vue";
import AutoHeightMixin from "../../../mixins/autoHeight";
import moment from "moment";
import stormSurge from "../stormSurge/Main.vue";

const tableStore = namespace("waterAndRain");
let cancelToken = null;
let validRain: Function = (item: any) => {
    let img: string = "";
    if (item.yl != "-" && item.yl != null) {
        if (Number(item.yl) >= 250) {
            img = "rain_250.png";
        } else if (Number(item.yl) >= 100) {
            img = "rain_100.png";
        } else if (Number(item.yl) >= 50) {
            img = "rain_50.png";
        } else if (Number(item.yl) >= 25) {
            img = "rain_25.png";
        } else if (Number(item.yl) >= 10) {
            img = "rain_10.png";
        } else if (Number(item.yl) >= 0) {
            img = "rain_0.png";
        }
    } else {
        img = "rain_null.png";
    }
    return img;
};
let validWater: Function = (item: any) => {
    let img: string = "";
    if ((item.zl = "RR")) {
        if (item.xxsw !== null) {
            img = item.sw > item.xxsw ? "water_xx.png" : "water_nz.png";
        } else {
            img = "water_nz.png";
        }
    } else {
        if (item.bzsw !== null) {
            img =
                item.sw > item.bzsw
                    ? "water_bzz.png"
                    : item.jjsw !== null && item.jjsw < item.sw
                    ? "water_jjz.png"
                    : "water_nz.png";
        }
    }

    return img;
};
@Component({
    components: {
        weatherRadar,
        reservoirReport,
        waterInfo,
        rainInfo,
        pdfList,
        stormSurge
    }
})
export default class waterRain extends AutoHeightMixin {
    @State alarmResult: any;
    @State alarmSearch: any;
    @Mutation("getCenter") getCenter: any;
    @Mutation("getZoom") getZoom: any;
    @Mutation("getPoint") getPoint: any;
    @State("pagesShow") pagesShow: any;
    @Mutation setAlarmResultLoading!: Function;
    @Mutation setAlarmResultTbDate!: Function;
    @Mutation("setHoverPoint") setHoverPoint: any;
    @Mutation setAlarmSearchShow!: Function;
    @Action initAlarmResult!: Function;
    @State(state => state.userInfo) userInfo!: any;
    @tableStore.Mutation("setRainInfo") setRainInfo!: Function;
    @tableStore.Mutation("controlRainInfoState")
    controlRainInfoState!: Function;
    data: any = {
        type: "水雨情简况",
        show: true,
        alarmInfo: "0",
        rain: "",
        skInfo: "",
        jhInfo: "",
        forecast: ""
    };
    allData: any = {
        show: true
    };

    get mapPoint() {
        const points: any[] = [];
        let img = "";
        if (this.data.alarmInfo == 1) {
        }
        if (this.data.alarmInfo == 2 || this.data.alarmInfo == 3) {
            points.push(...this.result.waterMapPoint);
        } else {
            this.result.defaultPoint.forEach((item: any) => {
                img = validRain(item);
                points.push({
                    zh: item.zh,
                    jd: item.jd,
                    wd: item.wd,
                    zm: item.zm,
                    yl: item.yl,
                    sss: item.info.sss,
                    ssx: item.info.ssx,
                    img: img
                });
            });
        }
        return points;
    }

    set mapPoint(list: any) {}

    changeTabMenu(num: string | number) {
        this.data.alarmInfo = num;
        this.$emit("getPoints", this.mapPoint);
    }

    result: any = {
        rainLoading: false,
        loading: false,
        loading1: false,
        //水库报表点位
        rsvPoints: [],
        //默认综述页面点位
        defaultPoint: [],
        //雨量概况页面点位
        rainPoint: [],
        //水情信息页面点位
        waterInfoPoint: [],
        waterMapPoint: []
    };

    tableHeight: number = 0;

    @Watch("userInfo", { immediate: true, deep: true })
    handleLogin() {
        /*if (this.userInfo.roles === "middle") {
                this.autoHeightMixin(55, true);
            } else {
                this.autoHeightMixin(136, true);
            }*/
        this.autoHeightMixin(136, true);
    }

    locate(item: any) {
        this.getZoom(12);
        this.getCenter([item.lon, item.lat + 0.08]);
        this.getPoint(item);
    }

    hoverLocate(item: any) {
        this.setHoverPoint(item);
    }

    //获取8时至今雨量站
    getEightToNowStation() {
        this.$http("/rest/WaterAndRainBriefInfo/getEightToNowRain").then(
            res => {
                let arr: any[] = [];
                res.data.forEach((item: any) => {
                    if (item.yl > 0) {
                        arr.push({
                            zm: item.zm,
                            zh: item.zh,
                            jd: item.jd,
                            wd: item.wd,
                            yl: item.yl,
                            info: { ...item }
                        });
                    }
                });
                this.result.defaultPoint = arr;
                this.changeTabMenu(0);
            }
        );
    }

    //获取水雨情综述和天气预报
    getOverview() {
        this.result.loading1 = true;
        let list = [];
        let vm = this;
        list[0] = this.$http.get("/rest/rainConfigAndAlarm/waterSummarize");
        list[1] = this.$http.get("/rest/WaterAndRainBriefInfo/getTqybNote");
        return this.$http.all(list).then(
            this.$http.spread(function(...resList) {
                vm.result.loading1 = false;
                const res: any = resList;
                vm.result.loading1 = false;
                vm.data.rain = res[0].data.rain;
                vm.data.skInfo = res[0].data.rsvr;
                vm.data.jhInfo = res[0].data.river;
                vm.data.forecast = res[1].data.info;
            })
        );
    }

    //获取水库报表
    getReservoirReport() {
        this.$http.get("/rest/WaterAndRainBriefInfo/getRsvrChart").then(res => {
            let arr: any[] = [],
                eightsw: any = "",
                eightknyl: any = "",
                eightw: any = "",
                sw: any = "",
                knyl: any = "",
                w: any = "";
            res.data.forEach((item: any) => {
                if (item.eight) {
                    eightsw = item.eight.sw;
                    eightknyl = item.eight.knyl;
                    eightw =
                        item.eight.w !== null ? item.eight.w.toFixed(1) : "-";
                }
                if (item.now) {
                    sw = item.now.sw;
                    knyl = item.now.knyl;
                    w = item.now.w !== null ? item.now.w.toFixed(1) : "-";
                }
                arr.push({
                    zm: item.stnm,
                    eightsw: eightsw,
                    eightxsl: eightw,
                    eightknyl: eightknyl || "-",
                    sw: sw,
                    xsl: w,
                    knyl: knyl || "-",
                    zxsl: item["wn-e"] !== null ? item["wn-e"].toFixed(2) : "-",
                    xxsw: item.xxsw,
                    jsmj: item.js,
                    city: item.sss,
                    zh: item.stcd,
                    lon: item.jd,
                    lat: item.wd,
                    jd: item.jd,
                    wd: item.wd,
                    info: { ...item },
                    sklx: item.sklx,
                    sss: item.sss,
                    ssx: item.ssx,
                    sbsj: moment().format("YYYY-MM-DD HH:00:00")
                });
            });
            this.result.rsvPoints = arr;
        });
    }

    //获取雨量信息
    getRainInfo() {
        const arr = [1, 3, 6, 12, 24];
        const vm = this;
        const list: any = [];
        let current = new Date(moment().format("YYYY-MM-DD HH")).getTime();
        let params = {
            st: "",
            et: moment().format("YYYY-MM-DDTHH:00:00"),
            min: 0,
            bool: 0
        };
        for (let i: number = 0; i < arr.length; i++) {
            let params1 = { ...params };
            params1.st = moment()
                .subtract(arr[i], "hour")
                .format("YYYY-MM-DDTHH:00:00");
            list[i] = vm.$http.get("/rest/rain/getTotalRainList2", {
                params: params1
            });
        }
        this.result.rainLoading = true;
        return this.$http.all(list).then(
            this.$http.spread(function(...resList) {
                resList.forEach((item: any) => {
                    vm.result.rainPoint.push(item.data);
                });
                vm.result.rainLoading = false;
            })
        );
    }

    //获取水情信息
    getWaterInfo(level: any) {
        //
        let params: any = {
            areaFlag: 1, //地区标识（1行政区2流域）
            sss: "", //地级市
            ssx: "", //地级县
            zl: "RR,ZQ,ZZ,TT,DD", //站类选择
            sklx: "3,4,5", //水库类型
            ly: "", //流域（水系）
            sfcj: 0, //是否超警0所有1超警
            bxdj: level, //报汛等级
            zm: "",
            flag: 1
        };
        if (!this.$utils.checkUser(this.userInfo.roles, "super")) {
            delete params.flag;
        }
        this.$http
            .get("/rest/water/getNewDataList", {
                params: params
                /* cancelToken: new this.$http.CancelToken(cancel => {
                    cancelToken = cancel;
                })*/
            })
            .then(res => {
                console.log(res);
                let target: any = [];
                target.push({
                    cjj: [],
                    cxx: [],
                    rsv: [], //水库
                    river: [], //河道
                    sluiceDam: [], //闸坝
                    tide: [] //潮汐
                });
                target[0].cjj.push(...res.data.cjj);
                target[0].cjj.push(...res.data.cbz);
                target[0].cxx.push(...res.data.cx);
                for (let key in res.data) {
                    res.data[key].forEach((item: any) => {
                        item.info = { ...item };
                        item.lon = item.jd;
                        item.lat = item.wd;
                        if (item.zl == "RR") {
                            target[0].rsv.push(item);
                        } else if (item.zl == "ZZ" || item.zl == "ZQ") {
                            target[0].river.push(item);
                        } else if (item.zl == "DD") {
                            target[0].sluiceDam.push(item);
                        } else if (item.zl == "TT") {
                            target[0].tide.push(item);
                        }
                    });
                }
                this.result.waterInfoPoint = target;
            });
    }

    //获取雨情等值面
    getDzmData() {
        /*this.$http
                .post("/rest/pictureHouse/getListOfPicture", {
                    /!*DATA: {
                        Action: "ListMapSet"
                    }*!/
                    DATA: {
                        Action: "ListMap",
                        mapSetID: 9,
                        mapSetAtlas: 0, //0单张 1逐时序列  2累积序列
                        mapContent: 1 //1面 2 线 4 面+线 8 .。。。
                    }
                })
                .then(res => {
                    console.log(res);
                });*/
    }

    //获取单击列表选中的雨量点位
    setRainPoint(list: any[]) {
        let arr: any[] = [];
        let img = "";
        list.forEach((item: any) => {
            img = validRain(item);
            item.img = img;
            arr.push(item);
        });
        this.$emit("getPoints", arr);
    }

    //设置默认点位
    setDefaultPoint() {
        let img = "",
            arr: any = [];
        this.result.defaultPoint.map((item: any) => {
            img = validRain(item);
            arr.push({
                zh: item.zh,
                jd: item.jd,
                wd: item.wd,
                zm: item.zm,
                yl: item.yl ? item.yl.toFixed(1) : item.yl,
                sss: item.info.sss,
                ssx: item.info.ssx,
                img: img
            });
        });
        this.$emit("getPoints", arr);
    }

    //设置水位站点位
    setWaterPoint(list: any[]) {
        let arr: any[] = [];
        let img = "";
        list.forEach((item: any) => {
            img = validWater(item);
            item.img = img;
            arr.push(item);
        });
        this.result.waterMapPoint = arr;
        this.$emit("getPoints", arr);
    }

    //设置报讯等级
    setWaterLevel(level: any) {
        let str: any = "";
        level.forEach(function(s: any) {
            switch (s) {
                case "中央":
                    str += "1,";
                    break;
                case "省重点":
                    str += "2,";
                    break;
                case "省一般":
                    str += "3,";
                    break;
                case "山洪":
                    str += "5,";
                    break;
                case "其他":
                    str += "4,";
                    break;
            }
        });
        this.getWaterInfo(str);
    }

    //
    getMore() {
        let { rain, skInfo, jhInfo, forecast } = this.data;
        const data = { rain, skInfo, jhInfo, forecast };
        this.setRainInfo(data);
        this.controlRainInfoState(true);
    }

    //获取pdf列表

    created() {
        // this.searchByList(parseInt(this.result.timeList.selected));
        this.getOverview();
        this.getReservoirReport();
        this.getEightToNowStation();
        this.getRainInfo();
        this.getWaterInfo("1,2");
        this.getDzmData();
    }
}
</script>
<style lang="scss">
.spec {
    .tab {
        padding: 12px 0;
        height: 40px;

        span {
            top: 30px;
        }
    }

    .searchBar {
        .numItem {
            line-height: 30px;
            width: 110px;
            float: left;
            margin-bottom: 5px;
            margin-right: 10px;

            .label {
                display: inline-block;
                margin-right: 10px;
            }

            .el-input__inner {
                padding-right: 20px !important;
                padding-left: 10px;
                line-height: 30px;
                height: 30px;
            }

            .el-input-number {
                width: 70px;
                line-height: 30px !important;
            }

            .el-input-number.is-controls-right .el-input-number__decrease,
            .el-input-number.is-controls-right .el-input-number__increase {
                line-height: 15px;
                width: 20px;
            }
        }

        .setBtn {
            width: 180px;
            height: 30px;
            border-radius: 3px;
            border: dotted 1px #0169e1;
            line-height: 30px;
            color: #0169e1;
            margin: 0 auto;
            text-align: center;
            cursor: pointer;
        }
    }

    .result {
        padding: 5px;

        .tab {
            padding: 0 15px;
            line-height: 40px;
            height: 40px;
            margin-top: 0;
            background-color: #f0f2f5;
        }

        .tab1 {
            margin-top: -10px;
            padding: 0 5px;
            text-align: left;
            height: 40px;
            line-height: 40px;

            > span {
                margin-right: 20px;
                color: #0169e1;
                font-size: 14px;
                cursor: pointer;
                user-select: none;
            }

            //background-color: #0169e1;
            .el-input__inner {
                background-color: rgb(1, 105, 225, 0.05);
            }
        }

        .searchNav {
            margin-bottom: 10px;
        }

        ul {
            list-style: none;

            li {
                line-height: 26px;

                div {
                    padding: 0 10px;
                }

                .yjbt {
                    color: rgb(11, 51, 60);
                    font-size: 15px;
                    cursor: pointer;
                    font-weight: bold;

                    .btm_img {
                        margin-bottom: 3px;
                    }

                    .folderImg {
                        margin-left: 10px;
                        margin-right: 10px;
                    }
                }

                .ejbt {
                    color: rgb(0, 128, 0);
                    font-weight: bold;
                    padding-left: 20px;
                }

                .sjbt {
                    padding-left: 30px;
                    color: red;
                    cursor: pointer;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;

                    & > span:first-child {
                        margin-right: 10px;
                    }
                }

                .sjbt.alarmed {
                    color: #333;
                }
            }

            .libg {
                background-color: #f1f1f1;
            }
        }
    }

    .footer {
        position: fixed;
        bottom: 0;
        width: 100%;
        height: 50px;
        background-color: rgb(1, 105, 225, 0.05);
    }
}
</style>
