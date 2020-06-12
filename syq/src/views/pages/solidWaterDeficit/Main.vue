<template>
    <div class="details">
        <el-tabs v-model="data.type" type="card">
            <el-tab-pane name="土壤缺水量" label="土壤缺水量">
                <el-collapse
                    accordion
                    class="solid-water-deficit"
                    v-model="isActive"
                    @change="handleCollapseChange"
                >
                    <el-collapse-item name="1">
                        <template slot="title">
                            <i
                                :class="[
                                    isActive === '1'
                                        ? 'el-icon-caret-bottom'
                                        : 'el-icon-caret-right'
                                ]"
                            />土壤缺水量（mm）
                        </template>
                        <el-row class="controls">
                            <el-input
                                clearable
                                v-model="input"
                                placeholder="站名、站码、拼音码"
                                @keyup.enter.native="getWaterDeficitData"
                                @clear="getWaterDeficitData"
                            />
                            <el-button
                                type="primary"
                                size="mini"
                                icon="el-icon-search"
                                @click="getWaterDeficitData"
                                >查询</el-button
                            >
                        </el-row>
                        <el-table
                            @row-click="handleClickWaterDeficitTableRow"
                            :data="table.data"
                            :height="heightMixin"
                            class="land-table"
                            stripe
                            v-loading="table.loading"
                        >
                            <el-table-column
                                type="index"
                                width="40"
                                label="序"
                            />
                            <el-table-column
                                v-for="item in table.columns"
                                :key="item.prop"
                                :prop="item.prop"
                                :label="item.label"
                                :width="item.width"
                                :sortable="item.sortable"
                                :fiexed="item.fiexed"
                            />
                        </el-table>
                    </el-collapse-item>
                    <el-collapse-item
                        title="一致性 Consistency"
                        name="2"
                        class="collapse-2"
                    >
                        <template slot="title">
                            <i
                                :class="[
                                    isActive === '2'
                                        ? 'el-icon-caret-bottom'
                                        : 'el-icon-caret-right'
                                ]"
                            />缺水量等值面
                        </template>
                        <!-- 控制区 -->
                        <!-- 时间选择器 -->
                        <el-row class="time-control">
                            <el-col :span="10">
                                <span>起</span>
                                <el-date-picker
                                    v-model="date.start"
                                    type="date"
                                    format="yyyy-MM-dd"
                                    :clearable="false"
                                />
                            </el-col>
                            <el-col :span="10">
                                <span>止</span>
                                <el-date-picker
                                    v-model="date.end"
                                    type="date"
                                    format="yyyy-MM-dd"
                                    :clearable="false"
                                />
                            </el-col>
                            <el-button
                                type="primary"
                                icon="el-icon-success"
                                @click="getShroudedData"
                                size="mini"
                                >确定</el-button
                            >
                        </el-row>
                        <!-- 进度条控制器 -->
                        <el-row class="progress-control">
                            <img
                                src="../../../assets/button/pre.png"
                                alt="前一项"
                                @click="handleProgress(true)"
                            />
                            <el-slider
                                v-model="progress.time"
                                :max="progress.max"
                            />
                            <img
                                src="../../../assets/button/next.png"
                                alt="后一项"
                                @click="handleProgress(false)"
                            />
                            <span>透明度</span>
                            <el-slider
                                v-model="progress.opacity"
                                :show-stops="true"
                                :step="10"
                            />
                        </el-row>
                        <!-- 单选、多选 -->
                        <el-row>
                            <el-checkbox v-model="select.checkbox"
                                >叠加</el-checkbox
                            >
                            <el-radio-group
                                class="reset-radio-mr"
                                v-model="select.radio"
                            >
                                <el-radio :label="3">等值线</el-radio>
                                <el-radio :label="6">等值面</el-radio>
                                <el-radio :label="9">线和面</el-radio>
                            </el-radio-group>
                        </el-row>
                        <!-- 播放控制 -->
                        <el-row class="play-control">
                            <span class="play-desc"
                                >播放设置（单位：秒）：</span
                            >
                            <el-select v-model="play.selected">
                                <el-option
                                    v-for="item in play.data"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                />
                            </el-select>
                            <img
                                src="../../../assets/button/play.png"
                                alt="播放"
                                @click="handleOpacity(true)"
                            />
                            <img
                                src="../../../assets/button/stop.png"
                                alt="停止"
                                @click="handleOpacity(false)"
                            />
                        </el-row>
                        <!-- 表格及切换-->
                        <el-row class="collapse-content">
                            <ul class="content-switch">
                                <li
                                    :class="[
                                        equivalentFace.isActive ? 'active' : ''
                                    ]"
                                    @click="handleSwitchClass"
                                >
                                    缺水笼罩面积
                                </li>
                                <li
                                    :class="[
                                        equivalentFace.isActive ? '' : 'active'
                                    ]"
                                    @click="handleSwitchClass"
                                >
                                    等值线面列表
                                </li>
                            </ul>
                            <el-table
                                v-show="equivalentFace.isActive"
                                :data="tableData"
                                :max-height="550"
                                v-loading="equivalentFace.loading"
                            >
                                <el-table-column
                                    label="序号"
                                    type="index"
                                    width="36"
                                />
                                <el-table-column
                                    show-overflow-tooltip
                                    v-for="item in equivalentFace.table.column"
                                    :key="item.label"
                                    :prop="item.prop"
                                    :label="item.label"
                                />
                            </el-table>
                            <el-table
                                v-show="!equivalentFace.isActive"
                                :data="contourFace.table.data"
                                @row-click="handleClickFaceTableRow"
                                :max-height="550"
                                :highlight-current-row="true"
                                v-loading="equivalentFace.loading"
                            >
                                <el-table-column
                                    label="序号"
                                    type="index"
                                    width="36"
                                />
                                <el-table-column
                                    label="等值线面列表"
                                    prop="id"
                                    show-overflow-tooltip
                                />
                            </el-table>
                        </el-row>
                    </el-collapse-item>
                </el-collapse>
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
    import { Vue, Component, Mixins, Ref, Watch } from "vue-property-decorator";
    import { State, Mutation, namespace } from "vuex-class";
    import {
        columnsForLand,
        columnsForFace,
        TableConfig,
        DateConfig,
        ProgressConfig,
        SelectConfig,
        PlayConfig,
        EquivalentFaceConfig,
        playData
    } from "./Interface";
    import { ElRow } from "element-ui/types/row";
    import moment from "moment";
    import AutoHeight from "../../../mixins/autoHeight";
    import weatherRadar from "../weatherRadar/Main.vue";
    const MapStore = namespace("mapCommon");
    import stormSurge from "../stormSurge/Main.vue";

    @Component({
        components: { weatherRadar, stormSurge }
    })
    export default class SolidWaterDeficit extends AutoHeight {
        @State("pagesShow") pagesShow: any;
        @MapStore.Mutation("updateMapPoints")
        updateMapPointsMutation!: Function;
        @MapStore.Mutation("updateOverlay")
        updateOverlayMutation!: Function;
        @MapStore.Mutation("closeOverlay")
        closeOverlayMutation!: Function;
        @Mutation("getCenter") setMapCenter!: Function;
        @Mutation("getZoom") setMapZoom!: Function;
        @Mutation("getSolidPicUrl") getSolidPicUrl!: Function;
        @Ref("container") container!: any;
        data = {
            type: "土壤缺水量"
        };
        private input: string = "";
        private isActive: string = "1";
        private table: TableConfig = {
            columns: columnsForLand,
            data: [],
            loading: true
        };
        private date: DateConfig = {
            start: moment().subtract(7, "days"),
            end: moment()
        };
        private progress: ProgressConfig = {
            time: 0,
            max: 100,
            opacity: 20
        };
        private select: SelectConfig = {
            checkbox: true,
            radio: "3"
        };
        private play: PlayConfig = {
            selected: 2,
            data: playData
        };
        private equivalentFace: EquivalentFaceConfig = {
            isActive: true,
            loading: true,
            table: {
                column: columnsForFace,
                data: []
            }
        };
        private contourFace: EquivalentFaceConfig = {
            table: {
                data: []
            }
        };
        allData: any[] = [];
        get tableData() {
            const arr: any[] = [];
            if (this.allData.length != 0) {
                let data = this.allData[this.progress.time].AREA.split(";");
                data.forEach((item: any) => {
                    if (item && item != ",") {
                        arr.push({
                            level: item.split(",")[0],
                            area: item.split(",")[1]
                        });
                    }
                });
            }
            return arr;
        }
        private created(): void {
            this.handleCollapseChange();
            this.autoHeightMixin(306);
        }

        private beforeDestroy(): void {
            this.updateMapPointsMutation({ data: [] });
            this.closeOverlayMutation();
        }

        // 切换百叶窗
        handleCollapseChange(activeName: string = this.isActive) {
            if (this.isActive === "1" && !this.table.data.length) {
                this.getWaterDeficitData();
            } else if (
                this.isActive === "2" &&
                !this.equivalentFace.table.data.length
            ) {
                this.getShroudedData();
            }
        }

        // 获取土壤缺水量表格数据
        private getWaterDeficitData(): void {
            this.table.loading = true;
            const params = {
                name: this.input
            };

            this.$http("/rest/soilWaterDeficit/getSoilWaterDeficitList", {
                params
            }).then(({ data }) => {
                this.table.loading = false;
                this.table.data = [];

                try {
                    const points: any = [];
                    data.forEach((item: any) => {
                        const { name, id, wd, jd } = item;
                        this.table.data.push({
                            ...item,
                            component: "SolidWaterDeficitOverlay",
                            offset: [-270, -370],
                            lat: wd,
                            lon: jd
                        });
                        points.push({
                            name,
                            id,
                            lat: wd,
                            lon: jd,
                            data: item,
                            component: "SolidWaterDeficitOverlay",
                            offset: [-270, -370],
                            style: {
                                image: {
                                    icon: {
                                        anchor: [0.5, 0.5],
                                        src: require("@/assets/legend/rain_0.png"),
                                        scale: 0.7
                                    }
                                }
                            }
                        });
                    });
                    this.updateMapPointsMutation({ data: points });
                } catch {
                    this.$message({
                        message: "当前搜索条件下无数据，请修改搜索条件",
                        type: "warning"
                    });
                }
            });
        }

        // 缺水笼罩面积
        private getShroudedData(): void {
            this.equivalentFace.loading = true;
            const { start, end } = this.date;
            const params = {
                sTime1: moment(start).format("YYYYMMDDHHmm"),
                sTime2: moment(end).format("YYYYMMDDHHmm"),
                f: "pjson"
            };
            const tableData: { [propName: string]: string }[] = [];

            this.$http("/rest/soilWaterDeficit/getSoilListAndPic", {
                params
            }).then(({ data }) => {
                this.equivalentFace.loading = false;
                try {
                    data.DZM.forEach((item: any) => {
                        const matched = item.GID.match(/(\d{4})(\d{2})(\d{2})/);
                        const [, year, month, day] = matched;
                        tableData.push({
                            id: `${year +
                                "年" +
                                month +
                                "月" +
                                (Number(day) + 1) +
                                "日"}(${
                                item.IMG1.split("/")[3].split(".")[0]
                            })`,
                            area: item.AREA
                        });
                    });
                    this.allData = data.DZM;
                    if (data.DZM.length) {
                        this.progress.max = data.DZM.length - 1;
                    }

                    this.contourFace.table.data = tableData;
                    this.handleClickFaceTableRow();
                } catch {
                    this.contourFace.table.data = [];
                    this.equivalentFace.table.data = [];
                    this.$message({
                        message: "当前搜索条件下无数据，请修改搜索条件",
                        type: "warning"
                    });
                }
            });
        }
        // 生成左侧表格的数据
        private handleClickFaceTableRow(
            row: { [propName: string]: string } = this.contourFace.table.data[0]
        ): void {
            const tableData: { [propName: string]: string }[] = [];
            row.area.split(";").forEach((item: string) => {
                const data = item.split(",");
                tableData.push({
                    level: data[0],
                    area: data[1]
                });
            });

            this.equivalentFace.table.data = tableData;
        }

        // 点击土壤缺水量的表格
        // 联动地图
        handleClickWaterDeficitTableRow(row: { jd: number; wd: number }) {
            const { jd, wd } = row;
            this.setMapCenter([jd, wd + 0.02]);
            this.setMapZoom(16);
            this.updateOverlayMutation({ data: row });
        }

        // 控制当前进度
        private handleProgress(bool: boolean): void {
            bool ? --this.progress.time : ++this.progress.time;
        }

        @Watch("progress.time")
        changeProgress(n: any) {}
        // 控制播放状态
        private handleOpacity(bool: boolean): void {}

        // 切换激活状态
        private handleSwitchClass(): void {
            this.equivalentFace.isActive
                ? (this.equivalentFace.isActive = false)
                : (this.equivalentFace.isActive = true);
        }
    }
</script>

<style lang="scss" scoped>
    .solid-water-deficit {
        width: 100%;
        height: 100%;
        background-color: white;

        .controls {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;

            .el-input {
                width: 290px;
            }
        }

        .land-table {
            width: 384px;
            margin: 0 8px 8px;
        }

        .collapse-2 {
            .time-control {
                display: flex;
                justify-content: space-between;

                .el-date-editor {
                    margin-left: 6px;
                    width: 126px;
                }
            }

            .progress-control {
                display: flex;

                span {
                    line-height: 30px;
                    margin-right: 6px;
                }

                img {
                    margin-top: 7px;
                    margin-right: 8px;
                    width: 18px;
                    height: 18px;
                }

                .el-slider {
                    width: 130px;

                    &:first-of-type {
                        margin-right: 10px;
                    }
                }
            }

            .el-checkbox {
                margin-right: 20px;
            }

            .el-select {
                width: 60px;
            }

            .play-control {
                display: flex;
                justify-content: flex-start;
                margin-top: 4px;

                .play-desc {
                    line-height: 30px;
                }

                img {
                    margin-left: 4px;
                    cursor: pointer;
                }
            }

            .el-table {
                width: 100%;
            }

            .collapse-content {
                .content-switch {
                    margin-top: 6px;
                    list-style-type: none;
                    cursor: pointer;

                    li {
                        display: inline-block;
                        padding: 4px 8px;
                        border-top-left-radius: 4px;
                        border-top-right-radius: 4px;
                        border: 1px solid transparent;
                        color: #666;
                        background-color: #f5f5f5;
                        transition: all 0.2s ease-in-out;

                        &.active {
                            color: #333;
                            background-color: #e6e6e6;
                        }
                    }
                }
            }
        }
    }
</style>
