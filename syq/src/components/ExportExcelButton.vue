<template>
    <div class="export-button">
        <img src="@/assets/export.png" />
        <span>导出表格</span>
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from "vue-property-decorator";

    @Component
    export default class ExportExcelButton extends Vue {}
</script>

<style lang="scss" scoped>
    .export-button {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: {
            left: 8px;
            right: 8px;
        }
        margin: {
            left: 6px;
            right: 6px;
        }
        height: 28.5px;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: rgba(255, 255, 255, 0.8);
        cursor: pointer;

        &:hover {
            border: 1px solid #33b2ff;
        }

        img {
            width: 14px;
            height: 14px;
            margin-right: 4px;
        }
    }
</style>
