<template>
    <div class="details">
        <!--<div class="title">
            {{ data.type }}
        </div>-->
        <el-tabs v-model="data.type" type="card">
            <el-tab-pane name="定制面雨量" label="定制面雨量">
                <div class="searchBar" style="margin-top: 10px">
                    <span>区域名称：</span>
                    <el-input
                        class="searchItem"
                        style="width: 153px; margin: 0; margin-right: 6px"
                        v-model="search.inputVal"
                    />
                    <el-button
                        size="mini"
                        type="primary"
                        icon="el-icon-search"
                        class="el-button-search"
                        @click="searchResult"
                        >查询</el-button
                    >
                    <img
                        src="../../../assets/button/export-excel.png"
                        @click="handleExport"
                        class="export-button__img"
                        alt="导出"
                    />
                </div>
                <div class="tab" style="margin-top: 10px">
                    <span>查询结果</span>
                </div>
                <div class="result">
                    <el-table
                        v-loading="result.loading"
                        :data="result.tbDate"
                        style="width: 100%"
                        :height="heightMixin"
                        stripe
                        @row-click="selectPolygon"
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
                            :align="item.align"
                            :sortable="true"
                        ></el-table-column>
                    </el-table>
                </div>
                <!-- 弹出框 -->
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
        <el-dialog
            class="do-not-use4"
            :fullscreen="false"
            :modal="false"
            :show-close="false"
            v-if="modal.visible"
            :visible="modal.visible"
        >
            <Overlay
                @closeModal="handleClose"
                :prop="modal"
                :visible.sync="modal.visible"
            />
        </el-dialog>
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from "vue-property-decorator";
    import { State, Mutation } from "vuex-class";
    import Overlay from "./Overlay.vue";
    import "../../../styles/mapView/right.scss";
    import AutoHeightMixin from "../../../mixins/autoHeight";
    import weatherRadar from "../weatherRadar/Main.vue";
    import stormSurge from "../stormSurge/Main.vue";
    @Component({
        components: {
            Overlay,
            weatherRadar,
            stormSurge
        }
    })
    export default class CustomRainfall extends AutoHeightMixin {
        @State("pagesShow") pagesShow: any;
        @Mutation("getCenter") getCenter: any;

        data: any = {
            type: "定制面雨量",
            show: true
        };
        search: any = {
            sksel: false,
            inputVal: ""
        };
        result: any = {
            loading: false,
            thList: {
                ylxx: [
                    {
                        label: "名称",
                        value: "name",
                        align: "center"
                    },
                    {
                        label: "近24小时面雨量",
                        value: "myl",
                        align: "center"
                    }
                ]
            },
            tbDate: [],
            points: []
        };
        modal: {
            visible: boolean;
            name: string;
            id: string;
            stations: any;
        } = {
            visible: false,
            name: "",
            id: "",
            stations: []
        };

        handleClose() {
            this.modal.visible = false;
        }

        hideList() {
            this.$emit("closeRight");
        }

        searchResult() {
            let self = this;
            let params = {
                areaName: this.search.inputVal
            };
            this.result.loading = true;
            this.$http
                .get("/rest/areaRain/getAreaRainList", { params: params })
                .then(res => {
                    this.result.loading = false;
                    self.result.tbDate = [];
                    res.data.forEach(function(item: any) {
                        self.result.tbDate.push({
                            name: item.areaName,
                            id: item.id,
                            stations: item.stationList,
                            myl: item.myl
                        });
                    });
                });
        }

        // 点击表格行
        selectPolygon(row: any, column: any) {
            let self = this;

            this.result.points = [];

            if (!row.stations.length) {
                self.$message({
                    message: "暂无监测站"
                });
            } else {
                const { name, id, stations } = row;

                this.modal = {
                    visible: true,
                    name,
                    id,
                    stations
                };

                stations.forEach(function(item: any, index: number) {
                    let obj = {
                        jd: item.lgtd,
                        wd: item.lttd,
                        zh: item.stationId,
                        zm: item.stationName,
                        ssx: item.ssx,
                        sss: item.sss
                    };
                    self.result.points.push({
                        jd: item.lgtd,
                        wd: item.lttd,
                        zh: item.stationId,
                        zm: item.stationName,
                        img: "rain_0.png",
                        ssx: item.ssx,
                        sss: item.sss,
                        info: obj
                    });
                });
            }

            this.$emit("getPoints", self.result.points);

            if (row.stations.length) {
                this.getCenter([row.stations[0].lgtd, row.stations[0].lttd]);
            }
        }

        init() {
            this.searchResult();
        }

        created() {
            this.init();
            this.autoHeightMixin(274);
        }

        // 下载
        handleExport() {
            const url =
                "/rest/areaRain/leadoutAreaRainList?areaName=" +
                this.search.inputVal;
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
    }
</style>
