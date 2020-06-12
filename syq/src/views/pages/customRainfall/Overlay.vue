<template>
    <div class="markerCon" style="position: relative">
        <div class="title" style="margin-bottom: 0">
            <div class="ls" />
            {{ prop.name }}
            <i
                class="iconfont iconxingzhuang"
                @click="emitCloseDialog"
                style="float: right"
            />
            <div style="clear: both"></div>
        </div>
        <CustomButton
            text="表格数据"
            iconName="el-icon-s-release"
            :active="modal.active"
            @click.native="switchActiveButton(true)"
        />
        <CustomButton
            text="雨量过程"
            iconName="el-icon-heavy-rain"
            :active="!modal.active"
            @click.native="switchActiveButton(false)"
        />
        <img
            class="img-button"
            src="../../../assets/button/export.png"
            style="position: absolute; top: 42px; left: 170px;"
            @click="handleExport"
            alt="导出"
            v-show="modal.active"
        />
        <el-table
            v-show="modal.active"
            :data="modal.tableForLeft.tb"
            style="margin-top: 6px"
            height="450"
            border
        >
            <el-table-column fixed prop="time" label="时间" width="150" />
            <el-table-column
                fixed
                prop="面雨量"
                label="面雨量"
                show-overflow-tooltip
            />
            <el-table-column
                v-for="item in modal.tableForLeft.th"
                :key="item"
                :prop="item"
                :label="item"
                show-overflow-tooltip
            />
        </el-table>
        <el-row v-show="!modal.active" style="padding: 0 6px;">
            时间选择：
            <el-select
                v-model="modal.select.selected"
                placeholder="请选择"
                @change="handleSelectChange"
                size="mini"
                style="width: 100px; margin: 6px 0;"
            >
                <el-option
                    v-for="item in modal.select.data"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>
            <el-date-picker
                v-if="modal.select.selected === 'manually'"
                v-model="modal.date.start"
                type="datetime"
                format="yyyy-MM-dd HH-mm"
                style="margin-left: 10px; width: 180px"
                size="mini"
            />
            <el-date-picker
                v-if="modal.select.selected === 'manually'"
                v-model="modal.date.end"
                type="datetime"
                format="yyyy-MM-dd HH-mm"
                style="margin-left: 10px; width: 180px"
                size="mini"
            />
            <div class="content">
                <div class="content-amcharts">
                    <v-chart
                        :options="ylOptions"
                        style="width: 470px; height: 400px"
                    />
                </div>
                <div class="content-select">
                    <el-table
                        ref="tableRef"
                        height="400"
                        border
                        style="width: 100%;"
                        :data="modal.tableForRight.th"
                        @selection-change="handleSelectionChange"
                    >
                        <el-table-column
                            type="selection"
                            width="40"
                            label="选择"
                        />
                        <el-table-column
                            prop="siteName"
                            label="站名"
                            show-overflow-tooltip
                            width="126"
                        />
                    </el-table>
                </div>
            </div>
        </el-row>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch, Ref } from "vue-property-decorator";
    import CustomButton from "./components/CustomButton.vue";
    import moment from "moment";

    const options = [
        {
            value: "1",
            label: "一天"
        },
        {
            value: "2",
            label: "两天"
        },
        {
            value: "3",
            label: "三天"
        },
        {
            value: "5",
            label: "五天"
        },
        {
            value: "7",
            label: "一周"
        },
        {
            value: "14",
            label: "两周"
        },
        {
            value: "manually",
            label: "自定义"
        }
    ];

    @Component({
        components: {
            CustomButton
        }
    })
    export default class CustomRainfallModal extends Vue {
        @Prop() prop!: {
            name: string;
            id: string;
            visible: boolean;
            stations: any;
        };
        @Prop() visible!: boolean;

        @Ref("tableRef") readonly tableRef!: any;

        @Watch("prop.visible")
        handleVisibleChange(): void {
            this.modal.select.selected = "1";
            if (this.prop.visible && this.prop.stations.length) this.getData();
        }

        @Watch("prop.id", { immediate: true })
        handleIDChange() {
            this.modal.select.selected = "1";
            this.getData();
        }

        modal: {
            active: boolean;
            stored: any;
            tableForLeft: {
                th: any;
                tb: any;
            };
            tableForRight: {
                th: any;
                tb: any;
            };
            select: {
                data: any;
                selected: string;
            };
            date: {
                start: string;
                end: string;
            };
        } = {
            active: true,
            stored: {},
            tableForLeft: {
                th: [],
                tb: []
            },
            tableForRight: {
                th: [],
                tb: []
            },
            select: {
                data: options,
                selected: "1"
            },
            date: {
                start: moment()
                    .subtract(1, "day")
                    .format("YYYY-MM-DD HH:mm"),
                end: moment().format("YYYY-MM-DD HH:mm")
            }
        };

        lineArr: any = [];

        get ylOptions() {
            let datas: any[] = [];
            this.lineArr.forEach((item: any, i: number) => {
                datas.push({
                    data: []
                });
                item.list.forEach((sing: any) => {
                    datas[i].data.push([
                        sing.time,
                        sing.drop !== null ? Number(sing.drop) : null
                    ]);
                });
            });
            let dataList: any[] = [];
            let valueList0: any[] = [];
            let valueList1: any[] = [];
            let valueList2: any[] = [];
            let valueList3: any[] = [];
            let valueList4: any[] = [];
            datas.map(function(obj, index) {
                if (index === 0) {
                    dataList = obj.data.map(function(item: any) {
                        return item[0];
                    });
                    valueList0 = obj.data.map(function(item: any) {
                        return item[1];
                    });
                }
                if (index === 1) {
                    valueList1 = obj.data.map(function(item: any) {
                        return item[1];
                    });
                }
                if (index === 2) {
                    valueList2 = obj.data.map(function(item: any) {
                        return item[1];
                    });
                }
                if (index === 3) {
                    valueList3 = obj.data.map(function(item: any) {
                        return item[1];
                    });
                }
                if (index === 4) {
                    valueList4 = obj.data.map(function(item: any) {
                        return item[1];
                    });
                }
            });

            let dataSeries: any[] = [
                valueList0,
                valueList1,
                valueList2,
                valueList3,
                valueList4
            ];

            function createGrid(arr: any[]) {
                if (arr.length == 1) {
                    return [
                        {
                            top: "4%",
                            bottom: "5%"
                        }
                    ];
                } else if (arr.length == 2) {
                    return [
                        {
                            top: "4%",
                            bottom: "52%"
                        },
                        {
                            top: "52%",
                            bottom: "5%"
                        }
                    ];
                } else if (arr.length == 3) {
                    return [
                        {
                            top: "4%",
                            bottom: "70%"
                        },
                        {
                            top: "35%",
                            bottom: "37%"
                        },
                        {
                            top: "67%",
                            bottom: "5%"
                        }
                    ];
                } else if (arr.length == 4) {
                    return [
                        {
                            top: "4%",
                            bottom: "74%"
                        },
                        {
                            top: "28%",
                            bottom: "50%"
                        },
                        {
                            top: "54%",
                            bottom: "27%"
                        },
                        {
                            top: "78%",
                            bottom: "5%"
                        }
                    ];
                } else if (arr.length == 5) {
                    return [
                        {
                            top: "2%",
                            bottom: "84%"
                        },
                        {
                            top: "20%",
                            bottom: "64%"
                        },
                        {
                            top: "40%",
                            bottom: "44%"
                        },
                        {
                            top: "60%",
                            bottom: "24%"
                        },
                        {
                            top: "80%",
                            bottom: "5%"
                        }
                    ];
                }
            }

            function createxAxis(arr: any) {
                let xAxis: any[] = [];
                arr.forEach((item: any, i: number) => {
                    if (i != arr.length - 1) {
                        xAxis.push({
                            data: dataList,
                            gridIndex: i,
                            axisLabel: {
                                show: false
                            },
                            axisTick: {
                                show: false
                            },
                            splitLine: {
                                show: true
                            }
                        });
                    } else {
                        xAxis.push({
                            data: dataList,
                            gridIndex: i,
                            axisLabel: {
                                show: true
                            },
                            splitLine: {
                                show: true
                            },
                            name: "时间"
                        });
                    }
                });
                return xAxis;
            }

            function createyAxis(arr: any) {
                let yAxis: any[] = [];
                arr.forEach((item: any, i: number) => {
                    if (i == 0) {
                        yAxis.push({
                            type: "value",
                            splitLine: {
                                show: true
                            },
                            axisTick: {
                                show: false
                            },
                            gridIndex: i,
                            name: "雨量",
                            max: 50
                        });
                    } else {
                        yAxis.push({
                            type: "value",
                            splitLine: {
                                show: true
                            },
                            axisTick: {
                                show: false
                            },
                            gridIndex: i,
                            max: 50
                        });
                    }
                });
                return yAxis;
            }

            function createSeries(arr: any[]) {
                let seriesArr: any[] = [];
                let list: any = arr.reverse();
                list.forEach((item: any, i: number) => {
                    seriesArr.push({
                        type: "bar",
                        name: item.label,
                        data: dataSeries[i], //y轴类目数据
                        xAxisIndex: i, //使用x轴的索引
                        yAxisIndex: i //使用y轴的索引
                    });
                });
                return seriesArr;
            }

            return {
                color: ["#33b2ff"],
                axisPointer: {
                    link: [
                        {
                            xAxisIndex: "all"
                        }
                    ]
                },
                tooltip: {
                    trigger: "axis",
                    formatter: function(params: any) {
                        let dataArr: any[] = [];
                        let newDataArr: any[] = [];
                        let formatterStr = "";
                        params.map(function(item: any) {
                            dataArr[item.seriesIndex] = item;
                        });
                        //console.log(dataArr);
                        dataArr.map(function(item: any) {
                            newDataArr.push({
                                seriesName: item.seriesName,
                                name: item.name,
                                value: item.value
                            });
                        });
                        // console.log(newDataArr)
                        newDataArr.map(function(item: any) {
                            formatterStr +=
                                item.seriesName +
                                ":(" +
                                item.name +
                                "," +
                                item.value +
                                ")<br />";
                        });
                        return formatterStr;
                    }
                },
                xAxis: createxAxis(this.lineArr),
                yAxis: createyAxis(this.lineArr),
                //配置grid组件在视图中位置, 每个占据整个canvas的10%
                grid: createGrid(this.lineArr),
                series: createSeries(this.lineArr)
            };
        }

        // 默认选中第一个
        handleFirstDefault(): void {
            // this.$nextTick(() => {
            //     this.$refs.tableRef.toggleRowSelection(
            //         this.modal.tableForRight.th[0],
            //         true
            //     );
            // });
        }

        // 获取数据
        getData(): void {
            const params = { dt: 60, day: 1 };
            this.handleGetData(params);
        }

        // 时间更改
        handleSelectChange(): void {
            // 参数不同
            let params: any = {};

            if (this.modal.select.selected !== "manually") {
                params = { dt: 60, day: this.modal.select.selected };
            } else {
                this.modal.date = {
                    start: moment()
                        .subtract(1, "day")
                        .format("YYYY-MM-DD HH:mm"),
                    end: moment().format("YYYY-MM-DD HH:mm")
                };

                params = {
                    dt: 60,
                    st: this.modal.date.start,
                    et: this.modal.date.end
                };
            }
            let stations: any = [];
            this.prop.stations.forEach((item: any) => {
                stations.push({
                    name: item.stationName,
                    id: item.stationId
                });
            });

            this.$http
                .post("/rest/areaRain/getAreaRainDataList", stations, {
                    params
                })
                .then(({ data }) => {
                    this.modal.stored = data;
                    const len = data[this.modal.tableForLeft.th[0]].length;
                    this.modal.tableForLeft.th = Object.keys(data);
                    for (let i = 0; i < len; i++) {
                        const obj: any = {};
                        this.modal.tableForLeft.th.forEach((item: string) => {
                            obj[item] = Number(data[item][i].drop).toFixed(1);
                            if (!obj.time) {
                                obj.time = data[item][i].time;
                            }
                        });
                        for (let key in obj) {
                            if (key === "面雨量" && Number(obj[key]) === 0)
                                obj[key] = 0;
                            else {
                                if (Number(obj[key]) === 0) obj[key] = 0;
                            }
                        }
                        this.modal.tableForLeft.tb.push(obj);
                    }
                    const index = this.modal.tableForLeft.th.indexOf("面雨量");
                    this.modal.tableForLeft.th.splice(index, 1);
                    this.lineArr.forEach((item: any) => {
                        item.list = data[item.label];
                    });
                });
            //this.handleGetData(params);
        }

        // 获取数据的公用方法
        handleGetData(params: any): void {
            this.modal.tableForLeft.tb = [];
            let stations: any = [];
            this.prop.stations.forEach((item: any) => {
                stations.push({
                    name: item.stationName,
                    id: item.stationId
                });
            });

            this.$http
                .post("/rest/areaRain/getAreaRainDataList", stations, {
                    params
                })
                .then(({ data }) => {
                    this.dealData(data);
                    this.dealChartData();
                });
        }

        //处理表格数据
        dealData(data: any) {
            this.modal.stored = data;
            this.modal.tableForLeft.th = Object.keys(data);
            this.modal.tableForLeft.th.forEach((item: any) => {
                this.modal.tableForRight.th.push({
                    siteName: item
                });
            });

            const len = data[this.modal.tableForLeft.th[0]].length;

            for (let i = 0; i < len; i++) {
                const obj: any = {};
                this.modal.tableForLeft.th.forEach((item: string) => {
                    obj[item] = Number(data[item][i].drop).toFixed(1);
                    if (!obj.time) {
                        obj.time = data[item][i].time;
                    }
                });
                for (let key in obj) {
                    if (key === "面雨量" && Number(obj[key]) === 0)
                        obj[key] = 0;
                    else {
                        if (Number(obj[key]) === 0) obj[key] = 0;
                    }
                }
                this.modal.tableForLeft.tb.push(obj);
            }
            if (this.modal.tableForLeft.th.length < 20) {
                const index = this.modal.tableForLeft.th.indexOf("面雨量");
                this.modal.tableForLeft.th.splice(index, 1);
            } else {
                this.modal.tableForLeft.th = [];
            }
            this.handleFirstDefault();
        }

        //处理图表数据
        dealChartData() {
            this.modal.tableForRight.th = [];
            this.modal.tableForLeft.th.forEach((item: any) => {
                this.modal.tableForRight.th.push({
                    siteName: item
                });
            });

            this.modal.tableForRight.th = this.modal.tableForRight.th.filter(
                (item: any) => {
                    return item.siteName != "面雨量";
                }
            );
            this.modal.tableForRight.th.unshift({
                siteName: "面雨量"
            });
            setTimeout(() => {
                (this.$refs.tableRef as any).toggleRowSelection(
                    this.modal.tableForRight.th[0]
                );
            });
        }
        // 切换多选框
        handleSelectionChange(val: any): void {
            if (val.length > 5) {
                this.$message("最多只能选择五个测站！");
                val.pop();
            } else {
                this.lineArr = [];
                val.forEach((item: any) => {
                    this.lineArr.push({
                        label: item.siteName,
                        list: this.modal.stored[item.siteName]
                    });
                });
            }
        }

        handleClose(): void {
            this.modal = {
                active: true,
                stored: {},
                tableForLeft: {
                    th: [],

                    tb: []
                },
                tableForRight: {
                    th: [],
                    tb: []
                },
                select: {
                    data: options,
                    selected: "一天"
                },
                date: {
                    start: moment()
                        .subtract(1, "day")
                        .format("YYYY-MM-DD HH:mm"),
                    end: moment().format("YYYY-MM-DD HH:mm")
                }
            };
            this.$emit("closeModal");
        }

        // 切换表格数据和雨量过程
        switchActiveButton(bool: boolean): void {
            this.modal.active = bool;
            if (!bool) {
                // window.console.log(this.$refs);
                // (this.$refs.table as any).toggleRowSelection(this.modal.tableForRight.th[0])
            }
        }

        handleClick(): void {}

        handleExport() {
            const table = this.modal.tableForLeft.tb;
            let params: any;

            const dt =
                Number(table[1].time.slice(11, 13)) -
                Number(table[0].time.slice(11, 13));

            if (this.modal.select.selected !== "manually") {
                params = {
                    dt: dt * 60,
                    day: this.modal.select.selected,
                    id: this.prop.id,
                    areaName: this.prop.name
                };
            } else {
                params = {
                    dt: dt * 60,
                    id: this.prop.id,
                    areaName: this.prop.name,
                    st: moment(table[0].time).format("YYYY-MM-DD HH:mm:ss"),
                    et: moment(table[table.length - 1].time).format(
                        "YYYY-MM-DD HH:mm:ss"
                    )
                };
            }

            const url = this.$utils.formatURL(
                "/rest/areaRain/leadoutAreaRainDataList",
                params
            );
            window.open(url);
        }

        emitCloseDialog() {
            this.$emit("update:visible", false);
        }
    }
</script>

<style lang="scss" scoped>
    .content {
        display: flex;
        justify-content: space-between;

        &-amcharts {
            width: 100%;
            height: 400px;
        }

        &-select {
            width: 220px;
        }
    }

    .el-dialog {
        width: 500px !important;
    }
</style>
