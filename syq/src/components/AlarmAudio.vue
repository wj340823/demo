<template>
    <div class="audio-pannel">
        <audio :src="src" ref="alarmAudio" preload muted></audio>
        <button ref="playBtn"></button>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import { State, Mutation } from "vuex-class";
    @Component
    export default class AudioPlayer extends Vue {
        @Prop({ type: String, default: "/Alarm.mp3" }) src!: string;
        @Prop({ type: Boolean, default: true }) auto!: boolean;
        player: any = null;
        private init() {
            const playBtn: any = this.$refs.playBtn;
            this.player = this.$refs.alarmAudio;
            this.player.loop = true;
            playBtn.addEventListener("click", () => {
                setTimeout(() => {
                    this.play();
                    this.player.muted = false;
                }, 1000);
            });
        }
        public play() {
            this.player.play();
            setTimeout(() => {
                this.player.play();
            }, 100);
        }
        public stop() {
            this.player.stop();
        }
        public pause() {
            this.player.pause();
        }
        private mounted() {
            this.init();
            if (this.auto) {
                setTimeout(() => {
                    const playBtn: any = this.$refs.playBtn;
                    playBtn.click();
                }, 100);
            }
        }
    }
</script>

<style lang="scss" scoped>
    .audio-pannel {
        display: none;
    }
</style>
