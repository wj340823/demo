<template>
    <el-row class="content">
        <el-row class="content-options">
            <el-col :span="5">
                <span>选择：</span>
                <el-select
                    v-model="options.choice"
                    style="width: 120px"
                    @change="getData"
                >
                    <el-option label="平均水位" value="平均水位" />
                    <el-option label="平均流量" value="平均流量" />
                </el-select>
            </el-col>
            <!-- <el-col :span="5">
                <span>旬月选择：</span>
                <el-select v-model="options.minMonth" @change="getLastestYears">
                    <el-option label="上旬" value="上" />
                    <el-option label="中旬" value="中" />
                    <el-option label="下旬" value="下" />
                    <el-option label="全月" value="全月" />
                </el-select>
            </el-col>-->
            <el-col :span="5">
                <span>近两年：</span>
                <el-select v-model="options.now" @change="handleChangeNearYear">
                    <el-option
                        v-for="item in optionsData.now"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                </el-select>
            </el-col>
            <el-col :span="5">
                <span>对比年：</span>
                <el-select
                    v-model="options.compared"
                    @change="handleChangeCompareYear"
                >
                    <el-option
                        v-for="item in optionsData.compared"
                        :key="item"
                        :label="item"
                        :value="item"
                    />
                </el-select>
            </el-col>
            <el-button
                size="mini"
                type="primary"
                icon="el-icon-search"
                class="el-button-search"
                @click="getData"
                >查询</el-button
            >
            <img
                src="../../../assets/button/export-excel.png"
                @click="handleExport"
                v-if="showExportButton"
                class="export-button__img"
                style="top: -1px; position: relative;"
                alt="导出"
            />
        </el-row>
        <h4 v-if="table.show">
            {{ prop.zm }}({{ prop.zh }})月{{ options.text }}均值与历史均值对比
        </h4>
        <el-row class="content-content" v-loading="table.loading">
            <el-col class="content-chart" :span="16" v-if="table.show">
                <EachMonthCompareChart :props="charts" />
            </el-col>
            <el-col class="content-table" :span="8" v-if="table.show">
                <el-table
                    border
                    height="354"
                    :data="table.tbData"
                    :loading="table.loading"
                >
                    <el-table-column prop="date" label="标志时间" />
                    <el-table-column
                        v-for="column in table.column"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label"
                    />
                    <el-table-column prop="value" label="历年月均值" />
                </el-table>
            </el-col>
        </el-row>
        <nodata v-if="!table.show" />
    </el-row>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from "vue-property-decorator";
    import { EachMonthCompareChart } from "./charts";
    import moment from "moment";
    import nodata from "./nodata.vue";

    interface OptionsDataConfig {
        now: number[];
        compared: number[];
    }

    interface OptionsConfig {
        choice: string;
        minMonth: string;
        now: number | string;
        compared: number | string;
        disabled: boolean;
        text: string;
    }

    interface TableRowConfig {
        date: string;
        value: number;
        [propName: string]: string | number;
    }

    interface TableColumnConfig {
        prop: string;
        label: string;
    }

    interface TableConfig {
        loading: boolean;
        column: TableColumnConfig[];
        tbData: TableRowConfig[];
        show: boolean;
    }

    interface DataConfig {
        month: string;
        new: number;
        con: number;
        his: number;
    }

    interface ChartOptionConfig {
        name: string;
        data: number[];
    }
    interface ChartConfig {
        now: ChartOptionConfig;
        compared: ChartOptionConfig;
        history: ChartOptionConfig;
        xAxisData: string[];
        text: string;
    }

    const currentYear = moment().format("YYYY");

    @Component({
        components: {
            EachMonthCompareChart,
            nodata
        }
    })
    export default class EachMonthCompare extends Vue {
        @Prop()
        prop!: any;

        optionsData: OptionsDataConfig = {
            now: [currentYear, currentYear - 1],
            compared: []
        };
        options: OptionsConfig = {
            choice: "平均水位",
            minMonth: "全月",
            now: currentYear,
            compared: currentYear - 1,
            disabled: false,
            text: "水位"
        };
        table: TableConfig = {
            loading: false,
            tbData: [],
            column: [
                {
                    label: "",
                    prop: ""
                },
                {
                    label: "",
                    prop: ""
                }
            ],
            show: false
        };
        charts: ChartConfig = {
            now: {
                name: "",
                data: []
            },
            compared: {
                name: "",
                data: []
            },
            history: {
                name: "历年月均值",
                data: []
            },
            xAxisData: [],
            text: "水位"
        };
        showExportButton: boolean = false;

        async created() {
            if (this.$route.meta.name === "realtime-water") {
                this.showExportButton = true;
            } else this.showExportButton = false;
            // await this.getLastestYears();
            this.handleCreateComparedYears();
        }

        // 获取年份数据
        getLastestYears(): void {
            const params = {
                stcd: this.prop.zh,
                mon: this.options.minMonth
            };

            this.$http("/rest/stationDetails/getTenOrMonthHisYear", {
                params
            }).then(({ data }) => {
                if (Object.keys(data).length === 2) {
                    this.options.disabled = false;
                    const { newest, history } = data;

                    history.forEach((item: { year: number }) => {
                        this.optionsData.compared.push(item.year);
                    });
                    this.handleChangeNow();
                    this.getData();
                    this.handleChangeYear();
                } else {
                    this.options.disabled = true;
                    this.options.now = "无数据";
                    this.options.compared = "无数据";
                    this.table.show = false;
                }
            });
        }

        // 获取数据
        getData(): any {
            this.handleSwitchChoice();
            this.handleChangeYear();

            this.table.tbData = [];
            this.table.loading = true;
            this.charts.now.data = [];
            this.charts.compared.data = [];
            this.charts.history.data = [];
            this.charts.xAxisData = [];

            if (this.options.disabled) {
                this.table.loading = false;
                return;
            } else {
                const { choice, minMonth, now, compared } = this.options;
                const params = {
                    stcd: this.prop.zh,
                    item: choice,
                    mon: minMonth,
                    nowYear: now,
                    conYear: compared
                };

                this.$http
                    .get("/rest/stationDetails/getTenOrMonthContrast", {
                        params
                    })
                    .then(({ data }) => {
                        this.table.loading = false;
                        if (data.length) {
                            this.table.show = true;
                            data.forEach((item: DataConfig) => {
                                this.table.tbData.push({
                                    date: item.month,
                                    value: item.his,
                                    [now]: item.new,
                                    [compared]: item.con
                                });

                                this.charts.now.data.push(item.new);
                                this.charts.compared.data.push(item.con);
                                this.charts.history.data.push(item.his);
                                this.charts.xAxisData.push(item.month);
                            });

                            this.charts.now.name = now + "年月均值";
                            this.charts.compared.name = compared + "年月均值";
                        } else {
                            this.table.show = false;
                        }
                    })
                    .catch(() => {
                        this.table.loading = false;
                    });
            }
        }

        // 更改对比年时更改当前年数据
        handleChangeCompareYear(): void {
            const index = this.optionsData.compared.findIndex(
                (item: number) => this.options.compared === item
            );

            if (index === 0) {
                this.options.now = this.optionsData.now[1];
            } else if (index === 1) {
                this.options.now = this.optionsData.now[0];
            }
        }

        // 更改近两年时更改对比年数据
        handleChangeNearYear(): void {
            const index = this.optionsData.now.findIndex(
                (item: number) => this.options.now === item
            );

            if (index === 0) {
                this.options.compared = this.optionsData.compared[1];
            } else if (index === 1) {
                this.options.compared = this.optionsData.compared[0];
            }
        }

        // 生成对比年份
        handleCreateComparedYears(): void {
            for (let year = currentYear; year >= 1933; year--) {
                this.optionsData.compared.push(year);
            }
        }

        // 切换对比年改变近两年的选项
        handleChangeNow(): void {
            // this.optionsData.compared = JSON.parse(
            //     JSON.stringify(this.optionsData.now)
            // );
            this.options.compared = this.optionsData.compared[0];
            // this.handleChangeCompared()
        }

        // 切换对比年
        // handleChangeCompared() {
        //     this.optionsData.now = [
        //         Number(this.options.compared),
        //         Number(this.options.compared) - 1
        //     ];
        //     this.options.now = this.options.compared
        // }

        // 切换平均流量和平均水位时
        handleSwitchChoice(): void {
            if (this.options.choice === "平均水位") {
                this.options.text = "水位";
                this.charts.text = "水位";
            } else {
                this.options.text = "流量";
                this.charts.text = "流量";
            }
        }

        // 切换年份的时候
        handleChangeYear(): void {
            this.table.column = [
                {
                    label: this.options.now.toString(),
                    prop: this.options.now.toString()
                },
                {
                    label: this.options.compared.toString(),
                    prop: this.options.compared.toString()
                }
            ];
        }

        // 导出
        handleExport() {
            const params = {
                stcd: this.prop.zh,
                stnm: this.prop.zm,
                item: this.options.choice,
                mon: this.options.minMonth,
                nowYear: this.options.now,
                conYear: this.options.compared
            };
            const url = this.$utils.formatURL(
                "/rest/stationDetails/leadoutTenOrMonthContrast",
                params
            );
            window.open(url);
        }
    }
</script>

<style lang="scss" scoped>
    .content {
        &-options {
            .el-col-5 {
                .el-select {
                    width: 90px;
                }
            }

            .el-col-4 {
                .el-select {
                    width: 90px;
                }
            }
        }

        h4 {
            text-align: center;
        }

        &-content {
            .content-table {
                padding-right: 14px;
            }
        }
    }
</style>
