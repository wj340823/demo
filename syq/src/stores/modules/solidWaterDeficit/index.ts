import mutations from "./mutations";

const state: any = {
    map: {
        points: []
    },
    overlay: {
        visible: false,
        data: {}
    }
};

export default {
    namespaced: true,
    state,
    mutations
};
