<template>
    <div class="component">
        <header>
            <ul>
                <li>{{ data.city }}</li>
                <li>{{ data.name }}</li>
                <li>（{{ data.zh }}）</li>
                <li>{{ data.zl }}</li>
            </ul>
            <i class="el-icon-close" @click="closeModal" />
        </header>
        <main>
            <el-row class="options">
                <span class="label">时间：</span>
                <el-select
                    v-if="sxItem.timeType.default == 1"
                    style="width: 100px"
                    v-model="search.beforeList.default"
                    placeholder="请选择"
                    @change="changetimeLength"
                >
                    <el-option
                        v-for="item in search.beforeList.arr"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
                <el-select
                    v-if="sxItem.timeType.default == 2"
                    style="width: 100px"
                    v-model="search.beforeList.default"
                    placeholder="请选择"
                    @change="changetimeLength"
                >
                    <el-option
                        v-for="item in search.beforeList.arr1"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
                <span
                    class="label"
                    v-if="$utils.checkUser(userInfo.roles, 'super')"
                    >时段类型：</span
                >
                <el-select
                    style="width: 100px"
                    v-model="sxItem.timeType.default"
                    placeholder="请选择"
                    @change="changetimeLength"
                    v-if="$utils.checkUser(userInfo.roles, 'super')"
                >
                    <el-option
                        v-for="item in sxItem.timeType.list"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    ></el-option>
                </el-select>
            </el-row>
            <only-chart
                :data="result.tb"
                :thhead="result.th"
                :type="data.item"
                @getSpecialData="getSpecialData"
                :width="800"
                :height="400"
                :xxsw="data.xxsw"
                :zcsw="data.zcsw"
                :jjsw="data.jjsw"
                :bzsw="data.bzsw"
                class="amchart"
            ></only-chart>
            <el-row class="desc">
                <span v-show="data.item.match('P') != null"
                    >最大时段雨量：</span
                >
                <span>{{ result.maxYl }}mm</span>
                <span v-show="data.item.match('P') != null"
                    >当前累积雨量：</span
                >
                <span>{{ result.ljyl }}mm</span>
                <span v-show="data.item.match('Z') !== null">最高水位：</span>
                <span>{{ result.maxSw }}m</span>
            </el-row>
        </main>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import { State } from "vuex-class";
    import onlyChart from "@/components/onlyChart.vue";
    @Component({
        components: { onlyChart }
    })
    export default class Modal extends Vue {
        @Prop() data: any;
        @State("userInfo") userInfo: any;
        sxItem: any = {
            timeType: {
                default: 1,
                list: [
                    {
                        label: "小时",
                        value: 1
                    },
                    {
                        label: "分钟",
                        value: 2
                    }
                ]
            }
        };
        search: any = {
            beforeList: {
                default: "2",
                arr: [
                    { label: "一天", value: "1" },
                    { label: "二天", value: "2" },
                    { label: "三天", value: "3" },
                    { label: "四天", value: "4" },
                    { label: "五天", value: "5" },
                    { label: "前一周", value: "7" }
                ],
                arr1: [
                    { label: "近1小时", value: "1" },
                    { label: "近2小时", value: "2" },
                    { label: "近3小时", value: "3" },
                    { label: "近4小时", value: "4" },
                    { label: "近5小时", value: "5" },
                    { label: "近6小时", value: "6" },
                    { label: "近12小时", value: "12" },
                    { label: "近1天", value: "24" }
                ]
            } //前**小时列表
        };
        result: any = {
            th: [],
            tb: [],
            maxYl: null,
            maxSw: null,
            ljyl: null
        };
        getData() {
            let vm = this;
            let params: any;
            if (this.sxItem.timeType.default == 1) {
                params = {
                    zm: vm.data.zh,
                    st: this.$utils.dateFormat(
                        new Date(
                            Date.now() -
                                this.search.beforeList.default *
                                    24 *
                                    3600 *
                                    1000
                        ),
                        "yyyy-MM-ddTHH:mm:ss"
                    ),
                    et: this.$utils.dateFormat(
                        new Date(),
                        "yyyy-MM-ddTHH:mm:ss"
                    ),
                    jg: this.sxItem.timeType.default,
                    lx: 0
                };
            } else {
                params = {
                    zm: vm.data.zh,
                    st: this.$utils.dateFormat(
                        new Date(
                            Date.now() -
                                this.search.beforeList.default * 3600 * 1000
                        ),
                        "yyyy-MM-ddTHH:mm:ss"
                    ),
                    et: this.$utils.dateFormat(
                        new Date(),
                        "yyyy-MM-ddTHH:mm:ss"
                    ),
                    jg: this.sxItem.timeType.default,
                    lx: 0
                };
            }

            vm.result.tb = [];
            vm.$http
                .get("/rest/water/getHisData", { params })
                .then((res: any) => {
                    let ljyl = 0,
                        zgsw = 0,
                        zdyl = 0;
                    res.data.pz.forEach((item: any, i: number) => {
                        if (item.sw > zgsw) {
                            zgsw = item.sw;
                        }
                        if (item.yl) {
                            ljyl += Number(item.yl);
                            item.yl > zdyl ? (zdyl = Number(item.yl)) : "";
                        }
                        vm.result.tb.push({
                            tm: item.tm,
                            p: item.yl,
                            z: item.sw,
                            q: res.data.q[i].ll,
                            rg: res.data.q[i].rg
                        });
                    });
                    vm.result.ljyl = ljyl;
                    vm.result.maxSw = zgsw;
                    vm.result.maxYl = zdyl;
                });
        }
        getSpecialData(data: any) {
            //累计雨量，最大水位，最大雨量
            this.result.ljyl = data[0];
            this.result.maxSw = data[1];
            this.result.maxYl = data[2];
        }
        closeModal() {
            this.$emit("closeProgress");
        }
        changetimeLength() {
            this.$nextTick(() => {
                this.getData();
            });
        }
        @Watch("data", { deep: true })
        changeData() {
            this.$nextTick(() => {
                this.getData();
            });
        }
        created(): void {
            this.$nextTick(() => {
                this.getData();
            });
        }
    }
</script>

<style scoped lang="scss">
    .component {
        height: 544px;

        header {
            display: flex;
            justify-content: space-between;
            padding: 0 16px 0 30px;
            line-height: 40px;
            color: white;
            background-image: linear-gradient(270deg, #1f64ff 0%, #325fd9 100%);

            ul {
                list-style: none;

                li {
                    display: inline-block;
                    margin: 4px;
                    font-size: 18px;
                    font-weight: 500;
                }

                &::before {
                    position: relative;
                    top: 1px;
                    left: -8px;
                    content: "";
                    display: inline-block;
                    width: 3px;
                    height: 14px;
                    background-color: white;
                }
            }

            i {
                position: relative;
                top: 10px;
                color: white;
                font-size: 26px;
                cursor: pointer;
            }
        }

        .options {
            padding-left: 24px;
            margin: 12px 0;

            .el-select {
                margin-right: 24px;
            }
        }

        .amchart {
            padding-left: 15px;
        }

        .desc {
            padding-left: 24px;
            margin-top: 10px;

            span {
                &:nth-of-type(odd):not(:first-of-type) {
                    margin-left: 20px;
                }

                &:nth-of-type(even) {
                    color: #33b0ff;
                }
            }
        }
    }
</style>
