<template>
    <div class="map-overlay" v-drag>
        <header>
            <p>
                {{ dataState.zz }}-{{
                dataState.siteType === "reservior" ? "水库站" : "水位站"
                }}（{{ dataState.zm }}{{ dataState.zh }}）
            </p>
            <i class="el-icon-close" @click="closeOverlayMutation" />
        </header>
        <main>
            <div class="left-content">
                <el-row class="content-options">
                    <span>超过</span>
                    <el-input v-model="conditions.over" @change="handleType" />
                    <span>（m）</span>
                    <span class="desc" v-show="conditions.overTime">{{ conditions.overTime }}</span>
                    <span>时间：</span>
                    <el-select v-model="conditions.date.selected" @change="getChartData">
                        <el-option
                            v-for="item in conditions.date.data"
                            :key="item.label"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                    <!-- 时间自定义 -->
                    <el-popover
                        placement="top-start"
                        width="400"
                        :offset="300"
                        trigger="click"
                        :value="!conditions.date.selected"
                    >
                        <el-date-picker
                            v-model="conditions.dateRange"
                            type="daterange"
                            range-separator="至"
                            start-placeholder="开始日期"
                            end-placeholder="结束日期"
                            @blur="handleDateBlur"
                        />
                    </el-popover>
                    <el-radio
                        style="margin-left: 20px"
                        v-model="conditions.dateType"
                        label="1"
                        v-if="$utils.checkUser(roles, 'super')"
                    >小时</el-radio>
                    <el-radio
                        v-model="conditions.dateType"
                        label="2"
                        v-if="$utils.checkUser(roles, 'super')"
                    >分钟</el-radio>
                </el-row>
                <OnlyChart
                    :height="423"
                    :width="650"
                    :data="chart.data"
                    :type="chart.type"
                    :jjsw="waterLine.warning"
                    :bzsw="waterLine.insure"
                    :xxsw="waterLine.xxsw"
                    :zcsw="waterLine.zcsw"
                    @getSpecialData="handleSpecialData"
                />
                <el-row class="content-desc">
                    <ul>
                        <li>
                            <span>累计雨量：</span>
                            <span>{{ max.total }}mm</span>
                        </li>
                        <li>
                            <span>最高水位：</span>
                            <span>{{ max.highest }}mm</span>
                        </li>
                        <li>
                            <span>最新水位：</span>
                            <span>{{ max.latest }}mm</span>
                        </li>
                    </ul>
                    <div class="button-group">
                        <el-button
                            size="mini"
                            @click="handleToggleYearSeries"
                            v-if="$utils.checkUser(roles, 'super')"
                        >年极值</el-button>
                        <el-button
                            @click="handleToggleFrequencyList"
                            size="mini"
                            :disabled="false"
                            v-if="$utils.checkUser(roles, 'super')"
                        >频率成果</el-button>
                    </div>
                </el-row>
            </div>
            <div class="right-content">
                <ul>
                    <li v-show="waterLine.zl != 'RR'">
                        <span>警戒水位</span>
                        <span>{{ waterLine.warning }}</span>
                    </li>
                    <li v-show="waterLine.zl != 'RR'">
                        <span>保证水位</span>
                        <span>{{ waterLine.insure }}</span>
                    </li>
                    <li v-show="waterLine.zl == 'RR'">
                        <span>汛限水位</span>
                        <span>{{ waterLine.xxsw }}</span>
                    </li>
                    <li v-show="waterLine.zl == 'RR'">
                        <span>正常水位</span>
                        <span>{{ waterLine.zcsw }}</span>
                    </li>
                </ul>
                <el-table :data="table.data" :height="450">
                    <el-table-column type="index" label="序号" />
                    <el-table-column
                        v-for="item in table.columns"
                        :key="item.prop"
                        :prop="item.prop"
                        :label="item.label"
                        :width="item.width"
                    />
                </el-table>
            </div>
        </main>
        <!-- 年极值弹出框 -->
        <div class="map-overlay year-series" v-if="overlay.visible">
            <header>
                <p>{{ dataState.zm }}年极值系列数据详情</p>
                <i class="el-icon-close" @click="handleToggleYearSeries" />
            </header>
            <main>
                <p>{{ dataState.zm }} 当前最高水位 {{ max.highest }}m</p>
                <el-table :data="overlay.data" height="400">
                    <el-table-column type="index" label="序号" />
                    <el-table-column prop="year" label="年份" />
                    <el-table-column prop="water" label="最高水位" :sortable="true" />
                    <el-table-column prop="waterDate" label="时间" />
                    <el-table-column prop="flow" label="最大流量" :sortable="true" />
                    <el-table-column prop="flowDate" label="时间" />
                </el-table>
            </main>
        </div>
        <!-- 频率成果弹出框 -->
        <div class="map-overlay year-series" v-if="overlay1.visible">
            <header>
                <p>{{ dataState.zm }}频率统计数据详情</p>
                <i class="el-icon-close" @click="handleToggleFrequencyList" />
            </header>
            <main>
                <p
                    style="text-align: center; margin-top: 12px; margin-bottom: 8px; font-weight: normal"
                >
                    <span style="font-weight: 700; font-size: 20px; margin-right: 6px">水位频率分析成果表</span>
                    最高水位值：
                    <span
                        style="color: #33b0ff"
                    >{{ max.highest ? max.highest + "m³/s（" + time + "）" : "-" }}</span>
                </p>
                <el-table
                    :data="statistic.waterLevel"
                    style="width: 782px; margin-bottom: 20px;"
                    max-height="200"
                    border
                >
                    <el-table-column prop="watershed" label="流域" width="90" />
                    <el-table-column prop="siteName" label="站名" width="90" />
                    <el-table-column prop="type" label="数据类型" width="90" />
                    <el-table-column prop="zip" label="各频率水位（单位：m）（85基准）">
                        <el-table-column prop="one" label="1%" />
                        <el-table-column prop="two" label="2%" />
                        <el-table-column prop="five" label="5%" />
                        <el-table-column prop="ten" label="10%" />
                        <el-table-column prop="twenty" label="20%" />
                        <el-table-column prop="fifty" label="50%" />
                    </el-table-column>
                </el-table>
                <p
                    style="text-align: center; margin-bottom: 8px; margin-top: 20px; font-weight: normal"
                >
                    <span style="font-weight: 700; font-size: 20px; margin-right: 6px;">流量频率分析成果表</span>
                    最大流量值：
                    <span
                        style="color: #33b0ff"
                    >{{ chart.data[0].q?chart.data[0].q + "m（" + time + "）" : "-" }}</span>
                </p>
                <el-table
                    border
                    :data="statistic.flow"
                    style="width: 780px; margin-bottom: 20px;"
                    max-height="200"
                >
                    <el-table-column prop="watershed" label="流域" width="90" />
                    <el-table-column prop="siteName" label="站名" width="90" />
                    <el-table-column prop="type" label="数据类型" width="90" />
                    <el-table-column prop="zip" label="各频率流量（单位：m³/s）">
                        <el-table-column prop="one" label="1%" />
                        <el-table-column prop="two" label="2%" />
                        <el-table-column prop="five" label="5%" />
                        <el-table-column prop="ten" label="10%" />
                        <el-table-column prop="twenty" label="20%" />
                        <el-table-column prop="fifty" label="50%" />
                    </el-table-column>
                </el-table>
            </main>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from "vue-property-decorator";
import { namespace, State } from "vuex-class";
import {
    ConditionConfig,
    ChartConfig,
    WaterLineConfig,
    TableConfig,
    MaxConfig
} from "./Interface";
import { OnlyChart } from "@/components";
import { DateData, ColumnsForWaterLine, ColumnsForReservoir } from "./Data";
import moment from "moment";

const minData = [
    { label: "近1小时", value: 1 },
    { label: "近2小时", value: 2 },
    { label: "近3小时", value: 3 },
    { label: "近4小时", value: 4 },
    { label: "近5小时", value: 5 },
    { label: "近6小时", value: 6 },
    { label: "近12小时", value: 12 },
    { label: "近1天", value: 24 }
];
const MapStore = namespace("mapCommon");
let cancelToken: any = null;
@Component({
    components: {
        OnlyChart
    }
})
export default class Overlay extends Vue {
    @State(state => state.userInfo.roles) roles!: string;
    @MapStore.Mutation("closeOverlay") closeOverlayMutation!: Function;
    @MapStore.State(state => state.overlay.data) dataState!: {
        ly: string;
        id: number;
        zh: string;
        siteType: string;
        zz: string;
        zm: string;
    };

    private table: TableConfig = {
        columns: ColumnsForWaterLine,
        data: []
    };
    private conditions: ConditionConfig = {
        over: 0,
        date: {
            data: DateData,
            selected: 1
        },
        dateRange: "",
        overTime: "",
        dateType: "1"
    };
    private chart: ChartConfig = {
        data: [],
        type: ""
    };
    private waterLine: WaterLineConfig = {
        warning: 0,
        insure: 0,
        xxsw: 0,
        zcsw: 0,
        zl: ""
    };
    private max: MaxConfig = { latest: 0, highest: 0, total: 0 };
    overlay: any = {
        visible: false,
        data: [],
        highest: 0
    };
    overlay1: any = {
        visible: false,
        data1: [],
        data2: []
    };
    statistic: any = {
        flow: [],
        waterLevel: []
    };
    time: string = "";
    // 监听点位变化
    @Watch("dataState", { immediate: true })
    private async handleChangeID() {
        this.handleTableColumn();
        await this.getDetail();
        this.getChartData();
    }

    @Watch("conditions.dateType")
    changeType(n: any) {
        if (n == 1) {
            this.conditions.date.data = DateData;
        } else {
            this.conditions.date.data = minData;
        }
        this.getChartData();
    }

    // 获取图表数据
    private getChartData(): void {
        this.conditions.overTime = "";
        this.conditions.over = 0;
        this.chart.data = [];
        this.max = {
            highest: 0,
            total: 0,
            latest: 0
        };
        const params = this.handleCreateParams();
        if (cancelToken) {
            cancelToken();
        }
        let vm = this;
        this.$http("/rest/water/getHisData", {
            params,
            cancelToken: new this.$http.CancelToken(function(cancel) {
                cancelToken = cancel;
            })
        }).then(({ data }) => {
            const { q, pz, w } = data;
            const len = q.length;

            this.dataState.siteType === "waterLine"
                ? this.handleWaterLineData(q, pz, len)
                : this.handleReserviorData(w, pz, len);
            this.table.data = this.chart.data;
            data.pz.forEach((item: any) => {
                item.sw !== null
                    ? (this.max.latest = item.sw)
                    : (this.max.latest = "-");
            });
        });
    }

    // 获取其他详细信息
    private getDetail(): void {
        this.$http(
            "/rest/basic/getDetailSiteList?zm=" + this.dataState.zh
        ).then(({ data }) => {
            const { item, jjsw, bzsw, xxsw, zcsw, zl } = data[0];
            this.chart.type = data[0].item;
            this.waterLine = {
                warning: jjsw || "--",
                insure: bzsw || "--",
                xxsw: xxsw,
                zcsw: zcsw,
                zl: zl
            };
        });
    }

    // 根据站类更改表格表头
    private handleTableColumn(): void {
        this.dataState.siteType === "waterLine"
            ? (this.table.columns = ColumnsForWaterLine)
            : (this.table.columns = ColumnsForReservoir);
    }

    // 水位站的数据处理
    private handleWaterLineData(
        flowData: any[],
        waterLineData: any[],
        len: number
    ): void {
        for (let i = 0; i < len; i++) {
            this.chart.data.push({
                q: flowData[i].ll,
                tm: <string>flowData[i].tm.split("T").join(" "),
                z: waterLineData[i].sw,
                p: waterLineData[i].yl,
                date: <string>flowData[i].tm.split("T").join(" ")
            });
            this.handleTotalAndHighest(
                waterLineData[i].yl,
                waterLineData[i].sw,
                <string>flowData[i].tm.split("T").join(" ")
            );
        }
    }

    // 水库站的数据处理
    private handleReserviorData(
        capacityData: any[],
        waterLineData: any[],
        len: number
    ): void {
        for (let i = 0; i < len; i++) {
            this.chart.data.push({
                ck: capacityData[i].ck,
                rk: capacityData[i].rk,
                tm: <string>capacityData[i].tm.split("T").join(" "),
                z: waterLineData[i].sw,
                p: waterLineData[i].yl,
                date: <string>capacityData[i].tm.split("T").join(" ")
            });
            this.handleTotalAndHighest(
                waterLineData[i].yl,
                waterLineData[i].sw,
                <string>capacityData[i].tm.split("T").join(" ")
            );
        }
    }

    // 计算最高水位和累计雨量
    private handleTotalAndHighest(
        total: number,
        high: number,
        time: string
    ): void {
        this.max.total += Number(total);
        !this.max.highest
            ? ((this.max.highest = high), (this.time = time))
            : this.max.highest < high
            ? ((this.max.highest = high), (this.time = time))
            : null;
    }

    // 生成请求参数
    private handleCreateParams(): object {
        let type: any = 1;
        const { dateType, date, dateRange } = this.conditions;
        let dateTemp: { st: string; et: string } = { st: "", et: "" };

        if (dateType == "1") {
            date.selected
                ? (dateTemp = {
                      st: moment()
                          .subtract(date.selected, "day")
                          .format("YYYY-MM-DDTHH:mm:ss"),
                      et: moment().format("YYYY-MM-DDTHH:mm:ss")
                  })
                : (dateTemp = {
                      st: moment(dateRange[0]).format("YYYY-MM-DDTHH:mm:ss"),
                      et: moment(dateRange[1]).format("YYYY-MM-DDTHH:mm:ss")
                  });
        } else {
            date.selected
                ? (dateTemp = {
                      st: moment()
                          .subtract(date.selected, "hour")
                          .format("YYYY-MM-DDTHH:mm:ss"),
                      et: moment().format("YYYY-MM-DDTHH:mm:ss")
                  })
                : (dateTemp = {
                      st: moment(dateRange[0]).format("YYYY-MM-DDTHH:mm:ss"),
                      et: moment(dateRange[1]).format("YYYY-MM-DDTHH:mm:ss")
                  });
        }

        const params = {
            ...dateTemp,
            zm: this.dataState.zh,
            jg: dateType,
            lx: 0
        };
        return params;
    }

    // 输入框非数字判断
    private handleType(input: string): void {
        if (Number(input)) {
            const len: number = this.chart.data.filter(
                (item: { z: string }) => item.z >= input
            ).length;

            if (len) {
                if (this.conditions.dateType === "1") {
                    this.conditions.overTime = `共${len}小时`;
                } else {
                    this.conditions.overTime = `共${len * 5}分钟`;
                }
            } else {
                this.conditions.overTime = "";
            }
        } else {
            this.$message({
                type: "warning",
                message: "请输入数字"
            });
        }
    }

    // 时间弹出框选择完成后
    private handleDateBlur(): void {
        this.conditions.date.selected = 10;
        this.getChartData();
    }

    // 点击年极值
    private handleToggleYearSeries(): void {
        this.overlay.visible
            ? (this.overlay.visible = false)
            : ((this.overlay.visible = true), this.getYearSeriesData());
    }

    // 获取年极值数据
    private getYearSeriesData(): void {
        this.overlay.data = [];
        this.$http(
            `/rest/rainAnalysis/getStatisticsList?zh=${this.dataState.zh}&role=${this.roles}`
        ).then(({ data }) => {
            this.overlay.highest = data[0].HTZ;
            data.forEach((item: any) => {
                this.overlay.data.push({
                    flow: item.MXQ,
                    water: item.HTZ,
                    waterDate: item.HTZTM,
                    flowDate: item.MXQTM,
                    year: item.YR
                });
            });
        });
    }

    // 点击频率成果
    private handleToggleFrequencyList(): void {
        this.overlay1.visible
            ? (this.overlay1.visible = false)
            : ((this.overlay1.visible = true), this.getFrequencyList());
    }
    //获取频率统计数据
    private getFrequencyList(): void {
        this.$http
            .get("rest/rainAnalysis/getFrequencyList?zh=" + this.dataState.zh)
            .then(res => {
                if (res.data.length) {
                    const { ly, zm } = this.dataState;
                    res.data.forEach((item: any) => {
                        const obj = {
                            watershed: ly,
                            siteName: zm,
                            type: item.DTTYPE,
                            one: item.FQ1,
                            two: item.FQ2,
                            five: item.FQ5,
                            ten: item.FQ10,
                            twenty: item.FQ20,
                            fifty: item.FQ50,
                            time: item.MODITIME
                        };
                        if (item.RFITEM === "Z") {
                            // 水位
                            this.statistic.waterLevel.push(obj);
                        } else if (item.RFITEM === "Q") {
                            // 流量
                            this.statistic.flow.push(obj);
                        }
                    });
                }
            });
    }

    // 接受计算后的值
    private handleSpecialData(data: any): void {
        this.max.total = data[0];
        this.max.highest = data[1];
    }
}
</script>

<style lang="scss" scoped>
.map-overlay {
    width: 1024px;
    height: 544px;

    main {
        display: inline-flex;

        .left-content {
            width: 650px;

            .content-options {
                > span {
                    font-size: 14px;

                    &:last-of-type {
                        font-size: 12px;
                    }
                }

                .desc {
                    margin-right: 10px;
                }

                .el-input {
                    margin-left: 4px;
                    width: 60px;
                }

                .el-select {
                    width: 80px;
                    margin-right: 4px;
                }
            }

            .content-desc {
                line-height: 30px;
                height: 30px;
                padding-right: 10px;

                ul {
                    display: flex;
                    justify-content: flex-start;
                    list-style: none;
                    float: left;

                    li {
                        font-size: 14px;
                        margin-right: 10px;

                        span {
                            &:last-of-type {
                                color: rgb(31, 144, 235);
                            }
                        }
                    }
                }

                .button-group {
                    float: right;
                }
            }
        }

        .right-content {
            width: 356px;

            ul {
                li {
                    display: inline-block;
                    width: 50%;

                    span {
                        display: inline-block;
                        font-size: 14px;
                        padding: 5px 16px 5px 5px;
                        border: 1px solid #e9e9e9;

                        &:first-of-type {
                            width: 45%;
                            background-color: #f4f6f8;
                        }

                        &:last-of-type {
                            width: 55%;
                        }
                    }
                }
            }

            .el-table {
                height: 450px;
            }
        }
    }

    .year-series {
        position: absolute;
        width: 800px;
        height: auto;
        top: 50px;
        left: 112px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);

        main {
            display: block;

            p {
                width: 100%;
                text-align: center;
            }

            .el-table {
                width: 100%;
            }
        }
    }
}
</style>
