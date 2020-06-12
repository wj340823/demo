<template>
    <div class="movelabel">
        <div
            class="title"
            :title="dataInfo.info.zm"
            :style="{ 'background-color': bgColor }"
        >
            <i class="iconfont iconzu5"></i>
            {{ dataInfo.info.zm + "(" + dataInfo.info.zh + ")" }}
        </div>
        <div style="line-height: 40px" v-if="dataInfo.info.yl != undefined">
            <span>{{ markerName }}(mm)</span>
            <span class="mark" :style="{ color: bgColor }">{{
                dataInfo.info.yl
            }}</span>
        </div>
        <div v-if="dataInfo.info.sw != undefined">
            <div style="width: 100px;float: left">
                <span>{{ markerName }}(m)</span><br />
                <span>{{ reportTime }}</span>
            </div>
            <span class="mark" :style="{ color: bgColor }">{{
                dataInfo.info.sw
            }}</span>
        </div>
        <div style="clear: both"></div>
    </div>
</template>

<script lang="ts">
    const colorArr: any = {
        "rain_null.png": {
            color: "#848484",
            text: "雨量"
        },
        "rain_0.png": {
            color: "#4fe176",
            text: "雨量"
        },
        "rain_10.png": {
            color: "#3e7be4",

            text: "雨量"
        },
        "rain_25.png": {
            color: "#f2ca46",
            text: "雨量"
        },
        "rain_50.png": {
            color: "#e275df",
            text: "雨量"
        },
        "rain_100.png": {
            color: "#ff6868",
            text: "雨量"
        },
        "rain_250.png": {
            color: "#474848",
            text: "雨量"
        },
        "water_bzz.png": {
            color: "#ff6868",
            text: "超保证"
        },
        "water_jjz.png": {
            color: "#f2ca46",
            text: "超警戒"
        },
        "water_nz.png": {
            color: "#4fe176",
            text: "正常"
        },
        "water_xx.png": {
            color: "#f2ca46",
            text: "超汛限"
        }
    };
    import { Vue, Component, Prop } from "vue-property-decorator";

    @Component
    export default class MoveLabel extends Vue {
        @Prop() dataInfo: any;
        bgColor: any = "#4fe176";
        markerName: string = "";
        reportTime: any = null;
        modal: any = {};
        checkRoute(route: string) {
            for (let key in colorArr) {
                if (route == key) {
                }
            }
        }
        created() {
            //this.checkRoute(this.$route.fullPath.slice(-4))
            if (this.dataInfo.info.sbsj) {
                this.reportTime = this.$utils.dateFormat(
                    new Date(this.dataInfo.info.sbsj),
                    "MM-dd HH:mm"
                );
            }
            for (let colorArrKey in colorArr) {
                if (colorArrKey == this.dataInfo.info.img) {
                    this.bgColor = colorArr[colorArrKey].color;
                    this.markerName = colorArr[colorArrKey].text;
                    return;
                } else {
                }
            }
            /*if(this.dataInfo.info.yl){
                this.dataInfo.info.yl = Number(this.dataInfo.info.yl).toFixed(1)
            }*/
        }
    }
</script>

<style scoped lang="scss">
    .movelabel {
        width: 200px;
        background-color: #ffffff;
        border-radius: 4px;
        padding: 8px;
        font-size: 14px;
        .title {
            padding: 5px;
            color: #fff;
            height: 31px;
            line-height: 21px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            margin-bottom: 10px;
            i {
                font-size: 14px;
                margin-right: 8px;
            }
        }
        .mark {
            float: right;
            font-size: 24px;
            line-height: 40px;
        }
    }
</style>
