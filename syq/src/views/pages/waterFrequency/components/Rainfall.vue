<template>
    <div style="background-color: white; padding: 6px;">
        <span>时段区间：</span>
        <el-select
            v-model="select.selected"
            placeholder="请选择"
            style="margin: 0 0 6px 0"
            @change="getData"
        >
            <el-option
                v-for="item in select.options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
            </el-option>
        </el-select>
        <el-table
            border
            stripe
            style="width: 100%"
            v-loading="table.loading"
            :data="table.data"
            height="164"
        >
            <el-table-column type="index" width="50" label="序号" />
            <el-table-column
                v-for="item in table.columns"
                :prop="item.value"
                :label="item.label"
                :key="item.label"
            />
        </el-table>
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from "vue-property-decorator";

    const options = [
        {
            value: "1",
            label: "最大1小时（60分钟）"
        },
        {
            value: "3",
            label: "最大3小时（180分钟）"
        },
        {
            value: "6",
            label: "最大6小时（360分钟）"
        },
        {
            value: "12",
            label: "最大12小时（720分钟）"
        },
        {
            value: "24",
            label: "最大24小时（1440分钟、1日）"
        },
        {
            value: "72",
            label: "最大72小时（3日）"
        }
    ];

    @Component
    export default class Rainfall extends Vue {
        table: any = {
            columns: [
                {
                    label: "站名",
                    value: "zm"
                },
                {
                    label: "降雨量",
                    value: "ptmxp"
                },
                {
                    label: "日期",
                    value: "time"
                },
                {
                    label: "时段类型",
                    value: "drcd"
                }
            ],
            loading: false,
            data: []
        };
        select: any = {
            selected: "1",
            options: options
        };

        created() {
            this.getData();
        }

        getData() {
            const params = {
                zh: "PP",
                drcd: this.select.selected
            };
            this.$http("/rest/waterFrequency/getRainDataBydrcp", {
                params
            }).then(({ data }) => {
                this.table.data = data;
            });
        }
    }
</script>
