<template>
    <vue-perfect-scrollbar class="details">
        <!--<div class="title" style="margin-bottom: 0">
            {{ data.type }}
        </div>-->
        <el-tabs v-model="data.type" type="card">
            <el-tab-pane name="报汛流量" label="报汛流量">
                <div class="searchBar" style="margin-top: 6px">
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
                        @change="locateArea"
                        placeholder="请选择"
                    >
                        <el-option
                            v-for="item in search.rivers1.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                </div>
                <div class="searchBar" style="line-height: 24px">
                    <span class="lb-item" style="color: #888">站类选择:</span>
                    <el-checkbox-group v-model="search.zlxz.selected">
                        <el-checkbox
                            v-for="(item, index) in search.zlxz.list"
                            :label="item.label"
                            :key="index"
                            style="margin-right: 10px;"
                        />
                    </el-checkbox-group>
                </div>
                <div class="searchBar" style="line-height: 24px">
                    <span class="lb-item" style="color: #888">水库类型:</span>
                    <el-checkbox-group v-model="search.sklx.selected">
                        <el-checkbox
                            :label="item.label"
                            :key="index"
                            v-for="(item, index) in search.sklx.list"
                            :disabled="search.sklx.disable"
                        ></el-checkbox>
                    </el-checkbox-group>
                </div>
                <div class="searchBar">
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
                        style="width: 140px"
                        v-model="search.current.end"
                        type="datetime"
                        :format="
                            $utils.checkUser(userInfo.roles, 'super')
                                ? 'yyyy-MM-dd HH:mm'
                                : 'yyyy-MM-dd HH'
                        "
                        prefix-icon="-"
                        :clearable="false"
                        @change="getEndTime"
                    />
                </div>
                <div class="searchBar">
                    <el-input
                        class="searchItem"
                        style="width: 100px; margin: 0 5px"
                        v-model="search.inputVal"
                        placeholder="站名、站码、拼音码"
                        @keyup.enter.native="searchResult"
                    />
                    <el-button
                        size="mini"
                        type="primary"
                        icon="el-icon-search"
                        class="el-button-search"
                        @click="searchResult"
                        >查询
                    </el-button>
                </div>
                <div class="tab" style="text-align: left;padding-left: 15px">
                    <span>流量信息(m)</span>
                    <span
                        style="margin-left:10px;color: red"
                        v-if="search.warning != ''"
                        >{{ search.warning }}</span
                    >
                </div>
                <div class="result">
                    <el-table
                        ref="table"
                        v-loading="result.loading"
                        :data="result.tbData"
                        border
                        stripe
                        :height="heightMixin"
                        @cell-mouse-enter="hoverCell"
                        @cell-mouse-leave="leaveCell"
                    >
                        <el-table-column
                            type="index"
                            label="序"
                            width="50"
                            fixed
                        ></el-table-column>
                        <el-table-column
                            v-for="(item, index) in result.thList.ylxx"
                            :key="index"
                            :prop="item.value"
                            :width="item.width"
                            :fixed="item.fixed"
                            :label="item.label"
                            :sortable="item.sort"
                            show-overflow-tooltip
                        ></el-table-column>
                    </el-table>
                </div>
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
    </vue-perfect-scrollbar>
</template>

<script lang="ts">
    import "../../../styles/mapView/right.scss";
    import { TreeTable } from "@/components";
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import { State, Getter, Action, Mutation, namespace } from "vuex-class";
    import moment from "moment";
    import weatherRadar from "../weatherRadar/Main.vue";
    import AutoHeightMixin from "../../../mixins/autoHeight";
    import stormSurge from "../stormSurge/Main.vue";

    let cancelToken: any = null;

    //0-10  10-50  50-100  100-300   300-500 500-1000 1000-2000  2000-3000  3000-5000
    const level = [0, 10, 50, 100, 300, 500, 1000, 2000, 5000, 5000];
    const rainLevel = [300, 200, 100, 50, 0];
    @Component({
        components: { TreeTable, weatherRadar, stormSurge }
    })
    export default class RealtimeWater extends AutoHeightMixin {
        @State("pagesShow") pagesShow: any;
        @State("userInfo") userInfo: any;
        @Mutation("getSelectArea") getSelectArea: any;
        @Mutation getPoint!: any;
        @Mutation getFlowPoint!: any;
        @Mutation("setHoverPoint") setHoverPoint: any;
        data: any = {
            type: "报汛流量",
            show: true
        };
        index: number = 0;

        search: any = {
            refresh: false, //是否人工报汛,
            danger: false,
            inputVal: "",
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
                default: "",
                arr: []
            }, //市列表
            counties: {
                default: "",
                disable: false,
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
            checkList: ["中央", "省重点", "省一般", "山洪", "其他"],
            typeList: [
                { label: "中央" },
                { label: "省重点" },
                { label: "省一般" },
                { label: "山洪" },
                { label: "其他" }
            ],
            zlxz: {
                old: [],
                selected: ["水库", "河道", "堰闸"], //'水库' ,'河道' ,'堰闸', '潮汐'
                list: [{ label: "水库" }, { label: "河道" }, { label: "堰闸" }]
            }, //站类选择
            sklx: {
                old: [],
                selected: ["大型", "中型", "小一", "其他(含小二)"], //'大型' ,'中型' ,'小一', '其他(含小二)'
                list: [
                    { label: "大型" },
                    { label: "中型" },
                    { label: "小一" },
                    { label: "其他(含小二)" }
                ],
                disable: false
            }, //水库类型
            current: {
                start: Date.now() - 3 * 24 * 3600 * 1000,
                end: Date.now()
            },
            warning: ""
        };
        result: any = {
            loading: false,
            type: true, //true 雨情 false 分区统计
            //超警戒 超限 超保证 其他
            thList: {
                ylxx: [
                    {
                        label: "市县",
                        value: "city",
                        width: 65,
                        fixed: "left"
                    },
                    {
                        label: "站名",
                        value: "name",
                        width: 90,
                        sort: true,
                        fixed: "left"
                    },
                    {
                        label: "上报时间",
                        value: "time",
                        sort: true,
                        width: 120
                    },
                    {
                        label: "水位",
                        value: "sw",
                        sort: true,
                        width: 90
                    },
                    {
                        label: "流量",
                        value: "ll",
                        width: 70
                    },
                    {
                        label: "出库",
                        value: "ck",
                        width: 90
                    },
                    {
                        label: "入库",
                        value: "rk",
                        width: 90
                    }
                ]
            },
            tbData: []
        };

        hoverCell(row: any) {
            this.setHoverPoint(row);
        }

        leaveCell() {
            this.setHoverPoint(null);
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

        searchResult() {
            let self = this;
            let postbody: any = this.$utils.deepCopy(this.search);
            let str: string = "",
                zlxz: string = "",
                sklx: string = "";
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
            if (self.search.areaType.default == 1) {
                postbody.rivers.default = "";
                postbody.rivers1.default = "";
            } else {
                postbody.cityList.default = "";
                postbody.counties.default = "";
            }
            //水库RR 河道ZZ，ZQ 闸吧 DD 潮汐TT
            if (postbody.zlxz.selected.length) {
                postbody.zlxz.selected.forEach(function(s: any) {
                    switch (s) {
                        case "水库":
                            zlxz += "RR,";
                            break;
                        case "河道":
                            zlxz += "ZZ,ZQ,";
                            break;
                        case "堰闸":
                            zlxz += "DD,";
                            break;
                        case "潮汐":
                            zlxz += "TT,";
                            break;
                    }
                });
            }
            //'大型' ,'中型' ,'小一', '其他(含小二)'
            if (postbody.sklx.selected.length) {
                postbody.sklx.selected.forEach(function(s: any) {
                    switch (s) {
                        case "大型":
                            sklx += "4,5,";
                            break;
                        case "中型":
                            sklx += "3,";
                            break;
                        case "小一":
                            sklx += "2,";
                            break;
                        case "其他(含小二)":
                            sklx += "1,9,";
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
            let ly: any;
            if (
                postbody.rivers.default == "钱塘江" &&
                postbody.rivers1.default != ""
            ) {
                ly = postbody.rivers.default + "," + postbody.rivers1.default;
            } else {
                ly = postbody.rivers.default;
            }
            let stDate, edDate;
            if (typeof postbody.current.start != "object") {
                postbody.current.start = new Date(postbody.current.start);
            }
            if (typeof postbody.current.end != "object") {
                postbody.current.end = new Date(postbody.current.end);
            }
            stDate = this.$utils.dateFormat(
                postbody.current.start,
                "yyyy-MM-dd HH:mm:ss"
            );
            edDate = this.$utils.dateFormat(
                postbody.current.end,
                "yyyy-MM-dd HH:mm:ss"
            );
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
            let params: any;
            if (postbody.areaType.default == 1) {
                params = {
                    sss: city == "全部" ? "" : city, //地级市
                    ssx: county, //地级县
                    zl: zlxz, //站类选择
                    sklx: sklx, //水库类型
                    sfcj: postbody.overLine, //是否超警0所有1超警
                    bxdj: str, //报汛等级
                    zm: postbody.inputVal,
                    st: stDate,
                    et: edDate
                };
            } else {
                params = {
                    zl: zlxz, //站类选择
                    sklx: sklx, //水库类型
                    ly: ly, //流域（水系）
                    sfcj: postbody.overLine, //是否超警0所有1超警
                    bxdj: str, //报汛等级
                    zm: postbody.inputVal,
                    st: stDate,
                    et: edDate
                };
            }
            if (zlxz == "") {
                this.search.warning = "请选择站类！";
            } else if (zlxz.match("RR") != null && sklx == "") {
                this.search.warning = "请选择水库类型！";
            } else {
                if (cancelToken) {
                    cancelToken();
                }
                self.result.loading = true;
                self.result.tbData = [];
                this.$http
                    .get("/rest/water/getRgWaterDataList", {
                        params: params,
                        cancelToken: new this.$http.CancelToken(cancel => {
                            cancelToken = cancel;
                        })
                    })
                    .then(res => {
                        let img = require("@/assets/legend/rain_0.png");
                        let img1 = "";
                        let img2 = require("@/assets/legend/rain_0.png");
                        let img3 = require("@/assets/legend/rain_0.png");
                        this.search.warning = "";
                        self.result.loading = false;
                        let style: any = null;
                        let points: any = [];
                        res.data.forEach((item: any, i: number) => {
                            let name = item.zm;
                            if (item.zl != "RR") {
                                let swLevel = "1";
                                if (item.jjsw && item.sw > item.jjsw) {
                                    swLevel = "2";
                                }
                                if (item.bzsw && item.sw > item.bzsw) {
                                    swLevel = "3";
                                }
                                name +=
                                    "&nbsp;&nbsp;流量：" +
                                    item.ll +
                                    "m³/s" +
                                    "&nbsp;&nbsp;水位：" +
                                    item.sw +
                                    "m";
                                for (let i = 0; i < level.length; i++) {
                                    if (item.ll >= level[i]) {
                                        img1 = require("@/assets/bxll/river" +
                                            swLevel +
                                            (i + 1) +
                                            ".png");
                                    }
                                }
                                style = {
                                    image: {
                                        icon: {
                                            anchor: [0, 0.5],
                                            src: img1,
                                            scale: 0.8
                                        }
                                    }
                                };
                            } else {
                                let rain: any = "1";
                                name +=
                                    "<div>出库：" +
                                    (item.ck === null
                                        ? "-"
                                        : item.ck + "m³/s") +
                                    "&nbsp;&nbsp;入库：" +
                                    (item.rk === null
                                        ? "-"
                                        : item.rk + "m³/s") +
                                    "</div><div>水位：" +
                                    (item.sw === null ? "-" : item.sw + "m") +
                                    "&nbsp;&nbsp;" +
                                    item.time;
                                "</div>";
                                if (item.xxsw && item.sw > item.xxsw) {
                                    rain = "3";
                                }
                                for (let i = 0; i < level.length; i++) {
                                    if (item.ck >= level[i]) {
                                        img2 = require("@/assets/bxll/left" +
                                            rain +
                                            (i + 1) +
                                            ".png");
                                    }
                                    if (item.rk >= level[i]) {
                                        img3 = require("@/assets/bxll/right" +
                                            rain +
                                            (i + 1) +
                                            ".png");
                                    }
                                }
                                style = [
                                    {
                                        image: {
                                            icon: {
                                                anchor: [0, 0.5],
                                                src: img3,
                                                scale: 0.8
                                            }
                                        }
                                    },
                                    {
                                        image: {
                                            icon: {
                                                anchor: [1, 0.5],
                                                src: img2,
                                                scale: 0.8
                                            }
                                        }
                                    }
                                ];
                            }
                            self.result.tbData.push({
                                city:
                                    (item.sss
                                        ? item.sss.slice(0, 1) + "-"
                                        : "") +
                                    (item.ssx ? item.ssx.slice(0, 2) : ""),
                                name: item.zm,
                                sw: item.sw,
                                ck: item.ck === null ? "-" : item.ck,
                                rk: item.rk === null ? "-" : item.rk,
                                time: item.time,
                                ll: item.ll === null ? "-" : item.ll,
                                zh: item.zh,
                                lon: item.jd,
                                lat: item.wd
                            });
                            points.push({
                                id: i,
                                lon: item.jd,
                                lat: item.wd,
                                name: name,
                                style: style
                            });
                        });
                        self.getFlowPoint(points.reverse());
                    });
            }
        }

        hideList() {
            this.$emit("closeRight");
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

        locateArea(item: any) {
            let self = this;
            let obj: any;
            if (item == "") {
                this.getSelectArea("");
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
                    if (data.value == item) {
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
        }

        setInter(n: number) {
            let vm = this;
            this.search.interval = setInterval(function() {
                vm.searchResult();
            }, n * 60 * 3600);
        }

        @Watch("search.areaType.default")
        areaTypeChange(n: string) {
            if (n == "1") {
                this.search.rivers.default = "";
                this.search.rivers1.default = "";
            } else {
                this.search.cityList.default = "";
                this.search.counties.default = "";
            }
        }

        @Watch("search.zlxz.selected")
        changeZl(n: any, o: any) {
            let vm = this;
            if (vm.search.sklx.selected.length) {
                this.search.sklx.old = JSON.parse(
                    JSON.stringify(vm.search.sklx.selected)
                );
            }
            if (
                n.filter(function(item: any) {
                    return item == "水库";
                }).length &&
                !o.filter(function(item: any) {
                    return item == "水库";
                }).length
            ) {
                vm.search.sklx.selected = this.search.sklx.old;
                vm.search.sklx.disable = false;
            } else if (
                n.filter(function(item: any) {
                    return item == "水库";
                }).length
            ) {
            } else {
                vm.search.sklx.selected = [];
                vm.search.sklx.disable = true;
            }
        }

        // 导出
        handleExport() {
            let self = this;
            let postbody: any = this.$utils.deepCopy(this.search);
            let str: string = "",
                zlxz: string = "",
                sklx: string = "";
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
            if (self.search.areaType.default == 1) {
                postbody.rivers.default = "";
                postbody.rivers1.default = "";
            } else {
                postbody.cityList.default = "";
                postbody.counties.default = "";
            }
            //水库RR 河道ZZ，ZQ 闸吧 DD 潮汐TT
            if (postbody.zlxz.selected.length) {
                postbody.zlxz.selected.forEach(function(s: any) {
                    switch (s) {
                        case "水库":
                            zlxz += "RR,";
                            break;
                        case "河道":
                            zlxz += "ZZ,ZQ,";
                            break;
                        case "堰闸":
                            zlxz += "DD,";
                            break;
                        case "潮汐":
                            zlxz += "TT,";
                            break;
                    }
                });
            }
            //'大型' ,'中型' ,'小一', '其他(含小二)'
            if (postbody.sklx.selected.length) {
                postbody.sklx.selected.forEach(function(s: any) {
                    switch (s) {
                        case "大型":
                            sklx += "4,5,";
                            break;
                        case "中型":
                            sklx += "3,";
                            break;
                        case "小一":
                            sklx += "2,";
                            break;
                        case "其他(含小二)":
                            sklx += "1,9,";
                            break;
                    }
                });
            }
            /*if(postbody.cityList.default=='浙江省'){
                                                                            postbody.cityList.default = ''
                                                                        }*/
            if (postbody.counties.default == "全市") {
                postbody.counties.default = "";
            }
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
                zl: zlxz, //站类选择
                sklx: sklx, //水库类型
                ly: ly, //流域（水系）
                sfcj: postbody.overLine, //是否超警0所有1超警
                bxdj: str, //报汛等级
                zm: postbody.inputVal,
                flag: 1,
                cjly: ""
            };
            const url = this.$utils.formatURL(
                "/rest/water/leadoutNewDataList",
                params
            );
            window.open(url);
        }

        created() {
            const vm = this;
            if (this.search.refresh) {
                this.setInter(10);
            }
            this.autoHeightMixin(400);
            this.getArea("2");
            this.getArea("1").then(() => {
                if (vm.$utils.selectByCode()) {
                    if (vm.$utils.selectByCode().length == 4) {
                        vm.search.cityList.default =
                            vm.$utils.selectByCode() + "00";
                        this.searchResult();
                        this.changeCity(this.$utils.selectByCode() + "00");
                    } else {
                        vm.search.cityList.default =
                            this.$utils.selectByCode().slice(0, 4) + "00";
                        this.changeCity(
                            this.$utils.selectByCode().slice(0, 4) + "00"
                        ).then(() => {
                            vm.search.counties.default = vm.$utils.selectByCode();
                            this.locateArea(this.$utils.selectByCode());
                            this.searchResult();
                        });
                    }
                } else {
                    this.searchResult();
                }
            });
        }

        mounted(): void {
            this.$nextTick(() => {
                (this.$refs["table"] as any).doLayout();
            });
        }

        beforeDestroy() {
            this.getPoint();
        }
    }
</script>

<style lang="scss" scoped>
    .el-checkbox-group {
        display: inline-flex !important;
        justify-content: space-between;
        width: 303px;
    }
</style>
