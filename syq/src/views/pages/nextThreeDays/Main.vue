<template>
    <div class="details">
        <el-tabs v-model="data.type" type="card">
            <el-tab-pane name="未来降雨" label="未来降雨">
                <el-row style="padding-top: 5px;">
                    <el-col :span="24"
                        ><span
                            style="margin-left: 5px;cursor: pointer;font-weight: bold;border: 1px solid #eee;
    padding: 2px 5px;
    color: rgb(0, 0, 0);"
                            @click="handleForcastImg"
                            ><i class="el-icon-loading"></i>查看未来降雨</span
                        ></el-col
                    >
                </el-row>
                <el-row class="options-top">
                    <el-col :span="9">
                        <span>机构</span>
                        <el-select
                            size="small"
                            v-model="options.govern"
                            @change="changeRegin"
                        >
                            <el-option value="1" label="中国" />
                            <el-option value="2" label="日本" />
                            <el-option value="6" label="欧洲" />
                            <el-option
                                value="3"
                                label="浙江"
                                v-if="$utils.checkUser(userInfo.roles, 'super')"
                            />
                        </el-select>
                    </el-col>
                    <el-col :span="9">
                        <span>时段</span>
                        <el-select
                            size="small"
                            v-model="options.dateRange"
                            @change="updateParams"
                        >
                            <el-option value="1" label="1小时" />
                            <el-option value="3" label="3小时" />
                            <el-option value="6" label="6小时" />
                            <el-option value="12" label="12小时" />
                            <el-option value="24" label="一天" />
                            <el-option value="48" label="二天" />
                            <el-option value="72" label="三天" />
                            <el-option value="96" label="四天" />
                            <el-option value="120" label="五天" />
                        </el-select>
                    </el-col>
                    <el-button
                        size="mini"
                        type="primary"
                        icon="el-icon-search"
                        class="el-button-search"
                        style="margin-left: 10px;"
                        @click="getData"
                        >查询</el-button
                    >
                </el-row>
                <el-row class="options-opacity">
                    <el-col :span="5">
                        <!-- <el-checkbox v-model="regionsForRenderShow">网格</el-checkbox> -->
                        <el-switch
                            v-model="regionsForRenderShow"
                            @change="updateRegionsForRender"
                            inactive-text="网格"
                            size="mini"
                            :width="30"
                        ></el-switch>
                    </el-col>
                    <el-col :span="5">
                        <!-- <el-checkbox v-model="regionsForRenderShow">网格</el-checkbox> -->
                        <el-switch
                            v-model="options.pointState"
                            @change="changePointState(options.pointState)"
                            inactive-text="站点"
                            size="mini"
                            :width="30"
                        ></el-switch>
                    </el-col>
                    <el-col :span="14">
                        <span style="float:left;">图层透明度</span>
                        <el-slider
                            v-model="options.slider"
                            :step="10"
                            show-stops
                            style="width: 100px;float: left"
                            @change="updateRegionsForRender"
                        />
                    </el-col>
                </el-row>
                <div class="searchBar" style="line-height: 20px">
                    <span class="lb-item" style="color: #888">报汛等级:</span>
                    <el-checkbox-group v-model="options.checkList">
                        <el-checkbox label="中央" />
                        <el-checkbox label="省重点" />
                        <el-checkbox label="省一般" />
                        <el-checkbox label="其他" />
                        <!--
                        <el-checkbox label="山洪" />-->
                    </el-checkbox-group>
                </div>
                <el-row class="searchBar">
                    <div class="sel-btn" style="height: 30px">
                        <span
                            class="btn"
                            :class="options.overLine == 0 ? 'act' : ''"
                            @click="(options.overLine = 0), changeNextLegend(1)"
                            style="height: 29px; cursor: pointer"
                            >雨情</span
                        >
                        <span
                            class="btn"
                            :class="options.overLine == 1 ? 'act' : ''"
                            @click="(options.overLine = 1), changeNextLegend(2)"
                            style="height: 29px; cursor: pointer"
                            >水情</span
                        >
                    </div>
                    <el-select
                        v-if="options.overLine == 0"
                        class="searchItem"
                        style="width: 100px"
                        v-model="options.beforeList.default"
                        placeholder="请选择"
                    >
                        <el-option
                            v-for="item in options.beforeList.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-input
                        class="searchItem"
                        style="width: 100px; margin: 0 5px"
                        v-model="options.inputVal"
                        placeholder="站名、站码、拼音码"
                        @keyup.enter.native="getMapData"
                    />
                </el-row>
                <div
                    class="searchBar"
                    v-if="options.beforeList.default == 'zdy'"
                >
                    <span style="margin-left: 5px">起：</span>
                    <el-date-picker
                        class="searchItem no-pl"
                        style="width: 140px"
                        v-model="options.current.start"
                        type="datetime"
                        prefix-icon="-"
                        :clearable="false"
                        @change="getStartTime"
                    />
                    <span style="margin-left: 5px">止：</span>
                    <el-date-picker
                        class="searchItem no-pl"
                        style="width: 140px"
                        v-model="options.current.end"
                        type="datetime"
                        prefix-icon="-"
                        :clearable="false"
                        @change="getEndTime"
                    />
                </div>
                <el-row class="options-title" style="height: 32px;">
                    <span
                        style="margin-right: 10px; position: relative; top: 6px;"
                        >网格降雨(mm)</span
                    >
                    <img
                        v-if="$utils.checkUser(userInfo.roles, 'super')"
                        src="../../../assets/button/export-excel.png"
                        @click="handleExport"
                        class="export-button__img"
                        alt="导出"
                    />
                </el-row>
                <el-table
                    highlight-current-row
                    stripe
                    border
                    style="width:100%"
                    :empty-text="table.emptyText"
                    :data="table.tbData"
                    :height="heightMixin"
                    v-loading="options.loading"
                    @row-click="handleRowClick"
                >
                    <el-table-column type="index" width="50" label="序" />
                    <el-table-column
                        v-for="(item, index) in table.thData"
                        :prop="item.prop"
                        :label="item.label"
                        :key="index"
                    />
                </el-table>
            </el-tab-pane>
            <el-tab-pane
                name="气象雷达"
                label="气象雷达"
                v-if="pagesShow['气象雷达']"
            >
                <weatherRadar></weatherRadar>
            </el-tab-pane>
            <el-tab-pane
                name="风暴潮"
                label="风暴潮"
                v-if="pagesShow['风暴潮']"
            >
                <storm-surge></storm-surge>
            </el-tab-pane>
        </el-tabs>
        <el-dialog
            class="do-not-use"
            :fullscreen="false"
            :modal="false"
            :show-close="false"
            :visible="overlayState.visible"
        >
            <Overlay :prop="overlayState.data" />
        </el-dialog>

        <el-dialog
            class="do-not-use-5"
            :fullscreen="false"
            :modal="false"
            :show-close="false"
            :visible="imgViewer.visible"
            v-if="imgViewer.visible"
        >
            <ImgViewer :visible.sync="imgViewer.visible" />
        </el-dialog>
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from "vue-property-decorator";
    import { State, Mutation, namespace } from "vuex-class";
    import Overlay from "./Overlay.vue";
    import ImgViewer from "./ImgViewer.vue";
    import moment from "moment";
    import "../../../styles/mapView/right.scss";
    import AutoHeightMixin from "../../../mixins/autoHeight";
    import weatherRadar from "../weatherRadar/Main.vue";
    import stormSurge from "../stormSurge/Main.vue";
    interface RowConfig {
        rn: number;
        id: number;
    }
    const MapStore = namespace("mapCommon");
    @Component({
        components: {
            Overlay,
            ImgViewer,
            weatherRadar,
            stormSurge
        }
    })
    export default class NextThreeDays extends AutoHeightMixin {
        @State("netGrid") netGrid: any;
        @State("userInfo") userInfo: any;
        @State("pagesShow") pagesShow: any;
        @Mutation("getCenter") getCenterMutation!: Function;
        @Mutation("getZoom") getZoomMutation!: Function;
        @Mutation("updateMapPoints") updateMapPointsMutation!: Function;
        @Mutation("updateNextThreeRender")
        updateNextThreeRenderMutation!: Function;
        @Mutation("changeNextLegend") changeNextLegend: any;
        @Mutation("getSelectID") getSelectID!: Function;
        @State(state => state.map.overlay) overlayState!: boolean;
        @Mutation("updateForLayer") updateForLayer!: Function;
        @Mutation setFutureImgUrl!: Function;
        @Mutation("setGlobalLoading") setGlobalLoading!: Function;
        @MapStore.Mutation("updateOverlay") updateOverlayMutation!: any;
        data: any = {
            type: "未来降雨"
        };
        options: any = {
            govern: "2",
            dateRange: "48",
            checkList: ["中央"],
            slider: 40,
            regions: [],
            overLine: 0,
            inputVal: "",
            beforeList: {
                default: "1",
                arr: [
                    { label: "近1小时", value: "0" },
                    { label: "前1小时", value: "1" },
                    { label: "前2小时", value: "2" },
                    { label: "前3小时", value: "3" },
                    { label: "前6小时", value: "6" },
                    { label: "前12小时", value: "12" },
                    { label: "前1天", value: "24" },
                    { label: "前2天", value: "48" },
                    { label: "前3天", value: "72" },
                    { label: "自定义", value: "zdy" }
                ]
            },
            loading: false,
            pointState: true,
            current: {
                start: Date.now() - 7 * 24 * 3600 * 1000,
                end: Date.now()
            } //预设当前时间
        };
        table: any = {
            thData: [
                {
                    prop: "num",
                    label: "网格编号"
                },
                {
                    prop: "rainfall",
                    label: "未来降雨"
                }
            ],
            tbData: [],
            emptyText: ""
        };
        points: any = [];
        dialog: any = {
            visible: false,
            data: {}
        };
        imgViewer: any = {
            visible: false
        };
        zjNetGridUrl: string = "";
        regionsForRenderShow: boolean = true;

        created() {
            this.getData();
            this.autoHeightMixin(375, false);
            this.updateParams();
        }

        getStartTime(val: any) {
            if (
                Number(this.options.current.end) - Number(val) >
                7 * 24 * 3600 * 1000
            ) {
                if (!this.$utils.checkUser(this.userInfo.roles, "super")) {
                    this.$message("间隔时长不能超过7天！");
                    this.options.current.start =
                        Number(this.options.current.end) - 7 * 24 * 3600 * 1000;
                } else {
                    this.options.current.start = val.getTime();
                }
            }
        }

        getEndTime(val: any) {
            if (
                Number(val) - Number(this.options.current.start) >
                7 * 24 * 3600 * 1000
            ) {
                if (!this.$utils.checkUser(this.userInfo.roles, "super")) {
                    this.$message("间隔时长不能超过7天！");
                    this.options.current.end =
                        Number(this.options.current.start) +
                        7 * 24 * 3600 * 1000;
                } else {
                    this.options.current.end = val.getTime();
                }
            }
        }

        // 请求两个接口
        getData(): void {
            this.getTableData();
            this.getMapData();
            this.getZjNetGrid();
        }

        // 获取列表数据
        getTableData(): void {
            this.table.tbData = [];
            this.options.loading = true;
            const { dateRange, govern } = this.options;
            this.table.emptyText = ".";

            const params = {
                et: moment()
                    .add(dateRange, "hour")
                    .format("YYYY-MM-DD HH:mm:ss"),
                st: moment().format("YYYY-MM-DD HH:mm:ss"),
                unitname: govern
            };
            this.$http("/rest/weatherForecast/getFutureRainfall", {
                params
            }).then(({ data }: { data: RowConfig[] }) => {
                if (data.length) {
                    data.forEach((item: any) => {
                        this.table.tbData.push({
                            num: item.id,
                            rainfall: item.rn
                        });
                    });
                }
                this.updateRegionsForRender();
                this.table.emptyText = "暂无数据";
                this.options.loading = false;
            });
        }

        changeRegin() {
            this.updateParams();
            this.getZjNetGrid();
            this.getData();
        }

        getZjNetGrid() {
            let params = {
                zoneID: "330000",
                startTm: moment().format("YYYY-MM-DD HH:mm:ss"),
                endTm: moment()
                    .add(this.options.dateRange, "hour")
                    .format("YYYY-MM-DD HH:mm:ss"),
                DataSource: 2,
                unitName: "1"
            };

            this.$http
                .post("/rest/weatherForecast/transmitRainWg", params)
                .then(res => {
                    this.zjNetGridUrl = res.data.data.datas.imgContent;
                    this.setZjNetGrid();
                });
        }
        setZjNetGrid() {
            let obj = {
                show: this.regionsForRenderShow,
                opacity: this.options.slider / 100,
                url: this.zjNetGridUrl
            };
            this.setFutureImgUrl(obj);
        }
        //
        updateParams() {
            const data = {
                govern: this.options.govern,
                dateRange: this.options.dateRange
            };
            this.updateForLayer({ data });
        }

        // 获取地图图层数据
        async getMapData() {
            this.points = [];
            this.options.regions = [];
            this.updateMapPointsMutation({ data: [] });
            const {
                dateRange,
                govern,
                checkList,
                inputVal,
                overLine
            } = this.options;
            let params: any, url: string;
            // 报汛等级
            const checkArr: number[] = [];
            if (checkList.length) {
                checkList.forEach((item: string) => {
                    switch (item) {
                        case "中央":
                            checkArr.push(1);
                            break;
                        case "省重点":
                            checkArr.push(2);
                            break;
                        case "省一般":
                            checkArr.push(3);
                            break;
                        case "其他":
                            checkArr.push(4);
                            break;
                        case "山洪":
                            checkArr.push(5);
                            break;
                    }
                });
            }
            let stDate,
                edDate,
                currentHour = moment().format("YYYY-MM-DDTHH:mm") + ":00";
            if (this.options.beforeList.default == "zdy") {
                if (typeof this.options.current.start == "number") {
                    this.options.current.start = new Date(
                        this.options.current.start
                    );
                }
                if (typeof this.options.current.end == "number") {
                    this.options.current.end = new Date(
                        this.options.current.end
                    );
                }
                stDate = this.$utils.dateFormat(
                    this.options.current.start,
                    "yyyy-MM-ddTHH:mm:ss"
                );
                edDate = this.$utils.dateFormat(
                    this.options.current.end,
                    "yyyy-MM-ddTHH:mm:ss"
                );
            } else if (this.options.beforeList.default == "0") {
                // currentHour
                stDate = this.$utils.dateFormat(
                    new Date(currentHour),
                    "yyyy-MM-ddTHH:mm:ss"
                );
                edDate = this.$utils.dateFormat(
                    new Date(),
                    "yyyy-MM-ddTHH:mm:ss"
                );
            } else {
                console.log(this.options.beforeList.default, currentHour);
                stDate = moment(currentHour)
                    .subtract(this.options.beforeList.default, "hour")
                    .format("YYYY-MM-DDTHH:mm:ss");
                edDate = moment(currentHour).format("YYYY-MM-DDTHH:mm:ss");
            }
            if (overLine) {
                params = {
                    areaFlag: 1, //地区标识（1行政区2流域）
                    sss: "", //地级市
                    ssx: "", //地级县
                    zl: "RR,ZZ,ZQ,TT,DD", //站类选择
                    sklx: "1,2,3,4,5,9", //水库类型
                    ly: "", //流域（水系）
                    sfcj: 0, //是否超警0所有1超警
                    bxdj: checkArr.join(","), //报汛等级
                    zm: inputVal,
                    flag: 1
                };
                if (this.userInfo.roles == "middle") {
                    delete params.flag;
                }
                url = "/rest/water/getNewDataList";
            } else {
                params = {
                    areaFlag: 1, //地区标识（1行政区2流域）
                    sss: "", //地级市
                    ssx: "", //地级县
                    st: stDate,
                    et: edDate,
                    ly: "", //流域（水系）
                    max: "", //前多少小时
                    min: 0,
                    bool: true,
                    bxdj: checkArr.join(","),
                    zm: inputVal,
                    type: 0,
                    lx: "QX,ME"
                };
                url = "/rest/rain/getTotalRainList";
            }
            this.setGlobalLoading(true);
            await this.$http(url, { params }).then(({ data }: any) => {
                if (overLine) {
                    for (let dataKey in data) {
                        let img: any = "";
                        switch (dataKey) {
                            case "cjj":
                                img = require("@/assets/legend/water_jjz.png");
                                break;
                            case "cbz":
                                img = require("@/assets/legend/water_bzz.png");
                                break;
                            case "cx":
                                img = require("@/assets/legend/water_xx.png");
                                break;
                            case "qt":
                                img = require("@/assets/legend/water_nz.png");
                                break;
                        }
                        data[dataKey].forEach((item: any) => {
                            this.points.push({
                                id: item.zh,
                                name: item.zm,
                                info: item,
                                lat: item.wd,
                                lon: item.jd,
                                govern: this.options.govern,
                                future: this.options.dateRange,
                                style: {
                                    image: {
                                        icon: {
                                            anchor: [0.5, 1],
                                            src: img,
                                            scale: 0.7
                                        }
                                    }
                                }
                            });
                            this.options.regions.push(item.zh);
                        });
                    }
                } else {
                    for (let dataKey in data) {
                        let img: any;
                        switch (dataKey) {
                            case "b0":
                                img = require("@/assets/legend/rain_null.png");
                                break;
                            case "b10":
                                img = require("@/assets/legend/rain_0.png");
                                break;
                            case "r10":
                                img = require("@/assets/legend/rain_10.png");
                                break;
                            case "r25":
                                img = require("@/assets/legend/rain_25.png");
                                break;
                            case "r50":
                                img = require("@/assets/legend/rain_50.png");
                                break;
                            case "r100":
                                img = require("@/assets/legend/rain_100.png");
                                break;
                            case "r250":
                                img = require("@/assets/legend/rain_250.png");
                                break;
                        }
                        data[dataKey].forEach((item: any) => {
                            this.points.push({
                                id: item.zh,
                                name: item.zm,
                                info: item,
                                lat: item.wd,
                                lon: item.jd,
                                govern: this.options.govern,
                                future: this.options.dateRange,
                                style: {
                                    image: {
                                        icon: {
                                            anchor: [0.5, 1],
                                            src: img,
                                            scale: 0.7
                                        }
                                    }
                                }
                            });
                            this.options.regions.push(item.zh);
                        });
                    }
                }
                this.updateMapPointsMutation({ data: this.points });
            });
            this.setGlobalLoading(false);
        }

        //隐藏地图点位
        changePointState(n: boolean) {
            if (n) {
                //this.getMapData();
                this.updateMapPointsMutation({ data: this.points });
            } else {
                this.updateMapPointsMutation({ data: [] });
            }
        }

        // 更新地图透明度
        updateRegionsForRender() {
            // console.log(this.regionsForRenderShow);
            let arr: any = {};
            this.table.tbData.forEach((item: any) => {
                arr[item.num] = item.rainfall;
            });
            this.updateNextThreeRenderMutation({
                data: arr,
                opacity: this.options.slider,
                show: this.regionsForRenderShow,
                type: this.options.govern,
                range: this.options.dateRange
            });
            if (this.zjNetGridUrl) {
                this.setZjNetGrid();
            }
        }

        // 点击表格行
        handleRowClick({ num }: any): void {
            let inArray = false;
            if (this.options.govern == 2) {
                this.netGrid.forEach((item: any) => {
                    if (typeof item[num] == "object") {
                        inArray = true;
                        const data = {
                            lon: item[num][0],
                            lat: item[num][1],
                            component: "NextThreeOverlayLayer",
                            offset: [-450, -430],
                            data: {
                                id: num
                            }
                        };
                        this.updateOverlayMutation({ data });
                        this.getZoomMutation(11);
                        this.getCenterMutation([
                            item[num][0],
                            item[num][1] + 0.1
                        ]);
                    }
                });
                if (!inArray) {
                    this.$message("暂无该网格图层！");
                }
            }
        }

        // 导出
        handleExport() {
            const params = {
                et: moment()
                    .add(this.options.dateRange, "hour")
                    .format("YYYY-MM-DD HH:mm:ss"),
                st: moment().format("YYYY-MM-DD HH:mm:ss"),
                unitname: this.options.govern
            };
            const url = this.$utils.formatURL(
                "/rest/weatherForecast/leadoutFutureRainfall",
                params
            );
            window.open(url);
        }

        // 查看预报图片
        handleForcastImg() {
            this.imgViewer.visible
                ? (this.imgViewer.visible = false)
                : (this.imgViewer.visible = true);
        }
    }
</script>

<style lang="scss" scoped>
    .details {
        .tab {
            margin-top: -10px;
            padding: 0 10px;
            text-align: left;
            height: 40px;
            line-height: 40px;

            > span {
                margin-right: 20px;
                color: #0169e1;
                font-size: 14px;
            }

            //background-color: #0169e1;
            .el-input__inner {
                background-color: rgb(1, 105, 225, 0.05);
            }
        }

        .result {
            height: calc(100% - 300px);
        }

        .fr {
            margin-right: 20px;
            margin-top: 8px;
        }

        .options-title {
            padding-left: 10px;
            padding-right: 10px;

            span {
                margin-right: 10px;
                color: black;
                font-size: 16px;
            }

            img {
                float: right;
            }
        }

        .options-top {
            margin-top: 6px;

            span {
                margin-right: 10px;
                margin-left: 10px;
            }

            .el-select {
                width: 100px;
            }
        }

        .el-checkbox-group {
            margin-top: 10px;
            margin-left: 10px;
        }

        .options-opacity {
            margin-top: 6px;
            padding-left: 10px;

            .el-col-19 {
                display: flex;
            }

            .el-slider {
                width: 200px;
                margin-top: -5px;
                margin-left: 16px;
            }
        }
    }
</style>
