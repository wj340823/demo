export interface ColumnConfig {
    prop: string;
    label: string;
    width?: number;
    sortable?: boolean;
    fixed?: boolean;
}

export interface DataConfig {
    [propName: string]: string | number | null;
    time: string; // 日期
    name: string; // 流域名称
    wq: number | null; // 缺水量
    id: string; // 编号
}

export interface TableConfig {
    data: DataConfig[];
    columns: ColumnConfig[];
    loading: boolean;
}

export interface DateConfig {
    start: Date;
    end: Date;
}

export const columnsForLand: ColumnConfig[] = [
    {
        label: "流域名称",
        prop: "name",
        sortable: true,
        fixed: true,
        width: 120
    },
    {
        label: "缺水量",
        prop: "wq",
        width: 70,
        sortable: true
    },
    {
        label: "日期",
        prop: "time",
        width: 100,
        sortable: true
    },
    {
        label: "编号",
        prop: "id"
    }
];

export interface ProgressConfig {
    time: number;
    opacity: number;
    max:number
}

export interface SelectConfig {
    checkbox: boolean;
    radio: string;
}

export interface PlayConfig {
    data: Array<{ value: number; label: string }>;
    selected: number;
}

export const playData: Array<{ value: number; label: string }> = [
    {
        value: 1,
        label: "1"
    },
    {
        value: 2,
        label: "2"
    },
    {
        value: 3,
        label: "3"
    },
    {
        value: 5,
        label: "5"
    },
    {
        value: 8,
        label: "8"
    }
];

export interface EquivalentFaceConfig {
    isActive?: boolean;
    loading?: boolean;
    table: {
        column?: ColumnConfig[];
        data: {
            [propName: string]: string;
        }[];
    };
}

export const columnsForFace: ColumnConfig[] = [
    {
        label: "缺水等级（mm）",
        prop: "level"
    },
    {
        label: "面积（km²）",
        prop: "area"
    }
];
