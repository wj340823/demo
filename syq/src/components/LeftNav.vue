<template>
    <vue-perfect-scrollbar class="leftNav">
        <div v-for="(item, index) in leftMenu" :key="index">
            <div
                class="title"
                style="clear: both"
                v-if="userInfo.roles == 'super' || userInfo.roles == 'admin'"
            >
                <img :src="item.img" />
                <span>{{ item.title }}</span>
            </div>
            <div
                class="item-line"
                :class="{ true: 'act' }[child.active]"
                v-for="(child, i) in item.children"
                :key="i"
                @click="goto(child)"
                v-if="judgeRoles(child.show)"
            >
                <div class="radio" v-if="child.type == 'radio' && !child.active"></div>
                <div class="radio" v-if="child.type == 'radio' && child.active">
                    <span></span>
                </div>
                <div class="checkbox" v-if="child.type == 'checkbox' && !child.active"></div>
                <div class="checkbox" v-if="child.type == 'checkbox' && child.active">
                    <span></span>
                </div>
                <img :src="child.img" />
                <span
                    style="float: right;display: block;width: 120px;text-align: left"
                >{{ child.title }}</span>
            </div>
        </div>
    </vue-perfect-scrollbar>
</template>

<script lang="ts">
// 应该是四块 水雨情查询（实时降雨 水位 流量） 水雨情监测（降雨 水库 江河水位 水闸水位 航道封航水位监视） 水雨情分析（降雨分析，排频分析，供水分析）云图
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { State, Mutation } from "vuex-class";

@Component
export default class LeftNav extends Vue {
    @State("userInfo") userInfo: any;
    @Mutation setShowPage!: Function;
    @Mutation setHidePage!: Function;
    leftMenu = [
        {
            title: "水雨情专题",
            img: require("@/assets/left/syqzt.png"),
            children: [
                {
                    title: "水雨情简况",
                    url: "water-rain",
                    active: false,
                    img: require("@/assets/left/jcxx.png"),
                    type: "radio",
                    icon: "iconlujing14",
                    show: "public"
                },
                {
                    title: "监测信息",
                    url: "monitor-info",
                    active: false,
                    img: require("@/assets/left/jcxx.png"),
                    type: "radio",
                    icon: "iconlujing14",
                    show: "public"
                },
                {
                    title: "实时雨情",
                    url: "realtime-rain",
                    active: false,
                    img: require("@/assets/left/ssyq.png"),
                    type: "radio",
                    icon: "iconzu8",
                    show: "public"
                },
                {
                    title: "实时水情",
                    url: "realtime-water",
                    active: false,
                    img: require("@/assets/left/sssq.png"),
                    type: "radio",
                    icon: "iconlujing18",
                    show: "public"
                },
                {
                    title: "报汛流量",
                    url: "realtime-flow",
                    active: false,
                    img: require("@/assets/left/bxll.png"),
                    type: "radio",
                    icon: "iconlujing18",
                    show: "middle"
                }
            ]
        },
        {
            title: "预报预测专题",
            img: require("@/assets/left/yjzt.png"),
            children: [
                {
                    title: "预报展示",
                    url: "forecast-display",
                    active: false,
                    img: require("@/assets/left/ybzs.png"),
                    type: "radio",
                    icon: "iconlujing13",
                    show: "super"
                },
                {
                    title: "洪水预警",
                    url: "flood-warning",
                    active: false,
                    img: require("@/assets/left/hsyj.png"),
                    type: "radio",
                    icon: "iconlujing13",
                    show: "super"
                },
                {
                    title: "风暴潮",
                    url: "storm-surge",
                    active: false,
                    img: require("@/assets/left/fbc.png"),
                    type: "checkbox",
                    icon: "iconlujing13",
                    show: "super"
                }
            ]
        },
        {
            title: "对比分析专题",
            img: require("@/assets/left/dbfx.png"),
            children: [
                {
                    title: "降雨分析",
                    url: "rainfall-analysis",
                    active: false,
                    img: require("@/assets/left/jyfx.png"),
                    type: "radio",
                    icon: "iconlujing12",
                    show: "middle"
                },
                {
                    title: "洪水分析",
                    url: "flood-analysis",
                    active: false,
                    img: require("@/assets/left/hsfx.png"),
                    type: "radio",
                    icon: "iconlujing12",
                    show: "middle"
                },
                {
                    title: "定制面雨量",
                    //url:'',
                    url: "custom-rainfall",
                    active: false,
                    img: require("@/assets/left/dzmyl.png"),
                    type: "radio",
                    icon: "iconlujing23",
                    show: "super"
                },
                {
                    title: "极值分析",
                    //url:'',
                    url: "water-frequency",
                    active: false,
                    img: require("@/assets/left/swpp.png"),
                    type: "radio",
                    icon: "iconlujing23",
                    show: "public"
                },
                {
                    title: "面雨量排位",
                    url: "rainfall-frequency",
                    active: false,
                    img: require("@/assets/left/myl.png"),
                    type: "radio",
                    icon: "iconlujing23",
                    show: "super"
                },
                {
                    title: "土壤缺水量",
                    url: "solid-water-deficit",
                    active: false,
                    img: require("@/assets/left/trqs.png"),
                    type: "radio",
                    icon: "iconlujing13",
                    show: "super"
                }
            ]
        },
        {
            title: "气象专题",
            img: require("@/assets/left/qxzt.png"),
            children: [
                {
                    title: "卫星云图",
                    url: "satellite-images",
                    active: false,
                    img: require("@/assets/left/wx.png"),
                    type: "radio",
                    icon: "iconzu6",
                    show: "middle"
                },
                {
                    title: "气象雷达",
                    url: "weather-radar",
                    active: false,
                    img: require("@/assets/left/ld.png"),
                    type: "checkbox",
                    icon: "iconlujing20",
                    show: "middle"
                },
                {
                    title: "未来降雨",
                    url: "next-three-day",
                    active: false,
                    img: require("@/assets/left/wljy.png"),
                    type: "radio",
                    icon: "iconlujing13",
                    show: "middle"
                }
            ]
        }
    ];
    defautAct: string = "1-1";
    radio: string = "";
    judgeRoles(role: any) {
        if (this.userInfo.roles == "admin") {
            return true;
        } else if (this.userInfo.roles == "super") {
            return true;
        } else if (this.userInfo.roles == "middle") {
            if (role == "middle" || role == "public") {
                return true;
            } else {
                return false;
            }
        } else {
            if (role == "public") {
                return true;
            } else {
                return false;
            }
        }
    }
    goto(item: any) {
        if (item.url != "jctable") {
            if (item.type == "radio") {
                this.$router.push("/main/map/" + item.url);
            } else {
                if (item.active) {
                    this.setHidePage(item.title);
                } else {
                    this.setShowPage(item.title);
                }
                item.active = !item.active;
            }
            // this.$router.push("/main/map/" + item.url);
        } else {
            this.$router.push("/" + item.url);
        }
    }

    checkAct(val: string) {
        for (let i = 0; i < this.leftMenu.length; i++) {
            for (let j = 0; j < this.leftMenu[i].children.length; j++) {
                if (
                    this.leftMenu[i].children[j].url != "" &&
                    val.match(this.leftMenu[i].children[j].url)
                ) {
                    this.leftMenu[i].children[j].active = true;
                    this.radio = this.leftMenu[i].children[j].title;
                } else {
                    if (this.leftMenu[i].children[j].type == "radio") {
                        this.leftMenu[i].children[j].active = false;
                    }
                }
            }
        }
    }

    mounted() {
        this.checkAct(window.location.href);
    }

    @Watch("$route")
    changeRoute(to: any) {
        let activeNav: string = to.fullPath;
        this.checkAct(activeNav);
    }
}
</script>

<style scoped lang="scss">
.leftNav {
    text-align: center;
    height: 100%;
    min-height: 600px;
    .title {
        color: #ffffff;
        height: 40px;
        background-color: rgba(0, 0, 0, 0.15);
        font-size: 16px;
        font-weight: bold;
        line-height: 40px;
        padding-left: 12px;
        text-align: left;
        img {
            margin-right: 12px;
            vertical-align: middle;
            margin-top: -4px;
        }
    }
    .item-line {
        clear: both;
        color: #fff;
        text-align: left;
        padding-left: 24px;
        height: 30px;
        line-height: 30px;
        font-size: 14px;
        cursor: pointer;
        text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.05);
        font-weight: bold;
        .radio {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 1px solid #fff;
            margin-right: 8px;
            text-align: center;
            line-height: 12px;
            vertical-align: middle;
            span {
                display: inline-block;
                width: 6px;
                height: 6px;
                background-color: #fff;
                border-radius: 50%;
                margin-bottom: 3px;
            }
        }
        .checkbox {
            display: inline-block;
            width: 12px;
            height: 12px;
            border: 1px solid #fff;
            margin-right: 8px;
            text-align: center;
            line-height: 12px;
            vertical-align: middle;
            span {
                display: inline-block;
                width: 8px;
                height: 4px;
                border-left: 1px solid #fff;
                border-bottom: 1px solid #fff;
                margin-bottom: 5px;
                transform: rotate(315deg);
            }
        }
        img {
            margin-right: 8px;
            width: 16px;
            height: 16px;
            vertical-align: middle;
        }
        i {
            font-size: 14px;
            margin-right: 8px;
        }
    }
    .item-line.act {
        padding-left: 23px;
        background: url("../assets/left/act.png") no-repeat;
        background-position: bottom right;
        border: 1px solid #fff;
    }
}
</style>
