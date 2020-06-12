<template>
    <div class="details">
        <el-tabs v-model="data.type" type="card">
            <el-tab-pane name="极值分析" label="极值分析">
                <div class="searchBar" style="line-height: 28px; margin-top: 8px">
                    <el-radio-group size="mini" v-model="search.sksel" @change="getData">
                        <el-radio-button label="waterLine">水位极值</el-radio-button>
                        <el-radio-button
                            label="reservior"
                            v-if="$utils.checkUser(rolesState,'super')"
                        >水库极值</el-radio-button>
                        <el-radio-button label="rainfall">雨量极值</el-radio-button>
                    </el-radio-group>
                    <img
                        style="position: absolute; top: 0; right: 32px;"
                        @click="handleAmplification"
                        v-if="
                            search.sksel === 'waterLine' ||
                                search.sksel === 'rainfall'
                        "
                        src="../../../assets/max.png"
                        alt
                    />
                </div>
                <div class="searchBar" style="margin-top: 5px">
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
                        v-if="search.areaType.default === '1'"
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
                        v-if="search.areaType.default === '1'"
                        :disabled="search.counties.disable"
                        @change="locateArea"
                        placeholder="请选择"
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
                        v-if="search.areaType.default === '2'"
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
                </div>
                <div class="searchBar">
                    <el-input
                        class="searchItem"
                        style="width:278px"
                        v-model="search.inputVal"
                        placeholder="站名站码拼音码"
                        @keyup.enter.native="getData"
                    />
                    <el-button
                        size="mini"
                        type="primary"
                        icon="el-icon-search"
                        class="el-button-search"
                        @click="getData"
                    >查询</el-button>
                </div>
                <div class="result">
                    <el-table
                        border
                        stripe
                        style="width: 100%"
                        v-loading="result.loading"
                        :data="result.tbDate"
                        :height="heightMixin"
                        @row-click="handleOpenOverlay"
                        @cell-mouse-enter="handleHoverEnter"
                        @cell-mouse-leave="handleHoverLeave"
                    >
                        <el-table-column type="index" width="50" label="序号" />
                        <el-table-column prop="name" label="站名">
                            <template slot-scope="scope">
                                <el-tooltip
                                    class="item"
                                    effect="light"
                                    :content="scope.row.name + scope.row.zh"
                                    placement="top"
                                >
                                    <span>{{ scope.row.name }}</span>
                                </el-tooltip>
                            </template>
                        </el-table-column>
                        <el-table-column v-if="search.sksel !== 'rainfall'" prop="time" label="日期" />
                        <el-table-column
                            v-if="search.sksel !== 'rainfall'"
                            prop="htz"
                            label="历史最高水位"
                        />
                        <el-table-column
                            v-if="search.sksel === 'rainfall'"
                            prop="ptmxp"
                            label="降雨量"
                        />
                        <el-table-column v-if="search.sksel === 'rainfall'" prop="time" label="日期" />
                        <el-table-column
                            v-if="search.sksel === 'rainfall'"
                            prop="drcd"
                            label="时段类型"
                        />
                    </el-table>
                </div>
            </el-tab-pane>
            <el-tab-pane name="气象雷达" label="气象雷达" v-if="pagesShow['气象雷达']">
                <weatherRadar></weatherRadar>
            </el-tab-pane>
            <el-tab-pane name="风暴潮" label="风暴潮" v-if="pagesShow['风暴潮']">
                <storm-surge></storm-surge>
            </el-tab-pane>
        </el-tabs>
        <el-dialog
            v-drag
            :class="[
                search.sksel === 'waterLine' ? 'do-not-use10' : 'do-not-use11'
            ]"
            :visible.sync="dialog.visible"
            :fullscreen="false"
            :modal="false"
            :show-close="false"
        >
            <div class="title" style="margin-bottom: 0">
                <div class="ls" />
                {{
                search.sksel === "waterLine"
                ? "浙江省主要水文站历史最高水位"
                : "浙江省历史时段最大降雨量统计表"
                }}
                <i
                    class="iconfont iconxingzhuang"
                    @click="dialog.visible = false"
                    style="float: right"
                />
            </div>
            <Component :prop="dialog.prop" :is="dialog.component" />
        </el-dialog>
    </div>
</template>

<script lang="ts">
import "../../../styles/mapView/right.scss";
import { Vue, Component, Watch } from "vue-property-decorator";
import { State, Mutation, namespace } from "vuex-class";
import AutoHeightMixins from "../../../mixins/autoHeight";
import WaterLinePop from "./components/WaterLine.vue";
import RainfallPop from "./components/Rainfall.vue";
import weatherRadar from "../weatherRadar/Main.vue";
import stormSurge from "../stormSurge/Main.vue";

const MapStore = namespace("mapCommon");
const columnData: any = [
    {
        label: "站名",
        value: "name"
    },
    {
        label: "最高水位",
        value: "htz"
    },
    {
        label: "日期",
        value: "time"
    }
];
const columnData1: any = [
    {
        label: "站名",
        value: "name"
    },
    {
        label: "降雨量",
        value: "ptmxp"
    },
    {
        label: "日期",
        value: "time"
    },
    {
        label: "时段类型",
        value: "drcd"
    }
];

@Component({
    components: {
        WaterLinePop,
        RainfallPop,
        weatherRadar,
        stormSurge
    }
})
export default class WaterFrequency extends AutoHeightMixins {
    @Mutation("getSelectArea") getSelectArea: any;
    @Mutation("getCenter") getCenter: any;
    @Mutation("setHoverPoint") setHoverPointMutation!: any;
    @Mutation("getAreaBySearch") getAreaBySearch!: Function;
    @MapStore.Mutation("updateMapPoints")
    updateMapPointsMutation!: Function;
    @MapStore.Mutation("updateOverlay") updateOverlayMutation!: Function;
    @MapStore.Mutation("closeOverlay")
    closeOverlayMutation!: Function;
    @State(state => state.userInfo.roles) rolesState: any;
    @State("pagesShow") pagesShow: any;
    @Mutation("getZoom") setZoom: any;
    @Mutation("getCenter") setMapCenter: any;

    data: any = {
        type: "极值分析",
        show: true
    };
    search: any = {
        sksel: "waterLine",
        sklx: {
            sel: ["大型", "中型"],
            list: [{ label: "大型" }, { label: "中型" }]
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
        inputVal: ""
    };
    result: any = {
        loading: false,
        thList: {
            ylxx: columnData
        },
        tbDate: [],
        point: [],
        height: 0
    };
    dialog: any = {
        visible: false,
        component: "",
        prop: []
    };

    // 点击表格行显示 overlay
    handleOpenOverlay(detail: any): void {
        const info = detail.info;
        const data = {
            lat: info.lttd,
            lon: info.lgtd,
            data: {
                ...info,
                siteType:
                    this.search.sksel === "reservior"
                        ? "雨量站"
                        : this.search.sksel === "waterLine"
                        ? "水位站"
                        : "水库站"
            },
            component: "WaterFrequencyOverlay",
            offset: [-500, -500]
        };

        this.setMapCenter([data.lon, data.lat + 0.02]);
        this.setZoom(16);
        this.updateOverlayMutation({ data });
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

    handleHoverEnter(row: any) {
        this.setHoverPointMutation({
            lat: row.lttd,
            lon: row.lgtd
        });
    }

    handleHoverLeave(row: any) {
        this.setHoverPointMutation();
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

    getData() {
        if (this.search.sksel === "rainfall") {
            this.result.thList.ylxx = columnData1;
        } else {
            this.result.thList.ylxx = columnData;
        }
        let postbody: any = this.$utils.deepCopy(this.search);
        let zlxz: string = "",
            sklx: string = "";

        if (this.search.areaType.default == 1) {
            postbody.rivers.default = "";
        } else {
            postbody.cityList.default = "";
            postbody.counties.default = "";
        }

        if (postbody.sksel === "reservior") {
            zlxz = "RR";
        } else if (postbody.sksel === "waterLine") {
            zlxz = "ZZ,ZQ,TT,DD";
        } else {
            zlxz = "PP";
        }

        if (postbody.sklx.sel.length) {
            postbody.sklx.sel.forEach(function(s: any) {
                switch (s) {
                    case "大型":
                        sklx += "4,5,";
                        break;
                    case "中型":
                        sklx += "3,";
                        break;
                }
            });
        }

        if (postbody.counties.default == "全市") {
            postbody.counties.default = "";
        }
        let city = "";
        postbody.cityList.arr.forEach((item: any) => {
            if (item.value == postbody.cityList.default) {
                city = item.label;
            }
        });
        let county = "";
        if (postbody.counties.default && postbody.counties.default != "全市") {
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
            sss: city == "全部" ? "" : city, //地级市
            ssx: county, //地级县
            zl: zlxz, //站类选择
            sklx: sklx, //水库类型
            ly: postbody.rivers.default, //流域（水系）
            zm: postbody.inputVal,
            role: this.rolesState
        };
        // this.dialog.prop = params;

        this.result.loading = true;
        this.result.tbDate = [];

        this.$http
            .get("/rest/waterFrequency/getWaterFrequencyList", {
                params
            })
            .then(res => {
                this.dialog.prop = res.data;
                this.result.loading = false;
                const points: any = [];

                res.data.forEach((item: any) => {
                    if (this.search.sksel === "rainfall") {
                        if (item.drcd.endsWith("m"))
                            item.drcd = item.drcd.split("m")[0] + "分钟";
                        if (item.drcd.endsWith("d"))
                            item.drcd = item.drcd.split("d")[0] + "天";
                        if (item.drcd.endsWith("h"))
                            item.drcd = item.drcd.split("h")[0] + "小时";
                    }
                    this.result.tbDate.push({
                        name: item.zm,
                        type: item.sklx == 3 ? "中型" : "大型",
                        river: item.ly,
                        info: item,
                        ...item
                    });
                    points.push({
                        name: item.zm,
                        id: Symbol(),
                        lat: item.lttd,
                        lon: item.lgtd,
                        data: {
                            ...item,
                            siteType: this.search.sksel
                                ? "reservior"
                                : "waterLine"
                        },
                        component: "WaterFrequencyOverlay",
                        offset: [-500, -500],
                        style: {
                            image: {
                                icon: {
                                    anchor: [0.5, 0.5],
                                    src: require("@/assets/legend/rain_0.png"),
                                    scale: 0.7
                                }
                            }
                        }
                    });
                });
                this.updateMapPointsMutation({ data: points });
            })
            .catch(() => {
                this.result.loading = false;
                this.$message("获取数据失败！");
            });
    }

    // 放大弹出框
    handleAmplification() {
        this.dialog.visible = true;
        this.search.sksel === "waterLine"
            ? (this.dialog.component = "WaterLinePop")
            : (this.dialog.component = "RainfallPop");
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
    created() {
        const vm = this;
        this.autoHeightMixin(300);
        this.getArea("2");
        this.getArea("1").then(() => {
            if (vm.$utils.selectByCode()) {
                if (vm.$utils.selectByCode().length == 4) {
                    vm.search.cityList.default =
                        vm.$utils.selectByCode() + "00";
                    this.changeCity(this.$utils.selectByCode() + "00");
                    this.getData();
                } else {
                    vm.search.cityList.default =
                        this.$utils.selectByCode().slice(0, 4) + "00";
                    this.changeCity(
                        this.$utils.selectByCode().slice(0, 4) + "00"
                    ).then(() => {
                        vm.search.counties.default = vm.$utils.selectByCode();
                        this.locateArea(this.$utils.selectByCode());
                        this.getData();
                    });
                }
            } else {
                this.getData();
            }
        });
    }

    private beforeDestroy(): void {
        this.updateMapPointsMutation({ data: [] });
        this.closeOverlayMutation();
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
}
</style>
