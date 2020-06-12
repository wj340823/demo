<template>
    <div class="editPlot">
        <div v-show="type!='point'">
            <i class="opIcon" :class="plotOl.open?'openIcon':'closeIcon'" @click="plotOl.open=!plotOl.open"></i>
        </div>
        <ul v-show="plotOl.open" :style="computedStyle">
            <li v-if="type!='line'&&type!='point'">
                <a title="填充颜色" class="font-color">
                    <i class="plot_fill"></i>
                </a>
                <suc-colorpicker title="填充颜色" v-model="colorData.fillColor" alpha @change="changeFill"/>
            </li>
            <li v-if="type!='point'">
                <a title="边框颜色" id="plotEditStroke">
                    <i class="plot_lineColor"></i>
                </a>
                <suc-colorpicker title="边框颜色" v-model="colorData.strokeColor" alpha @change="changeStroke"/>
            </li>
            <li v-if="type!='point'">
                <a title="边框样式" class="font-color" @click="styleOpen=!styleOpen">
                    <i class="plot_line"></i>
                </a>
                <div class="lineStyle" v-show="styleOpen">
                    <div>
                        <div>边框宽度：</div>
                        <suc-slider v-model="colorData.width" show-input show-stops :min="1" :max="10"
                                    @change="changeWidth"/>
                    </div>
                    <div>
                        <div>边框样式：</div>
                        <div class="lineSelect" :class="{active: colorData.lineStyle=='solid'}"
                             @click="changeLine('solid')">
                            <a></a>
                        </div>
                        <div class="lineSelect lineDash" :class="{active: colorData.lineStyle=='dashed'}"
                             @click="changeLine('dashed')">
                            <a></a>
                        </div>
                    </div>
                </div>
            </li>
            <li class="delLi">
                <a @click="del()" title="删除">
                    <i class="closeIcon">
                        <img src="../img/delete.png"/>
                    </i>
                </a>
            </li>
        </ul>
    </div>
</template>
<script>
    import sucColorpicker from "../components/colorpicker.vue";
    import sucSlider from "../components/slider.vue";

    export default {
        components: {
            sucColorpicker,
            sucSlider
        },
        props: {
            type: {
                type: String,
                default: "point"
            },
            data: {
                type: Object,
                default: function () {
                    return {
                        strokeColor: "#2058A5",
                        fillColor: "rgba(32, 88, 165, 0.4)",
                        width: 1,
                        lineStyle: "solid"
                    }
                }
            }
        },
        watch: {
            data: {
                handler(nval) {
                    const vm = this;
                    vm.colorData = nval;
                },
                deep: true
            }
        },
        data() {
            return {
                colorData: this.data,
                plotOl: {
                    open: true
                },
                styleOpen: false   //线条样式面板是否打开
            }
        },
        methods: {
            changeStroke(e) {
                this.$emit("change-stroke", e);
            },
            changeFill(e) {
                this.$emit("change-fill", e);
            },
            changeLine(flag) {  //改变线条虚实
                if (this.colorData.lineStyle == flag) {
                    return;
                }

                this.colorData.lineStyle = flag;
                this.$emit("change-line", flag);
            },
            changeWidth(e) {   //改变线条宽度
                this.$emit("change-width", e);
            },
            del() {
                this.$emit("delete", true);
            }
        },
        computed: {
            computedStyle() {
                if (this.type == "point") {
                    return {width: "35px"}
                } else if (this.category == "line") {
                    return {width: "135px", marginLeft: "20px"}
                }

                return {width: "180px", marginLeft: "20px"}
            }
        }
    }
</script>
<style lang="scss">
    .editPlot {
        position: absolute;
        top: 5px;
        user-select: none;
        .ivu-tooltip-rel {
            display: block;
        }
        .ivu-color-picker {
            position: absolute;
            top: 0;
            left: 0;
            .ivu-input-icon {
                display: none;
            }
            .ivu-input-icon-normal + .ivu-input {
                height: 35px;
                padding-right: 8px;
                opacity: 0;
                cursor: pointer;
            }
            .ivu-input {
                height: 24px;
            }
        }

        > div {
            float: left;
            margin-top: 8px;
            color: #2058A5;
            text-align: center;
            cursor: pointer;
        }
        ul {
            display: block;
            list-style: none;
            li {
                position: relative;
                float: left;
                margin-left: 10px;
                text-align: center;
                cursor: pointer;

                &.delLi a:hover {
                    background-color: #e5f3ff;
                }

                > a {
                    display: block;
                    width: 35px;
                    height: 35px;
                    padding: 0px;
                    border: 1px solid #eee;
                    border-radius: 2px;
                    background-color: white;
                    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.35);
                    &.font-color.active {
                        background-color: #e5f3ff;
                        border: 1px solid rgb(204, 232, 255);
                    }
                    i {
                        display: block;
                        width: 35px;
                        height: 35px;
                        // line-height: 35px;
                        opacity: 1;
                        font-size: 14px;
                    }
                }

                .lineStyle {
                    position: absolute;
                    top: 40px;
                    transform: translateX(-50%);
                    width: 300px;
                    padding: 10px;
                    background: white;
                    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.35);
                    border-radius: 4px;
                    > div {
                        text-align: left;
                        padding: 0 5px 0 5px;
                        &:first-child {
                            height: 60px;
                        }
                    }
                    .lineSelect {
                        height: 20px;
                        padding-top: 9px;
                        margin-top: 5px;
                        &:hover, &.active {
                            background: rgba(0, 0, 0, .1);
                        }
                        &.lineDash {
                            a {
                                border-style: dashed;
                            }
                        }
                        > a {
                            display: block;
                            width: 100%;
                            height: 2px;
                            border: 1px solid black;
                            box-shadow: none;
                        }
                    }
                }
            }
        }
        .opIcon {
            position: relative;
            display: inline-block;
            width: 20px;
            height: 20px;
            border-radius: 10px;
            background: #2058a5;
            color: #ffffff;
            font-size: 14px;
            &.openIcon:after {
                content: "-";
                position: absolute;
                top: 8px;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 24px;
            }
            &.closeIcon:after {
                content: "+";
                position: absolute;
                top: 9px;
                left: 50%;
                transform: translate(-50%, -50%);
                font-weight: bold;
            }
        }
        .closeIcon {
            line-height: 42px;
        }
    }
</style>
