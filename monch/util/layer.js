import {
    Tile as TileLayer,
    Heatmap as HeatmapLayer,
    Image as ImageLayer,
    Vector as VectorLayer,
    VectorImage,
    VectorTile as VectorTileLayer
} from 'ol/layer.js';
import {
    ImageArcGISRest,
    ImageStatic,
    ImageWMS,
    TileArcGISRest,
    TileWMS,
    Vector as VectorSource,
    VectorTile,
    XYZ,
    Cluster,
    WMTS
} from 'ol/source.js';
import Attribution from 'ol/control/Attribution.js';
import * as OlFormat from 'ol/format.js';
import {EsriJSON, GeoJSON, KML} from 'ol/format.js';
import {get as getProj, Projection, addProjection, addCoordinateTransforms} from 'ol/proj.js';
import * as loadingstrategy from 'ol/loadingstrategy.js';
import TileGrid from 'ol/tilegrid/TileGrid';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import {createXYZ} from 'ol/tilegrid.js';
import {applyTransform, getWidth, getTopLeft} from 'ol/extent';
import * as projzh from 'projzh'

import {isDefined, isDefinedAndNotNull, isFunction, createStyle, transformStyle} from './helpers';

export const layerMethods = {
    detectLayerType(layer) {
        if (layer.type) {
            return layer.type;
        } else {
            if (!isDefined(layer.source)) {
                console.error('[Vue - Openlayers] - layer needs valid source');
                return;
            }
            switch (layer.source.type) {
                case 'ImageWMS':
                    return 'Image';
                case 'ImageStatic':
                case 'ImageArcGISRest':
                    return 'Image';
                case 'GeoJSON':
                case 'JSONP':
                case 'TopoJSON':
                case 'KML':
                case 'WKT':
                case 'EsriJSON':
                    return 'Vector';
                case 'TileVector':
                    return 'TileVector';
                case 'Raster':
                    return 'Image';
                default:
                    return 'Tile';
            }
        }
    },
    createAttribution(source) {
        let attributions = [];
        if (isDefined(source.attribution)) {
            attributions.unshift(new Attribution({
                html: source.attribution
            }));
        }
        return attributions;
    },
    createTileGrid(source) {
        let tileGrid = null;
        if (source.tileGrid) {
            const GRID = source.tileGrid;
            let obj = {
                tileSize: GRID.tileSize ? GRID.tileSize : [256, 256],
                minZoom: GRID.minZoom || 0
            }
            if (GRID.extent) {
                obj.extent = GRID.extent;
            }
            if (GRID.origin) {
                obj.origin = GRID.origin;
            }
            if (GRID.origins) {
                obj.origins = GRID.origins;
            }
            if (GRID.resolutions) {
                obj.resolutions = GRID.resolutions;
            }
            if (GRID.sizes) {
                obj.sizes = GRID.sizes;
            }
            if (GRID.tileSizes) {
                obj.tileSizes = GRID.tileSizes;
            }

            tileGrid = new TileGrid(obj);
        }
        return tileGrid;
    },
    createXYZSource(source) {
        if (!source.url && !source.tileUrlFunction) {
            console.error('[Vue - Openlayers] - XYZ Layer needs valid url or tileUrlFunction properties');
        }

        let xyzOps = {
            url: source.url,
            attributions: this.createAttribution(source),
            minZoom: source.minZoom,
            maxZoom: source.maxZoom,
            projection: source.projection || 'EPSG:3857',
            tileUrlFunction: source.tileUrlFunction,
            tileLoadFunction: source.tileLoadFunction,
            crossOrigin: source.crossOrigin || null
        }
        let tileGrid = this.createTileGrid(source);
        if (tileGrid) {
            xyzOps.tileGrid = tileGrid;
        }

        return new XYZ(xyzOps);
    },
    createImageStatic(source) {
        if (!source.url || !Array.isArray(source.imageExtent) || source.imageExtent.length !== 4) {
            console.error('[Vue - Openlayers] - You need a image URL to create a ImageStatic layer.');
            return;
        }
        let projection = new Projection({
            code: 'xkcd-image',
            units: 'pixels',
            extent: source.imageExtent
        })

        return new ImageStatic({
            url: source.url,
            attributions: this.createAttribution(source),
            imageSize: source.imageSize,
            projection: source.projection || projection,
            imageExtent: source.imageExtent,
            imageLoadFunction: source.imageLoadFunction
        });
    },
    createTileArcGISRest(source) {
        if (!source.url) {
            console.error('[Vue - Openlayers] - TileArcGISRest Layer needs valid url');
        }

        let ops = {
            attributions: this.createAttribution(source),
            tileLoadFunction: source.tileLoadFunction,
            url: source.url
        }
        if (source.params) {
            ops.params = source.params;
        }
        let tileGrid = this.createTileGrid(source);
        if (tileGrid) {
            ops.tileGrid = tileGrid;
        }

        return new TileArcGISRest(ops);
    },
    createImageArcGISRest(source) {
        if (!source.url) {
            console.error('[Vue - Openlayers] - ImageArcGISRest Layer needs valid url');
        }
        let oSource;

        if (source.params) {
            oSource = new ImageArcGISRest({
                projection: source.projection ? source.projection : "EPSG:4326",
                ratio: 1,
                params: source.params,
                url: source.url
            })
        } else {
            oSource = new ImageArcGISRest({
                projection: source.projection ? source.projection : "EPSG:4326",
                ratio: 1,
                url: source.url
            })
        }
        return oSource;
    },
    handleJsonFeatures(features, source, type) {
        /*
        * esrijson/geojson
        * 给feature加上样式和附属属性
         */

        features.forEach(function (feature) {
            let style = [];
            if (isDefined(source.style)) {
                if (source.style instanceof Array) {
                    let len = source.style.length;
                    for (let i = 0; i < len; i++) {
                        style[i] = createStyle(source.style[i]);
                    }
                } else if (isFunction(source.style)) {
                    style = createStyle(source.style(feature));
                } else {
                    style = createStyle(source.style);
                }

                feature.setStyle(style);
            }
            if (source.moveStyle) {
                feature.set("moveStyle", source.moveStyle);
            }
            if (source.clickStyle) {
                feature.set("clickStyle", source.clickStyle);
            }

            feature.set("featureInfo", {
                type: type == "esrijson" ? "esriFeature" : "geoFeature",
                data: {
                    style: source.style,
                    moveStyle: source.moveStyle,
                    clickStyle: source.clickStyle
                }
            });
        })
    },
    createObjJson(source, projection, onLayerCreatedFn, type) {
        /*
        * esrijson/geojson
        * 拿到的数据是json对象
         */
        let jsonFormat;
        if (type == "esrijson") {
            jsonFormat = new EsriJSON();
        } else {
            jsonFormat = new GeoJSON();
        }

        let oSource = new VectorSource({
            strategy: loadingstrategy.bbox
        });

        let projectionToUse = projection;
        let dataProjection;
        if (isDefined(source[type].projection)) {
            dataProjection = getProj(source[type].projection);
        } else {
            dataProjection = projection;
        }

        let features = jsonFormat.readFeatures(source[type].object, {
            featureProjection: projectionToUse.getCode(),
            dataProjection: dataProjection.getCode()
        });

        //给feature加上样式和附属属性
        this.handleJsonFeatures(features, source, type);

        oSource.addFeatures(features);
        if (onLayerCreatedFn) {
            onLayerCreatedFn({
                oSource: oSource
            })
        }
        return oSource;
    },
    jsonp: function (url, data, callback, onLayerFailFn) {
        let flag = false;//用于标识是否成功返回
        // 回调函数+时间戳
        const cbName = 'callback_' + new Date().getTime() + Math.round(Math.random() * 100);
        // 暴露全局函数给window
        // 判读查询字符串最后一位是否为?或者是&
        let queryString = url.indexOf('?') == -1 ? '?' : '&';
        // 遍历传进来的data实参赋值给查询字符串
        for (let k in data) {
            queryString += k + '=' + data[k] + '&';
        }
        // 查询字符串加上回调函数
        queryString += 'callback=' + cbName;
        // 创建script标签
        let ele = document.createElement('script');
        // 给script标签添加src属性值
        ele.src = url + queryString;
        window[cbName] = function (data) {
            flag = true;  //成功返回
            callback(data);

            let scripts = document.body.getElementsByTagName("script");
            const len = scripts.length;
            for (let i = len - 1; i > -1; i--) {
                if (scripts[i].src.indexOf(cbName) != -1) {
                    document.body.removeChild(scripts[i]);
                    window[cbName] = undefined;
                    try {
                        delete window[cbName];
                    } catch (e) {
                    } //删除
                }
            }
        };
        window[cbName + "_err"] = function () {
            if (!flag) {   //20s之后还未成功返回 控制台打印失败信息
                onLayerFailFn&&onLayerFailFn("跨域script请求失败或者请求超时！");
                console.error("跨域script请求失败或者请求超时！", ele.src);
            }
        };
        setTimeout(function () {
            if (window[cbName + "_err"]) {
                window[cbName + "_err"]();
            }
        }, 20000)
        // 添加到body尾部
        document.body.appendChild(ele);
    },
    createUrlJson(source, projection, onLayerCreatedFn, onLayerFailFn, type) {
        const vm = this;
        let jsonFormat;
        /*
        * esrijson/geojson
        * 拿到的数据是 url 路径
         */
        if (type == "esrijson") {
            jsonFormat = new EsriJSON();
        } else {
            jsonFormat = new GeoJSON();
        }

        let oSource = new VectorSource({
            strategy: loadingstrategy.bbox
        });

        const url = source.url;

        let successCallback = function (data) {
            let response = data;
            if (response.error) {
                alert(response.error.message + '\n' +
                    response.error.details.join('\n'));
            } else {
                let features = jsonFormat.readFeatures(response, {
                    featureProjection: projection
                });

                //给feature加上样式和附属属性
                vm.handleJsonFeatures(features, source, type);

                if (features.length > 0) {
                    oSource.addFeatures(features);
                    if (onLayerCreatedFn) {
                        onLayerCreatedFn({
                            oSource: oSource
                        })
                    }
                }
            }
        }
        if (source.local) {
            let xhr = new XMLHttpRequest();
            xhr.open('GET', url);
            xhr.send();
            xhr.onerror = function () {
                oSource.clear();
            };
            xhr.onload = function () {
                successCallback(JSON.parse(xhr.responseText));
            }
        } else {
            vm.jsonp(url, null, successCallback, onLayerFailFn);
        }

        return oSource;
    },
    createJson(source, projection, onLayerCreatedFn, onLayerFailFn, type) {
        if (!(source.url || source[type])) {
            console.error('[Vue - Openlayers] - You need a ' + type +
                ' property to add a ' + type + ' layer.');
            return;
        }

        if (!isDefined(source.url)) {
            return this.createObjJson(source, projection, onLayerCreatedFn, type);
        }

        return this.createUrlJson(source, projection, onLayerCreatedFn, onLayerFailFn, type);
    },
    createGeoJSON(source, projection, onLayerCreatedFn, onLayerFailFn) {
        return this.createJson(source, projection, onLayerCreatedFn, onLayerFailFn, "geojson");
    },
    createEsriJSON(source, projection, onLayerCreatedFn, onLayerFailFn) {
        return this.createJson(source, projection, onLayerCreatedFn, onLayerFailFn, "esrijson");
    },
    createImageWMS(source) {
        if (!source.url || !source.params) {
            console.error('[Vue - Openlayers] - ImageWMS Layer needs ' +
                'valid server url and params properties');
        }
        return new ImageWMS({
            url: source.url,
            imageLoadFunction: source.imageLoadFunction,
            attributions: this.createAttribution(source),
            crossOrigin: (typeof source.crossOrigin === 'undefined') ? 'anonymous' : source.crossOrigin,
            params: source.params,
            ratio: source.ratio
        });
    },
    createTileWMS(source) {
        if ((!source.url && !source.urls) || !source.params) {
            console.error('[Vue - Openlayers] - TileWMS Layer needs ' +
                'valid url (or urls) and params properties');
        }

        var wmsConfiguration = {
            tileLoadFunction: source.tileLoadFunction,
            crossOrigin: (typeof source.crossOrigin === 'undefined') ? 'anonymous' : source.crossOrigin,
            params: source.params,
            attributions: this.createAttribution(source)
        };

        if (source.serverType) {
            wmsConfiguration.serverType = source.serverType;
        }

        if (source.url) {
            wmsConfiguration.url = source.url;
        }

        if (source.urls) {
            wmsConfiguration.urls = source.urls;
        }

        return new TileWMS(wmsConfiguration);
    },
    createBdTileImage(source) {
        const extent = [72.004, 0.8293, 137.8347, 55.8271];

        const baiduMercator = new Projection({
            code: 'baidu',
            extent: applyTransform(extent, projzh.ll2bmerc),
            units: 'm'
        });

        addProjection(baiduMercator);
        addCoordinateTransforms('EPSG:4326', baiduMercator, projzh.ll2bmerc, projzh.bmerc2ll);
        addCoordinateTransforms('EPSG:3857', baiduMercator, projzh.smerc2bmerc, projzh.bmerc2smerc);

        let bmercResolutions = new Array(19);
        for (let i = 0; i < 19; ++i) {
            bmercResolutions[i] = Math.pow(2, 18 - i);
        }

        let urls = [0, 1, 2, 3, 4].map(function (sub) {
            return 'http://online' + sub +
                '.map.bdimg.com/onlinelabel/qt=tile&x={x}&y={y}&z={z}&v=009&styles=pl&udt=20170301&scaler=1&p=1';
        });

        return new XYZ({
            projection: 'baidu',
            maxZoom: 18,
            tileUrlFunction: function (tileCoord) {
                let x = tileCoord[1];
                let y = -tileCoord[2] - 1;
                let z = tileCoord[0];
                let hash = (x << z) + y;
                let index = hash % urls.length;
                index = index < 0 ? index + urls.length : index;
                if (source.intranet) {
                    //内网
                    return source.url + '?qt=tile&x=' + x + '&y=' + y + '&z=' + z + '&styles=pl&udt=20170620&scaler=1&p=1';
                }
                return urls[index].replace('{x}', x).replace('{y}', y).replace('{z}', z);
            },
            tileGrid: new TileGrid({
                resolutions: bmercResolutions,
                origin: [0, 0],
                extent: applyTransform(extent, projzh.ll2bmerc),
                tileSize: [256, 256]
            }),
            crossOrigin: source.crossOrigin || null
        })
    },
    createWmts(source, projection) {
        if (!source.url && !source.urls) {
            console.error('[Vue - Openlayers] - WMTS Layer needs valid url ' +
                '(or urls)');
        }

        let projection2 = getProj(source.projection || projection);
        let projectionExtent = projection2.getExtent();
        let size = getWidth(projectionExtent) / 256;
        let zoomRange = source.zoomRange || [0, 19];
        let maxZoom = zoomRange[1];
        let resolutions = new Array(maxZoom);
        let matrixIds = new Array(maxZoom);
        for (let z = zoomRange[0]; z < maxZoom; ++z) {
            // generate resolutions and matrixIds arrays for this WMTS
            resolutions[z] = size / Math.pow(2, z);
            matrixIds[z] = z;
        }

        let wmtsConfiguration = {
            tileLoadFunction: source.tileLoadFunction,
            projection: source.projection || projection,
            layer: source.layer,
            attributions: this.createAttribution(source),
            matrixSet: (source.matrixSet === 'undefined') ? projection : source.matrixSet,
            format: (source.format === 'undefined') ? 'image/jpeg' : source.format,
            requestEncoding: (source.requestEncoding === 'undefined') ? 'KVP' : source.requestEncoding,
            tileGrid: new WMTSTileGrid({
                origin: source.tileGrid ? source.tileGrid.origin : getTopLeft(projectionExtent),
                resolutions: source.tileGrid ? source.tileGrid.resolutions : resolutions,
                matrixIds: source.tileGrid ? source.tileGrid.matrixIds : matrixIds
            }),
            style: (source.style === 'undefined') ? 'normal' : source.style,
            wrapX: source.wrapX || false
        };

        if (isDefined(source.url)) {
            wmtsConfiguration.url = source.url;
        }

        if (isDefined(source.urls)) {
            wmtsConfiguration.urls = source.urls;
        }

        return new WMTS(wmtsConfiguration);
    },
    createTileVector(source, projection) {
        if ((!source.url && !source.tileUrlFunction) || !source.format) {
            console.error('[Vue - Openlayers] - TileVector Layer needs valid url and format properties');
        }

        let tileGrid = this.createTileGrid(source);
        let ops = {
            url: source.url,
            projection: source.projection || projection,
            attributions: this.createAttribution(source),
            tileLoadFunction: source.tileLoadFunction,
            tileUrlFunction: source.tileUrlFunction,
            format: new OlFormat[source.format](source.formatParams),
        }
        if (tileGrid) {
            ops.tileGrid = tileGrid;
        }
        return new VectorTile(ops);
    },
    createSource(source, projection, onLayerCreatedFn, onLayerFailFn) {
        let oSource;

        switch (source.type) {
            case 'ImageStatic':
                oSource = this.createImageStatic(source);
                break;
            case 'XYZ':
                oSource = this.createXYZSource(source);
                break;
            case 'TileArcGISRest':
                oSource = this.createTileArcGISRest(source);
                break;
            case 'ImageArcGISRest':
                oSource = this.createImageArcGISRest(source);
                break;
            case 'GeoJSON':
                oSource = this.createGeoJSON(source, projection, onLayerCreatedFn, onLayerFailFn);
                break;
            case 'EsriJSON':
                oSource = this.createEsriJSON(source, projection, onLayerCreatedFn, onLayerFailFn);
                break;
            case 'ImageWMS':
                oSource = this.createImageWMS(source);
                break;
            case 'TileWMS':
                oSource = this.createTileWMS(source);
                break;
            case 'bdTileImage':
                oSource = this.createBdTileImage(source);
                break;
            case 'WMTS':
                oSource = this.createWmts(source, projection);
                break;
            case 'KML':
                let extractStyles = source.extractStyles || false;
                oSource = new VectorSource({
                    url: source.url,
                    format: new KML({
                        extractStyles: extractStyles
                    })
                });
                break;
            case 'TileVector':
                oSource = this.createTileVector(source, projection);
                break;
        }

        // log a warning when no source could be created for the given type
        if (!oSource) {
            console.warn('[Vue - Openlayers] - No source could be found for type "' + source.type + '"');
        }

        return oSource;
    },
    createLayer(layer, projection) {
        let oLayer;
        const type = this.detectLayerType(layer);
        let name = layer.name || null,
            onLayerCreatedFn = layer.onLayerCreated|| null,
            onLayerFailFn = layer.onLayerFail || null;

        let oSource = this.createSource(layer.source, projection, onLayerCreatedFn, onLayerFailFn);
        if (!oSource) {
            return;
        }

        // Manage clustering
        if ((type === 'Vector') && layer.clustering) {
            oSource = new Cluster({
                source: oSource,
                distance: layer.clusteringDistance
            });
        }

        let layerConfig = {
            source: oSource
        };

        // ol.layer.Layer configuration options
        if (isDefinedAndNotNull(layer.opacity)) {
            layerConfig.opacity = layer.opacity;
        }
        if (isDefinedAndNotNull(layer.visible)) {
            layerConfig.visible = layer.visible;
        }
        if (isDefinedAndNotNull(layer.extent)) {
            layerConfig.extent = layer.extent;
        }
        if (isDefinedAndNotNull(layer.zIndex)) {
            layerConfig.zIndex = layer.zIndex;
        }
        if (isDefinedAndNotNull(layer.minResolution)) {
            layerConfig.minResolution = layer.minResolution;
        }
        if (isDefinedAndNotNull(layer.maxResolution)) {
            layerConfig.maxResolution = layer.maxResolution;
        }
        if (isDefinedAndNotNull(layer.minZoom)) {
            layerConfig.minZoom = layer.minZoom;
        }
        if (isDefinedAndNotNull(layer.maxZoom)) {
            layerConfig.maxZoom = layer.maxZoom;
        }
        if (isDefinedAndNotNull(layer.updateWhileAnimating)) {
            layerConfig.updateWhileAnimating = layer.updateWhileAnimating;
        }
        if (isDefinedAndNotNull(layer.updateWhileInteracting)) {
            layerConfig.updateWhileInteracting = layer.updateWhileInteracting;
        }
        if (isDefinedAndNotNull(layer.radius)) {
            layerConfig.radius = layer.radius;
        }
        if (isDefinedAndNotNull(layer.blur)) {
            layerConfig.blur = layer.blur;
        }
        if (isDefinedAndNotNull(layer.weight)) {
            layerConfig.weight = layer.weight;
        }
        if (isDefinedAndNotNull(layer.declutter)) {
            layerConfig.declutter = layer.declutter;
        }

        switch (type) {
            case 'Image':
                oLayer = new ImageLayer(layerConfig);
                break;
            case 'Tile':
                oLayer = new TileLayer(layerConfig);
                break;
            case 'Heatmap':
                oLayer = new HeatmapLayer(layerConfig);
                break;
            case 'Vector':
                if(layer.vectorImage) {
                    oLayer = new VectorImage(layerConfig);
                }else {
                    oLayer = new VectorLayer(layerConfig);
                }
                break;
            case 'TileVector':
                oLayer = new VectorTileLayer(layerConfig);
                break;
        }

        // set a layer name if given
        if (isDefined(name)) {
            oLayer.set('name', name);
        } else if (isDefined(layer.name)) {
            oLayer.set('name', layer.name);
        }

        if (isDefinedAndNotNull(layer.style)) {
            // not every layer has a setStyle method
            if (oLayer.setStyle && isFunction(oLayer.setStyle)) {
                oLayer.setStyle(transformStyle(layer.style));
            }
        }

        // set custom layer properties if given
        if (isDefined(layer.customAttributes)) {
            for (let key in layer.customAttributes) {
                oLayer.set(key, layer.customAttributes[key]);
            }
        }

        // invoke the onSourceCreated callback
        if (onLayerCreatedFn) {
            onLayerCreatedFn({
                oLayer: oLayer
            });
        }

        return oLayer;
    }
}
