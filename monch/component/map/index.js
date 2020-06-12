import Map from './map.vue'
import View from './view.vue'

function plugin (Vue) {
    if (plugin.installed) {
        return
    }
    plugin.installed = true;

    Vue.component(Map.name, Map);

    Vue.component(View.name, View);
}

export default plugin;

export {
    Map as SucMap,
    View,
    plugin as install
}