<template>
    <div class="login_body">
        <div class="login_main">
            <div class="login_main_list">
                <Form
                    class="login_Form"
                    ref="loginForm"
                    :model="loginForm"
                    :rules="ruleForm"
                    :label-width="0"
                >
                    <div class="form-label">
                        <img src="../assets/user.png" />用户名
                    </div>
                    <FormItem prop="userName">
                        <Input
                            type="text"
                            v-model="loginForm.userName"
                            placeholder="用户名"
                            size="large"
                            @keyup.enter.native="loginSubmit('loginForm')"
                        />
                    </FormItem>
                    <div class="form-label">
                        <img src="../assets/pwd.png" />密码
                    </div>
                    <FormItem prop="password">
                        <Input
                            type="password"
                            v-model="loginForm.password"
                            placeholder="密码"
                            size="large"
                            @keyup.enter.native="loginSubmit('loginForm')"
                        />
                    </FormItem>
                    <!-- <FormItem prop="codeValue">
						<Row>
							<Col span="14">
							<Input class="code_input" type="text" v-model="loginForm.codeValue" placeholder="验证码" size="large"
							 @keyup.enter.native="loginSubmit('loginForm')">
							</Input>
							</Col>
							<Col span="8" offset="2" style="height:36px;">
							<img class="code_img" type="image" id="checkImg" :src="codeImg" />
							</Col>
						</Row>
					</FormItem> -->
                    <FormItem>
                        <Button
                            class="login-btn"
                            @click.prevent="loginSubmit('loginForm')"
                            size="large"
                            long
                            >登 录
                        </Button>
                    </FormItem>
                </Form>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import qs from "qs";
    import { Vue, Component } from "vue-property-decorator";
    import { FormItem, Icon, Form, Input, Button } from "iview";

    const validateName = (rule: any, value: string, callback: Function) => {
        if (value === "") {
            callback(new Error("用户名不能为空"));
        } else {
            callback();
        }
    };
    const validatePass = (rule: any, value: string, callback: Function) => {
        if (value === "") {
            callback(new Error("密码不能为空"));
        } else {
            callback();
        }
    };
    // const validateCode = (rule, value, callback) => {
    // 	if (value === '') {
    // 		callback(new Error('验证码不能为空'));
    // 	}
    // 	setTimeout(() => {
    // 		if (value.length == 4) {
    // 			this.$http.get("/rest/authox/checkCodeValidate?value=" + this.loginForm.codeValue).then(res => {
    // 				if (res.data === 'false') {
    // 					callback(new Error('验证码错误'));
    // 				} else {
    // 					callback();
    // 				}
    // 			}).catch(err => {
    // 				console.log(err);
    // 			});

    // 		} else {
    // 			callback(new Error('验证码错误'));
    // 		}
    // 	}, 800);
    // };
    @Component({
        components: {
            FormItem,
            Icon,
            Form,
            Input,
            Button
        }
    })
    export default class Login extends Vue {
        codeImg = "";
        codeCheck = {};
        loginForm = {
            userName: "",
            codeValue: "",
            password: ""
        };
        ruleForm = {
            userName: [
                {
                    validator: validateName,
                    trigger: "blur"
                }
            ],
            password: [
                {
                    validator: validatePass,
                    trigger: "blur"
                }
            ]
            // codeValue: [{
            // 	validator: validateCode,
            // 	trigger: 'blur'
            // }]
        };

        created() {
            //this.getCodeImg();
        }

        getCodeImg() {
            this.$http
                .get("/rest/authox/checkCode?size=120*36")
                .then((res) => {
                    this.codeImg = "data:image/gif;base64," + res.data;
                })
                .catch((err) => {
                    //console.log(err);
                });
        }

        loginSubmit(name: string) {
            const form: any = this.$refs[name];
            form.validate((valid: any) => {
                if (valid) {
                    this.$http({
                        url: "/login",
                        method: "post",
                        data: qs.stringify({
                            username: this.loginForm.userName,
                            password: this.loginForm.password,
                            checkCode: this.loginForm.codeValue
                        }),
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    })
                        .then((res) => {
                            if ((this.$route.query as any).redirect) {
                                this.$router.push(
                                    <string>(this.$route.query as any).redirect
                                );
                            } else {
                                this.$router.push("/");
                            }
                        })
                        .catch((err) => {
                            //console.log(err);
                            this.$Message.error("登录失败!");
                        });
                } else {
                    this.$Message.error("登录失败!");
                }
            });
        }
    }
</script>
<style lang="scss" scoped>
    .login_body {
        background-image: linear-gradient(270deg, #dbe1e8 0%, #f5f5f5 100%);
        width: 100%;
        height: 100%;
        .login_main {
            width: 1210px;
            position: absolute;
            left: calc(50% - 605px);
            top: calc(50% - 310px);
            text-align: center;
            height: 620px;
            padding: 0 40px;
            background: url("../assets/lbg.png") no-repeat;
            position: relative;
            .code_img {
                width: 100%;
                height: 36px;
            }
            .login_Form {
                position: absolute;
                right: 60px;
                top: 60px;
                width: 370px;
                height: 460px;
                background-color: #ffffff;
                box-shadow: 0px 0px 10px 0px rgba(7, 107, 255, 0.22);
                border-radius: 10px;
                padding: 30px;
                .form-label {
                    font-size: 18px;
                    color: #666;
                    text-align: left;
                    height: 30px;
                    line-height: 30px;
                    img {
                        margin-right: 10px;
                        vertical-align: middle;
                    }
                }
            }
            .login-btn {
                background-image: linear-gradient(
                    270deg,
                    #2674ff 0%,
                    #33b2ff 100%
                );
                border-radius: 20px;
                color: #fff;
            }
        }
    }
</style>
