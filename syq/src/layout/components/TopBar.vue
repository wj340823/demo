<template>
    <div class="header_bar" style="color: #fff">
        <AlarmAudio v-if="alarmAudioShow" />
        <div class="logo">
            <!--<img src="@/assets/login/logo.png" />-->
            <!--<img src="@/assets/logoImg.png" />-->
            <!--<img src="@/assets/logoText.png" />-->
        </div>
        <ul class="topMenu">
            <li @click="gotoTable">
                <img :src="img.monitor" alt />
                <br />
                <span>表格监测</span>
            </li>
            <li v-popover:question>
                <img :src="img.qa" alt />
                <br />
                <span>QA</span>
            </li>
            <li v-popover:location>
                <img :src="img.locate" alt />
                <br />
                <span>定位</span>
            </li>
            <li v-popover:draw>
                <img :src="img.paint" alt />
                <br />
                <span>画笔</span>
            </li>
            <li @click="handleMeasureStatusMutation">
                <img :src="img.measure" alt />
                <br />
                <span>测距</span>
            </li>
            <li @click="handleClickLogin" v-if="userInfo.roles == 'public'">
                <img :src="img.login" width="23" height="20" alt />
                <br />
                <span>登录</span>
            </li>
            <li v-if="userInfo.roles && !(userInfo.roles == 'public')">
                <span style="line-height: 30px" :title="userInfo.name">{{
                    userInfo.name
                }}</span
                ><br />
                <span @click="logout()">注销</span>
            </li>
        </ul>

        <el-popover
            ref="location"
            placement="bottom"
            width="475"
            trigger="click"
        >
            <p>行政区</p>
            <hr />
            <ul class="popover" @click="handleClickLI">
                <li
                    v-for="region in data.regions.slice(0, 4)"
                    :key="region"
                    :class="region === data.active ? 'active' : ''"
                >
                    {{ region }}
                </li>
                <li style="width: 220px"></li>
                <li
                    v-for="region in data.regions.slice(4)"
                    :key="region"
                    :class="region === data.active ? 'active' : ''"
                >
                    {{ region }}
                </li>
            </ul>
            <p style="margin-top: 10px;">流域</p>
            <hr />
            <ul class="popover" @click="handleClickLI">
                <li
                    v-for="river in data.rivers"
                    :key="river"
                    :class="river === data.active ? 'active' : ''"
                >
                    {{ river }}
                </li>
            </ul>
        </el-popover>
        <el-popover
            ref="question"
            placement="bottom"
            width="290"
            trigger="click"
        >
            <p>
                chrome有报警弹框无声音请在地址栏输入<a
                    target="_blank"
                    href="chrome://settings/content/sound"
                    >chrome://settings/content/sound</a
                >，允许添加地址http://sqfb.zjsq.net.cn:8089/
            </p>
        </el-popover>
        <el-popover
            ref="draw"
            placement="bottom"
            width="475"
            trigger="click"
            @click.native="handleClickDraw"
        >
            <el-row class="draw">
                <el-col :span="2">
                    <span>点标</span>
                </el-col>
                <el-col :span="22">
                    <el-button size="small">点</el-button>
                </el-col>
            </el-row>
            <el-row class="draw">
                <el-col :span="2">
                    <span>线标</span>
                </el-col>
                <el-col :span="22">
                    <el-button
                        size="small"
                        v-for="item in draw.line"
                        :key="item.label"
                        @click="handleClickDraw(item.value)"
                        >{{ item.label }}</el-button
                    >
                </el-col>
            </el-row>
            <el-row class="draw">
                <el-col :span="2">
                    <span>面标</span>
                </el-col>
                <el-col :span="22">
                    <el-button
                        size="small"
                        v-for="item in draw.face"
                        :key="item.label"
                        @click="handleClickDraw(item.value)"
                        :style="item.label === '矩形' ? 'margin-left: 0' : ''"
                        >{{ item.label }}</el-button
                    >
                </el-col>
            </el-row>
            <el-row class="draw">
                <el-col :span="2">
                    <span>箭头</span>
                </el-col>
                <el-col :span="22">
                    <el-button
                        size="small"
                        v-for="item in draw.arrow"
                        :key="item.label"
                        @click="handleClickDraw(item.value)"
                        :style="
                            item.label === '进攻方向（尾）'
                                ? 'margin-left: 0'
                                : ''
                        "
                        >{{ item.label }}</el-button
                    >
                    <el-button
                        @click="updatePlotResetMutation"
                        size="small"
                        type="danger"
                        style="margin-left: 0"
                        >删除图层</el-button
                    >
                </el-col>
            </el-row>
        </el-popover>
        <transition name="fade">
            <Login
                :loginVisible.sync="loginVisible"
                :loginButtonVisible.sync="loginButtonVisible"
                v-if="loginVisible"
            />
        </transition>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Watch } from "vue-property-decorator";
    import { Mutation, State, Action } from "vuex-class";
    import { Menu, MenuItem, Icon } from "iview";
    import store from "../../stores";
    import AlarmAudio from "@/components/AlarmAudio.vue";
    import Login from "./Login.vue";
    import locate from "@/assets/nav/locate.png";
    import measure from "@/assets/nav/measure.png";
    import monitor from "@/assets/nav/monitor.png";
    import paint from "@/assets/nav/paint.png";
    import login from "@/assets/nav/login.png";
    import qa from "@/assets/nav/qa.png";

    //@ts-ignore
    const Submenu = (Menu as any).Sub;

    const regions = [
        "浙江省",
        "安徽省",
        "江苏省",
        "上海市",
        "杭州市",
        "宁波市",
        "温州市",
        "嘉兴市",
        "绍兴市",
        "湖州市",
        "台州市",
        "金华市",
        "衢州市",
        "丽水市",
        "舟山市"
    ];
    const rivers = [
        "钱塘江",
        "苕溪",
        "运河",
        "甬江",
        "椒江",
        "瓯江",
        "飞云江",
        "鳌江",
        "太湖"
    ];

    const line = [
        {
            value: "ARC",
            label: "弧线"
        },
        {
            value: "CURVE",
            label: "曲线"
        },
        {
            value: "POLYLINE",
            label: "折线"
        },
        {
            value: "FREEHAND_LINE",
            label: "自由线"
        }
    ];
    const face = [
        {
            value: "CIRCLE",
            label: "圆"
        },
        {
            value: "ELLIPSE",
            label: "椭圆"
        },
        {
            value: "LUNE",
            label: "弓形"
        },
        {
            value: "SECTOR",
            label: "扇形"
        },
        {
            value: "CLOSED_CURVE",
            label: "曲线面"
        },
        {
            value: "POLYGON",
            label: "多边形"
        },
        {
            value: "RECTANGLE",
            label: "矩形"
        },
        {
            value: "FREEHAND_POLYGON",
            label: "自由面"
        },
        {
            value: "GATHERING_PLACE",
            label: "聚集地"
        }
    ];
    const arrow = [
        {
            value: "DOUBLE_ARROW",
            label: "钳击"
        },
        {
            value: "STRAIGHT_ARROW",
            label: "直箭头"
        },
        {
            value: "FINE_ARROW",
            label: "细直箭头"
        },
        {
            value: "ASSAULT_DIRECTION",
            label: "突击方向"
        },
        {
            value: "ATTACK_ARROW",
            label: "进攻方向"
        },
        {
            value: "TAILED_ATTACK_ARROW",
            label: "进攻方向（尾）"
        },
        {
            value: "SQUAD_COMBAT",
            label: "分队战斗行动"
        },
        {
            value: "TAILED_SQUAD_COMBAT",
            label: "分队战斗行动（尾）"
        }
    ];

    @Component({
        components: {
            Menu,
            MenuItem,
            Submenu,
            Icon,
            AlarmAudio,
            Login,
            qa
        }
    })
    export default class topBar extends Vue {
        @State alarmResult!: any;
        @State alarmAudioShow!: any;
        @State("userInfo") userInfo: any;
        @State("loginStatus") loginStatus: any;
        @Mutation changeLoginStatus: any;
        @Mutation("getUserInfo") getUserInfo: any;
        @Mutation("getCenter") setCetner!: Function;
        @Mutation("getZoom") setZoom!: Function;
        @Mutation("getSelectArea") getSelectArea!: Function;
        @Mutation("updatePlotType") updatePlotTypeMutation!: Function;
        @Mutation("updatePlotReset") updatePlotResetMutation!: Function;
        @Mutation setAlarmResultLoading!: Function;
        @Mutation setAlarmSearchShow!: Function;
        @Mutation openAlarmAudio!: Function;
        @Mutation closeAlarmAudio!: Function;
        @Mutation openAlarmDialog!: Function;
        @Mutation("handleMeasureStatus") handleMeasureStatusMutation!: Function;
        @Action initAlarmResult!: Function;

        alarmInterval: number = 10 * 100;
        data: any = {
            regions,
            rivers,
            active: "",
            selected: "点"
        };
        map: any = this.$getMapConfig();
        draw: any = {
            line,
            face,
            arrow
        };
        loginVisible: boolean = false;
        loginButtonVisible: boolean = true;
        img: any = {
            locate,
            measure,
            monitor,
            paint,
            login,
            qa
        };

        handleClickMenu({ target }: any) {
            const text = target.innerText.trim();

            if (text === "表格监测") {
                this.$router.push("/jctable");
            }
        }

        gotoTable() {
            this.$router.push("/jctable");
        }

        // 点击定位
        handleClickLI({ target }: any) {
            this.data.active = target.innerText.trim();
            this.data.rivers.forEach((item: any) => {
                if (item == this.data.active) {
                    this.getSelectArea(this.data.active + 2);
                }
            });
            this.data.regions.forEach((item: any) => {
                if (item == this.data.active) {
                    this.getSelectArea(this.data.active + 0);
                }
            });
        }

        // 点击标绘
        handleClickDraw(value: string) {
            this.updatePlotTypeMutation(value);
        }

        // 点击登录按钮
        handleClickLogin(): void {
            this.loginVisible = true;
        }

        logout() {
            this.$http
                .get("/logout")
                .then(res => {
                    this.getUserInfo({
                        account: "",
                        roles: "public",
                        name: ""
                    });
                    this.$router.push("/main/map/monitor-info");
                })
                .catch(err => {
                    this.$router.go(0);
                });
        }

        startListenAlarm() {
            this.setAlarmSearchShow(true);
            this.initAlarmResult().then(() => {
                this.setAlarmResultLoading(false);
            });
            setInterval(() => {
                this.setAlarmSearchShow(true);
                this.initAlarmResult().then(() => {
                    this.setAlarmResultLoading(false);
                });
            }, this.alarmInterval);
        }

        @Watch("alarmResult.gsxxFilter", { deep: true })
        watchAlarm(n: any, o: any) {
            n.forEach((item: any, index: number) => {
                if (index == 0 && item.list.length) {
                    let alarmed = true;
                    for (let i = 0; i < item.list.length; i++) {
                        if (item.list[i].alarmed == undefined) {
                            item.list[i].alarmed = true;
                            alarmed = false;
                        }
                    }
                    if (!alarmed) {
                        this.openAlarmAudio();
                        this.openAlarmDialog();
                    }
                }
                if (index == 1) {
                    item.list.forEach((list: any) => {
                        let alarmed = true;
                        for (let i = 0; i < list.list.length; i++) {
                            if (
                                list.list[i].alarmed == undefined ||
                                !list.list[i].alarmed
                            ) {
                                list.list[i].alarmed = true;
                                alarmed = false;
                            }
                        }
                        if (!alarmed) {
                            if (this.$route.fullPath.match("monitor-info")) {
                                this.$router.push("blank");
                            } else {
                                this.$router.push({
                                    path: "monitor-info",
                                    query: { index: "3" }
                                });
                            }
                            this.openAlarmAudio();
                            this.openAlarmDialog();
                        }
                    });
                }
            });
        }

        /*@Watch('userInfo')
        changeUserInfo(n:any){
            if(n){
                this.changeLoginStatus(true)
            }else {
                this.changeLoginStatus(false)
            }
        }*/
        mounted() {
            const mapConfig: any = this.$getMapConfig();
            this.alarmInterval = mapConfig.alarmInterVal;
            this.startListenAlarm();
            if (this.userInfo) {
                this.changeLoginStatus(true);
            } else {
                this.changeLoginStatus(false);
            }
        }
    }
</script>

<style lang="scss">
    // 动画
    .fade-enter-active,
    .fade-leave-active {
        transform: scale(1);
    }

    .fade-enter,
    .fade-leave-to {
        transform: scale(0.9);
        opacity: 0;
        background: transparent;
    }

    .logo {
        margin-top: 6px;
        margin-left: 24px;
        margin-bottom: -2px;
        float: left;
    }
    .top-title {
        line-height: 20px;
        text-align: center;
    }
    .topMenu {
        float: right;
        list-style: none;
        text-align: center;
        li {
            font-size: 16px;
            font-weight: bold;
            float: left;
            padding: 14px 32px;
            cursor: pointer;
            max-width: 130px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            span {
                line-height: 32px;
            }
        }
    }
    .ivu-menu-horizontal.ivu-menu-light:after {
        display: none !important;
    }
    .ivu-menu-light.ivu-menu-horizontal .ivu-menu-item,
    .ivu-menu-light.ivu-menu-horizontal .ivu-menu-submenu {
        color: rgba(#fff, 0.9) !important;
    }
    .ivu-menu-light {
        background-color: rgba(0, 0, 0, 0) !important;
    }
    .ivu-menu-light.ivu-menu-horizontal .ivu-menu-submenu:hover {
        color: #fff !important;
        border-bottom: 2px solid #fff !important;
    }
    .ivu-menu-light.ivu-menu-horizontal .ivu-menu-drop-list .ivu-menu-item {
        color: #515a6e !important;
    }
    .ivu-menu-light.ivu-menu-horizontal .ivu-menu-item-active {
        color: #fff !important;
        border-bottom: 2px solid #fff !important;
    }
    .ivu-menu-light.ivu-menu-horizontal
        .ivu-menu-submenu
        .ivu-menu-item-active {
        color: #515a6e !important;
    }
    //.ivu-menu-submenu
    /*.ivu-menu-light.ivu-menu-horizontal .ivu-menu-submenu:hover{

                                                                                                                    }
                                                                                                                */
    .ivu-menu-drop-list .ivu-menu-item {
        //color: #515a6e !important;
        padding: 0 !important;
        span {
            display: inline-block;
            width: 100%;
            height: 100%;
            padding: 7px 16px 8px;
        }
    }

    p {
        font-weight: 700;
    }

    hr {
        margin: {
            top: 10px;
            bottom: 10px;
        }
        border: none;
        height: 1px;
        background: linear-gradient(
            to right,
            rgba(0, 0, 0, 0.2),
            rgba(0, 0, 0, 0.05)
        );
    }

    .popover {
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        list-style-type: none;

        li {
            width: 56px;
            margin-bottom: 6px;
            color: rgba(0, 0, 0, 0.5);
            padding: {
                left: 5px;
                right: 5px;
            }
            cursor: pointer;
            transition: all 0.2s ease-in-out;

            &:hover {
                color: #57a3f3;
            }

            &.active {
                color: #57a3f3;
                font-weight: 700;
                text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
            }
        }
    }

    .draw {
        margin-bottom: 10px;

        .el-col-2 {
            line-height: 33px;
        }

        .el-col-22 {
            button {
                margin-bottom: 6px;
            }
        }

        &:last-of-type {
            margin-bottom: 0;
        }
    }
</style>
