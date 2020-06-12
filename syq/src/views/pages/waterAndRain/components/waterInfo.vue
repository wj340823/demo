<template>
    <div>
        <el-checkbox-group v-model="bxdjSelect" @change="setWaterLevel">
            <el-checkbox label="中央" style="width: 50px" />
            <el-checkbox label="省重点" style="width: 50px" />
            <el-checkbox label="省一般" style="width: 50px" />
            <el-checkbox label="其他" style="width: 50px" />
            <el-checkbox label="山洪" style="width: 50px" />
        </el-checkbox-group>
        <el-table
            :height="listHeight"
            border
            stripe
            :data="currentTbData"
            @cell-mouse-enter="hoverCell"
            @cell-mouse-leave="leaveCell"
            :row-style="setRowStyle"
            highlight-current-row
            class="hight-light-row1"
            @row-click="locate"
        >
            <!--{ label: "站名", prop: "zm", fixed: "left", children: [] },
                { label: "水位", prop: "sw", children: [] },
                { label: "上报时间", prop: "sbsj", children: [] },
                { label: "警戒水位", prop: "jjsw", children: [] },
                { label: "保证水位", prop: "bzsw", children: [] },
                { label: "汛限水位", prop: "xxsw", children: [] },
                { label: "地区", prop: "sss", children: [] },
                -->
            <el-table-column
                type="index"
                label="序"
                fixed="left"
            ></el-table-column>
            <el-table-column
                prop="zm"
                fixed="left"
                label="站名"
                show-overflow-tooltip
            ></el-table-column>
            <el-table-column prop="sw" label="水位"></el-table-column>
            <el-table-column
                prop="sbsj"
                label="上报时间"
                width="100"
            ></el-table-column>
            <el-table-column
                prop="jjsw"
                label="警戒"
                v-if="tab.val == '0' || tab.val == '1' || tab.val == '2'"
            ></el-table-column>
            <el-table-column
                prop="bzsw"
                label="保证"
                v-if="tab.val == '0' || tab.val == '1' || tab.val == '2'"
            ></el-table-column>
            <el-table-column
                prop="xxsw"
                label="汛限"
                v-if="tab.val == '3'"
            ></el-table-column>
            <el-table-column
                prop="sss"
                label="地区"
                v-if="tab.val != '4' && tab.val != '5'"
            ></el-table-column>
        </el-table>
        <div class="tab" style="height: 30px;">
            <div
                class="item"
                style="border-right: 1px solid #ddd; width: 16.66%"
                :class="tab.val == '0' ? 'act' : ''"
                @click="changeTabByClick(0)"
            >
                闸坝
                <span v-if="tab.val == 0"></span>
            </div>
            <div
                class="item"
                style="border-right: 1px solid #ddd; width: 16.66%"
                :class="tab.val == '1' ? 'act' : ''"
                @click="changeTabByClick(1)"
            >
                潮位
                <span v-if="tab.val == 1"></span>
            </div>
            <!--class="item" style="border-right: 1px solid #ddd; width: 33%"-->
            <div
                class="item"
                style="width: 16.66%;border-right: 1px solid #ddd;"
                :class="tab.val == '2' ? 'act' : ''"
                @click="changeTabByClick(2)"
            >
                河道
                <span v-if="tab.val == 2"></span>
            </div>
            <div
                class="item"
                style="width: 16.66%;border-right: 1px solid #ddd;"
                :class="tab.val == '3' ? 'act' : ''"
                @click="changeTabByClick(3)"
            >
                水库
                <span v-if="tab.val == 3"></span>
            </div>
            <div
                class="item"
                style="border-right: 1px solid #ddd;width: 16.66%"
                :class="tab.val == '4' ? 'act' : ''"
                @click="changeTabByClick(4)"
            >
                超警戒
                <span v-if="tab.val == 4"></span>
            </div>
            <div
                class="item"
                style="width: 16.66%"
                :class="tab.val == '5' ? 'act' : ''"
                @click="changeTabByClick(5)"
            >
                超汛限
                <span v-if="tab.val == 5"></span>
            </div>
        </div>
        <div class="more" @click="getMore">
            放大<i class="el-icon-full-screen"></i>
        </div>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import { Mutation, namespace } from "vuex-class";

    const tableStore: any = namespace("waterAndRain");
    const tabs = ["sluiceDam", "tide", "river", "rsv", "cjj", "cxx"];
    @Component
    export default class waterInfo extends Vue {
        @Mutation("setHoverPoint") setHoverPoint: any;
        @Mutation("getPoint") getPoint: any;
        @Mutation("getCenter") getCenter: any;
        @Mutation("getZoom") getZoom: any;
        @Prop() tbList: any;
        @Prop() tbHeight: any;
        @Prop() tabIndex: any;
        @tableStore.Mutation("setTbList") setTbList!: Function;
        @tableStore.Mutation('setTbTitle') setTbTitle:any
        @tableStore.Mutation("setTh") setTh!: Function;
        @tableStore.Mutation("controlAllTableState") controlAllTableState: any;
        tab: any = {
            val: "2"
        };
        bxdjSelect: any[] = ["中央", "省重点"];
        listHeight: any;
        currentTbData: any = [];

        hoverCell(row: any) {
            this.setHoverPoint(row);
        }

        leaveCell() {
            this.setHoverPoint(null);
        }

        locate(row: any) {
            this.getZoom(12);
            row.info = { ...row };
            this.getPoint(row);
            this.getCenter([row.jd, Number(row.wd + 0.08)]);
        }

        setRowStyle(row: any) {
            if (row.row.zl == "RR") {
                if (row.row.xxsw !== null && row.row.xxsw < row.row.sw) {
                    return { background: "yellow" };
                }
            } else {
                if (row.row.bzsw != null && row.row.bzsw < row.row.sw) {
                    return { background: "red" };
                }
                if (row.row.jjsw != null && row.row.jjsw < row.row.sw) {
                    return { background: "yellow" };
                }
            }
        }

        setWaterLevel(level: any) {
            this.$emit("setWaterLevel", level);
        }
        changeTabByClick(val: any) {
            this.tab.val = val;
            this.currentTbData = this.tbList[0][tabs[this.tab.val]];
            this.$emit("setWaterPoint", this.currentTbData);
        }

        @Watch("tbList", { deep: true })
        changeTbList(n: any) {
            if (n.length) {
                this.currentTbData = this.tbList[0][tabs[this.tab.val]];
            }
        }

        @Watch("tabIndex")
        changeTabIndex(n: any) {
            if (n == 3) {
                this.$emit("setWaterPoint", this.currentTbData);
            }
        }

        getMore() {
            const th = [
                { label: "站名", prop: "zm", fixed: "left", children: [] },
                { label: "水位", prop: "sw", children: [] },
                { label: "上报时间", prop: "sbsj", children: [] },
                { label: "地区", prop: "sss", children: [] }
            ];
            const hd: any = [
                { label: "警戒水位", prop: "jjsw", children: [] },
                { label: "保证水位", prop: "bzsw", children: [] }
            ];
            const sk: any = [{ label: "汛限水位", prop: "xxsw", children: [] }];
            /*,
                ,
                { label: "地区", prop: "sss", children: [] },*/
            if (this.tab.val == 1 || this.tab.val == 2 || this.tab.val == 0) {
                th.push(...hd);
            } else if (this.tab.val == 3) {
                th.push(...sk);
            } else {
            }
            let tb: any = this.currentTbData;
            this.setTbList(tb);
            this.setTh(th);
            this.setTbTitle('水情信息')
            this.controlAllTableState(true);
        }

        created(): void {
            this.listHeight = parseInt(this.tbHeight) - 165;
        }
    }
</script>

<style scoped lang="scss">
    .more {
        color: #2f54eb;
        text-align: center;
        line-height: 20px;
        cursor: pointer;
    }
</style>
