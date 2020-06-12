import {isDefined} from "./helpers";

const maps = {};

const setResolvedDefer = function (d, mapId) {
    const id = obtainEffectiveMapId(d, mapId);
    d[id].resolvedDefer = true;
};

const getUnresolvedDefer = function (d, mapId) {
    const id = obtainEffectiveMapId(d, mapId);
    let defer = {
        promise: null,
        resolve: null
    }

    if (!isDefined(d[id]) || d[id].resolvedDefer === true) {
        defer.promise = new Promise((resolve, reject) => {
            defer.resolve = resolve;
        });
        d[id] = {
            defer: defer,
            resolvedDefer: false
        };
    } else {
        defer = d[id].defer;
    }
    return defer;
};

const getDefer = function (d, mapId) {
    const id = obtainEffectiveMapId(d, mapId);
    let defer;

    if (!isDefined(d[id]) || d[id].resolvedDefer === false) {
        defer = getUnresolvedDefer(d, mapId);
    } else {
        defer = d[id].defer;
    }
    return defer;
};

function obtainEffectiveMapId(d, mapId) {
    let id, i;
    if (!isDefined(mapId)) {
        const mapNum = Object.keys(d).length;
        if (mapNum === 1) {
            for (i in d) {
                if (d.hasOwnProperty(i)) {
                    id = i;
                }
            }
        } else if (mapNum === 0) {
            id = 'main';
        } else {
            console.error('[Vue - Openlayers] - You have more than 1 map on the DOM, ' +
                'you must provide the map ID to the olData.getXXX call');
        }
    } else {
        id = mapId;
    }
    return id;
}

const olData = {
    setMap(olMap, id) {
        let defer = getUnresolvedDefer(maps, id);
        defer.resolve(olMap);
        setResolvedDefer(maps, id);
    },
    getMap(id) {
        let defer = getDefer(maps, id);
        return defer.promise;
    },
    resetMap(id) {
        if (isDefined(maps[id])) {
            delete maps[id];
        }
    }
}
export default olData;