<template>
    <div class="markerCon" v-drag>
        <div class="title">
            <h3>
                {{ forecast.data.info.zm }}预报结果
                <span @click="forecast.show = false"
                    ><i class="iconfont iconxingzhuang"></i
                ></span>
            </h3>
        </div>
        <div style="clear: both">
            <div style="float:left;">
                <only-chart
                    :data="forecastList.chartData"
                    :type="forecast.data.info.item"
                    :width="550"
                    :height="320"
                    :dateType="'month'"
                    @getSpecialData="getSpecialData"
                ></only-chart>
            </div>
            <div style="float: left;width: calc(100% - 550px)">
                <el-table
                    :data="forecastList.tbdata"
                    :height="320"
                    border
                    stripe
                >
                    <el-table-column
                        type="index"
                        label="序"
                        width="40"
                    ></el-table-column>
                    <el-table-column
                        prop="tm"
                        label="时间"
                        width="120"
                        show-overflow-tooltip
                    ></el-table-column>
                    <el-table-column prop="z" label="水位"></el-table-column>
                    <el-table-column prop="q" label="流量"></el-table-column>
                    <el-table-column
                        prop="p"
                        label="雨量"
                        width="70"
                    ></el-table-column>
                </el-table>
            </div>
        </div>
        <div style="line-height: 30px;vertical-align: middle">
            <span style="margin-left: 10px">
                累计雨量：{{ forecastList.sumYl }}
            </span>
            <span style="margin: 0 20px">
                最高水位：{{ forecastList.maxSw }}
            </span>
            <img
                class="img-button"
                src="../../../assets/button/export.png"
                style="margin-top: 6px;"
                @click="handleExport"
                alt="导出"
            />
        </div>
    </div>
</template>

<script lang="ts">
    const thhead = [
        {
            label: "时间",
            value: "tm",
            width: 120,
            fixed: "left"
        },
        {
            label: "水位",
            value: "z",
            width: 80
        },
        {
            label: "面雨量",
            value: "p",
            width: 60
        },
        {
            label: "流量",
            value: "q",
            width: 80
        }
    ];
    import { Component, Vue, Prop, Watch } from "vue-property-decorator";
    import { State, Mutation } from "vuex-class";
    import "@/styles/mapView/right.scss";
    import OnlyChart from "@/components/onlyChart.vue";
    @Component({
        components: { OnlyChart }
    })
    export default class Overlay extends Vue {
        @State(state => state.forecast) forecast!: any;

        forecastList: any = {
            thdata: [],
            tbdata: [],
            maxSw: "",
            sumYl: "",
            chartData: []
        };
        getSpecialData(data: any) {
            this.forecastList.sumYl = data[0];
            this.forecastList.maxSw = data[1];
        }
        handleExport() {
            const {
                zh,
                fymdh,
                publishtm,
                unitname,
                plcd,
                zm
            } = this.forecast.data.info;
            let params = {
                zh,
                fymdh,
                publishtm,
                unitname,
                plcd,
                zm
            };
            const url = this.$utils.formatURL(
                "/rest/floodforcast/leadoutForcastData",
                params
            );
            window.open(url);
        }

        init() {
            let params = {
                zh: this.forecast.data.info.zh,
                fymdh: this.forecast.data.info.fymdh,
                publishtm: this.forecast.data.info.publishtm,
                unitname: this.forecast.data.info.unitname,
                plcd: this.forecast.data.info.plcd
            };
            this.forecastList.thdata = [];
            this.forecastList.tbdata = [];
            this.$http
                .get("/rest/floodforcast/getForcastData", { params: params })
                .then((res: any) => {
                    //console.log(res.data);
                    res.data.forEach((item: any) => {
                        item.data.forEach((item: any) => {
                            this.forecastList.tbdata.push({
                                tm: item.tm.slice(0, -3),
                                p: item.p,
                                q: item.q,
                                z: item.z
                            });
                        });
                        this.forecastList.chartData = JSON.parse(
                            JSON.stringify(item.data)
                        );
                    });
                });
        }
        @Watch("forecast.data")
        changeForeCastData(n: any) {
            if (n) {
                this.init();
                this.forecastList.thdata = thhead;
            }
        }
        created() {
            this.init();
            this.forecastList.thdata = thhead;
        }
    }
</script>

<style lang="scss" scoped>
    .markerCon {
        width: 827px;
        height: 392px;
        background-color: white;

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
                background: #fff;
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
            padding: 6px;

            .chart {
                height: 315px;
                width: 100%;
                background-color: orange;
            }

            &-select {
                margin-bottom: 12px;
                margin-top: 8px;

                > span {
                    margin-right: 10px;

                    &:not(:first-of-type) {
                        margin-left: 30px;
                    }
                }
            }

            &-line {
                margin-top: 12px;
            }

            &-desc {
                list-style: none;

                li {
                    display: inline-block;
                    width: 25%;
                    border: 1px solid #ccc;
                    background-color: white;
                    line-height: 32px;
                    font-size: 14px;
                    padding-left: 20px;
                }

                &-key {
                    background-color: #f4f6f8 !important;
                }
            }
        }
    }

    .img-button {
        float: right;
        margin-right: 6px;
    }
</style>
