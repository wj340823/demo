<template>
    <div class="details">
        <!--<div class="title" style="margin-bottom: 0">
            <i class="iconfont iconlianhe" />
            {{ data.type }}
        </div>-->
        <el-tabs v-model="data.type" type="card">
            <el-tab-pane name="洪水预警" label="洪水预警">
                <div>
                    <div class="searchBar" style="margin-top: 5px">
                        <div class="sel-btn" style="height: 30px">
                            <span
                                class="btn"
                                :class="date.type == 'monitor' ? 'act' : ''"
                                @click="date.type = 'monitor'"
                                style="height: 29px; cursor: pointer"
                                >监视</span
                            >
                            <span
                                class="btn"
                                :class="date.type == 'search' ? 'act' : ''"
                                @click="date.type = 'search'"
                                style="height: 29px; cursor: pointer"
                                >查询</span
                            >
                        </div>

                        <span style="margin-left: 4px;">起：</span>
                        <el-date-picker
                            class="searchItem searchDadeItem"
                            style="width: 100px; margin-right: 15px;"
                            v-model="date.start"
                            type="date"
                            :clearable="false"
                        />
                        <span>止：</span>
                        <el-date-picker
                            class="searchItem searchDadeItem"
                            style="width: 100px"
                            v-model="date.end"
                            type="date"
                            :clearable="false"
                        />
                    </div>
                    <div
                        class="searchBar"
                        style="margin-left: 4px; margin-top: 6px;"
                    >
                        <el-select
                            v-model="date.selected"
                            style="width: 87px; position: relative; top: 1px;"
                        >
                            <el-option
                                v-for="option in date.options"
                                :key="option.value"
                                :label="option.label"
                                :value="option.value"
                            />
                        </el-select>
                        <el-input
                            class="searchItem"
                            style="width: 127px"
                            v-model="input"
                            placeholder="站名站码拼音码"
                        />
                        <el-button
                            size="mini"
                            type="primary"
                            icon="el-icon-search"
                            class="el-button-search"
                            @click="getTableData"
                            >查询
                        </el-button>
                        <img
                            src="../../../assets/button/export-excel.png"
                            @click="handleExport"
                            class="export-button__img"
                            alt="导出"
                        />
                    </div>
                </div>

                <div class="result">
                    <el-table
                        :data="result.tbData"
                        style="width: 100%"
                        border
                        stripe
                        ref="singleTable"
                        @row-click="rowClick"
                        v-loading="result.loading"
                        :height="heightMixin"
                    >
                        <el-table-column
                            type="index"
                            width="40"
                            label="序"
                            fixed="left"
                        />
                        <el-table-column
                            type="index"
                            width="50"
                            label="类型"
                            show-overflow-tooltip
                            fixed="left"
                        >
                            <template slot-scope="scope">
                                <!--蓝色  #33B2FF   黄色  #F8D972  橙色  #F69526    红色 #FC5C5C-->
                                <!--<i class="iconfont iconyemian-copy-copy" :style="{'color':color[scope.row.type]}"></i>-->
                                <img :src="scope.row.type" alt />
                            </template>
                        </el-table-column>
                        <el-table-column
                            :show-overflow-tooltip="item.label != '内容'"
                            v-for="(item, index) in result.thList.ylxx"
                            :prop="item.value"
                            :label="item.label"
                            :key="index"
                            :width="item.width"
                        />
                    </el-table>
                </div>
            </el-tab-pane>
            <el-tab-pane
                name="气象雷达"
                label="气象雷达"
                v-if="pagesShow['气象雷达']"
            >
                <weatherRadar></weatherRadar>
            </el-tab-pane>
            <el-tab-pane
                name="风暴潮"
                label="风暴潮"
                v-if="pagesShow['风暴潮']"
            >
                <storm-surge></storm-surge>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts">
    import "../../../styles/mapView/right.scss";
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import { State, Mutation } from "vuex-class";
    import Overlay from "./Overlay.vue";
    import moment from "moment";
    import AutoHeightMixin from "../../../mixins/autoHeight";
    import weatherRadar from "../weatherRadar/Main.vue";
    import stormSurge from "../stormSurge/Main.vue";
    let cancelToken: any = null;
    @Component({
        components: { Overlay, weatherRadar, stormSurge }
    })
    export default class FloodWarning extends AutoHeightMixin {
        @State("flood") flood: any;
        @State("userInfo") userInfo: any;
        @State("pagesShow") pagesShow: any;
        @Mutation("closeFloodModal") closeFlood: any;
        @Mutation("openFloodModal") openFlood: any;
        @Mutation("closeFloodModal") closeFloodModal: any;
        @Mutation("getCenter") getCenter: any;

        data: any = {
            type: "洪水预警",
            show: true
        };
        color = {
            blue: "#33B2FF",
            yellow: "#F8D972",
            Yellow: "#F8D972",
            orange: "#F69526",
            Red: "#FC5C5C"
        };
        imgList: any = {
            blue: "blue",
            yellow: "yellow",
            Yellow: "yellow",
            orange: "orange",
            Red: "red"
        };
        date: any = {
            type: "search",
            selected: "all",
            options: [
                {
                    label: "1天",
                    value: "1"
                },
                {
                    label: "3天",
                    value: "3"
                },
                {
                    label: "7天",
                    value: "7"
                },
                {
                    label: "全部",
                    value: "all"
                },
                {
                    label: "自定义",
                    value: "manually"
                }
            ],
            start: moment()
                .subtract(1, "month")
                .format("YYYY-MM-DD"),
            end: moment().format("YYYY-MM-DD")
        };

        result: any = {
            loading: false,
            thList: {
                ylxx: [
                    {
                        label: "预警标题",
                        value: "title",
                        fixed: "left"
                    },
                    {
                        label: "发布时间",
                        value: "time"
                    },
                    {
                        label: "预报站",
                        value: "station"
                    }
                ]
            },
            tbData: [],
            floodPoint: []
        };
        input: string = "";

        created(): void {
            this.getTableData();
            this.autoHeightMixin(260);
            /*this.$http
                .get("/rest/floodwarm/floodForcastMonitoring")
                .then(res => {
                    debugger;
                });*/
        }

        closeFloods() {
            this.closeFlood();
        }

        rowClick(row: any, column: any, event: any) {
            this.openFlood(row);
            this.getCenter([row.lon, row.lat]);
        }

        hideList() {
            this.$emit("closeRight");
        }

        getTableData(): void {
            this.result.tbData = [];
            this.result.floodPoint = [];
            this.result.loading = true;
            this.closeFloodModal();
            const params = this.handleCreateParams();
            this.$emit("floodPoints", []);
            if (cancelToken) {
                cancelToken();
            }
            let url = "";
            if (this.date.type == "monitor") {
                url = "/rest/floodwarm/floodForcastMonitoring";
            } else {
                url = "/rest/floodwarm/getForcast";
            }
            this.$http
                .get(url, {
                    params,
                    cancelToken: new this.$http.CancelToken(cancel => {
                        cancelToken = cancel;
                    })
                })
                .then(({ data }) => {
                    this.result.loading = false;
                    if (data.length) {
                        let img: any = "";
                        data.forEach((item: any) => {
                            img =
                                item.WRTITLE.match("解除") === null
                                    ? require("@/assets/flood/" +
                                          this.imgList[item.WRLEVEL] +
                                          ".png")
                                    : require("@/assets/flood/relieve.png");
                            this.result.tbData.push({
                                type: img,
                                title: item.WRTITLE,
                                content: item.WRDETAIL,
                                lon: item.LGTD,
                                lat: item.LTTD,
                                time: this.$utils.dateFormat(
                                    new Date(item.IYMDH),
                                    "YYYY-MM-dd HH"
                                ),
                                info: item,
                                station: item.STATION
                            });
                            this.result.floodPoint.push({
                                id: item.UNITID,
                                lon: item.LGTD,
                                lat: item.LTTD,
                                info: item,
                                style: {
                                    image: {
                                        icon: {
                                            anchor: [0.5, 1],
                                            src: img
                                        }
                                    }
                                }
                            });
                        });
                        this.$emit("floodPoints", this.result.floodPoint);
                    }
                });
        }

        // 生成 params
        handleCreateParams() {
            const { start, end, selected } = this.date;
            let params;

            // 选择全部时查询历史
            if (selected === "all") {
                params = {
                    jssj: moment(end).format("YYYY-MM-DDTHH:mm:ss"),
                    cz: this.input
                };
            } else if (selected === "manually") {
                params = {
                    kssj: moment(start).format("YYYY-MM-DDTHH:mm:ss"),
                    jssj: moment(end).format("YYYY-MM-DDTHH:mm:ss"),
                    cz: this.input
                };
            } else {
                params = {
                    kssj: moment().format("YYYY-MM-DDTHH:mm:ss"),
                    jssj: moment()
                        .subtract(selected, "day")
                        .format("YYYY-MM-DDTHH:mm:ss"),
                    cz: this.input
                };
            }

            return params;
        }

        handleExport() {
            const params = this.handleCreateParams();
            const url = this.$utils.formatURL(
                "/rest/floodwarm/leadoutForcastWarm",
                params
            );

            window.open(url);
        }
    }
</script>

<style lang="scss" scoped>
    .details {
        .tab {
            margin-top: -10px;
            padding: 0 10px;
            text-align: left;
            height: 40px;
            line-height: 40px;

            > span {
                margin-right: 20px;
                color: #0169e1;
                font-size: 14px;
            }

            //background-color: #0169e1;
            .el-input__inner {
                background-color: rgb(1, 105, 225, 0.05);
            }
        }

        .result {
            padding: 0;

            .el-table td {
                padding: 0 5px !important;
            }

            .el-table td img {
                width: 20px !important;
                vertical-align: middle;
            }
        }
    }
</style>
