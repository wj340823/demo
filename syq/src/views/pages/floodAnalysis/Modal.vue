<template>
    <div class="markerCon" v-drag>
        <div class="title">
            <div class="ls" />
            洪号：{{ flood.analyse.data.floodNum }} &nbsp;&nbsp;&nbsp; 站名：{{
                flood.analyse.data.stateName
            }}{{ flood.analyse.data.stateId }}
            <span @click="flood.analyse.show = false">
                <i class="iconfont iconxingzhuang" />
            </span>
        </div>
        <el-row class="content">
            <el-row class="content-amcharts">
                <div style="float:left;">
                    <only-chart
                        :data="modal.detail.table.chartData"
                        type="PZ"
                        :width="540"
                        :height="320"
                        :dateType="'month'"
                        :xxsw="null"
                        :jjsw="null"
                        :bzsw="null"
                        :zcsw="null"
                        @getSpecialData="getSpecialData"
                    ></only-chart>
                    <div style="margin-top: 6px;">
                        <span
                            >累计雨量：{{
                                modal.sumYl && modal.sumYl != "-"
                                    ? Number(modal.sumYl).toFixed(1)
                                    : modal.sumYl
                            }}(mm)</span
                        >
                        <span style="margin-left: 30px"
                            >最高水位：{{
                                modal.highSw && modal.highSw != "-"
                                    ? Number(modal.highSw).toFixed(2)
                                    : modal.highSw
                            }}(m)</span
                        >
                        <span style="margin-left: 30px"
                            >累计水量：{{
                                modal.ljsl && modal.ljsl != "-"
                                    ? (modal.ljsl / 1000000).toFixed(0)
                                    : "-"
                            }}(百万方)</span
                        >
                    </div>
                </div>
                <div
                    style="float: left;width: calc(100% - 540px);height: 345px"
                >
                    <el-table
                        :data="modal.detail.table.tbData"
                        height="200"
                        border
                        stripe
                        v-loading="modal.detail.table.loading"
                    >
                        <el-table-column
                            type="index"
                            label="序"
                            fixed="left"
                            width="40"
                        />
                        <el-table-column
                            v-for="item in modal.detail.table.thData"
                            :key="item.prop"
                            :label="item.label"
                            :prop="item.prop"
                            :show-overflow-tooltip="item.tooltip"
                            :width="item.width"
                            :fixed="item.fixed"
                        ></el-table-column>
                    </el-table>
                    <ul>
                        <li>
                            <span class="top">洪水编号</span>
                            <span class="bottom">{{
                                modal.forcast.data.hh
                            }}</span>
                        </li>
                        <li>
                            <span class="top">累计雨量</span>
                            <span class="bottom">{{
                                modal.forcast.data.zgyl
                                    ? Number(modal.forcast.data.zgyl).toFixed(1)
                                    : modal.forcast.data.zgyl
                            }}</span>
                        </li>
                        <li>
                            <span class="top">开始时间</span>
                            <span class="bottom">{{
                                modal.forcast.data.kssj
                            }}</span>
                        </li>
                        <li>
                            <span class="top">结束时间</span>
                            <span class="bottom">{{
                                modal.forcast.data.jssj
                            }}</span>
                        </li>
                        <li>
                            <span class="top">洪峰流量</span>
                            <span class="bottom">{{
                                modal.forcast.data.zgll
                            }}</span>
                        </li>
                        <li>
                            <span class="top">洪峰流量时间</span>
                            <span class="bottom">{{
                                modal.forcast.data.zgllsj
                            }}</span>
                        </li>
                        <li>
                            <span class="top">洪峰水位</span>
                            <span class="bottom">{{
                                modal.forcast.data.zgsw
                            }}</span>
                        </li>
                        <li>
                            <span class="top">洪峰水位时间</span>
                            <span class="bottom">{{
                                modal.forcast.data.zgswsj
                            }}</span>
                        </li>
                    </ul>
                    <div class="listTb">
                        <img
                            v-if="$utils.checkUser(userInfo.roles, 'super')"
                            src="../../../assets/button/export-excel.png"
                            @click="handleExport"
                            class="export-button__img"
                            style="top: -1px; position: relative;"
                            alt="导出"
                        />
                    </div>
                </div>
            </el-row>
        </el-row>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Watch } from "vue-property-decorator";
    import moment from "moment";
    import OnlyChart from "@/components/onlyChart.vue";
    import { State, Mutation } from "vuex-class";

    let cancelToken: any = null;
    @Component({
        components: { OnlyChart }
    })
    export default class FloodModal extends Vue {
        @State("flood") flood: any;
        @State("userInfo") userInfo: any;
        modal: any = {
            forcast: {
                visible: false,
                data: {}
            },
            detail: {
                visible: false,
                table: {
                    thData: [],
                    tbData: [],
                    loading: false,
                    chartData: []
                }
            },
            sumYl: "-",
            highSw: "-",
            ljsl: "-"
        };

        @Watch("flood.analyse.data", { deep: true })
        changeFloodAnalyse() {
            this.getDetailData();
            this.getForcastData();
        }

        handleCloseModal(clicked: any) {
            clicked.visible = false;
        }

        getSpecialData(data: any) {
            this.modal.sumYl = data[0];
            this.modal.highSw = data[1];
            this.modal.ljsl = data[3];
        }

        getForcastData() {
            const { floodNum, stateId, areaNum } = this.flood.analyse.data;

            const params = {
                id: floodNum,
                zh: stateId,
                dmh: areaNum
            };

            this.$http("/rest/flood/getFloodCharacter", {
                params
            }).then(res => {
                this.modal.forcast.data = res.data;
            });
        }

        getDetailData() {
            this.modal.detail.table.loading = true;
            this.modal.detail.table.tbData = [];
            this.modal.detail.table.chartData = [];
            const { floodNum, stateId, areaNum } = this.flood.analyse.data;
            this.modal.detail.table.thData = [];

            const params = {
                hh: floodNum,
                zh: stateId,
                dmh: areaNum
            };

            if (cancelToken) {
                cancelToken();
            }
            this.$http("/rest/flood/getFloodHistoryData", {
                params,
                cancelToken: new this.$http.CancelToken(cancel => {
                    cancelToken = cancel;
                })
            }).then(res => {
                this.modal.detail.table.loading = false;
                if (res.data.length) {
                    let sumYl = 0,
                        maxSw = 0,
                        maxWater = 0;
                    res.data.forEach((item: any, index: number) => {
                        sumYl += Number(item.yl);
                        if (item.ll) {
                            item.ll = parseInt(item.ll);
                        }
                        if (item.sw) {
                            maxSw =
                                Number(item.sw) > maxSw
                                    ? Number(item.sw)
                                    : maxSw;
                        }
                        if (
                            item.ll &&
                            res.data[index - 1] != undefined &&
                            res.data[index - 1].ll != null
                        ) {
                            maxWater +=
                                ((Number(res.data[index - 1].ll) +
                                    Number(item.ll)) *
                                    3600) /
                                2;
                        }
                        this.modal.detail.table.chartData.push({
                            z: item.sw,
                            q: item.ll,
                            tm: item.time,
                            p: item.yl
                        });
                        this.modal.detail.table.tbData.push({
                            z: item.sw ? item.sw.toFixed(2) : item.sw,
                            q: item.ll ? item.ll.toFixed(1) : item.ll,
                            tm: this.$utils.dateFormat(
                                new Date(item.time),
                                "yyyy-MM-dd HH:mm"
                            ),
                            p: item.yl ? item.yl.toFixed(1) : item.yl
                        });
                    });
                    this.modal.highSw = maxSw;
                    this.modal.ljsl = maxWater;
                    this.modal.sumYl = sumYl;
                    const data = this.modal.detail.table.tbData;
                    const isRainLast = data.every(
                        (item: any) => !Number(item.p)
                    );
                    const isWaterLast = data.every(
                        (item: any) => !Number(item.z)
                    );
                    const isFlowLast = data.every(
                        (item: any) => !Number(item.q)
                    );
                    if (isRainLast) {
                        this.modal.detail.table.thData = [
                            {
                                prop: "tm",
                                label: "时间",
                                fixed: "left",
                                value: "tm",
                                width: 120,
                                tooltip: true
                            },
                            {
                                prop: "q",
                                label: "流量",
                                value: "q"
                            },
                            {
                                prop: "z",
                                label: "水位",
                                value: "z"
                            },
                            {
                                prop: "p",
                                label: "雨量",
                                value: "p",
                                width: 70
                            }
                        ];
                    } else if (isWaterLast) {
                        this.modal.detail.table.thData = [
                            {
                                prop: "tm",
                                label: "时间",
                                fixed: "left",
                                value: "tm",
                                width: 120,
                                tooltip: true
                            },
                            {
                                prop: "p",
                                label: "雨量",
                                value: "p",
                                width: 70
                            },
                            {
                                prop: "q",
                                label: "流量",
                                value: "q"
                            },
                            {
                                prop: "z",
                                label: "水位",
                                value: "z"
                            }
                        ];
                    } else if (isFlowLast) {
                        this.modal.detail.table.thData = [
                            {
                                prop: "tm",
                                label: "时间",
                                fixed: "left",
                                value: "tm",
                                width: 120,
                                tooltip: true
                            },
                            {
                                prop: "p",
                                label: "雨量",
                                value: "p",
                                width: 70
                            },
                            {
                                prop: "z",
                                label: "水位",
                                value: "z"
                            },
                            {
                                prop: "q",
                                label: "流量",
                                value: "q"
                            }
                        ];
                    } else {
                        this.modal.detail.table.thData = [
                            {
                                prop: "tm",
                                label: "时间",
                                fixed: "left",
                                value: "tm",
                                width: 120,
                                tooltip: true
                            },
                            {
                                prop: "p",
                                label: "雨量",
                                value: "p",
                                width: 70
                            },
                            {
                                prop: "q",
                                label: "流量",
                                value: "q"
                            },
                            {
                                prop: "z",
                                label: "水位",
                                value: "z"
                            }
                        ];
                    }
                }
            });
        }

        handleExport() {
            const {
                floodNum,
                stateId,
                areaNum,
                areaName
            } = this.flood.analyse.data;
            const params = {
                hh: floodNum,
                zh: stateId,
                zm: areaName,
                dmh: areaNum
            };
            const url = this.$utils.formatURL(
                "/rest/flood/leadoutFloodHistoryData",
                params
            );
            window.open(url);
        }

        mounted() {
            this.getDetailData();
            this.getForcastData();
        }
    }
</script>

<style lang="scss" scoped>
    .content {
        &-buttons {
            display: flex;
            justify-content: flex-end;
        }
    }

    .tbData {
        width: 100%;
        height: 300px;
        margin-top: -10px;
    }

    .markerCon {
        width: 960px;

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
            padding: 10px 10px 0 10px;

            .el-row {
                margin-bottom: 6px;
            }

            .chart {
                height: 370px;
                width: 100%;
                background-color: orange;
            }
        }

        .listTb {
            width: 400px;
            float: right;
            line-height: 0;
        }
    }

    .do-not-use-2 .el-dialog {
        margin: 0 !important;
    }

    .forcaseValue {
        padding: 10px;
        width: 400px;
        position: absolute;
        left: calc(50% - 200px);
        background-color: #fff;
        box-shadow: 0 0 8px #ddd;
        top: 10px;
        z-index: 4;

        .modal {
            &-title {
                margin-left: 10px;
                font-size: 18px;
                color: #333;

                &::before {
                    margin-right: 10px;
                    content: "";
                    display: inline-block;
                    height: 14px;
                    width: 6px;
                    background-color: #0169e1;
                }
            }

            hr {
                background-color: #e9e9e9;
            }

            &-detail {
            }
        }
    }

    ul {
        display: flex;
        list-style-type: none;
        flex-wrap: wrap;
        justify-content: space-around;
        border: 1px solid #e9e9e9;
        border-radius: 2px;
        padding: 2px;
        margin-top: 6px;

        li {
            width: 48%;
            border-bottom: 1px solid #e9e9e9;

            span {
                &.top {
                    line-height: 26px;
                    color: #0169e1;
                    margin-right: 10px;
                }

                &.bottom {
                    line-height: 26px;
                    padding: 3px 6px;
                    // border: 1px solid #e9e9e9;
                    // border-radius: 2px;
                }
            }
        }
    }
</style>
