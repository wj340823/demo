<template>
    <div style="width: 100%;height: 100%">
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
        var dataarray = [];
        for (var i = start; i < end; i++) {
            drpz += Number(chart.data[i].p);
            dataarray.push({date: chart.data[i].tm, value: drpz});
        }
        return drpz.toFixed(2);
    }
    function updateMaxSwDate(from, to, chart) {
        var start = Math.floor(from * chart.data.length);
        var end = Math.floor(to * chart.data.length) + 1;
        var drpz = 0;
        for (var i = start; i < end; i++) {
            drpz < Number(chart.data[i].z)?(drpz=Number(chart.data[i].z)):'';
        }
        return drpz.toFixed(2);
    }
    function updateNewSwDate(from, to, chart) {
        var end = Math.floor(to * chart.data.length);
        return chart.data[end].z
    }
    export default {
        props: {
            data: {
                type: Array,
                default: []
            },
            type: "",//报汛项目
            line:{
                type: Number,
                default: 1
            },
            legend:{
                type: Array,
                default: []
            },
            dateType:{
                type:String,
                default:'day'
            },
            width: {
                type: Number,
                default: 600
            },
            height: {
                type: Number,
                default: 375
            }
        },
        name: "WaterAndFlow",
        data() {
            return {
                chart: null,
                maxYl: null,
                baseData:{
                    lastsw:'',
                    highSw:'',
                    sumyl:''
                }
            };
        },
        methods: {
            setData() {
                let vm = this;
                this.data.forEach((item, i) => {
                    item.tm = new Date(item.tm);
                });
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
                // dateAxis.dateFormats.setKey("hour", "dd日kk时");
                // dateAxis.periodChangeDateFormats.setKey("hour", "dd日kk时");
                chart.cursor = new am4charts.XYCursor();
                chart.cursor.fullWidthLineX = true;
                chart.cursor.xAxis = dateAxis;
                chart.cursor.lineY.disabled = true;
                chart.cursor.lineX.strokeOpacity = 0;
                if(this.dateType=='day'){
                    dateAxis.dateFormats.setKey("day", "MM月dd日");
                    dateAxis.periodChangeDateFormats.setKey("day", "MM月dd日");
                }else if(this.dateType=='month'){
                    dateAxis.dateFormats.setKey("month", "yyyy年MM月");
                    dateAxis.periodChangeDateFormats.setKey("month", "yyyy年MM月");
                }else if(this.dateType=='year'){
                    dateAxis.dateFormats.setKey("year", "yyyy年");
                    dateAxis.periodChangeDateFormats.setKey("year", "yyyy年");
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
                chart.cursor.events.on("zoomended", function (ev) {
                    var range = ev.target.xRange;
                    //alert(range.start+ "|" +range.end);
                    vm.baseData.sumyl = updateDrpSumDate(range.start, range.end, chart);
                    vm.baseData.highsw = updateMaxSwDate(range.start, range.end, chart);
                    vm.$emit('getSpecialData',[vm.baseData.sumyl,vm.baseData.highsw])
                });
                chart._zoomOutButton.events.on('hit',function (e,d) {
                    let drpz = 0,maxSw=0,lastSw=0
                    for (var i = 0; i < chart.data.length; i++) {
                        drpz += Number(chart.data[i].p);
                        maxSw = maxSw<Number(chart.data[i].z)?Number(chart.data[i].z):maxSw
                        if(chart.data[i].z){
                            lastSw = chart.data[i].z?Number(chart.data[i].z).toFixed(2):chart.data[i].z
                        }
                    }
                    vm.baseData.sumyl = drpz?Number(drpz).toFixed(1):drpz
                    vm.baseData.highsw = maxSw?(maxSw).toFixed(2):maxSw
                    vm.$emit('getSpecialData',[vm.baseData.sumyl,vm.baseData.highsw])
                })
                this.chart = chart;
            },
            updateSeries() {
                const chart = this.chart;
                if (this.type == "q") {
                    this.drawLl(chart, true);
                } else if (this.type == "z") {
                    this.drawSw(chart, true);
                }
            },
            drawSw(chart, only) {
                const colors = ['#3E7BE4','#33C5E9','#FF9F7F','#E062AE','#8378EA','#0CAA45']
                //chart 是否单独画
                let maxsw = 0,
                    minsw;

                /*this.data.forEach(function(item) {
                    if (maxsw < Number(item.z)) {
                        maxsw = item.z;
                    }
                    if (typeof item.z == "number" && !minsw) {
                        minsw = item.z;
                    } else if (typeof item.z == "number") {
                        minsw > item.z ? (minsw = item.z) : "";
                    }
                });*/

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

               /* if (maxsw != minsw && maxsw - minsw > 0.05) {
                    rzAxis.max = Number(
                        ((Math.ceil(maxsw * 20) * 5 + 5) / 100).toFixed(2)
                    );
                    rzAxis.min = Number(
                        ((Math.floor(minsw * 20) * 5 - 5) / 100).toFixed(2)
                    );
                } else {
                    rzAxis.max = Number(
                        ((Math.ceil(maxsw * 20) * 5 + 15) / 100).toFixed(2)
                    );
                    rzAxis.min = Number(
                        ((Math.floor(minsw * 20) * 5 - 10) / 100).toFixed(2)
                    );
                }*/

                rzAxis.renderer.minGridDistance = 60;
                if (!only) {
                    rzAxis.marginTop = 20;
                    rzAxis.height = am4core.percent(70);
                    rzAxis.renderer.minGridDistance = 175 / 5;
                    rzAxis.renderer.inside = true;
                }
                rzAxis.zIndex = 3;
                //rzAxis.renderer.grid.template.disabled = true;
                // Create series
                for (let i=0;i<this.line;i++){
                    var rzSeries = chart.series.push(new am4charts.LineSeries());
                    rzSeries.dataFields.valueY = "z"+i;
                    rzSeries.name = this.legend[i]||'水位';
                    rzSeries.stroke = am4core.color(colors[i]);
                    rzSeries.fill = am4core.color(colors[i]);
                    rzSeries.dataFields.dateX = "tm";
                    rzSeries.yAxis = rzAxis;
                    rzSeries.tooltipText = (this.legend[i]?this.legend[i]:'水位')+":{valueY}米";
                    var bullet = rzSeries.bullets.push(
                        new am4charts.CircleBullet()
                    );
                    bullet.circle.strokeWidth = 2;
                    bullet.circle.radius = 2;
                    //bullet.circle.fill = am4core.color("#fff");
                    var bullethover = bullet.states.create("hover");
                    bullethover.properties.scale = 1.3;
                }

            },
            drawLl(chart, only, show) {
                const colors = ['#63f289','#96B7FF','#6ECE8E','#ED8E75','#5E53FF','#E889FF']
                var llAxis = chart.yAxes.push(new am4charts.ValueAxis());
                llAxis.title.height = 20;
                llAxis.title.text = "流量(立方米/秒)";
                llAxis.tooltip.disabled = true;
                llAxis.renderer.grid.template.disabled = false;
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
                for (let i=0;i<this.line;i++){
                    var llSeries = chart.series.push(new am4charts.LineSeries());
                    llSeries.name = "流量";
                    llSeries.dataFields.valueY = "q"+i;
                    llSeries.stroke = am4core.color(colors[i]);
                    llSeries.fill = am4core.color(colors[i]);
                    llSeries.strokeWidth = 2;
                    llSeries.dataFields.dateX = "tm";
                    llSeries.yAxis = llAxis;
                    llSeries.tooltipText = "流量:{valueY}立方米/秒";
                }
                //lSeries.tensionX = 0.8;
                //llSeries.tensionY = 1;
            },
        },

        watch: {
            data: function(n) {
                if (n.length) {
                    if (this.chart) {
                        this.chart.dispose();
                    }
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
