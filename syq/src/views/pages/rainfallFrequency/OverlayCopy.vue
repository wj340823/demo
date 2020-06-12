<template>
    <div class="markerCon">
        <div class="title">
            <div class="ls" />
            {{ prop.region }}
            <span @click="closeOverlay">
                <i class="iconfont iconxingzhuang" />
            </span>
        </div>
        <el-row class="content">
            <el-col :span="16">
                <!-- 时间及标题 -->
                <el-row>
                    <el-col :span="8">
                        <span>时间：</span>
                        <el-select
                            style="width: 100px"
                            v-model="options.selected"
                            @change="getChartData"
                        >
                            <el-option value="1" label="1天" />
                            <el-option value="3" label="3天" />
                            <el-option value="5" label="5天" />
                            <el-option value="7" label="7天" />
                            <el-option value="15" label="15天" />
                            <el-option value="manually" label="自定义" />
                        </el-select>
                    </el-col>
                    <!--<el-col
                        :span="16"
                        align="center"
                        style="padding-top: 6px;"
                        v-if="options.selected !== 'manually'"
                    >
                        <h4 style="padding-right: 100px">{{ prop.region }}</h4>
                    </el-col>-->
                    <el-col :span="16" v-if="options.selected === 'manually'">
                        <el-date-picker
                            type="date"
                            placeholder="开始日期"
                            v-model="options.date.start"
                            style="width: 150px; margin-right: 6px;"
                            @change="getChartData"
                        />
                        <el-date-picker
                            type="date"
                            placeholder="开始日期"
                            v-model="options.date.end"
                            style="width: 150px; margin-right: 6px;"
                            @change="getChartData"
                        />
                    </el-col>
                </el-row>
                <!-- amcharts -->
                <div class="chart">
                    <OnlyChart :data="chart.data" :type="chart.type" :width="500" :height="350" />
                </div>
                <el-row style="margin-bottom: 0">
                    <el-col :span="24" style="justify-content: center" id="hehe">
                        <span style="margin-right: 6px;">
                            累计雨量：
                            <i style="color: #33b2ff;">{{ options.data.max.total }}mm</i>
                        </span>
                        <span v-for="(item, index) in maxArray" style="margin-right: 6px;">
                            {{ item.label }}
                            <i style="color: #33b2ff;">{{ item.value }}mm</i>
                        </span>
                        <span v-show="options.data.max.max1" style="margin-right: 6px;">
                            最大1天：
                            <i style="color: #33b2ff;">{{ options.data.max.max1 }}mm</i>
                        </span>
                        <span v-show="options.data.max.max3" style="margin-right: 6px;">
                            最大3天：
                            <i style="color: #33b2ff;">{{ options.data.max.max3 }}mm</i>
                        </span>
                        <span v-show="options.data.max.max5" style="margin-right: 6px;">
                            最大5天：
                            <i style="color: #33b2ff;">{{ options.data.max.max5 }}mm</i>
                        </span>
                        <span v-show="!show && options.data.max.max7" style="margin-right: 6px;">
                            最大7天：
                            <i style="color: #33b2ff;">{{ options.data.max.max7 }}mm</i>
                        </span>
                    </el-col>
                </el-row>
                <el-row justify="center">
                    <el-col :span="24" align="center">
                        <span v-show="show" style="margin-right: 6px;">
                            最大7天：
                            <i style="color: #33b2ff;">{{ options.data.max.max7 }}mm</i>
                        </span>
                        <span v-show="show">
                            最大15天：
                            <i
                                style="color: #33b2ff; margin-right: 6px;"
                            >{{ options.data.max.max15 }}mm</i>
                        </span>
                        <img
                            class="img-button"
                            src="../../../assets/button/frequency.png"
                            @click="handleShowFrequency"
                            alt="频率成果"
                            v-show="visible.statistic"
                        />
                        <img
                            class="img-button img-button-ml"
                            src="../../../assets/button/history.png"
                            @click="handleShowHistory"
                            alt="历史对比"
                            v-show="visible.history"
                        />
                        <img
                            class="img-button img-button-ml"
                            src="../../../assets/button/export.png"
                            @click="handleExport"
                            alt="导出"
                        />
                    </el-col>
                </el-row>
            </el-col>
            <el-col :span="8">
                <el-table stripe border :data="table.data" height="420">
                    <el-table-column type="index" label="序" width="40" />
                    <el-table-column
                        v-for="column in table.column"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label"
                        :width="column.width"
                    />
                </el-table>
            </el-col>
        </el-row>
        <!-- 频率统计 -->
        <el-dialog
            :modal="false"
            :fullscreen="false"
            :show-close="false"
            :visible="overlay.frequency.visible"
            class="enforce-width"
        >
            <div class="title">
                <div class="ls" />
                {{ prop.region }} -- 频率成果
                <span @click="handleCloseFrequency">
                    <i class="iconfont iconxingzhuang" />
                </span>
            </div>

            <el-table :data="overlay.frequency.tableData" border height="300">
                <el-table-column prop="watershed" label="流域" width="80" />
                <el-table-column prop="region" label="区域名称" width="140" />
                <el-table-column prop="date" label="时段" />
                <el-table-column label="各频率面雨量（单位：mm）">
                    <el-table-column prop="one" label="1%" width="60" />
                    <el-table-column prop="two" label="2%" width="60" />
                    <el-table-column prop="five" label="5%" width="60" />
                    <el-table-column prop="ten" label="10%" width="60" />
                    <el-table-column prop="twenty" label="20%" width="60" />
                    <el-table-column prop="fifty" label="50%" width="60" />
                </el-table-column>
            </el-table>
            <img
                class="img-button img-button-ml"
                style="margin-top: 6px;"
                src="../../../assets/button/export.png"
                @click="handleExportDialog"
                alt="导出"
            />
        </el-dialog>
        <!-- 历史对比 -->
        <el-dialog
            :fullscreen="false"
            :modal="false"
            :visible="overlay.history.visible"
            :show-close="false"
            class="enforce-width"
        >
            <div class="title">
                <div class="ls" />
                {{ prop.region }} -- 历史对比
                <span @click="handleCloseHistory">
                    <i class="iconfont iconxingzhuang" />
                </span>
            </div>
            <el-table :data="overlay.history.tableData" border max-height="320">
                <el-table-column type="index" label="序号" />
                <el-table-column prop="river" label="流域" />
                <el-table-column prop="region" label="区域名称" />
                <el-table-column prop="area" label="集水面积" />
                <el-table-column label="最大1天">
                    <el-table-column prop="mn1d" label="面雨量" />
                    <el-table-column prop="year1d" label="年份" />
                    <el-table-column prop="date1d" label="发生日期" />
                </el-table-column>
                <el-table-column label="最大3天">
                    <el-table-column prop="mn3d" label="面雨量" />
                    <el-table-column prop="year3d" label="年份" />
                    <el-table-column prop="date3d" label="发生日期" />
                </el-table-column>
                <el-table-column label="最大5天">
                    <el-table-column prop="mn5d" label="面雨量" />
                    <el-table-column prop="year5d" label="年份" />
                    <el-table-column prop="date5d" label="发生日期" />
                </el-table-column>
                <el-table-column label="最大7天">
                    <el-table-column prop="mn7d" label="面雨量" />
                    <el-table-column prop="year7d" label="年份" />
                    <el-table-column prop="date7d" label="发生日期" />
                </el-table-column>
                <el-table-column label="最大15天">
                    <el-table-column prop="mn15d" label="面雨量" />
                    <el-table-column prop="year15d" label="年份" />
                    <el-table-column prop="date15d" label="发生日期" />
                </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import "@/styles/mapView/right.scss";
import moment from "moment";
import { OnlyChart } from "@/components";
import { Mutation, namespace } from "vuex-class";

const MapStore = namespace("mapCommon");
let cancelToken: any = null;
const column = [
    {
        prop: "date",
        label: "时间",
        width: 120,
        fixed: "left"
    },
    {
        prop: "rainfall",
        label: "面雨量",
        width: 60
    },
    {
        prop: "waterLevel",
        label: "水位",
        width: 70
    },
    {
        prop: "flow",
        label: "流量",
        width: 70
    }
];

@Component({
    components: {
        OnlyChart
    }
})
export default class Overlay extends Vue {
    @Mutation("closeUpdateOverlay") closeUpdateOverlayMutation!: Function;
    @MapStore.State(state => state.overlay.data) prop!: any;
    @MapStore.Mutation("closeOverlay") closeOverlay!: any;

    overlay: any = {
        frequency: {
            visible: false,
            tableData: []
        },
        history: {
            visible: false,
            tableData: []
        }
    };
    options: any = {
        selected: "1",
        visible: false,
        date: {
            start: moment()
                .subtract(1, "day")
                .format("YYYY-MM-DD HH:mm:ss"),
            end: moment().format("YYYY-MM-DD HH:mm:ss")
        },
        data: {
            max: {
                max1: 0,
                max3: 0,
                max5: 0,
                max7: 0,
                max15: 0,
                total: 0
            },
            dataList: []
        }
    };
    table: any = {
        data: [],
        column
    };
    chart: any = {
        data: [],
        type: "P",
        head: [
            {
                prop: "time",
                label: "时间"
            },
            {
                prop: "z",
                label: "水位"
            },
            {
                prop: "q",
                label: "流量"
            },
            {
                prop: "p",
                label: "雨量"
            }
        ]
    };
    // 选中15天的显隐
    show: any = false;
    visible: any = {
        statistc: true,
        history: true
    };

    created() {
        this.getChartData();
        this.getFrequencyData();
        this.getHistoryData();
    }

    @Watch("prop", { deep: true, immediate: true })
    watchProp() {
        console.log(this.prop);
        this.getChartData();
    }

    // 发散关闭事件
    emitCloseDialog(): void {
        this.closeUpdateOverlayMutation();
        this.options = {
            selected: "1",
            visible: false,
            date: [
                moment()
                    .subtract(1, "day")
                    .format("YYYY-MM-DDTHH-mm-ss"),
                moment().format("YYYY-MM-DDTHH-mm-ss")
            ],
            data: {
                max: {
                    max1: 0,
                    max3: 0,
                    max5: 0,
                    max7: 0,
                    max15: 0
                },
                dataList: []
            }
        };
    }

    get maxArray() {
        if (this.options.selected === "manually") {
            return;
        } else {
            //if(this.)
            return;
        }
    }
    // 更改时间选项时
    handleSelectChange(): void {}

    // amcharts 获取图表数据
    getChartData(): void {
        let params = {};
        this.table.data = [];
        this.chart.data = [];
        this.options.data.max.total = 0;
        const { date, selected } = this.options;

        if (Number(this.options.selected) === 15) {
            this.show = true;
        }

        if (this.options.selected === "manually") {
            params = {
                rcd: this.prop.rcd,
                st: moment(date.start).format("YYYY-MM-DDTHH:mm:ss"),
                et: moment(date.end).format("YYYY-MM-DDTHH:mm:ss")
            };
        } else {
            params = {
                rcd: this.prop.rcd,
                day: selected
            };
        }
        if (cancelToken) {
            cancelToken();
        }
        this.$http
            .get("/rest/rainFrequency/getDmHistoryData", {
                params,
                cancelToken: new this.$http.CancelToken(function(cancel) {
                    cancelToken = cancel;
                })
            })
            .then(({ data }) => {
                const vm = this;
                data.dataList.length
                    ? (this.visible.history = true)
                    : (this.visible.history = false);
                this.options.data = data;
                this.chart.data = [];
                vm.options.data.max.total = 0;
                data.dataList.forEach((item: any) => {
                    this.table.data.push({
                        waterLevel: item.water
                            ? Number(item.water).toFixed(2)
                            : item.water,
                        rainfall: item.rain
                            ? Number(item.rain).toFixed(1)
                            : item.rain,
                        date: this.$utils.dateFormat(
                            new Date(item.time),
                            "yyyy-MM-dd HH:mm"
                        ),
                        flow: item.q ? Number(item.q).toFixed(1) : item.q
                    });
                    vm.options.data.max.total += Number(
                        Number(item.rain).toFixed(1)
                    );
                    this.chart.data.push({
                        z: item.water
                            ? Number(item.water).toFixed(2)
                            : item.water,
                        q: item.q,
                        p: item.rain ? Number(item.rain).toFixed(1) : item.rain,
                        tm: item.time.split(".000")[0].replace("T", " ")
                    });
                });
                this.options.data.max.total = this.options.data.max.total.toFixed(
                    1
                );
            });
    }

    // 获取频率成果数据
    getFrequencyData(): void {
        this.$http
            .get("/rest/rainFrequency/getFrequencyResults?rcd=" + this.prop.rcd)
            .then(({ data }) => {
                if (data.length) {
                    this.visible.statistc = true;
                    const { watershed, region } = this.prop;

                    data.forEach(
                        ({ day, fq1, fq2, fq5, fq10, fq20, fq50 }: any) => {
                            this.overlay.frequency.tableData.push({
                                watershed: watershed,
                                region: region,
                                date: day,
                                one: fq1,
                                two: fq2,
                                five: fq5,
                                ten: fq10,
                                twenty: fq20,
                                fifty: fq50
                            });
                        }
                    );
                } else this.visible.statistc = false;
            });
    }

    // 打开频率成果
    handleShowFrequency(): void {
        this.getFrequencyData();
        this.overlay.frequency.visible = true;
    }

    handleCloseFrequency(): void {
        /*this.overlay.frequency.tableData = [];
            this.overlay.frequency.visible = false;*/
    }

    // 获取历史对比数据
    getHistoryData(): void {
        this.$http(
            "/rest/rainFrequency/historyDataContrast?rcd=" + this.prop.rcd
        ).then(({ data }) => {
            for (let index = 0; index < data["1d"].length; index++) {
                const objDate: any = {};
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        const element = data[key];
                        objDate.river = this.prop.watershed;
                        objDate.region = this.prop.region;
                        objDate[`mn${key}`] = element[index].yl;
                        objDate[`year${key}`] = element[index].year;
                        objDate[`date${key}`] = element[index].time;
                    }
                }
                this.overlay.history.tableData.push(objDate);
            }
        });
    }

    // 打开历史对比
    handleShowHistory(): void {
        this.getHistoryData();
        this.overlay.history.visible = true;
    }

    handleCloseHistory(): void {
        this.overlay.history.tableData = [];
        this.overlay.history.visible = false;
    }

    // 导出
    handleExport() {
        const params = {
            rcd: this.prop.rcd,
            name: this.prop.region,
            day: this.options.selected,
            st: moment(this.options.date.start).format("YYYY-MM-DDTHH:mm:ss"),
            et: moment(this.options.date.end).format("YYYY-MM-DDTHH:mm:ss")
        };
        const url = this.$utils.formatURL(
            "/rest/rainFrequency/leadoutDmHistoryData",
            params
        );
        window.open(url);
    }

    handleExportDialog() {
        const params = {
            rcd: this.prop.rcd,
            name: this.prop.region
        };
        const url = this.$utils.formatURL(
            "/rest/rainFrequency/leadoutFrequencyResults",
            params
        );
        window.open(url);
    }
}
</script>

<style lang="scss" scoped>
.markerCon {
    position: relative;
    height: 490px;
    width: 800px;
    background: #fff;

    .title {
        line-height: 40px;
        height: 40px;
        font-size: 14px;
        font-weight: bold;
        padding-left: 36px;
        margin-bottom: 0;
        color: #fff;
        background-image: linear-gradient(270deg, #1f64ff 0%, #325fd9 100%);
        border-radius: 4px 4px 0px 0px;

        .ls {
            float: left;
            width: 6px;
            height: 20px;
            margin-top: 10px;
            margin-left: -20px;
        }

        span {
            float: right;
            margin-right: 16px;
            cursor: pointer;

            i {
                font-size: 12px;
            }
        }
    }

    .content {
        width: 100%;
        height: 430px;
        padding: 10px;

        .el-row {
            margin-bottom: 6px;
        }

        .chart {
            height: 347px;
            width: 564px;
        }
    }
}

.enforce-width {
    position: absolute;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.4);
    height: auto;
    bottom: auto !important;

    ::v-deep.el-dialog {
        margin: 0 !important;

        .el-dialog__header {
            padding: 0;
        }

        .el-dialog__body {
            padding: 0 !important;

            .el-table {
                margin: 10px;
                width: 664px;
            }
        }
    }
}

.el-dialog {
    padding: 10px;
}

#hehe {
    display: flex;
}
</style>
