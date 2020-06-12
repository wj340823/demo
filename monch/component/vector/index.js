import Path from './path.vue'
import MulPath from './multiPath.vue'
import PointCollection from './pointCollection.vue'
import HeatMap from './heatMap.vue'
import NearBy from './nearby.vue'

function plugin(Vue) {
    if (plugin.installed) {
        return
    }
    plugin.installed = true;

    Vue.component(Path.name, Path);
    Vue.component(MulPath.name, MulPath);
    Vue.component(PointCollection.name, PointCollection);
    Vue.component(HeatMap.name, HeatMap);
    Vue.component(NearBy.name, NearBy);
}

export default plugin;

export {
    Path as OlPath,
    MulPath as OlMulPath,
    PointCollection as OlPointCollection,
    HeatMap as OlHeatMap,
    NearBy as OlNearby,
    plugin as install
}
