<template>
    <div class="details">
        <div class="title">
            {{ data.type }}
        </div>
        <div class="tab searchBar">
            <span>条件查询</span>
        </div>
        <div class="searchBar">
            <el-input
                class="searchItem"
                style="width:250px;"
                v-model="search.inputVal"
                placeholder="站名站码拼音码"
            >
            </el-input>
            <button>搜索</button>
        </div>
        <div class="tab" style="margin-top: 10px">
            <span>查询结果</span>
        </div>
        <div class="result">
            <el-table :data="result.tbDate" style="width: 100%">
                <el-table-column type="index" width="50" label="序"> </el-table-column>
                <el-table-column
                    v-for="(item, index) in result.thList.ylxx"
                    :prop="item.value"
                    :label="item.label"
                    :key="index"
                >
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script lang="ts">
    import "../../../styles/mapView/right.scss";
    import { Vue, Component } from "vue-property-decorator";
    import { Mutation } from "vuex-class";

    @Component
    export default class SectionRainfall extends Vue {
        @Mutation("getSelectArea") getSelectArea: any;
        @Mutation("getCenter") getCenter: any;

        data: any = {
            type: "断面面雨量",
            show: true
        };
        search: any = {
            sksel: false
        };
        result: any = {
            thList: {
                ylxx: [
                    {
                        label: "站名",
                        value: "name"
                    },
                    {
                        label: "类型",
                        value: "type"
                    },
                    {
                        label: "流域",
                        value: "river"
                    }
                ]
            },
            tbDate: [
                {
                    name: "余杭",
                    type: "大型",
                    river: "西溪"
                }
            ]
        };

        hideList() {
            this.$emit("closeRight");
        }

        created() {}
    }
</script>

<style lang="scss" scoped>
    .details {
        .tab {
            margin-top: -10px;
            padding: 0 10px;
            text-align: left;
            height: 40px;
            line-height: 40px;
            > span {
                margin-right: 20px;
                color: #0169e1;
                font-size: 14px;
            } //background-color: #0169e1;
            .el-input__inner {
                background-color: rgb(1, 105, 225, 0.05);
            }
        }
    }
</style>
