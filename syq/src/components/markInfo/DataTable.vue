<template>
    <div class="component">
        <header>
            <p>
                {{ modal.title }}({{ dataDialog.info.zh }})——({{
                    dataDialog.zl
                }})
            </p>
            <i class="el-icon-close" @click="handleClose" />
        </header>
        <a
            class="print"
            target="_blank"
            :href="modal.sssj.downloadUrl"
            v-if="dataDialog.type === 'detail'"
        >
            <img src="@/assets/excel.png" alt="导出excel" />
        </a>
        <el-checkbox-group
            v-if="dataDialog.type === 'detail'"
            v-model="modal.sssj.selected"
            style="margin-top: 0"
        >
            <el-checkbox
                :label="item.name"
                :key="index"
                v-for="(item, index) in modal.sssj.thdata"
            />
        </el-checkbox-group>
        <div>
            <p
                v-if="dataDialog.type === 'statistic'"
                style="text-align: center; margin-top: 12px; margin-bottom: 8px; font-weight: normal"
            >
                <span
                    style="font-weight: 700; font-size: 20px; margin-right: 6px"
                    >水位频率分析成果表</span
                >
                最高水位值：<span style="color: #33b0ff">{{
                    this.dataDialog.jz.maxsw
                        ? this.dataDialog.jz.maxsw +
                          "m（" +
                          this.dataDialog.jz.time1 +
                          "）"
                        : "-"
                }}</span>
            </p>
            <el-table
                :data="statistic.waterLevel.data"
                style="width: 782px; margin: 0 20px;"
                max-height="200"
                v-if="dataDialog.type === 'statistic'"
                border
            >
                <el-table-column prop="watershed" label="流域" width="90" />
                <el-table-column prop="siteName" label="站名" width="90" />
                <el-table-column prop="type" label="数据类型" width="90" />
                <el-table-column
                    prop="zip"
                    label="各频率水位（单位：m）（85基准）"
                >
                    <el-table-column prop="one" label="1%" />
                    <el-table-column prop="two" label="2%" />
                    <el-table-column prop="five" label="5%" />
                    <el-table-column prop="ten" label="10%" />
                    <el-table-column prop="twenty" label="20%" />
                    <el-table-column prop="fifty" label="50%" />
                </el-table-column>
            </el-table>
            <p
                v-if="dataDialog.type === 'statistic'"
                style="text-align: center; margin-bottom: 8px; margin-top: 20px; font-weight: normal"
            >
                <span
                    style="font-weight: 700; font-size: 20px; margin-right: 6px;"
                    >流量频率分析成果表</span
                >
                最大流量值：<span style="color: #33b0ff;">{{
                    this.dataDialog.jz.maxll
                        ? this.dataDialog.jz.maxll +
                          "m³/s（" +
                          this.dataDialog.jz.time2 +
                          "）"
                        : "-"
                }}</span>
            </p>
            <el-table
                border
                :data="statistic.flow.data"
                style="width: 780px; margin: 0 20px 20px;"
                max-height="200"
                v-if="dataDialog.type === 'statistic'"
            >
                <el-table-column prop="watershed" label="流域" width="90" />
                <el-table-column prop="siteName" label="站名" width="90" />
                <el-table-column prop="type" label="数据类型" width="90" />
                <el-table-column prop="zip" label="各频率流量（单位：m³/s）">
                    <el-table-column prop="one" label="1%" />
                    <el-table-column prop="two" label="2%" />
                    <el-table-column prop="five" label="5%" />
                    <el-table-column prop="ten" label="10%" />
                    <el-table-column prop="twenty" label="20%" />
                    <el-table-column prop="fifty" label="50%" />
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script lang="ts">
    import "@/styles/mapView/right.scss";
    import {
        Vue,
        Component,
        Prop,
        Watch,
        Inject
    } from "vue-property-decorator";

    interface StatisticConfig {
        [propName: string]: {
            data: Array<any>;
            max: {
                data: any;
                num: number;
            };
        };
    }

    const SWTHEAD = [
        {
            label: "时间",
            value: "time",
            name: "时间"
        },
        {
            label: "雨量(mm)",
            value: "yl",
            name: "雨量"
        },
        {
            label: "水位(m)",
            value: "sw",
            name: "水位"
        }
    ];
    const YLHEAD = [
        {
            label: "时间",
            value: "time",
            name: "时间"
        },
        {
            label: "雨量(mm)",
            value: "yl",
            name: "雨量"
        }
    ];
    const HDTITLE = [
        {
            label: "警戒(m)",
            value: "jjsw",
            name: "警戒"
        },
        {
            label: "保证(m)",
            value: "bzsw",
            name: "保证"
        }
    ];
    const SKTITLE = [
        {
            label: "汛限(m)",
            value: "xx",
            name: "汛限"
        },
        {
            label: "正常(m)",
            value: "zcsw",
            name: "正常"
        }
    ];
    const SKHEAD = [
        {
            label: "库容(10^6m³)",
            value: "con",
            name: "库容"
        },
        {
            label: "出流(m³/s)",
            value: "rkll",
            name: "出库流量"
        },
        {
            label: "入流(m³/s)",
            value: "ckll",
            name: "入库流量"
        }
    ];

    @Component
    export default class DataTable extends Vue {
        @Prop() dataDialog: any;
        modal: any = {
            title: "",
            sssj: {
                show: false,
                tbData: [],
                thdata: [],
                selected: [],
                printData: [],
                downloadUrl: "/rest/water/leadOutHistoryData?",
                njzTitle: [
                    {
                        label: "年份",
                        value: "year"
                    },
                    {
                        label: "水位时间",
                        value: "time1"
                    },
                    {
                        label: "最高水位(m)",
                        value: "sw"
                    },
                    {
                        label: "最大流量(m)",
                        value: "ll"
                    },
                    {
                        label: "流量时间",
                        value: "time2"
                    }
                ],
                pltjTitle: [
                    {
                        label: "流域",
                        value: "flow"
                    },
                    {
                        label: "站名",
                        value: "siteName"
                    },
                    {
                        label: "数据类型",
                        value: "type"
                    },
                    {
                        label: "1%",
                        value: "one"
                    },
                    {
                        label: "2%",
                        value: "two"
                    },
                    {
                        label: "5%",
                        value: "five"
                    },
                    {
                        label: "10%",
                        value: "ten"
                    },
                    {
                        label: "20%",
                        value: "twenty"
                    },
                    {
                        label: "50%",
                        value: "fifty"
                    }
                ]
            }
        };

        @Watch("modal.sssj.show")
        changeDialogShow(n: boolean) {
            if (n) {
                this.modal.sssj.tbData = [];
                this.modal.sssj.show = true;

                if (this.dataDialog.type === "radar") {
                    this.handleRadarData();
                } else if (this.dataDialog.type === "statistic") {
                    this.handleStatisticData();
                } else {
                    this.initData();
                }
            }
        }

        statistic: StatisticConfig = {
            waterLevel: {
                data: [],
                max: {
                    data: {},
                    num: 0
                }
            },
            flow: {
                data: [],
                max: {
                    data: {},
                    num: 0
                }
            }
        };

        handleClose() {
            this.$emit("update:visible", false);
            this.modal.sssj.show = false;
        }

        // 年极值
        handleRadarData(): void {
            this.modal.sssj.thdata = this.modal.sssj.njzTitle;
            this.handleSelectedLabel(this.modal.sssj.thdata);
            this.getRadarData();
        }

        // 年极值数据获取
        getRadarData(): void {
            this.$http
                .get(
                    "/rest/rainAnalysis/getStatisticsList?zh=" +
                        this.dataDialog.info.zh
                )
                .then(({ data }) => {
                    if (data.length) {
                        data.forEach((item: any) => {
                            this.modal.sssj.tbData.push({
                                ll: item.MXQ,
                                sw: item.HTZ,
                                time1: item.HTZTM,
                                time2: item.MXQTM,
                                year: item.YR
                            });
                        });
                    }
                });
        }

        // 频率统计
        handleStatisticData(): void {
            this.modal.sssj.thdata = this.modal.sssj.pltjTitle;
            this.handleSelectedLabel(this.modal.sssj.thdata);
            this.getStatisticData();
        }

        // 频率统计数据获取
        getStatisticData(): void {
            this.statistic.flow.data = [];
            this.statistic.waterLevel.data = [];

            this.$http
                .get(
                    "/rest/rainAnalysis/getFrequencyList?zh=" +
                        this.dataDialog.info.zh
                )
                .then(({ data }) => {
                    const { ly, zm } = this.dataDialog.info;
                    if (data.length) {
                        data.forEach((item: any) => {
                            const obj = {
                                watershed: ly,
                                siteName: zm,
                                type: item.DTTYPE,
                                one: item.FQ1,
                                two: item.FQ2,
                                five: item.FQ5,
                                ten: item.FQ10,
                                twenty: item.FQ20,
                                fifty: item.FQ50,
                                time: item.MODITIME
                            };

                            if (item.RFITEM === "Z") {
                                // 水位
                                this.statistic.waterLevel.data.push(obj);
                                this.handleMax("Z", obj);
                            } else if (item.RFITEM === "Q") {
                                // 流量
                                this.statistic.flow.data.push(obj);
                                this.handleMax("Q", obj);
                            }
                        });
                    }
                });
        }

        // 计算最大值
        handleMax(type: string, obj: any): void {
            const arr: any = Object.values(obj).filter(
                (item: any) => typeof item === "number"
            );

            let maxNum: number;
            if (arr.length) maxNum = Math.max(...arr);
            else maxNum = 0;

            obj.time = this.$utils.dateFormat(
                new Date(obj.time),
                "YYYY-MM-dd HH:mm:ss"
            );

            if (type === "Q") {
                if (maxNum > this.statistic.flow.max.num) {
                    this.statistic.flow.max.data = obj;
                    this.statistic.flow.max.num = maxNum;
                }
            } else if (type === "Z") {
                if (maxNum > this.statistic.waterLevel.max.num) {
                    this.statistic.waterLevel.max.data = obj;
                    this.statistic.waterLevel.max.num = maxNum;
                }
            }
        }

        // selected 数据处理
        handleSelectedLabel(arr: Array<any>): void {
            this.modal.sssj.selected = [];
            arr.forEach((item: any) =>
                this.modal.sssj.selected.push(item.label)
            );
        }

        initData() {
            let vm = this;
            this.modal.sssj.show = this.dataDialog.show;
            this.modal.title = this.dataDialog.info.zm;
            this.modal.sssj.thdata = [];
            if (this.dataDialog.zl == "雨量") {
                this.modal.sssj.thdata = YLHEAD;
            } else if (this.dataDialog.zl.match("水库")) {
                this.modal.sssj.thdata = JSON.parse(
                    JSON.stringify(SWTHEAD.concat(SKHEAD))
                );
                this.dataDialog.info.xxsw != null
                    ? (this.modal.sssj.thdata = this.modal.sssj.thdata.concat(
                          SKTITLE[0]
                      ))
                    : "";
                this.dataDialog.info.zcsw != null
                    ? (this.modal.sssj.thdata = this.modal.sssj.thdata.concat(
                          SKTITLE[1]
                      ))
                    : "";
            } else {
                this.modal.sssj.thdata = JSON.parse(JSON.stringify(SWTHEAD));
                this.dataDialog.info.jjsw != null
                    ? (this.modal.sssj.thdata = this.modal.sssj.thdata.concat(
                          HDTITLE[0]
                      ))
                    : "";
                this.dataDialog.info.bzsw != null
                    ? (this.modal.sssj.thdata = this.modal.sssj.thdata.concat(
                          HDTITLE[1]
                      ))
                    : "";
            }
            vm.modal.sssj.tbData = [];
            let arr = JSON.parse(JSON.stringify(this.dataDialog.data));
            let judgeYl = false;
            let len: number = this.dataDialog.data.length;
            arr.reverse().forEach(function(item: any, index: number) {
                //let yl:any = item.data?'-':item.data
                item.data !== null ? (judgeYl = true) : "";
                vm.modal.sssj.tbData.push({
                    time: vm.$utils.dateFormat(
                        new Date(item.tm),
                        "MM-dd HH:mm"
                    ),
                    no: item.zh || "-",
                    yl: item.data === null ? "-" : item.data,
                    sw: item.RZ || "-",
                    xx: vm.dataDialog.info.xxsw || "-",
                    con: item.kr || "-",
                    zcsw: vm.dataDialog.info.zcsw || "-",
                    jjsw: vm.dataDialog.info.jjsw || "-",
                    bzsw: vm.dataDialog.info.bzsw || "-",
                    rkll: item.rkll || "-",
                    ckll: item.ckll || "-",
                    zs: item.zs || "-"
                });

                // if (
                //     index != vm.dataDialog.data.length - 1 &&
                //     vm.dataDialog.data[len - 2 - index].RZ &&
                //     item.RZ
                // ) {
                //     vm.modal.sssj.tbData[index].zs =
                //         vm.dataDialog.data[len - 2 - index].RZ - item.RZ == 0
                //             ? ""
                //             : vm.dataDialog.data[len - 2 - index].RZ - item.RZ >
                //               0
                //             ? false
                //             : true;
                // }
            });
            if (!judgeYl) {
                this.modal.sssj.thdata = this.modal.sssj.thdata.filter(function(
                    item: any
                ) {
                    return item.value != "yl";
                });
            }
            vm.modal.sssj.selected = [];
            let printArr: any[] = [];
            this.modal.sssj.thdata.forEach(function(data: any, i: number) {
                vm.modal.sssj.selected.push(data.name);
                printArr.push(data.name);
            });
            this.modal.sssj.downloadUrl =
                "./rest/water/leadOutHistoryData?zm=" +
                this.dataDialog.info.zm +
                "&zh=" +
                this.dataDialog.info.zh +
                "&lx=" +
                arr[0].lx +
                "&st=" +
                arr[0].st +
                "&et=" +
                arr[0].et +
                "&jg=" +
                arr[0].jg +
                "&data=" +
                this.modal.sssj.selected.join(",");
        }

        created() {
            this.initData();
        }
    }
</script>

<style scoped lang="scss">
    .component {
        position: absolute;
        top: 50px;
        left: 100px;
        background-color: white;
        box-shadow: 0 0 12px rgba(0, 0, 0, 0.3);
        z-index: 111;

        header {
            display: flex;
            justify-content: space-between;
            padding: 0 16px 0 30px;
            line-height: 40px;
            color: white;
            background-image: linear-gradient(270deg, #1f64ff 0%, #325fd9 100%);

            i {
                line-height: 40px;
                font-size: 20px;
                cursor: pointer;
            }
        }

        .colorRed {
            color: red;
        }
        .colorGreen {
            color: green;
        }
        .print {
            position: absolute;
            right: 20px;
            width: 20px;
            z-index: 91;
            top: 56px;
        }

        .el-table {
            margin-top: 6px;
        }

        .el-dialog__body {
            padding-top: 20px !important;
        }
    }
</style>
