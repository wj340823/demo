<template>
    <div class="details spec" :style="{ height: heightMixin }">
        <el-tabs v-model="data.type" type="card">
            <el-tab-pane name="监测信息" label="监测信息">
                <div class="tab">
                    <!--<div
                        class="item"
                        style="border-right: 1px solid #ddd; width: 25%"
                        :class="data.alarmInfo == 0 ? 'act' : ''"
                        @click="data.alarmInfo = 0"
                    >
                        水雨情简报
                        <span v-if="data.alarmInfo == 0"></span>
                    </div>-->
                    <div
                        class="item"
                        style="border-right: 1px solid #ddd; width: 33%"
                        :class="data.alarmInfo == 1 ? 'act' : ''"
                        @click="data.alarmInfo = 1"
                    >
                        概述信息
                        <span v-if="data.alarmInfo == 1"></span>
                    </div>
                    <!--class="item" style="border-right: 1px solid #ddd; width: 33%"-->
                    <div
                        class="item"
                        style="width: 33%;border-right: 1px solid #ddd;"
                        :class="data.alarmInfo == 2 ? 'act' : ''"
                        @click="data.alarmInfo = 2"
                    >
                        小时暴雨
                        <span v-if="data.alarmInfo == 2"></span>
                    </div>
                    <div
                        class="item"
                        style="width: 33%"
                        :class="data.alarmInfo == 3 ? 'act' : ''"
                        @click="data.alarmInfo = 3"
                    >
                        最新警报
                        <span v-if="data.alarmInfo == 3"></span>
                    </div>
                </div>
                <vue-perfect-scrollbar
                    class="result"
                    :style="{ height: parseInt(heightMixin) - 80 + 'px' }"
                >
                    <!--<div
                        v-if="data.alarmInfo == 0"
                        class="overview"
                        v-loading="result.loading1"
                    >
                        <p v-show="data.rain != ''">
                            <span class="tit">[雨情] </span>
                            <span>{{ data.rain }}</span>
                        </p>
                        <p v-show="data.jhInfo != ''">
                            <span class="tit">[江河水情] </span>
                            <span>{{ data.jhInfo }}</span>
                        </p>
                        <p v-show="data.skInfo != ''">
                            <span class="tit">[大中型水库水情] </span>
                            <span>{{ data.skInfo }}</span>
                        </p>
                    </div>-->
                    <div v-if="data.alarmInfo == 1">
                        <div class="tab">
                            <span class="fl">序</span>
                            <span class="fr">概述信息</span>
                        </div>
                        <ul v-loading="alarmResult.loading">
                            <li
                                v-for="(item, index) in alarmResult.gsxx"
                                :key="index"
                            >
                                <div
                                    class="yjbt libg"
                                    @click="item.show = !item.show"
                                >
                                    <img
                                        src="@/assets/rightCon/right_icon.png"
                                        alt
                                        v-show="!item.show"
                                    />
                                    <img
                                        src="@/assets/rightCon/bottom_icon.png"
                                        alt
                                        class="btm_img"
                                        v-show="item.show"
                                    />
                                    <img
                                        src="@/assets/rightCon/folder.png"
                                        alt
                                        class="folderImg"
                                    />
                                    {{ item.title }}
                                </div>
                                <ul v-show="item.show">
                                    <li
                                        v-for="(list, ind) in item.list"
                                        :key="ind"
                                    >
                                        <div class="ejbt">
                                            {{
                                                list.title +
                                                    " (" +
                                                    list.count +
                                                    ")个"
                                            }}
                                        </div>
                                        <ul>
                                            <li
                                                v-for="(sing, i) in list.list"
                                                :key="i"
                                            >
                                                <div
                                                    class="sjbt alarmed"
                                                    @click="locate(sing)"
                                                    @mouseenter="
                                                        hoverLocate(sing)
                                                    "
                                                    @mouseleave="
                                                        hoverLocate(null)
                                                    "
                                                >
                                                    <span>{{ i + 1 }}</span>
                                                    <span :title="sing.name">
                                                        {{ sing.name }}
                                                    </span>
                                                </div>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                    <div v-if="data.alarmInfo == 2">
                        <div
                            class="searchBar"
                            style="line-height: 30px;margin-bottom: 5px;margin-left: 20px"
                        >
                            <el-radio-group
                                v-model="alarmResult.timeList.selected"
                                @change="changeTime"
                            >
                                <el-radio
                                    :label="item.label"
                                    :key="index"
                                    v-for="(item, index) in alarmResult.timeList
                                        .list"
                                ></el-radio>
                            </el-radio-group>
                        </div>
                        <el-table
                            :data="alarmResult.tbDate"
                            tooltip-effect="dark"
                            v-loading="alarmResult.loading"
                            :height="parseInt(heightMixin) - 125"
                        >
                            <el-table-column
                                type="index"
                                width="50"
                                label="序"
                                fixed="left"
                            ></el-table-column>
                            <el-table-column
                                v-for="(item, index) in alarmResult.thList.ylxx"
                                :prop="item.value"
                                show-overflow-tooltip
                                :label="item.label"
                                :fixed="item.fixed"
                                :key="index"
                            ></el-table-column>
                        </el-table>
                    </div>
                    <div v-if="data.alarmInfo == 3">
                        <div class="tab1">
                            <span class="fl">报警设置</span>
                            <span
                                class="fr shows"
                                @click="alarmSearch.show = true"
                                v-show="!alarmSearch.show"
                            >
                                <img
                                    src="@/assets/rightCon/bottom_icon.png"
                                    alt
                                />
                            </span>
                            <span
                                class="fr shows"
                                @click="alarmSearch.show = false"
                                v-show="alarmSearch.show"
                            >
                                <img
                                    src="@/assets/rightCon/right_icon.png"
                                    alt
                                />
                            </span>
                        </div>
                        <div class="clearFix"></div>
                        <el-collapse-transition>
                            <div v-show="!alarmSearch.show" class="searchNav">
                                <div class="searchBar" style="margin-bottom: 0">
                                    <span class="lb-item">站类选择:</span>
                                    <el-checkbox-group
                                        v-model="alarmSearch.zlxz.selected"
                                    >
                                        <el-checkbox
                                            :label="item.label"
                                            :key="index"
                                            v-for="(item, index) in alarmSearch
                                                .zlxz.list"
                                        ></el-checkbox>
                                    </el-checkbox-group>
                                </div>
                                <div class="searchBar" style="margin-bottom: 0">
                                    <span class="lb-item">水库类型:</span>
                                    <el-checkbox-group
                                        v-model="alarmSearch.sklx.selected"
                                    >
                                        <el-checkbox
                                            :label="item.label"
                                            :key="index"
                                            v-for="(item, index) in alarmSearch
                                                .sklx.list"
                                        ></el-checkbox>
                                    </el-checkbox-group>
                                </div>
                                <div class="searchBar" style="color: #0169e1;">
                                    <span>水位涨幅设置 (5分钟)</span>
                                </div>
                                <div class="searchBar">
                                    <div
                                        class="numItem"
                                        :style="
                                            index == 6 ? { width: '178px' } : ''
                                        "
                                        v-for="(item,
                                        index) in alarmSearch.numItem"
                                        :key="index"
                                    >
                                        <span class="label">
                                            {{ item.label }}
                                        </span>

                                        <el-input-number
                                            v-model="item.default"
                                            controls-position="right"
                                            :step="item.step"
                                            :min="0"
                                        ></el-input-number>
                                    </div>
                                    <div
                                        class="fr"
                                        style="color: #f8bd5a;line-height: 35px;margin-right: 20px"
                                    >
                                        注：仅对本次设置有效
                                    </div>
                                </div>
                                <div class="searchBar clearFix">
                                    <div class="setBtn" @click="filerData">
                                        设置
                                    </div>
                                </div>
                            </div>
                        </el-collapse-transition>
                        <ul v-loading="alarmResult.loading">
                            <li
                                v-if="index != 0"
                                v-for="(item, index) in alarmResult.gsxxFilter"
                                :key="index"
                            >
                                <div
                                    class="yjbt libg"
                                    @click="item.show = !item.show"
                                >
                                    <img
                                        src="@/assets/rightCon/right_icon.png"
                                        alt
                                        v-show="!item.show"
                                    />
                                    <img
                                        src="@/assets/rightCon/bottom_icon.png"
                                        alt
                                        class="btm_img"
                                        v-show="item.show"
                                    />
                                    <img
                                        src="@/assets/rightCon/folder.png"
                                        alt
                                        class="folderImg"
                                    />
                                    {{ item.title }}
                                </div>
                                <ul v-show="item.show">
                                    <!--<li
                                        v-if="index == 0"
                                        v-for="(sing, i) in item.list"
                                        :key="i"
                                    >
                                        <div
                                            class="sjbt"
                                            @click="locate(sing)"
                                            :class="
                                                sing.alarmed != undefined
                                                    ? 'alarmed'
                                                    : ''
                                            "
                                        >
                                            <span>{{ i + 1 }}</span>
                                            <span>{{ sing.name }}</span>
                                        </div>
                                    </li>-->
                                    <li
                                        v-if="index != 0"
                                        v-for="(list, ind) in item.list"
                                        :key="ind"
                                        v-show="item.list.length > 0"
                                    >
                                        <div class="ejbt">
                                            {{
                                                list.title +
                                                    " " +
                                                    list.count +
                                                    "个"
                                            }}
                                        </div>
                                        <ul>
                                            <li
                                                v-for="(sing, i) in list.list"
                                                :key="i"
                                            >
                                                <div
                                                    class="sjbt"
                                                    @click="locate(sing)"
                                                    :class="
                                                        !sing.alarmed
                                                            ? 'alarmed'
                                                            : ''
                                                    "
                                                >
                                                    <span>{{ i + 1 }}</span>
                                                    <span>
                                                        {{ sing.name }}
                                                    </span>
                                                </div>
                                            </li>
                                        </ul>
                                    </li>
                                    <li v-show="item.list.length == 0">
                                        <div class="sjbt">
                                            <span>暂无数据</span>
                                        </div>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </vue-perfect-scrollbar>
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
    import { State, Mutation, Action } from "vuex-class";
    import weatherRadar from "../weatherRadar/Main.vue";
    import AutoHeightMixin from "../../../mixins/autoHeight";
    import stormSurge from "../stormSurge/Main.vue";
    @Component({
        components: { weatherRadar, stormSurge }
    })
    export default class MonitorInfo extends AutoHeightMixin {
        @State alarmResult: any;
        @State alarmSearch: any;
        @Mutation("getCenter") getCenter: any;
        @Mutation("getZoom") getZoom: any;
        @Mutation("getPoint") getPoint: any;
        @State("pagesShow") pagesShow: any;
        @Mutation setAlarmResultLoading!: Function;
        @Mutation setAlarmResultTbDate!: Function;
        @Mutation("setHoverPoint") setHoverPoint: any;
        @Mutation setAlarmSearchShow!: Function;
        @Action initAlarmResult!: Function;
        @State(state => state.userInfo) userInfo!: any;
        data: any = {
            type: "监测信息",
            show: true,
            alarmInfo: "1",
            rain: "",
            skInfo: "",
            jhInfo: ""
        };

        result: any = {
            loading: false,
            loading1: false,
            timeList: {
                selected: "1小时",
                list: [
                    { label: "1小时" },
                    { label: "3小时" },
                    { label: "6小时" },
                    { label: "12小时" },
                    { label: "24小时" }
                ]
            },
            tbDate: [],
            cjList: [],
            pointData: []
        };

        tableHeight: number = 0;

        changeTime(val: any) {
            this.searchByList(parseInt(val));
        }

        hideList() {
            this.$emit("closeRight");
        }

        @Watch("alarmResult.pointData")
        pointDataChange(nval: any) {
            this.$emit("getPoints", this.alarmResult.pointData);
        }
        @Watch("userInfo", { immediate: true, deep: true })
        handleLogin() {
            this.autoHeightMixin(136, true);
        }

        searchByList(num: number) {
            this.result.loading = true;
            const level: any = {
                "1": 30,
                "3": 50,
                "6": 80,
                "12": 100,
                "24": 250
            };
            this.setAlarmResultLoading(true);
            let self = this;
            let params = {
                areaFlag: 1,
                hourBefore: num,
                x: 30
            };
            this.$http
                .get("/rest/rain/getBigHourRain", { params: params })
                .then(res => {
                    this.result.loading = false;
                    //this.result.tbDate = []
                    this.setAlarmResultLoading(false);
                    this.setAlarmResultTbDate([]);
                    let tbDate: any[] = [];
                    res.data.forEach(function(item: any) {
                        tbDate.push({
                            number: item.zh,
                            name: item.zm,
                            value: item.yl,
                            time: self.$utils.dateFormat(
                                new Date(item.sbsj),
                                "yyyy-MM-dd HH:mm"
                            ),
                            city: item.sss,
                            county: item.ssx,
                            lon: item.jd || "",
                            lat: item.wd || ""
                        });
                    });
                    this.setAlarmResultTbDate(tbDate);
                    //console.log(res.data)
                });
        }

        filerData() {
            this.setAlarmSearchShow(false);
            this.initAlarmResult().then(() => {
                this.setAlarmResultLoading(false);
            });
        }

        locate(item: any) {
            this.getZoom(12);
            this.getCenter([item.lon, item.lat + 0.08]);
            this.getPoint(item);
        }

        hoverLocate(item: any) {
            this.setHoverPoint(item);
        }

        getOverview() {
            this.result.loading1 = true;
            this.$http
                .get("/rest/rainConfigAndAlarm/waterSummarize")
                .then(res => {
                    this.result.loading1 = false;
                    this.data.rain = res.data.rain;
                    this.data.skInfo = res.data.rsvr;
                    this.data.jhInfo = res.data.river;
                })
                .catch(() => {
                    this.result.loading1 = false;
                });
        }
        created() {
            this.searchByList(parseInt(this.result.timeList.selected));
            this.getOverview();
            if (this.$route.query.index) {
                this.data.alarmInfo = this.$route.query.index;
            }
            /*if (this.userInfo.roles === "middle") {
                const event = new Event("autoTableHeight");
                window.addEventListener("autoTableHeight", () => {
                    this.tableHeight = window.innerHeight - 174;
                });
                window.addEventListener("resize", () => {
                    window.dispatchEvent(event);
                });
                window.dispatchEvent(event);
            } else {
                const event = new Event("autoTableHeight");
                window.addEventListener("autoTableHeight", () => {
                    this.tableHeight = window.innerHeight - 255;
                });
                window.addEventListener("resize", () => {
                    window.dispatchEvent(event);
                });
                window.dispatchEvent(event);
            }*/
            /*const event = new Event("autoTableHeight");
            window.addEventListener("autoTableHeight", () => {
                this.tableHeight = window.innerHeight - 255;
            });
            window.addEventListener("resize", () => {
                window.dispatchEvent(event);
            });
            window.dispatchEvent(event);*/
        }
        mounted(): void {
            this.$emit("getPoints", this.alarmResult.pointData);
        }
    }
</script>
<style lang="scss">
    .spec {
        .tab {
            padding: 12px 0;
            height: 40px;

            span {
                top: 30px;
            }
        }

        .searchBar {
            .numItem {
                line-height: 30px;
                width: 110px;
                float: left;
                margin-bottom: 5px;
                margin-right: 10px;

                .label {
                    display: inline-block;
                    margin-right: 10px;
                }

                .el-input__inner {
                    padding-right: 20px !important;
                    padding-left: 10px;
                    line-height: 30px;
                    height: 30px;
                }

                .el-input-number {
                    width: 70px;
                    line-height: 30px !important;
                }

                .el-input-number.is-controls-right .el-input-number__decrease,
                .el-input-number.is-controls-right .el-input-number__increase {
                    line-height: 15px;
                    width: 20px;
                }
            }

            .setBtn {
                width: 180px;
                height: 30px;
                border-radius: 3px;
                border: dotted 1px #0169e1;
                line-height: 30px;
                color: #0169e1;
                margin: 0 auto;
                text-align: center;
                cursor: pointer;
            }
        }

        .result {
            padding: 5px;
            .tab {
                padding: 0 15px;
                line-height: 40px;
                height: 40px;
                margin-top: 0;
                background-color: #f0f2f5;
            }

            .tab1 {
                margin-top: -10px;
                padding: 0 5px;
                text-align: left;
                height: 40px;
                line-height: 40px;

                > span {
                    margin-right: 20px;
                    color: #0169e1;
                    font-size: 14px;
                    cursor: pointer;
                    user-select: none;
                }

                //background-color: #0169e1;
                .el-input__inner {
                    background-color: rgb(1, 105, 225, 0.05);
                }
            }

            .searchNav {
                margin-bottom: 10px;
            }

            ul {
                list-style: none;

                li {
                    line-height: 26px;

                    div {
                        padding: 0 10px;
                    }

                    .yjbt {
                        color: rgb(11, 51, 60);
                        font-size: 15px;
                        cursor: pointer;
                        font-weight: bold;

                        .btm_img {
                            margin-bottom: 3px;
                        }

                        .folderImg {
                            margin-left: 10px;
                            margin-right: 10px;
                        }
                    }

                    .ejbt {
                        color: rgb(0, 128, 0);
                        font-weight: bold;
                        padding-left: 20px;
                    }

                    .sjbt {
                        padding-left: 30px;
                        color: red;
                        cursor: pointer;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;

                        & > span:first-child {
                            margin-right: 10px;
                        }
                    }

                    .sjbt.alarmed {
                        color: #333;
                    }
                }

                .libg {
                    background-color: #f1f1f1;
                }
            }
        }

        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            height: 50px;
            background-color: rgb(1, 105, 225, 0.05);
        }
        .overview {
            min-height: 400px;
            p {
                margin-top: 5px;
                text-align: justify;
                font-size: 15px;
                font-weight: normal;
                line-height: 30px;
                padding: 0 18px;
                letter-spacing: 0;
                .tit {
                    font-weight: 500;
                    color: red;
                }
            }
        }
    }
</style>
