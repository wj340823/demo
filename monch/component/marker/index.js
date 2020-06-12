import markerGroup from './markerGroup.vue';
import marker from './marker.vue';

function plugin (Vue) {
    if (plugin.installed) {
        return
    }
    plugin.installed = true;

    Vue.component(markerGroup.name, markerGroup);
    Vue.component(marker.name, marker);
}

export default plugin;

export {
    markerGroup as OlMarkers,
    marker as OlMarker,
    plugin as install
}