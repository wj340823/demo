import overlay from './overlay.vue';

function plugin (Vue) {
    if (plugin.installed) {
        return
    }
    plugin.installed = true;

    Vue.component(overlay.name, overlay);
}

export default plugin;

export {
    overlay as OlOverlay,
    plugin as install
}
