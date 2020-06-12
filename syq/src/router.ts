import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: "",
            redirect: "/main"
        },
        {
            path: "/jctable",
            component: () => import("./views/pages/monitorTable/Main.vue")
        },
        {
            path: "/login",
            component: () => import("./views/Login.vue")
        },
        {
            //懒加载
            path: "/main",
            component: () => import("./layout/Main.vue"),
            children: [
                {
                    path: "",
                    redirect: "map"
                },
                {
                    path: "map",
                    meta: {
                        name: "map"
                    },
                    component: () => import("./views/MapView.vue"),
                    children: [
                        // 实时雨情
                        {
                            path: "",
                            redirect: "monitor-info"
                        },
                        // 实时雨情
                        {
                            path: "realtime-rain",
                            meta: {
                                name: "realtime-rain"
                            },
                            component: () =>
                                import("./views/pages/realtimeRain/Main.vue")
                        },
                        // 实时水情
                        {
                            path: "realtime-water",
                            meta: {
                                name: "realtime-water"
                            },
                            component: () =>
                                import("./views/pages/realtimeWater/Main.vue")
                        },
                        // 实时水情
                        {
                            path: "realtime-flow",
                            meta: {
                                name: "realtime-flow"
                            },
                            component: () =>
                                import("./views/pages/realtimeFlow/Main.vue")
                        },
                        // 卫星云图
                        {
                            path: "satellite-images",
                            meta: {
                                name: "satellite-images"
                            },
                            component: () =>
                                import("./views/pages/satelliteImages/Main.vue")
                        },
                        // 降雨分析
                        {
                            path: "rainfall-analysis",
                            meta: {
                                name: "rainfall-analysis"
                            },
                            component: () =>
                                import(
                                    "./views/pages/rainfallAnalysis/Main.vue"
                                )
                        },
                        // 水位排频排位
                        {
                            path: "water-frequency",
                            meta: {
                                name: "water-frequency"
                            },
                            component: () =>
                                import("./views/pages/waterFrequency/Main.vue")
                        },
                        // 监测信息
                        {
                            path: "monitor-info",
                            meta: {
                                name: "monitor-info"
                            },
                            component: () =>
                                import("./views/pages/monitorInfo/Main.vue")
                        },
                        {
                            path: "blank",
                            meta: {
                                name: "blank"
                            },
                            component: () =>
                                import("./views/pages/monitorInfo/Blank.vue")
                        },
                        {
                            path: "water-rain",
                            meta: {
                                name: "water-rain"
                            },
                            component: () =>
                                import("./views/pages/waterAndRain/Main.vue")
                        },
                        // 洪水预警
                        {
                            path: "flood-warning",
                            meta: {
                                name: "flood-warning"
                            },
                            component: () =>
                                import("./views/pages/floodWarning/Main.vue")
                        },
                        // 洪水预警
                        {
                            path: "storm-surge",
                            meta: {
                                name: "storm-surge"
                            },
                            component: () =>
                                import("./views/pages/stormSurge/Main.vue")
                        },
                        // 预报展示
                        {
                            path: "forecast-display",
                            meta: {
                                name: "forecast-display"
                            },
                            component: () =>
                                import("./views/pages/forecastDisplay/Main.vue")
                        },
                        // 气象雷达
                        {
                            path: "weather-radar",
                            meta: {
                                name: "weather-radar"
                            },
                            component: () =>
                                import("./views/pages/weatherRadar/Main.vue")
                        },
                        // 面雨量排频排位
                        {
                            path: "rainfall-frequency",
                            meta: {
                                name: "rainfall-frequency"
                            },
                            component: () =>
                                import(
                                    "./views/pages/rainfallFrequency/Main.vue"
                                )
                        },
                        // 断面面雨量
                        {
                            path: "section-rainfall",
                            meta: {
                                name: "section-rainfall"
                            },
                            component: () =>
                                import("./views/pages/sectionRainfall/Main.vue")
                        },
                        // 定制面雨量
                        {
                            path: "custom-rainfall",
                            meta: {
                                name: "custom-rainfall"
                            },
                            component: () =>
                                import("./views/pages/customRainfall/Main.vue")
                        },
                        // 洪水分析
                        {
                            path: "flood-analysis",
                            meta: {
                                name: "flood-analysis"
                            },
                            component: () =>
                                import("./views/pages/floodAnalysis/Main.vue")
                        },
                        // 未来三天
                        {
                            path: "next-three-day",
                            meta: {
                                name: "next-three-day"
                            },
                            component: () =>
                                import("./views/pages/nextThreeDays/Main.vue")
                        },
                        // 土壤缺水量
                        {
                            path: "solid-water-deficit",
                            meta: {
                                name: "solid-water-deficit"
                            },
                            component: () =>
                                import(
                                    "./views/pages/solidWaterDeficit/Main.vue"
                                )
                        }
                    ]
                }
            ]
        }
    ]
});
