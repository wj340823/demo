import {isDefined} from './helpers';
import {Vector as VectorLayer} from 'ol/layer';
import {Vector as VectorSource} from 'ol/source';

const layers = {};

export const SameLayer = {
    getMapIndex(map, layerId) {
        return layers[layerId].map(function (record) {
            return record.map;
        }).indexOf(map);
    },
    getLayerInst(scope, map, layerId) {
        let mapIndex = -1;
        if (isDefined(layers[layerId])) {
            mapIndex = this.getMapIndex(map, layerId); //这一步是为了以防有多个地图，判断当前地图是否拥有相关图层，免除其他地图的扰乱
        } else {
            layers[layerId] = [];
        }

        if (mapIndex === -1) {
            let layer = new VectorLayer({
                source: new VectorSource()
            });
            layer.set(layerId, true);
            map.addLayer(layer);
            layers[layerId].push({
                map: map,
                layer: layer,
                instScopes: []
            });
            mapIndex = layers[layerId].length - 1;
        }
        layers[layerId][mapIndex].instScopes.push(scope);

        return layers[layerId][mapIndex].layer;
    },
    deregisterScope(scope, map, layerId) {
        const mapIndex = this.getMapIndex(map, layerId);
        if (mapIndex === -1) {
            throw Error('This map has no "' + layerId + '" layer');
        }

        const scopes = this.layers[layerId][mapIndex].instScopes;
        const scopeIndex = scopes.indexOf(scope);
        if (scopeIndex === -1) {
            throw Error('Scope not registered');
        }

        scopes.splice(scopeIndex, 1);

        if (!scopes.length) { //如果没有作用域在引用该图层，则移除图层
            map.removeLayer(layers[layerId][mapIndex].layer);
            delete layers[layerId][mapIndex].layer;
            delete layers[layerId][mapIndex];
        }
    }
}