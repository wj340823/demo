import basicLayer from './basicLayer.vue'
import tileVectorLayer from './tileVectorLayer.vue'

function plugin (Vue) {
    if (plugin.installed) {
        return
    }
    plugin.installed = true;

    Vue.component(basicLayer.name, basicLayer);
    Vue.component(tileVectorLayer.name, tileVectorLayer);
}

export default plugin;

export {
    basicLayer as OlLayer,
    tileVectorLayer as OlTileVectorLayer,
    plugin as install
}