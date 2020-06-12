<template>
    <div class="markerCon" ref="kongtiao" v-drag>
        <div class="title">
            <div class="ls"></div>
            {{
                markInfo.info.sss + "-" + markInfo.info.ssx + "-" + baseData.zl
            }}站 （{{ markInfo.info.zm }}{{ markInfo.info.zh }}）
            <span @click="closeModel">
                <i class="iconfont iconxingzhuang" />
            </span>
        </div>

        <div class="content">
            <LeftMenu
                class="left"
                @rightType="openRight"
                :props="details"
                v-show="baseData.showType == 'all'"
                v-if="$utils.checkUser(userInfo.roles, 'super')"
            />
            <div
                v-if="rightCon.show"
                class="closeSw"
                :style="!rightCon.open ? { left: '786px' } : { left: '96px' }"
            >
                <img
                    src="@/assets/leftBars/closeSw.png"
                    v-if="rightCon.open"
                    alt=""
                    @click="rightCon.open = false"
                />
                <img
                    src="@/assets/leftBars/openSw.png"
                    v-if="!rightCon.open"
                    alt=""
                    @click="rightCon.open = true"
                />
            </div>
            <div
                class="middle"
                :class="{ true: 'middleAll' }[baseData.showType == 'part']"
            >
                <div class="tabBar">
                    <el-tabs v-model="tabBar.default" @tab-click="checkTab">
                        <el-tab-pane name="ssgc" label="实时过程">
                            <div class="chartTable">
                                <div class="sxItem">
                                    <div class="lb-item">
                                        <el-radio
                                            v-if="
                                                $utils.checkUser(
                                                    userInfo.roles,
                                                    'super'
                                                ) && details.fre !== 'h'
                                            "
                                            v-model="sxItem.timeType.default"
                                            style="line-height: 40px"
                                            :label="item.value"
                                            :key="index"
                                            v-for="(item, index) in sxItem
                                                .timeType.list"
                                            @change="changeTime"
                                        >
                                            {{ item.label }}
                                        </el-radio>
                                        <div
                                            style="display: inline-block"
                                        ></div>
                                    </div>
                                    <div
                                        class="lb-item"
                                        style="margin-left: 10px"
                                        v-show="
                                            details.item.match('Z') !== null
                                        "
                                    >
                                        <span
                                            style="color: #333;font-weight: 600;"
                                            >超过</span
                                        >
                                        <span style="margin: 0 5px">(m)</span>
                                        <el-input
                                            class="searchItem"
                                            style="width:40px"
                                            v-model="search.moreVal"
                                            @keyup.enter.native="filterData"
                                        >
                                        </el-input>
                                    </div>
                                    <div
                                        class="lb-item"
                                        v-if="
                                            search.beforeList.default != 'zdy'
                                        "
                                    >
                                        <span
                                            class="label"
                                            style="color: #0169e1;"
                                            v-show="baseData.show"
                                            >{{
                                                "约" +
                                                    (sxItem.timeType.default ==
                                                    1
                                                        ? baseData.count +
                                                          "小时"
                                                        : baseData.count * 5 +
                                                          "分钟")
                                            }}</span
                                        >
                                    </div>
                                    <div class="lb-item">
                                        <span
                                            class="label"
                                            style="color: #333;font-weight: 600;"
                                            >时间</span
                                        >
                                        <el-select
                                            style="width: 90px"
                                            v-model="search.beforeList.default"
                                            placeholder="请选择"
                                            @change="changetimeLength"
                                        >
                                            <el-option
                                                v-for="item in timeList"
                                                :key="item.value"
                                                :label="item.label"
                                                :value="item.value"
                                            >
                                            </el-option>
                                        </el-select>
                                    </div>
                                    <div
                                        class="searchBar lb-item"
                                        v-show="
                                            search.beforeList.default == 'zdy'
                                        "
                                    >
                                        <el-date-picker
                                            class="searchItem no-pl"
                                            style="width: 116px"
                                            v-model="search.current.start"
                                            type="datetime"
                                            format="yyyy-MM-dd HH:mm"
                                            prefix-icon="-"
                                            :clearable="false"
                                            @change="getStartTime"
                                        />
                                        <el-date-picker
                                            class="searchItem no-pl"
                                            style="width: 116px;margin-left: 5px"
                                            v-model="search.current.end"
                                            type="datetime"
                                            format="yyyy-MM-dd HH:mm"
                                            prefix-icon="-"
                                            :clearable="false"
                                            @change="getEndTime"
                                        />
                                        <el-button
                                            type="primary"
                                            size="small"
                                            style="margin-left: 5px;"
                                            @click="commitTimeLength"
                                            >确定
                                        </el-button>
                                    </div>
                                </div>
                                <div class="tbData" id="chartdiv"></div>
                                <div>
                                    <el-row>
                                        <el-col
                                            :span="5"
                                            v-show="
                                                details.item.match('Z') !== null
                                            "
                                        >
                                            最高水位:<span class="intro">{{
                                                baseData.highsw
                                                    ? baseData.highsw + "m"
                                                    : "-"
                                            }}</span>
                                        </el-col>
                                        <el-col
                                            :span="5"
                                            v-show="
                                                details.item.match('Z') !== null
                                            "
                                        >
                                            最新水位:<span class="intro">{{
                                                baseData.lastsw
                                                    ? baseData.lastsw + "m"
                                                    : "-"
                                            }}</span>
                                        </el-col>
                                        <el-col
                                            :span="5"
                                            v-show="
                                                details.item.match('P') !== null
                                            "
                                        >
                                            累计雨量:<span class="intro">{{
                                                baseData.sumyl
                                                    ? baseData.sumyl + "mm"
                                                    : "-"
                                            }}</span>
                                        </el-col>
                                        <el-col
                                            :span="9"
                                            style="float: right; width: 166px; padding-top: 6px;"
                                        >
                                            <!--<el-button @click="handleOpenRadar">年极值</el-button>-->
                                            <img
                                                src="../../assets/button/frequency.png"
                                                v-show="showDialogButton"
                                                v-if="
                                                    $utils.checkUser(
                                                        userInfo.roles,
                                                        'super'
                                                    )
                                                "
                                                @click="handleOpenStatistic"
                                                style="cursor: pointer"
                                                alt="频率统计"
                                            />
                                            <img
                                                src="../../assets/button/export.png"
                                                @click="handleExportRealtime"
                                                style="margin-left: 6px; cursor: pointer"
                                                alt="表格导出"
                                                v-if="
                                                    $utils.checkUser(
                                                        userInfo.roles,
                                                        'super'
                                                    )
                                                "
                                            />
                                        </el-col>
                                    </el-row>
                                </div>
                            </div>
                            <div class="listTb" v-show="details.zl == 'RR'">
                                <div class="name-label name-label-R">
                                    汛限水位(m)
                                </div>
                                <div
                                    class="val-label val-label-R"
                                    :title="details.xxsw"
                                >
                                    {{ details.xxsw || "-" }}
                                </div>
                                <div class="name-label name-label-R">
                                    正常水位(m)
                                </div>
                                <div
                                    class="val-label val-label-R"
                                    :title="details.zcsw"
                                >
                                    {{ details.zcsw || "-" }}
                                </div>
                                <div class="name-label name-label-R">
                                    坝顶高程(m)
                                </div>
                                <div
                                    class="val-label val-label-R"
                                    :title="details.bdgc"
                                >
                                    {{ details.bdgc || "-" }}
                                </div>
                                <div class="name-label name-label-R">
                                    校核洪水位(m)
                                </div>
                                <div
                                    class="val-label val-label-R"
                                    :title="details.xhhsw"
                                >
                                    {{ details.xhhsw || "-" }}
                                </div>
                                <div class="name-label name-label-R">
                                    设计洪水位(m)
                                </div>
                                <div
                                    class="val-label val-label-R"
                                    :title="details.sjhsw"
                                >
                                    {{ details.sjhsw || "-" }}
                                </div>
                                <div class="name-label name-label-R">
                                    防洪高水位(m)
                                </div>
                                <div
                                    class="val-label val-label-R"
                                    :title="details.fhgsw"
                                >
                                    {{ details.fhgsw || "-" }}
                                </div>
                                <div class="name-label name-label-R">
                                    死水位(m)
                                </div>
                                <div
                                    class="val-label val-label-R"
                                    :title="details.ssw"
                                >
                                    {{ details.ssw || "-" }}
                                </div>
                                <div class="name-label name-label-R">
                                    总库容(百万方)
                                </div>
                                <div
                                    class="val-label val-label-R"
                                    :title="details.zkr"
                                >
                                    {{ details.zkr || "-" }}
                                </div>
                                <div class="name-label name-label-R">
                                    死库容(百万方)
                                </div>
                                <!--死库容和集水面积-->
                                <div
                                    class="val-label val-label-R"
                                    :title="details.skr"
                                >
                                    {{ details.skr || "-" }}
                                </div>
                                <div class="name-label name-label-R">
                                    集水面积(m²)
                                </div>
                                <div
                                    class="val-label val-label-R"
                                    :title="details.jsmj"
                                >
                                    {{ details.jsmj || "-" }}
                                </div>
                                <div class="name-label name-label-R">
                                    最高水位(m)
                                </div>
                                <div
                                    class="val-label "
                                    style="width: calc(100% - 110px)"
                                >
                                    <span :title="details.htz">
                                        {{ details.htz || "-" }}
                                    </span>
                                    <span :title="details.htztm">
                                        {{
                                            details.htz
                                                ? "(" +
                                                  details.htztm.slice(0, -5) +
                                                  ")"
                                                : ""
                                        }}
                                    </span>
                                </div>
                            </div>
                            <div
                                class="listTb"
                                v-show="
                                    details.zl == 'ZZ' ||
                                        details.zl == 'ZQ' ||
                                        details.zl == 'DD'
                                "
                            >
                                <div class="name-label">警戒水位(m)</div>
                                <div class="val-label" :title="details.jjsw">
                                    {{ details.jjsw || "-" }}
                                </div>
                                <div class="name-label">保证水位(m)</div>
                                <div class="val-label" :title="details.bzsw">
                                    {{ details.bzsw || "-" }}
                                </div>
                                <div class="name-label">左堤高程(m)</div>
                                <div class="val-label" :title="details.ztgc">
                                    {{ details.ztgc || "-" }}
                                </div>
                                <div class="name-label">右堤高程(m)</div>
                                <div class="val-label" :title="details.ytgc">
                                    {{ details.ytgc || "-" }}
                                </div>
                                <div class="name-label">最高水位(m)</div>
                                <div
                                    class="val-label"
                                    style="width: calc(100% - 90px)"
                                >
                                    <span :title="details.htz">
                                        {{ details.htz || "-" }}
                                    </span>
                                    <span :title="details.htztm">
                                        {{
                                            details.htz
                                                ? "(" +
                                                  details.htztm.slice(0, -5) +
                                                  ")"
                                                : ""
                                        }}
                                    </span>
                                </div>
                                <div class="name-label name-label-R">
                                    最大流量(m³/s)
                                </div>
                                <div
                                    class="val-label"
                                    style="width: calc(100% - 110px)"
                                >
                                    <span :title="details.mxq">
                                        {{ details.mxq || "-" }}
                                    </span>
                                    <span :title="details.mxqtm">
                                        {{
                                            details.mxqtm
                                                ? "(" +
                                                  details.mxqtm.slice(0, -5) +
                                                  ")"
                                                : ""
                                        }}
                                    </span>
                                </div>
                            </div>
                            <div class="listTb" v-show="details.zl == 'TT'">
                                <div class="name-label">警戒水位(m)</div>
                                <div class="val-label" :title="details.jjsw">
                                    {{ details.jjsw }}
                                </div>
                                <div class="name-label">保证水位(m)</div>
                                <div class="val-label" :title="details.bzsw">
                                    {{ details.bzsw }}
                                </div>
                                <div class="name-label">堤防高程(m)</div>
                                <div
                                    class="val-label"
                                    style="width: calc(100% - 90px)"
                                    :title="details.ztgc"
                                >
                                    {{ details.ztgc || "-" }}
                                </div>
                                <br />
                                <div class="name-label">最高水位(m)</div>
                                <div
                                    class="val-label"
                                    style="width: calc(100% - 90px)"
                                >
                                    <span :title="details.sczgsw">
                                        {{ details.sczgsw || "-" }}
                                    </span>
                                    <span :title="details.sczgcxsj">
                                        {{
                                            details.sczgcxsj
                                                ? "(" +
                                                  details.sczgcxsj.slice(
                                                      0,
                                                      -5
                                                  ) +
                                                  ")"
                                                : ""
                                        }}
                                    </span>
                                </div>
                                <div class="name-label">最低水位(m)</div>
                                <div
                                    class="val-label"
                                    style="width: calc(100% - 90px)"
                                >
                                    <span :title="details.lszd">
                                        {{ details.lszd || "-" }}
                                    </span>
                                    <span :title="details.lszdsj">
                                        {{
                                            details.lszdsj
                                                ? "(" +
                                                  details.lszdsj.slice(0, -5) +
                                                  ")"
                                                : ""
                                        }}
                                    </span>
                                </div>
                            </div>
                            <div
                                class="listTb"
                                v-show="
                                    details.zl == 'PP' || details.zl == 'MM'
                                "
                            >
                                <div class="name-label name-label-P">
                                    最大1小时(mm)
                                </div>
                                <div
                                    class="val-label val-label-P"
                                    :title="details['1h']"
                                >
                                    {{ details["1h"] || "-" }}
                                </div>
                                <div class="name-label name-label-P">
                                    最大3小时(mm)
                                </div>
                                <div
                                    class="val-label val-label-P"
                                    :title="details['3h']"
                                >
                                    {{ details["3h"] || "-" }}
                                </div>
                                <div class="name-label name-label-P">
                                    最大6小时(mm)
                                </div>
                                <div
                                    class="val-label val-label-P"
                                    :title="details['6h']"
                                >
                                    {{ details["6h"] || "-" }}
                                </div>
                                <div class="name-label name-label-P">
                                    最大12小时(mm)
                                </div>
                                <div
                                    class="val-label val-label-P"
                                    :title="details['12h']"
                                >
                                    {{ details["12h"] || "-" }}
                                </div>
                            </div>
                            <div class="listTb">
                                <el-table
                                    border
                                    :data="baseData.tbdata"
                                    style="width: 100%"
                                    :height="baseData.height"
                                    :cell-style="highlightFirst"
                                >
                                    <el-table-column
                                        type="index"
                                        label="序"
                                        fixed="left"
                                        width="40"
                                    ></el-table-column>
                                    <el-table-column
                                        show-overflow-tooltip
                                        prop="time"
                                        label="时间"
                                        width="90"
                                        fixed="left"
                                        v-if="
                                            baseData.zl != '雨量' &&
                                                baseData.zl != '气象'
                                        "
                                    ></el-table-column>
                                    <el-table-column
                                        show-overflow-tooltip
                                        prop="time"
                                        label="时间"
                                        width="200"
                                        fixed="left"
                                        v-if="
                                            baseData.zl == '雨量' ||
                                                baseData.zl == '气象'
                                        "
                                    ></el-table-column>
                                    <el-table-column
                                        show-overflow-tooltip
                                        prop="yl"
                                        label="雨量"
                                        :width="
                                            details.item.match('P') ? 75 : 60
                                        "
                                    ></el-table-column>
                                    <el-table-column
                                        show-overflow-tooltip
                                        prop="sw"
                                        label="水位"
                                        width="80"
                                        v-if="
                                            baseData.zl != '雨量' &&
                                                baseData.zl != '气象'
                                        "
                                    >
                                        <template slot-scope="scope">
                                            <span
                                                style="display: inline-block; width: 50px; text-align: left"
                                                >{{ scope.row.sw }}</span
                                            >
                                            <i
                                                :class="
                                                    scope.row.zs == 0
                                                        ? ''
                                                        : scope.row.zs == '1'
                                                        ? 'el-icon-top colorRed'
                                                        : 'el-icon-bottom colorGreen'
                                                "
                                            />
                                            <i
                                                v-if="scope.row.zs == 0"
                                                class="el-icon-minus"
                                            ></i>
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                        show-overflow-tooltip
                                        prop="con"
                                        label="库容"
                                        width="90"
                                        v-if="
                                            baseData.zl.match('水库') !== null
                                        "
                                    >
                                        <template slot-scope="scope">
                                            <span>{{ scope.row.con }}</span>
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                        show-overflow-tooltip
                                        prop="ll"
                                        label="流量"
                                        width="60"
                                        v-if="
                                            baseData.zl.match('河道') !== null
                                        "
                                    >
                                        <template slot-scope="scope">
                                            <span>{{ scope.row.ll }}</span>
                                        </template>
                                    </el-table-column>
                                    <!--<el-table-column
                                            show-overflow-tooltip
                                            prop="ckll"
                                            label="出库流量"
                                            width="90"
                                            v-if="
                                            baseData.zl.match('大型水库') !== null||baseData.zl.match('中型水库') !== null
                                        "
                                    ></el-table-column>
                                    <el-table-column
                                            show-overflow-tooltip
                                            prop="rkll"
                                            label="入库流量"
                                            width="90"
                                            v-if="
                                            baseData.zl.match('大型水库') !== null||baseData.zl.match('中型水库') !== null
                                        "
                                    ></el-table-column>-->
                                </el-table>
                            </div>
                            <div style="clear: both"></div>
                        </el-tab-pane>
                        <el-tab-pane
                            name="jzgc"
                            label="均值过程"
                            v-if="baseData.showType == 'all'"
                        >
                            <MeanProcess
                                :prop="markInfo.info"
                                v-if="tabBar.default === 'jzgc'"
                            />
                        </el-tab-pane>
                        <el-tab-pane
                            name="tqdb"
                            label="同期对比"
                            v-if="baseData.showType == 'all'"
                        >
                            <SameTimeCompare
                                :prop="details"
                                v-if="tabBar.default === 'tqdb'"
                            />
                        </el-tab-pane>
                        <el-tab-pane
                            name="myjzdb"
                            label="每月均值对比"
                            v-if="baseData.showType == 'all'"
                        >
                            <EachMonthCompare
                                v-if="tabBar.default === 'myjzdb'"
                                :prop="markInfo.info"
                            />
                        </el-tab-pane>
                        <el-tab-pane
                            name="njzxl"
                            label="年极值系列"
                            v-if="baseData.showType == 'all'"
                        >
                            <YearMaxSeries
                                :prop="details"
                                v-if="tabBar.default === 'njzxl'"
                            />
                        </el-tab-pane>
                    </el-tabs>
                </div>
            </div>
            <transition name="fade">
                <Right-bars
                    class="right"
                    :content="rightCon"
                    v-if="rightCon.show"
                    :style="
                        !rightCon.open
                            ? { width: '340px' }
                            : { width: '1044px' }
                    "
                    @closeContent="closeCon"
                />
            </transition>
        </div>
        <transition name="fade">
            <data-table
                v-if="dialog.show"
                :dataDialog="dialog"
                :visible.sync="dialog.show"
            />
        </transition>
    </div>
</template>

<script>
    import "@/styles/mapView/right.scss";
    import { LeftMenu, RightBars, DataTable } from "./index";
    import { mapState } from "vuex";
    import moment from "moment";
    import {
        EachMonthCompare,
        FrequencyCurve,
        MeanProcess,
        SameTimeCompare,
        YearMaxSeries
    } from "./components";
    import ExportExcelButton from "../ExportExcelButton.vue";

    let cancelToken = null;

    function getllMinMax(array, zcsw, xxsw, jjsw, bzsw, STTP) {
        let first = array[0].RZ;
        let first1 = array[0].data;
        let MaxWater = 0;
        let MinWater = Number(first);
        let maxRain = 0;
        let minRain = Number(first1);
        let zcline = zcsw,
            xxLine = xxsw,
            jjLine = jjsw,
            bzLine = bzsw;
        if ("" == zcsw) zcline = null;
        if ("" == xxsw) xxLine = null;
        if ("" == jjsw) jjLine = null;
        if ("" == bzsw) bzLine = null;
        // 初始化最大最小值
        if (STTP == "RR") {
            if (zcline != null) {
                MinWater = Number(zcline);
                MaxWater = Number(zcline);
            }
            if (xxLine != null) {
                if (Number(xxLine) > MaxWater) MaxWater = Number(xxLine);
                if (Number(xxLine) < MinWater) MinWater = Number(xxLine);
            }
        } else {
            if (jjLine != null) {
                MinWater = Number(jjLine);
                MaxWater = Number(jjLine);
            }
            if (bzLine != null) {
                if (Number(bzLine) > MaxWater) MaxWater = Number(bzLine);
                if (Number(bzLine) < MinWater) MinWater = Number(bzLine);
            }
        }

        // 得到序列的最大最小值
        for (let i = 0; i < array.length; i++) {
            let obj = array[i].RZ;
            let rainItem = array[i].data;
            if (obj && obj != "") {
                if (Number(obj) > MaxWater) MaxWater = Number(obj);
                if (Number(obj) < MinWater) MinWater = Number(obj);
            }
            if (rainItem && rainItem != "") {
                if (Number(rainItem) > maxRain) maxRain = Number(rainItem);
                if (Number(rainItem) < minRain) minRain = Number(rainItem);
            }
        }

        //差值
        let diff = MaxWater - MinWater;
        let diff1 = maxRain - minRain;
        MaxWater += diff / 10;
        if (MinWater > 0) {
            MinWater = Math.max(0, MinWater - diff / 10);
        }
        if (MaxWater != MinWater) {
            MaxWater =
                Math.floor(MinWater / 5) * 5 +
                Math.floor(
                    (MaxWater - MinWater < 1 ? 1 : MaxWater - MinWater) / 5
                ) *
                    5;
            MinWater = Math.ceil(MinWater / 5) * 5;
        } else {
            MaxWater = MinWater + 2.5;
            MinWater = MinWater - 2.5 > 0 ? MinWater - 2.5 : 0;
        }

        if (maxRain < 5) {
            maxRain = 10;
        } else {
            maxRain = Math.floor(maxRain / 5) * 5 * 2;
        }
        return {
            maxValue: maxRain,
            minValue: minRain,
            min: MinWater,
            max: MaxWater
        };
    }

    function updateDrpSumDate(from, to, chart) {
        let start = Math.floor(from * chart.data.length);
        let end = Math.floor(to * chart.data.length) + 1;
        let drpz = 0;
        let dataarray = [];
        for (let i = start; i < end; i++) {
            drpz += Number(chart.data[i].data);
            dataarray.push({ date: chart.data[i].tm, value: drpz });
        }
        return drpz.toFixed(1);
    }

    function updateMaxSwDate(from, to, chart) {
        let start = Math.floor(from * chart.data.length);
        let end = Math.floor(to * chart.data.length) + 1;
        let drpz = 0;
        for (let i = start; i < end; i++) {
            drpz < Number(chart.data[i].RZ)
                ? (drpz = Number(chart.data[i].RZ))
                : "";
        }
        return drpz.toFixed(2);
    }

    function updateNewSwDate(from, to, chart) {
        let end = Math.floor(to * chart.data.length);
        return chart.data[end].RZ.toFixed(2);
    }

    const mock = [
        { data: "1", RZ: "135.17", tm: "2019/7/24 22:00", LL: "10" },
        { data: "2", RZ: "135.2", tm: "2019/7/24 23:00", LL: "20" },
        { data: "3", RZ: "135.19", tm: "2019/7/25 0:00", LL: "30" },
        { data: "4", RZ: "135.19", tm: "2019/7/25 1:00", LL: "40" },
        { data: "5", RZ: "135.21", tm: "2019/7/25 2:00", LL: "50" },
        { data: "6", RZ: "135.21", tm: "2019/7/25 3:00", LL: "60" },
        { data: "7", RZ: "135.24", tm: "2019/7/25 4:00", LL: "70" },
        { data: "8", RZ: "135.25", tm: "2019/7/25 5:00", LL: "80" },
        { data: "6", RZ: "135.26", tm: "2019/7/25 6:00", LL: "90" }
    ];
    am4core.useTheme(am4themes_animated);
    export default {
        name: "markInfo",
        components: {
            LeftMenu,
            RightBars,
            DataTable,
            EachMonthCompare,
            FrequencyCurve,
            MeanProcess,
            SameTimeCompare,
            YearMaxSeries,
            ExportExcelButton
        },
        props: {
            markInfo: {},
            indexPoint: ""
        },
        data() {
            return {
                space: 6,
                moveDataelse: {
                    x: null,
                    y: null
                },
                details: {
                    zl: "",
                    item: ""
                },
                rightCon: {
                    show: false,
                    type: "",
                    info: "",
                    open: false,
                    lastsw: null
                },
                tabBar: {
                    default: "ssgc"
                },
                search: {
                    beforeList: {
                        default: "1",
                        arr: [
                            { label: "一天", value: "1" },
                            { label: "二天", value: "2" },
                            { label: "三天", value: "3" },
                            { label: "四天", value: "4" },
                            { label: "前一周", value: "7" },
                            { label: "前二周", value: "14" }
                        ],
                        arr1: [
                            { label: "近1小时", value: "1" },
                            { label: "近2小时", value: "2" },
                            { label: "近3小时", value: "3" },
                            { label: "近4小时", value: "4" },
                            { label: "近5小时", value: "5" },
                            { label: "近6小时", value: "6" },
                            { label: "近12小时", value: "12" },
                            { label: "近1天", value: "24" }
                        ]
                    }, //前**小时列表
                    moreVal: 0,
                    current: {
                        start: Date.now() - 30 * 24 * 3600 * 1000,
                        end: Date.now()
                    }
                },
                baseData: {
                    lastsw: "", //最新水位
                    zcsw: null, //正常水位
                    xxsw: null, //讯限水位
                    bzsw: null, //保证水位
                    jjsw: null, //警戒水位
                    maxsw: "", //水位轴最大取值
                    minsw: "", //最大小水位
                    highsw: "", //最高水位
                    maxyl: "", //雨量轴最大取值
                    sumyl: "", //累计雨量
                    zl: "", //站类
                    count: 0, //超过设定水位值数量
                    show: false, //超过多少显示小时分钟
                    flow: false, //流量是否全为null
                    maxll: "", //最大流量
                    minll: "", //最小流量
                    height: 418, //右侧列表初始高度
                    tbdata: [], //右侧表格内容
                    downloadUrl: "", //下载链接
                    showType: "part", //弹框内容展示的类型（根据站类来判断）,
                    rgbx: [] //人工报讯数据
                },
                chart: null,
                data: mock,
                allData: [], //初始获取数据
                sxItem: {
                    timeType: {
                        default: 1,
                        list: [
                            {
                                label: "小时",
                                value: 1
                            },
                            {
                                label: "分钟",
                                value: 2
                            }
                        ]
                    }
                },
                start: 0,
                dialog: {
                    show: false,
                    data: [],
                    info: {},
                    zl: "",
                    type: "detail",
                    jz: {
                        maxsw: null,
                        time1: "",
                        maxll: null,
                        time2: ""
                    }
                },
                showExportButton: false,
                showDialogButton: false // 若无数据，频率统计按钮不显示
            };
        },
        computed: mapState({
            userInfo: "userInfo",
            timeList: function() {
                const list1 = [
                    { label: "一天", value: "1" },
                    { label: "二天", value: "2" },
                    { label: "三天", value: "3" },
                    { label: "四天", value: "4" },
                    { label: "前一周", value: "7" },
                    { label: "前二周", value: "14" }
                ];
                const list2 = [
                    { label: "近1小时", value: "1" },
                    { label: "近2小时", value: "2" },
                    { label: "近3小时", value: "3" },
                    { label: "近4小时", value: "4" },
                    { label: "近5小时", value: "5" },
                    { label: "近6小时", value: "6" }
                ];
                if (this.sxItem.timeType.default == 1) {
                    if (!this.$utils.checkUser(this.userInfo.roles, "super")) {
                        return list1;
                    }
                    return list1.concat([{ label: "自定义", value: "zdy" }]);
                } else {
                    if (!this.$utils.checkUser(this.userInfo.roles, "super")) {
                        return list2;
                    }
                    return list2.concat([{ label: "自定义", value: "zdy" }]);
                }
            }
        }),
        methods: {
            // 检查频率统计是否有数据
            checkStatisticData() {
                const { zh, zl } = this.markInfo.info;
                const params = {
                    zh,
                    zl
                };
                this.$http
                    .get("/rest/basic/inquireSiteOtherInfo", { params })
                    .then(({ data }) => {
                        Number(data.频率统计)
                            ? (this.showDialogButton = true)
                            : (this.showDialogButton = false);
                    });
            },
            checkTab() {},
            closeCon() {
                this.rightCon.show = false;
                this.rightCon.open = false;
            },
            openRight(type) {
                this.rightCon.info = this.details;
                this.rightCon.type = type;
                this.rightCon.show = true;
                // this.rightCon.open = false;
            },
            handleOpenDetail() {
                this.dialog.show = true;
                this.dialog.type = "detail";
            },
            handleOpenRadar() {
                this.dialog.show = true;
                this.dialog.type = "radar";
            },
            handleOpenStatistic() {
                this.dialog.show = true;
                this.dialog.type = "statistic";
            },
            closeDataTable() {
                this.dialog.show = false;
                this.dialog.type = "detail";
            },
            getStartTime(val) {
                let length = this.search.current.end - new Date(val).getTime();
                if (
                    this.sxItem.timeType.default == 2 &&
                    length > 3 * 24 * 3600 * 1000
                ) {
                    this.$message("时间跨度不能超过3天");
                    this.search.current.end =
                        new Date(val).getTime() + 3 * 24 * 3600 * 1000;
                } else {
                    this.search.current.start = new Date(val).getTime();
                }
            },
            getEndTime(val) {
                let length =
                    new Date(val).getTime() - this.search.current.start;
                if (
                    this.sxItem.timeType.default == 2 &&
                    length > 3 * 24 * 3600 * 1000
                ) {
                    this.$message("时间跨度不能超过3天");
                    this.search.current.start =
                        new Date(val).getTime() - 3 * 24 * 3600 * 1000;
                } else {
                    this.search.current.end = new Date(val).getTime();
                }
            },
            changetimeLength(val) {
                if (val != "zdy") {
                    if (this.chart) {
                        this.chart.dispose();
                    }
                    this.$nextTick(async () => {
                        this.setData();
                        await this.init();
                        this.updateSeries();
                        this.dialog.data = this.allData;
                        this.dialog.info = this.markInfo.info;
                        this.dialog.zl = this.baseData.zl;
                    });
                } else {
                    if (this.sxItem.timeType.default == 1) {
                        this.search.current.start =
                            Date.now() - 30 * 24 * 3600 * 1000;
                    } else {
                        this.search.current.start =
                            Date.now() - 24 * 3600 * 1000;
                    }
                }
            },
            commitTimeLength() {
                if (this.chart) {
                    this.chart.dispose();
                }
                this.$nextTick(async () => {
                    this.setData();
                    await this.init();
                    this.updateSeries();
                    this.dialog.data = this.allData;
                    this.dialog.info = this.markInfo.info;
                    this.dialog.zl = this.baseData.zl;
                });
            },
            getData() {
                if (cancelToken) {
                    cancelToken();
                }
                const vm = this;
                vm.data = [];
                let list = [];
                list[0] = vm.$http.get(
                    "/rest/basic/getDetailSiteList?zm=" + vm.markInfo.info.zh,
                    {
                        cancelToken: new this.$http.CancelToken(function(
                            cancel
                        ) {
                            cancelToken = cancel;
                        })
                    }
                );
                let params, st, et;
                if (this.search.beforeList.default == "zdy") {
                    st = this.$utils.dateFormat(
                        new Date(this.search.current.start),
                        "yyyy-MM-ddTHH:mm:ss"
                    );
                    et = this.$utils.dateFormat(
                        new Date(this.search.current.end),
                        "yyyy-MM-ddTHH:mm:ss"
                    );
                } else {
                    if (this.sxItem.timeType.default == 1) {
                        st = this.$utils.dateFormat(
                            new Date(
                                Date.now() -
                                    this.search.beforeList.default *
                                        24 *
                                        3600 *
                                        1000
                            ),
                            "yyyy-MM-ddTHH:mm:ss"
                        );
                        et = this.$utils.dateFormat(
                            new Date(),
                            "yyyy-MM-ddTHH:mm:ss"
                        );
                    } else {
                        st = this.$utils.dateFormat(
                            new Date(
                                Date.now() -
                                    this.search.beforeList.default * 3600 * 1000
                            ),
                            "yyyy-MM-ddTHH:mm:ss"
                        );
                        et = this.$utils.dateFormat(
                            new Date(),
                            "yyyy-MM-ddTHH:mm:ss"
                        );
                    }
                }
                params = {
                    zm: vm.markInfo.info.zh,
                    st: st,
                    et: et,
                    jg: this.sxItem.timeType.default,
                    lx: 0
                };

                list[1] = vm.$http.get("/rest/water/getHisData", {
                    params,
                    cancelToken: new this.$http.CancelToken(function(cancel) {
                        cancelToken = cancel;
                    })
                });

                return vm.$http.all(list).then(
                    vm.$http.spread(function(...resList) {
                        return resList; // 拿到所有posts数据
                    })
                );
            },
            async init() {
                const vm = this;
                let posts = await this.getData();
                let data = posts[0].data;
                vm.baseData.zcsw = data[0].zcsw || 0;
                vm.baseData.xxsw = data[0].xxsw || 0;
                vm.baseData.bzsw = data[0].bzsw || 0;
                vm.baseData.jjsw = data[0].jjsw || 0;
                vm.details = data[0];
                this.checkZl();
                let res = posts[1].data;
                let max = 0,
                    time1;
                let maxll = 0,
                    time2;
                vm.data = [];
                vm.allData = [];
                let jugell = false;
                for (let k = 0; k < res.pz.length; k++) {
                    res.q[k].ll !== null ? (jugell = true) : "";
                }
                this.baseData.flow = jugell;
                res.pz.forEach(function(item, i) {
                    if (item.sw) {
                        vm.baseData.lastsw = item.sw;
                    }
                    if (max < parseFloat(item.sw)) {
                        max = parseFloat(item.sw);
                        time1 = item.tm;
                    }
                    if (maxll < Number(res.q[i].ll)) {
                        maxll = Number(res.q[i].ll);
                        time2 = item.tm;
                    }
                    vm.allData.push({
                        data:
                            item.yl === null
                                ? null
                                : Number(item.yl.toFixed(1)),
                        tm: item.tm,
                        RZ:
                            item.sw === null
                                ? null
                                : Number(item.sw.toFixed(2)),
                        ll:
                            res.q[i].ll === null
                                ? null
                                : Number(res.q[i].ll.toFixed(1)),
                        rgll: res.q[i].rg,
                        kr: item.kr,
                        jg: res.info[0].jg,
                        zx: res.info[0].zx,
                        st: res.info[0].st,
                        et: res.info[0].et,
                        lx: res.info[0].lx,
                        zs: item.zs,
                        ckll: res.w[i].ck,
                        rkll: res.w[i].rk
                    });
                });
                vm.baseData.rgbx = res.rg;
                jugell ? (vm.baseData.flow = true) : (vm.baseData.flow = false);
                vm.data = JSON.parse(JSON.stringify(vm.allData));
                vm.baseData.highsw = max;
                vm.dialog.jz.time1 = time1;
                vm.baseData.maxll = maxll;
                vm.dialog.jz.time2 = time2;
                vm.rightCon.lastsw = vm.baseData.lastsw;
            },
            openModal(type) {
                this.modal.sssj.show = true;
                if (type == 1) {
                } else if (type == 2) {
                } else if (type == 3) {
                }
            },

            checkZl() {
                let vm = this;
                vm.baseData.tbdata = [];
                if (vm.details.zl == "RR") {
                    //水库RR 河道ZZ，ZQ 闸吧 DD 潮汐TT
                    //小一2，小二1，中型3 大一5，大二4 其他9
                    if (this.details.sklx == "1" || this.details.sklx == "2") {
                        this.baseData.zl = "小型水库";
                    } else if (
                        this.details.sklx == "5" ||
                        this.details.sklx == "4"
                    ) {
                        this.baseData.zl = "大型水库";
                    } else {
                        this.baseData.zl = "中型水库";
                    }
                    this.baseData.height = 280;
                    this.baseData.downloadUrl = "";
                } else if (vm.details.zl == "ZZ" || vm.details.zl == "ZQ") {
                    vm.baseData.zl = "河道";
                } else if (this.details.zl == "DD") {
                    vm.baseData.zl = "闸坝";
                } else if (vm.details.zl == "TT") {
                    vm.baseData.zl = "潮汐";
                    vm.baseData.height = 324;
                } else if (vm.details.zl == "PP") {
                    vm.baseData.zl = "雨量";
                } else {
                    vm.baseData.zl = "气象";
                }
                if (vm.details.zl == "PP" || vm.details.zl == "MM") {
                    vm.baseData.height = 392;
                } else if (
                    vm.details.zl == "ZZ" ||
                    vm.details.zl == "ZQ" ||
                    vm.details.zl == "DD"
                ) {
                    this.baseData.height = 324;
                } else if (vm.details.zl == "TT") {
                    this.baseData.height = 324;
                }
                if (
                    (vm.details.zl.match("ZQ") ||
                        vm.details.zl.match("QZ") ||
                        vm.details.zl.match("ZZ") ||
                        vm.baseData.zl == "大型水库") &&
                    this.$utils.checkUser(this.userInfo.roles, "super")
                ) {
                    vm.baseData.showType = "all";
                } else {
                    vm.baseData.showType = "part";
                }
                let arr = JSON.parse(JSON.stringify(this.data));
                /*vm.baseData.rgbx.forEach(item => {
                    vm.baseData.tbdata.push({
                        time: vm.$utils.dateFormat(
                            new Date(item.tm),
                            "MM-dd HH:mm",
                        ),
                        ll: item.ll !== null ? item.ll.toFixed(1) : "-",
                        sw: item.sw === null ? "-" : item.sw.toFixed(2),
                        ckll: item.ck === null ? "-" : item.ck,
                        con: item.kr || "-",
                        rkll: item.rk === null ? "-" : item.rk,
                    })
                })*/

                arr.reverse().forEach(function(item) {
                    vm.baseData.tbdata.push({
                        time:
                            vm.baseData.zl == "雨量" || vm.baseData.zl == "气象"
                                ? vm.$utils.dateFormat(
                                      new Date(item.tm),
                                      "yyyy-MM-dd HH:mm"
                                  )
                                : vm.$utils.dateFormat(
                                      new Date(item.tm),
                                      "MM-dd HH:mm"
                                  ),
                        no: item.zh || "-",
                        yl:
                            item.data === null
                                ? "-"
                                : Number(item.data.toFixed(1)),
                        sw: item.RZ === null ? "-" : item.RZ.toFixed(2),
                        xx: vm.details.xxsw || "-",
                        con: item.kr || "-",
                        zcsw: vm.details.zcsw || "-",
                        jjsw: vm.details.jjsw || "-",
                        bzsw: vm.details.bzsw || "-",
                        rkll: item.rkll === null ? "-" : item.rkll,
                        ckll: item.ckll === null ? "-" : item.ckll,
                        zs: item.zs,
                        ll: item.ll ? item.ll.toFixed(1) : "-"
                    });
                });
            },
            highlightFirst(row) {
                /*if (this.baseData.rgbx.length == 0) return;
                if (row.rowIndex == 0) {
                    return {"background-color": "#800080", color: "white"};
                }*/
            },
            filterData() {
                let vm = this;
                vm.baseData.show = true;
                vm.baseData.count = 0;
                this.data.forEach(function(item) {
                    if (item.RZ > vm.search.moreVal) {
                        vm.baseData.count++;
                    }
                });
            },
            changeTime() {
                if (this.chart) {
                    this.chart.dispose();
                }
                this.search.beforeList.default = "1";
                this.$nextTick(async () => {
                    this.setData();
                    await this.init();
                    this.updateSeries();
                    this.baseData.count = 0;
                    this.baseData.show = false;
                    this.dialog.data = this.allData;
                    this.dialog.info = this.markInfo.info;
                    this.dialog.zl = this.baseData.zl;
                });
            },
            closeModel() {
                if (this.chart) {
                    this.chart.dispose();
                }
                this.$emit("closeModal");
            },
            setData() {
                let vm = this;
                let chart = am4core.create("chartdiv", am4charts.XYChart);
                chart.dataProvider = this.data;
                chart.colors.step = 2;
                //chart.maskBullets = false;
                chart.maskBullets = false;
                chart.leftAxesContainer.layout = "vertical";
                chart.rightAxesContainer.layout = "vertical";
                // Add data
                chart.data = [];
                chart.dataProvider = mock;
                // Create axes X轴
                let xAxis = new am4charts.DateAxis();
                let dateAxis = chart.xAxes.push(xAxis);
                dateAxis.renderer.fullWidthTooltip = true;
                //dateAxis.renderer.ticks.template.align = 'left'
                dateAxis.renderer.grid.template.location = 0.5;
                dateAxis.renderer.ticks.template.location = 0.5;
                dateAxis.renderer.labels.template.location = 0.5;
                dateAxis.renderer.ticks.template.disabled = false;
                dateAxis.renderer.ticks.template.strokeOpacity = 1;
                dateAxis.renderer.line.strokeOpacity = 1;
                dateAxis.marginBottom = -20;
                dateAxis.renderer.minGridDistance = 60;
                // dateAxis.dateFormats.setKey("hour", "dd日kk时");
                // dateAxis.periodChangeDateFormats.setKey("hour", "dd日kk时");
                chart.cursor = new am4charts.XYCursor();
                chart.cursor.fullWidthLineX = true;
                chart.cursor.xAxis = dateAxis;
                chart.cursor.lineY.disabled = true;
                chart.cursor.lineX.disabled = true;
                let xAxis1 = new am4charts.DateAxis();
                let dateAxis1 = chart.xAxes.push(xAxis1);
                dateAxis1.marginTop = -23;
                dateAxis1.renderer.inside = false;
                dateAxis1.renderer.minGridDistance = 70;
                dateAxis1.renderer.opposite = true;
                dateAxis1.renderer.fullWidthTooltip = false;
                dateAxis1.renderer.ticks.template.disabled = false;
                dateAxis1.renderer.ticks.template.strokeOpacity = 1;
                dateAxis1.renderer.line.strokeOpacity = 1;
                // dateAxis.dateFormats.setKey("hour", "dd日kk时");
                // dateAxis.periodChangeDateFormats.setKey("hour", "dd日kk时");
                dateAxis.dateFormats.setKey("hour", "dd日HH时");
                dateAxis.periodChangeDateFormats.setKey("hour", "dd日HH时");
                dateAxis.dateFormats.setKey("day", "MM月dd日");
                dateAxis.periodChangeDateFormats.setKey("day", "MM月dd日");
                dateAxis.dateFormats.setKey("minute", "HH时mm分");
                dateAxis.periodChangeDateFormats.setKey("minute", "HH时mm分");
                if (this.sxItem.timeType.default == 1) {
                    dateAxis.renderer.minGridDistance = 70;
                }
                chart.dateFormatter.inputDateFormat = "yyyy-MM-dd HH:mm:ss";
                //remove logo
                let eles = document.querySelectorAll(
                    "[aria-labelledby$=-title]"
                );
                for (let i = 0; i < eles.length; i++) {
                    eles[i].style.visibility = "hidden";
                }
                // Legend
                chart.legend = new am4charts.Legend();
                chart.legend.markers.template.width = 13;
                chart.legend.markers.template.height = 15;
                chart.legend.fontSize = 14;
                chart.legend.position = "top";
                chart.legend.valign = "top";
                chart.legend.marginTop = -15;
                chart.legend.marginBottom = -10;
                // chart.legend.labels.template.width = 60;
                chart.legend.labels.template.truncate = true;
                chart.legend.valueLabels.template.fontSize = 12;
                if (this.userInfo.roles == "public") {
                    chart.cursor.behavior = "none";
                } else {
                    chart.cursor.events.on("zoomended", function(ev) {
                        let range = ev.target.xRange;
                        //alert(range.start+ "|" +range.end);
                        vm.baseData.sumyl = updateDrpSumDate(
                            range.start,
                            range.end,
                            chart
                        );
                        //vm.baseData.lastsw = updateNewSwDate(range.start, range.end, chart);
                        vm.baseData.highsw = updateMaxSwDate(
                            range.start,
                            range.end,
                            chart
                        );
                    });
                }

                chart._zoomOutButton.events.on("hit", function(e, d) {
                    let drpz = 0,
                        maxSw = 0,
                        lastSw = 0;
                    for (let i = 0; i < chart.data.length; i++) {
                        drpz += Number(chart.data[i].data);
                        maxSw =
                            maxSw < Number(chart.data[i].RZ)
                                ? Number(chart.data[i].RZ)
                                : maxSw;
                        if (chart.data[i].RZ) {
                            lastSw = chart.data[i].RZ.toFixed(2);
                        }
                    }
                    vm.baseData.sumyl = drpz.toFixed(1);
                    //vm.baseData.lastsw = lastSw
                    vm.baseData.highsw = maxSw.toFixed(2);
                });
                this.chart = chart;
            },

            updateSeries() {
                let vm = this;
                this.checkZl();
                let chart = this.chart;
                this.data.forEach(item => {
                    item.tm = new Date(item.tm);
                });
                chart.data = this.data;
                if (this.data.length) {
                    let obj = getllMinMax(
                        this.data,
                        this.baseData.zcsw,
                        this.baseData.xxsw,
                        this.baseData.jjsw,
                        this.baseData.bzsw,
                        this.details.zl
                    );
                    this.baseData.maxsw = obj.max;
                    this.baseData.minsw = obj.min;
                    this.baseData.maxyl = obj.maxValue;
                }
                this.search.moreVal =
                    this.details.jjsw || this.details.xxsw || 0;
                chart.yAxes.value = [];
                if (
                    this.details.item.match("P") &&
                    this.details.item.match("Z")
                ) {
                    this.drawYl(chart, true, false);
                    this.drawSw(chart, false);
                    this.drawLl(chart, false, this.baseData.flow);
                    this.drawLjyl(chart, true);
                } else if (this.details.item.match("P")) {
                    this.drawYl(chart, false, true);
                    this.drawLjyl(chart, false);
                    this.baseData.lastsw = null;
                } else {
                    this.drawSw(chart, true);
                    this.drawLl(chart, true);
                }

                this.dialog.jz.maxsw = this.baseData.highsw;
                this.dialog.jz.maxll = this.baseData.maxll;
                chart.legend.itemContainers.template.events.on("hit", function(
                    ev
                ) {
                    // series2.events.on("hidden", function () {
                    //     series2.show();
                    //     series2.events.off("hidden");
                    // });
                });
            },

            drawSw(chart, only) {
                //chart 是否单独画
                let maxsw = 0,
                    minsw;
                this.data.forEach(function(item) {
                    if (maxsw < Number(item.RZ)) {
                        maxsw = item.RZ;
                    }
                    if (typeof item.RZ == "number" && !minsw) {
                        minsw = item.RZ;
                    } else if (typeof item.RZ == "number") {
                        minsw > item.RZ ? (minsw = item.RZ) : "";
                    }
                });
                if (this.baseData.zzsw) {
                    minsw > this.baseData.zzsw
                        ? (minsw = this.baseData.zzsw)
                        : "";
                }
                if (this.baseData.bzsw) {
                    minsw > this.baseData.bzsw
                        ? (minsw = this.baseData.bzsw)
                        : "";
                }
                if (this.baseData.xxsw) {
                    minsw > this.baseData.xxsw
                        ? (minsw = this.baseData.xxsw)
                        : "";
                }
                if (this.baseData.jjsw) {
                    minsw > this.baseData.jjsw
                        ? (minsw = this.baseData.jjsw)
                        : "";
                }
                maxsw = Math.max(
                    this.baseData.zcsw || 0,
                    this.baseData.bzsw || 0,
                    this.baseData.xxsw || 0,
                    this.baseData.jjsw || 0,
                    maxsw
                );
                let rzAxis = chart.yAxes.push(new am4charts.ValueAxis());
                rzAxis.marginLeft = -10;
                rzAxis.title.text = "水位(m)";
                rzAxis.title.height = 20;
                rzAxis.tooltip.disabled = true;
                rzAxis.renderer.ticks.template.disabled = false;
                rzAxis.renderer.ticks.template.strokeOpacity = 1;
                rzAxis.renderer.line.strokeOpacity = 1;
                rzAxis.renderer.labels.template.verticalCenter = "bottom";
                rzAxis.renderer.labels.template.padding(2, 2, 2, 2);
                rzAxis.renderer.fontSize = "0.8em";
                rzAxis.startOnAxis = true;
                if (maxsw != minsw && maxsw - minsw > 0.5) {
                    rzAxis.max = Number(
                        ((Math.ceil(maxsw * 10) + 1) / 10).toFixed(2)
                    );
                    rzAxis.min = Number(
                        ((Math.floor(minsw * 10) - 1) / 10).toFixed(2)
                    );
                } else {
                    rzAxis.max = Number(
                        ((Math.ceil(maxsw * 10) + 2) / 10).toFixed(2)
                    );
                    rzAxis.min = Number(
                        ((Math.floor(minsw * 10) - 2) / 10).toFixed(2)
                    );
                }
                rzAxis.renderer.minGridDistance = 60;
                // rzAxis.strictMinMax = true
                //rzAxis.renderer.minGridDistance = 300 / 5;
                if (!only) {
                    rzAxis.marginTop = 20;
                    rzAxis.height = am4core.percent(70);
                    rzAxis.renderer.minGridDistance = 175 / 5;
                    rzAxis.renderer.inside = true;
                }
                rzAxis.zIndex = 3;
                //rzAxis.renderer.grid.template.disabled = true;
                // Create series
                let rzSeries = chart.series.push(new am4charts.LineSeries());
                rzSeries.dataFields.valueY = "RZ";
                rzSeries.name = "水位";
                rzSeries.stroke = am4core.color("#3e7be4");
                rzSeries.fill = am4core.color("#3e7be4");
                rzSeries.dataFields.dateX = "tm";
                rzSeries.yAxis = rzAxis;
                rzSeries.tooltipText = "水位:{valueY}m";
                let bullet = rzSeries.bullets.push(
                    new am4charts.CircleBullet()
                );
                bullet.circle.strokeWidth = 2;
                bullet.circle.radius = 2;
                //bullet.circle.fill = am4core.color("#fff");
                let bullethover = bullet.states.create("hover");
                bullethover.properties.scale = 1.3;
                //汛限水位
                let xxsw = this.baseData.xxsw;
                if (xxsw > 0) {
                    let xxswSeries = chart.series.push(
                        new am4charts.LineSeries()
                    );
                    xxswSeries.dataFields.valueY = "value";
                    xxswSeries.dataFields.dateX = "date";
                    xxswSeries.name = "汛限水位";
                    xxswSeries.strokeWidth = 2;
                    xxswSeries.stroke = am4core.color("#f2ca46");
                    xxswSeries.fill = am4core.color("#f2ca46");
                    xxswSeries.yAxis = rzAxis;
                    xxswSeries.tooltipText = "汛限水位:{valueY}m";
                    for (let i = 0; i < chart.data.length; i++) {
                        xxswSeries.data.push({
                            date: chart.data[i].tm,
                            value: xxsw
                        });
                    }
                }
                //正常水位
                let zzsw = this.baseData.zcsw;
                if (zzsw > 0) {
                    let zzswSeries = chart.series.push(
                        new am4charts.LineSeries()
                    );
                    zzswSeries.dataFields.valueY = "value";
                    zzswSeries.dataFields.dateX = "date";
                    zzswSeries.name = "正常水位";
                    zzswSeries.strokeWidth = 2;
                    zzswSeries.stroke = am4core.color("#FF4343");
                    zzswSeries.fill = am4core.color("#FF4343");
                    zzswSeries.yAxis = rzAxis;
                    zzswSeries.tooltipText = "正常水位:{valueY}m";
                    for (let i = 0; i < chart.data.length; i++) {
                        zzswSeries.data.push({
                            date: chart.data[i].tm,
                            value: zzsw
                        });
                    }
                }
                //保证水位
                let bzsw = this.baseData.bzsw;
                if (bzsw > 0) {
                    let bzline = new am4charts.LineSeries();
                    let bzswSeries = chart.series.push(bzline);
                    bzswSeries.dataFields.valueY = "value";
                    bzswSeries.name = "保证水位";
                    bzswSeries.dataFields.dateX = "date";
                    bzswSeries.strokeWidth = 2;
                    bzswSeries.stroke = am4core.color("#FF4343");
                    bzswSeries.fill = am4core.color("#FF4343");
                    bzswSeries.yAxis = rzAxis;
                    bzswSeries.tooltipText = "保证水位:{valueY}m";
                    for (let i = 0; i < chart.data.length; i++) {
                        bzswSeries.data.push({
                            date: chart.data[i].tm,
                            value: bzsw
                        });
                    }
                }
                //警戒水位
                let jjsw = this.baseData.jjsw;
                if (jjsw > 0) {
                    let jjLine = new am4charts.LineSeries();
                    let jjswSeries = chart.series.push(jjLine);
                    jjswSeries.dataFields.valueY = "value";
                    jjswSeries.dataFields.dateX = "date";
                    jjswSeries.name = "警戒水位";
                    jjswSeries.strokeWidth = 2;
                    jjswSeries.stroke = am4core.color("#f2ca46");
                    jjswSeries.fill = am4core.color("#f2ca46");
                    jjswSeries.yAxis = rzAxis;
                    jjswSeries.tooltipText = "警戒水位:{valueY}m";
                    for (let i = 0; i < chart.data.length; i++) {
                        jjswSeries.data.push({
                            date: chart.data[i].tm,
                            value: jjsw
                        });
                    }
                }
            },

            drawYl(chart, flag, only) {
                //chart 方向 是否单独画
                this.data.forEach(item => {
                    item.data = item.data ? item.data : null;
                });
                let dataAxis = chart.yAxes.push(new am4charts.ValueAxis());
                dataAxis.title.text = "雨量(mm)";
                dataAxis.renderer.grid.template.disabled = true;
                // dataAxis.renderer.minGridDistance = 20;
                dataAxis.renderer.opposite = flag;
                if (flag && !only) {
                    dataAxis.renderer.opposite = false;
                }
                dataAxis.marginLeft = -10;
                dataAxis.title.height = 20;
                dataAxis.renderer.inversed = flag;
                dataAxis.renderer.ticks.template.disabled = false;
                dataAxis.renderer.ticks.template.strokeOpacity = 1;
                dataAxis.renderer.line.strokeOpacity = 1;
                dataAxis.renderer.grid.template.disabled = false;
                dataAxis.tooltip.disabled = true;
                dataAxis.renderer.labels.template.verticalCenter = "bottom";
                dataAxis.renderer.labels.template.padding(2, 2, 2, 2);
                //dataAxis.renderer.labels.template.width = 20;
                dataAxis.renderer.fontSize = "0.8em";
                dataAxis.renderer.inside = false;
                if (!only) {
                    dataAxis.height = am4core.percent(30);
                    dataAxis.renderer.minGridDistance = 77 / 3;
                    dataAxis.renderer.inside = true;
                }
                dataAxis.fill = am4core.color("#e9e9e9");
                dataAxis.zIndex = 1;
                dataAxis.min = 0.00001;
                dataAxis.max = this.baseData.maxyl;
                let dataSeries = chart.series.push(
                    new am4charts.ColumnSeries()
                );
                dataSeries.name = "雨量";
                dataSeries.dataFields.valueY = "data";
                dataSeries.stroke = am4core.color("#33b2ff");
                dataSeries.fill = am4core.color("#33b2ff");
                dataSeries.dataFields.dateX = "tm";
                dataSeries.yAxis = dataAxis;
                dataSeries.tooltipText = "雨量:{valueY}mm";
                let ljyl = 0;
                for (let i = 0; i < chart.data.length; i++) {
                    ljyl += Number(chart.data[i].data);
                    //markSeries.data.push({date: chart.data[i].tm, value: markline});
                }
                this.baseData.sumyl = ljyl.toFixed(1);
            },

            drawLl(chart, only, show) {
                let hasll = false,
                    hasRg = false;
                chart.data.forEach((item, i) => {
                    item.ll ? (hasll = true) : "";
                    if (item.rgll && item.rgll != undefined) {
                        hasRg = true;
                        item.rgll.toFixed(1);
                    }
                });
                let llAxis = chart.yAxes.push(new am4charts.ValueAxis());
                llAxis.title.height = 20;
                if (hasll || hasRg) {
                    llAxis.title.text = "流量(m³/s)";
                } else {
                    llAxis.title.text = "";
                }

                llAxis.tooltip.disabled = true;
                llAxis.renderer.opposite = true;
                llAxis.renderer.ticks.template.disabled = false;
                llAxis.renderer.ticks.template.strokeOpacity = 1;
                llAxis.renderer.line.strokeOpacity = 1;
                llAxis.renderer.inside = true;
                llAxis.renderer.labels.template.verticalCenter = "bottom";
                llAxis.renderer.labels.template.padding(2, 2, 2, 2);
                llAxis.renderer.fontSize = "0.8em";
                if (!only) {
                    llAxis.marginTop = 20;
                    llAxis.height = am4core.percent(70);
                }
                llAxis.zIndex = 3;
                if (
                    hasll &&
                    this.userInfo.roles != "middle" &&
                    this.userInfo.roles != "public"
                ) {
                    let llSeries = chart.series.push(
                        new am4charts.LineSeries()
                    );
                    llSeries.name = "流量";
                    llSeries.events._enabled = false;
                    llSeries.dataFields.valueY = "ll";
                    llSeries.stroke = am4core.color("#63f289");
                    llSeries.fill = am4core.color("#63f289");
                    llSeries.strokeWidth = 2;
                    llSeries.dataFields.dateX = "tm";
                    llSeries.yAxis = llAxis;
                    llSeries.tooltipText = "流量:{valueY}m³/s";
                }
                if (hasRg) {
                    let llSeries1 = chart.series.push(
                        new am4charts.LineSeries()
                    );
                    if (this.details.zl == "RR") {
                        llSeries1.name = "人工出库流量";
                        llSeries1.tooltipText = "人工出库流量:{valueY}m³/s";
                    } else {
                        llSeries1.name = "人工实测流量";
                        llSeries1.tooltipText = "人工实测流量:{valueY}m³/s";
                    }

                    llSeries1.dataFields.valueY = "rgll";
                    llSeries1.stroke = am4core.color("#800080");
                    llSeries1.fill = am4core.color("#800080");
                    llSeries1.strokeWidth = 0;
                    llSeries1.dataFields.dateX = "tm";
                    llSeries1.yAxis = llAxis;
                    let bullet = llSeries1.bullets.push(new am4charts.Bullet());
                    let image = bullet.createChild(am4core.Image);
                    image.href = "/icon.png";
                    image.width = 15;
                    image.height = 20;
                    image.horizontalCenter = "middle";
                    image.verticalCenter = "middle";
                    let bullethover = bullet.states.create("hover");
                    bullethover.properties.scale = 1.3;
                }
                //lSeries.tensionX = 0.8;
                //llSeries.tensionY = 1;
            },

            drawLjyl(chart, show) {
                //是否显示名称//累计雨量
                let dataSumAxis = chart.yAxes.push(new am4charts.ValueAxis());
                if (!show) {
                    dataSumAxis.renderer.inversed = false;
                    dataSumAxis.renderer.inside = false;
                } else {
                    dataSumAxis.renderer.inversed = true;
                    dataSumAxis.renderer.inside = true;
                    dataSumAxis.renderer.minGridDistance = 20;
                }
                dataSumAxis.title.height = 20;
                dataSumAxis.title.text = "累计雨量(mm)";
                dataSumAxis.renderer.grid.template.disabled = true;
                dataSumAxis.renderer.opposite = true;
                // dataSumSeries.isActive = false
                dataSumAxis.renderer.ticks.template.disabled = false;
                dataSumAxis.renderer.ticks.template.strokeOpacity = 1;
                dataSumAxis.renderer.line.strokeOpacity = 1;
                dataSumAxis.tooltip.disabled = true;
                dataSumAxis.renderer.labels.template.verticalCenter = "bottom";
                dataSumAxis.renderer.labels.template.padding(2, 2, 2, 2);
                dataSumAxis.renderer.fontSize = "0.8em";
                dataSumAxis.height = am4core.percent(30);
                dataSumAxis.zIndex = 1;
                dataSumAxis.min = 0;
                dataSumAxis.strictMinMax = true;
                let dataSumSeries = chart.series.push(
                    new am4charts.LineSeries()
                );
                dataSumSeries.events._enabled = false;
                dataSumSeries.dataFields.valueY = "value";
                dataSumSeries.name = "累计雨量";
                dataSumSeries.stroke = am4core.color("#e67575");
                dataSumSeries.fill = am4core.color("#e67575");
                dataSumSeries.strokeWidth = 1;
                dataSumSeries.dataFields.dateX = "date";
                dataSumSeries.yAxis = dataSumAxis;
                //dataSumSeries.tensionX = 0.8;
                dataSumSeries.tooltipText = "累计雨量:{valueY}mm";
                let dataz = 0;
                for (let i = 0; i < chart.data.length; i++) {
                    dataz += Number(chart.data[i].data);
                    dataSumSeries.data.push({
                        date: chart.data[i].tm,
                        value: dataz
                    });
                    if (i == chart.data.length - 1) {
                        if (Number(dataz) < 10) {
                            dataSumAxis.max = 10;
                        } else {
                            dataSumAxis.max = Math.ceil(dataz / 10) * 10 + 5;
                        }
                    }
                }
            },
            // 实时过程导出
            handleExportRealtime() {
                const params = {
                    zm: this.markInfo.info.zm,
                    zh: this.markInfo.info.zh,
                    st: moment()
                        .subtract(this.search.beforeList.default, "day")
                        .format("YYYY-MM-DDTHH:mm:ss"),
                    et: moment().format("YYYY-MM-DDTHH:mm:ss"),
                    jg: this.sxItem.timeType.default,
                    lx: 0,
                    data: "时间,雨量,水位,库容,涨势,出库流量,入库流量"
                };
                const url = this.$utils.formatURL(
                    "/rest/water/leadOutHistoryData",
                    params
                );
                window.open(url);
            }
        },
        watch: {
            "sxItem.beforeList.default": function(n) {
                if (n == "zdy" && this.sxItem.beforeList.default == 2) {
                    this.search.current.start =
                        Date.now() - 1 * 24 * 3600 * 1000;
                } else {
                    this.search.current.start =
                        Date.now() - 1 * 24 * 3600 * 1000;
                }
            },
            indexPoint: async function(n) {
                let vm = this;
                if (n) {
                    vm.checkStatisticData();
                    if (this.chart) {
                        this.chart.dispose();
                    }
                    this.$nextTick(async () => {
                        this.setData();
                        await this.init();
                        this.updateSeries();
                        this.dialog.data = this.allData;
                        this.dialog.info = this.markInfo.info;
                        this.dialog.zl = this.baseData.zl;
                    });
                }
            },
            "tabBar.default": function(n) {
                this.rightCon.open = false;
                this.rightCon.show = false;
            },
            $route: {
                deep: true,
                handler: function() {
                    this.closeModel();
                }
            }
        },

        created() {
            this.start = new Date().getTime();
            if (this.markInfo.info.OBHTZTM) {
                this.markInfo.info.OBHTZTM = new Date(
                    this.markInfo.info.OBHTZTM
                );
            }
            //this.getNjz();
            this.checkStatisticData();
            if (this.$route.meta.name === "realtime-water") {
                this.showExportButton = true;
            } else {
                this.showExportButton = false;
            }
        },
        mounted() {
            let vm = this;
            this.$nextTick(async () => {
                this.setData();
                await this.init();
                this.updateSeries();
                this.dialog.data = this.allData;
                this.dialog.info = this.markInfo.info;
                this.dialog.zl = this.baseData.zl;
            });
        },

        beforeDestroy() {
            if (this.chart) {
                this.chart.dispose();
            }
        }
    };
</script>

<style scoped lang="scss">
    .markerCon {
        position: relative;

        .el-table .cell,
        .el-table--border td:first-child .cell,
        .el-table--border th:first-child .cell {
            padding: 0 !important;
        }

        .el-input__inner {
            height: 32px !important;
        }

        .el-radio {
            line-height: 32px !important;
        }

        .title {
            line-height: 40px;
            font-size: 14px;
            font-weight: bold;
            padding-left: 36px;
            color: #fff;
            background-image: linear-gradient(270deg, #1f64ff 0%, #325fd9 100%);
            border-radius: 4px 4px 0px 0px;

            .ls {
                float: left;
                width: 6px;
                height: 20px;
                background: #fff;
                margin-top: 10px;
                margin-left: -20px;
            }

            span {
                float: right;
                margin-right: 16px;
                cursor: pointer;

                i {
                    font-size: 12px;
                }
            }
        }

        .content {
            width: 100%;
            height: calc(100% - 40px);
            position: relative;

            .closeSw {
                position: absolute;
                top: 200px;
                left: 96px;
                z-index: 7;
                transition: all, 0.5s;

                img {
                    width: 15px;
                }
            }

            .left {
                width: 96px;
                height: 100%;
                border-right: solid 1px #e9e9e9;
                float: left;
            }

            .middle {
                width: calc(100% - 96px);
                height: 100%;
                float: left;
                position: relative;

                .tabBar {
                    padding-left: 10px;
                    height: 40px;
                    line-height: 40px;
                    border-bottom: solid 1px #e9e9e9;
                    font-size: 14px;

                    .chartTable {
                        float: left;
                        width: calc(100% - 353px);
                    }

                    .listTb {
                        width: 340px;
                        float: right;
                        line-height: 0;

                        .name-label {
                            width: 90px;
                            border: 1px solid #e9e9e9;
                            border-top: 0;
                            display: inline-block;
                            height: 28px;
                            line-height: 26px;
                            vertical-align: middle;
                            padding: 0 5px;
                            background-color: #f4f6f8;
                        }

                        .name-label-R {
                            width: 110px;
                        }

                        .name-label-P {
                            width: 120px;
                        }

                        .val-label {
                            padding: 0 5px;
                            display: inline-block;
                            width: 80px;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            white-space: nowrap;
                            border-bottom: 1px solid #e9e9e9;
                            height: 28px;
                            line-height: 26px;
                            vertical-align: middle;
                        }

                        .val-label-R {
                            width: 60px;
                        }

                        .val-label-P {
                            width: 50px;
                        }
                    }

                    .el-tabs__item.is-active {
                        color: #33b1ff !important;
                    }

                    .el-tabs__item {
                        font-weight: bold;
                        color: #333;
                    }
                }

                .item.tooltips {
                    padding: 8px 10px;
                }

                .el-button {
                    padding: 4px;
                }

                .lb-item {
                    display: inline-block;
                    margin-right: 4px;
                }

                .sxItem {
                    padding: 0;
                    font-size: 14px;

                    .el-radio {
                        margin-right: 10px;
                    }

                    .label {
                        padding: 0 5px 0 12px;
                    }
                }

                .intro {
                    color: #0169e1;
                    font-size: 14px;
                }
            }

            .middleAll {
                width: 100%;
            }

            .right {
                font-size: 14px;
                position: absolute;
                right: 0;
                top: 41px;
                width: 340px;
                height: calc(100% - 41px);
                border-left: solid 1px #e9e9e9;
                border-top: 2px solid #33b2ff;
                background-color: #fff;
                z-index: 5;
                transition: all 0.5s;
            }
        }
    }

    .tbData {
        width: 100%;
        height: 365px;
        border: solid 1px #ccc;
    }

    .rightTb {
        width: 240px;
        float: left;
        height: 380px;
        font-size: 14px;
        padding-top: 16px;

        div {
            vertical-align: middle;
            line-height: 0;

            span {
                display: inline-block;
                border: 1px solid #e9e9e9;
                border-collapse: collapse;
                padding-left: 5px;
                line-height: 30px;
                width: 100px;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }

            span:first-child {
                width: 130px;
                background-color: #f4f6f8;
            }
        }
    }

    .details {
        .sel-btn {
            padding: 10px 6px;
            float: right;
            cursor: pointer;
        }
    }

    .colorRed {
        color: red;
        font-size: 14px;
    }

    .colorGreen {
        color: green;
        font-size: 14px;
    }
</style>
