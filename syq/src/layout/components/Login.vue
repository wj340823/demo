<template>
    <div class="container">
        <div class="container-content">
            <!--<div style="position: absolute;top: 30px;right: 2px;">二维码</div>-->
            <header>
                <p>用户登录</p>
                <i class="el-icon-close" @click="handleCloseLogin" />
            </header>
            <el-form ref="form" :model="form" label-width="80px">
                <el-form-item label="用户名">
                    <el-input
                        v-model="form.name"
                        @keyup.enter.native="loginViale"
                    />
                </el-form-item>
                <el-form-item label="密码">
                    <el-input
                        type="password"
                        v-model="form.password"
                        @keyup.enter.native="loginViale"
                    />
                </el-form-item>
                <el-form-item label="验证码">
                    <el-input
                        v-model="form.code"
                        @keyup.enter.native="loginViale"
                    />
                    <img
                        :src="form.src"
                        alt="验证码"
                        style="vertical-align: middle"
                    />
                </el-form-item>
            </el-form>
            <footer @click="loginViale">登录</footer>
        </div>
        <!-- <div id="login_container"></div>-->
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from "vue-property-decorator";
    import { Mutation } from "vuex-class";
    import qs from "qs";

    interface FormConfig {
        [propName: string]: string;

        name: string;
        password: string;
        code: string;
        src: string;
    }

    const users: any = {
        account: "admin",
        roles: "admin"
    };
    const users1: any = {
        account: "水文局",
        roles: "super"
    };
    const users2: any = {
        account: "钱管局",
        roles: "middle"
    };
    const users3: any = {
        account: "",
        roles: "public",
        name: ""
    };

    @Component
    export default class Login extends Vue {
        @Mutation("getUserInfo") getUserInfo: any;
        @Mutation("loginMiddle") loginMiddleMutation!: Function;

        form: FormConfig = {
            name: "",
            password: "",
            code: "",
            src: ""
        };
        visible: boolean = true;

        checkStatus: boolean = true;
        async checkValue() {
            await this.$http
                .get("/rest/authox/checkCodeValidate?value=" + this.form.code)
                .then(res => {
                    this.checkStatus = res.data;
                });
        }
        // 关闭登录弹框
        handleCloseLogin(): void {
            this.$emit("update:loginVisible", false);
        }

        loginViale() {
            this.handleValidate();
            this.checkValue().then(() => {
                if (this.checkStatus) {
                    this.$http({
                        url: "/login",
                        method: "post",
                        data: qs.stringify({
                            username: this.form.name,
                            password: this.form.password,
                            checkCode: this.form.code
                        }),
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    })
                        .then(res => {
                            this.$http
                                .get("/rest/basic/getUserInfo")
                                .then(result => {
                                    if (result.data.roles === "middle") {
                                        this.loginMiddleMutation();
                                    }
                                    //一般为获取用户信息，error则未登录
                                    if (result.status === 200) {
                                        this.getUserInfo({
                                            account: result.data.account,
                                            roles: result.data.roles,
                                            name: result.data.name
                                        });
                                        this.handleCloseLogin();
                                    } else {
                                        this.getUserInfo(users3);
                                        this.$emit(
                                            "update:loginButtonVisible",
                                            true
                                        );
                                        this.handleCloseLogin();
                                    }
                                })
                                .catch(err => {
                                    this.getUserInfo(users3);
                                    this.handleCloseLogin();
                                });
                        })
                        .catch(err => {
                            this.$message({
                                message: err.data.msg,
                                type: "error"
                            });
                            this.$emit("update:loginButtonVisible", true);
                            this.getUserInfo(users3);
                        });
                } else {
                    this.$message.error("验证码输入有误！");
                }
            });
        }

        // 验证
        handleValidate(): void {
            if (!this.form.code || !this.form.password || !this.form.name) {
                this.$message({
                    message: "请先填写完整信息",
                    type: "error"
                });
                return;
            }
        }

        created(): void {
            this.$http
                .get("/rest/authox/checkCode?size=120*36")
                .then((res: any) => {
                    this.form.src = "data:image/gif;base64," + res.data;
                });
        }

        mounted(): void {
            /*var obj = new WxLogin({
                self_redirect: true,
                id: "login_container",
                appid: "wx85a4fdfc2258b90e",
                scope: "snsapi_login",
                redirect_uri: encodeURIComponent(
                    "https://sqfb.zjsq.net.cn:8089/login"
                ),
                state: "",
                style: "",
                href: ""
            });*/
        }
    }
</script>

<style lang="scss" scoped>
    .container {
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.15);
        z-index: 99999;
        transition: all 0.2s ease-in;

        &-content {
            position: relative;
            width: 300px;
            height: 200px;
            border-radius: 8px;
            background-color: rgba(255, 255, 255, 0.8);
            box-shadow: 0 0 10px 6px rgba(72, 72, 72, 0.1);

            &::before {
                content: "";
                position: absolute;
                top: 0;
                width: 300px;
                height: 200px;
                background-image: url("../../assets/login/bg.jpg");
                background-size: cover;
                border-radius: 8px;
                z-index: -1;
            }

            header {
                display: flex;
                justify-content: space-between;
                line-height: 30px;
                padding: 0 16px;
                font-size: 16px;
                color: white;
                background-image: linear-gradient(270deg, #2674ff, #33b2ff);
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;

                i {
                    font-size: 20px;
                    line-height: 30px;
                    cursor: pointer;
                }
            }

            .el-form {
                .el-input {
                    width: 160px;
                    height: 30px;
                }

                .el-form-item {
                    margin: 0;

                    &:first-of-type {
                        margin-top: 10px;
                    }

                    &:last-of-type {
                        .el-input {
                            width: 80px;
                        }
                    }

                    label {
                        text-align: left;
                        padding-left: 30px;
                    }

                    img {
                        width: 80px;
                        height: 30px;
                        border-radius: 4px;
                    }
                }
            }

            footer {
                margin-top: 8px;
                padding-top: 2px;
                width: 100%;
                border-top: 1px solid white;
                text-align: center;
                border-bottom-left-radius: 8px;
                border-bottom-right-radius: 8px;
                color: black;
                font-size: 16px;
                cursor: pointer;
            }
        }
    }
</style>
