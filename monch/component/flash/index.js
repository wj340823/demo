import flash from './ripples.vue';
import twinkle from './twinkle.vue';
import track from './track.vue';
import migrate from './migrate.vue';
import moveline from './moveline.vue';
import radar from './radar.vue';

function plugin (Vue) {
    if (plugin.installed) {
        return
    }
    plugin.installed = true;

    Vue.component(flash.name, flash);
    Vue.component(twinkle.name, twinkle);
    Vue.component(track.name, track);
    Vue.component(migrate.name, migrate);
    Vue.component(moveline.name, moveline);
    Vue.component(radar.name, radar);
}

export default plugin;

export {
    flash as OlFlash,
    twinkle as OlTwinkle,
    track as OlTrack,
    migrate as OlMigrate,
    moveline as OlMoveline,
    radar as OlRadar,
    plugin as install
}
