<template>
    <div class="details">
        <!--<div class="title">
            {{ data.type }}
        </div>-->
        <el-tabs v-model="data.type" type="card">
            <el-tab-pane name="面雨量排频排位" label="面雨量排频排位">
                <el-radio-group
                    v-model="options.radio"
                    type="flex"
                    justify="center"
                    class="radio-switch"
                    @change="handleRadioChange"
                >
                    <el-radio label="flow" value="flow">流域</el-radio>
                    <el-radio label="flat" value="flat">平原</el-radio>
                    <el-radio label="water" value="water">水库</el-radio>
                    <el-radio label="region" value="region">行政区划</el-radio>
                </el-radio-group>
                <!-- 流域与平原 -->
                <div
                    class="searchBar"
                    style="padding: 0"
                    v-show="
                        options.radio === 'flow' || options.radio === 'flat'
                    "
                >
                    <el-input
                        class="searchItem"
                        style="width: 230px"
                        v-model="options.input"
                        placeholder="站名站码拼音码"
                    />
                    <el-button
                        size="mini"
                        type="primary"
                        icon="el-icon-search"
                        class="el-button-search"
                        @click="handleSearch"
                        style="position: relative; top: 1px;"
                    >查询</el-button>
                    <img
                        src="../../../assets/button/export-excel.png"
                        @click="handleExport"
                        class="export-button__img"
                        alt="导出"
                    />
                </div>
                <!-- 水库 -->
                <div v-show="options.radio === 'water'" style="margin-top: 6px; margin-left: 10px;">
                    <el-row>
                        <el-col :span="6" style="margin-right: 10px;">
                            <el-select
                                v-model="options.water.selected.left"
                                @change="handleWaterLeftSelectChange"
                            >
                                <el-option label="行政区" value="region" />
                                <el-option label="流域" value="flow" />
                            </el-select>
                        </el-col>
                        <el-col :span="6" style="margin-right: 10px;">
                            <el-select
                                v-model="options.water.selected.center"
                                @change="handleWaterCenterSelectChange"
                            >
                                <el-option
                                    v-for="option in options.water.optionList"
                                    :key="option.value"
                                    :label="option.label"
                                    :value="option.value"
                                />
                            </el-select>
                        </el-col>
                        <el-col :span="6">
                            <el-select
                                v-model="options.water.selected.right"
                                v-show="options.water.visible"
                                @change="getWaterData"
                            >
                                <el-option
                                    v-for="option in optionsData.detailList"
                                    :key="option.value"
                                    :label="option.label"
                                    :value="option.value"
                                />
                            </el-select>
                        </el-col>
                    </el-row>
                    <el-row style="margin-left: 2px; margin-top: 6px;">
                        <el-col :span="5">
                            <span>水库类型：</span>
                        </el-col>
                        <el-col :span="10">
                            <el-checkbox-group
                                v-model="options.water.checkbox"
                                @change="getWaterData"
                            >
                                <el-checkbox label="大型" />
                                <el-checkbox label="中型" />
                            </el-checkbox-group>
                        </el-col>
                    </el-row>
                    <div class="searchBar" style="padding: 0;">
                        <el-input
                            class="searchItem"
                            style="width:260px;  margin: 0; margin-right: 10px;"
                            v-model="options.input"
                            placeholder="站名站码拼音码"
                        />
                        <el-button
                            size="mini"
                            type="primary"
                            icon="el-icon-search"
                            class="el-button-search"
                            @click="getWaterData"
                            style="position: relative; top: 1px;"
                        >查询</el-button>
                    </div>
                </div>
                <!-- 行政区划 -->
                <el-row
                    v-show="options.radio === 'region'"
                    style="margin-top: 6px; margin-left: 10px;"
                >
                    <el-col :span="6" style="margin-right: 10px;">
                        <el-select v-model="options.region.selected" :disabled="true">
                            <el-option label="行政区" value="region">行政区</el-option>
                        </el-select>
                    </el-col>
                    <el-col :span="6">
                        <el-select v-model="options.region.city" @change="handleRegionSelectChange">
                            <el-option
                                v-for="option in optionsData.regions"
                                :key="option.value"
                                :label="option.label"
                                :value="option.value"
                            />
                        </el-select>
                    </el-col>
                </el-row>
                <div class="tab" style="margin-top: 10px">
                    <span>查询结果</span>
                    <small>{{ data.date }} ~ {{ data.dateEnd }}</small>
                </div>
                <div class="result">
                    <el-table
                        v-loading="table.loading"
                        :data="table.tbData"
                        style="width: 100%"
                        @row-click="handleRowClick"
                        :height="heightMixin"
                    >
                        <el-table-column type="index" width="40" label="序" />
                        <el-table-column
                            v-for="(item, index) in table.thData"
                            :prop="item.value"
                            :label="item.label"
                            :key="index"
                            :width="item.width"
                            show-overflow-tooltip
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
            class="do-not-use7"
            :fullscreen="false"
            :modal="false"
            :show-close="false"
            v-if="dialog.visible"
            :visible="dialog.visible"
        >
            <Overlay @emitCloseDialog="handleCloseDialog" :prop="dialog.data" />
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { State, Mutation, namespace } from "vuex-class";
import { Row } from "iview";
import Overlay from "./Overlay.vue";
import moment from "moment";
import "../../../styles/mapView/right.scss";
import AutoHeightMixin from "../../../mixins/autoHeight";
import weatherRadar from "../weatherRadar/Main.vue";
const MapStore = namespace("mapCommon");
import stormSurge from "../stormSurge/Main.vue";

enum Radio {
    Flow = "flow",
    Flat = "flat",
    Water = "water",
    Region = "region"
}
const heights = [600, 600, 540, 590];
const thDataForRest = [
    {
        label: "流域",
        value: "watershed"
    },
    {
        label: "区域",
        value: "region",
        width: 160
    },
    {
        label: "面雨量",
        value: "rainfall"
    }
];
const thDataForRegion = [
    {
        label: "区域",
        value: "region"
    },
    {
        label: "面雨量",
        value: "rainfall",
        width: 80
    }
];

@Component({
    components: {
        Overlay,
        weatherRadar,
        stormSurge
    }
})
export default class RainfallFrequency extends AutoHeightMixin {
    @State("pagesShow") pagesShow: any;
    @Mutation("getSelectArea") getSelectArea: any;
    @Mutation("getCenter") getCenter: any;
    // @Mutation("updateOverlay") updateOverlayMutation: any;
    @MapStore.Mutation("updateOverlay") updateOverlayMutation: any;
    @MapStore.Mutation("updateMapPoints")
    updateMapPointsMutation!: Function;

    data: any = {
        type: "面雨量排频排位",
        show: true,
        date: moment()
            .subtract(72, "hours")
            .format("YYYY-MM-DD hh:mm:ss"),
        dateEnd: moment().format("YYYY-MM-DD hh:mm:ss")
    };
    table: any = {
        height: 686,
        thData: thDataForRest,
        tbData: [],
        loading: false
    };
    dialog: any = {
        visible: false,
        data: {}
    };
    options: any = {
        radio: "flow",
        input: "",
        water: {
            selected: {
                left: "region",
                center: "",
                right: ""
            },
            optionList: [],
            visible: true,
            checkbox: ["大型", "中型"]
        },
        region: {
            selected: "region",
            city: ""
        }
    };
    optionsData: any = {
        regions: [
            {
                value: "",
                label: "全部"
            }
        ],
        watershed: [
            {
                value: "",
                label: "全部"
            }
        ],
        detailList: [
            {
                value: "",
                label: "全部"
            }
        ]
    };
    download: any = {
        url: "",
        inter:
            "http://172.25.150.135:8080/rest/rainFrequency/leadoutRainFrequencyList"
    };
    points: any = [];

    created(): void {
        this.handleSelectFlow();
        this.autoHeightMixin(306);
    }

    // 获取基础省市数据
    async getRegionData() {
        // 未请求数据
        if (this.optionsData.regions.length === 1) {
            const data = await this.getMoreDetail({ areaFlag: 1 });

            data.forEach(({ sss }: any) => {
                this.optionsData.regions.push({
                    label: sss,
                    value: sss
                });
            });
        }
    }

    // 获取基础流域数据
    async getWatershedData() {
        // 未请求数据
        if (this.optionsData.watershed.length === 1) {
            const data = await this.getMoreDetail({ areaFlag: 2 });

            data.forEach(({ ly }: any) => {
                this.optionsData.watershed.push({
                    label: ly,
                    value: ly
                });
            });
        }
    }

    // 获取县或流域函数
    getMoreDetail(params: any): any {
        return this.$http
            .get("/rest/basic/getAreaList", { params })
            .then(({ data }: any) => data);
    }

    // 切换单选项时
    handleRadioChange(type: string): void {
        if (type === Radio.Flow) {
            this.options.input = "";
            this.handleSelectFlow();
            this.table.thData = thDataForRest;
            this.autoHeightMixin(306);
        } else if (type === Radio.Flat) {
            this.options.input = "";
            this.handleSelectFlat();
            this.table.thData = thDataForRest;
        } else if (type === Radio.Water) {
            this.options.input = "";
            this.handleSelectWater();
            this.table.thData = thDataForRest;
            this.autoHeightMixin(370);
        } else if (type === Radio.Region) {
            this.handleSelectRegion();
            this.table.thData = thDataForRegion;
        }
    }

    // 选中流域时
    handleSelectFlow(): void {
        this.table.height = heights[0];
        const params = {
            areaType: 2,
            zm: this.options.input
        };

        this.handleTableData(params);
        this.download.url = `${this.download.inter}?areaType=2&zm=${this.options.input}`;
    }

    // 选中平原时
    handleSelectFlat(): void {
        this.table.height = heights[1];
        const params = {
            areaType: 4,
            zm: this.options.input
        };

        this.handleTableData(params);
        this.download.url = `${this.download.inter}?areaType=4&zm=${this.options.input}`;
    }

    // 选中水库时
    handleSelectWater(): void {
        this.getRegionData();
        this.table.height = heights[2];
        this.options.water.optionList = this.optionsData.regions;
        this.options.water.selected = {
            left: "region",
            center: "",
            right: ""
        };

        this.getWaterData();
    }
    // 左侧的 select 改变
    handleWaterLeftSelectChange(): void {
        this.getWatershedData();

        this.options.water.selected.center = "";
        this.options.water.selected.right = "";

        // 选中流域
        if (this.options.water.selected.left === "flow") {
            this.options.water.visible = false;
            this.options.water.optionList = this.optionsData.watershed;
        } else {
            // 选中行政区
            this.options.water.visible = true;
            this.options.water.optionList = this.optionsData.regions;
        }

        this.getWaterData();
    }
    // 中间的 select 改变
    handleWaterCenterSelectChange(selected: string): void {
        this.getWaterRightSelectData();
    }
    // 请求右侧 select 数据
    async getWaterRightSelectData() {
        this.options.water.selected.right = "";

        this.optionsData.detailList = [
            {
                value: "",
                label: "全部"
            }
        ];
        const { left, center } = this.options.water.selected;

        const params = {
            areaFlag: left === "region" ? 1 : 2,
            city: center
        };
        const data = await this.getMoreDetail(params);

        data.forEach(({ ssx }: any) => {
            this.optionsData.detailList.push({
                value: ssx,
                label: ssx
            });
        });

        this.getWaterData();
    }
    // 请求数据
    getWaterData(): void {
        const { selected, checkbox } = this.options.water;
        const { input } = this.options.input;
        let params: any = {};

        if (selected.left === "flow") {
            params = {
                areaType: 3,
                sss: selected.center,
                ly: selected.right,
                sklx: checkbox.join(","),
                zm: input
            };
        } else {
            params = {
                areaType: 3,
                sss: selected.center,
                ssx: selected.right,
                sklx: checkbox.join(","),
                zm: input
            };
        }

        this.handleTableData(params);
        this.download.url = `${this.download.inter}?areaType=3&sss=${params.sss}&ssx=${params.ssx}&sklx=${params.sklx}&zm=${params.zm}`;
    }

    // 选中行政区划时
    handleSelectRegion(): void {
        this.getRegionData();
        this.table.height = heights[3];
        this.options.region.city = "";
        this.handleRegionSelectChange();
    }
    // 在选中行政区划时更改行政区
    handleRegionSelectChange(): void {
        const params = {
            areaType: 1,
            sss: this.options.region.city
        };

        this.handleTableData(params);
        this.download.url = `${this.download.inter}?areaType=1&sss=${params.sss}`;
    }

    // 点击搜索时
    handleSearch(): void {
        if (this.options.radio === Radio.Flow) {
            this.handleSelectFlow();
        } else if (this.options.radio === Radio.Flat) {
            this.handleSelectFlat();
            this.table.height = heights[1];
        } else if (this.options.radio === Radio.Water) {
            this.handleSelectWater();
        } else if (this.options.radio === Radio.Region) {
            this.handleSelectRegion();
            this.table.height = heights[3];
        }
    }

    // 请求并处理表格数据
    handleTableData(params: any): void {
        this.table.tbData = [];
        this.points = [];
        this.table.loading = true;
        this.$http
            .get("/rest/rainFrequency/getRainFrequencyList", { params })
            .then(({ data }) => {
                this.table.loading = false;
                if (data.length) {
                    data.forEach(({ name, ly, myl, rcd, lgtd, lttd }: any) => {
                        this.table.tbData.push({
                            watershed: ly,
                            rainfall: myl,
                            region: name,
                            rcd,
                            lgtd,
                            lttd
                        });
                        this.points.push({
                            id: Symbol(),
                            name: name,
                            info: {
                                watershed: ly,
                                rainfall: myl,
                                region: name,
                                rcd,
                                lgtd,
                                lttd
                            },
                            lat: lttd,
                            lon: lgtd,
                            component: "RainfallRequencyOverlay",
                            offset: [-360, -450],
                            style: {
                                image: {
                                    icon: {
                                        anchor: [0.5, 1],
                                        src: require("@/assets/legend/rain_0.png"),
                                        scale: 0.7
                                    }
                                }
                            }
                        });
                    });
                    this.updateMapPointsMutation({ data: this.points });
                }
            });
    }

    // 点击表格行
    handleRowClick(row: any): void {
        console.log("row------------------", row);
        this.dialog.data = row;
        if (!row.lttd) {
            row.lttd = 30;
            row.lgtd = 120;
        }
        const data = {
            lon: row.lgtd,
            lat: row.lttd,
            component: "RainfallRequencyOverlay",
            offset: [-450, -430],
            data: {
                rcd: row.rcd,
                region: row.region,
                watershed: row.watershed
            }
            /*name: "RainfallRequencyOverlay",
                data: row,
                position: [row.lgtd, row.lttd + 0.2]*/
        };

        this.getCenter([row.lgtd, row.lttd + 0.2]);
        this.updateOverlayMutation({ data });
    }

    // 关闭 Dialog
    handleCloseDialog(): void {
        this.handleDialogVisible(false);
    }

    // 控制显隐的函数
    handleDialogVisible(bool: boolean): void {
        this.dialog.visible = bool;
    }

    hideList() {
        this.$emit("closeRight");
    }

    // 导出
    handleExport() {
        const radio = this.options.radio;
        let params = null;

        if (radio === Radio.Flow) {
            params = {
                areaType: 2,
                zm: this.options.input
            };
        } else if (radio === Radio.Flat) {
            params = {
                areaType: 4,
                zm: this.options.input
            };
        } else if (radio === Radio.Water) {
            params = {
                areaType: 3
            };
        } else if (radio === Radio.Region) {
            params = {
                areaType: 1,
                sss: this.options.region.city
            };
        }

        const url = this.$utils.formatURL(
            "/rest/rainFrequency/leadoutRainFrequencyList",
            params
        );
        window.open(url);
    }
}
</script>

<style lang="scss" scoped>
.details {
    .radio-switch {
        margin: 10px 0 6px 10px;
    }

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

        .el-input__inner {
            background-color: rgb(1, 105, 225, 0.05);
        }
    }
}
</style>
