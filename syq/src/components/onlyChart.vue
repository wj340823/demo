<template>
    <div style="width: 100%">
        <div
            id="chartdiv1"
            :style="{ width: width + 'px', height: height + 'px' }"
        ></div>
        <div class="clearFix"></div>
    </div>
</template>

<script>
    // am4core.useTheme(am4themes_animated);
    function updateDrpSumDate(from, to, chart) {
        var start = Math.floor(from * chart.data.length);
        var end = Math.floor(to * chart.data.length) + 1;
        var drpz = 0;
        let arr = JSON.parse(JSON.stringify(chart.data));
        for (var i = start; i < end; i++) {
            drpz += Number(arr[i].p);
        }
        return drpz.toFixed(1);
    }

    function updateMaxYlData(from, to, chart) {
        var start = Math.floor(from * chart.data.length);
        var end = Math.floor(to * chart.data.length) + 1;
        var drpz = 0;
        for (var i = start; i < end; i++) {
            drpz < Number(chart.data[i].p)
                ? (drpz = Number(chart.data[i].p))
                : "";
        }
        return drpz.toFixed(1);
    }

    function updateMaxSl(from, to, chart) {
        var start = Math.floor(from * chart.data.length);
        var end = Math.floor(to * chart.data.length) + 1;
        var sl = 0;
        for (var i = start; i < end; i++) {
            sl += Number(chart.data[i].q) ? Number(chart.data[i].q) * 3600 : 0;
        }
        return sl.toFixed(1);
    }

    function updateMaxSwDate(from, to, chart) {
        var start = Math.floor(from * chart.data.length);
        var end = Math.floor(to * chart.data.length) + 1;
        var drpz = 0;
        for (var i = start; i < end; i++) {
            drpz < Number(chart.data[i].z)
                ? (drpz = Number(chart.data[i].z))
                : "";
        }
        return drpz.toFixed(2);
    }

    function updateNewSwDate(from, to, chart) {
        var end = Math.floor(to * chart.data.length);
        return chart.data[end].z.toFixed(2);
    }

    export default {
        props: {
            data: {
                //雨水情数组
                type: Array,
                default: []
            },
            type: {
                //报讯项目
                type: String,
                default: "PZ"
            },
            width: {
                //过程线宽
                type: Number,
                default: 500
            },
            height: {
                //过程线高
                type: Number,
                default: 320
            },
            dateType: {
                //时间类型
                type: String,
                default: "day"
            },
            xxsw: null,
            zcsw: null,
            jjsw: null,
            bzsw: null
        },
        name: "onlyChart",
        data() {
            return {
                chart: null,
                maxYl: null,
                baseData: {
                    lastsw: "",
                    highSw: "",
                    sumyl: ""
                }
            };
        },
        methods: {
            setData() {
                let vm = this;
                let maxYl = null;
                this.data.forEach((item, i) => {
                    item.tm = new Date(item.tm);
                });
                this.maxYl = maxYl;
                let chart = am4core.create("chartdiv1", am4charts.XYChart);
                chart.dataProvider = this.data;
                chart.colors.step = 2;
                //chart.maskBullets = false;
                chart.maskBullets = false;
                chart.leftAxesContainer.layout = "vertical";
                chart.rightAxesContainer.layout = "vertical";
                // Add data
                chart.data = this.data;
                chart.dataProvider = this.data;
                // Create axes X轴
                let xAxis = new am4charts.DateAxis();
                let dateAxis = chart.xAxes.push(xAxis);
                dateAxis.renderer.grid.template.location = 0.5;
                dateAxis.renderer.ticks.template.location = 0.5;
                dateAxis.renderer.labels.template.location = 0.5;
                dateAxis.renderer.minGridDistance = 70;
                //dateAxis.renderer.grid.template.disabled = true;
                dateAxis.renderer.fullWidthTooltip = false;
                dateAxis.renderer.ticks.template.disabled = false;
                dateAxis.renderer.ticks.template.strokeOpacity = 1;
                dateAxis.renderer.line.strokeOpacity = 1;
                dateAxis.marginBottom = -20;
                chart.dateFormatter.inputDateFormat = "yyyy-MM-dd HH:mm";
                dateAxis.dateFormats.setKey("hour", "dd日HH时");
                dateAxis.periodChangeDateFormats.setKey("hour", "dd日HH时");
                dateAxis.dateFormats.setKey("day", "MM月dd日");
                dateAxis.periodChangeDateFormats.setKey("day", "MM月dd日");
                dateAxis.dateFormats.setKey("month", "yyyy年MM月");
                dateAxis.periodChangeDateFormats.setKey("month", "yyyy年MM月");
                chart.cursor = new am4charts.XYCursor();
                chart.cursor.fullWidthLineX = true;
                chart.cursor.xAxis = dateAxis;
                chart.cursor.lineY.disabled = true;
                chart.cursor.lineX.strokeOpacity = 0;
                chart.cursor.lineX.fill = am4core.color("#000");
                chart.cursor.lineX.fillOpacity = 0;
                let xAxis1 = new am4charts.DateAxis();
                let dateAxis1 = chart.xAxes.push(xAxis1);
                dateAxis1.marginTop = -20;
                dateAxis1.renderer.grid.template.location = 0.5;
                dateAxis1.renderer.ticks.template.location = 0.5;
                dateAxis1.renderer.labels.template.location = 0.5;
                dateAxis1.renderer.minGridDistance = 50;
                dateAxis1.renderer.opposite = true;
                dateAxis1.renderer.fullWidthTooltip = false;
                dateAxis1.renderer.ticks.template.disabled = false;
                dateAxis1.renderer.ticks.template.strokeOpacity = 1;
                dateAxis1.renderer.line.strokeOpacity = 1;
                //remove logo
                let eles = document.querySelectorAll(
                    "[aria-labelledby$=-title]"
                );
                for (let i = 0; i < eles.length; i++) {
                    eles[i].style.visibility = "hidden";
                }
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
                chart.cursor.events.on("zoomended", function(ev) {
                    var range = ev.target.xRange;
                    let maxYl = 0;
                    let maxWater = 0; //最大水量
                    //alert(range.start+ "|" +range.end);
                    vm.sumyl = updateDrpSumDate(range.start, range.end, chart);
                    vm.highsw = updateMaxSwDate(range.start, range.end, chart);
                    maxYl = updateMaxYlData(range.start, range.end, chart);
                    maxWater = updateMaxSl(range.start, range.end, chart);
                    vm.$emit("getSpecialData", [
                        vm.sumyl,
                        vm.highsw,
                        maxYl,
                        maxWater
                    ]);
                });
                chart._zoomOutButton.events.on("hit", function(e, d) {
                    let drpz = 0,
                        maxSw = 0,
                        lastSw = 0,
                        maxYl = 0,
                        maxWater = 0; //累计水量
                    for (var i = 0; i < chart.data.length; i++) {
                        drpz += Number(chart.data[i].p);
                        maxWater += Number(chart.data[i].q) * 3600;
                        maxYl =
                            maxYl < Number(chart.data[i].p)
                                ? Number(chart.data[i].p)
                                : maxYl;
                        maxSw =
                            maxSw < Number(chart.data[i].z)
                                ? Number(chart.data[i].z)
                                : maxSw;
                        if (chart.data[i].z) {
                            lastSw = chart.data[i].z;
                        }
                    }
                    vm.sumyl = drpz;
                    vm.highsw = maxSw;
                    vm.$emit("getSpecialData", [
                        vm.sumyl,
                        vm.highsw,
                        maxYl,
                        maxWater
                    ]);
                });
                this.chart = chart;
            },
            updateSeries() {
                const chart = this.chart;
                if (this.type.match("P") && this.type.match("Z")) {
                    this.drawYl(chart, true, false);
                    this.drawSw(chart, false);
                    this.drawLl(chart, false);
                    this.drawLjyl(chart, true);
                } else if (this.type.match("P")) {
                    this.drawYl(chart, false, true);
                    this.drawLjyl(chart, false);
                } else if (this.type == "QS") {
                    this.drawYl(chart, true, false);
                    this.drawQsl(chart, false);
                    this.drawLl(chart, false);
                    this.drawLjyl(chart, true);
                } else {
                    this.drawSw(chart, true);
                    this.drawLl(chart, true);
                }
            },
            drawSw(chart, only) {
                //chart 是否单独画
                let maxsw = 0,
                    minsw;
                this.data.forEach(function(item) {
                    if (maxsw < Number(item.z)) {
                        maxsw = item.z;
                    }
                    if (minsw == undefined) {
                        minsw = item.z;
                    } else if (typeof item.z == "number") {
                        minsw > item.z ? (minsw = item.z) : "";
                    }
                });
                if (this.zzsw) {
                    minsw > this.zzsw ? (minsw = this.zzsw) : "";
                }
                if (this.bzsw) {
                    minsw > this.bzsw ? (minsw = this.bzsw) : "";
                }
                if (this.xxsw) {
                    minsw > this.xxsw ? (minsw = this.xxsw) : "";
                }
                if (this.jjsw) {
                    minsw > this.jjsw ? (minsw = this.jjsw) : "";
                }
                maxsw = Math.max(
                    this.zcsw || 0,
                    this.bzsw || 0,
                    this.xxsw || 0,
                    this.jjsw || 0,
                    maxsw
                );
                var rzAxis = chart.yAxes.push(new am4charts.ValueAxis());
                rzAxis.marginLeft = -10;
                rzAxis.title.text = "水位(米)";
                rzAxis.title.height = 20;
                rzAxis.tooltip.disabled = true;
                rzAxis.renderer.ticks.template.disabled = false;
                rzAxis.renderer.ticks.template.strokeOpacity = 1;
                rzAxis.renderer.line.strokeOpacity = 1;
                rzAxis.renderer.labels.template.verticalCenter = "bottom";
                rzAxis.renderer.labels.template.padding(2, 2, 2, 2);
                rzAxis.renderer.grid.template.location = 0;
                rzAxis.renderer.fontSize = "0.8em";
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
                if (!only) {
                    rzAxis.marginTop = 20;
                    rzAxis.height = am4core.percent(70);
                    rzAxis.renderer.minGridDistance = (this.height * 0.7) / 5;
                    rzAxis.renderer.inside = true;
                }
                rzAxis.zIndex = 3;
                var rzSeries = chart.series.push(new am4charts.LineSeries());
                rzSeries.dataFields.valueY = "z";
                rzSeries.name = "水位";
                rzSeries.stroke = am4core.color("#3e7be4");
                rzSeries.fill = am4core.color("#3e7be4");
                rzSeries.dataFields.dateX = "tm";
                rzSeries.yAxis = rzAxis;
                rzSeries.tooltipText = "水位:{valueY}米";
                var bullet = rzSeries.bullets.push(
                    new am4charts.CircleBullet()
                );
                bullet.circle.strokeWidth = 2;
                bullet.circle.radius = 2;
                var bullethover = bullet.states.create("hover");
                bullethover.properties.scale = 1.3;

                //汛限水位
                let xxsw = this.xxsw;
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
                    xxswSeries.tooltipText = "汛限水位:{valueY}米";
                    for (let i = 0; i < chart.data.length; i++) {
                        xxswSeries.data.push({
                            date: chart.data[i].tm,
                            value: xxsw
                        });
                    }
                }
                //正常水位
                let zcsw = this.zcsw;
                if (zcsw > 0) {
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
                    zzswSeries.tooltipText = "正常水位:{valueY}米";
                    for (let i = 0; i < chart.data.length; i++) {
                        zzswSeries.data.push({
                            date: chart.data[i].tm,
                            value: zcsw
                        });
                    }
                }
                //保证水位
                let bzsw = this.bzsw;
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
                    bzswSeries.tooltipText = "保证水位:{valueY}米";
                    for (let i = 0; i < chart.data.length; i++) {
                        bzswSeries.data.push({
                            date: chart.data[i].tm,
                            value: bzsw
                        });
                    }
                }
                //警戒水位
                let jjsw = this.jjsw;
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
                    jjswSeries.tooltipText = "警戒水位:{valueY}米";
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
                let hasFuture = false;
                let hasReal = false;
                let maxYl = 0;
                chart.data.forEach((item, i) => {
                    item.p1 ? (hasFuture = true) : "";
                    item.p ? (hasReal = true) : "";
                    item.p = item.p ? item.p : null;
                    if (item.p) {
                        maxYl = maxYl < Number(item.p) ? Number(item.p) : maxYl;
                    }
                    if (item.p1) {
                        maxYl =
                            maxYl < Number(item.p1) ? Number(item.p1) : maxYl;
                    }
                });
                var dataAxis = chart.yAxes.push(new am4charts.ValueAxis());
                dataAxis.title.text = "雨量(毫米)";
                dataAxis.renderer.grid.template.disabled = true;
                // dataAxis.renderer.minGridDistance = 20;
                dataAxis.renderer.opposite = flag;
                if (flag && !only) {
                    dataAxis.renderer.opposite = false;
                }
                dataAxis.marginLeft = -10;
                dataAxis.title.height = 20;
                dataAxis.renderer.inversed = flag;
                dataAxis.renderer.grid.template.disabled = false;
                dataAxis.renderer.ticks.template.disabled = false;
                dataAxis.renderer.ticks.template.strokeOpacity = 1;
                dataAxis.renderer.line.strokeOpacity = 1;
                dataAxis.tooltip.disabled = true;
                dataAxis.renderer.labels.template.verticalCenter = "bottom";
                dataAxis.renderer.labels.template.padding(2, 2, 2, 2);
                //dataAxis.renderer.labels.template.width = 20;
                dataAxis.renderer.fontSize = "0.8em";
                dataAxis.renderer.inside = false;
                if (!only) {
                    dataAxis.height = am4core.percent(30);
                    dataAxis.renderer.minGridDistance = (this.height * 0.3) / 2;
                    dataAxis.renderer.inside = true;
                }
                dataAxis.fill = am4core.color("#e9e9e9");
                dataAxis.zIndex = 10;
                if (maxYl < 10) {
                    dataAxis.max = 10;
                } else {
                    dataAxis.max = Math.ceil(maxYl / 5) * 5;
                }
                dataAxis.min = 0;
                dataAxis.strictMinMax = true;

                if (hasReal) {
                    var dataSeries = chart.series.push(
                        new am4charts.ColumnSeries()
                    );
                    dataSeries.name = "实时雨量";
                    dataSeries.dataFields.valueY = "p";
                    dataSeries.stroke = am4core.color("#33b2ff");
                    dataSeries.fill = am4core.color("#33b2ff");
                    dataSeries.dataFields.dateX = "tm";
                    dataSeries.yAxis = dataAxis;
                    dataSeries.tooltipText = "实时雨量:{valueY}毫米";
                }
                if (hasFuture) {
                    var dataSeries1 = chart.series.push(
                        new am4charts.ColumnSeries()
                    );
                    dataSeries1.name = "未来雨量";
                    dataSeries1.dataFields.valueY = "p1";
                    dataSeries1.stroke = am4core.color("#ff0000");
                    dataSeries1.fill = am4core.color("#ff0000");
                    dataSeries1.dataFields.dateX = "tm";
                    dataSeries1.yAxis = dataAxis;
                    dataSeries1.tooltipText = "未来雨量:{valueY}毫米";
                }
                let ljyl = 0;
                for (let i = 0; i < chart.data.length; i++) {
                    if (chart.data[i].p) {
                        ljyl += Number(chart.data[i].p);
                    } else {
                        ljyl += Number(chart.data[i].p1);
                    }

                    //markSeries.data.push({date: chart.data[i].tm, value: markline});
                }
            },
            drawLl(chart, only) {
                let hasll = false,
                    hasRg = false;
                chart.data.forEach((item, i) => {
                    item.q ? (hasll = true) : "";
                    if (item.rg && item.rg != undefined) {
                        hasRg = true;
                        item.rg = item.rg.toFixed(1);
                    }
                });
                var llAxis = chart.yAxes.push(new am4charts.ValueAxis());
                llAxis.title.height = 20;
                if (hasll || hasRg) {
                    llAxis.title.text = "流量(立方米/秒)";
                } else {
                    llAxis.title.text = "";
                }
                llAxis.tooltip.disabled = true;
                llAxis.renderer.opposite = true;
                llAxis.renderer.grid.template.disabled = true;
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
                if (hasll) {
                    var llSeries = chart.series.push(
                        new am4charts.LineSeries()
                    );
                    llSeries.name = "流量";
                    llSeries.dataFields.valueY = "q";
                    llSeries.stroke = am4core.color("#63f289");
                    llSeries.fill = am4core.color("#63f289");
                    llSeries.strokeWidth = 2;
                    llSeries.dataFields.dateX = "tm";
                    llSeries.yAxis = llAxis;
                    llSeries.tooltipText = "流量:{valueY}立方米/秒";
                }
                if (hasRg) {
                    var llSeries1 = chart.series.push(
                        new am4charts.LineSeries()
                    );
                    llSeries1.name = "人工报汛";
                    llSeries1.dataFields.valueY = "rg";
                    llSeries1.stroke = am4core.color("#800080");
                    llSeries1.fill = am4core.color("#800080");
                    llSeries1.strokeWidth = 0;
                    llSeries1.filleWidth = 0;
                    llSeries1.dataFields.dateX = "tm";
                    llSeries1.yAxis = llAxis;
                    llSeries1.name = "人工流量";
                    llSeries1.tooltipText = "人工流量:{valueY}立方米/秒";
                    /*if(this.details.zl=='RR'){
                        llSeries1.name = "人工出库流量";
                        llSeries1.tooltipText = "人工出库流量:{valueY}立方米/秒";
                    }else {
                        llSeries1.name = "人工实测流量";
                        llSeries1.tooltipText = "人工实测流量:{valueY}立方米/秒";
                    }*/
                    var bullet = llSeries1.bullets.push(new am4charts.Bullet());
                    let image = bullet.createChild(am4core.Image);
                    image.href = "/icon.png";
                    image.width = 10;
                    image.height = 15;
                    image.horizontalCenter = "middle";
                    image.verticalCenter = "middle";
                    var bullethover = bullet.states.create("hover");
                    bullethover.properties.scale = 1.3;
                }
                //lSeries.tensionX = 0.8;
                //llSeries.tensionY = 1;
            },
            drawLjyl(chart, show) {
                //是否显示名称//累计雨量
                var dataSumAxis = chart.yAxes.push(new am4charts.ValueAxis());
                if (!show) {
                    dataSumAxis.renderer.inversed = false;
                    dataSumAxis.renderer.inside = false;
                } else {
                    dataSumAxis.renderer.inversed = true;
                    dataSumAxis.renderer.inside = true;
                    dataSumAxis.renderer.minGridDistance = 50;
                }
                dataSumAxis.title.height = 20;
                dataSumAxis.title.text = "累计雨量(毫米)";
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
                var dataSumSeries = chart.series.push(
                    new am4charts.LineSeries()
                );
                dataSumSeries.dataFields.valueY = "value";
                dataSumSeries.name = "累计雨量";
                dataSumSeries.stroke = am4core.color("#e67575");
                dataSumSeries.fill = am4core.color("#e67575");
                dataSumSeries.strokeWidth = 1;
                dataSumSeries.dataFields.dateX = "date";
                dataSumSeries.yAxis = dataSumAxis;
                //dataSumSeries.tensionX = 0.8;
                dataSumSeries.tooltipText = "累计雨量:{valueY}毫米";
                var dataz = 0;
                for (var i = 0; i < chart.data.length; i++) {
                    dataz += Number(chart.data[i].p || chart.data[i].p1 || 0);
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
            drawQsl(chart, only) {
                var qsAxis = chart.yAxes.push(new am4charts.ValueAxis());
                qsAxis.marginLeft = -10;
                qsAxis.title.text = "缺水量(毫米)";
                qsAxis.title.height = 20;
                qsAxis.tooltip.disabled = true;
                qsAxis.renderer.ticks.template.disabled = false;
                qsAxis.renderer.ticks.template.strokeOpacity = 1;
                qsAxis.renderer.line.strokeOpacity = 1;
                qsAxis.renderer.labels.template.verticalCenter = "bottom";
                qsAxis.renderer.labels.template.padding(2, 2, 2, 2);
                qsAxis.renderer.grid.template.location = 0;
                qsAxis.renderer.fontSize = "0.8em";
                qsAxis.renderer.minGridDistance = 60;
                qsAxis.zIndex = 3;
                if (!only) {
                    qsAxis.marginTop = 20;
                    qsAxis.height = am4core.percent(70);
                    qsAxis.renderer.minGridDistance = (this.height * 0.7) / 5;
                    qsAxis.renderer.inside = true;
                }
                var qsSeries = chart.series.push(new am4charts.LineSeries());
                qsSeries.dataFields.valueY = "qs";
                qsSeries.name = "缺水量";
                qsSeries.stroke = am4core.color("#C6C7C7");
                qsSeries.fill = am4core.color("#C6C7C7");
                qsSeries.dataFields.dateX = "tm";
                qsSeries.yAxis = qsAxis;
                qsSeries.sequencedInterpolation = true;
                qsSeries.fillOpacity = 0.6;
                qsSeries.stacked = true;
                qsSeries.tooltipText = "缺水量:{valueY}毫米";
            }
        },
        watch: {
            data: function(n) {
                if (this.chart) {
                    this.chart.dispose();
                }
                if (n) {
                    this.setData();
                    this.updateSeries();
                }
            }
        },
        destroyed() {
            if (this.chart) {
                this.chart.dispose();
            }
        }
    };
</script>

<style scoped></style>
