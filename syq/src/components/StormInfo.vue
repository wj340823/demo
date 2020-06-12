<template>
    <div class="movelabel">
        <div class="title">
            {{ dataInfo.name + "(" + dataInfo.info.tm.slice(0, 6) + ")" }}
        </div>
        <div>
            <div class="label">过去时间:</div>
            <div class="value">{{ dataInfo.info.tm.slice(5, -12) }}</div>
        </div>
        <div>
            <div class="label">中心位置:</div>
            <div class="value">
                {{ dataInfo.info.lgtd }},{{ dataInfo.info.lttd }}
            </div>
        </div>
        <div>
            <div class="label">最大风力:</div>
            <div class="value">{{ dataInfo.info.p }}</div>
        </div>
        <div>
            <div class="label">最大风速:</div>
            <div class="value">{{ dataInfo.info.speed }}</div>
        </div>
        <div>
            <div class="label">中心气压:</div>
            <div class="value">{{ dataInfo.info.cap }}</div>
        </div>
        <div>
            <div class="label">移动速度:</div>
            <div class="value">{{ dataInfo.info.ms }}</div>
        </div>
        <div>
            <div class="label">移动方向:</div>
            <div class="value">{{ dataInfo.info.md }}</div>
        </div>
        <div>
            <div class="label">七级风圈半径:</div>
            <div class="value">{{ dataInfo.info.sp }}</div>
        </div>
        <div>
            <div class="label">十级风圈半径:</div>
            <div class="value">{{ dataInfo.info.tp }}</div>
        </div>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from "vue-property-decorator";
    @Component
    export default class StormInfo extends Vue {
        @Prop() dataInfo: any;
        items: any = [];
        created(): void {}
    }
</script>

<style scoped lang="scss">
    .movelabel {
        width: 250px;
        background-color: #ffffff;
        border-radius: 4px;
        padding: 8px;
        font-size: 14px;
        .title {
            padding: 5px;
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
        .label {
            display: inline-block;
            color: #333;
            font-weight: bold;
            width: 90px;
            line-height: 28px;
        }
        .value {
            display: inline-block;
            line-height: 28px;
        }
    }
</style>
