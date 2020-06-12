<template>
    <div class="content">
        <el-row class="content-options">
            <el-col :span="5">
                <span>起：</span>
                <el-date-picker
                    v-model="options.date.start"
                    type="datetime"
                    format="MM-dd HH:mm"
                    placeholder="选择日期"
                    :clearable="false"
                />
            </el-col>
            <el-col :span="5">
                <span>止：</span>
                <el-date-picker
                    v-model="options.date.end"
                    type="datetime"
                    format="MM-dd HH:mm"
                    placeholder="选择日期"
                    :clearable="false"
                />
            </el-col>
            <el-col :span="6">
                <span>比较年：</span>
                <el-select
                    v-model="options.years"
                    multiple
                    collapse-tags
                    placeholder="请选择"
                    @change="handleChangeSelect"
                >
                    <el-option
                        v-for="option in options.yearsData"
                        :key="option"
                        :value="option"
                        :label="option"
                    />
                </el-select>
            </el-col>
            <el-col :span="4">
                <el-radio-group
                    @change="handleChangeRadio"
                    v-model="options.radio"
                    class="reset-radio-mr"
                >
                    <el-radio label="z">水位</el-radio>
                    <el-radio label="q">流量</el-radio>
                </el-radio-group>
            </el-col>
            <el-button
                size="mini"
                type="primary"
                icon="el-icon-search"
                class="el-button-search"
                @click="getData"
                >查询</el-button
            >
            <div
                class="export-button"
                @click="handleExport"
                style="position: absolute;
                    right: 25px;
                    width: 40px;
                    height: 32px;
                    padding: 0px 0px 0px 9px;
                    bottom: 3px;
                    border: 1px solid rgb(204, 204, 204);
                    border-radius: 4px;"
            >
                <img
                    style="width: 20px; height: 20px; cursor: pointer"
                    src="@/assets/export.png"
                    alt
                />
            </div>
        </el-row>
        <h4>{{ prop.zm }}({{ prop.zh }})历史同期对比</h4>
        <el-row class="content-content">
            <el-col :span="16">
                <WaterAndFlow
                    :type="options.radio"
                    :data="charts.data"
                    :line="charts.line"
                    dataType="day"
                    :legend="options.years"
                />
            </el-col>
            <el-col :span="8">
                <el-table
                    style="width: 288px"
                    border
                    height="354"
                    :data="table.data"
                    :loading="table.loading"
                >
                    <el-table-column
                        v-for="column in table.column"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label"
                        :width="column.width"
                        :fixed="column.fixed"
                        show-overflow-tooltip
                    />
                </el-table>
            </el-col>
        </el-row>
        <nodata v-if="!table.show"></nodata>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import moment from "moment";
    import nodata from "./nodata.vue";
    import WaterAndFlow from "@/components/WaterAndFlow.vue";

    const years = [
        "2020",
        "2019",
        "2018",
        "2017",
        "2016",
        "2015",
        "2014",
        "2013",
        "2012",
        "2011",
        "2010"
    ];

    @Component({
        components: {
            WaterAndFlow,
            nodata
        }
    })
    export default class SameTimeCompare extends Vue {
        @Prop()
        prop!: any;

        options: any = {
            date: {
                start: moment()
                    .subtract(1, "day")
                    .format("YYYY-MM-DD HH:mm"),
                end: moment().format("YYYY-MM-DD HH:mm")
            },
            yearsData: years,
            years: ["2020"],
            radio: "z"
        };
        table: any = {
            column: [
                {
                    prop: "date",
                    label: "时间",
                    width: 100,
                    fixed: "left"
                }
            ],
            data: [],
            loading: false,
            show: false
        };
        charts: any = {
            waterLevel: [],
            flow: [],
            data: [],
            line: 1
        };
        showExportButton: boolean = false;
        @Watch("options.years")
        getOptionYears(n: any) {
            if (n.length > 6) {
                n.pop();
                this.$message("最多可选择6年！");
            }
        }
        created(): void {
            this.getData();

            if (this.$route.meta.name === "realtime-water") {
                this.showExportButton = true;
            } else this.showExportButton = false;
        }

        handleChangeSelect(data: any) {
            if (!data.length) {
                this.options.years = ["2020"];
            }
        }

        // 获取数据
        getData(): void {
            this.table.data = [];
            this.charts = {
                waterLevel: [],
                flow: [],
                data: [],
                line: this.options.years.length
            };

            this.createTableHead();

            const { date, years, radio } = this.options;
            const params = {
                stcd: this.prop.zh,
                st: moment(date.start).format("YYYY-MM-DDTHH:mm:ss"),
                et: moment(date.end).format("YYYY-MM-DDTHH:mm:ss"),
                item: radio,
                years: years.join(","),
                zl: this.prop.zl
            };

            this.$http("/rest/stationDetails/getSameCompare", { params })
                .then(({ data }) => {
                    this.table.show = false;
                    if (data.length) {
                        this.handleTableData(data);
                        this.handleChartData(data);
                    }
                })
                .catch(() => {
                    this.table.show = false;
                });
        }

        handleChangeRadio() {
            const { radio } = this.options;
            const { waterLevel, flow } = this.charts;

            if (radio === "z") {
                this.charts.data = waterLevel;
            } else {
                this.charts.data = flow;
            }
        }

        // 图表数据生成
        handleChartData(data: any): void {
            const len = data[0].data.length;
            const obj: any = Object.create(null);

            Object.keys(data).forEach((key: any) => {
                let objKey: any;

                if (this.options.radio === "z") objKey = "z" + key;
                else objKey = "q" + key;
                obj[objKey] = "";
            });
            obj.tm = "";

            const keys = Object.keys(obj);
            const arr: any = [];

            for (let j = 0; j < data.length; j++) {
                for (let i = 0; i < len; i++) {
                    const copy = JSON.parse(JSON.stringify(obj));
                    const found = data[j].data[i];

                    if (j === 0) {
                        copy["tm"] = found.time;
                        copy[keys[j]] = found.value;
                        arr.push(copy);
                    } else {
                        arr[i][keys[j]] = found.value;
                    }
                }
            }
            this.charts.data = arr;
        }

        // 表格数据生成
        handleTableData(data: any): void {
            this.table.data = [];
            const len = data[0].data.length;

            for (let i = 0; i < len; i++) {
                const obj: any = {
                    date: ""
                };

                data.forEach((item: any) => {
                    const found = item.data[i];

                    obj.date = found.time.slice(0, -3);
                    obj[item.year] = found.value;
                });
                this.table.data.push(obj);
            }
        }

        // 生成表头
        createTableHead(): void {
            this.table.column.splice(1);
            this.options.years.forEach((item: any) => {
                this.table.column.push({
                    prop: item,
                    label: item + "年"
                });
            });
        }

        // 导出
        handleExport() {
            const params = {
                stcd: this.prop.zh,
                stnm: this.prop.zm,
                st: encodeURIComponent(
                    moment(this.options.date.start).format(
                        "YYYY-MM-DDTHH:mm:ss"
                    )
                ),
                et: encodeURIComponent(
                    moment(this.options.date.end).format("YYYY-MM-DDTHH:mm:ss")
                ),
                item: this.options.radio,
                years: this.options.years.join(","),
                zl: this.prop.zl
            };
            const url = this.$utils.formatURL(
                "/rest/stationDetails/leadooutSameCompare",
                params
            );
            window.open(url);
        }
    }
</script>

<style lang="scss" scoped>
    .content {
        &-options {
            .el-date-editor {
                width: 140px;
            }

            .el-select {
                width: 160px;
            }
        }

        h4 {
            text-align: center;
        }
    }
</style>
