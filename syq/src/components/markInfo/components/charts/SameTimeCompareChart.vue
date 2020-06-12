<template>
    <v-chart class="echarts" :options="options" />
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";

    @Component
    export default class SameTimeCompareChart extends Vue {
        @Prop()
        readonly props!: any;

        get options() {
            const { legend, xAxisData, series } = this.props;
            const formatted = series[0].filter((item: any) => {
                if (item) {
                    return typeof item === "number";
                }
            });

            return {
                tooltip: {
                    trigger: "axis"
                },
                legend: {
                    color: ["#F58080", "#47D8BE", "#F9A589"],
                    data: legend,
                    top: 10
                },
                dataZoom: {
                    type: "inside"
                },
                grid: {
                    bottom: 30,
                    right: 20,
                    top: 40,
                    left: 50
                },
                xAxis: {
                    type: "category",
                    data: xAxisData,
                    axisLine: {
                        lineStyle: {
                            color: "#000",
                            width: 2
                        }
                    },
                    splitLine: {
                        show: true
                    }
                },
                yAxis: {
                    type: "value",
                    splitLine: {
                        show: false
                    },
                    axisTick: {
                        show: false
                    },
                    axisLine: {
                        show: true,
                        lineStyle: {
                            width: 2
                        }
                    },
                    nameTextStyle: {
                        color: "#999"
                    },
                    splitArea: {
                        show: false
                    },
                    min: Math.floor(Math.min(...formatted)),
                    max: Math.ceil(Math.max(...formatted))
                },
                series: this.series
            };
        }

        get series() {
            const { series } = this.props;
            const arr: any = [];

            series.forEach((item: any, index: number) => {
                arr.push({
                    name: this.props.legend[index],
                    type: "line",
                    data: item,
                    lineStyle: {
                        normal: {
                            width: 3,
                            color: "rgb(7, 150, 240)"
                        }
                    }
                });
            });

            return arr;
        }
    }
</script>

<style lang="scss" scoped>
    .echarts {
        width: 600px;
        height: 380px;
        /* background-color: orange; */
        border: 2px solid rgba(153, 153, 153, 0.1);
        border-radius: 2px;
    }
</style>
