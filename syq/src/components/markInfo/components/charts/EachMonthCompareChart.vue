<template>
    <v-chart class="echarts" :options="options" />
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

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

@Component
export default class EachMonthCompareChart extends Vue {
    @Prop()
    readonly props!: ChartConfig;

    get options() {
        if (this.props) {
            const { now, compared, history, xAxisData } = this.props;

            return {
                tooltip: {
                    show: true,
                    trigger: "axis"
                },
                grid: {
                    bottom: 30,
                    right: 20,
                    top: 50,
                    left: 50
                },
                legend: {
                    data: [now.name, compared.name, history.name],
                    textStyle: {
                        color: "black"
                    },
                    top: "10",
                    itemWidth: 12,
                    itemHeight: 8
                },
                xAxis: {
                    data: xAxisData,
                    axisLine: {
                        lineStyle: {
                            color: "black"
                        }
                    },
                    axisLabel: {
                        color: "black",
                        fontSize: 12
                    }
                },
                yAxis: {
                    name: this.props.text,
                    nameTextStyle: {
                        color: "black",
                        fontSize: 14
                    },
                    axisLine: {
                        lineStyle: {
                            color: "black"
                        }
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        color: "black",
                        fontSize: 12
                    },
                    splitLine: {
                        show: true,
                        lineStyle: {
                            color: "rgba(153, 153, 153, 0.1)"
                        }
                    }
                },
                series: [
                    {
                        name: now.name,
                        type: "bar",
                        barWidth: 10,
                        itemStyle: {
                            normal: {
                                color: "#769AA0"
                            }
                        },
                        data: now.data
                    },
                    {
                        name: compared.name,
                        type: "bar",
                        barWidth: 10,
                        itemStyle: {
                            normal: {
                                color: "#E69D87"
                            }
                        },
                        data: compared.data
                    },
                    {
                        name: history.name,
                        type: "bar",
                        barWidth: 10,
                        itemStyle: {
                            normal: {
                                color: "#8DC1AA"
                            }
                        },
                        data: history.data
                    }
                ]
            };
        } else {
            return {};
        }
    }
}
</script>

<style lang="scss" scoped>
.echarts {
    width: 600px;
    height: 354px;
    /* background-color: orange; */
    border: 2px solid rgba(153, 153, 153, 0.1);
    border-radius: 2px;
}
</style>
