<template>
    <div class="markerCon" style="padding: 0; position: relative" v-drag>
        <div class="title">
            <div class="ls" />
            {{ data.info.zm }} - {{ data.info.ssx }} {{ data.info.zm }} （{{
                data.info.zh
            }}） {{ data.info.zl }}
            <span @click="closeNextThreeOverlayMutation">
                <i class="iconfont iconxingzhuang" />
            </span>
        </div>
        <!-- 河道与水库 -->
        <el-row class="content">
            <el-col :span="16">
                <el-row class="content-select">
                    <span>机构</span>
                    <el-select style="width: 80px" v-model="data.govern">
                        <el-option value="1" label="中国" />
                        <el-option value="2" label="日本" />
                    </el-select>
                    <span>历史时间</span>
                    <el-select style="width: 80px" v-model="date.history">
                        <el-option
                            v-for="option in select.history"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                        />
                    </el-select>
                    <span>未来时间</span>
                    <el-select style="width: 80px" v-model="date.future">
                        <el-option
                            v-for="option in select.future"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                        />
                    </el-select>
                    <el-button
                        type="primary"
                        size="small"
                        style="margin-left: 24px;"
                        @click="handleData"
                        >确定</el-button
                    >
                </el-row>
                <el-row>
                    <OnlyChart
                        :data="chart.data"
                        :type="chart.type"
                        :thhead="chart.head"
                        :width="670"
                        :height="320"
                    />
                </el-row>
                <el-row class="content-line">
                    <el-col :span="8" v-if="visible.history"
                        >历史雨量：{{ show.historyWater }}mm</el-col
                    >
                    <el-col :span="8" v-if="visible.now"
                        >最新水位：{{ show.historyLaetest }}mm</el-col
                    >
                    <el-col :span="8" v-if="visible.future"
                        >未来降雨：{{ show.futureWater }}mm</el-col
                    >
                </el-row>
            </el-col>
            <el-col :span="8">
                <ul class="content-desc" v-if="waterLine.reservior">
                    <li class="content-desc-key">汛限水位</li>
                    <li class="content-desc-value">
                        {{ topLevel.xxsw || "-" }}
                    </li>
                    <li class="content-desc-key">正常水位</li>
                    <li class="content-desc-value">
                        {{ topLevel.zcsw || "-" }}
                    </li>
                </ul>
                <ul class="content-desc" v-if="waterLine.river">
                    <li class="content-desc-key">警戒水位</li>
                    <li class="content-desc-value">
                        {{ topLevel.jjsw || "-" }}
                    </li>
                    <li class="content-desc-key">保证水位</li>
                    <li class="content-desc-value">
                        {{ topLevel.bzsw || "-" }}
                    </li>
                </ul>
                <el-table
                    stripe
                    border
                    :cell-style="columnStyle"
                    :data="table.data"
                    height="373"
                    style="width: 100%"
                >
                    <el-table-column
                        v-for="column in table.column"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label"
                        :width="column.width"
                    />
                    <el-table-column prop="waterLevel" label="水位">
                        <template slot-scope="scope">
                            {{ scope.row.waterLevel }}
                            <i
                                class="el-icon-top"
                                v-if="scope.row.trend === 1"
                                style="color: green"
                            />
                            <i
                                class="el-icon-bottom"
                                v-if="scope.row.trend === 2"
                                style="color: red"
                            />
                            <i
                                class="el-icon-minus"
                                v-if="scope.row.trend === 0"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <el-dialog
            :fullscreen="true"
            :modal="false"
            :visible="dialog.visible"
            :show-close="true"
            class="do-not-use-2"
            style="padding: 0"
            title="详情"
            @close="handleCloseDialog"
        >
            <el-table :data="table.data" border height="390">
                <el-table-column prop="num" label="站码" />
                <el-table-column prop="date" label="时间" width="150" />
                <el-table-column prop="future" label="降雨(mm)" width="100">
                    <template slot-scope="scope">
                        <span v-if="scope.row.isFuture" style="color: red">
                            {{ scope.row.future }}
                        </span>
                        <span v-if="!scope.row.isFuture">
                            {{ scope.row.future }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column prop="waterLevel" label="水位(m)" />
                <el-table-column
                    prop="capacity"
                    label="库容(百万方)"
                    width="100"
                />
                <el-table-column prop="trend" label="涨势">
                    <template slot-scope="scope">
                        <i
                            class="el-icon-top"
                            v-if="scope.row.trend === 1"
                            style="color: green"
                        />
                        <i
                            class="el-icon-bottom"
                            v-if="scope.row.trend === 2"
                            style="color: red"
                        />
                        <i class="el-icon-minus" v-if="scope.row.trend === 0" />
                    </template>
                </el-table-column>
                <el-table-column prop="level" label="汛限(m)" />
            </el-table>
            <div
                class="export-button"
                @click="handleExport"
                style="position: absolute; right: 6px; bottom: 6px;"
            >
                <img src="@/assets/export.png" alt />
                <span>导出表格数据</span>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Prop, Watch } from "vue-property-decorator";
    import { State, Mutation } from "vuex-class";
    import "@/styles/mapView/right.scss";
    import moment from "moment";
    import { OnlyChart } from "@/components";

    const select = {
        history: [
            {
                value: "1",
                label: "一天"
            },
            {
                value: "2",
                label: "二天"
            },
            {
                value: "3",
                label: "三天"
            },
            {
                value: "4",
                label: "四天"
            },
            {
                value: "7",
                label: "一周"
            },
            {
                value: "14",
                label: "两天"
            }
        ],
        future: [
            {
                value: "24",
                label: "一天"
            },
            {
                value: "48",
                label: "二天"
            },
            {
                value: "72",
                label: "三天"
            },
            {
                value: "96",
                label: "四天"
            },
            {
                value: "120",
                label: "五天"
            }
        ]
    };

    const column = {
        reservior: [
            {
                prop: "date",
                label: "时间",
                width: 160
            },
            {
                prop: "future",
                label: "雨量",
                style: {
                    color: "red"
                }
            },
            {
                prop: "waterLevel",
                label: "水位"
            },
            {
                prop: "capacity",
                label: "库容"
            },
            {
                prop: "flow",
                label: "流量"
            }
        ],
        river: [
            {
                prop: "date",
                label: "时间",
                width: 160
            },
            {
                prop: "future",
                label: "雨量",
                style: {
                    color: "red"
                }
            },
            {
                prop: "waterLevel",
                label: "水位"
            },
            {
                prop: "flow",
                label: "流量"
            }
        ],
        rain: [
            {
                prop: "date",
                label: "时间",
                width: 160
            },
            {
                prop: "future",
                label: "雨量",
                style: {
                    color: "red"
                }
            }
        ]
    };

    @Component({
        components: {
            OnlyChart
        }
    })
    export default class Overlay extends Vue {
        @Prop() prop: any;

        @State(state => state.nextThree) nextThreeState!: any;

        @Mutation("closeNextThreeOverlay")
        closeNextThreeOverlayMutation!: Function;
        @Mutation("updateNextData") updateNextDataMutation!: Function;

        @Watch("nextThreeState.visible")
        handleChange() {
            if (this.nextThreeState.visible) {
                this.dialog.govern = this.nextThreeState.data.govern;
                this.handleData();
            } else {
                this.show = {
                    historyWater: 0,
                    historyLaetest: 0,
                    futureWater: 0
                };
            }
        }

        @Watch("nextThreeState", { deep: true })
        handleClick() {
            this.data = this.nextThreeState.data;
            this.handleData();
            this.visible = {
                history: true,
                now: true,
                future: true
            };

            if (this.data.info.zl === "河道站") {
                this.table.column = this.table.all.river;
            } else if (this.data.info.zl === "水库站") {
                this.table.column = this.table.all.reservior;
            } else {
                this.table.column = this.table.all.rain;
                this.visible.now = false;
            }
        }

        date: any = {
            history: "1",
            future: "24"
        };
        dialog: any = {
            visible: false,
            govern: ""
        };
        table: any = {
            data: [],
            column: [],
            all: column
        };
        show: any = {
            historyWater: 0,
            historyLaetest: 0,
            futureWater: 0
        };
        select: any = select;
        data: any;
        topLevel: any = {
            zxsw: "",
            xxsw: ""
        };
        visible: any = {
            history: true,
            now: true,
            future: true
        };
        waterLine: any = {
            reservoir: false,
            river: false
        };
        chart: any = {
            data: [],
            type: "PZ",
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

        created() {
            this.data = this.nextThreeState.data;
            // console.log(this.data);
            this.handleData();
            this.visible = {
                history: true,
                now: true,
                future: true
            };

            if (this.data.info.zl === "河道站") {
                this.table.column = this.table.all.river;
            } else if (this.data.info.zl === "水库站") {
                this.table.column = this.table.all.reservior;
            } else {
                this.table.column = this.table.all.rain;
                this.visible.now = false;
            }
        }
        // 水位显隐
        handleWaterlineVisible() {
            this.waterLine = {
                reservoir: false,
                river: false,
                rain: false
            };
            const siteType = this.data.info.zl;

            if (siteType === "水库站" || siteType === "潮汐站") {
                this.waterLine.reservior = true;
            } else if (siteType === "纯雨量站") {
                this.waterLine.reservior = true;
                this.waterLine.river = true;
            } else {
                this.waterLine.river = true;
            }
        }

        columnStyle({ row, column, rowIndex, columnIndex }: any) {
            if (columnIndex === 1 && row.isFuture) {
                return { color: "red" };
            }
        }

        // 获取历史数据
        getHistoryData() {
            const params = {
                zm: this.nextThreeState.data.info.zh,
                st: moment()
                    .subtract(this.date.history, "day")
                    .format("YYYY-MM-DDTHH:mm:ss"),
                et: moment().format("YYYY-MM-DDTHH:mm:ss"),
                jg: 1,
                lx: 0
            };

            return this.$http("/rest/water/getHisData", { params }).then(
                ({ data }: any) => data
            );
        }

        // 获取未来数据
        getFutureData() {
            const params = {
                stcd: this.data.info.zh,
                et: moment()
                    .add(this.date.future / 24, "day")
                    .format("YYYY-MM-DDTHH:mm:ss"),
                st: moment().format("YYYY-MM-DDTHH:mm:ss"),
                unitname: this.data.govern
            };

            return this.$http("/rest/weatherForecast/getFutureRainData", {
                params
            }).then(({ data }: any) => data.pz);
        }

        // 获取汛限数据
        getTopData() {
            const params = {
                zm: this.nextThreeState.data.info.zh
            };
            return this.$http("/rest/basic/getDetailSiteList", { params }).then(
                ({ data }: any) => data
            );
        }

        // 处理数据
        async handleData() {
            const historyData = await this.getHistoryData();
            const futureData = await this.getFutureData();
            const topData = await this.getTopData();
            this.table.data = [];
            this.chart.data = [];
            this.updateNextDataMutation(topData);
            this.topLevel = topData[0];
            const len = futureData.length;
            let { row } = this.table;

            this.handleHistory(historyData.pz);
            this.handleFuture(futureData);
            historyData.pz.forEach((item: any, i: number) => {
                this.table.data.push({
                    num: topData[0].zh,
                    date: moment(item.tm).format("YYYY-MM-DD HH:mm:ss"),
                    future: item.yl,
                    waterLevel: item.sw,
                    trend: item.zs,
                    capacity: item.kr,
                    level: item.sw,
                    isFuture: false,
                    flow: historyData.q[i].ll
                });
                this.chart.data.push({
                    //26-27
                    p1: null,
                    p: item.yl,
                    z: item.sw,
                    q: historyData.q[i].ll,
                    tm: moment(item.tm).format("YYYY-MM-DD HH:mm")
                });
            });
            futureData.forEach((item: any) => {
                this.table.data.push({
                    num: item.zh,
                    date: moment(item.tm).format("YYYY-MM-DD HH:mm:ss"),
                    future: item.yl,
                    level: topData[0].xxsw,
                    isFuture: true
                });
                this.chart.data.push({
                    //27-28
                    p: null,
                    p1: item.yl,
                    z: null,
                    q: null,
                    tm: moment(item.tm).format("YYYY-MM-DD HH:mm")
                });
            });
            //console.log(this.chart.data);
            this.table.data.reverse();
        }

        // 历史雨量及最新水位
        handleHistory(data: any) {
            data.forEach((item: any) => {
                this.show.historyWater += item.yl;
            });
            this.show.historyWater.toFixed(1);
            this.show.historyLaetest =
                Number(data[data.length - 1].sw).toFixed(2) || "暂无数据";
        }

        // 未来降水
        handleFuture(data: any) {
            this.show.futureWater = 0;
            data.forEach((item: any) => {
                this.show.futureWater += Number(item.yl);
            });
            this.show.futureWater.toFixed(1);
            this.show.futureWater = this.show.futureWater.toFixed(2);
        }

        // 关闭对话框
        handleCloseDialog() {
            this.dialog.visible = false;
        }

        // 开启对话框
        handleOpenDialog() {
            this.dialog.visible = true;
        }

        // 导出
        handleExport() {
            const params = {
                st: moment()
                    .subtract(this.date.history, "day")
                    .format("YYYY-MM-DDTHH:mm:ss"),
                et: moment()
                    .add(this.date.history, "day")
                    .format("YYYY-MM-DDTHH:mm:ss"),
                unitname: this.dialog.govern,
                zh: this.nextThreeState.data.info.zh,
                zm: this.nextThreeState.data.info.zm
            };
            const url = this.$utils.formatURL(
                "/rest/weatherForecast/leadoutFutureRainData",
                params
            );
            window.open(url);
        }
    }
</script>

<style lang="scss" scoped>
    .markerCon {
        width: 1024px;
        height: 463px;
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

    .el-dialog {
        padding: 10px;
    }

    #hehe {
        display: flex;
    }
</style>
