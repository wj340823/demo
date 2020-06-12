import mutations from "./mutations";

const state: any = {
    points: [],
    flashPoints: [],
    overlay: {
        name: "",
        visible: false,
        position: [0, 0],
        offset: [0, 0],
        data: {}
    }
};

export default {
    namespaced: true,
    state,
    mutations
};
