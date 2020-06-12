<template>
    <div class="details">
        <div class="title" v-if="userInfo.roles == 'middle'">
            {{ data.type }}
        </div>
        <div class="tab searchBar">
            <span
                >雷达信息
                <img
                    style="margin-bottom: -1px;margin-left:5px;width: 15px"
                    @click="refresh"
                    src="@/assets/refresh.png"
                    alt="刷新"
            /></span>
            <PlayInterval
                @changeInterval="handleChangeInterval"
                @changeStatus="handleChangeStatus"
                :interval-num="result.intervalNum / 1000"
            />
            <!-- <img
                src="@/assets/play.png"
                alt="播放"
                class="fr"
                v-if="!result.interval"
                @click="playLd(true)"
            />
            <img
                src="@/assets/stop.png"
                alt="停止"
                class="fr"
                v-if="result.interval"
                @click="playLd(false)"
            /> -->
        </div>
        <vue-perfect-scrollbar class="result">
            <el-table
                v-loading="result.loading"
                ref="singleTable"
                :data="result.tbDate"
                style="width:100%"
                class="hight-light-row"
                highlight-current-row
                @row-click="rowClick"
            >
                <el-table-column
                    label="序"
                    type="index"
                    width="50"
                ></el-table-column>
                <el-table-column
                    v-for="(item, index) in result.thList.ylxx"
                    :prop="item.value"
                    :label="item.label"
                    :key="index"
                ></el-table-column>
            </el-table>
        </vue-perfect-scrollbar>
    </div>
</template>

<script lang="ts">
    import "../../../styles/mapView/right.scss";
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import { State, Mutation } from "vuex-class";
    import { PlayInterval } from "@/components";

    let cancelToken: any = null;
    @Component({
        components: {
            PlayInterval
        }
    })
    export default class WeatherRadar extends Vue {
        @State("userInfo") userInfo: any;
        @Mutation("getLdUrl") getLdUrl: any;
        @Mutation("getLdTime") getLdTime: any;
        data: any = {
            type: "气象雷达",
            show: true
        };
        titleUrl: any = require("@/assets/title.png");
        result: any = {
            thList: {
                ylxx: [
                    {
                        label: "雷达时间",
                        value: "time"
                    }
                ]
            },
            tbDate: [],
            allData: [],
            interval: false,
            numInterval: null,
            index: 0,
            intervalNum: 2000,
            loading: false
        };

        refresh() {
            let self = this;
            let params: any = {
                key: "zjqxfwzx-data/other/radar_HREF/",
                _: Date.now()
            };
            self.result.tbDate = [];
            if (cancelToken) {
                cancelToken();
            }
            this.result.loading = true;
            this.$http
                .get("/rest/rainAnalysis/getQXLDList", {
                    params: params,
                    cancelToken: new this.$http.CancelToken(cancel => {
                        cancelToken = cancel;
                    })
                })
                .then(res => {
                    this.result.loading = false;
                    res.data.reverse().forEach(function(item: any, i: number) {
                        //zjqxfwzx-data/other/radar_HREF/MOSAICHREF000.20190904.022000.latlon
                        if (i < 12) {
                            let arr = item.split(".");
                            let hour: any = Number(arr[2].slice(0, 2));
                            if (hour < 16) {
                                hour += 8;
                            } else {
                                hour = hour + 8 - 24;
                            }
                            hour = hour < 10 ? "0" + hour : hour;
                            self.result.tbDate.push({
                                time:
                                    arr[1] +
                                    " " +
                                    hour +
                                    ":" +
                                    arr[2].slice(2, 4),
                                name:
                                    "MOSAICHREF000" +
                                    "." +
                                    arr[1] +
                                    "." +
                                    arr[2] +
                                    "." +
                                    arr[3],
                                show:
                                    arr[1].slice(6, 8) +
                                    "日" +
                                    hour +
                                    "时" +
                                    arr[2].slice(2, 4) +
                                    "分"
                            });
                        }
                    });
                    self.rowClick(self.result.tbDate[0]);
                    let single: any = self.$refs.singleTable;
                    single.setCurrentRow(self.result.tbDate[0]);
                });
        }

        rowClick(row: any) {
            //console.log(row);
            this.playLd(false);
            this.getLdUrl(row.name);
            this.getLdTime(row.show);
            this.result.index = this.result.tbDate.findIndex(
                (item: any) => item.name === row.name
            );
        }

        hideList() {
            this.$emit("closeRight");
        }

        // 处理播放组件的时间间隔
        handleChangeInterval(interval: number): void {
            this.result.intervalNum = interval * 1000;
            this.handleChangeStatus(true);
        }

        // 处理播放组件的播放状态
        handleChangeStatus(status: boolean): void {
            clearInterval(this.result.numInterval);
            if (status) {
                this.result.numInterval = setInterval(() => {
                    this.getLdUrl(
                        this.result.tbDate[
                            this.result.tbDate.length - 1 - this.result.index
                        ].name
                    );
                    this.getLdTime(
                        this.result.tbDate[
                            this.result.tbDate.length - 1 - this.result.index
                        ].show
                    );
                    (this.$refs.singleTable as any).setCurrentRow(
                        this.result.tbDate[
                            this.result.tbDate.length - 1 - this.result.index
                        ]
                    );
                    this.result.index++;
                    if (this.result.index >= this.result.tbDate.length) {
                        this.result.index = 0;
                    }
                }, this.result.intervalNum);
            }
        }

        playLd(status: boolean) {
            let self = this;
            self.result.interval = status;
            let single: any = this.$refs.singleTable;
            if (status) {
                let index = 0;
                if (
                    this.result.numInterval ||
                    index >= self.result.tbDate.length
                ) {
                    clearInterval(this.result.numInterval);
                }
                this.result.numInterval = setInterval(function() {
                    self.getLdUrl(
                        self.result.tbDate[
                            self.result.tbDate.length - 1 - index
                        ].name
                    );
                    self.getLdTime(
                        self.result.tbDate[
                            self.result.tbDate.length - 1 - index
                        ].show
                    );
                    single.setCurrentRow(
                        self.result.tbDate[
                            self.result.tbDate.length - 1 - index
                        ]
                    );
                    index++;
                    if (index >= self.result.tbDate.length) {
                        index = 0;
                        // clearInterval(self.result.numInterval);
                        // self.result.interval = false;
                    }
                }, 2000);
            } else {
                if (this.result.numInterval) {
                    clearInterval(this.result.numInterval);
                }
            }
        }

        created() {
            this.refresh();
        }

        beforeDestroy() {
            if (this.result.numInterval) {
                clearInterval(this.result.numInterval);
            }
            this.getLdUrl(null);
            this.getLdTime(null);
        }
    }
</script>
<style lang="scss" scoped>
    .details {
        .tab {
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
            height: calc(100% - 100px);
        }

        .fr {
            margin-right: 20px;
            margin-top: 8px;
        }
    }
</style>
