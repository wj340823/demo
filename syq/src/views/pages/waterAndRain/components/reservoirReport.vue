<template>
    <div>
        <el-checkbox-group v-model="rsvType">
            <el-checkbox label="大型" />
            <el-checkbox label="中型" />
        </el-checkbox-group>
        <el-table
            stripe
            border
            :data="tbData"
            :height="listHeight"
            @cell-mouse-enter="hoverCell"
            @cell-mouse-leave="leaveCell"
            :row-style="setRowStyle"
            highlight-current-row
            class="hight-light-row1"
            @row-click="locate"
            @header-click="sortBykey"
        >
            <!--
            [
                {label:'库名'，prop:'zm',fixed:'left',children:[]},
                 {label:this.currentDay + ' 8:00'，prop:'',children:[
                    {label:'水位'，prop:'eightsw'}
                     {label:'蓄水量'，prop:'eightxsl'}
                      {label:'移民水位可纳雨量'，prop:'eightknyl'}
                 ]},
                  {label:this.current+':00'，prop:'',,children:[
                  {label:'水位'，prop:'sw'}
                     {label:'蓄水量'，prop:'xsl'}
                      {label:'移民水位可纳雨量'，prop:'knyl'}
                  ]},
                   {label:'增蓄水量'，prop:'zxsl',children:[]},
                    {label:'汛限水位'，prop:'xxsw',children:[]},
                     {label:'集水面积'，prop:'jsmj',children:[]},
                      {label:'地市'，prop:'city',children:[]},
            ]
      -->
            <el-table-column
                type="index"
                label="序"
                fixed="left"
            ></el-table-column>
            <el-table-column
                prop="zm"
                label="库名"
                fixed="left"
            ></el-table-column>
            <el-table-column :label="current + ':00'">
                <el-table-column prop="sw" label="水位"></el-table-column>
                <el-table-column prop="xsl" label="蓄水量"></el-table-column>
                <el-table-column
                    prop="knyl"
                    width="70"
                    label="移民水位可纳雨量"
                ></el-table-column>
            </el-table-column>
            <el-table-column :label="currentDay + ' 8:00'">
                <el-table-column prop="eightsw" label="水位"></el-table-column>
                <el-table-column
                    prop="eightxsl"
                    label="蓄水量"
                ></el-table-column>
                <el-table-column
                    prop="eightknyl"
                    label="移民水位可纳雨量"
                    width="70"
                ></el-table-column>
            </el-table-column>
            <el-table-column label="增蓄水量" prop="zxsl"></el-table-column>
            <el-table-column label="汛限水位" prop="xxsw"></el-table-column>
            <el-table-column label="集水面积" prop="jsmj"></el-table-column>
            <el-table-column label="地市" prop="city"></el-table-column>
        </el-table>
        <div class="more" @click="getMore">
            放大
            <i class="el-icon-full-screen"></i>
        </div>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import moment from "moment";
    import { Mutation, namespace } from "vuex-class";
    const tableStore: any = namespace("waterAndRain");
    function compare(property: any) {
        return function(a: any, b: any) {
            var value1 =
                a[property] == "-"
                    ? -1000
                    : a[property] === null || a[property] === ""
                    ? -999
                    : a[property];
            var value2 =
                b[property] == "-"
                    ? -1000
                    : b[property] === null || b[property] === ""
                    ? -999
                    : b[property];
            return value1 - value2;
        };
    }
    @Component
    export default class reservoirReport extends Vue {
        @Mutation("setHoverPoint") setHoverPoint: any;
        @Mutation("getPoint") getPoint: any;
        @Mutation("getCenter") getCenter: any;
        @Mutation("getZoom") getZoom: any;
        @Prop() data: any;
        @Prop() tbHeight: any;
        @Prop() tabIndex: any;
        @tableStore.Mutation("setTbTitle") setTbTitle: any;
        @tableStore.Mutation("setTbList") setTbList!: Function;
        @tableStore.Mutation("setTh") setTh!: Function;
        @tableStore.Mutation("controlAllTableState")
        controlAllTableState!: Function;
        listHeight: any;
        rsvType: any = ["大型"];
        sortKey: string = "";
        get tbData() {
            let arr: any = [];
            if (this.rsvType.length) {
                if (this.rsvType.indexOf("中型") === -1) {
                    arr = this.data.filter((item: any) => {
                        return item.sklx == 5 || item.sklx == 4;
                    });
                } else if (this.rsvType.indexOf("大型") === -1) {
                    arr = this.data.filter((item: any) => {
                        return item.sklx == 3;
                    });
                } else {
                    arr = this.data;
                }
            }
            if (this.tabIndex == 2) {
                this.$emit("setRsvPoint", arr);
            }
            return arr;
        }

        currentDay = moment().format("YYYY-MM-DD");
        current = moment().format("YYYY-MM-DD HH");

        hoverCell(row: any) {
            this.setHoverPoint(row);
        }

        leaveCell() {
            this.setHoverPoint(null);
        }

        setRowStyle(row: any) {
            if (row.row.xxsw !== null && row.row.xxsw < row.row.sw) {
                return { background: "yellow" };
            }
        }
        sortBykey(column: any) {
            if (column.label == "移民水位可纳雨量") {
                if (this.sortKey != column.property) {
                    this.tbData.sort(compare(column.property));
                    this.sortKey = column.property;
                } else {
                    this.tbData.reverse();
                }
            }
        }
        locate(row: any) {
            this.getZoom(12);
            row.info = { ...row };
            this.getPoint(row);
            this.getCenter([row.jd, Number(row.wd + 0.08)]);
        }

        getMore() {
            const th = [
                { label: "库名", prop: "zm", fixed: "left", children: [] },
                {
                    label: this.currentDay + " 8:00",
                    prop: "",
                    children: [
                        { label: "水位", prop: "eightsw" },
                        { label: "蓄水量", prop: "eightxsl" },
                        { label: "移民水位可纳雨量", prop: "eightknyl" }
                    ]
                },
                {
                    label: this.current + ":00",
                    prop: "",
                    children: [
                        { label: "水位", prop: "sw" },
                        { label: "蓄水量", prop: "xsl" },
                        { label: "移民水位可纳雨量", prop: "knyl" }
                    ]
                },
                { label: "增蓄水量", prop: "zxsl", children: [] },
                { label: "汛限水位", prop: "xxsw", children: [] },
                { label: "集水面积", prop: "jsmj", children: [] },
                { label: "地市", prop: "city", children: [] }
            ];
            let tb: any = this.tbData;
            this.setTbList(tb);
            this.setTh(th);
            this.controlAllTableState(true);
            this.setTbTitle("水库报表");
        }

        created(): void {
            this.listHeight = parseInt(this.tbHeight) - 133;
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
