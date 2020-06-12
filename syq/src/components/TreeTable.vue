<template>
    <div class="table-con">
        <div style="height: 40px;margin-bottom: 4px;overflow: hidden">
            <div style="overflow-x: auto" id="title-container">
                <div class="th-title" :style="{ width: tbWidth + 10 + 'px' }">
                    <div
                        v-for="(item, index) in thlist"
                        :style="item.width ? { width: item.width + 'px' } : ''"
                        :key="index"
                        class="text-c"
                    >
                        {{ item.label }}
                    </div>
                </div>
            </div>
        </div>
        <div
            class="scroll-outer"
            :style="{ height: tbHeight + 'px' }"
            :key="tbHeight"
            v-if="visibleList.length"
        >
            <div class="loading-outer" v-if="loading">
                <img src="../assets/loading.gif" />
            </div>
            <virtual-list
                v-else
                :size="32"
                :remain="viewLength"
                class="tb-content"
                id="content-scroll"
                @scroll.native="scrollHandler"
                :style="{ height: heightMixin + 'px' }"
            >
                <div
                    v-for="(child, ins) in visibleList"
                    :key="ins"
                    class="line"
                    :class="{ selected: child.selected, odd: ins % 2 === 0 }"
                    :style="{ width: tbWidth + 'px' }"
                >
                    <template v-if="child.type != 'title'">
                        <div
                            v-for="(item, i) in thlist"
                            :key="i"
                            @click="locate(child, ins, child.type, item.value)"
                            @mouseenter="hoverLocate(child)"
                            @mouseleave="hoverLocate(null)"
                            :style="
                                item.width ? { width: item.width + 'px' } : ''
                            "
                            class="cell text-c"
                        >
                            <span
                                :title="
                                    item.value == 'name'
                                        ? child.name + child.info.zh
                                        : child[item.value]
                                "
                                >{{ child[item.value] }}</span
                            >
                        </div>
                    </template>
                    <div v-else>
                        <span class="sub" @click>
                            <img
                                :src="imgR"
                                v-show="!child.show"
                                @click="showIndex(child, true)"
                            />
                            <img
                                :src="imgB"
                                v-show="child.show"
                                @click="showIndex(child, false)"
                                style="margin-bottom: 3px"
                            />
                            <img
                                src="@/assets/rightCon/folder.png"
                                alt
                                class="folder"
                            />
                            {{ child.title }}
                        </span>
                    </div>
                </div>
            </virtual-list>
        </div>
        <div class="tb-main-fixed" v-if="!loading && xScroll">
            <div class="th-title" :style="{ width: tbWidth + 'px' }">
                <div
                    v-for="(item, index) in thlist"
                    :style="item.width ? { width: item.width + 'px' } : ''"
                    class="text-c"
                    :key="index"
                >
                    {{ item.label }}
                </div>
            </div>
            <virtual-list
                :size="32"
                :remain="viewLength"
                class="tb-content tb-content-fixed"
                id="tb-content-fixed"
                @scroll.native="scrollHandler"
                :style="{ height: heightMixin + 'px' }"
            >
                <div
                    v-for="(child, ins) in visibleList"
                    :key="ins"
                    class="line"
                    :class="{ selected: child.selected, odd: ins % 2 === 0 }"
                >
                    <template v-if="child.type != 'title'">
                        <div
                            v-for="(item, i) in thlist.slice(0, 3)"
                            :key="i"
                            @click="locate(child, ins, child.type, item.value)"
                            @mouseenter="hoverLocate(child)"
                            @mouseleave="hoverLocate(null)"
                            :style="
                                item.width ? { width: item.width + 'px' } : ''
                            "
                            class="cell text-c"
                        >
                            <span
                                :title="
                                    item.value == 'name'
                                        ? child.name + child.info.zh
                                        : child[item.value]
                                "
                                >{{ child[item.value] }}</span
                            >
                        </div>
                    </template>
                    <div v-else>
                        <span class="sub" @click>
                            <img
                                :src="imgR"
                                v-show="!child.show"
                                @click="showIndex(child, true)"
                            />
                            <img
                                :src="imgB"
                                v-show="child.show"
                                @click="showIndex(child, false)"
                                style="margin-bottom: 3px"
                            />
                            <img
                                src="@/assets/rightCon/folder.png"
                                alt
                                class="folder"
                            />
                            {{ child.title }}
                        </span>
                    </div>
                </div>
            </virtual-list>
        </div>
        <div
            style="position: absolute;top: 85px;left:0px;width:100%;text-align: center;vertical-align: middle"
            v-if="visibleList.length === 0"
        >
            {{ nodataShow }}
        </div>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import { State, Getter, Action, Mutation, namespace } from "vuex-class";
    import virtualList from "vue-virtual-scroll-list";
    import AutoHeightMixin from "../mixins/autoHeight";

    function addZone(n: any) {
        if (n < 10) {
            return "0" + n;
        } else {
            return n;
        }
    }

    @Component({
        components: { virtualList }
    })
    export default class TreeTable extends AutoHeightMixin {
        @Prop({
            default() {
                return 15;
            }
        })
        viewLength: any;
        @Prop() thList: any;
        @Prop() tbData: any;
        @Prop() kinds: any;
        @Prop() indexT: any;
        @Prop() loading: any;
        @Prop() timeType: any;
        @Prop() viewHeight: any;
        @Prop({ default: true }) xScroll!: boolean;
        @Mutation("setHoverPoint") setHoverPoint: any;
        @Mutation("getPoint") getPoint: any;
        @Mutation("getCenter") getCenter: any;
        @Mutation("getZoom") getZoom: any;
        @Mutation("getModals") getModals: any; //getSelectArea
        @Mutation("getSelectArea") getSelectArea: any;
        rowkey: string = "";
        tbWidth: number = 380;
        tableData: any = [];
        singleArr: any[] = [];
        current: number = Date.now();
        thlist: any[] = [];
        imgR: any = require("@/assets/rightCon/right_icon.png");
        imgB: any = require("@/assets/rightCon/bottom_icon.png");
        get tbHeight() {
            return document.body.clientHeight - this.viewHeight;
        }
        scrollInfo = {
            id: "",
            time: 0
        };
        nodataShow: string = "";

        created() {
            this.autoHeightMixin(472);
            this.thlist = this.thList;
            this.rowkey = this.thList[1].value;
        }

        scrollHandler(e: { target: HTMLElement }) {
            let now = new Date().getTime();
            let left = e.target.scrollLeft;
            if (
                this.scrollInfo.id !== e.target.id &&
                now - this.scrollInfo.time < 500
            ) {
                return;
            }
            let ele = document.getElementById("title-container");
            if (ele) {
                ele.scrollLeft = left;
            }

            let ele2 = document.getElementById("tb-content-fixed");
            if (ele2) {
                ele2.scrollTop = e.target.scrollTop;
            }

            let ele3 = document.getElementById("content-scroll");
            if (ele3) {
                ele3.scrollTop = e.target.scrollTop;
            }

            this.scrollInfo.id = e.target.id;
            this.scrollInfo.time = now;
        }

        changeTbData(arr: any) {
            const vm = this;
            if (JSON.stringify(arr) !== "{}") {
                this.tableData = [];
                for (let i = 0, j = 0; i < this.kinds.length; i++) {
                    if (
                        arr[this.kinds[i].value] != undefined &&
                        arr[this.kinds[i].value].length > 0
                    ) {
                        this.tableData[j] = {};
                        this.tableData[j].title =
                            this.kinds[i].label +
                            " (" +
                            arr[this.kinds[i].value].length +
                            ")个";
                        this.tableData[j].children = arr[this.kinds[i].value];
                        this.tableData[j].show = true;
                        this.tableData[j].index = this.kinds[i].index;
                        j++;
                    }
                }
                let arrArray: any = [];
                let pointArr: any = [];
                this.tableData.forEach(function(item: any) {
                    arrArray.push({
                        title: item.title,
                        type: "title",
                        show: true
                    });
                    item.children.forEach(function(sing: any) {
                        let target = JSON.parse(JSON.stringify(sing));
                        pointArr.push(sing);
                        target.show = true;
                        target.titleChild = item.title;
                        arrArray.push(
                            Object.assign({}, target, {
                                show: true,
                                selected: false
                            })
                        );
                    });
                });
                this.$emit("getPoints", pointArr);
                this.singleArr = arrArray;
                if (arrArray.length == 0) {
                    let currentHour =
                        new Date().getFullYear() +
                        "-" +
                        addZone(new Date().getMonth() + 1) +
                        "-" +
                        addZone(new Date().getDate()) +
                        " " +
                        addZone(new Date().getHours()) +
                        ":0000";
                    if (
                        Date.now() - new Date(currentHour).getTime() >
                        5 * 60000
                    ) {
                        this.nodataShow = "暂无数据";
                    } else {
                        if (this.thList.length > 4) {
                            this.nodataShow = "暂无数据";
                        } else if (this.timeType == "0") {
                            this.nodataShow =
                                "当前小时内数据设定在15分入库，请稍后查询";
                        } else if (this.timeType == "1") {
                            this.nodataShow =
                                new Date().getHours() +
                                "时雨量设定在" +
                                new Date().getHours() +
                                "时5分计算，请稍后查询";
                        }
                    }
                }
            } else {
                this.tableData = [];
            }
            this.current = Date.now();
        }

        showIndex(child: any, type: boolean) {
            /*this.tableData[index].show = !this.tableData[index].show
                    this.current = Date.now()*/
            if (type) {
                this.singleArr.forEach(function(item: any) {
                    if (item.titleChild && item.titleChild == child.title) {
                        item.show = true;
                    }
                });
                //this.changeTbData(this.tbData);
            } else {
                this.singleArr.forEach(function(item: any) {
                    if (item.titleChild && item.titleChild == child.title) {
                        item.show = false;
                    }
                });
                // this.singleArr = this.singleArr.slice(0,1);
            }
            child.show = !child.show;
        }

        get visibleList() {
            return this.singleArr.filter(
                (item: any) => item.show || item.type === "title"
            );
        }

        locate(point: any, i: number, type: any, name: string) {
            if (type != "title") {
                if (name == "name") {
                    this.getZoom(12);
                    this.singleArr.forEach(function(item: any) {
                        item.selected = false;
                    });
                    this.singleArr[i].selected = true;
                    this.current = Date.now();
                    this.getPoint(point);
                    this.getCenter([point.lon, Number(point.lat + 0.08)]);
                }
                if (name == "city") {
                    this.getSelectArea(point.counties + 1);
                }
            }
        }
        hoverLocate(item: any) {
            this.setHoverPoint(item);
        }
        @Watch("kinds", { deep: true })
        changeThList(n: any) {
            this.changeTbData(this.tbData);
        }

        @Watch("timeType")
        changeTimeType() {
            /*if (this.timeType != "zdy") {
                this.autoHeightMixin(440);
            } else {
                this.autoHeightMixin(500);
            }*/
            console.log(this.timeType);
        }
        @Watch("tbData", { deep: true })
        changeIndex(n: any, o: any) {
            if (n && JSON.stringify(n) != JSON.stringify(o)) {
                this.changeTbData(this.tbData);
                let i: any = 0;
                this.thList.forEach((item: any) => {
                    if (item.width) {
                        i += Number(item.width);
                    } else {
                        i += 90;
                    }
                });
                this.tbWidth = i + 2;
            }
        }
    }
</script>

<style lang="scss" scoped>
    .table-con {
        position: relative;
        // overflow: hidden;
        text-align: left;

        .el-table__indent {
            padding: 0 !important;
        }

        .text-r {
            text-align: right;
        }

        .text-c {
            text-align: center;
        }

        .th-title {
            width: 100%;
            height: 40px;
            background-color: #eee;
            margin-bottom: 4px;
            overflow: hidden;

            div {
                padding: 9px 5px;
                width: 90px;
                float: left;
                font-weight: bold;
                text-align: center;
            }
            .w50 {
                width: 50px;
            }
        }

        .tb-main-fixed {
            position: absolute;
            top: 0;
            left: 0;
            width: 230px;
            background: white;
            overflow: hidden;
        }

        .scroll-outer {
            position: relative;

            .loading-outer {
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.75);
                z-index: 1;

                img {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 200px;
                    transform: translate(-50%, -50%);
                }
            }
        }

        .tb-content {
            width: 100%;
            height: 450px;
            overflow: auto;

            &.tb-content-fixed {
                width: 260px;
            }

            .singItem {
                transition: all 0.5s;
                overflow: hidden;
            }

            & > div {
                clear: both;
            }

            .line {
                clear: both;
                height: 32px;
                cursor: pointer;
                position: relative;
                background: white;
                border: 1px solid transparent;
            }

            .selected {
                background-color: rgba(51, 178, 255, 0.1);
                border-radius: 4px;
                border: 1px solid rgb(51, 178, 255);
            }

            .line.odd {
                background-color: #efefef;
            }

            .sub {
                display: inline-block;
                width: 100%;
                line-height: 32px;
                color: green;
                font-weight: bold;
                padding-left: 5px;
                cursor: pointer;
                user-select: none;
                /*background-color: #efefef;*/
                .folder {
                    margin: 0 10px;
                }
            }

            .cell {
                padding: 5px;
                width: 90px;
                float: left;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                /*border: 1px solid #eee;
                        border-collapse: collapse;*/
            }
        }
    }

    /*设置倒数第一个 固定*/
    /*.singItem>div>div:last-child {*/
    /*text-align: right;*/
    /*position: fixed;*/
    /*right: 0;*/
    /*z-index: 2;*/
    /*}*/
</style>
