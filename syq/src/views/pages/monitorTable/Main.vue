<template>
    <div>
        <div class="header_bars" style="width: 100%;margin: 0 auto">
            <h3>
                实时水雨情表格监视
                <span class="fr" @click="goback">返回</span>
            </h3>
        </div>
        <div class="tb-content">
            <el-row class="searchs">
                <el-col :span="24">
                    <el-select
                        v-model="search.zl.default"
                        style="width: 120px;margin-right: 15px"
                    >
                        <el-option
                            v-for="(item, index) in search.zl.arr"
                            :key="index"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        v-model="search.zl.cjzl"
                        style="width: 120px"
                        @change="getData"
                        v-show="search.zl.default == 'cj'"
                    >
                        <el-option
                            v-for="(item, index) in search.zl.allcj"
                            :key="index"
                            :label="item.value"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        v-model="search.zl.skzl"
                        style="width: 120px"
                        @change="getData"
                        v-show="search.zl.default == 'sk'"
                    >
                        <el-option
                            v-for="(item, index) in search.zl.allsk"
                            :key="index"
                            :label="item.value"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        v-model="search.zl.jhzl"
                        style="width: 120px"
                        @change="getData"
                        v-show="search.zl.default == 'jh'"
                    >
                        <el-option
                            v-for="(item, index) in search.zl.alljh"
                            :key="index"
                            :label="item.value"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        v-model="search.zl.level"
                        style="width: 120px"
                        @change="getData"
                        v-show="search.zl.default == 'sy'"
                    >
                        <el-option
                            v-for="(item, index) in search.zl.allLevel"
                            :key="index"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        style="width: 120px;margin-left:15px;margin-right: 15px"
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
                        style="width: 120px;margin-right: 15px"
                        v-model="search.cityList.default"
                        v-if="search.areaType.default == '1'"
                        placeholder="地市"
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
                        style="width: 120px"
                        v-model="search.counties.default"
                        v-if="search.areaType.default == '1'"
                        @change="getData"
                        placeholder="县"
                        :disabled="search.counties.disable"
                    >
                        <el-option
                            v-for="item in search.counties.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        style="width: 120px;margin-right: 15px"
                        v-model="search.rivers.default"
                        v-if="search.areaType.default == '2'"
                        @change="getData"
                        placeholder="流域"
                    >
                        <el-option
                            v-for="item in search.rivers.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        v-model="search.rivers1.default"
                        @change="getData"
                        v-if="
                            search.areaType.default == '2' &&
                                search.rivers.default == '钱塘江'
                        "
                        placeholder="二级流域"
                    >
                        <el-option
                            v-for="item in search.rivers1.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        style="width: 160px;margin-left: 20px"
                        v-model="search.level"
                        multiple
                        collapse-tags
                        placeholder="报汛项目"
                        @change="getData"
                    >
                        <el-option label="中央" value="1"></el-option>
                        <el-option label="省重点" value="2"></el-option>
                        <el-option label="省一般" value="3"></el-option>
                        <el-option label="一般" value="4"></el-option>
                        <el-option label="山洪" value="5"></el-option>
                    </el-select>
                </el-col>
            </el-row>
            <el-row v-loading="result.loading">
                <el-col :span="24">
                    <div style="min-width: 1366px">
                        <div
                            class="thcell"
                            v-for="(item, i) in result.thData"
                            :key="i"
                            :style="{ width: item.width }"
                        >
                            <span
                                v-show="item.child.length == 0"
                                @click="sortTb(item)"
                                >{{ item.label }}</span
                            >
                            <i
                                v-show="
                                    item.value === sortIndex &&
                                        sortDirection === 'down'
                                "
                                class="el-icon-caret-bottom"
                            />
                            <i
                                v-show="
                                    item.value === sortIndex &&
                                        sortDirection === 'up'
                                "
                                class="el-icon-caret-top"
                            />
                            <div
                                class="thcell thcell1"
                                style="width: 100%;border-bottom: 1px solid #ddd"
                                v-show="item.child.length != 0"
                            >
                                {{ item.label }}
                            </div>
                            <div
                                class="thcell thcell1"
                                v-for="(child, index) in item.child"
                                :key="index"
                                :style="{ width: child.width }"
                                @click="sortTb(child)"
                            >
                                {{ child.label }}
                                <i
                                    v-show="
                                        child.value === sortIndex &&
                                            sortDirection === 'down'
                                    "
                                    class="el-icon-caret-bottom"
                                />
                                <i
                                    v-show="
                                        child.value === sortIndex &&
                                            sortDirection === 'up'
                                    "
                                    class="el-icon-caret-top"
                                />
                            </div>
                        </div>
                        <nodata
                            v-if="
                                result.tableData.length == 0 && !result.loading
                            "
                            style="padding-top: 200px"
                        ></nodata>
                        <div style="clear: both"></div>
                    </div>
                    <virtual-list
                        :size="30"
                        :remain="25"
                        style="overflow-x: hidden"
                        v-if="result.tableData.length != 0"
                    >
                        <div
                            v-for="(item, index) in result.tableData"
                            :key="index"
                            class="line"
                            :style="
                                result.tableData.length >= 25
                                    ? { width: 'calc(100% + 10px)' }
                                    : { width: '100%' }
                            "
                        >
                            <div
                                v-for="(child, i) in result.cell"
                                :key="i"
                                :style="{
                                    width: child.width,
                                    background:
                                        child.value == 'sw' ? item.bg : ''
                                }"
                                :title="item[child.value]"
                            >
                                <span v-show="child.value == 'index'">{{
                                    index + 1
                                }}</span>
                                <span
                                    v-show="child.value != 'index'"
                                    @click="openModal(item, child)"
                                    >{{ item[child.value] }}</span
                                >
                            </div>
                        </div>
                    </virtual-list>
                    <el-dialog
                        :fullscreen="false"
                        :modal="false"
                        :visible="modal.visible"
                        v-if="modal.visible"
                        class="do-not-use-6"
                        :show-close="false"
                    >
                        <Modal
                            :data="modal.data"
                            @closeProgress="closeModal"
                        ></Modal>
                    </el-dialog>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Watch } from "vue-property-decorator";
    import virtualList from "vue-virtual-scroll-list";
    import nodata from "@/components/markInfo/components/nodata.vue";
    import Modal from "./Modal.vue";

    let cancelToken: any = null;
    const sortOrders = ["ascending", "descending", null];
    const sortable = true;

    const title = {
        cj: [
            {
                label: "序",
                value: "index",
                width: "3.12%",
                child: []
            },
            {
                label: "市县",
                value: "city",
                width: "4.68%",
                child: []
            },
            {
                label: "站名",
                value: "name",
                width: "calc(7.95% - 3px)",
                child: []
            },
            {
                label: "站类(报汛项目)",
                value: "zl",
                width: "calc(9.25% - 10px)",
                child: []
            },
            {
                label: "降雨量(mm)",
                value: "jyl",
                align: "center",
                width: "calc(25% + 1px)",
                child: [
                    {
                        label: "昨日雨量",
                        value: "yesterdayyl",
                        width: "25%"
                    },
                    {
                        label: "8时-现在",
                        value: "after8yl",
                        width: "25%"
                    },
                    {
                        label: "前1小时",
                        value: "before1yl",
                        width: "25%"
                    },
                    {
                        label: "近1小时",
                        value: "last1yl",
                        width: "25%"
                    }
                ]
            },
            {
                label: "水位信息",
                value: "swxx",
                align: "center",
                child: [
                    {
                        label: "8时水位",
                        value: "yesterdaysw",
                        width: "22.5%"
                    },
                    {
                        label: "上报时间",
                        value: "sbsj",
                        width: "30%"
                    },
                    {
                        label: "水位(m)",
                        value: "sw",
                        width: "22.5%"
                    },
                    {
                        label: "库容(百万方)",
                        value: "kr",
                        width: "25%"
                    }
                ],
                width: "calc(25% + 1px)"
            },
            {
                label: "特征水位(m)",
                value: "tzsw",
                align: "center",
                width: "calc(25% + 1px)",
                child: [
                    {
                        label: "警戒水位",
                        value: "jjsw",
                        width: "25%"
                    },
                    {
                        label: "保证水位",
                        value: "bzsw",
                        width: "25%"
                    },
                    {
                        label: "汛限水位",
                        value: "xxsw",
                        width: "25%"
                    },
                    {
                        label: "正常水位",
                        value: "zcsw",
                        width: "25%"
                    }
                ]
            }
        ],
        yl: [
            {
                label: "序",
                value: "index",
                width: "3.12%",
                child: []
            },
            {
                label: "市县",
                value: "city",
                child: [],
                width: "4.68%"
            },
            {
                label: "站名",
                value: "name",
                child: [],
                width: "calc(7.95% - 3px)"
            },
            {
                label: "站类(报汛项目)",
                value: "zl",
                child: [],
                width: "calc(9.25% - 10px)"
            }
        ]
    };

    const handleLine = (value: any) => {
        value = value === "-" ? value : Number(value);
        return value;
    };

    function compare1(property: any) {
        return function(a: any, b: any) {
            var value1 =
                a[property] == "-"
                    ? -1000
                    : a[property] === null || a[property] === ""
                    ? -999
                    : a[property];
            var value2 =
                b[property] == "-"
                    ? -1000
                    : b[property] === null || b[property] === ""
                    ? -999
                    : b[property];
            return value1 - value2;
        };
    }

    function compare2(property: any) {
        return function(a: any, b: any) {
            var value1 =
                a[property] == "-"
                    ? -1000
                    : a[property] === null || a[property] === ""
                    ? -999
                    : new Date(a[property]).getTime();
            var value2 =
                b[property] == "-"
                    ? -1000
                    : b[property] === null || b[property] === ""
                    ? -999
                    : new Date(b[property]).getTime();
            return value1 - value2;
        };
    }

    function compare3(property: any) {
        return function(a: any, b: any) {
            var value1 =
                a[property] == "-"
                    ? -1000
                    : a[property] === null || a[property] === ""
                    ? -999
                    : a[property];
            var value2 =
                b[property] == "-"
                    ? -1000
                    : b[property] === null || b[property] === ""
                    ? -999
                    : b[property];
            return a[property].localeCompare(b[property], "zh");
        };
    }
    @Component({
        components: { virtualList, nodata, Modal }
    })
    export default class MonitorTable extends Vue {
        search: any = {
            level: ["1", "2", "3", "4", "5"],
            zl: {
                default: "cj",
                arr: [
                    { value: "cj", label: "超警站监视" },
                    { value: "sy", label: "所有站监视" },
                    { value: "sk", label: "水库站监视" },
                    { value: "jh", label: "江河站监视" },
                    { value: "yl", label: "雨量站监视" }
                ],
                allcj: [
                    { value: "所有站" },
                    { value: "所有水库" },
                    { value: "河道站" },
                    { value: "潮位站" },
                    { value: "闸坝站" }
                ],
                allsk: [
                    { value: "所有水库" },
                    { value: "大型水库" },
                    { value: "中型水库" },
                    { value: "小一型水库" },
                    { value: "小二型水库" },
                    { value: "其他水库" }
                ],
                alljh: [
                    { value: "所有江河站" },
                    { value: "河道站" },
                    { value: "闸坝站" },
                    { value: "潮位站" }
                ],
                allLevel: [
                    { label: "全部", value: "" },
                    { label: "重要测站", value: "1" },
                    { label: "中等测站", value: "2" },
                    { label: "次要测站", value: "3" }
                ],
                cjzl: "所有站",
                skzl: "所有水库",
                jhzl: "所有江河站",
                level: "" //重要等级
            },
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
                default: "钱塘江",
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
            page: {
                no: 1,
                size: 20,
                total: 20
            },
            dateNow: Date.now()
        };
        sortIndex: string = "";
        sortDirection: string = "down";
        result: any = {
            loading: false,
            thData: [],
            tableData: [],
            height: 0,
            cell: []
        };
        modal: any = {
            visible: false,
            data: {
                name: ""
            }
        };
        sort: any = {
            index: 0
        };

        @Watch("search.zl.default")
        changeZl(n: string) {
            this.getData();
        }

        // 点击排序病显示排序按钮
        handleSortButton() {}

        pageChange(num: number) {
            this.search.page.no = num;
            this.getData();
        }
        getName(val: string) {}
        getData() {
            let num: number;
            let self = this;
            this.sortIndex = "";
            self.result.loading = true;
            self.result.tableData = [];
            let postParams: any = this.$utils.deepCopy(this.search);
            if (postParams.areaType.default == 1) {
                postParams.rivers.default = "";
                postParams.rivers1.default = "";
            } else {
                postParams.cityList.default = "";
                postParams.counties.default = "";
            }
            let ly: any;
            if (
                postParams.rivers.default == "钱塘江" &&
                postParams.rivers1.default != ""
            ) {
                ly =
                    postParams.rivers.default +
                    "," +
                    postParams.rivers1.default;
            } else {
                ly = postParams.rivers.default;
            }
            if (self.search.zl.default != "yl") {
                this.result.thData = title.cj;
                let zlxz: any = "",
                    sklx: any = "",
                    sfcj: any = 0;
                if (postParams.zl.default == "cj") {
                    sfcj = 1;
                    this.search.zl.level = "";
                    switch (postParams.zl.cjzl) {
                        case "所有水库":
                            zlxz = "RR";
                            break;
                        case "河道站":
                            zlxz = "ZZ,ZQ";
                            break;
                        case "闸坝站":
                            zlxz = "DD";
                            break;
                        case "潮位站":
                            zlxz = "TT";
                            break;
                        case "所有站":
                            zlxz = "RR,ZZ,ZQ,DD,TT";
                    }
                } else if (postParams.zl.default == "sk") {
                    zlxz = "RR";
                    this.search.zl.level = "";
                    switch (postParams.zl.skzl) {
                        case "大型水库":
                            sklx = "4,5";
                            break;
                        case "中型水库":
                            sklx = "3";
                            break;
                        case "小一型水库":
                            sklx = "2";
                            break;
                        case "小二型水库":
                            sklx = "1";
                            break;
                        case "其他水库":
                            sklx = "9";
                            break;
                        case "所有水库":
                            sklx = "1,2,3,4,5,9";
                    }
                } else if (postParams.zl.default == "jh") {
                    this.search.zl.level = "";
                    switch (postParams.zl.jhzl) {
                        case "河道站":
                            zlxz = "ZZ,ZQ";
                            break;
                        case "闸坝站":
                            zlxz = "DD";
                            break;
                        case "潮位站":
                            zlxz = "TT";
                            break;
                        case "所有江河站":
                            zlxz = "ZZ,ZQ,DD,TT";
                    }
                } else {
                    zlxz = "RR,ZZ,ZQ,DD,TT,PP";
                }
                if (cancelToken) {
                    cancelToken();
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
                    ly: ly,
                    zl: zlxz,
                    sklx: sklx,
                    sfcj: sfcj,
                    bxdj: this.search.level.join(","),
                    flag: 1,
                    level: this.search.zl.level
                };
                let arr1: any[] = [
                    {
                        label: "警戒水位",
                        value: "jjsw",
                        width: "50%"
                    },
                    {
                        label: "保证水位",
                        value: "bzsw",
                        width: "50%"
                    }
                ];
                let arr2: any[] = [
                    {
                        label: "汛限水位",
                        value: "xxsw",
                        width: "32%"
                    },
                    {
                        label: "正常水位",
                        value: "zcsw",
                        width: "32%"
                    }
                ];
                if (postParams.zl.default == "sk") {
                    self.result.thData[5].child = [
                        {
                            label: "8时水位",
                            value: "yesterdaysw",
                            width: "22.5%"
                        },
                        {
                            label: "上报时间",
                            value: "sbsj",
                            width: "30%"
                        },
                        {
                            label: "水位(m)",
                            value: "sw",
                            width: "22.5%"
                        },
                        {
                            label: "库容(百万方)",
                            value: "kr",
                            width: "25%"
                        }
                    ];
                    self.result.thData[6].child = arr2.concat([
                        {
                            label: "坝顶高程",
                            value: "bdgc",
                            width: "36%"
                        }
                    ]);
                } else if (postParams.zl.default == "jh") {
                    self.result.thData[6].child = arr1;
                    self.result.thData[5].child = [
                        {
                            label: "8时水位",
                            value: "yesterdaysw",
                            width: "33%"
                        },
                        {
                            label: "上报时间",
                            value: "sbsj",
                            width: "34%"
                        },
                        {
                            label: "水位(m)",
                            value: "sw",
                            width: "33%"
                        }
                    ];
                } else {
                    self.result.thData[6].child = arr1.concat(arr2);
                    self.result.thData[6].child.forEach((item: any) => {
                        item.width = "25%";
                    });
                }
                // this.search.dateNow = Date.now()
                self.result.cell = [];
                self.result.thData.forEach((item: any, i: number) => {
                    let width: any;
                    if (item.child.length == 0) {
                        self.result.cell.push(item);
                    }
                    item.child.forEach((child: any, j: number) => {
                        if (j != 3) {
                            width =
                                (Number(child.width.slice(0, -1)) * 25) / 100 +
                                "%";
                        } else {
                            width =
                                "calc(" +
                                (Number(child.width.slice(0, -1)) * 25) / 100 +
                                "% + 1px)";
                        }
                        //width = 'calc('+(Number(child.width.slice(0,-1))*25)/100+'% + 1px)'
                        self.result.cell.push({
                            label: child.label,
                            value: child.value,
                            width: width
                        });
                    });
                });
                if (this.search.level.join(",") === "") {
                    this.$message("报汛等级不能为空");
                } else {
                    this.$http
                        .get("/rest/monitor/getAllWaterData", {
                            params: params,
                            cancelToken: new this.$http.CancelToken(function(
                                cancel: any
                            ) {
                                cancelToken = cancel;
                            })
                        })
                        .then(function(data: any) {
                            self.result.loading = false;
                            self.search.page.total = data.data.totalCount;
                            data.data.forEach(function(item: any, i: number) {
                                let zlfill: string = "-";
                                let strDate: any = null;
                                if (item.sbsj) {
                                    strDate = self.$utils.dateFormat(
                                        new Date(item.sbsj.slice(0, 16)),
                                        "yyyy-MM-dd HH:mm"
                                    );
                                } else {
                                    strDate = null;
                                }
                                switch (item.zl) {
                                    case "RR":
                                        zlfill = "水库";
                                        break;
                                    case "ZZ":
                                        zlfill = "河道";
                                        break;
                                    case "ZQ":
                                        zlfill = "河道";
                                        break;
                                    case "DD":
                                        zlfill = "闸坝";
                                        break;
                                    case "TT":
                                        zlfill = "潮位";
                                        break;
                                    case "PP":
                                        zlfill = "雨量";
                                        break;
                                    case "MM":
                                        zlfill = "气象";
                                        break;
                                }
                                let bg: string = "";
                                let yesterdayyl,
                                    after8yl,
                                    before1yl,
                                    last1yl,
                                    yesterdaysw,
                                    sw,
                                    jjsw,
                                    bzsw,
                                    kr,
                                    xxsw,
                                    zcsw;
                                if (item.item) {
                                    if (
                                        item.item.match("P") &&
                                        item.item.match("Z")
                                    ) {
                                        yesterdayyl = item.zryl;
                                        after8yl = item["8-now"];
                                        before1yl = item.before1yl;
                                        last1yl = item.after1yl;
                                        yesterdaysw =
                                            item["8sw"] !== null
                                                ? Number(item["8sw"].toFixed(2))
                                                : item["8sw"];
                                        sw =
                                            item.sw !== null
                                                ? Number(item.sw.toFixed(2))
                                                : item.sw;
                                        jjsw = item.jjsw
                                            ? Number(item.jjsw.toFixed(2))
                                            : item.jjsw;
                                        bzsw = item.bzsw
                                            ? Number(item.bzsw.toFixed(2))
                                            : item.bzsw;
                                        xxsw = item.xxsw
                                            ? Number(item.xxsw.toFixed(2))
                                            : item.xxsw;
                                        zcsw = item.zcsw
                                            ? Number(item.zcsw.toFixed(2))
                                            : item.zcsw;
                                        kr =
                                            item.kr !== null && item.kr !== "-"
                                                ? Number(item.kr.toFixed(2))
                                                : item.kr;
                                    } else if (item.item.match("P")) {
                                        yesterdayyl = item.zryl;
                                        after8yl = item["8-now"];
                                        before1yl = item.before1yl;
                                        last1yl = item.after1yl;
                                        yesterdaysw = "-";
                                        sw = "-";
                                        kr = "-";
                                        strDate = "-";
                                        jjsw = item.jjsw || "-";
                                        bzsw = item.bzsw || "-";
                                        xxsw = item.xxsw || "-";
                                        zcsw = item.zcsw || "-";
                                    } else {
                                        yesterdayyl = item.zryl
                                            ? Number(item.zryl.toFixed(2))
                                            : "-";
                                        after8yl = item["8-now"]
                                            ? item["8-now"]
                                            : "-";
                                        before1yl = item.before1yl
                                            ? Number(item.before1yl.toFixed(2))
                                            : "-";
                                        last1yl = item.after1yl
                                            ? Number(item.after1yl.toFixed(2))
                                            : "-";
                                        yesterdaysw =
                                            item["8sw"] !== null
                                                ? Number(item["8sw"].toFixed(2))
                                                : item["8sw"];
                                        sw =
                                            item.sw !== null
                                                ? Number(item.sw.toFixed(2))
                                                : item.sw;
                                        jjsw = item.jjsw
                                            ? Number(item.jjsw.toFixed(2))
                                            : item.jjsw;
                                        bzsw = item.bzsw
                                            ? Number(item.bzsw.toFixed(2))
                                            : item.bzsw;
                                        xxsw = item.xxsw
                                            ? Number(item.xxsw.toFixed(2))
                                            : item.xxsw;
                                        zcsw = item.zcsw
                                            ? Number(item.zcsw.toFixed(2))
                                            : item.zcsw;
                                        kr =
                                            item.kr !== null && item.kr !== "-"
                                                ? Number(item.kr.toFixed(2))
                                                : item.kr;
                                    }
                                } else {
                                    console.log(item);
                                }
                                if (xxsw) {
                                    sw - xxsw > 0 ? (bg = "yellow") : "";
                                } else if (jjsw) {
                                    sw - jjsw > 0 ? (bg = "yellow") : "";
                                } else if (bzsw) {
                                    sw - bzsw > 0 ? (bg = "red") : "";
                                }

                                self.result.tableData.push({
                                    index: i,
                                    city:
                                        (item.pro && item.pro !== "浙江省"
                                            ? item.pro.slice(1, 2) + "-"
                                            : "") +
                                        (item.sss
                                            ? item.sss.slice(0, 1) + "-"
                                            : "") +
                                        (item.ssx ? item.ssx.slice(0, 2) : ""),
                                    name: item.zm,
                                    zl: zlfill + "(" + item.item + ")",
                                    yesterdayyl: yesterdayyl,
                                    after8yl: after8yl,
                                    before1yl: before1yl,
                                    last1yl: last1yl,
                                    yesterdaysw: yesterdaysw,
                                    sbsj: strDate,
                                    sw: sw,
                                    jjsw: jjsw || "-",
                                    bzsw: bzsw || "-",
                                    kr: kr,
                                    bdgc: item.bdgc === null ? "" : item.bdgc,
                                    xxsw: xxsw || "-",
                                    zcsw: zcsw || "-",
                                    bg: bg,
                                    zh: item.zh,
                                    item: item.item
                                });
                            });
                        });
                }
            } else {
                let ylth: any = JSON.parse(JSON.stringify(title.yl));
                //debugger;
                let nowHour: number = new Date().getHours();
                ylth[4] = {
                    label: "降雨量(mm)",
                    value: "jyl",
                    width: "calc(75% + 3px)",
                    child: [
                        {
                            label: "昨日雨量",
                            value: "yesterdayyl",
                            width: "10%"
                        },
                        {
                            label: "8时-现在",
                            value: "after8yl",
                            width: "9%"
                        },
                        {
                            label: "近1小时",
                            value: "last1yl",
                            width: "9%"
                        }
                    ]
                };
                for (let i = 0; i < 12; i++) {
                    if (nowHour - i > 0) {
                        ylth[4].child.push({
                            label: nowHour - i - 1 + "-" + (nowHour - i) + "时",
                            value: "t" + i,
                            width: "6%"
                        });
                    } else {
                        ylth[4].child.push({
                            label:
                                nowHour -
                                i +
                                23 +
                                "-" +
                                (nowHour - i + 24) +
                                "时",
                            value: "t" + i,
                            width: "6%"
                        });
                    }
                }
                this.result.thData = ylth;
                let params = {
                    areaFlag: postParams.areaType.default,
                    sss: postParams.cityList.default,
                    ssx: postParams.counties.default,
                    ly: ly,
                    bxdj: this.search.level.join(","),
                    pageNo: parseInt(this.search.page.no),
                    pageSize: 100000
                };
                self.result.cell = [];
                self.result.thData.forEach((item: any, i: number) => {
                    let width: any;
                    if (item.child.length == 0) {
                        self.result.cell.push(item);
                    } else {
                        item.child.forEach((child: any, j: number) => {
                            if (j != 12) {
                                width =
                                    (Number(child.width.slice(0, -1)) * 75) /
                                        100 +
                                    "%";
                            } else {
                                width =
                                    "calc(" +
                                    (Number(child.width.slice(0, -1)) * 75) /
                                        100 +
                                    "% + 1px)";
                            }
                            self.result.cell.push({
                                label: child.label,
                                value: child.value,
                                width: width
                            });
                        });
                    }
                });
                console.log(self.result.cell);
                if (this.search.level.join(",") === "") {
                    this.$message("报汛等级不能为空");
                } else {
                    this.$http
                        .get("/rest/monitor/getRainData", { params: params })
                        .then(function(data: any) {
                            self.result.loading = false;
                            self.search.page.total = data.data.totalCount;
                            data.data.forEach(function(item: any, i: number) {
                                let zlfill: string = "-";
                                let strDate: any = null;
                                if (item.sbsj) {
                                    strDate =
                                        new Date(
                                            item.sbsj.slice(0, 16)
                                        ).getTime() -
                                        8 * 3600000;
                                }

                                switch (item.zl) {
                                    case "RR":
                                        zlfill = "水库";
                                        break;
                                    case "ZZ":
                                        zlfill = "河道";
                                        break;
                                    case "ZQ":
                                        zlfill = "河道";
                                        break;
                                    case "DD":
                                        zlfill = "闸坝";
                                        break;
                                    case "TT":
                                        zlfill = "潮位";
                                        break;
                                    case "PP":
                                        zlfill = "雨量";
                                        break;
                                    case "MM":
                                        zlfill = "气象";
                                        break;
                                }
                                self.result.tableData.push({
                                    index: i,
                                    city:
                                        (item.pro && item.pro !== "浙江省"
                                            ? item.pro.slice(1, 2) + "-"
                                            : "") +
                                        (item.sss
                                            ? item.sss.slice(0, 1) + "-"
                                            : "") +
                                        (item.ssx ? item.ssx.slice(0, 2) : ""),
                                    name: item.zm,
                                    zl: zlfill + "(" + item.item + ")",
                                    yesterdayyl: item.zryl,
                                    last1yl: item.after1yl,
                                    after8yl: item["8-now"],
                                    t0: item["one"],
                                    t1: item["two"],
                                    t2: item["three"],
                                    t3: item["four"],
                                    t4: item["five"],
                                    t5: item["six"],
                                    t6: item["seven"],
                                    t7: item["eight"],
                                    t8: item["nine"],
                                    t9: item["ten"],
                                    t10: item["eleven"],
                                    t11: item["twelve"],
                                    zh: item.zh,
                                    item: item.item
                                });
                            });
                        });
                }
            }
        }

        sortTb(item: any) {
            const ArrNumber: any[] = [
                "yesterdayyl",
                "after8yl",
                ,
                "zl",
                "before1yl",
                "last1yl",
                "yesterdaysw",
                "sbsj",
                "sw",
                "jjsw",
                "bzsw",
                "xxsw",
                "zcsw",
                "kr",
                "last1yl",
                "after8yl",
                "t0",
                "t1",
                "t2",
                "t3",
                "t4",
                "t5",
                "t6",
                "t7",
                "t8",
                "t9",
                "t10",
                "t11",
                "t12"
            ];
            let isNumber: boolean = false;
            ArrNumber.forEach((child: any) => {
                if (child == item.value) {
                    isNumber = true;
                }
            });
            if (item.value == "sbsj") {
                if (this.sortIndex == item.value) {
                    this.sortDirection = "up";
                    this.result.tableData = this.result.tableData.reverse();
                } else {
                    this.sortDirection = "down";
                    this.result.tableData = this.result.tableData.sort(
                        compare2(item.value)
                    );
                }
            } else if (isNumber) {
                if (this.sortIndex == item.value) {
                    this.sortDirection = "up";
                    this.result.tableData = this.result.tableData.reverse();
                } else {
                    this.sortDirection = "down";
                    this.result.tableData = this.result.tableData.sort(
                        compare1(item.value)
                    );
                }
            } else {
                if (this.sortIndex == item.value) {
                    this.sortDirection = "up";
                    this.result.tableData = this.result.tableData.reverse();
                } else {
                    this.sortDirection = "down";
                    this.result.tableData = this.result.tableData
                        .sort(compare3(item.value))
                        .reverse();
                }
            }
            this.sortIndex = item.value;
            console.log(this.sortIndex);
        }

        openModal(data: any, type: any) {
            if (type.value == "name") {
                this.modal.visible = true;
                this.modal.data = data;
            }
        }
        closeModal() {
            this.modal.visible = false;
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
                            label: item.ssx,
                            value: item.id
                        });
                    });
                    self.getData();
                });
        }

        async getArea(areaFlag: any) {
            let vm = this;
            await this.$http
                .get("/rest/basic/getAreaList?areaFlag=" + areaFlag)
                .then(function(res: any) {
                    if (areaFlag == 1) {
                        vm.search.cityList.default = "";
                        vm.search.cityList.arr = [];
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

        goback() {
            this.$router.go(-1);
        }

        // 渲染列背景色
        handleCellStyle({ row, column }: any) {
            /*if (column.label === "正常水位") {
                const { zcsw, sw } = row;

                if (zcsw !== "-" && sw > zcsw) {
                    return {
                        color: "white",
                        "background-color": "rgb(255, 63, 88)"
                    };
                }
            }*/
            if (column.label === "汛限水位") {
                const { xxsw, sw } = row;

                if (xxsw !== "-" && sw > xxsw) {
                    return {
                        color: "white",
                        "background-color": "rgb(245, 200, 105)"
                    };
                }
            }
        }

        created() {
            const vm = this;
            this.result.thData = title.cj;
            this.result.height = window.innerHeight - 130;
            this.getArea("2");
            this.getArea("1").then(() => {
                if (vm.$utils.selectByCode()) {
                    if (vm.$utils.selectByCode().length == 4) {
                        vm.search.cityList.default =
                            vm.$utils.selectByCode() + "00";
                        this.getData();
                        this.changeCity(this.$utils.selectByCode() + "00");
                    } else {
                        vm.search.cityList.default =
                            this.$utils.selectByCode().slice(0, 4) + "00";
                        this.changeCity(
                            this.$utils.selectByCode().slice(0, 4) + "00"
                        ).then(() => {
                            vm.search.counties.default = vm.$utils.selectByCode();
                            this.getData();
                        });
                    }
                } else {
                    this.getData();
                }
            });
        }
    }
</script>

<style scoped lang="scss">
    .header_bars {
        height: 60px;
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        line-height: 60px;
        color: #fff;
        background-color: #33b1ff;

        h3 {
            width: 100%;
            margin: 0 auto;
            position: relative;
        }

        span {
            position: absolute;
            right: 40px;
            font-size: 14px;
            cursor: pointer;
        }
    }

    .tb-content {
        width: 100%;
        margin: 0 auto;

        .searchs {
            margin: 10px 0;
            padding-left: 10px;

            .el-input__inner {
                height: 30px !important;
            }
        }

        .thcell {
            float: left;
            background-color: #eee;
            text-align: center;
            font-weight: bold;
            font-size: 14px;
            height: 60px;
            line-height: 60px;
            border-right: 1px solid #ddd;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            span {
                cursor: pointer;
            }
        }

        .thcell1 {
            height: 30px;
            line-height: 30px;
        }

        .line {
            clear: both;
            width: 100%;
            height: 30px;
            border-bottom: 1px solid #ddd;
            overflow: hidden;

            div {
                height: 30px;
                line-height: 30px;
                float: left;
                text-align: center;
                font-size: 14px;
                border-right: 1px solid #ddd;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                span {
                    cursor: pointer;
                }
            }
        }

        .line:nth-child(even) {
            background-color: #f9f9f9;
        }
    }
</style>
