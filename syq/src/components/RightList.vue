<template>
    <router-view
        @closeRight="close"
        @getPoints="sendMarkers"
        @floodPoints="sendFloodPoints"
        @alarmOpen="sendAlarm"
        :viewHeight="rightListHright"
        :style="{ height: height + 'px' }"
    />
</template>

<script lang="ts">
    import { Vue, Component, Watch } from "vue-property-decorator";
    import { State } from "vuex-class";

    @Component
    export default class RightList extends Vue {
        @State(state => state.userInfo.roles) roles!: string;

        rightListHright: number = 0;
        height: number = 0;

        @Watch("roles")
        handleRoleChange() {
            this.roles === "middle"
                ? this.handleAdaptiveHeight(50)
                : this.handleAdaptiveHeight(130);
        }

        created() {
            this.roles === "middle"
                ? this.handleAdaptiveHeight(50)
                : this.handleAdaptiveHeight(130);
        }

        // 自适应高度的处理
        handleAdaptiveHeight(minusHeight: number) {
            window.removeEventListener("autoHeight", () => {
                this.height = window.innerHeight - minusHeight;
            });
            window.removeEventListener("resize", () => {
                window.dispatchEvent(event);
            });

            const event = new Event("adaptiveHeight");
            window.addEventListener("adaptiveHeight", () => {
                this.height = window.innerHeight - minusHeight;
            });
            window.addEventListener("resize", () => {
                window.dispatchEvent(event);
            });
            window.dispatchEvent(event);
        }

        close() {
            this.$emit("closeRight");
        }

        sendMarkers(data: any) {
            this.$emit("getMarkers", data);
        }

        sendFloodPoints(data: any) {
            this.$emit("sendFloodPoints", data);
        }

        sendAlarm() {
            this.$emit("getAlarm");
        }
    }
</script>
