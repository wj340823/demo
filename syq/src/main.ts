import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./stores";
import "./utils/class-component-hooks";
import plugin from "./utils/suc-plugin";
//@ts-ignore
import { LoadingBar } from "iview";
import ele from "element-ui";
import axios from "axios";
import scrollBar from "@/plugin/perfect-scrollbar";
//import virtual from 'vue-virtual-scroll-list'
import authox from "@suc/authox/plugins/authox-vue";
import VueOl from "@suc/monch";
import "./styles/index.scss";
import "./styles/iconfont/iconfont.css";
import "video.js/dist/video-js.css";
import "./styles/reset.scss";
import "./styles/common.scss";
import "iview/dist/styles/iview.css";
import "element-ui/lib/theme-chalk/index.css";
import "babel-polyfill";
import Video from "video.js";

import "video.js/dist/video-js.css";
import "./styles/reset.scss";
import "./styles/common.scss";

if (process.env.NODE_ENV === "development") {
    //开发环境 do something
    axios.defaults.baseURL = "./api";
} else {
    //生产环境 do something
}

Vue.use(Vue => {
    (requireContext => {
        const arr = requireContext.keys().map(requireContext);
        arr.forEach((directive: any) => {
            directive = directive.default ? directive.default : directive;
            const { name } = directive;
            Reflect.deleteProperty(directive, "name");
            Vue.directive(name, directive);
        });
    })(require.context("./directives", false, /^\.\/.*\.ts$/));
});

Vue.use(ele);
Vue.use(authox);
Vue.use(authox, store);

Vue.use(VueOl);

Vue.use(plugin);

Vue.use(scrollBar);
//Vue.use(virtual)
Vue.prototype.$http = axios;

Vue.config.productionTip = false;
Vue.prototype.$video = Video;
// http response 服务器响应拦截器，这里拦截401错误，并重新跳入登页
axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        /*if (error.response) {
            switch (error.response.status) {
                case 401:
                    router.replace({
                        path: "/login"
                    });
                    break;
                case 403:
                    router.replace({
                        path: "/login"
                    });
                    break;
                default:
                    /!*try {
                        if (
                            error.response.request.responseURL.includes(
                                "authox/curUser"
                            )
                        ) {
                            router.replace({
                                path: "/login"
                            });
                        }
                    } catch (e) {
                        //console.log(e)
                    }*!/
            }
        }*/
        return Promise.reject(error.response);
    }
);

router.beforeEach((to, from, next) => {
    LoadingBar.start();
    next();
});

router.afterEach(route => {
    LoadingBar.finish();
});

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");
