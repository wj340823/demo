<template>
    <el-table
        border
        stripe
        style="width: 100%"
        v-loading="table.loading"
        :data="prop"
        height="500"
    >
        <el-table-column type="index" width="50" label="序号" />
        <el-table-column
            v-for="item in table.columns"
            :prop="item.value"
            :label="item.label"
            :key="item.label"
            :width="item.width"
        />
    </el-table>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class WaterLine extends Vue {
    @Prop() prop: any;

    table: any = {
        columns: [
            {
                label: "站码",
                value: "zh",
            },
            {
                label: "站名",
                value: "zm",
            },
            {
                label: "流域",
                value: "ly",
            },
            {
                label: "站址",
                value: "zz",
                width: 200,
            },
            {
                label: "历史最高水位",
                value: "htz",
            },
            {
                label: "发生日期",
                value: "time",
            },
            {
                label: "基面",
                value: "jm",
            },
        ],
        loading: false,
        data: [],
    };
}
</script>
