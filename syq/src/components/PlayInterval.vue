<template>
    <div class="component">
        <span>播放（秒）：</span>
        <el-select
            style="width: 60px"
            v-model="intervalNum"
            @change="handleChangeInterval"
        >
            <el-option value="1">1</el-option>
            <el-option value="2">2</el-option>
            <el-option value="3">3</el-option>
            <el-option value="5">5</el-option>
            <el-option value="8">8</el-option>
        </el-select>
        <img
            src="@/assets/play.png"
            alt="播放"
            v-if="!play.isPlaying"
            @click="handlePlay"
        />
        <img src="@/assets/stop.png" alt="暂停" v-else @click="handlePlay" />
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from "vue-property-decorator";

    @Component
    export default class PlayInterval extends Vue {
        @Prop({ type: Number, default: 1 }) intervalNum!: number;
        private play: any = {
            isPlaying: false,
            interval: 1
        };

        // 播放与暂停
        private handlePlay(status: boolean): void {
            this.play.isPlaying = !this.play.isPlaying;
            this.$emit("changeStatus", this.play.isPlaying);
        }

        // 上传更改时间事件
        private handleChangeInterval(): void {
            this.play.isPlaying = true;
            this.$emit("changeStatus", this.play.isPlaying);
            this.$emit("changeInterval", this.intervalNum);
        }
    }
</script>

<style lang="scss" scoped>
    .component {
        display: inline-block;
        margin-left: 10px;
        width: 200px;

        img {
            position: relative;
            top: 5px;
            margin-left: 10px;
            cursor: pointer;
        }
    }
</style>
