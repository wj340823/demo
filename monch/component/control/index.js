import OlControl from "./control.vue";

function plugin (Vue) {
    if (plugin.installed) {
        return
    }
    plugin.installed = true;

    Vue.component(OlControl.name, OlControl);
}

export default plugin;

export {
    OlControl,
    plugin as install
}