<template>
    <v-chart :options="options" />
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";

    @Component
    export default class MeanProcessChart extends Vue {
        @Prop() readonly props!: any;
        @Prop() readonly selected!: string;

        get options() {
            const { data, xAxisData } = this.props;
            let formattedData = data.filter(
                (item: any) => typeof item === "number"
            );

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
                legend: {
                    show: true,
                    x: "center",
                    y: "15",
                    icon: "stack",
                    itemWidth: 12,
                    itemHeight: 3,
                    textStyle: {
                        color: "black"
                    },
                    data: this.selected === "waterLevel" ? "水位" : "流量"
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
                        name:
                            this.selected === "waterLevel"
                                ? "水位(m)"
                                : "流量(m²/s)",
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
                        min: Math.floor(Math.min(...data)),
                        max: Math.ceil(Math.max(...data))
                    }
                ],
                series: {
                    name: this.selected === "waterLevel" ? "水位" : "流量",
                    type: "line",
                    symbol: "circle",
                    itemStyle: {
                        normal: {
                            color: "#61A0A8",
                            lineStyle: {
                                color: "#61A0A8",
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
                    data: data
                }
            };
        }
    }
</script>

<style>
    .echarts {
        width: 100%;
        height: 354px;
        border: 2px solid rgba(153, 153, 153, 0.1);
        border-radius: 2px;
    }
</style>
