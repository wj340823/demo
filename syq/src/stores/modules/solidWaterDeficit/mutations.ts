const mutations = {
    updateMapPoints(state: any, payload: any) {
        state.map.points = payload.data;
    }
};

export default mutations;
