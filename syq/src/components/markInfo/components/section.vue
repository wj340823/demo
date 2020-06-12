<template>
    <div>
        <div>
            <span>施测时间：</span>
            <el-select v-model="data.select">
                <el-option
                    v-for="(item, index) in data.list"
                    :label="item.label"
                    :value="item.label"
                    :key="index"
                ></el-option>
            </el-select>
            <div>
                <v-chart
                    ref="section"
                    :options="dmOptions"
                    style="height: 360px; float: left"
                    :style="data.open ? { width: '700px' } : { width: '300px' }"
                ></v-chart>
                <el-table
                    :data="data.data"
                    height="360"
                    border
                    stripe
                    v-if="data.open"
                    style="float: left;width: calc(100% - 700px);"
                >
                    <el-table-column type="index" label="序"></el-table-column>
                    <el-table-column prop="di" :label="label"></el-table-column>
                    <el-table-column
                        prop="zb"
                        label="河底高程"
                    ></el-table-column>
                </el-table>
            </div>
        </div>
        <!--<el-row>
                <el-col :span="10" style="color: rgb(233,205,46)"
                >警戒水位：<span>{{ content.info.jjsw }}m</span></el-col
                >
                <el-col :span="4"></el-col>
                <el-col :span="10" style="text-align: right;color: red"
                >保证水位：{{ content.info.bzsw }}m
                </el-col
                >
            </el-row>
            <el-row
                    style="color: #999;font-size: 12px;line-height: 30px;margin-bottom: -10px"
            >
                <el-col :span="10">左岸堤顶高度：<span>34.135m</span></el-col>
                <el-col :span="4"></el-col>
                <el-col :span="10" style="text-align: right;"
                >右岸堤顶高度：35.045m
                </el-col
                >
            </el-row>-->
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";

    function compare(property: any) {
        return function(a: any, b: any) {
            var value1 =
                a[property] == "-"
                    ? 0
                    : a[property] === null || a[property] === ""
                    ? 0
                    : Number(a[property]);
            var value2 =
                b[property] == "-"
                    ? 0
                    : b[property] === null || b[property] === ""
                    ? 0
                    : Number(b[property]);
            return value1 - value2;
        };
    }

    @Component
    export default class sectionHd extends Vue {
        @Prop() data: any;
        label: any = "左岸距离";
        get dmOptions() {
            let vm = this;
            let minDi: any;
            let dmData = this.data.data;
            let series0: any = [],
                series1: any = [],
                series2: any = [],
                series3: any = [],
                series4: any = [],
                series5: any = [],
                series6: any = [],
                series7: any = [],
                series8: any = [];
            if (dmData.length) {
                let getMIn: any = [];
                dmData.filter((item: any) => {
                    getMIn.push(item.zb);
                    return item.di !== null && item.zb !== null;
                });
                dmData.sort(compare("di"));
                minDi = Math.min(...getMIn);
                if (dmData[0].bgbk == "R") {
                    vm.label = "离右岸距离";
                    let arr = JSON.parse(JSON.stringify(dmData));
                    arr.forEach((item: any, i: number) => {
                        dmData[arr.length - i - 1].di = item.di;
                    });
                    dmData.reverse().forEach((item: any, i: number) => {
                        series8.push([item.di, item.zb]);
                        if (item.zb >= 0) {
                            series0.push([item.di, item.zb]);
                            series6.push([item.di, null]);
                        } else {
                            series0.push([item.di, null]);
                            series6.push([item.di, item.zb]);
                        }
                        series1.push([item.di, vm.data.jjsw]);
                        series2.push([item.di, vm.data.bzsw]);
                        if (vm.data.lastsw >= item.zb) {
                            series3.push([item.di, vm.data.lastsw]);
                        }
                        series4.push([item.di, vm.data.zcsw]);
                        series5.push([item.di, vm.data.xxsw]);
                        series7.push([item.di, minDi]);
                    });
                } else {
                    vm.label = "离左岸距离";
                    dmData.forEach((item: any) => {
                        series8.push([item.di, item.zb]);
                        if (item.zb >= 0) {
                            series0.push([item.di, item.zb]);
                            series6.push([item.di, null]);
                        } else {
                            series0.push([item.di, null]);
                            series6.push([item.di, item.zb]);
                        }
                        series1.push([item.di, vm.data.jjsw]);
                        series2.push([item.di, vm.data.bzsw]);
                        if (vm.data.lastsw >= item.zb) {
                            series3.push([item.di, vm.data.lastsw]);
                        }
                        series4.push([item.di, vm.data.zcsw]);
                        series5.push([item.di, vm.data.xxsw]);
                        series7.push([item.di, minDi]);
                    });
                }
            }
            return {
                title: {
                    text: ""
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        label: {
                            backgroundColor: "#fff"
                        }
                    },
                    formatter: function(param: any) {
                        let str: string = "";
                        param.forEach((item: any) => {
                            if (item.seriesName != "" && item.data[1]) {
                                str +=
                                    item.seriesName +
                                    ":" +
                                    item.data[1] +
                                    "<br/>";
                            }
                        });
                        return str;
                    }
                },
                grid: {
                    left: "2%",
                    right: "2%",
                    bottom: "10%",
                    top: "16%",
                    containLabel: true
                },
                xAxis: [
                    {
                        name: vm.label + "(m)",
                        type: "value",
                        boundaryGap: false,
                        splitLine: {
                            show: false
                        },
                        nameTextStyle: {
                            lineHeight: 30
                        },
                        nameLocation: "middle",
                        splitNumber: 9,
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        }
                    }
                ],
                yAxis: [
                    {
                        name: "高程(m)",
                        type: "value",
                        splitLine: {
                            show: false
                        },
                        min: minDi
                    }
                    //239,208,185
                ],
                dataZoom: [
                    {
                        type: "inside",
                        zoomOnMouseWheel: true, //
                        moveOnMouseMove: true // zoomOnMouseWheel
                    }
                ],
                series: [
                    {
                        name: "最新水位",
                        type: "line",
                        symbol: "none",
                        lineStyle: {
                            normal: {
                                color: "rgb(0,180,253)",
                                type: "dotted",
                                width: 2
                            }
                        },
                        areaStyle: {
                            color: {
                                type: "linear",
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [
                                    {
                                        offset: 0,
                                        color: "rgb(169,220,241)" // 0% 处的颜色
                                    },
                                    {
                                        offset: 1,
                                        color: "rgb(180,240,255)" // 100% 处的颜色
                                    }
                                ],
                                global: false // 缺省为 false
                            }
                        },
                        data: series3
                    },
                    {
                        //小于0部分绘色
                        name: "",
                        type: "line",
                        symbol: "none",
                        lineStyle: {
                            normal: {
                                color: "rgb(0,0,0)",
                                width: 1
                            }
                        },
                        areaStyle: {
                            color: "rgb(253,176,108)"
                        },
                        data: series7
                    },
                    {
                        name: "河底高程",
                        type: "line",
                        lineStyle: {
                            normal: {
                                color: "rgb(242,143,60)",
                                width: 2
                            }
                        },
                        data: series8
                    },
                    {
                        name: "",
                        type: "line",
                        symbol: "none",
                        lineStyle: {
                            normal: {
                                width: 0
                            }
                        },
                        areaStyle: {
                            origin: "auto",
                            color: {
                                type: "linear",
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [
                                    {
                                        offset: 0,
                                        color: "rgb(180,240,255)" // 0% 处的颜色
                                    },
                                    {
                                        offset: 1,
                                        color: "rgb(220,255,255)" // 100% 处的颜色
                                    }
                                ],
                                global: false // 缺省为 false
                            }
                        },
                        data: series6
                    },
                    {
                        //大于0部分绘色
                        name: "",
                        type: "line",
                        symbol: "none",
                        lineStyle: {
                            normal: {
                                width: 0
                            }
                        },
                        areaStyle: {
                            color: "rgb(253,176,108)"
                        },
                        data: series0
                    },
                    {
                        name: "警戒水位",
                        type: "line",
                        symbol: "none",
                        lineStyle: {
                            normal: {
                                color: "rgb(233,205,46)",
                                type: "solid",
                                width: 2
                            }
                        },
                        data: series1
                    },
                    {
                        name: "保证水位",
                        type: "line",
                        symbol: "none",
                        lineStyle: {
                            normal: {
                                color: "red",
                                type: "solid",
                                width: 2
                            }
                        },
                        data: series2
                    },
                    {
                        name: "正常水位",
                        type: "line",
                        symbol: "none",
                        lineStyle: {
                            normal: {
                                color: "rgb(233,205,46)",
                                type: "solid",
                                width: 2
                            }
                        },
                        data: series4
                    },
                    {
                        name: "汛限水位",
                        type: "line",
                        symbol: "none",
                        lineStyle: {
                            normal: {
                                color: "red",
                                type: "solid",
                                width: 2
                            }
                        },
                        data: series5
                    }
                ]
            };
        }

        @Watch("data.select")
        changeSelect(n: any) {
            let vm = this;
            let params: any = {
                stcd: this.data.zh,
                time: n
            };
            this.$http
                .get("/rest/stationDetails/getCurveofSection", {
                    params: params
                })
                .then((data: any) => {
                    vm.data.data = data.data;
                });
        }
        @Watch("data.open")
        changeOpen(n: boolean) {
            const chart: any = this.$refs.section;
            let width = 300;
            if (n) {
                width = 700;
            }
            chart.resize({ width: width });
        }
    }
</script>

<style scoped></style>
