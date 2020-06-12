<template>
    <div class="main_view">
        <top-bar v-show="$store.state.userInfo.roles != 'middle'"></top-bar>
        <app-main></app-main>
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from "vue-property-decorator";
    import { TopBar, AppMain } from "./components";
    import { Route } from "vue-router";
    import axios from "axios";
    import store from "@/stores";
    import router from "@/router";
    import { State, Mutation } from "vuex-class";
    const users: any = {
        account: "admin",
        roles: "admin",
        name: ""
    };
    const users1: any = {
        account: "",
        roles: "public",
        name: ""
    };
    const defaultRouteList: any[] = [
        "/main/map/monitor-info",
        "/main/map/realtime-rain",
        "/main/map/realtime-water"
    ];
    @Component({
        components: { TopBar, AppMain }
    })
    export default class mainView extends Vue {
        @State("userInfo") userList: any;
        @Mutation("getNetUrl") getNetUrl: any;
        @Mutation("getUserInfo") getUserInfo: any;
        url: string = "";
        beforeRouteEnter(to: Route, from: Route, next: Function) {
            let list = [];
            let len: any = 0;
            len = defaultRouteList.filter((item: any) => {
                return item == to.fullPath;
            }).length;

            list[0] = axios
                .get("/rest/basic/getUserInfo")
                .then(result => {
                    //一般为获取用户信息，error则未登录
                    if (result.status === 200) {
                        store.commit("getUserInfo", {
                            account: result.data.account,
                            roles: result.data.roles,
                            name: result.data.name
                        });
                    } else {
                        if (!len) {
                            router.push("/main/map/monitor-info");
                        }
                        store.commit("getUserInfo", users1);

                        //
                    }
                })
                .catch(err => {
                    store.commit("getUserInfo", users1);
                    if (!len) {
                        router.push("/main/map/monitor-info");
                    }
                    //
                });
            return axios.all(list).then(() => {
                next(true);
            });
        }
        created(): void {}
    }
</script>
