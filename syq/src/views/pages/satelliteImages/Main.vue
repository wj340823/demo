<template>
    <div class="details">
        <el-tabs v-model="data.type" type="card">
            <el-tab-pane name="卫星云图" label="卫星云图">
                <div class="tab searchBar">
                    <span>最近张数：</span>
                    <el-select
                        style="width: 70px"
                        class="searchItem"
                        placeholder="请选择"
                        v-model="result.fwList.default"
                        @change="changeNum"
                    >
                        <el-option
                            v-for="item in result.fwList.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                    <PlayInterval
                        @changeInterval="handleChangeInterval"
                        @changeStatus="handleChangeStatus"
                        :interval-num="result.intervalNum / 1000"
                    />
                </div>
                <vue-perfect-scrollbar class="result">
                    <el-table
                        ref="singleTable"
                        :data="result.tbDate"
                        style="width:100%"
                        highlight-current-row
                        :height="heightMixin"
                        @row-click="rowClick"
                        stripe
                        class="hight-light-row"
                    >
                        <el-table-column
                            type="index"
                            width="50"
                            label="序"
                        ></el-table-column>
                        <el-table-column
                            v-for="(item, index) in result.thList.ylxx"
                            :prop="item.value"
                            :label="item.label"
                            :key="index"
                        ></el-table-column>
                    </el-table>
                </vue-perfect-scrollbar>
            </el-tab-pane>
            <el-tab-pane
                name="气象雷达"
                label="气象雷达"
                v-if="pagesShow['气象雷达']"
            >
                <WeatherRadar />
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
    import { State, Mutation, Action } from "vuex-class";
    import WeatherRadar from "../weatherRadar/Main.vue";
    import AutoHeightMixin from "../../../mixins/autoHeight";
    import { PlayInterval } from "@/components";
    import stormSurge from "../stormSurge/Main.vue";
    @Component({
        components: { WeatherRadar, PlayInterval, stormSurge }
    })
    export default class SatelliteImages extends AutoHeightMixin {
        @State("pagesShow") pagesShow: any;
        @Mutation("getCloudUrl") getCloudUrl: any;
        @Action("getSatelliteImage") getSatelliteImage!: Function;
        @Mutation("getYtTime") getYtTime: any;
        @Mutation("getZoom") setZoom!: Function;
        data: any = {
            type: "卫星云图",
            show: true
        };
        olMap: any = this.$getMapConfig();
        result: any = {
            fwList: {
                default: 12,
                arr: [
                    {
                        label: "12",
                        value: 12
                    },
                    {
                        label: "24",
                        value: 24
                    },
                    {
                        label: "48",
                        value: 48
                    }
                ]
            },
            thList: {
                ylxx: [
                    {
                        label: "云图时间",
                        value: "time"
                    }
                ]
            },
            tbDate: [
                {
                    time: "2019/01/06 15:11:22"
                }
            ],
            allData: [],
            interval: false,
            numInterval: null,
            index: 0,
            intervalNum: 2000
        };

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
                    this.getCloudUrl(
                        this.result.tbDate[
                            this.result.tbDate.length - 1 - this.result.index
                        ].name
                    );
                    this.getYtTime(
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

        changeNum(num: any) {
            this.result.tbDate = this.result.allData.slice(0, num);
        }

        playCloud(status: boolean) {
            let self = this;
            self.result.interval = status;
            let single: any = this.$refs.singleTable;
            if (status) {
                let index = 0;
                this.result.numInterval = setInterval(function() {
                    self.getCloudUrl(
                        self.result.tbDate[
                            self.result.tbDate.length - 1 - index
                        ].name
                    );
                    self.getYtTime(
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
                    }
                }, 1000);
            } else {
                if (this.result.numInterval) {
                    self.result.interval = false;
                    clearInterval(this.result.numInterval);
                }
            }
        }

        rowClick(row: any) {
            // this.getSatelliteImage({ name: row.name.split(".")[0] });
            // this.playCloud(false);
            this.getYtTime(row.show);
            clearInterval(this.result.numInterval);
            this.result.index = this.result.tbDate.findIndex(
                (item: any) => item.name === row.name
            );
            this.getCloudUrl(row.name);
        }

        hideList() {
            this.$emit("closeRight");
        }

        created() {
            this.autoHeightMixin(226);
            let self = this;
            let params: any = {
                dataType: "FY2/IR2",
                _: Date.now()
            };
            self.result.tbDate = [];
            this.setZoom(6);
            //94.92027659211374
            //1: 45.07279301139504
            this.olMap.map.view.extent = [
                94.92027659211374,
                0,
                160.13671093750003,
                45.07279301139504
            ];
            this.olMap.map.view.center.coord = [
                (94.92027659211374 + 160.13671093750003) / 2,
                45.07279301139504 / 2
            ];
            this.$http
                .get("/rest/rainAnalysis/getWxPicList", {
                    params
                })
                .then(res => {
                    res.data.data.forEach(function(item: any, i: number) {
                        self.result.allData.push({
                            time:
                                item.dateTime.slice(0, 8) +
                                " " +
                                item.dateTime.slice(8, 10) +
                                ":" +
                                item.dateTime.slice(10, 12),
                            name: item.filename,
                            title: item.title,
                            show:
                                item.dateTime.slice(6, 8) +
                                "日" +
                                item.dateTime.slice(8, 10) +
                                "时" +
                                item.dateTime.slice(10, 12) +
                                "分"
                        });
                    });
                    self.changeNum(self.result.fwList.default);
                    self.rowClick(self.result.tbDate[0]);
                    let single: any = self.$refs.singleTable;
                    single.setCurrentRow(self.result.tbDate[0]);
                });
        }

        beforeDestroy() {
            if (this.result.numInterval) {
                clearInterval(this.result.numInterval);
            }
            this.getCloudUrl("");
            this.getYtTime(null);
        }
    }
</script>

<style lang="scss" scoped>
    .details {
        .tab {
            padding: 0 0 0 10px;
            text-align: left;
            height: 40px;
            line-height: 40px;

            > span {
                font-size: 14px;
            }

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
