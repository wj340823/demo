<template>
    <el-row class="content">
        <el-row style="line-height: 38px;">
            <el-col class="chart" :span="19">
                <el-radio-group
                    v-model="type"
                    @change="handleChartData"
                    class="reset-radio-mr"
                    style="margin-right: 20px;"
                    size="mini"
                >
                    <el-radio label="max">极大值</el-radio>
                    <el-radio label="min">极小值</el-radio>
                </el-radio-group>
                <el-radio-group
                    @change="handleChartData"
                    v-model="selected"
                    class="reset-radio-mr"
                    style="margin-right: 20px"
                    size="mini"
                >
                    <el-radio-button label="z">水位</el-radio-button>
                    <el-radio-button label="q">流量</el-radio-button>
                </el-radio-group>
            </el-col>
            <el-col :span="5">
                <img
                    src="../../../assets/button/export-excel.png"
                    @click="handleExport"
                    class="export-button__img"
                    style="top: -1px; position: relative; margin-right: 6px"
                    alt="导出"
                />
<!--                <el-button @click="modalShow = true" size="mini">频率曲线</el-button>-->
            </el-col>
        </el-row>
        <el-row class="main">
            <p>{{ prop.zm }}（{{ prop.zh }}）年极值图表</p>
            <el-row class="content" justify="space-between" v-loading="table.loading">
                <el-col class="chart" :span="13">
                    <!-- <YearMaxChart
                        :props="charts"
                        :selected="selected"
                        :type="type"
                    />-->
                    <WaterAndFlow
                        :width="490"
                        :type="selected"
                        :data="charts.data"
                        data-type="year"
                        :legend="charts.legend"
                    />
                </el-col>
                <el-col class="table" :span="11">
                    <el-table
                        border
                        height="370"
                        :data="table.data"
                        :loading="table.loading"
                        :cell-style="highlightMax"
                    >
                        <el-table-column
                            v-for="column in tableColume"
                            :key="column.prop"
                            :sortable="column.sortable"
                            v-bind="column"
                            show-overflow-tooltip
                        />
                    </el-table>
                </el-col>
            </el-row>
            <!-- <nodata v-show="!table.show" class="modalNodata"></nodata> -->
        </el-row>
        <transition name="fade">
            <FrequencyCurve :prop="prop" v-show="modalShow" :visible.sync="modalShow" />
        </transition>
    </el-row>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import moment from "moment";
    import nodata from "./nodata.vue";
    import FrequencyCurve from "./FrequencyCurve.vue";
    import WaterAndFlow from "@/components/WaterAndFlow.vue";

    const tableColumes: any[] = [
        {
            prop: "YR",
            label: "年份",
            width: 46
        },
        {
            prop: "HTZ",
            label: "最高水位",
            _type: "max",
            sortable: true
        },
        {
            prop: "HTZTM",
            label: "发生时间",
            formatter: (row: any, column: any, cell: any) =>
                cell ? cell.slice(5) : cell,
            _type: "max"
        },
        {
            prop: "MXQ",
            label: "最大流量",
            _type: "max",
            sortable: true
        },
        {
            prop: "MXQTM",
            label: "发生时间",
            formatter: (row: any, column: any, cell: any) =>
                cell ? cell.slice(5) : cell,
            _type: "max"
        },
        {
            prop: "LTZ",
            label: "最低水位",
            _type: "min",
            sortable: true
        },
        {
            prop: "LTZTM",
            label: "发生时间",
            formatter: (row: any, column: any, cell: any) =>
                cell ? cell.slice(5) : cell,
            _type: "min"
        },
        {
            prop: "MNQ",
            label: "最小流量",
            _type: "min",
            sortable: true
        },
        {
            prop: "MNQTM",
            label: "发生时间",
            formatter: (row: any, column: any, cell: any) =>
                cell ? cell.slice(5) : cell,
            _type: "min"
        }
    ];

    @Component({
        components: {
            WaterAndFlow,
            nodata,
            FrequencyCurve
        }
    })
    export default class MeanProcess extends Vue {
        @Prop() prop: any;

        type: string = "max";
        modalShow: boolean = false;
        table: any = {
            data: [],
            loading: true,
            show: true
        };
        charts: any = {
            data: [],
            water: {
                max: [],
                min: []
            },
            flow: {
                max: [],
                min: []
            },
            legend:[]
        };
        selected: string = "z";
        max: any = {
            waterLevel: 0,
            flow: 0
        };

        @Watch("prop", { deep: true })
        changeData() {
            this.getData();
        }

        created(): void {
            this.getData();
        }

        get tableColume() {
            return tableColumes.filter(
                (item: any) => !item._type || item._type == this.type
            );
        }

        // 数据获取
        getData(): void {
            this.table.data = [];
            this.charts.data = [];
            this.table.loading = true;
            this.table.show = true;
            let vm = this;
            this.$http
                .get("/rest/rainAnalysis/getStatisticsList?zh=" + this.prop.zh)
                .then(({ data }) => {
                    this.table.loading = false;
                    if (data.length) {
                        this.table.data = data;
                        data.forEach((item: any) => {
                            this.handleMax(item);
                            if (item.HTZTM) {
                                this.charts.water.max.push({
                                    tm: item.HTZTM,
                                    z0: item.HTZ
                                });
                            }
                            if (item.LTZTM) {
                                this.charts.water.min.push({
                                    tm: item.LTZTM,
                                    z0: item.LTZ
                                });
                            }
                            if (item.MXQTM) {
                                this.charts.flow.max.push({
                                    tm: item.MXQTM,
                                    q0: item.MXQ
                                });
                            }
                            if (item.MNQTM) {
                                this.charts.flow.min.push({
                                    tm: item.MNQTM,
                                    q0: item.MNQ
                                });
                            }
                        });
                        this.charts.data = JSON.parse(
                            JSON.stringify(vm.charts.water.max.reverse())
                        );
                        this.charts.legend = ['水位']
                        this.table.data.sort((a: any, b: any) => b.HTZ - a.HTZ);
                    }
                })
                .catch(() => {
                    this.table.loading = false;
                    this.table.show = false;
                });
        }

        handleChartData() {
            const { water, flow } = this.charts;
            if (this.selected === "z" && this.type === "max") {
                this.charts.data = water.max;
                this.charts.legend = ['水位']
                this.table.data.sort((a: any, b: any) => b.HTZ - a.HTZ);
            } else if (this.selected === "z" && this.type === "min") {
                this.charts.data = water.min;
                this.charts.legend = ['水位']
            } else if (this.selected === "q" && this.type === "max") {
                this.table.data.sort((a: any, b: any) => b.MXQ - a.MXQ);
                this.charts.data = flow.max;
                this.charts.legend = ['流量']
            } else if (this.selected === "q" && this.type === "min") {
                this.charts.data = flow.min;
                this.charts.legend = ['流量']
            }
        }

        // 渲染最大值行
        highlightMax({ row, column, rowIndex, columnIndex }: any) {
            if (this.type !== "max") return;
            // else {
            //     if (this.selected === "z") {
            //         if (row.HTZ === this.max.waterLevel) {
            //             return {
            //                 "background-color": "#61A0A8",
            //                 color: "white"
            //             };
            //         }
            //     } else if (this.selected === "q") {
            //         if (row.MXQ === this.max.flow) {
            //             return {
            //                 "background-color": "#C23531",
            //                 color: "white"
            //             };
            //         }
            //     }
            // }
            if (columnIndex === 1 && this.selected === "z") {
                return { "background-color": "#C23531", color: "white" };
            }
            if (columnIndex === 3 && this.selected === "q") {
                return { "background-color": "#61A0A8", color: "white" };
            }
        }

        // 处理最大值
        handleMax(item: any) {
            // 流量
            if (Number(item.MXQ) >= this.max.flow) {
                this.max.flow = Number(item.MXQ);
            }
            // 水位
            if (Number(item.HTZ) >= this.max.waterLevel) {
                this.max.waterLevel = Number(item.HTZ);
            }
        }

        // 导出
        handleExport() {
            const params = {
                zh: this.prop.zh,
                zm: this.prop.zm
            };
            const url = this.$utils.formatURL(
                "/rest/rainAnalysis/leadoutStatisticsList",
                params
            );
            window.open(url);
        }
    }
</script>

<style lang="scss" scoped>
    .content {
        position: relative;
        padding-right: 7px;
        height: 360px;

        .options {
            &-date {
                margin-left: 10px;
            }

            .el-button {
                margin-left: 10px;
            }
        }

        .main {
            p {
                text-align: center;
                line-height: 30px;
            }
        }
    }
    ::v-deep .el-dialog__header {
        border-bottom: 1px solid #e9e9e9;
    }
</style>
