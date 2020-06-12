const mutations = {
    // 更新地图点位
    updateMapPoints(state: any, payload: any) {
        state.points = payload.data;
    },
    // 更新弹出框状态
    updateOverlay(state: any, payload: any) {
        const { lon, lat, component, offset, data, info } = payload.data;
        state.overlay = {
            offset,
            data: data ? data : info ? info : payload.data,
            name: component,
            visible: true,
            position: [lon, lat]
        };
    },
    // 关闭弹出框
    closeOverlay(state: any) {
        state.overlay = {
            offset: [0, 0],
            data: {},
            name: "",
            visible: false,
            position: [0, 0]
        };
    }
};

export default mutations;
