<template>
    <div class="details">
        <!--<div class="title">
            {{ data.type }}
        </div>-->
        <el-tabs v-model="data.type" type="card">
            <el-tab-pane name="洪水分析" label="洪水分析">
                <div
                    v-if="$utils.checkUser(userInfo.roles, 'super')"
                    style="padding-top: 5px"
                >
                    <div class="searchBar" style="line-height: 30px">
                        <span class="lb-item">起止时间:</span>
                        <el-date-picker
                            class="searchItem searchDadeItem"
                            style="line-height: 30px;"
                            format="yyyy-MM-dd"
                            v-model="search.current.start"
                            type="date"
                            @change="getStartTime"
                        />
                        ~
                        <el-date-picker
                            class="searchItem searchDadeItem"
                            style="line-height: 30px;"
                            format="yyyy-MM-dd"
                            v-model="search.current.end"
                            type="date"
                            @change="getEndTime"
                        />
                    </div>
                    <div class="searchBar">
                        <span class="lb-item">累计降雨:</span>
                        <el-input class="searchItem" v-model="search.ylmin" />
                        ~
                        <el-input class="searchItem" v-model="search.ylmax" />
                    </div>
                    <div class="searchBar">
                        <span class="lb-item">洪峰流量:</span>
                        <el-input
                            class="searchItem"
                            style="width: 44px"
                            v-model="search.llmin"
                        />
                        ~
                        <el-input
                            class="searchItem"
                            style="width: 44px"
                            v-model="search.llmax"
                        />
                        <span class="lb-item">洪峰水位:</span>
                        <el-input
                            class="searchItem"
                            style="width: 44px"
                            v-model="search.floodPeakWL.min"
                        />
                        ~
                        <el-input
                            class="searchItem"
                            style="width: 44px"
                            v-model="search.floodPeakWL.max"
                        />
                    </div>
                    <div class="searchBar">
                        <span class="lb-item">站名:</span>
                        <el-input
                            class="searchItem"
                            style="width: 137px"
                            v-model="search.dmmc"
                        />
                        <el-button
                            size="mini"
                            type="primary"
                            icon="el-icon-search"
                            class="el-button-search"
                            @click="searchResult"
                            >查询
                        </el-button>
                        <img
                            v-if="$utils.checkUser(userInfo.roles, 'super')"
                            src="../../../assets/button/export-excel.png"
                            @click="handleExport"
                            class="export-button__img"
                            alt="导出"
                        />
                    </div>
                </div>
                <div class="result">
                    <el-table
                        border
                        :data="flood.analyse.point"
                        style="width: 100%"
                        stripe
                        :height="heightMixin"
                        v-loading="result.loading"
                        @row-click="selectFlood"
                        @cell-mouse-enter="hoverCell"
                        @cell-mouse-leave="leaveCell"
                    >
                        <el-table-column type="index" width="50" label="序" />
                        <el-table-column
                            show-overflow-tooltip
                            v-for="(item, index) in result.thList"
                            :prop="item.value"
                            :label="item.label"
                            :key="index"
                            :width="item.width"
                        />
                        <!--{
                            label: "断面名",
                            value: "areaName"
                        }-->
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
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import moment from "moment";
    import Modal from "./Modal.vue";
    import "../../../styles/mapView/right.scss";
    import { State, Mutation } from "vuex-class";
    import AutoHeightMixin from "../../../mixins/autoHeight";
    import weatherRadar from "../weatherRadar/Main.vue";
    import stormSurge from "../stormSurge/Main.vue";
    let cancelToken: any = null;
    @Component({
        components: { Modal, weatherRadar, stormSurge}
    })
    export default class FloodAnalysis extends AutoHeightMixin {
        @State("flood") flood: any;
        @State("userInfo") userInfo: any;
        @State("pagesShow") pagesShow: any;
        @Mutation("getCenter") getCenter: any;
        @Mutation("getZoom") setZoom: any;
        @Mutation("openFloodAnalyseModal") openFloodAnalyseModal: any;
        @Mutation("setHoverPoint") setHoverPoint: any;
        data: any = {
            type: "洪水分析",
            show: true
        };
        floodAnalyseImg: any = require("@/assets/legend/rain_0.png");
        search: any = {
            current: {
                start: new Date(
                    moment()
                        .subtract(3, "year")
                        .format("YYYY-MM-DD")
                ).getTime(),
                end: Date.now()
            },
            ylmin: "",
            ylmax: "",
            llmin: "",
            llmax: "",
            dmmc: "",
            floodPeakWL: {
                min: "",
                max: ""
            }
        };
        result: any = {
            thList: [
                {
                    label: "洪号",
                    value: "floodNum",
                    width: 100
                },
                {
                    label: "流域名称",
                    value: "areaName",
                    width: 90
                },
                {
                    label: "站名",
                    value: "stateName"
                },
                {
                    label: "洪峰水位",
                    value: "sw"
                },
                {
                    label: "累计降雨",
                    value: "ljjy"
                },
                {
                    label: "洪峰流量",
                    value: "hfll"
                }
            ],
            loading: false,
            tbData: []
        };
        modal: any = {};

        // created(): void {
        //     this.searchResult();
        // }

        getStartTime(val: any) {
            this.search.current.start = new Date(val).getTime();
        }
        getEndTime(val: any) {
            this.search.current.end = new Date(val).getTime();
        }
        selectFlood(row: any, column: any) {
            let self = this;
            const {
                areaName,
                floodNum,
                stateName,
                stateId,
                areaNum,
                lon,
                lat
            } = row;
            this.flood.analyse.data = {
                visible: true,
                areaName,
                floodNum,
                stateName,
                stateId,
                areaNum,
                lon,
                lat
            };
            this.setZoom(12);
            this.getCenter([row.lon + 0.02, row.lat + 0.06]);
            this.openFloodAnalyseModal(row);
        }
        hoverCell(row: any) {
            this.setHoverPoint(row);
        }
        leaveCell() {
            this.setHoverPoint(null);
        }
        hideList() {
            this.$emit("closeRight");
        }

        handleClose() {
            this.modal.visible = false;
        }

        searchResult(): void {
            let self = this;
            const { search } = self;
            this.result.tbData = [];
            this.flood.analyse.point = [];
            let params: any = {
                st: this.$utils.dateFormat(
                    new Date(this.search.current.start),
                    "yyyy-MM-ddTHH:mm:ss"
                ),
                et: this.$utils.dateFormat(
                    new Date(this.search.current.end),
                    "yyyy-MM-ddTHH:mm:ss"
                ),
                area: search.dmmc,
                ylmin: search.ylmin,
                ylmax: search.ylmax,
                llmin: search.llmin,
                llmax: search.llmax,
                swmin: search.floodPeakWL.min,
                swmax: search.floodPeakWL.max,
                role: this.userInfo.roles
            };
            if (this.userInfo.roles == "middle") {
                params = {
                    role: this.userInfo.roles
                };
            }
            this.result.loading = true;
            if (cancelToken) {
                cancelToken();
            }
            this.$http
                .get("rest/flood/getStatisticList", {
                    params: params,
                    cancelToken: new this.$http.CancelToken(cancel => {
                        cancelToken = cancel;
                    })
                })
                .then(res => {
                    self.result.loading = false;
                    res.data.forEach((item: any, index: number) => {
                        this.flood.analyse.point.push({
                            id: item.zh + index,
                            item: item.item,
                            stateName: item.zm,
                            areaName: item.dmmc,
                            sw: item.sw,
                            ljjy: item.ljjy,
                            hfll: item.hfll,
                            floodNum: item.hh,
                            stateId: item.zh,
                            areaNum: item.dmh,
                            lon: item.lgtd,
                            lat: item.lttd,
                            style: {
                                image: {
                                    icon: {
                                        anchor: [0.5, 1],
                                        src: this.floodAnalyseImg,
                                        scale: 0.7
                                    }
                                }
                            }
                        });
                    });
                });
        }

        handleExport() {
            const {
                dmmc,
                current,
                ylmin,
                ylmax,
                llmax,
                llmin,
                floodPeakWL
            } = this.search;
            let params: any = {
                area: dmmc,
                st: moment(current.start).format("YYYY-MM-DDTHH:mm:ss"),
                et: moment(current.end).format("YYYY-MM-DDTHH:mm:ss"),
                ylmin: ylmin,
                ylmax: ylmax,
                llmin: llmin,
                llmax: llmax,
                swmin: floodPeakWL.min,
                swmax: floodPeakWL.max
            };
            const url = this.$utils.formatURL(
                "/rest/flood/leadoutStatisticList",
                params
            );
            window.open(url);
        }

        created(): void {
            this.searchResult();
            this.search.current[1] = this.$utils.dateFormat(
                new Date(),
                "yyyy-MM-ddTHH:mm:ss"
            );
            if (this.userInfo.roles != "middle") {
                this.autoHeightMixin(336);
            } else {
                this.autoHeightMixin(336 - 160);
            }
        }
    }
</script>

<style lang="scss" scoped>
    .details {
        .searchBar {
            .searchItem {
                width: 136px;
            }
        }

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
        }
    }
</style>
