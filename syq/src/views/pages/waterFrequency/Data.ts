import { OptionConfig, ColumnConfig } from "./Interface";

export const DateData: OptionConfig[] = [
    {
        label: "一天",
        value: 1
    },
    {
        label: "两天",
        value: 2
    },
    {
        label: "三天",
        value: 3
    },
    {
        label: "四天",
        value: 4
    },
    {
        label: "一周",
        value: 7
    },
]

export const ColumnsForWaterLine: ColumnConfig[] = [
    {
        label: "时间",
        prop: "date",
        width: 140
    },
    {
        label: "雨量",
        prop: "p"
    },
    {
        label: "水位",
        prop: "z"
    },
    {
        label: "流量",
        prop: "q"
    }
]

export const ColumnsForReservoir: ColumnConfig[] = [
    {
        label: "时间",
        prop: "date",
        width: 140
    },
    {
        label: "雨量",
        prop: "p"
    },
    {
        label: "水位",
        prop: "z"
    },
    {
        label: "出库",
        prop: "ck"
    },
    {
        label: "入库",
        prop: "rk"
    }
]
