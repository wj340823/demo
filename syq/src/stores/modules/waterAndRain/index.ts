const state: any = {
    allTableData: {
        th: [],
        tblist: [],
        title: "",
        show: false
    },
    rainInfo: {
        data: null,
        title: "水雨情简报",
        show: false
    },
    rainImg: {
        url: "",
        title: "雨情等值面",
        show: false
    }
};
const mutations = {
    setTbTitle(state: any, title: any) {
        state.allTableData.title = title;
    },
    setTbList(state: any, data: any) {
        state.allTableData.tblist = data;
    },
    setTh(state: any, data: any) {
        state.allTableData.th = data;
    },
    controlAllTableState(state: any, bool: boolean) {
        state.allTableData.show = bool;
    },
    setRainInfo(state: any, data: any) {
        state.rainInfo.data = data;
    },
    controlRainInfoState(state: any, bool: boolean) {
        state.rainInfo.show = bool;
    },
    setImgTitle(state: any, title: string) {
        state.rainImg.title = title
    },
    setRainImg(state: any, url: any) {
        state.rainImg.url = url;
    },
    controlRainImgState(state: any, bool: boolean) {
        state.rainImg.show = bool;
    }
};

export default {
    namespaced: true,
    state,
    mutations
};
