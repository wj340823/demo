<template>
    <div class="markerCon" style="padding: 0; position: relative" v-drag>
        <div class="title">
            <div class="ls" />
            网格编号：{{ data.id }}
            <span>
                <i class="iconfont iconxingzhuang" @click="closeOverlay" />
            </span>
        </div>
        <el-row class="content">
            <el-col :span="16">
                <el-row class="content-select">
                    <span>机构</span>
                    <el-select style="width: 80px" v-model="forLayer.govern">
                        <el-option value="1" label="中国" />
                        <el-option value="2" label="日本" />
                    </el-select>
                    <span>未来时间</span>
                    <el-select style="width: 80px" v-model="forLayer.dateRange">
                        <el-option value="1" label="1小时" />
                        <el-option value="3" label="3小时" />
                        <el-option value="6" label="6小时" />
                        <el-option value="12" label="12小时" />
                        <el-option value="24" label="一天" />
                        <el-option value="48" label="二天" />
                        <el-option value="72" label="三天" />
                        <el-option value="96" label="四天" />
                        <el-option value="120" label="五天" />
                    </el-select>
                    <el-button
                        type="primary"
                        size="small"
                        style="margin-left: 24px;"
                        @click="getData"
                        >确定</el-button
                    >
                </el-row>
                <el-row>
                    <OnlyChart
                        :data="chart.data"
                        :type="chart.type"
                        :thhead="chart.head"
                        :width="670"
                        :height="320"
                    />
                </el-row>
                <el-row class="content-line">
                    <el-col :span="8">未来降雨：{{ future.total }}mm</el-col>
                </el-row>
            </el-col>
            <el-col :span="8">
                <el-table
                    stripe
                    border
                    height="410"
                    style="width: 100%"
                    :data="table.data"
                    :cell-style="columnStyle"
                >
                    <el-table-column
                        v-for="column in table.column"
                        :key="column.prop"
                        :prop="column.prop"
                        :label="column.label"
                        :width="column.width"
                        :style="column.style"
                    />
                </el-table>
            </el-col>
        </el-row>
    </div>
</template>

<script lang="ts">
    import { Component, Vue, Watch } from "vue-property-decorator";
    import { namespace, State } from "vuex-class";
    import { OnlyChart } from "@/components";
    import moment from "moment";

    const Store = namespace("mapCommon");
    let cancelToken: any = null;
    @Component({
        components: {
            OnlyChart
        }
    })
    export default class Overlay extends Vue {
        @Store.State(state => state.overlay.data) data!: any;
        @Store.Mutation("closeOverlay") closeOverlay!: Function;
        @State(state => state.forLayer) forLayer!: any;

        @Watch("data", { immediate: true, deep: true })
        handleChange() {
            this.getData();
        }

        table: any = {
            data: [],
            column: [
                {
                    prop: "date",
                    label: "时间",
                    width: 160
                },
                {
                    prop: "future",
                    label: "雨量",
                    style: {
                        color: "red"
                    }
                }
            ]
        };
        chart: any = {
            data: [],
            type: "P",
            head: [
                {
                    prop: "time",
                    label: "时间"
                },
                {
                    prop: "p",
                    label: "雨量"
                }
            ]
        };
        future: any = {
            total: 0
        };

        created() {
            this.getData();
        }

        columnStyle({ row, column, rowIndex, columnIndex }: any) {
            if (columnIndex === 1) {
                return { color: "red" };
            }
        }

        getData() {
            this.table.data = [];
            this.chart.data = [];
            const params = {
                fid: this.data.id,
                st: moment().format("YYYY-MM-DDTHH:mm:ss"),
                et: moment()
                    .add(this.forLayer.dateRange, "hour")
                    .format("YYYY-MM-DDTHH:mm:ss"),
                unitname: this.forLayer.govern
            };
            if (cancelToken) {
                cancelToken();
            }
            this.$http("/rest/weatherForecast/getFutureRainData", {
                params,
                cancelToken: new this.$http.CancelToken(cancel => {
                    cancelToken = cancel;
                })
            }).then(({ data }: any) => {
                let num = 0;
                data.pz.forEach((item: any) => {
                    this.table.data.push({
                        date: moment(item.tm).format("YYYY-MM-DD HH:mm:ss"),
                        future: item.yl,
                        isFuture: true
                    });
                    this.chart.data.push({
                        p: null,
                        p1: item.yl,
                        z: null,
                        q: null,
                        tm: moment(item.tm).format("YYYY-MM-DD HH:mm")
                    });
                    num += Number(item.yl);
                });
                this.table.data.reverse();
                this.future.total = num.toFixed(2);
            });
        }
    }
</script>

<style lang="scss" scoped>
    .markerCon {
        width: 1024px;
        height: 463px;
        background-color: white;

        .title {
            line-height: 40px;
            height: 40px;
            font-size: 14px;
            font-weight: bold;
            padding-left: 36px;
            margin-bottom: 0;
            color: #fff;
            background-image: linear-gradient(270deg, #1f64ff 0%, #325fd9 100%);
            border-radius: 4px 4px 0px 0px;

            .ls {
                float: left;
                width: 6px;
                height: 20px;
                background: #fff;
                margin-top: 10px;
                margin-left: -20px;
            }

            span {
                float: right;
                margin-right: 16px;
                cursor: pointer;

                i {
                    font-size: 12px;
                }
            }
        }

        .content {
            width: 100%;
            height: 430px;
            padding: 6px;

            .chart {
                height: 315px;
                width: 100%;
                background-color: orange;
            }

            &-select {
                margin-bottom: 12px;
                margin-top: 8px;

                > span {
                    margin-right: 10px;

                    &:not(:first-of-type) {
                        margin-left: 30px;
                    }
                }
            }

            &-line {
                margin-top: 12px;
            }

            &-desc {
                list-style: none;

                li {
                    display: inline-block;
                    width: 25%;
                    border: 1px solid #ccc;
                    background-color: white;
                    line-height: 32px;
                    font-size: 14px;
                    padding-left: 20px;
                }

                &-key {
                    background-color: #f4f6f8 !important;
                }
            }
        }
    }

    .el-dialog {
        padding: 10px;
    }

    #hehe {
        display: flex;
    }
</style>
