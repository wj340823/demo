<template>
    <vue-perfect-scrollbar class="details">
        <!-- 台风信息 -->
        <p class="details-title">台风信息</p>
        <el-row class="details-options">
            <span class="year">年份</span>
            <el-select
                v-model="typhoon.years.selected"
                @change="handleChangeYear"
                :loading="typhoon.years.loading"
            >
                <el-option
                    v-for="item in typhoon.years.data"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>
            <span class="desc">（当前年份无活动台风）</span>
            <el-checkbox v-model="typhoon.windChecked">风圈</el-checkbox>
        </el-row>
        <el-table
            border
            stripe
            empty-text="当前年份无活动台风"
            :height="heightMixin / 2"
            :data="typhoon.table.data"
            v-loading="typhoon.table.loading"
            @selection-change="handleSelectionChange"
        >
            <el-table-column type="selection" label="选择" />
            <el-table-column
                v-for="(column, index) in typhoon.table.column"
                :key="index"
                :prop="column.prop"
                :label="column.label"
            />
        </el-table>
        <!-- 路径信息 -->
        <p class="details-title">路径信息</p>
        <el-table
            border
            stripe
            empty-text="当前年份无路径信息"
            :height="heightMixin / 2"
            :data="path.table.data"
            v-loading="path.table.loading"
        >
            <el-table-column
                v-for="(item, i) in path.table.column"
                :key="i"
                :prop="item.prop"
                :label="item.label"
                :width="item.width"
            />
        </el-table>
        <el-row class="forcast">
            <el-col :span="19">当前预测结构：</el-col>
            <el-col :span="5">
                <el-button type="primary" plain size="small"
                    >预报详情</el-button
                >
            </el-col>
        </el-row>
        <el-row class="legend">
            <el-col :span="24">
                <span>增水图例</span>
                <ul>
                    <li v-for="n in 16" :key="n"></li>
                    <li>-100</li>
                    <li>-10</li>
                    <li>-5</li>
                    <li>-1</li>
                    <li>-0.5</li>
                    <li>0</li>
                    <li>0.3</li>
                    <li>0.5</li>
                    <li>1</li>
                    <li>1.5</li>
                    <li>2</li>
                    <li>2.5</li>
                    <li>3</li>
                    <li>4</li>
                    <li>5</li>
                    <li>6m</li>
                </ul>
            </el-col>
        </el-row>
    </vue-perfect-scrollbar>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import "../../../styles/mapView/right.scss";
    import AutoHeightMixin from "../../../mixins/autoHeight";
    import { State, namespace, Mutation } from "vuex-class";
    const storm = namespace("storm");
    const LEVEL = [
        {
            label: "热带低压",
            value: 7,
            legend: () => require("@/assets/storm/storm_5.png")
        },
        {
            label: "热带风暴",
            value: 9,
            legend: () => require("@/assets/storm/storm_4.png")
        },
        {
            label: "强热带风暴",
            value: 11,
            legend: () => require("@/assets/storm/storm_3.png")
        },
        {
            label: "台风",
            value: 13,
            legend: () => require("@/assets/storm/storm_2.png")
        },
        {
            label: "强台风",
            value: 15,
            legend: () => require("@/assets/storm/storm_1.png")
        },
        {
            label: "超强台风",
            value: 16,
            legend: () => require("@/assets/storm/storm_0.png")
        }
    ];
    @Component
    export default class RealtimeWater extends AutoHeightMixin {
        typhoon: any = {
            years: {
                data: [],
                selected: 2019,
                loading: true
            },
            windChecked: true,
            table: {
                loading: true,
                column: [
                    {
                        prop: "id",
                        label: "台风编号"
                    },
                    {
                        prop: "chname",
                        label: "台风名称"
                    },
                    {
                        prop: "enname",
                        label: "英文名"
                    }
                ],
                data: []
            }
        };
        path: any = {
            table: {
                loading: false,
                height: 0,
                column: [
                    {
                        prop: "tm",
                        label: "时间",
                        width: 120
                    },
                    {
                        label: "中心气压",
                        prop: "cap",
                        width: 66
                    },
                    {
                        label: "风力",
                        prop: "p",
                        width: 40
                    },
                    {
                        label: "风速",
                        prop: "speed",
                        width: 40
                    },
                    {
                        label: "移动速度",
                        prop: "ms",
                        width: 66
                    },
                    {
                        label: "移动方向",
                        prop: "md",
                        width: 66
                    },
                    {
                        label: "中心气压",
                        prop: "cap",
                        width: 66
                    },
                    {
                        label: "7级风圈",
                        prop: "sp",
                        width: 120
                    },
                    {
                        label: "10级风圈",
                        prop: "tp",
                        width: 100
                    }
                ],
                data: []
            }
        };
        @storm.Mutation("controlMapPathShow") controlMapPathShow!: Function;
        @storm.Mutation("setMapPathGrid") setMapPathGrids!: Function;
        @Mutation("getCenter") getCenter!: Function;
        created(): void {
            //this.autoHeightMixin(356, false);
            this.handleTableHeight();
            this.handleOpened();
            this.autoHeightMixin(430);
        }

        // 初开页面获取数据
        async handleOpened() {
            await this.getYearsData();
            this.getTyphoonData();
        }

        // 表格多选框操作时
        handleSelectionChange(selection: any): void {
            this.path.table.data = [];
            this.path.table.loading = true;
            if (selection.length) {
                this.getPathData(selection[0].id);
            }
            this.path.table.loading = false;
        }

        // 请求路径信息
        getPathData(id: string): void {
            const params = { id };
            const name = this.typhoon.table.data.filter(
                (item: any) => item.id == id
            )[0].chname;
            this.$http("/rest/stormSurges/getTyphoonInfoAndRealPath", {
                params
            }).then(({ data }: any) => {
                this.path.table.data = [...this.path.table.data, ...data];
                let arr = [...this.path.table.data];
                let line = [],
                    point = [],
                    len = arr.length;
                point = arr.map((item: any, index: number) => {
                    let key: number = 0;
                    for (let i: number = 0; i < LEVEL.length; i++) {
                        if (item.p <= LEVEL[i].value) {
                            key = i;
                            break;
                        }
                    }
                    return {
                        id: id + "_" + item.tm,
                        type: "Point",
                        name: name,
                        coords: [item.lgtd, item.lttd],
                        info: { ...item },
                        style: {
                            image: {
                                icon: {
                                    src: LEVEL[key].legend()
                                }
                            }
                        }
                    };
                });
                for (let i = 0; i < len - 1; i++) {
                    line.push({
                        id: "line" + i,
                        type: "LineString",
                        coords: [
                            [arr[i].lgtd, arr[i].lttd],
                            [arr[i + 1].lgtd, arr[i + 1].lttd]
                        ],
                        style: {
                            stroke: {
                                width: 2,
                                color: "black"
                            }
                        }
                    });
                }
                this.path.table.data.forEach((item: any) =>
                    item.tm
                        ? (item.tm = item.tm.split(":")[0].replace("T", " "))
                        : "-"
                );
                this.controlMapPathShow(true);
                this.setMapPathGrids([...line, ...point]);
                this.getCenter(point[0].coords);
            });
        }

        // 获取台风信息列表
        getTyphoonData(): void {
            this.typhoon.table.loading = true;
            const year = this.typhoon.years.selected;
            const params = { year };

            this.$http("/rest/stormSurges/getTyphoonList", {
                params
            }).then(({ data }: any) => {
                this.typhoon.table.loading = false;
                this.typhoon.table.data = data;
            });
        }

        // 获取年份列表
        getYearsData(): void {
            this.typhoon.years.loading = true;
            this.$http("/rest/stormSurges/getTyphoonYear").then(
                ({ data }: any) => {
                    this.typhoon.years.loading = false;

                    const arr: number[] = [];
                    data.forEach((item: any) => {
                        arr.push(item.year);
                    });
                    this.typhoon.years.data = arr;
                    this.typhoon.years.selected = arr[0];
                }
            );
        }

        // 计算表格高度
        // 路径信息的高度，台风信息固定
        handleTableHeight(): void {
            this.path.table.height = window.innerHeight - 746;
        }

        // 切换年份
        handleChangeYear(): void {}

        // 隐藏模块
        hideList(): void {}
    }
</script>

<style lang="scss" scoped>
    .details {
        .title {
            margin-bottom: 0;
        }

        &-title {
            padding-left: 16px;
            color: #0269e1;
            background-color: #f5f5f5;
            line-height: 40px;

            & + .el-table {
                margin-top: 8px;
            }
        }

        &-options {
            padding: 12px 14px;

            .year {
                margin-right: 12px;
            }

            .desc {
                margin-right: 20px;
                color: #666;
            }

            .el-select {
                width: 100px;
            }

            & + .el-table {
                margin-bottom: 8px;
            }
        }

        .el-table {
            width: 392px;
            margin-left: 4px;
        }

        .forcast {
            padding: 4px 10px;

            .el-col-19 {
                position: relative;
                top: 6px;
            }
        }

        .legend {
            padding: 10px;
        }
    }

    ul {
        display: inline-flex;
        flex-wrap: wrap;
        height: 20px;
        list-style-type: none;
        margin: {
            left: 6px;
            right: 6px;
        }
        width: 352px;
        li {
            margin: 0;
            padding: 0;
            height: 15px;
            text-align: center;
            font-size: 12px;
            width: 22px;
            &:nth-of-type(1) {
                background-color: rgb(253, 204, 16);
            }
            &:nth-of-type(2) {
                background-color: rgb(101, 195, 181);
            }
            &:nth-of-type(3) {
                background-color: rgb(177, 224, 217);
            }
            &:nth-of-type(4) {
                background-color: rgb(197, 232, 227);
            }
            &:nth-of-type(5) {
                background-color: rgb(215, 238, 237);
            }
            &:nth-of-type(6) {
                background-color: rgb(255, 255, 255);
            }
            &:nth-of-type(7) {
                background-color: rgb(245, 231, 231);
            }
            &:nth-of-type(8) {
                background-color: rgb(248, 204, 204);
            }
            &:nth-of-type(9) {
                background-color: rgb(247, 152, 153);
            }
            &:nth-of-type(10) {
                background-color: rgb(249, 101, 102);
            }
            &:nth-of-type(11) {
                background-color: rgb(241, 49, 144);
            }
            &:nth-of-type(12) {
                background-color: rgb(251, 11, 12);
            }
            &:nth-of-type(13) {
                background-color: rgb(204, 14, 8);
            }
            &:nth-of-type(14) {
                background-color: rgb(179, 6, 10);
            }
            &:nth-of-type(15) {
                background-color: rgb(103, 8, 9);
            }
            &:nth-of-type(16) {
                background-color: rgb(91, 10, 7);
            }
        }
    }
</style>
