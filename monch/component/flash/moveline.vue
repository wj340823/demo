<template>
    <div class="vueol-moveline" style="display: none;"></div>
</template>
<script>
    import {transform} from 'ol/proj';
    import {MoveLine} from "../../plugins/moveline/MoveLine";

    export default {
        name: 'ol-moveline',
        inject: ['getMap'],
        props: {
            dataSource: {
                type: Array,
                required: true,
                validator: function (value) {
                    let result = value.filter(item => {
                        if (item.from && !item.from.lnglat) {
                            return true;
                        }
                        if (item.to && !item.to.lnglat) {
                            return true;
                        }
                        return !item.from || !item.to;
                    });
                    return !result.length;
                }
            },
            pushData: String | Number,     //多批次传入数据
            options: Object,             //对飞线图进行配置
            speed: {
                type: Number,
                default: 1
            },
            projection: {
                type: String,
                default: 'EPSG:4326'
            }
        },
        data() {
            return {}
        },
        watch: {
            pushData(nval) {
                if (!nval) {
                    return false;
                }
                this.moveline.pushBatch(this.handleDataSource());
            }
        },
        methods: {
            async init() {
                this.initData();
                this.map = await this.getMap();
                this.viewProjection = this.map.getView().getProjection().getCode();
                //this.fitView();   //可视范围

                //this.dataTarget = this.handleDataSource();
                this.moveline = new MoveLine(this.map, Object.assign({}, this.options, {
                    data: this.handleDataSource()
                }));
            },
            initData() {
                this.map = null;
                this.viewProjection = null;
                //this.dataTarget = null;
                this.moveline = null;    //飞线画布
            },
            getExtent(from, to, extent) {
                let minx = extent[0], miny = extent[1], maxx = extent[2], maxy = extent[3];
                if (from[0] < minx) {
                    minx = from[0];
                }
                if (to[0] < minx) {
                    minx = to[0];
                }
                if (from[1] < miny) {
                    miny = from[1];
                }
                if (to[1] < miny) {
                    miny = to[1];
                }
                if (from[0] > maxx) {
                    maxx = from[0];
                }
                if (to[0] > maxx) {
                    maxx = to[0];
                }
                if (from[1] > maxy) {
                    maxy = from[1];
                }
                if (to[1] > maxy) {
                    maxy = to[1];
                }
                return [minx, miny, maxx, maxy];
            },
            handleDataSource() {
                const vm = this;
                let result = vm.dataSource.map((item) => {
                    let fromCoord, toCoord;
                    if (vm.projection === 'pixel') {
                        fromCoord = item.from.lnglat;
                        toCoord = item.to.lnglat;
                    } else {
                        fromCoord = transform(item.from.lnglat, vm.projection, vm.viewProjection);
                        toCoord = transform(item.to.lnglat, vm.projection, vm.viewProjection);
                    }
                    return {
                        speed: item.speed || vm.speed,
                        from: {
                            city: item.from.city,
                            location: fromCoord
                        },
                        to: {
                            city: item.to.city,
                            location: toCoord
                        }
                    }
                })
                return result;
            },
            fitView() {
                const vm = this;
                let minx = 0, miny = 0, maxx = 0, maxy = 0;
                vm.dataSource.forEach((item) => {
                    let from, to;
                    if (vm.projection === 'pixel') {
                        from = item.from.lnglat;
                        to = item.to.lnglat;
                    } else {
                        from = transform(item.from.lnglat, vm.projection, vm.viewProjection);
                        to = transform(item.to.lnglat, vm.projection, vm.viewProjection);
                    }
                    let extent = vm.getExtent(from, to, [minx, miny, maxx, maxy]);
                    minx = extent[0];
                    miny = extent[1];
                    maxx = extent[2];
                    maxy = extent[3];
                })
                vm.map.getView().fit([minx, miny, maxx, maxy]);
            }
        },
        mounted() {
            this.init();
        }
    }
</script>