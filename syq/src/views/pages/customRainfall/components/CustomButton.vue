<template>
    <div class="component" :class="{ active: active }">
        <i :class="iconName" />
        <span>{{ text }}</span>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop } from "vue-property-decorator";

    @Component
    export default class CustomButton extends Vue {
        @Prop() readonly text!: string;
        @Prop() readonly active!: boolean;
        @Prop() readonly iconName?: string;
    }
</script>

<style lang="scss" scoped>
    .component {
        display: inline-flex;
        padding: 3px 7px;
        margin: 2px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: white;
        transition: all 0.2s ease-in;
        cursor: pointer;

        i {
            position: relative;
            top: 1px;
            margin-right: 2px;
            color: #85c1e6;
        }

        span {
            font-size: 12px;
        }
    }

    .active {
        background-color: #d3eeff;
        border: 1px solid transparent;
    }
</style>
