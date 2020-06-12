<template>
    <el-row class="content">
        <el-row class="options">
            <span>时段选择：</span>
            <el-select :clearable="false" style="width: 100px" v-model="options.select.selected">
                <el-option
                    v-for="option in options.select.data"
                    :key="option.value"
                    :value="option.value"
                >{{ option.label }}</el-option>
            </el-select>
            <span class="options-date">时间选择：</span>
            <el-date-picker
                type="date"
                placeholder="开始日期"
                v-model="options.date.start"
                style="width: 150px; margin-right: 6px;"
            />
            <el-date-picker
                type="date"
                placeholder="结束日期"
                v-model="options.date.end"
                style="width: 150px;"
            />
            <el-radio-group
                v-model="options.select.radio"
                @change="handleRadioChange"
                class="reset-radio-mr"
                style="margin-left: 15px;"
            >
                <el-radio label="z">水位</el-radio>
                <el-radio label="q">流量</el-radio>
            </el-radio-group>
            <el-button
                size="mini"
                type="primary"
                icon="el-icon-search"
                class="el-button-search"
                @click="getData"
            >查询</el-button>
            <img
                src="../../../assets/button/export-excel.png"
                @click="handleExport"
                v-if="showExportButton"
                class="export-button__img"
                style="top: -1px; position: relative;"
                alt="导出"
            />
        </el-row>
        <el-row class="main">
            <p>{{ prop.zm }}（{{ prop.zh }}）均值过程线</p>
            <el-row
                class="content"
                justify="space-between"
                v-show="table.show"
                v-loading="table.loading"
            >
                <el-col class="chart" :span="16">
                    <WaterAndFlow :type="options.select.radio" :data="charts.data" data-type="day" :line="1" :legend="charts.legend" />
                </el-col>
                <el-col class="table" :span="8">
                    <el-table border height="353" :data="table.data" :loading="table.loading">
                        <el-table-column
                            v-for="column in table.column"
                            :key="column.prop"
                            :prop="column.prop"
                            :label="column.label"
                            show-overflow-tooltip
                        />
                    </el-table>
                </el-col>
            </el-row>
            <nodata v-show="!table.show" class="modalNodata"></nodata>
        </el-row>
    </el-row>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from "vue-property-decorator";
    import moment from "moment";
    import WaterAndFlow from "@/components/WaterAndFlow.vue";
    import nodata from "./nodata.vue";

    @Component({
        components: {
            WaterAndFlow,
            nodata
        }
    })
    export default class MeanProcess extends Vue {
        @Prop() prop: any;

        options: any = {
            select: {
                data: [
                    {
                        label: "日均",
                        value: "日均"
                    },
                    {
                        label: "月均",
                        value: "月均"
                    },
                    {
                        label: "年均",
                        value: "年均"
                    }
                ],
                selected: "日均",
                radio: "z"
            },
            date: {
                start: moment()
                    .subtract(2, "year")
                    .format("YYYY-MM-DD"),
                end: moment().format("YYYY-MM-DD")
            }
        };
        table: any = {
            column: [
                {
                    prop: "date",
                    label: "标志时间"
                },
                {
                    prop: "waterLevel",
                    label: "水位"
                }
                // {
                //     prop: "flow",
                //     label: "流量"
                // }
            ],
            data: [],
            loading: true,
            show: true
        };
        charts: any = {
            flow: [],
            waterLevel: [],
            xAxisData: [],
            data: [],
            legend:[]
        };
        showExportButton: boolean = false;

        created(): void {
            this.getData();

            if (this.$route.meta.name === "realtime-water") {
                this.showExportButton = true;
            } else this.showExportButton = false;
        }

        // 切换单选组时
        handleRadioChange(): void {
            const { radio } = this.options.select;
            const { flow, waterLevel } = this.charts;

            if (radio === "z") {
                this.table.column.splice(1, 1, {
                    prop: "waterLevel",
                    label: "水位"
                });
                this.charts.data = waterLevel;
                this.charts.legend = ['水位']
            } else {
                this.table.column.splice(1, 1, { prop: "flow", label: "流量" });
                this.charts.data = flow;
                this.charts.legend = ['流量']
            }
        }

        // 数据获取
        getData(): void {
            this.table.data = [];
            this.charts.flow = [];
            this.charts.data = [];
            this.charts.waterLevel = [];
            this.charts.xAxisData = [];
            this.table.loading = true;
            this.table.show = true;

            const { date, select } = this.options;
            const params = {
                stcd: this.prop.zh,
                st: moment(date.start).format("YYYY-MM-DD"),
                et: moment(date.end).format("YYYY-MM-DD"),
                tm: select.selected
            };

            this.$http
                .get("/rest/stationDetails/getMeanValueProcess", { params })
                .then(({ data }) => {
                    this.table.loading = false;
                    if (data.length) {
                        data.forEach((item: any) => {
                            this.table.data.push({
                                flow: item.q,
                                waterLevel: item.z,
                                date: item.time
                            });
                            this.charts.flow.push({
                                tm: item.time,
                                q0: item.q
                            });
                            this.charts.waterLevel.push({
                                tm: item.time,
                                z0: item.z
                            });
                            this.charts.xAxisData.push(item.time);
                            this.charts.data = this.charts.waterLevel;
                        });
                    } else {
                        this.table.show = false;
                    }
                })
                .catch(() => {
                    this.table.loading = false;
                    this.table.show = false;
                });
        }

        // 导出
        handleExport() {
            const params = {
                stcd: this.prop.zh,
                stnm: this.prop.zm,
                tm: this.options.select.selected,
                st: this.options.date.start,
                et: this.options.date.end
            };
            const url = this.$utils.formatURL(
                "/rest/stationDetails/leadoutMeanValueProcess",
                params
            );
            window.open(url);
        }
    }
</script>

<style lang="scss" scoped>
    .content {
        padding-right: 7px;

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
</style>
