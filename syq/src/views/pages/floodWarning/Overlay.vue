<template>
    <div style="background-color: white; padding:  10px">
        <div class="titles" :title="flood.layer.data.info.WRTITLE">
            {{ flood.layer.data.info.WRTITLE }}
            <span @click="flood.layer.visible = false">
                <i class="iconfont iconxingzhuang"></i>
            </span>
        </div>
        <div style="vertical-align: bottom">
            <img
                :src="imgUrl"
                alt=""
                style="float: left;margin-right: 10px"
                v-if="flood.layer.data.info.WRTITLE.match('解除') == null"
            />
            <img
                src="@/assets/flood/relieve_l.png"
                alt=""
                style="float: left;margin-right: 10px"
                v-if="flood.layer.data.info.WRTITLE.match('解除') !== null"
            />
            <span style="font-size: 15px">
                {{ flood.layer.data.info.WRDETAIL }}
            </span>
        </div>
        <div style="clear: both;height:5px"></div>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Watch } from "vue-property-decorator";
    import { State, Mutation } from "vuex-class";

    @Component
    export default class Overlay extends Vue {
        @State("flood") flood: any;
        imgUrl: any = "";
        imgList: any = {
            blue: "blue_l",
            yellow: "yellow_l",
            Yellow: "yellow_l",
            orange: "orange_l",
            Red: "red_l"
        };
        @Watch("flood.layer", { deep: true })
        changeModalStatus(n: any) {
            if (n) {
                this.imgUrl = require("@/assets/flood/" +
                    this.imgList[this.flood.layer.data.info.WRLEVEL] +
                    ".png");
            }
        }
        created() {
            console.log(1);
            this.imgUrl = require("@/assets/flood/" +
                this.imgList[this.flood.layer.data.info.WRLEVEL] +
                ".png");
        }
    }
</script>

<style scoped lang="scss">
    .titles {
        line-height: 40px;
        font-size: 16px;
        font-weight: bold;
        color: #333;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: calc(100% - 60px);
        span {
            position: absolute;
            right: 10px;
            i {
                font-size: 14px;
            }
        }
    }
    img {
        width: 74px;
    }
</style>
