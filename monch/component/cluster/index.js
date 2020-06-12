import cluster from './cluster.vue'

function plugin (Vue) {
    if (plugin.installed) {
        return
    }
    plugin.installed = true;

    Vue.component(cluster.name, cluster);
}

export default plugin;

export {
    cluster as OlCluster,
    plugin as install
}
