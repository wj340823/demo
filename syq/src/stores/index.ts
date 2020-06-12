import Vue from "vue";
import Vuex from "vuex";
import $http from "axios";
import solidWaterDeficit from "./modules/solidWaterDeficit";
import mapCommon from "./modules/map";
import waterAndRain from "./modules/waterAndRain";
import storm from "./modules/storm";

Vue.use(Vuex);
const img: any = require("../assets/map/hoverLocating.png");
const point: any[] = [];
const userInfo: any = {
    name: "",
    roles: "public",
    account: ""
};
const netUrl: any = "https://sqfb.zjsq.net.cn:8089"; // 浙江地图服务地址前缀
const selectArea: any = "";

const center: any = null;
const cloud_pic: any = null;
const ld_pic: any = null;
const jy_pic: any = null;
const zoom = 8;
const ld_time = null;
const yt_time = null;
const yjgs = [
    {
        title: "雨情信息 (单位:毫米)",
        list: [
            {
                title: "前1小时超30mm",
                count: 0,
                list: []
            },
            {
                title: "前3小时超50mm",
                count: 0,
                list: []
            },
            {
                title: "前24小时超100mm",
                count: 0,
                list: []
            }
        ],
        show: true
    },
    {
        title: "水库信息 (单位:米)",
        list: [
            {
                title: "大中型超限",
                count: 0,
                list: []
            },
            {
                title: "小型超限",
                count: 0,
                list: []
            },
            {
                title: "其他超限",
                count: 0,
                list: []
            }
        ],
        show: true
    },
    {
        title: "河道信息 (单位:米)",
        list: [
            {
                title: "超警戒",
                count: 0,
                list: []
            },
            {
                title: "超保证",
                count: 0,
                list: []
            }
        ],
        show: true
    },
    {
        title: "闸坝信息 (单位:米)",
        list: [
            {
                title: "超警戒",
                count: 0,
                list: []
            },
            {
                title: "超保证",
                count: 0,
                list: []
            }
        ],
        show: true
    },
    {
        title: "潮汐信息 (单位:米)",
        list: [
            {
                title: "超警戒",
                count: 0,
                list: []
            },
            {
                title: "超保证",
                count: 0,
                list: []
            }
        ],
        show: true
    }
];
const bjxx = [
    {
        title: "预报报警信息 (单位:毫米)",
        list: [],
        show: true
    },
    {
        title: "雨量超警信息 (单位:毫米)",
        list: [
            {
                title: "前1小时超30mm",
                count: 0,
                list: []
            },
            {
                title: "前3小时超50mm",
                count: 0,
                list: []
            },
            {
                title: "前24小时超100mm",
                count: 0,
                list: []
            }
        ],
        show: true
    },
    {
        title: "水库信息 (单位:米)",
        list: [
            {
                title: "大中型超限",
                count: 0,
                list: []
            },
            {
                title: "小型超限",
                count: 0,
                list: []
            },
            {
                title: "其他超限",
                count: 0,
                list: []
            }
        ],
        show: true
    },
    {
        title: "河道信息 (单位:米)",
        list: [
            {
                title: "超警戒",
                count: 0,
                list: []
            },
            {
                title: "超保证",
                count: 0,
                list: []
            }
        ],
        show: true
    },
    {
        title: "闸坝信息 (单位:米)",
        list: [
            {
                title: "超警戒",
                count: 0,
                list: []
            },
            {
                title: "超保证",
                count: 0,
                list: []
            }
        ],
        show: true
    },
    {
        title: "潮汐信息 (单位:米)",
        list: [
            {
                title: "超警戒",
                count: 0,
                list: []
            },
            {
                title: "超保证",
                count: 0,
                list: []
            }
        ],
        show: true
    }
];
const netGrid = [
    { "3829": [118.51928710899995, 28.285095215000013] },
    { "3593": [118.34069824199997, 29.442413330000022] },
    { "3594": [118.89221191399997, 29.453002929500002] },
    { "3595": [119.446533203, 29.453002929500002] },
    { "3596": [118.41210716266531, 29.37113570217978] },
    { "3597": [120.55511474600002, 29.453002929500002] },
    { "3598": [121.10931396450002, 29.453002929500002] },
    { "3599": [121.66369628899997, 29.45309448200001] },
    { "3601": [121.96771240200002, 29.58389282249999] },
    { "3603": [121.962310791, 29.447784423499996] },
    { "3610": [121.96139526350004, 29.256896972500016] },
    { "3614": [121.57119751000005, 29.225830078] },
    { "3616": [121.55691528300002, 29.00332641600002] },
    { "3617": [121.7080078125, 29.20449829100002] },
    { "3291": [119.67010498050001, 31.100311279500005] },
    { "3292": [119.861236572, 31.102996826500004] },
    { "3371": [119.47833251949999, 30.802001953499996] },
    { "3372": [120.00082397450001, 30.802001953499996] },
    { "3373": [120.55511474600002, 30.790222167999985] },
    { "3374": [121.04901123000002, 30.802001953499996] },
    { "3447": [119.00592041049998, 30.243225097499987] },
    { "3448": [119.446533203, 30.352325439499992] },
    { "3449": [120.00082397450001, 30.352325439499992] },
    { "3450": [120.55511474600002, 30.352325439499992] },
    { "3526": [121.10931396450002, 29.902618407999995] },
    { "3527": [122.03860473600002, 29.848205566500013] },
    { "3451": [120.92440795850001, 30.461608886999983] },
    { "3452": [121.10931396450002, 30.228515625] },
    { "3453": [121.46432495099998, 30.20541381800001] }, //121.46432495099998 , 30.20541381800001
    { "3455": [121.66339111299999, 29.90280151350001] }, //121.66339111299999 , 29.90280151350001
    { "3522": [118.91970825200002, 29.902618407999995] },
    { "3523": [119.446533203, 29.902618407999995] },
    { "3524": [120.00082397450001, 29.902618407999995] },
    { "3525": [120.55511474600002, 29.902618407999995] },
    { "3761": [121.52362060550001, 28.55361938500002] },
    { "3763": [121.5882263185, 28.28952026349998] },
    { "3764": [120.98870849600002, 28.157196044999978] },
    { "3766": [121.42340087899998, 28.269012451500004] },
    { "3830": [118.89221191399997, 28.104003906499997] },
    { "3831": [119.446533203, 28.104003906499997] },
    { "3832": [120.00082397450001, 28.104003906499997] },
    { "3833": [120.55511474600002, 28.104003906499997] },
    { "3834": [121.25848388649996, 28.18411254899999] },
    { "3838": [120.84899902300003, 27.925201415999993] },
    { "3898": [118.99572753899997, 27.654418945499998] },
    { "3899": [119.446533203, 27.654296875] },
    { "3900": [120.00082397450001, 27.654296875] },
    { "3901": [120.55511474600002, 27.654296875] },
    { "3902": [120.84420776350004, 27.869323730499985] },
    { "3947": [120.00082397450001, 27.364807129000013] },
    { "3618": [121.8692932125, 29.194915771500007] },
    { "3619": [121.94461059550002, 29.216400146500007] },
    { "3620": [121.6284179685, 29.205200195000003] },
    { "3683": [118.04040527349997, 29.151702881000006] },
    { "3684": [118.337890625, 29.00332641600002] },
    { "3685": [118.89221191399997, 29.00332641600002] },
    { "3686": [119.446533203, 29.00332641600002] },
    { "3687": [120.00082397450001, 29.00332641600002] },
    { "3688": [120.55511474600002, 29.00332641600002] },
    { "3689": [121.10931396450002, 29.00332641600002] },
    { "3755": [118.49468994099999, 28.55361938500002] },
    { "3756": [118.89221191399997, 28.55361938500002] },
    { "3757": [119.446533203, 28.55361938500002] },
    { "3758": [120.00082397450001, 28.55361938500002] },
    { "3759": [120.55511474600002, 28.55361938500002] },
    { "3760": [121.10931396450002, 28.553436279500005] },
    { "3903": [120.46121215850002, 27.298614501999992] },
    { "3946": [119.45208740250001, 27.41448974649998] }
];
const measure = {
    disabled: true
};
const forecast: any = {
    show: false,
    point: [],
    data: []
};
const nextThree: any = {
    visible: false,
    data: {}
};
const dataFmt = (arr: any[], type: string, isAlarmed: any = true) => {
    let targetArr: any[] = [];
    arr.forEach(function(item: any) {
        if (type == "yl") {
            if (isAlarmed) {
                targetArr.push({
                    name:
                        item.zm +
                        "(" +
                        (item.sss !== null ? item.sss.slice(0, 1) : "") +
                        " - " +
                        (item.ssx !== null ? item.ssx.slice(0, 2) : "") +
                        ")" +
                        " " +
                        item.yl.toFixed(1),
                    lon: item.jd,
                    lat: item.wd,
                    info: item,
                    alarmed: item.alarmed || false,
                    yl: item.yl.toFixed(1)
                });
            } else {
                if (item.alarmed == undefined) {
                    targetArr.push({
                        name:
                            item.zm +
                            "(" +
                            (item.sss !== null ? item.sss.slice(0, 1) : "") +
                            " - " +
                            (item.ssx !== null ? item.ssx.slice(0, 2) : "") +
                            ")" +
                            " " +
                            item.yl.toFixed(1),
                        lon: item.jd,
                        lat: item.wd,
                        info: item,
                        alarmed: item.alarmed || false,
                        yl: item.yl.toFixed(1)
                    });
                }
            }
        } else if (type == "sk") {
            //水库
            targetArr.push({
                name:
                    item.zm +
                    "(" +
                    (item.sss !== null ? item.sss.slice(0, 1) : "") +
                    " - " +
                    (item.ssx !== null ? item.ssx.slice(0, 2) : "") +
                    ")" +
                    item.sw.toFixed(2) +
                    " " +
                    "(汛限：" +
                    (item.xxsw || "-") +
                    ")" +
                    (item.zc && item.zc != 0
                        ? item.zc > 0
                            ? "↑ " + item.zc
                            : "↓ " + item.zc
                        : " -"),
                lon: item.jd || item.LGTD,
                lat: item.wd || item.LTTD,
                info: item
            });
        } else if (type == "ll") {
            targetArr.push({
                name:
                    item.zm +
                    "(" +
                    (item.sss !== null ? item.sss.slice(0, 1) : "") +
                    " - " +
                    (item.ssx !== null ? item.ssx.slice(0, 2) : "") +
                    ")" +
                    item.sw +
                    "(警戒：" +
                    (item.jjsw || "-") +
                    ")" +
                    (item.zc && item.zc != 0
                        ? item.zc > 0
                            ? "↑ " + item.zc
                            : "↓ " + item.zc
                        : " -"),
                lon: item.jd,
                lat: item.wd,
                info: item
            });
        } else {
            targetArr.push({
                name:
                    item.zm +
                    "(" +
                    (item.sss !== null ? item.sss.slice(0, 1) : "") +
                    " - " +
                    (item.ssx !== null ? item.ssx.slice(0, 2) : "") +
                    ")" +
                    " " +
                    item.sw +
                    "(警戒：" +
                    item.jjsw +
                    "保证：" +
                    item.bzsw +
                    ")" +
                    (item.zc && item.zc != 0
                        ? item.zc > 0
                            ? "↑ " + item.zc
                            : "↓ " + item.zc
                        : " -"),
                lon: item.jd,
                lat: item.wd,
                zh: item.zh,
                info: item
            });
        }
    });
    return targetArr;
};
const deepCopy = (data: any) => {
    if (!data || typeof data != "object") return data;
    return JSON.parse(JSON.stringify(data));
};
const state: any = {
    uid: 0,
    userInfo, //用户信息
    netUrl, //基础地址
    point, //点击列表获取点位
    center, //定位地图中心点
    selectArea, //选择区域
    cloud_pic,
    ld_pic,
    jy_pic,
    mapLoading: false,
    //未来降雨浙江图层
    futureImgUrl: "",
    solidPicUrl: null,
    zoom, //地图层级
    hoverPoint: {
        //列表鼠标悬浮，地图互动点位
        show: false,
        options: {}
    },
    forLayer: {},
    ld_time,
    yt_time,
    forecast,
    nextThree,
    netGrid,
    loginStatus: false,
    alarmType: true,
    alarmTimer: 0,
    alarmAudioShow: false,
    alarmDialogShow: false,
    measure,
    alarmResult: {
        loading: false,
        gsxx: deepCopy(yjgs),
        gsxxFilter: deepCopy(bjxx),
        timeList: {
            selected: "1小时",
            list: [
                { label: "1小时" },
                { label: "3小时" },
                { label: "6小时" },
                { label: "12小时" },
                { label: "24小时" }
            ]
        },
        thList: {
            ylxx: [
                {
                    label: "站号",
                    value: "number",
                    fixed: "left"
                },
                {
                    label: "站名",
                    value: "name",
                    fixed: "left"
                },
                {
                    label: "雨量",
                    value: "value"
                }
            ]
        },
        tbDate: [],
        thCj: [
            {
                label: "站号",
                value: "number"
            },
            {
                label: "站名",
                value: "name"
            }
        ],
        cjList: [],
        pointData: [],
        storeData: []
    },
    alarmSearch: {
        show: true,
        zlxz: {
            selected: ["水库", "河道", "闸坝", "潮汐"], //'水库' ,'河道' ,'堰闸', '潮汐'
            list: [
                { label: "水库" },
                { label: "河道" },
                { label: "闸坝" },
                { label: "潮汐" }
            ]
        }, //站类选择
        sklx: {
            selected: ["大型", "中型", "小一", "其他(含小二)"], //'大型' ,'中型' ,'小一', '其他(含小二)'
            list: [
                { label: "大型" },
                { label: "中型" },
                { label: "小一" },
                { label: "其他(含小二)" }
            ]
        }, //水库类型,
        //参数值设定
        numItem: [
            //0.05 0.2 0.1,0.03 0.05 0.1 0.08//闸坝，潮位，大型，中型，小一，小二（其他）
            {
                default: 0.05,
                label: "河道",
                key: "river",
                step: 0.01
            },
            {
                default: 0.2,
                label: "闸坝",
                step: 0.01,
                key: "was"
            },
            {
                default: 0.1,
                label: "潮位",
                step: 0.01,
                key: "tide"
            },
            {
                default: 0.03,
                label: "大型",
                step: 0.01,
                key: "large"
            },
            {
                default: 0.05,
                label: "中型",
                step: 0.01,
                key: "mid"
            },
            {
                default: 0.1,
                label: "小一",
                step: 0.01,
                key: "smallone"
            },
            {
                default: 0.08,
                label: "小二（其他）",
                step: 0.01,
                key: "smalltwo"
            }
        ]
    },
    /*标会图层数据*/
    plot: {
        type: "",
        isSingle: true,
        hasFeatures: []
    },
    //洪水预警 洪水分析点位
    flood: {
        layer: {
            visible: false,
            data: {}
        },
        analyse: {
            show: false,
            point: [],
            data: {}
        }
    },
    //报讯流量点位
    flowPoint: [],
    map: {
        points: [],
        overlay: {
            visible: false,
            data: {}
        }
    },
    regionsForRender: {
        data: null,
        opacity: 0,
        show: true,
        type: "",
        range: ""
    },
    selectDmId: "",
    nextData: [],
    dynamicComponent: {
        name: "",
        visible: false,
        position: [0, 0],
        data: {}
    },
    //叠加页面
    pagesShow: { 气象雷达: false, 风暴潮: false },
    legendType: "1"
};
const actions: any = {
    async initAlarmResult(context: any) {
        let hour: any = new Date().getHours();
        let result = context.state.alarmResult;
        result.gsxx = deepCopy(yjgs);
        result.gsxxFilter = deepCopy(bjxx);
        let postbody: any = deepCopy(context.state.alarmSearch);
        let zlxz: string = "",
            sklx: string = "";
        //水库RR 河道ZZ，ZQ 闸吧 DD 潮汐TT
        let numObj: any = {};
        if (postbody.zlxz.selected.length) {
            postbody.zlxz.selected.forEach(function(s: any) {
                switch (s) {
                    case "水库":
                        zlxz += "RR,";
                        //numObj.RR = postbody.numItem[0].default
                        break;
                    case "河道":
                        zlxz += "ZZ,ZQ,";
                        numObj.ZZ = postbody.numItem[0].default;
                        numObj.ZQ = postbody.numItem[0].default;
                        break;
                    case "闸坝":
                        zlxz += "DD,";
                        numObj.DD = postbody.numItem[1].default;
                        break;
                    case "潮汐":
                        zlxz += "TT,";
                        numObj.TT = postbody.numItem[2].default;
                        break;
                }
            });
        }
        //'大型' ,'中型' ,'小一', '其他(含小二)'
        if (postbody.sklx.selected.length) {
            postbody.sklx.selected.forEach(function(s: any) {
                switch (s) {
                    case "大型":
                        sklx += "4,5,";
                        numObj["4"] = postbody.numItem[3].default;
                        numObj["5"] = postbody.numItem[3].default;
                        break;
                    case "中型":
                        sklx += "3,";
                        numObj["3"] = postbody.numItem[4].default;
                        break;
                    case "小一":
                        sklx += "2,";
                        numObj["2"] = postbody.numItem[5].default;
                        break;
                    case "其他(含小二)":
                        sklx += "1,9,";
                        numObj["1"] = postbody.numItem[6].default;
                        numObj["9"] = postbody.numItem[6].default;
                        break;
                }
            });
        }
        let params: any = {
            areaFlag: 1, //地区标识（1行政区2流域）
            zl: zlxz, //站类选择
            sklx: sklx, //水库类型
            bxdj: "1,2,3,4,5",
            sfcj: 1 //是否超警0所有1超警
        };
        let params1: any = {
            areaFlag: 1
        };
        context.commit("setAlarmResultLoading", true);
        context.commit("setAlarmResultPointData", []);
        await $http
            .get("/rest/water/getNewDataList", { params: params })
            .then((res: any) => {
                for (let key in res.data) {
                    result.tbDate[key] = [];
                    let img: any = "";
                    switch (key) {
                        case "cjj":
                            img = "water_jjz.png";
                            break;
                        case "cbz":
                            img = "water_bzz.png";
                            break;
                        case "cx":
                            img = "water_xx.png";
                            break;
                    }
                    if (res.data[key].length > 0) {
                        //超警戒 超限 超保证 其他
                        res.data[key].forEach(function(
                            item: any,
                            index: number
                        ) {
                            switch (item.zl) {
                                case "RR":
                                    let targetArr: any = result.gsxx[1].list;
                                    let yjyqArr: any =
                                        result.gsxxFilter[2].list;
                                    if (
                                        item.sklx == 3 ||
                                        item.sklx == 4 ||
                                        item.sklx == 5
                                    ) {
                                        targetArr[0].count++;
                                        targetArr[0].list.push(item);
                                        if (item.zc >= numObj[item.sklx]) {
                                            yjyqArr[0].count++;
                                            yjyqArr[0].list.push(item);
                                        }
                                    } else if (item.sklx == 2) {
                                        targetArr[1].count++;
                                        targetArr[1].list.push(item);
                                        if (item.zc > numObj[item.sklx]) {
                                            yjyqArr[1].count++;
                                            yjyqArr[1].list.push(item);
                                        }
                                    } else if (
                                        item.sklx == 1 ||
                                        item.sklx == 9
                                    ) {
                                        targetArr[2].count++;
                                        targetArr[2].list.push(item);
                                        if (item.zc >= numObj[item.sklx]) {
                                            yjyqArr[2].count++;
                                            yjyqArr[2].list.push(item);
                                        }
                                    }
                                    break;
                                case "ZZ":
                                    let targetArr2: any = result.gsxx[2].list;
                                    let yjyqArr2: any =
                                        result.gsxxFilter[3].list;
                                    if (key == "cjj") {
                                        targetArr2[0].count++;
                                        targetArr2[0].list.push(item);
                                        if (item.zc >= numObj.ZZ) {
                                            yjyqArr2[0].count++;
                                            yjyqArr2[0].list.push(item);
                                        }
                                    } else if (key == "cbz") {
                                        targetArr2[1].count++;
                                        targetArr2[1].list.push(item);
                                        if (item.zc >= numObj.ZZ) {
                                            yjyqArr2[1].count++;
                                            yjyqArr2[1].list.push(item);
                                        }
                                    }
                                    break;
                                case "ZQ":
                                    let targetArr3: any = result.gsxx[2].list;
                                    let yjyqArr3: any =
                                        result.gsxxFilter[3].list;
                                    if (key == "cjj") {
                                        targetArr3[0].count++;
                                        targetArr3[0].list.push(item);
                                        if (item.zc >= numObj.ZQ) {
                                            yjyqArr3[0].count++;
                                            yjyqArr3[0].list.push(item);
                                        }
                                    } else if (key == "cbz") {
                                        targetArr3[1].count++;
                                        targetArr3[1].list.push(item);
                                        if (item.zc >= numObj.ZQ) {
                                            yjyqArr3[1].count++;
                                            yjyqArr3[1].list.push(item);
                                        }
                                    }
                                    break;
                                case "DD":
                                    let targetArr4: any = result.gsxx[3].list;
                                    let yjyqArr4: any =
                                        result.gsxxFilter[4].list;
                                    if (key == "cjj") {
                                        targetArr4[0].count++;
                                        targetArr4[0].list.push(item);
                                        if (item.zc >= numObj.DD) {
                                            yjyqArr4[0].count++;
                                            yjyqArr4[0].list.push(item);
                                        }
                                    } else if (key == "cbz") {
                                        targetArr4[1].count++;
                                        targetArr4[1].list.push(item);
                                        if (item.zc >= numObj.DD) {
                                            yjyqArr4[1].count++;
                                            yjyqArr4[1].list.push(item);
                                        }
                                    }
                                    break;
                                case "TT":
                                    let targetArr5: any = result.gsxx[4].list;
                                    let yjyqArr5: any =
                                        result.gsxxFilter[5].list;
                                    if (key == "cjj") {
                                        targetArr5[0].count++;
                                        targetArr5[0].list.push(item);
                                        if (item.zc >= numObj.TT) {
                                            yjyqArr5[0].count++;
                                            yjyqArr5[0].list.push(item);
                                        }
                                    } else if (key == "cbz") {
                                        targetArr5[1].count++;
                                        targetArr5[1].list.push(item);
                                        if (item.zc >= numObj.TT) {
                                            yjyqArr5[1].count++;
                                            yjyqArr5[1].list.push(item);
                                        }
                                    }
                                    break;
                            }
                            result.tbDate[key].push({
                                index: index + 1,
                                city: item.sss,
                                county: item.ssx,
                                time: item.sbsj,
                                name: item.zm,
                                jj: item.jjsw,
                                bzsw: item.bzsw,
                                zc: item.zc,
                                xx: item.xxsw,
                                kr: item.kr,
                                sw: item.sw,
                                lon: item.jd,
                                lat: item.wd,
                                zh: item.zh
                            });
                            item.img = img;
                            result.pointData.push(item);
                        });
                    }
                }
                result.gsxx.forEach(function(i: any, j: number) {
                    if (j == 1) {
                        i.list.forEach(function(m: any, n: number) {
                            if (m.list.length > 0) {
                                i.list[n].list = dataFmt(
                                    deepCopy(m.list),
                                    "sk"
                                );
                            }
                            //i.list[n].list = arr
                        });
                    } else if (j > 1) {
                        i.list.forEach(function(m: any, n: number) {
                            if (m.list.length > 0) {
                                i.list[n].list = dataFmt(
                                    deepCopy(m.list),
                                    "ll"
                                );
                            }
                        });
                    }
                });
                result.gsxxFilter.forEach(function(i: any, j: number) {
                    if (j == 2) {
                        i.list.forEach(function(m: any, n: number) {
                            if (m.list.length > 0) {
                                i.list[n].list = dataFmt(
                                    deepCopy(m.list),
                                    "sk"
                                );
                            }
                            //i.list[n].list = arr
                        });
                    } else if (j > 2) {
                        i.list.forEach(function(m: any, n: number) {
                            if (m.list.length > 0) {
                                i.list[n].list = dataFmt(deepCopy(m.list), "");
                            }
                        });
                    }
                });
            })
            .catch((res: any) => {});
        await $http
            .get("rest/forcast/getForcastList?hour=0")
            .then((res: any) => {
                if (res.data.length) {
                    let key = res.data[0].xxsw ? "sk" : "ll";
                    let obj: any = [];
                    res.data.forEach((item: any) => {
                        item.lon = item.LGTD;
                        item.lat = item.LTTD;
                        obj.push(item);
                    });
                    /*result.gsxxFilter[0].list = JSON.parse(
                        JSON.stringify(dataFmt(obj, key))
                    );*/
                }
            });
        await $http
            .get("/rest/rain/getRainCount", {
                params: params1
            })
            .then(function(res: any) {
                /*res.data = {
                    t2415: [
                        {
                            jd: 121.884909,
                            ly: "独立入海河流",
                            sss: "宁波市",
                            ssx: "象山县",
                            wd: 29.504523,
                            yl: 0.5,
                            zh: "70703760",
                            zm: "里考坑水库"
                        }
                    ]
                };*/
                let targetArr: any = result.gsxx[0].list;
                let yjArr = result.gsxxFilter[1].list;
                //@ts-ignore
                let list: any = JSON.parse(sessionStorage.getItem("alarmlist"));
                let alarmList: any = [];
                let isAlarmed = true;
                for (let key in res.data) {
                    alarmList.push(...res.data[key]);
                    if (sessionStorage.getItem("hour")) {
                        if (sessionStorage.getItem("hour") == hour) {
                            if (list && list.length) {
                                res.data[key].forEach((item: any) => {
                                    list.forEach((sing: any) => {
                                        if (item.zh == sing.zh) {
                                            item.alarmed = true;
                                        }
                                    });
                                });
                            }
                        }
                    }
                    sessionStorage.setItem("hour", hour);
                    sessionStorage.setItem(
                        "alarmlist",
                        JSON.stringify(alarmList)
                    );
                    switch (key) {
                        case "t1":
                            targetArr[0].count += res.data[key].length;
                            targetArr[0].list = dataFmt(res.data[key], "yl");
                            yjArr[0].count += res.data[key].length;
                            yjArr[0].list = dataFmt(res.data[key], "yl", false);
                            break;
                        case "t3":
                            targetArr[1].count += res.data[key].length;
                            targetArr[1].list = dataFmt(res.data[key], "yl");
                            break;
                        case "t24":
                            targetArr[2].count += res.data[key].length;
                            targetArr[2].list = dataFmt(res.data[key], "yl");
                            break;
                        case "t315":
                            yjArr[1].count += res.data[key].length;
                            yjArr[1].list = dataFmt(res.data[key], "yl", false);
                            break;
                        case "t2415":
                            yjArr[2].count += res.data[key].length;
                            yjArr[2].list = dataFmt(res.data[key], "yl", false);
                            break;
                    }
                    res.data[key].forEach(function(item: any) {
                        result.pointData.push({
                            index: key + item.zh,
                            zh: item.zh,
                            zm: item.zm,
                            jd: item.jd,
                            wd: item.wd,
                            yl: item.yl.toFixed(1),
                            img: "rain_25.png"
                        });
                    });
                    result.storeData = JSON.parse(
                        JSON.stringify(result.pointData)
                    );
                }
            });
    }
};
const mutations: any = {
    loginMiddle(state: any) {
        state.uid++;
    },
    updateForLayer(state: any, payload: any) {
        state.forLayer = payload.data;
    },
    setShowPage(state: any, page: string) {
        state.pagesShow[page] = true;
    },
    setHidePage(state: any, page: string) {
        state.pagesShow[page] = false;
    },
    changeLoginStatus(state: any, status: any) {
        state.loginStatus = status;
    },
    updateNextData(state: any, data: any) {
        state.nextData = data;
    },
    getUserInfo(state: any, userInfo: any) {
        state.userInfo = userInfo;
    },
    setFutureImgUrl(state: any, urlInfo: any) {
        state.futureImgUrl = urlInfo;
    },
    getNetUrl(state: any, url: any) {
        state.netUrl = url;
    },
    getPoint(state: any, item: any) {
        if (item) {
            state.point = [
                {
                    lon: item.lon || item.jd || 120.70404052734372,
                    lat: item.lat || item.wd || 29.40969406712921,
                    info: item,
                    style: {
                        image: {
                            icon: {
                                anchor: [0.5, 1.5],
                                src: img
                            }
                        }
                    }
                }
            ];
        } else {
            state.point = [];
        }
    },
    setHoverPoint(state: any, item: any) {
        if (item) {
            state.hoverPoint.show = true;
            state.hoverPoint.options = {
                lon: item.lon || item.jd || 120.70404052734372,
                lat: item.lat || item.wd || 29.40969406712921,
                style: {
                    image: {
                        icon: {
                            anchor: [0.5, 1.5],
                            src: img
                        }
                    }
                }
            };
        } else {
            state.hoverPoint.show = false;
        }
    },
    getSelectArea(state: any, area: any) {
        state.selectArea = area;
    },
    getFlowPoint(state: any, points: any) {
        state.flowPoint = points;
    },
    getCenter(state: any, arr: any) {
        state.center = arr;
    },
    getCloudUrl(state: any, payload: any) {
        state.cloud_pic = payload;
    },
    getLdUrl(state: any, name: any) {
        state.ld_pic = name;
    },
    getJyUrl(state: any, name: any) {
        state.jy_pic = name;
    },
    getSolidPicUrl(state: any, url: any) {
        state.solidPicUrl = url;
    },
    getModals(state: any, status: any) {
        state.modals = status;
    },
    getZoom(state: any, zoom: any) {
        state.zoom = zoom;
    },
    getLdTime(state: any, time: any) {
        state.ld_time = time;
    },
    getYtTime(state: any, time: any) {
        state.yt_time = time;
    },
    //获取行政区划
    async getAreaBySearch(state: any, type: string) {
        let result: any = [{ label: "全部", value: "" }];
        let url = "/rest/basic/getAreaList";
        if (type == "1") {
            url += "?areaFlag=1";
        } else if ((type = "2")) {
            url += "?areaFlag=2";
        }
        await $http.get(url).then(res => {
            if (type == "1") {
                res.data.forEach((item: any) => {
                    result.push({
                        label: item.sss,
                        value: item.id
                    });
                });
            } else {
                res.data.forEach((item: any) => {
                    result.push({
                        label: item.ly,
                        value: item.ly
                    });
                });
            }
        });
        return result;
    },
    //警铃
    closeAlarm(state: any, alarmType: boolean) {
        state.alarmType = alarmType;
    },
    updatePlotType(state: any, type: string) {
        state.plot.type = type;
    },
    updatePlotReset(state: any, type: string) {
        state.plot.hasFeatures = [];
    },
    // 更新地图点位（暂时只用于未来降水）
    updateMapPoints(state: any, payload: { data: any[] }) {
        state.map.points = payload.data;
    },
    updateNextThreeRender(state: any, regionsForRender: any) {
        state.regionsForRender = regionsForRender;
    },
    changeNextLegend(state: any, type: any) {
        state.legendType = type;
    },
    getSelectID(state: any, id: any) {
        state.selectDmId = id;
    },
    // 赋值弹出框属性并打开弹出框
    updateOverlay(state: any, payload: any) {
        const { name, position, data } = payload.data;
        state.dynamicComponent = {
            name,
            position,
            data,
            visible: true
        };
    },
    // 关闭上面的弹出框
    closeUpdateOverlay(state: any) {
        state.dynamicComponent.visible = false;
    },
    //设置地图全局loading
    setGlobalLoading(state: any, loading: boolean) {
        state.mapLoading = loading;
    },
    // 打开地图弹窗
    openNextThreeOverlay(state: any, payload: { data: any }) {
        state.nextThree.data = payload.data;
        state.nextThree.visible = true;
    },
    // 关闭地图弹窗
    closeNextThreeOverlay(state: any) {
        state.nextThree.visible = false;
        state.nextThree.data = {};
    },
    //打开洪水预警弹框
    openFloodModal(state: any, data: any) {
        state.flood.layer.visible = true;
        state.flood.layer.data = data;
    },
    //关闭洪水预警弹框
    closeFloodModal(state: any) {
        state.flood.layer.visible = false;
    },
    //打开洪水分析弹框
    openFloodAnalyseModal(state: any, data: any) {
        state.flood.analyse.show = true;
        state.flood.analyse.data = data;
    },
    //关闭洪水分析弹框
    closeFloodAnalyseModal(state: any) {
        state.flood.analyse.show = false;
    },
    setAlarmSearchShow(state: any, show: boolean) {
        state.alarmSearch.show = show;
    },
    setAlarmResultLoading(state: any, loading: boolean) {
        state.alarmResult.loading = loading;
    },
    setAlarmResultPointData(state: any, data: any[]) {
        state.alarmResult.pointData = data;
    },
    setAlarmResultTbDate(state: any, data: any[]) {
        state.alarmResult.tbDate = data;
    },
    openAlarmAudio(state: any) {
        state.alarmAudioShow = true;
    },
    closeAlarmAudio(state: any) {
        state.alarmAudioShow = false;
    },
    openAlarmDialog(state: any) {
        state.alarmDialogShow = true;
    },
    closeAlarmDialog(state: any) {
        state.alarmDialogShow = false;
        state.alarmResult.gsxxFilter = deepCopy(bjxx);
    },
    openForecast(state: any, data: any) {
        state.forecast.show = true;
        state.forecast.data = data;
    },
    getForecastPoint(state: any, data: any) {
        state.forecast.point = data;
    },
    // 开启或关闭测量
    handleMeasureStatus(state: any) {
        state.measure.disabled = !state.measure.disabled;
    }
};
export default new Vuex.Store({
    state,
    mutations,
    actions,
    modules: {
        solidWaterDeficit,
        mapCommon,
        waterAndRain,
        storm
    }
});
