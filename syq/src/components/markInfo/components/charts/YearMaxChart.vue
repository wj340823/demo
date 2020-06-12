<template>
    <v-chart class="echarts" :options="options" />
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";

    @Component
    export default class YearMaxChart extends Vue {
        @Prop() readonly props!: any;
        @Prop() type!: string;
        @Prop() readonly selected!: string;

        get options() {
            const { level, flow, xAxisData } = this.props;
            let levelFormatted = [];
            let flowFormatted = [];
            let legendData =
                this.type == "max"
                    ? ["最高水位", "最大流量"]
                    : ["最低水位", "最小流量"];
            if (level.length) {
                levelFormatted = level.filter(
                    (item: any) => typeof item === "number"
                );
            }
            if (flow.length) {
                flowFormatted = flow.filter(
                    (item: any) => typeof item === "number"
                );
            }
            return {
                grid: {
                    bottom: 30,
                    right: 40,
                    top: 50,
                    left: 40
                },
                tooltip: {
                    show: true,
                    trigger: "axis"
                },
                dataZoom: {
                    type: "inside"
                },
                xAxis: {
                    type: "category",
                    boundaryGap: false,
                    axisLabel: {
                        color: "#666"
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            color: "rgb(117, 117, 255)"
                        }
                    },
                    axisTick: {
                        show: true
                    },
                    splitLine: {
                        show: true
                    },
                    data: xAxisData
                },
                yAxis: [
                    {
                        type: "value",
                        name: this.selected == "sw" ? "水位(m)" : "流量(m³)",
                        axisLabel: {
                            formatter: "{value}",
                            textStyle: {
                                color: "black"
                            }
                        },
                        axisLine: {
                            lineStyle: {
                                color: "black",
                                width: 2
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        },
                        min:
                            this.selected == "sw"
                                ? Math.floor(Math.min(...levelFormatted))
                                : Math.floor(Math.min(...flowFormatted)),
                        max:
                            this.selected == "sw"
                                ? Math.ceil(Math.max(...levelFormatted))
                                : Math.ceil(Math.max(...flowFormatted))
                    }
                ],
                series: [
                    {
                        name: legendData[0],
                        type: "line",
                        symbol: "circle",
                        barWidth: "60%",
                        itemStyle: {
                            normal: {
                                color:
                                    this.selected == "sw"
                                        ? "#61A0A8"
                                        : "#C23531",
                                lineStyle: {
                                    color:
                                        this.selected == "sw"
                                            ? "#61A0A8"
                                            : "#C23531",
                                    width: 3
                                }
                            }
                        },
                        markPoint: {
                            itemStyle: {
                                normal: {
                                    color: "red"
                                }
                            }
                        },
                        data: this.selected == "sw" ? level : flow
                    }
                ]
            };
        }
    }
</script>

<style lang="scss" scoped>
    .echarts {
        width: 484px;
        height: 370px;
        border: 2px solid rgba(153, 153, 153, 0.1);
        border-radius: 2px;
    }
</style>
