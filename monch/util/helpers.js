import {
    Vector as VectorLayer
} from 'ol/layer.js';
import {
    Vector as VectorSource
} from 'ol/source.js';
import Feature from 'ol/Feature.js';
import {
    Circle as CircleStyle,
    Fill,
    Stroke,
    Style,
    Text,
    Image as ImageStyle,
    Icon,
    RegularShape
} from 'ol/style.js';
import {
    Circle,
    LineString,
    MultiLineString,
    MultiPoint,
    MultiPolygon,
    Point,
    Polygon
} from 'ol/geom';
import {
    Attribution,
    FullScreen,
    OverviewMap,
    Rotate,
    ScaleLine,
    Zoom,
    ZoomSlider,
    ZoomToExtent
} from 'ol/control';
import {containsCoordinate} from "ol/extent";
import MousePosition from 'ol/control/MousePosition.js';
import Overlay from 'ol/Overlay'
import {transform as transformProjection, get as getProjection, fromLonLat, transformExtent} from 'ol/proj';
import {register} from 'ol/proj/proj4';
import * as Sphere from 'ol/sphere';
import olData from './olData';
import proj4 from 'proj4';

import {saveAs} from 'file-saver';

export function isDefined(x) {
    return x !== undefined;
}

export function isDefinedAndNotNull(x) {
    return x !== null && x !== undefined;
}

export function isFunction(x) {
    return typeof x === "function";
}

export function isObjectLike(value) {
    return value != null && typeof value === 'object'
}

export function isEqual(value, other) {
    if (value === other) {
        return true
    }
    if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
        // eslint-disable-next-line no-self-compare
        return value !== value && other !== other
    }

    let valueProps = Object.keys(value)
    let otherProps = Object.keys(other)
    if (valueProps.length !== otherProps.length) {
        return false
    }

    let checked = []
    let traverse = (valueProps, otherProps) => {
        for (let i = 0, l = valueProps.length; i < l; i++) {
            let valueProp = valueProps[i];

            if (checked.includes(valueProp)) {
                continue
            }
            if (other.hasOwnProperty(valueProp) === false) {
                return false
            }

            let otherProp = otherProps[i]

            if (!isEqual(value[valueProp], other[otherProp])) {
                return false
            }

            checked.push(otherProp)
        }

        return true
    }

    if (traverse(valueProps, otherProps) === false) {
        return false
    }

    return traverse(otherProps, valueProps)
}

export function deepClone(obj) {
    let objClone = Array.isArray(obj) ? [] : {};
    if (obj && typeof obj === "object") {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (obj[key]) {
                    //判断ojb子元素是否为对象，如果是，递归复制
                    if (obj[key] && typeof obj[key] === "object") {
                        objClone[key] = deepClone(obj[key]);
                    } else {
                        //如果不是，简单复制
                        objClone[key] = obj[key];
                    }
                } else {
                    objClone[key] = obj[key];
                }
            }
        }
    }
    return objClone;
}

/**
 　　* @description: canvas 导出图片
 　　* @param canvas: 画布元素
 　　* @author xrx
 　　* @date 2019/4/23 13:23
 　　*/
export function exportMap(canvas) {
    if (navigator.msSaveBlob) {
        navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
    } else {
        canvas.toBlob(function (blob) {
            saveAs(blob, 'map.png');
        });
    }
}

//判断经纬度是否有效
export function validCoords(longitude, latitude) {
    const lon = /^-?((0|[1-9]\d?|1[0-7]\d)(\.\d+)?|180(\.0+)?)?$/;
    const lat = /^-?((0|[1-8]?\d|)(\.\d+)?|90(\.0+)?)?$/;
    const lonRe = new RegExp(lon);
    const latRe = new RegExp(lat);
    if (lonRe.test(longitude) && latRe.test(latitude)) {
        return true;
    }
    return false;
}

//时间戳转换成自定义字符串
export function dateFormat(date, fmt) {
    if (!date) {
        return null;
    }
    if (!(date instanceof Date)) {
        date = new Date(date);
    }

    let dateList = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "H+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
        "q+": Math.floor((date.getMonth() + 3) / 3),
        "S+": date.getMilliseconds()
    };
    if (/(y+)/i.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (let k in dateList) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? dateList[k] : ("00" + dateList[k]).substr(("" + dateList[k]).length));
        }
    }
    return fmt;
}

/**
 *  @description: 字符串转时间戳
 *  @param dateStr：时间字符串；separator1: 年月日的分隔符；separator2：时分秒的分隔符
 *  @return number
 *  @author xrx
 *  @date 2019/5/10 10:12
 */
export function stringToStamp(dateStr, separator1 = "-", separator2 = ":") {
    if (!dateStr) {
        return null;
    }

    let dateArr = dateStr.split(" ");
    if (dateArr.length != 2) {
        return null;
    }

    let arr1 = dateArr[0].split(separator1);
    let year = parseInt(arr1[0]);
    let month;
    //处理月份为04这样的情况
    if (arr1[1].indexOf("0") == 0) {
        month = parseInt(arr1[1].substring(1));
    } else {
        month = parseInt(arr1[1]);
    }
    let day = parseInt(arr1[2]);

    let arr2 = dateArr[1].split(separator2);
    let hour = parseInt(arr2[0]);
    let min = parseInt(arr2[1]);
    let sec = parseInt(arr2[2]);

    let date = new Date(year, month - 1, day, hour, min, sec);
    return date.getTime();
}

/*16进制颜色转为RGB格式*/
export function colorRgb(color) {
    if (color instanceof Array) {
        return color.join(",");
    }

    //十六进制颜色值的正则表达式
    const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    let sColor = color.toLowerCase();
    if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
            let sColorNew = "#";
            for (let i = 1; i < 4; i += 1) {
                sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
            }
            sColor = sColorNew;
        }

        //处理六位的颜色值
        let sColorChange = [];
        for (let i = 1; i < 7; i += 2) {
            sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        return sColorChange.join(",");
    } else if (sColor && sColor.indexOf("rgb") != -1) {
        let temp = sColor.split("(")[1];
        temp = temp.slice(0, temp.length - 1);
        sColor = temp;
        return sColor;
    } else {
        return null;
    }
};

//坐标系转换
export function coordinateTransform(coord, coordinate1, coordinate2) {
    return transformProjection(coord, coordinate1, coordinate2);
}

//坐标系转换
export function extentTransform(extent, coordinate1, coordinate2) {
    return transformExtent(extent, coordinate1, coordinate2);
}

//判断坐标点是否在可视范围内
export function isInView(map, coord, projection) {
    let pro = projection || 'EPSG:4326';
    let view = map.getView();
    let size = map.getSize();
    let extent = view.calculateExtent(size);
    let requestedPosition;
    if (projection === 'pixel') {
        requestedPosition = coord;
    } else {
        requestedPosition = transformProjection(coord, pro, view.getProjection().getCode());
    }
    return containsCoordinate(extent, requestedPosition);
}

export function defineProj(name, code) {
    /*
    **  定义4523坐标系
    **  proj4.defs("EPSG:4523","+proj=tmerc +lat_0=0 +lon_0=105 +k=1 +x_0=35500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
    **  定义4549坐标系
    **  proj4.defs("EPSG:4549","+proj=tmerc +lat_0=0 +lon_0=120 +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs");
    */
    proj4.defs(name, code);
    register(proj4);
}

/**
 *  @description: 已知一个经纬度点位和像素距离数组，求另一个点位
 *  @param {Array} LonLat
 *  @param {Array} pixel
 *  @return {Array} LonLat
 *  @author xrx
 *  @date 2019/6/5 14:36
 */
export function getLonLatFromPixelDis(mapId, LonLat, pixel) {
    olData.getMap(mapId).then(map => {
        let ps = map.getPixelFromCoordinate(fromLonLat(LonLat));
        let ps2 = [ps[0] + pixel[0], ps[1] + pixel[1]];
        return map.getCoordinateFromPixel(ps2);
    })
}

//创建矢量图层
export function createVectorLayer(name = 'default') {
    let layer = new VectorLayer({
        source: new VectorSource(),
        zIndex: arguments[0] || 0
    });
    layer.set("name", name);
    return layer;
}

//创建样式
const styleMap = {
    'style': Style,
    'fill': Fill,
    'stroke': Stroke,
    'circle': CircleStyle,
    'icon': Icon,
    'image': ImageStyle,
    'regularshape': RegularShape,
    'text': Text
};

const optionalFactory = function (style, Constructor) {
    if (Constructor && style instanceof Constructor) {
        return style;
    } else if (Constructor) {
        return new Constructor(style);
    } else {
        return style;
    }
};
export const createStyle = function recursiveStyle(data, styleName) {
    let style;
    if (!styleName) {
        styleName = 'style';
        style = data;
    } else {
        style = data[styleName];
    }
    //Instead of defining one style for the layer, we've been given a style function
    //to apply to each feature.
    if (styleName === 'style' && data instanceof Function) {
        return data;
    }

    if (!(style instanceof Object)) {
        return style;
    }

    let styleObject;
    if (Object.prototype.toString.call(style) === '[object Object]') {
        styleObject = {};
        let styleConstructor = styleMap[styleName];
        if (styleConstructor && style instanceof styleConstructor) {
            return style;
        }
        Object.keys(style).forEach(function (val, idx, array) {
            //Consider the case
            //image: {
            //  circle: {
            //     fill: {
            //       color: 'red'
            //     }
            //   }
            //
            //An ol.style.Circle is an instance of ol.style.Image, so we do not want to construct
            //an Image and then construct a Circle.  We assume that if we have an instanceof
            //relationship, that the JSON parent has exactly one child.
            //We check to see if an inheritance relationship exists.
            //If it does, then for the parent we create an instance of the child.
            let valConstructor = styleMap[val];
            if (styleConstructor && valConstructor &&
                valConstructor.prototype instanceof styleMap[styleName]) {
                console.assert(array.length === 1, 'Extra parameters for ' + styleName);
                styleObject = recursiveStyle(style, val);
                return optionalFactory(styleObject, valConstructor);
            } else {
                if (val === 'geometry') {
                    styleObject[val] = style[val];
                } else {
                    styleObject[val] = recursiveStyle(style, val);

                    // if the value is 'text' and it contains a String, then it should be interpreted
                    // as such, 'cause the text style might effectively contain a text to display
                    if (val !== 'text' && typeof styleObject[val] !== 'string') {
                        styleObject[val] = optionalFactory(styleObject[val], styleMap[val]);
                    }
                }
            }
        });
    } else {
        styleObject = style;
    }
    return optionalFactory(styleObject, styleMap[styleName]);
}

/**
 *  @description: 获取扇形弧线上的坐标点
 *  @param {Number} startAngle  开始弧度
 *  @param {Number} endAngle    结束弧度
 *  @return {Array}
 *  @author xrx
 *  @date 2019/5/29 16:25
 */
export function getArcPoints(center, radius, startAngle, endAngle) {
    let x, y, pnts = [];
    let angleDiff = endAngle - startAngle;
    angleDiff = angleDiff < 0 ? angleDiff + Math.PI * 2 : angleDiff;
    const COUNT = 100;
    for (let i = 0; i <= COUNT; i++) {
        let angle = startAngle + angleDiff * (i / COUNT);
        x = center[0] + radius * Math.cos(angle);
        y = center[1] + radius * Math.sin(angle);

        pnts.push([x, y]);
    }
    return pnts;
}

/**
 *  @description: 米换算成当前坐标系下的单位
 *  @param {String} projection 当前地图的坐标系
 *  @param {Number} radiusMeter   长度（米）
 *  @return {Number}
 *  @author xrx
 *  @date 2019/5/20 19:00
 */
export function calcRadius(projection, radiusMeter) {
    if (radiusMeter) {
        if (projection != "pixel") {
            const perDegree = getProjection(projection).getMetersPerUnit();
            const radius = radiusMeter / perDegree;
            return radius;
        }

        return radiusMeter;
    }
    return 0;
}

//把对象/数组/函数转为ol需要的style格式
function transformStyleArray(inputStyle = []) {
    let style = [];
    if (inputStyle instanceof Array) {
        let {length} = inputStyle;
        if (length === 0) {
            return undefined;
        }
        for (let i = 0; i < length; i++) {
            style[i] = createStyle(inputStyle[i]);
        }
    }
    return style;
}

export function transformStyle(inputStyle) {
    let style = null;
    if (!inputStyle) {
        return undefined;
    }
    if (inputStyle instanceof Array) {
        style = transformStyleArray(inputStyle);
    } else if (isFunction(inputStyle)) {
        style = function (feature, resolution) {
            let obj = inputStyle(feature, resolution);
            let result = null;
            if (obj) {
                if (obj instanceof Array) {
                    result = transformStyleArray(obj);
                } else {
                    result = createStyle(obj);
                }
            }
            return result;
        }
    } else {
        style = createStyle(inputStyle);
    }
    return style;
}

//创建feature
export function createFeature(data, viewProjection) {
    let geometry;

    switch (data.type) {
        case 'Polygon':
            geometry = new Polygon(data.coords);
            break;
        case 'MultiPolygon':
            geometry = new MultiPolygon(data.coords);
            break;
        case 'LineString':
            geometry = new LineString(data.coords);
            break;
        case 'MultiLineString':
            geometry = new MultiLineString(data.coords);
            break;
        case 'Point':
            geometry = new Point(data.coords);
            break;
        case 'MultiPoint':
            geometry = new MultiPoint(data.coords);
            break;
        case 'Circle':
            geometry = new Circle(data.coords, data.radius);
            break;
        case 'Sector':  //扇形  ol扩展
            let coords = getArcPoints(data.coords, data.radius, data.startAngle, data.endAngle);
            coords.push(data.coords, coords[0]);
            geometry = new Polygon([coords]);
            break;
        default:
            if (data.coords) {
                geometry = new Point(data.coords);
            } else if ((data.lat || data.lat == 0) && (data.lon || data.lon == 0)) {
                geometry = new Point([data.lon, data.lat]);
            }
            break;
    }

    if (isDefined(data.projection) && data.projection !== 'pixel') {
        geometry = geometry.transform(data.projection, viewProjection);
    }

    const feature = new Feature({
        id: data.id,
        name: data.name,
        geometry: geometry
    });
    feature.setId(data.id);

    if (isDefined(data.style)) {
        feature.setStyle(transformStyle(data.style));
    }
    return feature;
}

//控件
export function getControlClasses() {
    return {
        attribution: Attribution,
        fullscreen: FullScreen,
        mouseposition: MousePosition,
        overviewmap: OverviewMap,
        rotate: Rotate,
        scaleline: ScaleLine,
        zoom: Zoom,
        zoomslider: ZoomSlider,
        zoomtoextent: ZoomToExtent
    };
}

export function detectControls(controls) {
    let actualControls = {};
    let controlClasses = getControlClasses();

    controls.forEach(function (control) {
        for (let i in controlClasses) {
            if (control instanceof controlClasses[i]) {
                actualControls[i] = control;
            }
        }
    });

    return actualControls;
}

//弹框
export function createOverlay(element, pos, id, stopEvent) {
    // element.style.display = 'block';
    let ov = new Overlay({
        id: id,
        element: element,
        positioning: 'top-left',
        insertFirst: false,
        stopEvent: stopEvent == undefined ? true : stopEvent
    });

    ov.setPosition(pos);
    return ov;
};

export function removeOverlay(map, id, property) {
    let layArr = map.getOverlays();
    const len = layArr.getLength();
    if (!id && !property) { //移除所有
        layArr.clear();
    } else if (id) {
        for (let i = len - 1; i >= 0; i--) {
            if (layArr.item(i).getId() == id) {
                layArr.removeAt(i);
            }
        }
    } else {
        for (let i = len - 1; i >= 0; i--) {
            if (layArr.item(i).get(property)) {
                layArr.removeAt(i);
            }
        }
    }
}

export function setLabelEvent(feature, map, data) {
    const viewProjection = map.getView().getProjection().getCode();
    let pos;
    if(data.projection!=='pixel') {
        if (data.coord && data.coord.length == 2) {
            pos = transformProjection(data.coord, data.projection, viewProjection);
        } else if (data.lon && data.lat) {
            pos = transformProjection([data.lon, data.lat], data.projection, viewProjection);
        }
    }else {
        pos = data.coord||[data.lon, data.lat];
    }
    //如果没有内容，就不产生弹出框
    if (!data.label && !data.label.message) {
        return;
    }

    let layEle = document.createElement('div');
    layEle.className = data.label.classNm;
    layEle.innerHTML = data.label.message;

    let label = createOverlay(layEle, pos, data.label.id, data.label.stopEvent);

    map.addOverlay(label);

    //关联起feature和overLay
    if (feature) {
        feature.set("overLay", label);
    }

    return label;
}

export function getGeodesicDistance(projection, point1, point2) {
    if (projection == "pixel") {
        return Math.sqrt((point1[0] - point2[0]) * (point1[0] - point2[0]) + (point1[1] - point2[1]) * (point1[1] - point2[1]));
    }
    let point11 = transformProjection(point1, projection, 'EPSG:4326'),
        point21 = transformProjection(point2, projection, 'EPSG:4326');
    let s = Sphere.getDistance(point11, point21, 6378137);
    return s;
}

export function normalize(type) {
    const kernels = {
        none: [1, 0, 0, 0, 1, 0, 0, 0, 1],
        gray: [0.33, 0.34, 0.33, 0.33, 0.34, 0.33, 0.33, 0.34, 0.33],
        sepia: [0.393, 0.769, 0.189, 0.349, 0.686, 0.168, 0.272, 0.534, 0.131],
        test: [0.299, 0.587, 0.114, 0.299, 0.587, 0.114, 0.299, 0.587, 0.144]
    };
    let kernel = kernels[type];
    const len = kernel.length;
    const normal = new Array(len);

    for (let i = 0; i < len; ++i) {
        normal[i] = kernel[i] / 1;
    }
    return normal;
}

function grayfilter(r, g, b) {
    const color = new Array(3);
    const grayFilterColorBar = [[0, 12, 43, 1], [129, 150, 173, 1], [0, 28, 55, 1]];
    const grayFilterPerBar = [0, 0.72, 1]; //设置瓦片图层的样式为DARKGREEN
    const size = grayFilterPerBar.length;
    for (let i = 0; i < size - 1; ++i) {
        const minPer = grayFilterPerBar[i];
        const minColor = grayFilterColorBar[i];
        const maxPer = grayFilterPerBar[i + 1];
        const maxColor = grayFilterColorBar[i + 1];
        if (r <= maxPer * 255) {
            color[0] = (r / 255 - minPer) / (maxPer - minPer) * (maxColor[0] - minColor[0]) + minColor[0];
        }
        if (g <= maxPer * 255) {
            color[1] = (g / 255 - minPer) / (maxPer - minPer) * (maxColor[1] - minColor[1]) + minColor[1];
        }
        if (b <= maxPer * 255) {
            color[2] = (b / 255 - minPer) / (maxPer - minPer) * (maxColor[2] - minColor[2]) + minColor[2];
        }
    }

    return color;
}

/**
 * Apply a convolution kernel to canvas.  This works for any size kernel, but
 * performance starts degrading above 3 x 3.
 * @param {CanvasRenderingContext2D} context Canvas 2d context.
 * @param {Array<number>} kernel Kernel.
 */
export function convolve(context, kernel) {
    const canvas = context.canvas;
    const width = canvas.width;
    const height = canvas.height;

    const size = Math.sqrt(kernel.length);
    const half = Math.floor(size / 2);

    const inputData = context.getImageData(0, 0, width, height).data;

    const output = context.createImageData(width, height);
    const outputData = output.data;

    for (let i = 0; i < outputData.length; i += 4) {
        const r = inputData[i];
        const g = inputData[i + 1];
        const b = inputData[i + 2];
        const a = inputData[i + 3];
        let filtercolor = "color";

        if (filtercolor) {
            let color = grayfilter((r * kernel[0] + g * kernel[1] + b * kernel[2]),
                (r * kernel[3] + g * kernel[4] + b * kernel[5]), (r * kernel[6] + g * kernel[7] + b * kernel[8]));
            outputData[i] = color[0];
            outputData[i + 1] = color[1];
            outputData[i + 2] = color[2];
        } else {
            outputData[i] = (r * kernel[0] + g * kernel[1] + b * kernel[2] + a * 0 + 0);
            outputData[i + 1] = (r * kernel[3] + g * kernel[4] + b * kernel[5] + a * 0 + 0);
            outputData[i + 2] = (r * kernel[6] + g * kernel[7] + b * kernel[8] + a * 0 + 0);
        }
        outputData[i + 3] = a;
    }

    //for (var pixelY = 0; pixelY < height; ++pixelY) {
    //  var pixelsAbove = pixelY * width;
    //  for (var pixelX = 0; pixelX < width; ++pixelX) {
    //	var r = 0, g = 0, b = 0, a = 0;
    //	for (var kernelY = 0; kernelY < size; ++kernelY) {
    //	  for (var kernelX = 0; kernelX < size; ++kernelX) {
    //		var weight = kernel[kernelY * size + kernelX];
    //		var neighborY = Math.min(
    //		  height - 1, Math.max(0, pixelY + kernelY - half));
    //		var neighborX = Math.min(
    //		  width - 1, Math.max(0, pixelX + kernelX - half));
    //		var inputIndex = (neighborY * width + neighborX) * 4;
    //		r += inputData[inputIndex] * weight;
    //		g += inputData[inputIndex + 1] * weight;
    //		b += inputData[inputIndex + 2] * weight;
    //		a += inputData[inputIndex + 3] * weight;
    //	  }
    //	}
    //	var outputIndex = (pixelsAbove + pixelX) * 4;
    //	outputData[outputIndex] = r;
    //	outputData[outputIndex + 1] = g;
    //	outputData[outputIndex + 2] = b;
    //	outputData[outputIndex + 3] = kernel.normalized ? a : 255;
    //  }
    //}
    context.putImageData(output, 0, 0);
}

//节流  比如触发点击事件，防止频繁误点操作，减少回调执行次数
export function throttle(fn, interval = 300) {
    let canRun = true;
    return function () {
        if (!canRun) return;
        canRun = false;
        fn.apply(this, arguments);
        setTimeout(() => {
            canRun = true;
        }, interval);
    };
}

//消抖  比如输入联想这种，当停止输入的时候再搜索
export function debounce(fn, interval = 300) {
    let timeout = null;
    return function () {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            fn.apply(this, arguments);
        }, interval);
    };
}
