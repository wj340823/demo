<template>
    <div class="details">
        <div
            class="same-level"
            v-if="$utils.checkUser(userInfo.roles, 'super')"
            @click="toggleExportStatus(true)"
        >
            <img src="./../../../assets/sam-level.png" alt="" />
            <span>导出图</span>
        </div>
        <div class="same-level-dialog" v-if="dialog.visible">
            <div class="same-level-content">
                <header>
                    导出确认
                    <i
                        class="el-icon-close"
                        @click="toggleExportStatus(false)"
                    />
                </header>
                <main>
                    <p>确认导出当前等值面图？</p>
                </main>
                <footer>
                    <el-button size="small" @click="handleConfirmExport"
                        >是
                    </el-button>
                    <el-button size="small" @click="toggleExportStatus(false)"
                        >否
                    </el-button>
                </footer>
            </div>
        </div>
        <!--<div class="title">
            {{ data.type }}
        </div>-->
        <el-tabs v-model="data.type" type="card">
            <el-tab-pane name="降雨分析" label="降雨分析">
                <div class="tab searchBar">
                    <span>降雨过程</span>
                </div>
                <div class="searchBar" style="padding-left: 0">
                    <el-select
                        class="searchItem"
                        style="width: 245px"
                        v-model="result.timeSpace.default"
                        placeholder="请选择"
                        @change="changeTimeType"
                    >
                        <el-option
                            v-for="item in result.timeSpace.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        >
                        </el-option>
                    </el-select>
                    <el-select
                        class="searchItem"
                        v-model="result.area.default"
                        placeholder="请选择"
                        @change="changeType"
                    >
                        <el-option
                            v-for="item in result.area.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        >
                        </el-option>
                    </el-select>
                </div>
                <div class="searchBar">
                    <div class="progress">
                        <img
                            src="@/assets/play/leftbtn.png"
                            alt=""
                            @click="control(false)"
                        />
                        <el-slider
                            v-model="result.timeCur"
                            class="searchItem"
                            :step="result.addZone.step"
                            :max="result.addZone.max"
                            style="width: 116px"
                        ></el-slider>
                        <img
                            src="@/assets/play/rightbtn.png"
                            alt=""
                            style="margin-left: 8px"
                            @click="control(true)"
                        />
                    </div>

                    <span
                        style="margin-left: 15px"
                        v-show="result.area.default == 1"
                        class="dateSpace"
                        >时间 :
                        {{ result.addZone.start }}
                        -
                        {{ result.addZone.end }}
                    </span>
                    <span
                        style="margin-left: 15px"
                        v-show="result.area.default == 2"
                        class="dateSpace"
                        >时间 :
                        {{ result.addZone.start }}
                        -
                        {{ result.addZone.end }}
                    </span>
                </div>
                <div class="searchBar">
                    <el-radio-group v-model="result.areaType.selected">
                        <el-radio
                            v-for="(item, index) in result.areaType.list"
                            :key="index"
                            :value="item.value"
                            :label="item.label"
                        ></el-radio>
                    </el-radio-group>
                    <span style="margin-left: 10px">透明度</span>
                    <el-slider
                        v-model="result.opacity"
                        class="searchItem"
                        :step="0.1"
                        :max="1"
                    ></el-slider>
                </div>
                <div class="searchBar">
                    <span>播放设置（单位：秒）：</span>
                    <el-select
                        class="searchItem"
                        style="width: 60px"
                        v-model="result.deviceTime.default"
                        placeholder="请选择"
                    >
                        <el-option
                            v-for="item in result.deviceTime.arr"
                            :key="item.value"
                            :value="item.value"
                            :label="item.value"
                        >
                        </el-option>
                    </el-select>
                    <img
                        src="@/assets/play/play.png"
                        alt="播放"
                        v-show="!result.addZone.status"
                        @click="play(true)"
                    />
                    <img
                        src="@/assets/play/playDisabled.png"
                        alt="播放"
                        v-show="result.addZone.status"
                    />
                    <!--<div
                        class="control"
                        :class="{ false: 'inAct' }[result.addZone.status]"
                        @click="play(true)"
                    >
                        播放
                    </div>-->
                    <img
                        src="@/assets/play/stop.png"
                        alt="停止"
                        v-show="result.addZone.status"
                        @click="play(false)"
                    />
                    <img
                        src="@/assets/play/stopDisabled.png"
                        alt="停止"
                        v-show="!result.addZone.status"
                    />
                    <!--<div
                        class="control"
                        :class="{ true: 'inAct' }[result.addZone.status]"
                        @click="play(false)"
                    >
                        停止
                    </div>-->
                </div>
                <div class="tab" style="margin-top: 10px">
                    <span>各雨量级笼罩面积</span>
                </div>
                <div class="result">
                    <el-table
                        :data="result.tbDate"
                        v-loading="result.loading"
                        :height="heightMixin"
                        class="rainfallAnalyse"
                        border
                        stripe
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
                        >
                        </el-table-column>
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
        <div
            class="legend-label"
            :class="[userInfo.roles === 'middle' ? 'locate-to-left' : '']"
        >
            <p>等值面图例（mm）</p>
            <ul class="legend-label-color">
                <li
                    v-for="color in colors"
                    :key="color"
                    :style="{ 'background-color': color }"
                />
            </ul>
            <ul class="legend-label-num">
                <li v-for="num in numbers" :key="num">{{ num }}</li>
            </ul>
        </div>
    </div>
</template>

<script lang="ts">
    import "../../../styles/mapView/right.scss";
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import { State, Getter, Action, Mutation, namespace } from "vuex-class";
    import AutoHeightMixin from "../../../mixins/autoHeight";
    import moment from "moment";
    import weatherRadar from "../weatherRadar/Main.vue";
    import stormSurge from "../stormSurge/Main.vue";

    const colors = [
        "rgb(109, 209, 73)",
        "rgb(25, 79, 255)",
        "rgb(252, 130, 0)",
        "rgb(214, 101, 224)",
        "rgb(242, 16, 0)",
        "rgb(84, 0, 0)"
    ];
    const nums = [0, 10, 25, 50, 100, 250];
    const steps = {
        H0: 1,
        H1: 1,
        H3: 3,
        H6: 6,
        H12: 12,
        H24: 24,
        D0: 24,
        D1: 24,
        D3: 72,
        D5: 120,
        D7: 24 * 7
    };
    @Component({
        components: { weatherRadar, stormSurge }
    })
    export default class RainfallAnalysis extends AutoHeightMixin {
        @State("userInfo") userInfo: any;
        @State("pagesShow") pagesShow: any;
        @Mutation("getJyUrl") setJyUrl: any;
        data: any = {
            type: "降雨分析",
            show: true
        };

        dialog: any = {
            visible: false
        };
        result: any = {
            loading: false,
            timeCur: 0,
            currentItem: [],
            timeSpace: {
                default: "",
                arr: []
            },
            selected: null,
            addZone: {
                step: 1,
                max: 100,
                st: Date.now(),
                ed: Date.now(),
                status: false, //播放状态
                interval: null,
                start: moment().format("DD日HH时"),
                end: moment().format("DD日HH时")
            },
            opacity: 0.4, //默认透明度
            area: {
                default: 1,
                arr: [
                    {
                        value: 1,
                        label: "逐小时"
                    },
                    {
                        value: 2,
                        label: "累计"
                    }
                ]
            },
            areaType: {
                select: 4,
                selected: "线和面",
                list: [
                    {
                        label: "等值线",
                        value: 2
                    },
                    {
                        label: "等值面",
                        value: 1
                    },
                    {
                        label: "线和面",
                        value: 4
                    }
                ]
            },
            deviceTime: {
                default: 1,
                arr: [
                    { value: 1 },
                    { value: 2 },
                    { value: 3 },
                    { value: 5 },
                    { value: 8 }
                ]
            },
            thList: {
                ylxx: [
                    {
                        label: "降雨等级(mm)",
                        value: "level"
                    },
                    {
                        label: "降雨面积(km²)",
                        value: "jymj"
                    }
                ]
            },
            tbDate: [],
            allData: []
        };
        colors: any = colors;
        numbers: any = nums;
        imgSelected: string = "";

        init() {
            let self = this;
            self.result.timeSpace.arr = [];
            ///rest/pictureHouse/getListOfPicture
            this.$http
                .post("/rest/pictureHouse/getListOfPicture", {
                    DATA: {
                        Action: "ListMapSet"
                    }
                })
                .then(res => {
                    let arr: any = res.data.Mapset.slice(11);
                    arr.forEach(function(item: any, index: number) {
                        self.result.timeSpace.arr.push({
                            id: item.MapSetID,
                            value: item.MapSetID,
                            label: item.MapSetName,
                            tm1: item.Tm1,
                            tm2: item.Tm2,
                            step:
                                item.Step1 == 0
                                    ? 1
                                    : Number(item.Step1.slice(0, -1))
                        });
                    });
                    self.result.timeSpace.default =
                        self.result.timeSpace.arr[0].value;
                    self.changeTimeType(self.result.timeSpace.arr[0].value);
                });
        }

        control(n: boolean) {
            if (n) {
                this.result.timeCur++;
            } else {
                this.result.timeCur > 0 ? this.result.timeCur-- : "";
            }
        }

        //给表格赋值
        setInitData() {
            this.result.timeCur = 0;
            this.result.addZone.status = false;
            if (this.result.addZone.interval) {
                clearInterval(this.result.addZone.interval);
            }
        }

        setTable(all: any, num: number) {
            let self = this;
            let list: any[] = [];
            /* if (num <= all.length && all.length != 0) {
                all[num].level.forEach(function(item: any) {
                    if (item && item != ",") {
                        list.push({
                            level: item.split(",")[0],
                            jymj: item.split(",")[1]
                        });
                    }
                });
            }*/
            return list;
        }

        interChange() {
            let self = this;

            if (self.result.addZone.interval) {
                clearInterval(self.result.addZone.interval);
            }
            self.result.addZone.interval = setInterval(function() {
                self.result.timeCur++;
                self.getSingleItem();
                /*self.result.tbDate = self.setTable(
                    self.result.allData,
                    self.result.timeCur
                );*/
            }, self.result.deviceTime.default * 1000);
        }

        play(bool: boolean) {
            let self = this;
            self.result.addZone.status = bool;
            if (bool && self.result.timeCur < self.result.addZone.max) {
                self.interChange();
            } else {
                clearInterval(self.result.addZone.interval);
                self.result.addZone.status = false;
            }
        }

        changeTimeType(val: any) {
            let item = this.result.timeSpace.arr.filter((data: any) => {
                return data.id == val;
            })[0];
            this.result.currentItem = item;
            let self = this;
            self.result.allData = [];
            this.setInitData();
            self.result.loading = true;
            self.result.addZone.max =
                (new Date(item.tm2).getTime() - new Date(item.tm1).getTime()) /
                3600000 /
                item.step;
            self.result.addZone.max = parseInt(self.result.addZone.max);
            if (this.result.area.default == 1) {
                self.result.addZone.st = item.tm1;
                self.result.addZone.et =
                    this.$utils.dateFormat(
                        new Date(new Date(item.tm1).getTime() + 3600000),
                        "YYYY-MM-dd HH"
                    ) + ":00:00";
            } else {
                self.result.addZone.st = item.tm1;
                self.result.addZone.et = item.tm2;
            }
            this.result.addZone.end = moment(item.tm1)
                .add(item.step, "hour")
                .format("DD日HH时");
            this.result.addZone.start = moment(item.tm1).format("DD日HH时");
            this.$http
                .post("/rest/pictureHouse/getListOfPicture", {
                    DATA: {
                        Action: "GetMap",
                        tm1: item.tm1,
                        tm2: moment(item.tm1)
                            .add(1, "hour")
                            .format("YYYY-MM-DD HH:00:00"),
                        mapContent: this.result.areaType.select //1面 2 线 4 面+线 8 .。。。
                    }
                })
                .then(res => {
                    self.result.loading = false;
                    let arr = res.data.Map;
                    if (arr) {
                        self.result.allData = {
                            level: null,
                            area: null,
                            img: arr.content || "",
                            tm1: arr.tm1,
                            tm2: arr.tm2
                        };
                    }
                });
        }

        getSingleItem() {
            const self = this;
            let item = this.result.currentItem;
            let tm1, tm2;
            if (this.result.area.default == 1) {
                tm1 = moment(item.tm1)
                    .add(self.result.timeCur * item.step, "hour")
                    .format("YYYY-MM-DD HH:00:00");
                tm2 = moment(item.tm1)
                    .add((self.result.timeCur + 1) * item.step, "hour")
                    .format("YYYY-MM-DD HH:00:00");
            } else {
                tm1 = item.tm1;
                tm2 = moment(item.tm1)
                    .add((self.result.timeCur + 1) * item.step, "hour")
                    .format("YYYY-MM-DD HH:00:00");
            }
            this.result.addZone.end = moment(tm2).format("DD日HH时");
            this.result.addZone.start = moment(tm1).format("DD日HH时");
            self.$http
                .post("/rest/pictureHouse/getListOfPicture", {
                    DATA: {
                        Action: "GetMap",
                        tm1: tm1,
                        tm2: tm2,
                        mapContent: self.result.areaType.select //1面 2 线 4 面+线 8 .。。。
                    }
                })
                .then(res => {
                    self.result.loading = false;
                    let arr = res.data.Map;
                    if (arr) {
                        self.result.allData = {
                            level: null,
                            area: null,
                            img: arr.content || "",
                            tm1: arr.tm1,
                            tm2: arr.tm2
                        };
                        let obj: any = { ...self.result.allData };
                        let params: any = {
                            opacity: self.result.opacity,
                            name: "data:image/jpg;base64," + obj.img
                            //obj['IMG'+self.result.areaType.select]
                        };
                        self.setJyUrl(params);
                        self.imgSelected = params.name;
                    }
                });
        }
        changeType() {
            const self = this;
            this.changeTimeType(this.result.timeSpace.default);
            this.setInitData();
        }

        @Watch("result.areaType.selected")
        changeAreaType(n: any) {
            const self = this;
            self.result.areaType.list.forEach((item: any) => {
                if (n == item.label) {
                    self.result.areaType.select = item.value;
                }
            });
            let obj: any = { ...self.result.allData };
            let params: any = {
                opacity: self.result.opacity,
                name: "data:image/jpg;base64," + obj.img
                //obj['IMG'+self.result.areaType.select]
            };
            self.setJyUrl(params);
        }

        @Watch("result.timeCur")
        changeTimeCur() {
            const self = this;
            if (this.result.timeCur >= this.result.addZone.max) {
                clearInterval(this.result.addZone.interval);
                self.result.addZone.status = false;
            } else {
                this.getSingleItem();
            }
        }

        @Watch("result.deviceTime.default")
        changeDeviceTime(n: any) {
            this.interChange();
            this.result.addZone.status = true;
        }

        @Watch("result.opacity")
        changeOpacity() {
            const self = this;
            let obj: any = { ...self.result.allData };
            let params: any = {
                opacity: self.result.opacity,
                name: "data:image/jpg;base64," + obj.img
            };
            //console.log(params);
            self.setJyUrl(params);
        }

        hideList() {
            this.$emit("closeRight");
        }

        created() {
            this.init();
            this.autoHeightMixin(422);
        }

        beforeDestroy() {
            if (this.result.addZone.interval) {
                clearInterval(this.result.addZone.interval);
            }
            this.setJyUrl(null);
        }

        // 切换等值面数据
        toggleExportStatus(bool: boolean) {
            this.dialog.visible = bool;
        }

        // 确认导出
        handleConfirmExport() {
            const url = `/rest/rainAnalysis/getRainPictures?picUrl=${this.imgSelected}`;
            window.open(url);
            this.toggleExportStatus(false);
        }
    }
</script>

<style lang="scss" scoped>
    .details {
        .searchBar {
            img {
                vertical-align: middle;
            }
            .progress {
                display: inline-block;
                width: 160px;
                border: 1px solid #eee;

                img {
                    height: 15px;
                    cursor: pointer;
                }
            }
        }

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

            //background-color: rgb(1,105,225,.05);
            .el-input__inner {
                margin-top: 10px;
            }
        }

        .control {
            display: inline-block;
            margin: 0 2px;
            width: 60px;
            height: 35px;
            background-color: #e8e8e8;
            border-radius: 2px;
            color: #999999;
            text-align: center;
            line-height: 30px;
            vertical-align: middle;
            cursor: pointer;
        }

        .inAct {
            background-image: linear-gradient(270deg, #1f64ff 0%, #325fd9 100%);
            color: #fff;
        }
    }

    .legend-label {
        position: fixed;
        left: 220px;
        bottom: 0;
        background-color: rgba(255, 255, 255, 0);
        padding: 10px 10px 0;

        p {
            font-weight: normal;
        }

        ul.legend-label-color {
            li {
                display: inline-block;
                width: 58px;
                height: 22px;

                &:not(:last-child) {
                    border-right: 1px solid white;
                }
            }
        }

        ul.legend-label-num {
            position: relative;
            top: -7px;

            li {
                display: inline-block;
                font-size: 12px;

                &:not(:last-child) {
                    width: 58px;
                }
            }
        }
    }

    .same-level {
        position: fixed;
        left: 200px;
        bottom: 70px;
        z-index: 2221112;
        cursor: pointer;

        img {
            margin-left: 16px;
        }

        span {
            position: relative;
            top: -16px;
            font-size: 16px;
            font-weight: 700;
            text-shadow: 0 5px 5px rgba(0, 0, 0, 0.3);
        }

        &-dialog {
            display: flex;
            justify-content: center;
            align-items: center;
            position: fixed;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            color: white;
            background-color: rgba(0, 0, 0, 0.3);
            z-index: 2222;
            font-size: 16px;

            .same-level-content {
                width: 300px;
                height: 160px;
                box-sizing: border-box;
                border-radius: 8px;
                background-color: white;

                header {
                    padding: 10px 16px;
                    background: linear-gradient(270deg, #2674ff, #33b2ff);
                    border-top-left-radius: 8px;
                    border-top-right-radius: 8px;

                    i {
                        position: relative;
                        float: right;
                        top: 3px;
                        cursor: pointer;
                    }
                }

                main {
                    p {
                        text-align: center;
                        color: #666;
                        margin-top: 24px;
                        margin-bottom: 24px;
                        font-weight: normal;
                    }
                }

                footer {
                    display: flex;
                    justify-content: space-evenly;
                    margin-left: 40px;
                    margin-right: 40px;

                    button {
                        font-size: 12px;
                        width: 60px;
                        height: 30px;
                    }
                }
            }
        }
    }

    .none {
        display: none;
    }
</style>
