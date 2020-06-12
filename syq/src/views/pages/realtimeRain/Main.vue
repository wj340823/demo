<template>
    <vue-perfect-scrollbar class="details">
        <el-tabs v-model="data.type" type="card">
            <el-tab-pane name="实时雨情" label="实时雨情">
                <div class="searchBar" style="height: 30px;line-height: 30px;">
                    <span class="lb-item" style="color: #888888"
                        >数据来源:</span
                    >
                    <el-checkbox-group v-model="search.sourceList.default">
                        <el-checkbox
                            :label="item.label"
                            :key="index"
                            v-for="(item, index) in search.sourceList.arr"
                        ></el-checkbox>
                    </el-checkbox-group>

                    <el-checkbox
                        v-model="search.progress"
                        style="margin-left: 6px"
                        >过程查询
                    </el-checkbox>
                </div>
                <div class="searchBar">
                    <el-select
                        class="searchItem"
                        v-model="search.areaType.default"
                        placeholder="请选择"
                    >
                        <el-option
                            v-for="item in search.areaType.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        class="searchItem"
                        v-model="search.cityList.default"
                        v-if="search.areaType.default == '1'"
                        placeholder="请选择"
                        @change="changeCity"
                    >
                        <el-option
                            v-for="item in search.cityList.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                            @change="locateArea"
                        ></el-option>
                    </el-select>
                    <el-select
                        class="searchItem"
                        v-model="search.counties.default"
                        v-if="search.areaType.default == '1'"
                        placeholder="请选择"
                        :disabled="search.counties.disable"
                        @change="locateArea"
                    >
                        <el-option
                            v-for="item in search.counties.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        class="searchItem"
                        v-model="search.rivers.default"
                        v-if="search.areaType.default == '2'"
                        placeholder="请选择"
                        @change="locateArea"
                    >
                        <el-option
                            v-for="item in search.rivers.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        class="searchItem"
                        v-model="search.rivers1.default"
                        v-if="
                            search.areaType.default == '2' &&
                                search.rivers.default == '钱塘江'
                        "
                        placeholder="请选择"
                        @change="locateArea"
                    >
                        <el-option
                            v-for="(item, index) in search.rivers1.arr"
                            :key="index"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                </div>
                <div class="searchBar">
                    <el-select
                        class="searchItem"
                        v-model="search.beforeList.default"
                        placeholder="请选择"
                        @change="judgeBfType"
                        v-if="!search.progress"
                    >
                        <el-option
                            v-for="item in search.beforeList.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        v-if="search.progress"
                        class="searchItem"
                        v-model="search.timeList.default"
                        placeholder="请选择"
                        @change="changeTimeDefault"
                    >
                        <el-option
                            v-for="item in search.timeList.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        class="searchItem"
                        v-model="search.fwList.default"
                        placeholder="请选择"
                    >
                        <el-option
                            v-for="item in search.fwList.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-input-number
                        :disabled="search.fwList.default == 'empty'"
                        class="searchItem"
                        v-model="search.preValue"
                        controls-position="right"
                        :step="0.5"
                        :min="0"
                    ></el-input-number>
                </div>
                <div class="searchBar" v-if="search.progress">
                    <span class="controlTime" @click="controlTime(true)"
                        >前一{{ search.progressTime.type }}</span
                    >
                    <span style="color: #333;font-weight: bold">{{
                        search.progressTime.type == "小时"
                            ? search.progressTime.end
                            : search.progressTime.end.slice(0, -3)
                    }}</span>
                    <span class="controlTime" @click="controlTime(false)"
                        >后一{{ search.progressTime.type }}</span
                    >
                </div>
                <div
                    class="searchBar"
                    v-if="
                        search.beforeList.default == 'zdy' && !search.progress
                    "
                >
                    <span style="margin-left: 5px">起：</span>
                    <el-date-picker
                        class="searchItem no-pl"
                        style="width: 140px"
                        v-model="search.current.start"
                        type="datetime"
                        :format="
                            $utils.checkUser(userInfo.roles, 'super')
                                ? 'yyyy-MM-dd HH:mm'
                                : 'yyyy-MM-dd HH'
                        "
                        prefix-icon="-"
                        :clearable="false"
                        @change="getStartTime"
                    />
                    <span style="margin-left: 5px">止：</span>
                    <el-date-picker
                        class="searchItem no-pl"
                        style="width: 140px;"
                        v-model="search.current.end"
                        type="datetime"
                        prefix-icon="-"
                        :format="
                            $utils.checkUser(userInfo.roles, 'super')
                                ? 'yyyy-MM-dd HH:mm'
                                : 'yyyy-MM-dd HH'
                        "
                        :clearable="false"
                        @change="getEndTime"
                    />
                </div>
                <div
                    class="searchBar"
                    style="line-height: 20px;margin-bottom: 0"
                >
                    <span class="lb-item" style="color: #888">报汛等级:</span>
                    <el-checkbox-group v-model="search.checkList">
                        <el-checkbox label="中央" />
                        <el-checkbox label="省重点" />
                        <el-checkbox label="省一般" />
                        <el-checkbox label="其他" />
                        <el-checkbox label="山洪" />
                    </el-checkbox-group>
                </div>
                <div class="searchBar">
                    <el-input
                        class="searchItem"
                        style="width: 198px"
                        v-model="search.inputVal"
                        placeholder="站名、站码、拼音码"
                    ></el-input>
                    <el-button
                        size="mini"
                        type="primary"
                        icon="el-icon-search"
                        class="el-button-search"
                        @click="searchAll"
                        >查询
                    </el-button>
                    <img
                        v-if="$utils.checkUser(userInfo.roles, 'super')"
                        src="../../../assets/button/export-excel.png"
                        @click="handleExport"
                        class="export-button__img"
                        alt="导出"
                    />
                </div>
                <div class="tab">
                    <div
                        class="item"
                        style="border-right: 1px solid #ddd;"
                        :class="result.type ? 'act' : ''"
                        @click="result.type = true"
                    >
                        雨量信息（mm）
                        <span v-if="result.type"></span>
                    </div>
                    <div
                        class="item"
                        :class="result.type ? '' : 'act'"
                        @click="gotoFqModular"
                    >
                        分区统计（mm）
                        <span v-if="!result.type"></span>
                    </div>
                </div>
                <div class="result">
                    <!-- <div v-if="!result.type">
                        <div class="fzBtn" @click="getFqResult">统计</div>
                        <div class="fzBtn" @click="handleZoneExport">导出</div>
                    </div>-->
                    <el-table
                        :data="result.tjData"
                        row-key="area"
                        border
                        v-loading="result.loading"
                        v-show="!result.type"
                        stripe
                        tooltip-effect="dark"
                        :tree-props="{
                            children: 'children',
                            hasChildren: 'hasChildren'
                        }"
                        :height="heightMixin"
                    >
                        <el-table-column
                            show-overflow-tooltip
                            v-for="(item, index) in result.thList.fqtj"
                            :prop="item.value"
                            :fixed="item.fixed"
                            :label="item.label"
                            :key="index"
                            :width="item.width || ''"
                        />
                    </el-table>
                    <TreeTable
                        :thList="result.thList.ylxx"
                        :tbData="result.tbDate"
                        :kinds="result.kinds"
                        :loading="result.loading"
                        :indexT="index"
                        v-show="result.type"
                        :view-length="17"
                        :view-height="viewHeight"
                        :x-scroll="false"
                        @getPoints="changePoint"
                        :timeType="search.beforeList.default"
                    />
                </div>
            </el-tab-pane>
            <div
                class="searchBar"
                style="position: fixed; bottom: 43px;"
                v-show="result.type && !search.progress"
            >
                <span>范围选择:</span>
                <el-select
                    :disabled="search.fwList.default == 'empty'"
                    class="searchItem"
                    v-model="result.kindsName.default"
                    placeholder="请选择"
                    @change="changeFw"
                >
                    <el-option
                        v-for="item in result.kindsName.arr"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                </el-select>
            </div>
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
    </vue-perfect-scrollbar>
</template>

<script lang="ts">
    import "../../../styles/mapView/right.scss";
    import { TreeTable } from "@/components";
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import { State, Getter, Action, Mutation, namespace } from "vuex-class";
    import moment from "moment";
    import satelliteImages from "../satelliteImages/Main.vue";
    import weatherRadar from "../weatherRadar/Main.vue";
    import AutoHeightMixin from "../../../mixins/autoHeight";
    import stormSurge from "../stormSurge/Main.vue";

    const Height1 = 495,
        Height2 = 531;
    const level: any = [
        { label: "无数据", value: "无数据", range: null, index: 0 },
        { label: "小于10", value: "b10", range: "0~10", index: 0 },
        { label: "10~25", value: "r10", range: "10~25", index: 0 },
        { label: "25~50", value: "r25", range: "25~50", index: 0 },
        { label: "50~100", value: "r50", range: "50~100", index: 0 },
        { label: "100~250", value: "r100", range: "100~250", index: 0 },
        { label: "大于250", value: "r250", range: ">250", index: 0 }
    ];
    let cancelToken: any = null;
    @Component({
        components: { TreeTable, satelliteImages, stormSurge, weatherRadar }
    })
    export default class RealtimeRain extends AutoHeightMixin {
        @Prop() tbList: any;
        @State("userInfo") userInfo: any;
        @State("pagesShow") pagesShow: any;
        @Mutation("getSelectArea") getSelectArea: any;
        @Mutation("getCenter") getCenter: any;
        @Mutation("getPoint") getPoint!: Function;
        data: any = {
            type: "实时雨情",
            show: true
        };
        index: any = 0;
        viewHeight: number = 450;
        search: any = {
            progress: false, //过程
            refresh: true, //是否刷新
            interval: null,
            sourceList: {
                default: ["气象局", "水文遥测"],
                arr: [
                    { label: "气象局", value: "QX" },
                    { label: "水文遥测", value: "ME" }
                ]
            },
            timeList: {
                default: "1",
                arr: [
                    {
                        label: "逐时",
                        value: "1"
                    },
                    {
                        label: "逐日",
                        value: "2"
                    }
                ]
            }, //刷新间隔时间列表
            areaType: {
                default: "1",
                arr: [
                    {
                        label: "行政区划",
                        value: "1"
                    },
                    {
                        label: "流域",
                        value: "2"
                    }
                ]
            }, //区域类型。行政区划还是流域
            cityList: {
                default: "全部",
                arr: []
            }, //市列表
            counties: {
                default: "",
                disabled: false,
                arr: []
            }, //县列表
            rivers: {
                default: "",
                arr: []
            }, //河流列表
            rivers1: {
                default: "",
                arr: [
                    {
                        label: "浦阳江",
                        value: "GAE00000000RLPZ"
                    },
                    {
                        label: "钱塘江兰溪以上",
                        value: "GA2D0000000RLXZ"
                    },
                    {
                        label: "钱塘江衢州以上",
                        value: "GA000000000SQZZ"
                    },
                    {
                        label: "钱塘江金华以上",
                        value: "GABBBA00000RJHZ"
                    },
                    {
                        label: "曹娥江",
                        value: "GAFCC000000LDSB"
                    },
                    {
                        label: "分水江",
                        value: "GAD00000000LFSJ"
                    }
                ]
            }, //二级流域列表
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
            }, //前**小时列表
            fwList: {
                default: false,
                arr: []
            }, //筛选符号列表
            preValue: 0, //搜索前预设值
            checkList: ["中央", "省重点", "省一般", "其他", "山洪"],
            current: {
                start: Date.now() - 7 * 24 * 3600 * 1000,
                end: Date.now()
            }, //预设当前时间
            progressTime: {
                start: moment()
                    .subtract(1, "hour")
                    .format("YYYY-MM-DD HH"),
                end: moment().format("YYYY-MM-DD HH"),
                type: "小时"
            },
            setTimeStatus: true, //是否设置时间
            inputVal: "" //站名站码拼音码
        };
        result: any = {
            loading: false,
            type: true, //true 雨情 false 分区统计
            height: Height2,
            thList: {
                ylxx: [
                    {
                        label: "序",
                        value: "index",
                        width: 50
                    },
                    {
                        label: "市县",
                        value: "city",
                        width: 80
                    },
                    {
                        label: "站名",
                        value: "name",
                        width: 120
                    },
                    {
                        label: "雨量",
                        value: "val",
                        width: 120,
                        right: true
                    }
                ],
                fqtj: [
                    {
                        label: "地区",
                        value: "area",
                        fixed: "left",
                        width: 100
                    },
                    {
                        label: "面雨量",
                        value: "val",
                        fixed: "left",
                        width: 100
                    },
                    {
                        label: "0-10",
                        value: "b10"
                    },
                    {
                        label: ">10",
                        value: "r10"
                    },
                    {
                        label: ">25",
                        value: "r25"
                    },
                    {
                        label: ">50",
                        value: "r50"
                    },
                    {
                        label: ">100",
                        value: "r100"
                    },
                    {
                        label: ">250",
                        value: "r250"
                    }
                ]
            },
            //10 25 50 100 250 250以上
            kinds: [
                { label: "大于250", value: "r250", range: ">250", index: 0 },
                { label: "100~250", value: "r100", range: "100-250", index: 0 },
                { label: "50~100", value: "r50", range: "50~100", index: 0 },
                { label: "25~50", value: "r25", range: "25~50", index: 0 },
                { label: "10~25", value: "r10", range: "10~25", index: 0 },
                { label: "小于10", value: "b10", range: "0~10", index: 0 },
                { label: "无数据", value: "b0", range: null, index: 0 }
            ],
            kindsName: {
                default: "全部",
                arr: [
                    "全部",
                    "0~10",
                    "10~25",
                    "25~50",
                    "50~100",
                    "100-250",
                    ">250"
                ]
            },
            tbDate: {},
            points: [],
            tjData: []
        };
        dateFormat: any = "YYYY-MM-DDTHH:mm:ss";
        downloadURL: string = "";

        hideList() {
            this.$emit("closeRight");
        }

        changePoint(arr: any) {
            const vm = this;
            let img = "";
            setTimeout(() => {
                vm.result.points = [];
                this.getPoint(null);
                arr.forEach(function(item: any, index: number) {
                    if (item.val != "-" && item.val != null) {
                        if (Number(item.val) >= 250) {
                            img = "rain_250.png";
                        } else if (Number(item.val) >= 100) {
                            img = "rain_100.png";
                        } else if (Number(item.val) >= 50) {
                            img = "rain_50.png";
                        } else if (Number(item.val) >= 25) {
                            img = "rain_25.png";
                        } else if (Number(item.val) >= 10) {
                            img = "rain_10.png";
                        } else if (Number(item.val) >= 0) {
                            img = "rain_0.png";
                        }
                    } else {
                        img = "rain_null.png";
                    }
                    item.info.img = img;
                    vm.result.points.push(item.info);
                });
                this.$emit("getPoints", vm.result.points);
            });
        }

        gotoFqModular() {
            if (
                this.search.fwList.default != "empty" &&
                this.search.progress == false
            ) {
                this.result.type = false;
            } else {
                this.$message("无分区统计！");
            }
        }

        getStartTime(val: any) {
            let st: any;
            if (typeof val != "number") {
                st = new Date(val).getTime();
            } else {
                st = val;
            }
            let et = new Date(this.search.current.end).getTime();
            if (et - st > 7 * 24 * 3600 * 1000) {
                if (!this.$utils.checkUser(this.userInfo.roles, "super")) {
                    this.$message("间隔时长不能超过7天！");
                    this.search.current.start = et - 7 * 24 * 3600 * 1000;
                } else {
                    this.search.current.start = st;
                }
            } else {
                this.search.current.start = st;
            }
        }

        getEndTime(val: any) {
            let et: any;
            let st = new Date(this.search.current.start).getTime();
            if (typeof val != "number") {
                et = new Date(val).getTime();
            } else {
                et = val;
            }
            if (et - st > 7 * 24 * 3600 * 1000) {
                if (!this.$utils.checkUser(this.userInfo.roles, "super")) {
                    this.$message("间隔时长不能超过7天！");
                    this.search.current.end = st + 7 * 24 * 3600 * 1000;
                } else {
                    this.search.current.end = et;
                }
            } else {
                this.search.current.end = et;
            }
        }
        changeTimeDefault(val: any) {
            if (val == 1) {
                this.search.progressTime.type = "小时";
            } else {
                this.search.progressTime.type = "天";
            }
        }
        controlTime(bool: boolean) {
            let type, format;
            if (this.search.progressTime.type == "小时") {
                type = "hour";
                format = "YYYY-MM-DD HH";
            } else {
                type = "day";
                format = "YYYY-MM-DD 08";
            }
            if (bool) {
                this.search.progressTime.end = moment(
                    this.search.progressTime.end
                )
                    .subtract(1, type)
                    .format(format);
                this.search.progressTime.start = moment(
                    this.search.progressTime.end
                )
                    .subtract(1, type)
                    .format(format);
            } else {
                if (
                    moment(this.search.progressTime.end).format(format) !=
                    moment().format(format)
                ) {
                    this.search.progressTime.end = moment(
                        this.search.progressTime.end
                    )
                        .add(1, type)
                        .format(format);
                    this.search.progressTime.start = moment(
                        this.search.progressTime.end
                    )
                        .subtract(1, type)
                        .format(format);
                } else {
                    return;
                }
            }
            this.searchResult();
        }
        searchResult() {
            let self = this;
            let postbody: any = this.$utils.deepCopy(this.search);
            if (self.search.areaType.default == 1) {
                postbody.rivers.default = "";
                postbody.rivers1.default = "";
            } else {
                postbody.cityList.default = "";
                postbody.counties.default = "";
            }
            this.getPoint(null);
            let type;
            if (postbody.progress) {
                type = postbody.timeList.default;
            } else {
                type = 0;
            }

            //获取当前小时
            function addZone(n: any) {
                if (n < 10) {
                    return "0" + n;
                } else {
                    return n;
                }
            }

            let currentHour = moment().format("YYYY-MM-DD HH") + ":00:00";
            let stDate, edDate;
            //
            if (!postbody.progress) {
                if (postbody.beforeList.default == "zdy") {
                    if (typeof postbody.current.start == "number") {
                        postbody.current.start = new Date(
                            postbody.current.start
                        );
                    }
                    if (typeof postbody.current.end == "number") {
                        postbody.current.end = new Date(postbody.current.end);
                    }
                    stDate = this.$utils.dateFormat(
                        postbody.current.start,
                        "yyyy-MM-ddTHH:mm:ss"
                    );
                    edDate = this.$utils.dateFormat(
                        postbody.current.end,
                        "yyyy-MM-ddTHH:mm:ss"
                    );
                } else if (postbody.beforeList.default == "0") {
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
                    console.log(postbody.beforeList.default, currentHour);
                    stDate = moment(currentHour)
                        .subtract(postbody.beforeList.default, "hour")
                        .format("YYYY-MM-DDTHH:mm:ss");
                    edDate = moment(currentHour).format("YYYY-MM-DDTHH:mm:ss");
                }
            } else {
                stDate = this.search.progressTime.start;
                edDate = this.search.progressTime.end;
            }

            let str = "";
            if (postbody.checkList.length != 0) {
                postbody.checkList.forEach(function(s: any) {
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
            }
            if (postbody.cityList.default == "全部") {
                postbody.cityList.default = "";
            }
            if (postbody.counties.default == "全市") {
                postbody.counties.default = "";
            }
            let lx: any = [];
            postbody.sourceList.default.includes("气象局")
                ? lx.push("QX")
                : null;
            postbody.sourceList.default.includes("水文遥测")
                ? lx.push("ME")
                : null;
            let ly: any;
            if (
                postbody.rivers.default == "钱塘江" &&
                postbody.rivers1.default != ""
            ) {
                ly = postbody.rivers.default + "," + postbody.rivers1.default;
            } else {
                ly = postbody.rivers.default;
            }

            let city = "";
            postbody.cityList.arr.forEach((item: any) => {
                if (item.value == postbody.cityList.default) {
                    city = item.label;
                }
            });
            let county = "";
            if (
                postbody.counties.default &&
                postbody.counties.default != "全市"
            ) {
                postbody.counties.arr.forEach((item: any) => {
                    if (item.value == postbody.counties.default) {
                        county = item.label;
                    }
                });
            } else {
                postbody.counties.default = "";
            }
            let params: any = {
                areaFlag: postbody.areaType.default, //地区标识（1行政区2流域）
                sss: city, //地级市
                ssx: county, //地级县
                st: stDate,
                et: edDate,
                ly: ly, //流域（水系）
                max: "", //前多少小时
                min: postbody.preValue,
                bool: postbody.fwList.default,
                bxdj: str,
                zm: postbody.inputVal,
                type: type,
                lx: lx.join(",")
            };
            self.result.points = [];
            if (cancelToken) {
                cancelToken();
            }
            if (str == "") {
                this.$message("请选择报汛等级！");
            } else {
                self.result.loading = true;
                this.$http
                    .get("/rest/rain/getTotalRainList", {
                        params: params,
                        cancelToken: new this.$http.CancelToken(cancel => {
                            cancelToken = cancel;
                        })
                    })
                    .then(res => {
                        self.result.loading = false;
                        const obj: any = {};
                        for (let key in res.data) {
                            obj[key] = [];
                            if (res.data[key].length > 0) {
                                let img: any = "";
                                switch (key) {
                                    case "b0":
                                        img = "rain_null.png";
                                        break;
                                    case "b10":
                                        img = "rain_0.png";
                                        break;
                                    case "r10":
                                        img = "rain_10.png";
                                        break;
                                    case "r25":
                                        img = "rain_25.png";
                                        break;
                                    case "r50":
                                        img = "rain_50.png";
                                        break;
                                    case "r100":
                                        img = "rain_100.png";
                                        break;
                                    case "r250":
                                        img = "rain_250.png";
                                        break;
                                }
                                res.data[key].forEach(function(
                                    item: any,
                                    index: number
                                ) {
                                    item.yl =
                                        item.yl !== null
                                            ? Number(item.yl).toFixed(1)
                                            : "-";
                                    obj[key].push({
                                        index: index + 1,
                                        city:
                                            (item.sss
                                                ? item.sss.slice(0, 1) + "-"
                                                : "") +
                                            (item.ssx
                                                ? item.ssx.slice(0, 2)
                                                : ""),
                                        val: item.yl,
                                        name: item.zm,
                                        lon: item.jd,
                                        lat: item.wd,
                                        zh: item.zh,
                                        info: item,
                                        counties: item.ssx
                                    });
                                    item.img = img;
                                    self.result.points.push(item);
                                });
                            }
                        }
                        self.result.tbDate = obj;
                        this.index++;
                        //this.$emit("getPoints", self.result.points);
                    });
            }
        }

        getFqResult() {
            let vm = this;
            let postbody: any = this.$utils.deepCopy(this.search);
            let currentHour = moment().format("YYYY-MM-DD HH") + ":00:00";
            let stDate, edDate;
            if (postbody.beforeList.default == "zdy") {
                if (typeof postbody.current.start == "number") {
                    postbody.current.start = new Date(postbody.current.start);
                }
                if (typeof postbody.current.end == "number") {
                    postbody.current.end = new Date(postbody.current.end);
                }
                stDate = this.$utils.dateFormat(
                    postbody.current.start,
                    "yyyy-MM-ddTHH:mm:ss"
                );
                edDate = this.$utils.dateFormat(
                    postbody.current.end,
                    "yyyy-MM-ddTHH:mm:ss"
                );
            } else if (postbody.beforeList.default == "0") {
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
                console.log(postbody.beforeList.default, currentHour);
                stDate = moment(currentHour)
                    .subtract(postbody.beforeList.default, "hour")
                    .format("YYYY-MM-DDTHH:mm:ss");
                edDate = moment(currentHour).format("YYYY-MM-DDTHH:mm:ss");
            }
            let params = {
                areaFlag: postbody.areaType.default,
                st: stDate,
                et: edDate
            };
            vm.result.tjData = [];
            this.result.loading = true;

            this.$http
                .get("/rest/rain/getStatisticsRain", { params })
                .then(res => {
                    this.result.loading = false;
                    if (postbody.areaType.default == 1) {
                        res.data.forEach((child: any, i: number) => {
                            vm.result.tjData.push({
                                area: child.pro,
                                val: child.myl,
                                b10: child.b10,
                                r10: child.r10,
                                r25: child.r25,
                                r50: child.r50,
                                r100: child.r100,
                                r250: child.r250,
                                children: []
                            });
                            child.children.forEach(function(
                                item: any,
                                index: number
                            ) {
                                vm.result.tjData[i].children.push({
                                    area: item.sss,
                                    val: item.myl,
                                    b10: item.b10,
                                    r10: item.r10,
                                    r25: item.r25,
                                    r50: item.r50,
                                    r100: item.r100,
                                    r250: item.r250,
                                    children: []
                                });
                                item.children.forEach(function(data: any) {
                                    vm.result.tjData[i].children[
                                        index
                                    ].children.push({
                                        area: data.ssx,
                                        val: data.myl,
                                        b10: data.b10,
                                        r10: data.r10,
                                        r25: data.r25,
                                        r50: data.r50,
                                        r100: data.r100,
                                        r250: data.r250
                                    });
                                });
                            });
                        });
                    } else {
                        res.data.forEach(function(item: any, index: number) {
                            vm.result.tjData.push({
                                area: item.pro,
                                val: item.myl,
                                b10: item.b10,
                                r10: item.r10,
                                r25: item.r25,
                                r50: item.r50,
                                r100: item.r100,
                                r250: item.r250
                            });
                        });
                        res.data[0].children.forEach(function(
                            item: any,
                            index: number
                        ) {
                            vm.result.tjData.push({
                                area: item.ly,
                                val: item.myl,
                                b10: item.b10,
                                r10: item.r10,
                                r25: item.r25,
                                r50: item.r50,
                                r100: item.r100,
                                r250: item.r250
                            });
                        });
                    }

                    //console.log(vm.result.tjData)
                });
        }

        searchAll() {
            this.searchResult();
            if (this.search.fwList.default != "empty") {
                this.getFqResult();
            }
        }

        judgeBfType(val: any) {
            if (val == "zdy") {
                this.result.height = Height1;
                this.viewHeight = 485;
            } else {
                this.result.height = Height2;
                this.viewHeight = 450;
            }
        }

        async getArea(areaFlag: any) {
            let vm = this;
            await this.$http
                .get("/rest/basic/getAreaList?areaFlag=" + areaFlag)
                .then(function(res: any) {
                    if (areaFlag == 1) {
                        vm.search.cityList.arr = [{ label: "全部", value: "" }];
                    } else if (areaFlag == 2) {
                        vm.search.rivers.arr = [{ label: "全部", value: "" }];
                    }
                    res.data.forEach(function(item: any, index: number) {
                        if (areaFlag == 1) {
                            vm.search.cityList.arr.push({
                                label: item.sss,
                                value: item.id
                            });
                        } else if (areaFlag == 2) {
                            vm.search.rivers.arr.push({
                                label: item.ly,
                                value: item.ly
                            });
                        }
                    });
                    //console.log(vm.search.cityList)
                    //vm.search.cityList
                });
        }

        async changeCity(city: any) {
            let self = this;
            let obj: any;
            self.search.cityList.arr.forEach(function(item: any) {
                if (item.value == city) {
                    obj = item;
                }
            });
            let params: any = {
                areaFlag: 1,
                city: obj.label
            };
            self.search.counties.disable = false;
            await this.$http
                .get("/rest/basic/getAreaList", { params: params })
                .then(function(res: any) {
                    if (city.slice(2, 4) != "00") {
                        self.search.counties.default = "";
                        self.search.counties.arr = [
                            { label: "全市", value: "全市" }
                        ];
                    } else {
                        self.search.counties.default = "";
                        self.search.counties.arr = [];
                        self.search.counties.disable = true;
                    }
                    res.data.forEach(function(item: any) {
                        self.search.counties.arr.push({
                            label: item.ssx || item.CITY,
                            value: item.id
                        });
                    });
                });
            self.locateArea(obj.value);
        }

        changeFw(item: any) {
            if (item == "全部") {
                this.result.kinds = this.$utils.deepCopy(level.reverse());
            } else {
                let obj: any;
                this.result.kinds = this.$utils.deepCopy(level);
                this.result.kinds.forEach(function(data: any) {
                    if (data.range == item) {
                        obj = data;
                    }
                });
                this.result.kinds = [obj];
            }
        }

        locateArea(item: any) {
            let self = this;
            let obj: any;
            if (item == "全部") {
                this.getSelectArea("全部");
            } else if (item == "全市") {
                this.getSelectArea(self.search.cityList.default);
            } else {
                self.search.cityList.arr.forEach(function(data: any) {
                    if (data.value == item) {
                        obj = data;
                        self.getSelectArea(obj.label + 0);
                    }
                });
                self.search.counties.arr.forEach(function(data: any) {
                    if (data.value == item && data.label != "全省") {
                        obj = data;
                        self.getSelectArea(obj.label + 1);
                    }
                });
                self.search.rivers.arr.forEach(function(data: any) {
                    if (data.value == item) {
                        obj = data;
                        self.search.rivers1.default = "";
                        self.getSelectArea(obj.label + 2);
                    }
                });
                self.search.rivers1.arr.forEach(function(data: any) {
                    if (data.value == item) {
                        obj = data;
                        self.getSelectArea(obj.value + 3);
                    }
                });
            }
            // if (obj.lon && obj.lat) {
            //     this.getCenter([obj.lon, obj.lat]);
            // }
        }

        setInter(n: number) {
            let vm = this;
            this.search.interval = setInterval(function() {
                vm.searchResult();
            }, n * 60 * 3600);
        }

        @Watch("search.areaType.default")
        interValStatus(n: string) {
            if (n == "1") {
                this.search.rivers.default = "";
                this.search.rivers1.default = "";
            } else {
                this.search.cityList.default = "";
                this.search.counties.default = "";
            }
        }

        @Watch("search.fwList.default")
        changeFwlist(n: any) {
            if (n == "empty") {
                this.result.type = true;
            }
        }

        @Watch("search.progress")
        changeProgress(n: any) {
            if (n == false) {
                this.result.type = true;
            }
        }

        // 导出函数
        handleExport(): void {
            const { type } = this.result;
            let url: string;

            if (type === true) url = this.handleRainExport();
            else url = this.handleZoneExport();

            window.open(url);
        }

        // 分区统计导出
        handleZoneExport(): string {
            const params = {
                areaFlag: this.search.areaType.default,
                st: moment()
                    .subtract(this.search.beforeList.default, "hour")
                    .format(this.dateFormat),
                et: moment().format(this.dateFormat)
            };
            const url = this.$utils.formatURL(
                "/rest/rain/LetoutStatisticsRain",
                params
            );
            return url;
        }

        // 雨量信息导出
        handleRainExport(): string {
            let self = this;
            let postbody: any = this.$utils.deepCopy(this.search);
            if (self.search.areaType.default == 1) {
                postbody.rivers.default = "";
                postbody.rivers1.default = "";
            } else {
                postbody.cityList.default = "";
                postbody.counties.default = "";
            }
            let type;
            if (postbody.progress) {
                type = postbody.timeList.default;
            } else {
                type = 0;
            }

            //获取当前小时
            function addZone(n: any) {
                if (n < 10) {
                    return "0" + n;
                } else {
                    return n;
                }
            }

            let currentHour =
                new Date().getFullYear() +
                "-" +
                addZone(new Date().getMonth() + 1) +
                "-" +
                addZone(new Date().getDate()) +
                " " +
                addZone(new Date().getHours()) +
                ":0000";
            let stDate, edDate;
            if (postbody.beforeList.default == "zdy") {
                stDate = this.$utils.dateFormat(
                    new Date(postbody.current.start),
                    "yyyy-MM-ddTHH:mm:ss"
                );
                edDate = this.$utils.dateFormat(
                    new Date(postbody.current.end),
                    "yyyy-MM-ddTHH:mm:ss"
                );
            } else if (postbody.beforeList.default == "0") {
                // currentHour
                stDate = this.$utils.dateFormat(
                    new Date(new Date().getTime() - 3600 * 1000),
                    "yyyy-MM-ddTHH:mm:ss"
                );
                edDate = this.$utils.dateFormat(
                    new Date(),
                    "yyyy-MM-ddTHH:mm:ss"
                );
            } else {
                stDate = this.$utils.dateFormat(
                    new Date(
                        new Date(currentHour).getTime() -
                            postbody.beforeList.default * 3600 * 1000
                    ),
                    "yyyy-MM-ddTHH:mm:ss"
                );
                edDate = this.$utils.dateFormat(
                    new Date(currentHour),
                    "yyyy-MM-ddTHH:mm:ss"
                );
            }
            let str = "";
            if (postbody.checkList.length != 0) {
                postbody.checkList.forEach(function(s: any) {
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
            }
            if (postbody.cityList.default == "全省") {
                postbody.cityList.default = "";
            }
            if (postbody.counties.default == "全市") {
                postbody.counties.default = "";
            }
            let lx: any = "";
            postbody.sourceList.default.forEach(function(item: any) {
                if (item == "气象台") {
                    lx += "QX,";
                } else {
                    lx += "ME,";
                }
            });

            let ly: any;
            if (
                postbody.rivers.default == "钱塘江" &&
                postbody.rivers1.default != ""
            ) {
                ly = postbody.rivers.default + "," + postbody.rivers1.default;
            } else {
                ly = postbody.rivers.default;
            }

            let params: any = {
                areaFlag: postbody.areaType.default, //地区标识（1行政区2流域）
                sss: postbody.cityList.default, //地级市
                ssx: postbody.counties.default, //地级县
                st: stDate,
                et: edDate,
                ly: ly, //流域（水系）
                max: "", //前多少小时
                min: postbody.preValue,
                bool: postbody.fwList.default,
                bxdj: str,
                zm: postbody.inputVal,
                type: type,
                lx: lx.slice(0, -1)
            };
            const copyParams = JSON.parse(JSON.stringify(params));
            copyParams.flag = 1;
            this.downloadURL = this.$utils.formatURL(
                "/rest/rain/leadoutTotalRainbook",
                copyParams
            );
            return this.downloadURL;
        }

        async created() {
            const vm = this;
            this.autoHeightMixin(395);
            if (this.$utils.checkUser(this.userInfo.roles, "super")) {
                this.search.fwList.arr = [
                    {
                        label: ">=",
                        value: true
                    },
                    {
                        label: ">",
                        value: false
                    },
                    {
                        label: "null",
                        value: "empty"
                    }
                ];
            } else {
                this.search.fwList.arr = [
                    {
                        label: ">=",
                        value: true
                    },
                    {
                        label: ">",
                        value: false
                    }
                ];
            }
            this.getArea("2");
            this.getArea("1").then(() => {
                if (vm.$utils.selectByCode()) {
                    if (vm.$utils.selectByCode().length == 4) {
                        vm.search.cityList.default =
                            vm.$utils.selectByCode() + "00";
                        this.changeCity(this.$utils.selectByCode() + "00");
                        this.searchResult();
                        this.getFqResult();
                    } else {
                        vm.search.cityList.default =
                            this.$utils.selectByCode().slice(0, 4) + "00";
                        this.changeCity(
                            this.$utils.selectByCode().slice(0, 4) + "00"
                        ).then(() => {
                            vm.search.counties.default = vm.$utils.selectByCode();
                            this.locateArea(this.$utils.selectByCode());
                            this.searchResult();
                            this.getFqResult();
                        });
                    }
                } else {
                    this.searchResult();
                    this.getFqResult();
                }
            });
        }

        mounted() {
            this.data.type = "实时雨情";
        }
    }
</script>

<style lang="scss">
    .searchItem {
        color: #ccc;
    }
</style>
