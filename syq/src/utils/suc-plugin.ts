// import ECharts from 'vue-echarts';
// import 'echarts/lib/chart/bar'
// import 'echarts/lib/chart/line'
// import 'echarts/lib/chart/pie'
// import 'echarts/lib/chart/map'
// import 'echarts/lib/chart/radar'
// import 'echarts/lib/chart/scatter'
// import 'echarts/lib/chart/effectScatter'
// import 'echarts/lib/component/tooltip'
// import 'echarts/lib/component/polar'
// import 'echarts/lib/component/geo'
// import 'echarts/lib/component/legend'
// import 'echarts/lib/component/title'
// import 'echarts/lib/component/visualMap'
// import 'echarts/lib/component/dataset'
import ECharts from "@/components/ECharts.vue";

const URL = "http://172.25.150.135:8080";

//通用方法集合
const utils = {
    //时间戳转换成自定义字符串
    dateFormat: (date: any, fmt: string) => {
        if (date) {
            let dateList: any = {
                "M+": date.getMonth() + 1,
                "d+": date.getDate(),
                "H+": date.getHours(),
                "m+": date.getMinutes(),
                "s+": date.getSeconds(),
                "q+": Math.floor((date.getMonth() + 3) / 3),
                "S+": date.getMilliseconds()
            };
            if (/(y+)/i.test(fmt)) {
                fmt = fmt.replace(
                    RegExp.$1,
                    (date.getFullYear() + "").substr(4 - RegExp.$1.length)
                );
            }
            for (var k in dateList) {
                if (new RegExp("(" + k + ")").test(fmt)) {
                    fmt = fmt.replace(
                        RegExp.$1,
                        RegExp.$1.length == 1
                            ? dateList[k]
                            : ("00" + dateList[k]).substr(
                                  ("" + dateList[k]).length
                              )
                    );
                }
            }
            return fmt;
        } else {
            return "-";
        }
    },
    deepCopy: (obj: any) => {
        let result = Array.isArray(obj) ? [] : {};
        for (let key in obj) {
            if (obj[key] !== null) {
                if (obj.hasOwnProperty(key)) {
                    if (typeof obj[key] === "object") {
                        // @ts-ignore
                        result[key] = utils.deepCopy(obj[key]); //递归复制
                    } else {
                        // @ts-ignore
                        result[key] = obj[key];
                    }
                }
            } else {
                // @ts-ignore
                result[key] = null;
            }
        }
        return result;
    },
    // 生成下载链接
    formatURL: (inter: string, params: any) => {
        let url = URL + inter;
        url = Object.entries(params).reduce(
            (result: any, now: any, index: any) => {
                if (index === 0) {
                    result += `?${now[0]}=${now[1]}`;
                } else {
                    result += `&${now[0]}=${now[1]}`;
                }
                return result;
            },
            inter
        );
        return url;
    },
    checkUser(role: string, allow: any) {
        if (role == "admin") return true;
        if (role == "super") {
            if (allow == "admin") {
                return false;
            } else {
                return true;
            }
        }
        if (role == "middle") {
            if (allow == "admin" || allow == "super") {
                return false;
            } else {
                return true;
            }
        }
        if (role == "public" && allow == "public") {
            return true;
        } else {
            return false;
        }
    },
    selectByCode() {
        if (window.location.href.split("?code=") != undefined) {
            return window.location.href.split("?code=")[1];
        } else {
            return "";
        }
    }
    //节流防抖
    /*debounce: (fn: any, t: any) => {
        let delay = t || 500;
        let timer: any;
        console.log(fn);
        console.log(typeof fn);
        return function() {
            let vm: any = this;
            let args = arguments;
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                timer = null;
                fn.apply(vm, args);
            }, delay);
        };
    }*/
};

//地图类
class Map {
    map: any;

    constructor(common?: any) {
        //constructor是一个构造方法，用来接收参数
        if (common) {
            Object.assign(this, common);
        } else {
            Object.assign(this, utils.deepCopy((<any>window).mapConfig));
        }
    }

    setCenter(coords: any, projection: any) {
        if (coords instanceof Array) {
            this.map.view.center.coord = [
                parseFloat(coords[0]),
                parseFloat(coords[1])
            ];
        }
        if (projection) {
            this.map.view.center.projection = projection;
        }
    }

    setZoom(zoom: any) {
        if (zoom) {
            this.map.view.zoom = zoom;
        }
    }

    setCenterZoom(coords: any, zoom: any, projection: any) {
        this.setCenter(coords, projection);
        this.setZoom(zoom);
    }
}

export default {
    install: (Vue: any, options: any) => {
        //时间转换过滤器
        Vue.filter("dateFormat", utils.dateFormat);

        //echarts的vue组件
        Vue.component("v-chart", ECharts);

        //将方法集添加到Vue实例上面去
        Vue.prototype.$utils = utils;

        //返回地图对象
        Vue.prototype.$getMapConfig = function() {
            return new Map();
        };
    }
};
