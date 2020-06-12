import Map from './component/map'
import Control from './component/control'
import BasicLayer from './component/basicLayer'
import Marker from './component/marker'
import Overlay from './component/overlay'
import Cluster from './component/cluster'
import Interaction from './component/interaction'
import Flash from './component/flash'
import Vector from './component/vector'
import * as components from "./component";
import * as helpers from './util/helpers'
import olData from './util/olData'
import 'ol/ol.css'
import './sass/main.scss'

function plugin(Vue) {
    if (plugin.installed) {
        return;
    }
    plugin.installed = true;

    Vue.use(Map);
    Vue.use(Control);
    Vue.use(BasicLayer);
    Vue.use(Marker);
    Vue.use(Overlay);
    Vue.use(Cluster);
    Vue.use(Interaction);
    Vue.use(Flash);
    Vue.use(Vector);
    Vue.prototype.$mapUtils = helpers;
}

let olMap = {
    ...components,
    helpers,
    olData,
    install: plugin
}
export default olMap;