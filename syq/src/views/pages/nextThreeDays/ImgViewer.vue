<template>
    <div class="component" id="img-viewer" v-drag>
        <header>
            <p>短期/短临天气预报</p>
            <i class="el-icon-close" @click="handleClose" />
        </header>
        <main>
            <p>{{ img.time }}</p>
            <el-row class="controls">
                <el-select
                    size="small"
                    v-model="options.selected"
                    @change="handleInitial"
                >
                    <el-option label="短期预报" value="shortPeriod" />
                    <el-option label="短临预报" value="shortPro" />
                </el-select>
                <!-- <el-progress
					:percentage="options.progress"
					:show-text="false"
				/> -->
            </el-row>
            <el-row class="img-view">
                <img
                    class="control"
                    :src="img.pre"
                    @click="handleSwitch('pre')"
                />
                <img :src="img.src" />
                <img
                    class="control"
                    :src="img.next"
                    @click="handleSwitch('next')"
                />
            </el-row>
        </main>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import pre from "@/assets/imgViewer/pre.png";
    import next from "@/assets/imgViewer/next.png";

    const URL = "http://www.zjsq.net.cn:8010/MobileService";

    @Component
    export default class ImgViewer extends Vue {
        @Prop() visible!: boolean;

        options: any = {
            selected: "shortPeriod",
            progress: 0
        };
        img: any = {
            playing: false,
            list: [],
            src: "",
            time: "",
            loading: true,
            pre,
            next,
            data: {
                shortPeriod: [],
                shortPro: []
            }
        };
        interval: any;

        @Watch("visible")
        handleVisible(): void {
            // this.visible ? this.getImgList() : null;
        }

        created(): void {
            this.getImgList();
        }

        // 切换图片
        handleSwitch(type: string): void {
            const { src, list } = this.img;
            const index = list.findIndex((item: any) => item.url === src);
            if (index === 0 && type === "pre") {
                this.$message({
                    message: "当前已是第一张图片",
                    type: "info"
                });
                return;
            }
            if (index === list.length - 1 && type === "next") {
                this.$message({
                    message: "当前已是最后一张图片",
                    type: "info"
                });
                return;
            }
            type === "pre"
                ? (this.img.src = list[index - 1].url)
                : (this.img.src = list[index + 1].url);
        }

        // 获取图片信息
        getImgList(): void {
            const shortPeriod: any = [];
            const shortPro: any = [];
            this.$http("/rest/weatherForecast/getFutureRainPic").then(
                ({ data }: any) => {
                    if (Object.keys(data).length > 1) {
                        // 短临图片处理
                        ["one", "three"].forEach((item: string) => {
                            data.短临图片[item]
                                .slice(1)
                                .forEach((element: any) => {
                                    element.URL
                                        ? shortPeriod.push({
                                              url: URL + element.URL,
                                              time: data.短临图片[item][0].TIME
                                          })
                                        : null;
                                });
                        });
                        // 短期图片处理
                        data.短期图片.slice(2).forEach((item: any) => {
                            item.URL
                                ? shortPro.push({
                                      url: URL + item.URL,
                                      time: data.短期图片[0].TIME
                                  })
                                : null;
                        });

                        this.img.data.shortPeriod = shortPeriod;
                        this.img.data.shortPro = shortPro;
                        this.handleInitial();
                    }
                }
            );
        }

        // 处理初始值（图片，进度条）
        handleInitial(): void {
            const { selected } = this.options;
            const { shortPeriod, shortPro } = this.img.data;
            selected === "shortPeriod"
                ? ((this.img.list = shortPeriod),
                  (this.img.src = shortPeriod[0].url),
                  (this.img.time = shortPeriod[0].time),
                  (this.options.progress = 100 / shortPeriod.length))
                : ((this.img.list = shortPro),
                  (this.img.src = shortPro[0].url),
                  (this.img.time = shortPro[0].time),
                  (this.options.progress = 100 / shortPro.length));
        }

        // 关闭弹窗
        handleClose(): void {
            this.$emit("update:visible", false);
        }
    }
</script>

<style lang="scss" scoped>
    .component {
        position: absolute;
        //top: 100px;
        //right: calc(100% + 50px);
        width: 600px;
        height: 630px;
        background-color: white;

        header {
            display: flex;
            justify-content: space-between;
            padding: 0 16px;
            background-image: linear-gradient(270deg, #1f64ff 0%, #325fd9 100%);

            p {
                line-height: 40px;
                color: white;
            }

            i {
                line-height: 40px;
                color: white;
                font-size: 20px;
                cursor: pointer;
            }
        }

        main {
            p {
                font-weight: normal;
                text-align: center;
                font-size: 14px;
                line-height: 2.5em;
            }

            .el-row.controls {
                display: flex;
                justify-content: center;
                flex-wrap: nowrap;
                margin: 8px 0;

                .el-select {
                    width: 100px;
                }

                // .el-progress {
                // 	display: flex;
                // 	align-items: center;
                // 	margin: 0 12px 0 12px;
                // 	width: 180px;
                // }
            }

            .el-row.img-view {
                display: flex;
                align-items: center;

                img {
                    margin: 0 8px;
                    width: 510px;
                    height: 510px;

                    &.control {
                        width: 14px;
                        height: 14px;
                        cursor: pointer;

                        &:first-of-type {
                            margin-left: 14px;
                        }
                    }
                }
            }
        }
    }
</style>
