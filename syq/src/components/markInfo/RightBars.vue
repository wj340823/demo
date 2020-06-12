<template>
    <div class="menuList">
        <h3 v-if="content.type != '站点简介'">{{ content.type }}</h3>
        <div class="close" @click="closeCon">
            <i class="iconfont iconxingzhuang"></i>
        </div>
        <h3 v-if="content.type == '站点简介'">{{ content.info.zm }}简介</h3>
        <div class="video" v-if="content.type == '视频点位' && !nodata">
            <!--<video src="/video/b.mp4" width="100%" controls="controls"></video>
            <video src="/video/a.mp4" width="100%" controls="controls" style="margin-top: 10px"></video>-->
            <iframe
                src="/CGPlayerWinTestL.htm"
                frameborder="0"
                style="width: 100%;height: 250px"
            ></iframe>
            <span
                >(请选择摄像头点击按钮，双击视频可全屏,请选择360浏览器兼容模式打开)</span
            >
        </div>
        <div v-if="content.type == '站点简介' && !nodata" class="zdjj">
            <div class="sub">
                <span>历史最高水位为33.49米，出现时间为 1955年6月21日。</span>
            </div>
            <p>
                兰溪水文站位于钱塘江中游，是国家重要水文站，地处浙江中西部金衢盆地的汇流集合段，集水面积18233平方公里，其中金华江流域占1/3，衢江流域占2/3的集水面积。始建于1930年3月，测验项目有降水量、水位、流量、含沙量、水温、水质等，承担水文情报预报任务，技术装备一流，具有五十年一遇洪水测报能力，是钱塘江流域防汛防旱控制站和依据站。测验断面宽450米，河道枯期水深5.
                5米左右，下游70公里建有富春江水力发电站拦江大坝一座，本站地处其库尾，也是其入库站。
            </p>
        </div>

        <div class="all_pic" v-if="content.type == '全景图' && !nodata">
            <iframe
                src="/all_pic.html"
                frameborder="0"
                style="width: 100%;height: 250px"
            ></iframe>
            <span>(双击查看大图,鼠标上下滚动可放大缩小)</span>
        </div>

        <div class="dmChart" v-if="content.type == '断面'">
            <section-hd
                :data="dmData"
                style="width: 100%;height: 100%"
            ></section-hd>
        </div>

        <div
            class="dmChart"
            v-if="
                (content.type == '水位流量关系' ||
                    content.type == '水位库容关系') &&
                    !swllNodata
            "
        >
            <div class="dmTitle" v-if="content.type == '水位流量关系'">
                {{
                    content.info.zm + "(" + content.info.zh + ")"
                }}水位流量关系曲线
            </div>
            <div class="dmTitle" v-if="content.type == '水位库容关系'">
                {{
                    content.info.zm + "(" + content.info.zh + ")"
                }}水位库容关系曲线
            </div>
            <div style="margin-bottom: 5px;">
                <span>曲线选择：</span>
                <el-select
                    v-model="swllSearch.select"
                    placeholder="请选择"
                    style="width: 180px"
                    @change="swllDataSearch"
                >
                    <el-option
                        v-for="item in swllSearch.list"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
                <span
                    v-show="swllSearch.list.length > 1 && content.open"
                    style="margin-left: 20px"
                    >对比曲线：</span
                >
                <el-select
                    v-model="swllSearch.compare"
                    placeholder="请选择"
                    style="width: 180px"
                    v-show="swllSearch.list.length > 1 && content.open"
                    @change="swllDataSearch"
                >
                    <el-option
                        v-for="item in swllSearch.list"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
            </div>
            <div>
                <v-chart
                    :options="swllOptions"
                    ref="swllChart"
                    style="height: 330px;font-size: 12px;float:left;"
                    :style="{ width: swllSearch.width + 'px' }"
                    :key="current"
                ></v-chart>
                <div style="float: left" class="swllTb" v-show="content.open">
                    <el-table
                        :data="swllSearch.tbdata"
                        height="330"
                        border
                        stripe
                    >
                        <el-table-column
                            label="序"
                            type="index"
                        ></el-table-column>
                        <el-table-column
                            label="水位"
                            prop="z"
                        ></el-table-column>
                        <el-table-column
                            v-if="content.type == '水位流量关系'"
                            label="流量"
                            prop="q"
                        ></el-table-column>
                        <el-table-column
                            v-if="content.type == '水位库容关系'"
                            label="库容"
                            prop="q"
                        ></el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
        <!--<div v-if="nodata&&swllNodata" class="nodata">
            <img src="@/assets/bulding.png" alt="">
            <span>建设中...</span>
        </div>-->
        <!--<nodata v-if="nodata&&!((content.type=='水位流量关系'||content.type=='水位库容关系')&&!swllNodata)"></nodata>-->
    </div>
</template>

<script lang="ts">
    const dmData = [
        [0.99, 34.135],
        [1, 23.665],
        [6, 23.215],
        [6.4, 23.135],
        [10, 22.305],
        [20, 21.505],
        [30, 18.735],
        [40, 18.245],
        [50, 17.685],
        [60, 17.675],
        [70, 17.905],
        [80, 17.485],
        [90, 17.535],
        [100, 17.635],
        [110, 17.615],
        [120, 17.515],
        [130, 18.195],
        [140, 18.105],
        [150, 18.225],
        [160, 18.795],
        [170, 19.375],
        [180, 19.675],
        [190, 19.755],
        [200, 19.265],
        [210, 19.215],
        [220, 19.345],
        [230, 19.355],
        [240, 19.075],
        [250, 18.925],
        [260, 18.935],
        [270, 18.765],
        [280, 19.265],
        [290, 20.145],
        [300, 20.725],
        [310, 19.955],
        [320, 19.225],
        [330, 19.205],
        [340, 19.305],
        [350, 19.315],
        [360, 19.515],
        [370, 20.115],
        [380, 21.845],
        [383, 23.035],
        [386, 23.575],
        [389, 24.435],
        [394, 24.825],
        [400, 25.215],
        [410, 25.855],
        [420, 26.525],
        [430, 26.795],
        [440, 27.585],
        [446, 27.815],
        [447.7, 29.125],
        [447.71, 29.825],
        [453.2, 29.825],
        [453.21, 30.745],
        [458.2, 30.745],
        [458.21, 35.045],
        [462.7, 35.045],
        [462.71, 30.745],
        [470, 30.745]
    ];
    import { Vue, Component, Prop, Watch } from "vue-property-decorator"; //253,176,108
    import building from "./components/building.vue";
    import nodata from "./components/nodata.vue";
    import sectionHd from "./components/section.vue";

    const swllOption = {
        color: ["red", "blue"],
        xAxis: [
            {
                name: "流量(m³/s)",
                splitLine: {
                    show: false
                },
                nameTextStyle: {
                    lineHeight: 30
                },
                nameLocation: "middle"
            }
        ],
        tooltip: {
            trigger: "axis",
            formatter: function(f: any) {
                return (
                    "水位:" +
                    f[0].value[0].toFixed(2) +
                    "<br>" +
                    "流量:" +
                    f[0].value[1].toFixed(1)
                );
            }
        },
        grid: {
            left: "8%",
            right: "5%",
            bottom: "12%",
            top: "10%"
        },
        yAxis: [
            {
                name: "水位(m)",
                nameLocation: "end",
                splitLine: {
                    show: true
                }
            }
        ],
        series: [
            {
                symbolSize: 4,
                data: [],
                type: "scatter"
            },
            {
                symbolSize: 4,
                data: [],
                type: "line"
            }
        ]
    };
    @Component({
        components: { building, nodata, sectionHd }
    })
    export default class RightBars extends Vue {
        @Prop() content: any;
        nodata: boolean = false;
        swllNodata: boolean = false;
        dmOptions: any = {};
        swllOptions: any = JSON.parse(JSON.stringify(swllOption));
        swllSearch: any = {
            select: "",
            compare: "",
            list: [],
            width: 320,
            thdata: [],
            tbdata: []
        };
        current: any = Date.now();
        dmData: any = {
            zh: "",
            select: "",
            list: [],
            data: [],
            xxsw: null,
            zcsw: null,
            bzsw: null,
            jjsw: null,
            lastsw: null,
            open: false
        };

        filterData(arr: any) {
            let targetArr: any[] = [];
            arr.forEach(function(item: any, index: number) {
                if (index % 4 == 0) {
                    targetArr.push(item);
                }
            });
            return targetArr;
        }

        initVideo() {
            //初始化视频方法
            let myVideo = this.$refs.myVideo;
        }

        closeCon() {
            this.$emit("closeContent");
        }

        init() {
            let vm = this;
            let params: any = {
                stcd: vm.content.info.zh,
                zl: vm.content.info.zl
            };
            this.swllSearch.list = [];
            this.$http
                .get("/rest/stationDetails/getWaterAndFlowCurve", {
                    params: params
                })
                .then((res: any) => {
                    if (res.data.length) {
                        this.swllSearch.select = res.data[0];
                        //res.data[0]
                        //this.swllNodata
                        res.data.forEach((item: any) => {
                            vm.swllSearch.list.push({
                                label: item,
                                value: item
                            });
                        });
                        this.swllDataSearch();
                    } else {
                        this.swllNodata = true;
                    }
                });
        }

        sectionInit() {
            let vm = this;
            vm.dmData.list = [];
            vm.dmData.data = [];
            vm.dmData.zh = vm.content.info.zh;
            vm.dmData.xxsw = vm.content.info.xxsw;
            vm.dmData.zcsw = vm.content.info.zcsw;
            vm.dmData.jjsw = vm.content.info.jjsw;
            vm.dmData.bzsw = vm.content.info.bzsw;
            vm.dmData.lastsw = vm.content.lastsw;
            this.$http
                .get(
                    "/rest/stationDetails/getCurveofSectionListbyStcd?stcd=" +
                        vm.content.info.zh
                )
                .then((res: any) => {
                    res.data.forEach((item: any) => {
                        vm.dmData.list.push({
                            label: item.time
                        });
                    });
                    if (res.data.length) {
                        vm.dmData.select = res.data[0].time;
                        let params: any = {
                            stcd: vm.content.info.zh,
                            time: res.data[0].time
                        };
                        vm.$http
                            .get("/rest/stationDetails/getCurveofSection", {
                                params: params
                            })
                            .then((data: any) => {
                                vm.dmData.data = data.data;
                            });
                    }
                });
        }

        swllDataSearch() {
            let vm = this;
            let getParams: any = {
                stcd: vm.content.info.zh,
                zl: vm.content.info.zl,
                xq: vm.swllSearch.select,
                dq: vm.swllSearch.compare
            };
            vm.$http
                .get("rest/stationDetails/getWaterAndFlowRelation", {
                    params: getParams
                })
                .then((data: any) => {
                    vm.swllOptions = JSON.parse(JSON.stringify(swllOption));
                    if (vm.content.type == "水位流量关系") {
                        vm.swllOptions.xAxis[0].name = "流量(m³/s)";
                    } else {
                        vm.swllOptions.xAxis[0].name = "库容(10^6m³)";
                    }
                    if (data.data.length) {
                        this.swllNodata = false;
                        vm.swllOptions.series[0].data = [];
                        let minSw: any = null,
                            minLL: any = null;
                        vm.swllSearch.tbdata = [];
                        data.data.forEach((sing: any, i: number) => {
                            sing.data.forEach((item: any) => {
                                if (item.z && !minSw) {
                                    minSw = item.z;
                                }
                                if (item.q && !minLL) {
                                    minLL = item.q;
                                }
                                minSw - item.z > 0 ? (minSw = item.z) : "";
                                minLL - item.q > 0 ? (minSw = item.q) : "";
                                vm.swllOptions.series[i].data.push([
                                    item.q,
                                    item.z
                                ]);
                                if (i == 0) {
                                    vm.swllSearch.tbdata.push({
                                        q: item.q,
                                        z: item.z
                                    });
                                }
                            });
                        });
                        vm.swllOptions.xAxis[0].min = minLL;
                        vm.swllOptions.yAxis[0].min = minSw;
                        vm.current = Date.now();
                    }
                });
        }

        @Watch("content.type")
        changeType(n: any) {
            this.swllNodata = true;
            if (
                this.content.type == "水位流量关系" ||
                this.content.type == "水位库容关系"
            ) {
                this.init();
            } else if (
                this.content.type == "断面" &&
                (this.content.info.zl == "ZQ" || this.content.info.zl == "QZ")
            ) {
                this.sectionInit();
            }
        }

        @Watch("content.open")
        rightDisplay(n: boolean) {
            this.dmData.open = n;
            const chart: any = this.$refs.swllChart;
            if (n) {
                this.swllSearch.width = 700;
            } else {
                this.swllSearch.width = 320;
            }
            chart.resize({ width: this.swllSearch.width });
        }

        created() {
            if (this.content.info.zm == "兰溪") {
                this.nodata = false;
            } else {
                this.nodata = true;
            }
            let arr1: any[] = [],
                arr2: any[] = [],
                arr3: any[] = [];
            this.sectionInit();
        }

        mounted() {
            this.initVideo();
            this.init();
        }
    }
</script>

<style scoped lang="scss">
    .menuList {
        padding: 5px;
        position: relative;
        overflow: auto;

        h3 {
            margin-bottom: 16px;
        }

        .video {
            width: 100%;
        }

        .close {
            position: absolute;
            right: 10px;
            top: 10px;

            i {
                font-size: 12px;
            }
        }

        .all_pic {
            span {
                margin-top: 5px;
                color: #999;
            }
        }

        .dmChart {
            width: 100%;
            height: 250px;

            .dmTitle {
                font-size: 14px;
                color: #333;
                font-weight: bold;
                line-height: 40px;
                text-align: center;
                margin-top: -25px;
            }
        }

        .zdjj {
            .sub {
                color: #999999;
            }

            p {
                color: #333;
                text-indent: 28px;
                line-height: 26px;
                width: 100%;
                height: 280px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }

        .nodata {
            height: 280px;
            text-align: center;
            top: calc(50% - 50px);

            img {
                display: block;
                margin-bottom: 10px;
            }
        }

        .swllTb {
            width: calc(100% - 700px);
        }
    }
</style>
