import http from "axios";
const pathFmt = (data: any, name: string, id: any) => {
    let point = [],
        line = [],
        arr: any = [];
    for (let key in data) {
        for (let i = 0; i < data[key].length; i++) {
            let item = { ...data[key][i] };
            let index: any;
            for (let j: number = 0; j < LEVEL.length; j++) {
                if (item.p <= LEVEL[j].value) {
                    index = j;
                    break;
                }
            }
            point.push({
                id: id,
                type: "Point",
                name,
                coords: [item.lgtd, item.lttd],
                info: { ...item },
                style: {
                    image: {
                        icon: {
                            src: LEVEL[index].legend()
                        }
                    }
                }
            });
            if (i != data[key].length - 1) {
                line.push({
                    id: key + i,
                    type: "LineString",
                    coords: [
                        [item.lgtd, item.lttd],
                        [data[key][i + 1].lgtd, data[key][i + 1].lttd]
                    ],
                    style: {
                        stroke: {
                            width: 2,
                            color: regions[key],
                            lineDash: [1, 2, 6]
                        }
                    }
                });
            }
        }
    }
    console.log(line);
    arr = [...line, ...point];
    return arr;
};
const LEVEL = [
    {
        label: "热带低压",
        value: 7,
        legend: () => require("@/assets/storm/storm_5.png")
    },
    {
        label: "热带风暴",
        value: 9,
        legend: () => require("@/assets/storm/storm_4.png")
    },
    {
        label: "强热带风暴",
        value: 11,
        legend: () => require("@/assets/storm/storm_3.png")
    },
    {
        label: "台风",
        value: 13,
        legend: () => require("@/assets/storm/storm_2.png")
    },
    {
        label: "强台风",
        value: 15,
        legend: () => require("@/assets/storm/storm_1.png")
    },
    {
        label: "超强台风",
        value: 16,
        legend: () => require("@/assets/storm/storm_0.png")
    }
];
const regions: any = {
    中国: "rgba(255,64,80,1)",
    中国台湾: "rgba(255,160,64,1)",
    中国香港: "rgba(255,64,245,1)",
    日本: "rgba(67,255,75,1)",
    美国: "rgba(64,153,238,1)"
};

const state = {
    mapPath: {
        grids: [],
        show: false,
        region: [],
        forecast: [],
        selectedData: {},
        selectLine: [],
        selectShow: false
    }
};
const mutations = {
    controlMapPathShow: (state: any, bool: boolean) => {
        state.mapPath.show = bool;
    },
    getForecastPath(state: any, params: any) {
        http.get("/rest/stormSurges/getTyphoonInfoAndPrePath", { params }).then(
            res => {
                let point = [],
                    line = [];
                //"lineDash":[1,2,6]
                //state.mapPath.region = Object.keys(res.data);
                let { id, name } = state.mapPath.selectedData;
                state.mapPath.forecast = pathFmt(res.data, name, id);
            }
        );
    },
    controlSelectShow(state: any, show: boolean) {
        state.mapPath.selectShow = show;
    },
    getSelectData(state: any, data: any) {
        state.mapPath.selectedData = data;
    },
    setMapPathGrid: (state: any, grids: any[]) => {
        state.mapPath.grids = grids;
        state.mapPath.forecast = [];
    }
};
export default {
    namespaced: true,
    state,
    mutations
};
