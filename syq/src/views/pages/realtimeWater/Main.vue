<template>
    <vue-perfect-scrollbar class="details">
        <!--<div class="title" style="margin-bottom: 0">
            {{ data.type }}
        </div>-->
        <el-tabs v-model="data.type" type="card">
            <el-tab-pane name="实时水情" label="实时水情">
                <div class="searchBar">
                    <el-row>
                        <!-- <span
                            style="margin-right: 8px; margin-left: 5px; color: #898989"
                            v-if="$utils.checkUser(userInfo, 'super')"
                            >人工报汛</span
                        >
                        <el-switch
                            v-if="$utils.checkUser(userInfo, 'super')"
                            active-color="rgb(50, 179, 255)"
                            inactive-color="rgb(240, 240, 240)"
                            v-model="search.refresh"
                            style="margin-right: 20px"
                        />-->
                        <span style="margin-right: 8px;color: #898989"
                            >病险水库</span
                        >
                        <el-switch
                            active-color="rgb(50, 179, 255)"
                            inactive-color="rgb(240, 240, 240)"
                            v-model="search.danger"
                        />
                        <el-checkbox
                            v-model="search.history"
                            style="margin-left: 10px"
                        >
                            2017-06-24 15:00:00
                        </el-checkbox>
                    </el-row>

                    <el-select
                        class="searchItem"
                        v-model="search.areaType.default"
                        placeholder="请选择"
                    >
                        <el-option
                            v-for="item in search.areaType.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        class="searchItem"
                        v-model="search.cityList.default"
                        v-if="search.areaType.default == '1'"
                        placeholder="请选择"
                        @change="changeCity"
                    >
                        <el-option
                            v-for="item in search.cityList.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        class="searchItem"
                        v-model="search.counties.default"
                        v-if="search.areaType.default == '1'"
                        placeholder="请选择"
                        :disabled="search.counties.disable"
                        @change="locateArea"
                    >
                        <el-option
                            v-for="item in search.counties.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        class="searchItem"
                        v-model="search.rivers.default"
                        v-if="search.areaType.default == '2'"
                        placeholder="请选择"
                        @change="locateArea"
                    >
                        <el-option
                            v-for="item in search.rivers.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                    <el-select
                        class="searchItem"
                        v-model="search.rivers1.default"
                        v-if="
                            search.areaType.default == '2' &&
                                search.rivers.default == '钱塘江'
                        "
                        placeholder="请选择"
                        @change="locateArea"
                    >
                        <el-option
                            v-for="item in search.rivers1.arr"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        ></el-option>
                    </el-select>
                </div>
                <div class="searchBar" style="line-height: 24px">
                    <span class="lb-item" style="color: #888">站类选择:</span>
                    <el-checkbox-group v-model="search.zlxz.selected">
                        <el-checkbox
                            v-for="(item, index) in search.zlxz.list"
                            :label="item.label"
                            :key="index"
                            style="margin-right: 10px;"
                            :disabled="search.zlxz.disable"
                        />
                    </el-checkbox-group>
                </div>
                <div class="searchBar" style="line-height: 24px">
                    <span class="lb-item" style="color: #888">水库类型:</span>
                    <el-checkbox-group v-model="search.sklx.selected">
                        <el-checkbox
                            :label="item.label"
                            :key="index"
                            v-for="(item, index) in search.sklx.list"
                            :disabled="search.sklx.disable"
                        ></el-checkbox>
                    </el-checkbox-group>
                </div>
                <div class="searchBar" style="line-height: 24px;">
                    <span class="lb-item" style="color: #888">报汛等级:</span>
                    <el-checkbox-group v-model="search.checkList">
                        <el-checkbox label="中央" />
                        <el-checkbox label="省重点" />
                        <el-checkbox label="省一般" />
                        <el-checkbox label="其他" />
                        <el-checkbox label="山洪" />
                    </el-checkbox-group>
                </div>
                <div class="searchBar">
                    <div class="sel-btn" style="height: 30px">
                        <span
                            class="btn"
                            :class="search.overLine == 0 ? 'act' : ''"
                            @click="search.overLine = 0"
                            style="height: 29px; cursor: pointer"
                            >所有</span
                        >
                        <span
                            class="btn"
                            :class="search.overLine == 1 ? 'act' : ''"
                            @click="search.overLine = 1"
                            style="height: 29px; cursor: pointer"
                            >超警</span
                        >
                    </div>
                    <!-- <br> -->
                    <el-input
                        class="searchItem"
                        style="width: 100px; margin: 0 5px"
                        v-model="search.inputVal"
                        placeholder="站名、站码、拼音码"
                        @keyup.enter.native="searchResult"
                    />
                    <el-button
                        size="mini"
                        type="primary"
                        icon="el-icon-search"
                        class="el-button-search"
                        @click="searchResult"
                        >查询
                    </el-button>
                    <img
                        v-if="$utils.checkUser(userInfo.roles, 'super')"
                        src="../../../assets/button/export-excel.png"
                        @click="handleExport"
                        class="export-button__img"
                        alt="导出"
                    />
                </div>
                <div class="tab" style="text-align: left;padding-left: 15px">
                    <span>水位信息(m)</span>
                </div>
                <div class="result">
                    <TreeTableCopy
                        :thList="result.thList.ylxx"
                        :tbData="result.tbDate"
                        :kinds="result.kinds"
                        :loading="result.loading"
                        :indexT="index"
                        :view-length="13"
                        v-if="result.type"
                        :view-height="520"
                    />
                </div>
            </el-tab-pane>
            <el-tab-pane
                name="气象雷达"
                label="气象雷达"
                v-if="pagesShow['气象雷达']"
            >
                <weatherRadar></weatherRadar>
            </el-tab-pane>
            <el-tab-pane
                    name="风暴潮"
                    label="风暴潮"
                    v-if="pagesShow['风暴潮']"
            >
                <storm-surge></storm-surge>
            </el-tab-pane>
        </el-tabs>
    </vue-perfect-scrollbar>
</template>

<script lang="ts">
    import "../../../styles/mapView/right.scss";
    import { TreeTableCopy } from "@/components";
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";
    import { State, Getter, Action, Mutation, namespace } from "vuex-class";
    import AutoHeightMixin from "../../../mixins/autoHeight";
    import weatherRadar from "../weatherRadar/Main.vue";
    import stormSurge from "../stormSurge/Main.vue";
    let cancelToken: any = null;
    const level: any = [
        { label: "小于30", value: "b30", range: "0~30" },
        { label: "30~50", value: "r30", range: "30~50" },
        { label: "50~80", value: "r50", range: "50~80" },
        { label: "80~100", value: "r80", range: "80~100" },
        { label: "大于100", value: "r100", range: ">100" }
    ];
    @Component({
        components: { TreeTableCopy, weatherRadar,stormSurge }
    })
    export default class RealtimeWater extends AutoHeightMixin {
        @State("userInfo") userInfo: any;
        @State("pagesShow") pagesShow: any;
        @Mutation("getSelectArea") getSelectArea: any;
        @Mutation("getCenter") getCenter: any;
        @Mutation getPoint!: any;
        data: any = {
            type: "实时水情",
            show: true
        };
        index: number = 0;

        search: any = {
            progress: true, //过程
            refresh: false, //是否人工报汛,
            danger: false,
            interval: null,
            history: false,
            timeList: {
                default: "10",
                arr: [
                    {
                        label: "10分钟一次",
                        value: "10"
                    },
                    {
                        label: "20分钟一次",
                        value: "20"
                    },
                    {
                        label: "30分钟一次",
                        value: "30"
                    },
                    {
                        label: "40分钟一次",
                        value: "40"
                    }
                ]
            }, //刷新间隔时间列表
            areaType: {
                default: "1",
                arr: [
                    {
                        label: "行政区划",
                        value: "1"
                    },
                    {
                        label: "流域",
                        value: "2"
                    }
                ]
            }, //区域类型。行政区划还是流域
            cityList: {
                default: "全部",
                arr: []
            }, //市列表
            counties: {
                default: "",
                disable: false,
                arr: []
            }, //县列表
            rivers: {
                default: "",
                arr: []
            }, //河流列表
            rivers1: {
                default: "",
                arr: [
                    {
                        label: "浦阳江",
                        value: "GAE00000000RLPZ"
                    },
                    {
                        label: "钱塘江兰溪以上",
                        value: "GA2D0000000RLXZ"
                    },
                    {
                        label: "钱塘江衢州以上",
                        value: "GA000000000SQZZ"
                    },
                    {
                        label: "钱塘江金华以上",
                        value: "GABBBA00000RJHZ"
                    },
                    {
                        label: "曹娥江",
                        value: "GAFCC000000LDSB"
                    },
                    {
                        label: "分水江",
                        value: "GAD00000000LFSJ"
                    }
                ]
            }, //二级流域列表
            checkList: ["中央", "省重点", "省一般", "其他", "山洪"],
            zlxz: {
                old: [],
                selected: ["水库"], //'水库' ,'河道' ,'堰闸', '潮汐'
                list: [
                    { label: "水库" },
                    { label: "河道" },
                    { label: "堰闸" },
                    { label: "潮汐" }
                ],
                disable: false
            }, //站类选择
            sklx: {
                old: [],
                selected: ["大型"], //'大型' ,'中型' ,'小一', '其他(含小二)'
                list: [
                    { label: "大型" },
                    { label: "中型" },
                    { label: "小一" },
                    { label: "其他(含小二)" }
                ],
                disable: false
            }, //水库类型
            current: Date.now(), //预设当前时间
            setTimeStatus: true, //是否设置时间
            inputVal: "", //站名站码拼音码
            overLine: 1
        };
        result: any = {
            loading: false,
            type: true, //true 雨情 false 分区统计
            //超警戒 超限 超保证 其他
            kinds: [
                { label: "超保证", value: "cbz", index: 0 },
                { label: "超警戒", value: "cjj", index: 0 },
                { label: "水库超限", value: "cx", index: 0 },
                { label: "其他", value: "qt", index: 0 }
            ],
            thList: {
                ylxx: [
                    {
                        label: "序",
                        value: "index",
                        width: 50
                    },
                    {
                        label: "市县",
                        value: "city",
                        width: 65
                    },
                    {
                        label: "站名",
                        value: "name",
                        width: 120
                    },
                    {
                        label: "上报时间",
                        value: "time",
                        width: 90
                    },
                    {
                        label: "水位(m)",
                        right: true,
                        value: "sw",
                        width: 70
                    },
                    {
                        label: "库容(10^6m³)",
                        value: "kr",
                        right: true,
                        width: 120
                    },
                    //水位，涨差，警戒，保证，汛限，正常水位

                    {
                        label: "涨差",
                        value: "zc",
                        right: true,
                        width: 70
                    },
                    {
                        label: "警戒(m)",
                        value: "jj",
                        right: true,
                        width: 80
                    },
                    {
                        label: "保证(m)",
                        value: "bz",
                        right: true,
                        width: 80
                    },
                    {
                        label: "汛限(m)",
                        value: "xx",
                        right: true,
                        width: 80
                    },
                    {
                        label: "正常(m)",
                        value: "zcsw",
                        right: true,
                        width: 80
                    }
                ]
            },
            tbDate: {},
            pointData: []
        };

        searchResult() {
            let self = this;
            let postbody: any = this.$utils.deepCopy(this.search);
            let str: string = "",
                zlxz: string = "",
                sklx: string = "";
            this.getPoint(null);
            if (postbody.checkList.length != 0) {
                postbody.checkList.forEach(function(s: any) {
                    switch (s) {
                        case "中央":
                            str += "1,";
                            break;
                        case "省重点":
                            str += "2,";
                            break;
                        case "省一般":
                            str += "3,";
                            break;
                        case "山洪":
                            str += "5,";
                            break;
                        case "其他":
                            str += "4,";
                            break;
                    }
                });
            }
            if (self.search.areaType.default == 1) {
                postbody.rivers.default = "";
                postbody.rivers1.default = "";
            } else {
                postbody.cityList.default = "";
                postbody.counties.default = "";
            }
            //水库RR 河道ZZ，ZQ 闸吧 DD 潮汐TT
            if (postbody.zlxz.selected.length) {
                postbody.zlxz.selected.forEach(function(s: any) {
                    switch (s) {
                        case "水库":
                            zlxz += "RR,";
                            break;
                        case "河道":
                            zlxz += "ZZ,ZQ,";
                            break;
                        case "堰闸":
                            zlxz += "DD,";
                            break;
                        case "潮汐":
                            zlxz += "TT,";
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
                            break;
                        case "中型":
                            sklx += "3,";
                            break;
                        case "小一":
                            sklx += "2,";
                            break;
                        case "其他(含小二)":
                            sklx += "1,9,";
                            break;
                    }
                });
            }

            if (postbody.counties.default == "全市") {
                postbody.counties.default = "";
            }
            let city = "";
            postbody.cityList.arr.forEach((item: any) => {
                if (item.value == postbody.cityList.default) {
                    city = item.label;
                }
            });
            let county = "";
            if (
                postbody.counties.default &&
                postbody.counties.default != "全市"
            ) {
                postbody.counties.arr.forEach((item: any) => {
                    if (item.value == postbody.counties.default) {
                        county = item.label;
                    }
                });
            } else {
                postbody.counties.default = "";
            }
            let ly: any;
            if (
                postbody.rivers.default == "钱塘江" &&
                postbody.rivers1.default != ""
            ) {
                ly = postbody.rivers.default + "," + postbody.rivers1.default;
            } else {
                ly = postbody.rivers.default;
            }
            let params: any = {
                areaFlag: postbody.areaType.default, //地区标识（1行政区2流域）
                sss: city, //地级市
                ssx: county, //地级县
                zl: zlxz, //站类选择
                sklx: sklx, //水库类型
                ly: ly, //流域（水系）
                sfcj: postbody.overLine, //是否超警0所有1超警
                bxdj: str, //报汛等级
                zm: postbody.inputVal,
                flag: 1
            };
            if (this.search.danger) {
                params.bx = 1;
            } else {
                params.bx = 0;
            }
            if (!this.$utils.checkUser(this.userInfo.roles, "super")) {
                delete params.flag;
            }

            self.result.pointData = [];

            if (zlxz == "") {
                this.$message("请选择站类！");
            } else if (zlxz.match("RR") != null && sklx == "") {
                this.$message("请选择水库类型！");
            } else if (str == "") {
                this.$message("请选择报讯等级！");
            } else {
                self.result.loading = true;
                if (cancelToken) {
                    cancelToken();
                }
                if (this.search.history) {
                    params.time = "2017-06-24 15:00:00";
                }
                this.$http
                    .get("/rest/water/getNewDataList", {
                        params: params,
                        cancelToken: new this.$http.CancelToken(cancel => {
                            cancelToken = cancel;
                        })
                    })
                    .then(res => {
                        //console.log(res)
                        self.result.loading = false;
                        console.log("获取数据：" + Date.now());
                        const obj: any = [];

                        for (let key in res.data) {
                            obj[key] = [];
                            if (res.data[key].length > 0) {
                                //超警戒 超限 超保证 其他
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
                                    case "qt":
                                        img = "water_nz.png";
                                        break;
                                }
                                res.data[key].forEach(function(
                                    item: any,
                                    index: number
                                ) {
                                    //if(item.item.match('Z'))
                                    if (item.sw !== "") {
                                        item.sw =
                                            item.sw === "-"
                                                ? "-"
                                                : item.sw.toFixed(2);
                                    }
                                    obj[key].push({
                                        index: index + 1,
                                        zh: item.zh,
                                        city:
                                            (item.sss
                                                ? item.sss.slice(0, 1) + "-"
                                                : "") +
                                            (item.ssx
                                                ? item.ssx.slice(0, 2)
                                                : ""),
                                        county: item.ssx,
                                        time:
                                            item.sbsj !== null
                                                ? self.$utils.dateFormat(
                                                      new Date(item.sbsj),
                                                      "MM-dd HH:mm"
                                                  )
                                                : "-",
                                        name: item.zm,
                                        jj:
                                            item.jjsw !== null
                                                ? item.jjsw.toFixed(2)
                                                : "-",
                                        bz:
                                            item.bzsw !== null
                                                ? item.bzsw.toFixed(2)
                                                : "-",
                                        zc:
                                            item.zc !== null
                                                ? item.zc.toFixed(1)
                                                : "-",
                                        xx:
                                            item.xxsw !== null
                                                ? item.xxsw.toFixed(2)
                                                : "-",
                                        kr:
                                            item.kr !== null
                                                ? item.kr.toFixed(2)
                                                : "-",
                                        sw: item.sw,
                                        zcsw:
                                            item.zcsw !== null
                                                ? item.zcsw.toFixed(2)
                                                : "-",
                                        lon: item.jd,
                                        lat: item.wd,
                                        info: item,
                                        counties: item.ssx
                                    });
                                    item.img = img;
                                    self.result.pointData.push(item);
                                });
                            }
                        }
                        self.result.tbDate = obj;
                        this.index++;
                        this.$emit("getPoints", self.result.pointData);
                    });
            }
        }

        hideList() {
            this.$emit("closeRight");
        }

        async getArea(areaFlag: any) {
            let vm = this;
            await this.$http
                .get("/rest/basic/getAreaList?areaFlag=" + areaFlag)
                .then(function(res: any) {
                    if (areaFlag == 1) {
                        vm.search.cityList.arr = [
                            { label: "全部", value: "全部" }
                        ];
                    } else if (areaFlag == 2) {
                        vm.search.rivers.arr = [{ label: "全部", value: "" }];
                    }
                    res.data.forEach(function(item: any, index: number) {
                        if (areaFlag == 1) {
                            vm.search.cityList.arr.push({
                                label: item.sss,
                                value: item.id
                            });
                        } else if (areaFlag == 2) {
                            vm.search.rivers.arr.push({
                                label: item.ly,
                                value: item.ly
                            });
                        }
                    });
                    //console.log(vm.search.cityList)
                    //vm.search.cityList
                });
        }

        async changeCity(city: any) {
            let self = this;
            let obj: any;
            self.search.cityList.arr.forEach(function(item: any) {
                if (item.value == city) {
                    obj = item;
                }
            });
            let params: any = {
                areaFlag: 1,
                city: obj.label
            };
            self.search.counties.disable = false;
            await this.$http
                .get("/rest/basic/getAreaList", { params: params })
                .then(function(res: any) {
                    if (city.slice(2, 4) != "00") {
                        self.search.counties.default = "";
                        self.search.counties.arr = [
                            { label: "全市", value: "全市" }
                        ];
                    } else {
                        self.search.counties.default = "";
                        self.search.counties.arr = [];
                        self.search.counties.disable = true;
                    }
                    res.data.forEach(function(item: any) {
                        self.search.counties.arr.push({
                            label: item.ssx || item.CITY,
                            value: item.id
                        });
                    });
                });
            self.locateArea(obj.value);
        }

        locateArea(item: any) {
            let self = this;
            let obj: any;
            if (item == "") {
                this.getSelectArea("");
            } else if (item == "全市") {
                this.getSelectArea(self.search.cityList.default);
            } else {
                self.search.cityList.arr.forEach(function(data: any) {
                    if (data.value == item) {
                        obj = data;
                        self.getSelectArea(obj.label + 0);
                    }
                });
                self.search.counties.arr.forEach(function(data: any) {
                    if (data.value == item && data.label != "全省") {
                        obj = data;
                        self.getSelectArea(obj.label + 1);
                    }
                });
                self.search.rivers.arr.forEach(function(data: any) {
                    if (data.value == item) {
                        obj = data;
                        self.search.rivers1.default = "";
                        self.getSelectArea(obj.label + 2);
                    }
                });
                self.search.rivers1.arr.forEach(function(data: any) {
                    if (data.value == item) {
                        obj = data;
                        self.getSelectArea(obj.value + 3);
                    }
                });
            }
            //this.getCenter([obj.lon, obj.lat]);
        }

        setInter(n: number) {
            let vm = this;
            this.search.interval = setInterval(function() {
                vm.searchResult();
            }, n * 60 * 3600);
        }

        @Watch("search.danger")
        interValStatus(n: any) {
            if (n) {
                this.search.zlxz.old = JSON.parse(
                    JSON.stringify(this.search.zlxz.selected)
                );
                this.search.zlxz.selected = ["水库"];
                this.searchResult();
            } else {
                this.search.zlxz.selected = this.search.zlxz.old;
            }
            this.search.zlxz.disable = n;
        }
        @Watch("search.areaType.default")
        areaTypeChange(n: string) {
            if (n == "1") {
                this.search.rivers.default = "";
                this.search.rivers1.default = "";
            } else {
                this.search.cityList.default = "";
                this.search.counties.default = "";
            }
        }

        @Watch("search.zlxz.selected")
        changeZl(n: any, o: any) {
            let vm = this;
            if (
                o.filter(function(item: any) {
                    return item == "水库";
                }).length
            ) {
                this.search.sklx.old = JSON.parse(
                    JSON.stringify(vm.search.sklx.selected)
                );
            }
            if (
                n.filter(function(item: any) {
                    return item == "水库";
                }).length
            ) {
                vm.search.sklx.selected = this.search.sklx.old;
                vm.search.sklx.disable = false;
            } else {
                vm.search.sklx.selected = [];
                vm.search.sklx.disable = true;
            }
        }

        // 导出
        handleExport() {
            let self = this;
            let postbody: any = this.$utils.deepCopy(this.search);
            let str: string = "",
                zlxz: string = "",
                sklx: string = "";
            if (postbody.checkList.length != 0) {
                postbody.checkList.forEach(function(s: any) {
                    switch (s) {
                        case "中央":
                            str += "1,";
                            break;
                        case "省重点":
                            str += "2,";
                            break;
                        case "省一般":
                            str += "3,";
                            break;
                        case "山洪":
                            str += "5,";
                            break;
                        case "其他":
                            str += "4,";
                            break;
                    }
                });
            }
            if (self.search.areaType.default == 1) {
                postbody.rivers.default = "";
                postbody.rivers1.default = "";
            } else {
                postbody.cityList.default = "";
                postbody.counties.default = "";
            }
            //水库RR 河道ZZ，ZQ 闸吧 DD 潮汐TT
            if (postbody.zlxz.selected.length) {
                postbody.zlxz.selected.forEach(function(s: any) {
                    switch (s) {
                        case "水库":
                            zlxz += "RR,";
                            break;
                        case "河道":
                            zlxz += "ZZ,ZQ,";
                            break;
                        case "堰闸":
                            zlxz += "DD,";
                            break;
                        case "潮汐":
                            zlxz += "TT,";
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
                            break;
                        case "中型":
                            sklx += "3,";
                            break;
                        case "小一":
                            sklx += "2,";
                            break;
                        case "其他(含小二)":
                            sklx += "1,9,";
                            break;
                    }
                });
            }
            /*if(postbody.cityList.default=='浙江省'){
                                                                            postbody.cityList.default = ''
                                                                        }*/
            if (postbody.counties.default == "全市") {
                postbody.counties.default = "";
            }
            let ly: any;
            if (
                postbody.rivers.default == "钱塘江" &&
                postbody.rivers1.default != ""
            ) {
                ly = postbody.rivers.default + "," + postbody.rivers1.default;
            } else {
                ly = postbody.rivers.default;
            }
            let params: any = {
                areaFlag: postbody.areaType.default, //地区标识（1行政区2流域）
                sss: postbody.cityList.default, //地级市
                ssx: postbody.counties.default, //地级县
                zl: zlxz, //站类选择
                sklx: sklx, //水库类型
                ly: ly, //流域（水系）
                sfcj: postbody.overLine, //是否超警0所有1超警
                bxdj: str, //报汛等级
                zm: postbody.inputVal,
                flag: 1,
                cjly: ""
            };
            const url = this.$utils.formatURL(
                "/rest/water/leadoutNewDataList",
                params
            );
            window.open(url);
        }

        created() {
            const vm = this;
            this.autoHeightMixin(200);
            this.getArea("2");
            this.getArea("1").then(() => {
                if (vm.$utils.selectByCode()) {
                    if (vm.$utils.selectByCode().length == 4) {
                        vm.search.cityList.default =
                            vm.$utils.selectByCode() + "00";
                        this.changeCity(this.$utils.selectByCode() + "00");
                        this.searchResult();
                    } else {
                        vm.search.cityList.default =
                            this.$utils.selectByCode().slice(0, 4) + "00";
                        this.changeCity(
                            this.$utils.selectByCode().slice(0, 4) + "00"
                        ).then(() => {
                            vm.search.counties.default = vm.$utils.selectByCode();
                            this.locateArea(this.$utils.selectByCode());
                            this.searchResult();
                        });
                    }
                } else {
                    this.searchResult();
                }
            });
        }

        mounted() {}

        beforeDestroy() {
            this.getPoint();
        }
    }
</script>

<style lang="scss" scoped>
    .el-checkbox-group {
        display: inline-flex !important;
        justify-content: space-between;
        width: 303px;
    }
</style>
