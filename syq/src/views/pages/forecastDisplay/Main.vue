<template>
    <vue-perfect-scrollbar class="details">
        <!--<div class="title">
            <i class="iconfont iconlianhe" />{{ data.type }}
        </div>-->
        <el-tabs v-model="data.type" type="card">
            <el-tab-pane name="预报展示" label="预报展示">
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
                        >
                        </el-option>
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
                        >
                        </el-option>
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
                        >
                        </el-option>
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
                        >
                        </el-option>
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
                            v-for="item in search.rivers1.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        >
                        </el-option>
                    </el-select>
                </div>
                <div class="searchBar">
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
                        />
                    </el-select>
                    <el-date-picker
                        class="searchItem searchDadeItem"
                        style="width: 112px"
                        v-model="search.current.start"
                        type="date"
                        @change="searchResult"
                        v-show="search.fwList.default == 'zdy'"
                    />
                    <el-date-picker
                        class="searchItem searchDadeItem"
                        style="width: 112px"
                        v-model="search.current.end"
                        type="date"
                        @change="searchResult"
                        v-show="search.fwList.default == 'zdy'"
                    />
                </div>
                <div class="searchBar">
                    <el-input
                        class="searchItem"
                        style="width: 198px"
                        v-model="search.inputVal"
                        placeholder="站名站码拼音码"
                    >
                    </el-input>
                    <el-button
                        size="mini"
                        type="primary"
                        icon="el-icon-search"
                        class="el-button-search"
                        @click="searchResult"
                        >查询</el-button
                    >
                    <img
                        src="../../../assets/button/export-excel.png"
                        @click="handleExport"
                        class="export-button__img"
                        alt="导出"
                    />
                </div>
                <div class="result" style="height: 590px">
                    <el-table
                        border
                        stripe
                        :data="result.tjData"
                        style="width: 100%"
                        :height="heightMixin"
                        v-loading="result.loading"
                        @row-click="rowClick"
                    >
                        <el-table-column
                            type="index"
                            width="50"
                            label="序"
                            fixed="left"
                        />
                        <el-table-column
                            show-overflow-tooltip
                            v-for="(item, index) in result.thList.ylxx"
                            :prop="item.value"
                            :label="item.label"
                            :key="index"
                            :fixed="item.fixed"
                            :width="item.width"
                        />
                        <el-table-column width="50" label="状态" prop="status">
                            <template slot-scope="scope">
                                <i
                                    class="el-icon-caret-top"
                                    :class="{
                                        'el-icon-caret-top-0':
                                            Number(scope.row.status) === 0,
                                        'el-icon-caret-top-1':
                                            Number(scope.row.status) === 1,
                                        'el-icon-caret-top-2':
                                            Number(scope.row.status) === 2,
                                        'el-icon-caret-top-3':
                                            Number(scope.row.status) === 3,
                                        'el-icon-caret-top-4':
                                            Number(scope.row.status) === 4,
                                        'el-icon-caret-top-5':
                                            Number(scope.row.status) === 5,
                                    }"
                                />
                            </template>
                        </el-table-column>
                    </el-table>
                    <p>告警图例</p>
                    <ul class="legend">
                        <li>
                            <img src="@/assets/status/status1.png" alt="" />
                            <span>正常</span>
                        </li>
                        <li>
                            <img src="@/assets/status/status2.png" alt="" />
                            <span>超汛限水位</span>
                        </li>
                        <li>
                            <img src="@/assets/status/status3.png" alt="" />
                            <span>超正常高</span>
                        </li>
                        <li>
                            <img src="@/assets/status/status4.png" alt="" />
                            <span>超历史最高水位</span>
                        </li>
                        <li>
                            <img src="@/assets/status/status5.png" alt="" />
                            <span>超坝顶高程</span>
                        </li>
                        <li>
                            <img src="@/assets/status/status6.png" alt="" />
                            <span>低于死水位</span>
                        </li>
                    </ul>
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
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import { State, Getter, Action, Mutation, namespace } from "vuex-class";
    import moment from "moment";
    import virtualList from "vue-virtual-scroll-list";
    import Overlay from "./Overlay.vue";
    import weatherRadar from "../weatherRadar/Main.vue";
    import AutoHeightMixin from "../../../mixins/autoHeight";
    import stormSurge from "../stormSurge/Main.vue";
    let cancelToken: any = null;
    @Component({
        components: { Overlay, weatherRadar,stormSurge },
    })
    export default class ForecastDisplay extends AutoHeightMixin {
        @State("forecast") forecast: any;
        @State("pagesShow") pagesShow: any;
        @Mutation("getSelectArea") getSelectArea: any;
        @Mutation("getCenter") getCenter: any;
        @Mutation("openForecast") openForecast: any;
        @Mutation("getForecastPoint") getForecastPoint: any;

        data: any = {
            type: "预报展示",
            show: true,
        };
        index: number = 0;
        search: any = {
            areaType: {
                default: "1",
                arr: [
                    {
                        label: "行政区划",
                        value: "1",
                    },
                    {
                        label: "流域",
                        value: "2",
                    },
                ],
            }, //区域类型。行政区划还是流域
            cityList: {
                default: "",
                arr: [],
            }, //市列表
            counties: {
                default: "",
                disable: false,
                arr: [],
            }, //县列表
            rivers: {
                default: "",
                arr: [],
            }, //河流列表
            rivers1: {
                default: "",
                arr: [
                    {
                        label: "浦阳江",
                        value: "GAE00000000RLPZ",
                    },
                    {
                        label: "钱塘江兰溪以上",
                        value: "GA2D0000000RLXZ",
                    },
                    {
                        label: "钱塘江衢州以上",
                        value: "GA000000000SQZZ",
                    },
                    {
                        label: "钱塘江金华以上",
                        value: "GABBBA00000RJHZ",
                    },
                    {
                        label: "曹娥江",
                        value: "GAFCC000000LDSB",
                    },
                    {
                        label: "分水江",
                        value: "GAD00000000LFSJ",
                    },
                ],
            }, //二级流域列表
            typeList: {
                default: "正常",
                arr: [
                    { label: "正常", value: "正常" },
                    { label: "超警", value: "超警 " },
                ],
            },
            fwList: {
                default: "zdy",
                arr: [
                    { label: "1天", value: 1 },
                    { label: "3天", value: 3 },
                    { label: "7天", value: 7 },
                    { label: "自定义", value: "zdy" },
                ],
            }, //筛选符号列表
            current: {
                start: moment()
                    .subtract(100, "day")
                    .format("YYYY-MM-DD"),
                end: moment().format("YYYY-MM-DD"),
            },
        };
        result: any = {
            loading: false,
            type: true, //true 雨情 false 分区统计
            thList: {
                ylxx: [
                    {
                        label: "站名",
                        value: "dmmc",
                        width: 80,
                        fixed: "left",
                    },
                    {
                        label: "预报时间",
                        value: "ybtime",
                        width: 150,
                    },
                    {
                        label: "用户",
                        value: "user",
                        width: 50,
                    },
                ],
            },
            tbDate: {},
            points: [],
            tjData: [],
        };

        rowClick(row: any) {
            this.openForecast(row);
            //console.log(row);
            this.getCenter([row.lon, row.lat]);
        }
        hideList() {
            this.$emit("closeRight");
        }

        async getArea(areaFlag: any) {
            let vm = this;

            await this.$http
                .get("/rest/basic/getAreaList", {
                    params: { areaFlag: areaFlag }
                })
                .then(function(res: any) {
                    if (areaFlag == 1) {
                        vm.search.cityList.arr = [];
                    } else if (areaFlag == 2) {
                        vm.search.rivers.arr = [{ label: "全部", value: "" }];
                    }
                    res.data.forEach(function(item: any, index: number) {
                        if (areaFlag == 1) {
                            vm.search.cityList.arr.push({
                                label: item.sss,
                                value: item.id,
                            });
                        } else if (areaFlag == 2) {
                            vm.search.rivers.arr.push({
                                label: item.ly,
                                value: item.ly,
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
                city: obj.label,
            };
            await this.$http
                .get("/rest/basic/getAreaList", { params: params })
                .then(function(res: any) {
                    self.search.counties.disable = false;
                    if (city.slice(2, 4) != "00") {
                        self.search.counties.default = "";
                        self.search.counties.arr = [
                            { label: "全市", value: "全市" },
                        ];
                    } else {
                        self.search.counties.default = "";
                        self.search.counties.arr = [];
                        self.search.counties.disable = true;
                    }
                    res.data.forEach(function(item: any) {
                        self.search.counties.arr.push({
                            label: item.ssx || item.CITY,
                            value: item.id,
                        });
                    });
                });
            self.locateArea(obj.value);
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
        }

        searchResult() {
            let self = this;
            let postParams: any = JSON.parse(JSON.stringify(this.search));
            if (postParams.areaType.default == 1) {
                postParams.rivers.default = "";
                postParams.rivers1.default = "";
            } else {
                postParams.cityList.default = "";
                postParams.counties.default = "";
            }
            let stDate, edDate;
            if (postParams.fwList.default == "zdy") {
                stDate = this.$utils.dateFormat(
                    new Date(postParams.current.start),
                    "yyyy-MM-dd"
                );
                edDate = this.$utils.dateFormat(
                    new Date(postParams.current.end),
                    "yyyy-MM-dd"
                );
            } else {
                stDate = this.$utils.dateFormat(
                    new Date(
                        Date.now() -
                            postParams.fwList.default * 3600 * 1000 * 24
                    ),
                    "yyyy-MM-dd"
                );
                edDate = this.$utils.dateFormat(new Date(), "yyyy-MM-dd");
            }
            let river: string;
            if (postParams.rivers.default == "钱塘江") {
                river = postParams.rivers.default;
            } else {
                river = postParams.rivers.default;
            }
            if (postParams.cityList.default == "全省") {
                postParams.cityList.default = "";
            }
            if (postParams.counties.default == "全市") {
                postParams.counties.default = "";
            }
            let city = "";
            postParams.cityList.arr.forEach((item: any) => {
                if (item.value == postParams.cityList.default) {
                    city = item.label;
                }
            });
            let county = "";
            if (
                postParams.counties.default &&
                postParams.counties.default != "全市"
            ) {
                postParams.counties.arr.forEach((item: any) => {
                    if (item.value == postParams.counties.default) {
                        county = item.label;
                    }
                });
            } else {
                postParams.counties.default = "";
            }
            let params = {
                areaFlag: postParams.areaType.default,
                sss: city,
                ssx: county,
                ly: river,
                state: postParams.typeList.default,
                st: stDate,
                et: edDate,
                zm: postParams.inputVal,
            };
            this.result.loading = true;
            self.result.tjData = [];
            this.result.loading = true;
            self.forecast.point = [];
            if (cancelToken) {
                cancelToken();
            }
            this.$http
                .get("/rest/floodforcast/getFloodForcast", {
                    params: params,
                    cancelToken: new this.$http.CancelToken(cancel => {
                        cancelToken = cancel;
                    })
                })
                .then(function(res: any) {
                    self.result.loading = false;
                    //dm断面 Q洪峰流量 WNSTATUS状态 PLCD用户 FYMDH预报时间 IYMDH创建时间
                    if (res && res.data) {
                        res.data.forEach(function(item: any) {
                            self.result.tjData.push({
                                dmmc: item.zm,
                                ybtime: item.publishtm,
                                user: item.plcd,
                                status: item.state,
                                info: item,
                                lon: item.lgtd,
                                lat: item.lttd,
                                show: false,
                            });
                            self.forecast.point.push({
                                id: item.zh,
                                lon: item.lgtd,
                                lat: item.lttd,
                                info: item,
                                show: false,
                                style: {
                                    image: {
                                        icon: {
                                            anchor: [0.5, 1],
                                            src: require("@/assets/legend/rain_0.png"),
                                            scale: 0.7,
                                        },
                                    },
                                },
                            });
                        });
                    }
                });
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
        handleExport() {
            let self = this;
            let postParams: any = JSON.parse(JSON.stringify(this.search));
            if (postParams.areaType.default == 1) {
                postParams.rivers.default = "";
                postParams.rivers1.default = "";
            } else {
                postParams.cityList.default = "";
                postParams.counties.default = "";
            }
            let stDate, edDate;
            if (postParams.fwList.default == "zdy") {
                stDate = this.$utils.dateFormat(
                    new Date(postParams.current.start),
                    "yyyy-MM-dd"
                );
                edDate = this.$utils.dateFormat(
                    new Date(postParams.current.end),
                    "yyyy-MM-dd"
                );
            } else {
                stDate = this.$utils.dateFormat(
                    new Date(
                        Date.now() -
                            postParams.fwList.default * 3600 * 1000 * 24
                    ),
                    "yyyy-MM-dd"
                );
                edDate = this.$utils.dateFormat(new Date(), "yyyy-MM-dd");
            }
            let river: string;
            if (postParams.rivers.default == "钱塘江") {
                river = postParams.rivers.default;
            } else {
                river = postParams.rivers.default;
            }
            if (postParams.cityList.default == "全省") {
                postParams.cityList.default = "";
            }
            if (postParams.counties.default == "全市") {
                postParams.counties.default = "";
            }
            let params = {
                areaFlag: postParams.areaType.default,
                sss: postParams.cityList.default,
                ssx: postParams.counties.default,
                ly: river,
                state: postParams.typeList.default,
                st: stDate,
                et: edDate,
                zm: postParams.inputVal || "",
            };
            const url = this.$utils.formatURL(
                "/rest/floodforcast/leadoutFloodForcastList",
                params
            );
            window.open(url);
        }

        created() {
            const vm = this;
            this.autoHeightMixin(380);
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

        mounted() {}
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
        }
    }

    .result {
        p {
            color: rgb(163, 163, 163);
            font-size: 14px;
            margin: 6px 0;
        }

        .legend {
            display: flex;
            flex-wrap: wrap;
            list-style-type: none;

            li {
                flex-direction: column;

                i {
                    position: relative;
                    display: inline-block;
                    top: 1px;
                    width: 20px;
                    height: 12px;
                }

                span {
                    font-size: 12px;
                    color: rgb(163, 163, 163);
                    margin: 0 6px;
                }

                &:nth-of-type(1) {
                    i {
                        background-color: rgb(1, 247, 127);
                    }
                }

                &:nth-of-type(2) {
                    i {
                        background-color: rgb(249, 202, 10);
                    }
                }

                &:nth-of-type(3) {
                    i {
                        background-color: rgb(255, 143, 2);
                    }
                }

                &:nth-of-type(4) {
                    i {
                        background-color: rgb(186, 40, 38);
                    }
                }

                &:nth-of-type(5) {
                    i {
                        background-color: rgb(125, 1, 188);
                    }
                }

                &:nth-of-type(6) {
                    i {
                        background-color: rgb(38, 124, 240);
                    }
                }
            }
        }
    }

    .el-icon-caret-top {
        font-size: 18px;

        &-0 {
            color: rgb(1, 247, 127);
        }

        &-1 {
            color: rgb(249, 202, 10);
        }

        &-2 {
            color: rgb(255, 143, 2);
        }

        &-3 {
            color: rgb(186, 40, 38);
        }

        &-4 {
            color: rgb(125, 1, 188);
        }

        &-5 {
            color: rgb(38, 124, 240);
        }
    }
</style>
