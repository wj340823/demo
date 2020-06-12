import Vue from 'vue';
import { AxiosStatic } from "axios"

declare module 'vue/types/vue' {
    // 来声明全局属性
    interface Vue {
        $http: AxiosStatic,
        $getMapConfig: Function,
        $utils: any
    }
}
