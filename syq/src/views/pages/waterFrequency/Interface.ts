export interface OptionConfig {
    label: string;
    value: number;
}

export interface SelectConfig {
    data: OptionConfig[];
    selected: number;
}

export interface ConditionConfig {
    over: number;
    date: SelectConfig;
    dateRange: string;
    overTime: string;
    dateType?: string;
}

export interface ColumnConfig {
    prop: string;
    label: string;
    width?: number;
}

export interface ChartConfig {
    data: Array<{
        date?: string;
        q?: string;
        z: string;
        ck?: string;
        rk?: string;
        p?: string;
        tm?: string;
    }>;
    type: string;
}

export interface WaterLineConfig {
    warning: any;
    insure: any;
    xxsw: any;
    zcsw: any;
    zl: any;
}

export interface TableConfig {
    data: any[];
    columns: ColumnConfig[];
}

export interface MaxConfig {
    latest: any;
    highest: any;
    total: any;
}
