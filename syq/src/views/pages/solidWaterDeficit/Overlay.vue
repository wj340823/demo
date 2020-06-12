<template>
    <div class="map-overlay" v-drag>
        <header>
            <p>{{ dataState.name }}（{{ dataState.id }}）</p>
            <i class="el-icon-close" @click="closeOverlayMutation" />
        </header>
        <main>
            <el-row>
                <el-col :span="6">
                    <span>时间：</span>
                    <el-select v-model="select.selected" @change="getData">
                        <el-option
                            v-for="item in select.data"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-col>
                <el-col v-show="select.selected === 'manually'" :span="14">
                    <span>起</span>
                    <el-date-picker
                        v-model="date.end"
                        type="date"
                        format="yyyy-MM-dd"
                        :clearable="false"
                        @change="getData"
                    />
                    <span>止</span>
                    <el-date-picker
                        v-model="date.end"
                        type="date"
                        format="yyyy-MM-dd"
                        :clearable="false"
                        @change="getData"
                    />
                </el-col>
            </el-row>
            <OnlyChart type="QS" :data="data" :height="304" :width="596" />
        </main>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Watch } from "vue-property-decorator";
    import { DateConfig } from "./Interface";
    import { OnlyChart } from "@/components";
    import { namespace } from "vuex-class";
    import moment from "moment";

    const MapStore = namespace("mapCommon");

    @Component({
        components: {
            OnlyChart
        }
    })
    export default class Overlay extends Vue {
        @MapStore.Mutation("closeOverlay") closeOverlayMutation!: Function;
        @MapStore.State((state) => state.overlay.data) dataState!: {
            id: number;
        };

        private select: any = {
            data: [
                {
                    value: 15,
                    label: "15天"
                },
                {
                    value: 30,
                    label: "30天"
                },
                {
                    value: 45,
                    label: "45天"
                },
                {
                    value: 60,
                    label: "60天"
                },
                {
                    value: 75,
                    label: "75天"
                },
                {
                    value: "manually",
                    label: "自定义"
                }
            ],
            selected: "15"
        };
        private date: DateConfig = {
            start: moment().subtract(7, "day"),
            end: moment()
        };
        private data: { qs: number; p: number; ll: null; tm: string }[] = [];
        private cursor: any = {
            x: 0,
            y: 0
        };

        // 获取指定流域历史面雨量及缺水量
        @Watch("dataState", { immediate: true })
        public getData(): void {
            const { start, end } = this.date;
            let params = {};
            this.data = [];

            this.select.selected === "manually"
                ? (params = {
                      id: this.dataState.id,
                      st: moment(start).format("YYYY-MM-DD HH:mm:ss"),
                      et: moment(end).format("YYYY-MM-DD HH:mm:ss")
                  })
                : (params = {
                      id: this.dataState.id,
                      st: moment(start)
                          .subtract(this.select.selected, "day")
                          .format("YYYY-MM-DD HH:mm:ss"),
                      et: moment().format("YYYY-MM-DD HH:mm:ss")
                  });

            this.$http("/rest/soilWaterDeficit/getHistoryData", {
                params
            }).then(({ data }) => {
                try {
                    data.reverse().forEach(
                        (item: { wq: number; pa: number; time: string }) => {
                            this.data.push({
                                qs: item.wq,
                                p: item.pa,
                                ll: null,
                                tm: moment(item.time)
                            });
                        }
                    );
                } catch {
                    this.$message({
                        message: "当前搜索条件下无数据，请修改搜索条件",
                        type: "warning"
                    });
                }
            });
        }
    }
</script>

<style lang="scss" scoped>
    .map-overlay {
        width: 600px;
        height: 400px;

        main {
            .el-row {
                margin-bottom: 8px;

                .el-col {
                    > span {
                        margin: 0 6px 0 12px;
                    }
                }

                .el-select {
                    width: 90px;
                }

                .el-date-editor {
                    width: 140px;
                }
            }
        }
    }
</style>
