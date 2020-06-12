<template>
    <div class="component" v-drag>
        <header>
            <p>
                {{ prop.zm }}({{ prop.zh }})——({{
                prop.zl
                }})
            </p>
            <i class="el-icon-close" @click="handleClose" />
        </header>
        <div class="echart-info">
            <div class="base">
                <ul class="ui-list">
                    <li>重现期</li>
                    <li>
                        <label for>{{matchType.label}}</label>
                        <input type="number" style="margin:0 10px" v-model="result.reVal" />
                        <span>{{matchType.dw}}</span>
                    </li>
                    <li>{{formatVal}}</li>
                    <li>
                        <label for>期望值</label>
                    </li>
                    <li>
                        <label for>重现期</label>
                        <input type="number" style="margin:0 10px" v-model="result.reYear" />
                        <span>年</span>
                    </li>
                    <li>
                        <label for>期望值:</label>
                        <span>{{formatFreq}}</span>
                    </li>
                </ul>
            </div>
            <div class="table-wrap" style="padding:5px">
                <table class="costom-table">
                    <tbody>
                        <tr>
                            <td>均值</td>
                            <td>{{result.avg}}</td>
                        </tr>
                        <tr>
                            <td>Cv</td>
                            <td>{{formaterCv}}</td>
                        </tr>
                        <tr>
                            <td>Cs</td>
                            <td>{{formaterCs}}</td>
                        </tr>
                        <tr>
                            <td>0.1%</td>
                            <td>{{result.val1}}</td>
                        </tr>
                        <tr>
                            <td>1%</td>
                            <td>{{result.val2}}</td>
                        </tr>
                        <tr>
                            <td>10%</td>
                            <td>{{result.val3}}</td>
                        </tr>
                        <tr>
                            <td>90%</td>
                            <td>{{result.val4}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="echart-ctrl">
            <div class="ctrls">
                <el-select
                    class="searchItem"
                    v-model="typeSelect.value"
                    placeholder="请选择"
                    @change="typeChange"
                >
                    <el-option
                        v-for="item in typeSelect.list"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
                <el-select
                    v-if="ylSelectShow"
                    class="searchItem"
                    v-model="ylSelect.value"
                    placeholder="请选择"
                    @change="ylChange"
                >
                    <el-option
                        v-for="item in ylSelect.list"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </el-select>
                <div class="searchItem slider">
                    <label>高差系数Cv</label>
                    <el-slider
                        v-model="result.cv"
                        :show-tooltip="false"
                        :min="0"
                        :max="2"
                        :step="0.01"
                        @input="cvChange"
                        @mousewheel.native="cvmouseScroll"
                    ></el-slider>
                    <span>{{formaterCv}}</span>
                </div>
                <div class="searchItem slider">
                    <label>偏差系数Cs</label>
                    <el-slider
                        v-model="result.cs"
                        :show-tooltip="false"
                        :disabled="csSliderDisable"
                        :min="0"
                        :max="4"
                        :step="0.01"
                        @input="csChange"
                        @mousewheel.native="csmouseScroll"
                    ></el-slider>
                    <span>{{formaterCs}}</span>
                </div>
                <div class="searchItem" style="width:auto;margin-right:0">
                    <el-checkbox v-model="cscv.select" style="margin-right:10px"></el-checkbox>
                    <label>定值Cs/Cv=</label>
                    <input type="number" v-model="cscv.value" />
                </div>
            </div>
            <p class="e-title">{{echartTitle}}</p>
            <v-chart :options="options" style="height:334px;width:690px"></v-chart>
            <p class="sm-text">注：该成果仅供参考，不作发布使用</p>
        </div>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import { State, Mutation, Action } from "vuex-class";
    import * as curveHelp from "@/utils/dataCurveHelp";

    const level = [
        99.99,
        99.95,
        99.9,
        99.8,
        99.5,
        99,
        98,
        95,
        90,
        80,
        70,
        60,
        50,
        40,
        30,
        20,
        10,
        5,
        2,
        1,
        0.5,
        0.2,
        0.1,
        0.05,
        0.01,
        0.001
    ];

    const mockData = [
        0.004488129,
        0.008976258,
        0.013464387,
        0.017952516,
        0.022440644,
        0.026928773,
        0.031416902,
        0.035905031,
        0.04039316,
        0.044881289,
        0.049369418,
        0.053857547,
        0.058345676,
        0.062833805,
        0.067321933,
        0.071810062,
        0.076298191,
        0.08078632,
        0.085274449,
        0.089762578,
        0.094250707,
        0.098738836,
        0.103226965,
        0.107715094,
        0.112203222,
        0.116691351
    ];

    const moreLevel = [
        99.98,
        99.97,
        99.96,
        99.94,
        99.93,
        99.92,
        99.91,
        99.85,
        99.7,
        99.6,
        99.4,
        99.3,
        99.2,
        99.1,
        98.8,
        98.6,
        98.4,
        98.2,
        97,
        96,
        94,
        93,
        92,
        91,
        89,
        88,
        87,
        86,
        85,
        84,
        83,
        82,
        81,
        78,
        76,
        74,
        72,
        68,
        66,
        64,
        62,
        58,
        56,
        54,
        52,
        48,
        46,
        44,
        42,
        38,
        36,
        34,
        32,
        28,
        26,
        24,
        22,
        19,
        18,
        17,
        16,
        15,
        14,
        13,
        12,
        11,
        9,
        8,
        7,
        6,
        4,
        3,
        1.8,
        1.6,
        1.4,
        1.2,
        0.9,
        0.8,
        0.7,
        0.6,
        0.4,
        0.3,
        0.15,
        0.09,
        0.08,
        0.07,
        0.06,
        0.04,
        0.03,
        0.02,
        0.008,
        0.006,
        0.004,
        0.002
    ];
    const helpLine = [
        -4.107479655,
        -3.944400084,
        -3.846126145,
        -3.775011939,
        -3.540083799,
        -3.431614404,
        -3.352794781,
        -3.238880118,
        -3.194651054,
        -3.155906758,
        -3.121389149,
        -2.967737925,
        -2.747781385,
        -2.652069808,
        -2.512144328,
        -2.45726339,
        -2.408915546,
        -2.365618127,
        -2.257129244,
        -2.197286377,
        -2.144410621,
        -2.096927429,
        -1.880793608,
        -1.750686071,
        -1.554773595,
        -1.475791028,
        -1.40507156,
        -1.340755034,
        -1.22652812,
        -1.174986792,
        -1.126391129,
        -1.080319341,
        -1.036433389,
        -0.994457883,
        -0.954165253,
        -0.915365088,
        -0.877896295,
        -0.772193214,
        -0.706302563,
        -0.643345405,
        -0.582841507,
        -0.467698799,
        -0.412463129,
        -0.358458793,
        -0.305480788,
        -0.201893479,
        -0.150969215,
        -0.100433721,
        -0.050153583,
        0.050153583,
        0.100433721,
        0.150969215,
        0.201893479,
        0.305480788,
        0.358458793,
        0.412463129,
        0.467698799,
        0.582841507,
        0.643345405,
        0.706302563,
        0.772193214,
        0.877896295,
        0.915365088,
        0.954165253,
        0.994457883,
        1.036433389,
        1.080319341,
        1.126391129,
        1.174986792,
        1.22652812,
        1.340755034,
        1.40507156,
        1.475791028,
        1.554773595,
        1.750686071,
        1.880793608,
        2.096927429,
        2.144410621,
        2.197286377,
        2.257129244,
        2.365618127,
        2.408915546,
        2.45726339,
        2.512144328,
        2.652069808,
        2.747781385,
        2.967737925,
        3.121389149,
        3.155906758,
        3.194651054,
        3.238880118,
        3.352794781,
        3.431614404,
        3.540083799
    ];

    const distance = [
        3.719016485,
        3.290526731,
        3.090232306,
        2.878161739,
        2.575829304,
        2.326347874,
        2.053748911,
        1.644853627,
        1.281551566,
        0.841621234,
        0.524400513,
        0.253347103,
        0,
        -0.253347103,
        -0.524400513,
        -0.841621234,
        -1.281551566,
        -1.644853627,
        -2.053748911,
        -2.326347874,
        -2.575829304,
        -2.878161739,
        -3.090232306,
        -3.290526731,
        -3.719016485,
        -4.264890794
    ];
    const DIS = 4.264890794;
    const XSW = 1; //小数位
    const CS = 3.8;
    const CV = 1.7;

    @Component
    export default class FrequencyCurve extends Vue {
        @Prop(Object) prop!: any;
        typeSelect: any = {
            value: "水位",
            list: [
                { label: "水位", value: "水位", dw: "m" },
                { label: "流量", value: "流量", dw: "m³/s" },
                { label: "雨量", value: "雨量", dw: "mm" }
            ]
        };
        ylSelect: any = {
            value: "1天",
            list: [
                { label: "1天", value: "1天" },
                { label: "3天", value: "3天" },
                { label: "7天", value: "7天" }
            ]
        };
        cscv: any = {
            select: false,
            value: 0.447
        };
        result: any = {
            avg: 0,
            cs: 0,
            cv: 0,
            fip: 0,
            val1: 0,
            val2: 0,
            val3: 0,
            val4: 0
        };
        options: any = null;
        markers: any[] = [];

        handleClose() {
            this.$emit("update:visible", false);
        }
        get ylSelectShow() {
            return this.typeSelect.value == "雨量";
        }
        get csSliderDisable() {
            return this.cscv.select;
        }
        get formaterCv() {
            return this.result.cv.toFixed(2);
        }
        get formaterCs() {
            return this.result.cs.toFixed(2);
        }
        get echartTitle() {
            let zdmc = this.prop.zm || "";
            let zdbm = this.prop.zh || "";
            let type = this.typeSelect.list.find(
                (item: any) => item.value == this.typeSelect.value
            );
            return `${zdmc}(${zdbm})${type.label}频率曲线`;
        }
        get matchType() {
            return (
                this.typeSelect.list.find(
                    (item: any) => item.value == this.typeSelect.value
                ) || {}
            );
        }
        get formatVal() {
            let { cs, cv, avg } = this.result;
            let a = 4 / cs / cs;
            let fiY = this.result.reVal;
            if (!fiY) return "xx年一遇";
            let fiP = (fiY / avg - 1) / cv;
            let x = (2 * (fiP + 2 / cs)) / cs;
            let pi = curveHelp.lowRegGamma(a, x);
            let p = pi > 0.5 ? 1 / (1 - pi) : 1 / pi;
            let year = isNaN(p) ? 1000 : Math.ceil(p);
            return year < 1000 ? `${year}年一遇` : "超过1000年一遇";
        }
        get formatFreq() {
            let reYear = this.result.reYear;
            let { cs, cv, avg } = this.result;
            if (!reYear) return "";
            let pmin = 100 / reYear;
            let pmax = 100 * (1 - 1 / reYear);
            let f1 = curveHelp.getFipByCs(pmin, cs);
            let f2 = curveHelp.getFipByCs(pmax, cs);
            let y1 = curveHelp.getXp(avg, f1, cv);
            let y2 = curveHelp.getXp(avg, f2, cv);
            let ymin = Math.min(y1, y2);
            let ymax = Math.max(y1, y2);
            return `${ymin.toFixed(2)}~${ymax.toFixed(2)}`;
        }
        cvmouseScroll(e: any) {
            this.result.cv =
                e.wheelDelta < 0 ? this.result.cv + 0.01 : this.result.cv - 0.01;
        }
        csmouseScroll(e: any) {
            if (this.cscv.select) return;
            this.result.cs =
                e.wheelDelta < 0 ? this.result.cs + 0.01 : this.result.cs - 0.01;
        }
        cvChange(value: number) {
            let { cs, cv } = this.result;
            if (this.cscv.select) {
                this.result.cs = value * Math.abs(this.cscv.value);
            } else {
                this.cscv.value = cv ? Number((cs / cv).toFixed(2)) : 0;
            }
            this.updateEchart();
        }
        csChange(value: number) {
            let { cs, cv } = this.result;
            if (this.cscv.select) {
                return;
            } else {
                this.cscv.value = cv ? Number((cs / cv).toFixed(2)) : 0;
            }
            this.updateEchart();
        }
        typeChange() {
            this.getInitData();
        }
        ylChange() {
            this.getInitData();
        }
        initLine(markers: any[]) {
            const markerVals: number[] = markers.map((item: any) => item.val || 0);
            return distance.map((distance: number, index: number) => {
                let { cs, cv } = this.result;
                let p = level[index];
                let fip = (this.result.fip = curveHelp.getFipByCs(p, cs));
                let avg = curveHelp.getAvg(markerVals);
                let y = cv ? curveHelp.getXp(avg, fip, cv) : avg;
                let yf = y.toFixed(XSW);
                this.result.avg = avg.toFixed(XSW);
                if (p == 0.1) {
                    this.result.val1 = yf;
                } else if (p == 1) {
                    this.result.val2 = yf;
                } else if (p == 10) {
                    this.result.val3 = yf;
                } else if (p == 90) {
                    this.result.val4 = yf;
                }
                return [distance, y];
            });
        }
        initMarkers(data: any[]) {
            return data.map((marker: any, index: number) => {
                return [marker.s, marker.val || 0];
            });
        }
        initMarkLine() {
            const exclude: number[] = [99.95, 99.8, 99.5, 0.1];
            return distance
                .filter((distance: number, index: number) => {
                    return !exclude.includes(level[index]);
                })
                .map((distance: number, index: number) => {
                    return {
                        xAxis: distance,
                        name: "频率"
                    };
                });
        }
        initHelpLine() {
            return helpLine.map((distance: number) => {
                return {
                    xAxis: distance,
                    name: "频率"
                };
            });
        }
        getInitData() {
            this.getInitCsCv();
            this.getInitMarkers();
        }
        async getInitCsCv() {
            let { zh, zl } = this.prop;
            let typeValue = this.typeSelect.value;
            let params: any = {
                stcd: zh,
                item: typeValue,
                zl
            };
            if (typeValue == "雨量") {
                params.tm = this.ylSelect.value;
            }
            return this.$http
                .get("/rest/stationDetails/getCvAndCs", { params })
                .then((res: any) => {
                    const { cs, cv } = res.data || { cs: CS, cv: CV };
                    this.result.cs = cs;
                    this.result.cv = cv;
                    this.updateEchart();
                });
        }
        async getInitMarkers() {
            let { zh } = this.prop;
            let typeValue = this.typeSelect.value;
            let params: any = {
                stcd: zh,
                item: typeValue
            };
            if (typeValue == "雨量") {
                params.tm = this.ylSelect.value;
            }
            this.$http
                .get("/rest/stationDetails/getRainFrequencyCurve", { params })
                .then((res: any) => {
                    this.markers = res.data || [];
                    this.updateEchart();
                });
        }
        async updateCscv() {
            let { zh, zl } = this.prop;
            let { cs, cv } = this.result;
            let typeValue = this.typeSelect.value;
            let params: any = {
                stcd: zh,
                item: typeValue,
                zl,
                cs,
                cv
            };
            if (typeValue == "雨量") {
                params.tm = this.ylSelect.value;
            }
            this.$http
                .get("/rest/stationDetails/updateCvAndCs", { params })
                .then((res: any) => {
                    //todo
                });
        }
        updateEchart() {
            if (!this.result.cs) return; //cs不能为0
            let ynames: any = {
                雨量: "降雨量",
                流量: "流量",
                水位: "水位"
            };
            let { label, dw } = this.matchType;
            let lineData = this.initLine(this.markers);
            let markers = this.initMarkers(this.markers);
            let markLine = this.initMarkLine();
            let helpLine = this.initHelpLine();
            this.options.yAxis[1].name = `${ynames[label]}(${dw})`;
            this.options.series[0].markLine.data = markLine;
            this.options.series[0].data = lineData;
            this.options.series[1].data = markers;
            this.options.series[2].markLine.data = helpLine;
        }
        initEcharts() {
            let allDistance = distance.concat(helpLine);
            let allLevel = level.concat(moreLevel.reverse());
            this.options = {
                color: ["red", "#33b2ff"],
                tooltip: {
                    formatter: function(f: any) {
                        let i: any;
                        if (f.name == "频率") {
                            //console.log(f.value);
                            allDistance.forEach(function(item: any, j: number) {
                                if (item.toFixed(2) == f.value) {
                                    i = j;
                                    return;
                                }
                            });
                            return "频率:" + allLevel[i];
                        }
                    }
                },
                grid: {
                    right: 80,
                    left: 30,
                    top: 30,
                    bottom: 30
                },
                xAxis: {
                    type: "value",
                    axisLabel: {
                        show: false
                    },
                    nameLocation: "end",
                    name: "频率(%)",
                    splitLine: {
                        show: false
                    },
                    min: -4.464890794
                },
                yAxis: [
                    {
                        type: "value",
                        splitLine: {
                            show: true
                        },
                        axisTick: {
                            show: false
                        },
                        position: "left",
                        offset: -4.464890794
                    },
                    {
                        name: "降雨量(mm)",
                        type: "value",
                        position: "left"
                    }
                ],
                series: [
                    {
                        data: [],
                        type: "line",
                        showSymbol: false,
                        markLine: {
                            data: [],
                            symbol: "none",
                            label: {
                                show: true,
                                position: "start",
                                formatter: function(f: any) {
                                    let i: any;
                                    distance.some(function(item: any, j: number) {
                                        if (item.toFixed(2) == f.value) {
                                            i = j;
                                            return i;
                                        }
                                    });
                                    return level[i];
                                },
                                rotate: 45
                            },
                            axisLabel: {
                                show: false
                            },
                            lineStyle: {
                                normal: {
                                    color: "#000",
                                    width: 1,
                                    type: "solid"
                                }
                            }
                        }
                    },
                    {
                        type: "scatter",
                        symbolSize: 4,
                        itemStyle: {
                            color: "#000"
                        },
                        data: []
                    },
                    {
                        data: [],
                        type: "line",
                        showSymbol: false,
                        markLine: {
                            data: [],
                            symbol: "none",
                            label: { show: false },
                            axisLabel: {
                                show: false
                            },
                            lineStyle: {
                                normal: {
                                    color: "#5C5AFB",
                                    width: 1,
                                    type: "dashed"
                                }
                            }
                        }
                    }
                ]
            };
        }
        @Watch("prop")
        propChange(nval: any) {
            if (nval.zh) {
                this.getInitData();
            }
        }
        mounted() {
            this.initEcharts();
            this.updateEchart();
            this.getInitData();
        }
        beforeDestroy() {
            this.updateCscv();
        }
    }
</script>
<style lang="scss" scoped>
    .component {
        position: absolute;
        top: -35px;
        left: -38px;
        background-color: white;
        -webkit-box-shadow: 0 0 12px rgba(0, 0, 0, 0.3);
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.3);
        z-index: 11111;
        width: 904px;

        header {
            display: flex;
            justify-content: space-between;
            padding: 0 16px 0 30px;
            line-height: 40px;
            color: white;
            background-image: linear-gradient(270deg, #1f64ff 0%, #325fd9 100%);

            i {
                line-height: 40px;
                font-size: 20px;
                cursor: pointer;
            }
        }
    }
    .echart-ctrl {
        overflow: hidden;
        height: 450px;
        > .ctrls {
            height: 40px;
            // border-bottom: solid 1px #e9e9e9;
            position: relative;
            // &::after{
            //     position: absolute;
            //     content:"";
            //     display: inline-block;
            //     height: 1px;
            //     background:#e9e9e9;
            //     top:40px;
            //     left:-10px;
            //     width:500px;
            // }
        }
        .sm-text {
            font-size: 12px;
            color: #333333;
            padding: 0;
        }
        .searchItem {
            display: inline-block;
            width: 70px;
            margin-right: 10px;
            &.slider {
                width: auto;
            }
            .el-slider {
                display: inline-block;
                width: 60px;
                vertical-align: middle;
                margin-right: 10px;
            }
            label {
                color: #333333;
                margin-right: 5px;
            }
            span {
                vertical-align: middle;
            }
            .el-input__icon {
                height: auto;
            }
            .el-checkbox__input {
                margin-top: -2px;
            }
            .el-slider__runway {
                height: 20px;
                background: #f7f7f7;
                &.disabled {
                    .el-slider__button {
                        background: #d6d6d6;
                    }
                }
            }
            .el-slider__bar {
                height: 20px;
                background: transparent;
            }
            .el-slider__button-wrapper {
                height: 20px;
                width: 8px;
                top: 0;
            }
            .el-slider__button {
                width: 100%;
                height: 100%;
                border-radius: 0;
                border: none;
                background-color: #5c8fe6;
            }
        }
        .el-input--suffix .el-input__inner {
            padding-left: 8px;
        }
    }
    .e-title {
        font-size: 16px;
        color: #333333;
        text-align: center;
    }
    .echart-info {
        float: right;
        height: 450px;
        width: 208px;
        border-left: 1px solid #e9e9e9;
        > .base {
            padding-left: 16px;
            font-size: 14px;
            color: #333333;
        }
    }
    .ui-list {
        list-style: none;
        > li {
            height: 38px;
            line-height: 38px;
            label {
                margin-right: 6px;
            }
        }
    }
    input {
        width: 60px;
        height: 30px;
        background-color: #ffffff;
        border-radius: 3px;
        border: solid 1px #e9e9e9;
    }
    .costom-table {
        width: 100%;
        border-collapse: collapse;
        border-left: solid 1px #e9e9e9;
        border-top: solid 1px #e9e9e9;
        td {
            color: #333333;
            width: 50%;
            line-height: 28px;
            text-align: center;
            border-right: solid 1px #e9e9e9;
            border-bottom: solid 1px #e9e9e9;
        }
        > tbody > tr > td {
            &:first-child {
                background: #f4f6f8;
                color: #999999;
            }
        }
    }
</style>
