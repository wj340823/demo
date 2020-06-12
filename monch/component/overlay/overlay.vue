<template>
    <div class="vueol-overlay">
        <slot :id="id" :position="position" :offset="offset" :positioning="positioning"/>
    </div>
</template>
<script>
    import Overlay from 'ol/Overlay'
    import {uuid} from '../../util/uuid'
    import {isEqual, removeOverlay, coordinateTransform} from "../../util/helpers";

    export default {
        name: 'ol-overlay',
        inject: ['getMap'],
        props: {
            id: {
                type: [String, Number],
                default: () => uuid(),
            },
            category: String,
            offset: {
                type: Array,
                default: () => [0, 0],
                validator: value => value.length === 2,
            },
            /**
             * Coordinates in the map view projection.
             * @type {number[]}
             */
            position: {
                type: Array,
                validator: value => value.length === 2,
                required: true,
            },
            projection: {
                type: String,
                default: 'EPSG:4326'
            },
            positioning: {
                type: String,
                default: 'top-left'
            },
            stopEvent: {
                type: Boolean,
                default: true,
            },
            insertFirst: {
                type: Boolean,
                default: true,
            },
            autoPan: {
                type: Boolean,
                default: false
            },
            autoPanMargin: {
                type: Number,
                default: 20,
            },
            autoPanAnimation: Object,
            single: {   //是否是单独存在的overlay
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                $overlay: null
            }
        },
        watch: {
            offset(value) {
                if (this.$overlay && !isEqual(value, this.$overlay.getOffset())) {
                    this.$overlay.setOffset(value);
                }
            },
            position: {
                handler(value) {
                    const vm = this;
                    vm.getMap().then(function (map) {
                        let position = value;
                        if (vm.projection != "pixel") {
                            position = coordinateTransform(value, vm.projection, map.getView().getProjection().getCode());
                        }
                        if (vm.$overlay && !isEqual(position, vm.$overlay.getPosition())) {
                            vm.$overlay.setPosition(position);
                        }
                    })
                },
                deep: true
            },
            positioning(value) {
                if (this.$overlay && value !== this.$overlay.getPositioning()) {
                    this.$overlay.setPositioning(value)
                }
            }
        },
        methods: {
            init() {
                const vm = this;
                vm.getMap().then(function (map) {
                    removeOverlay(map, null, "single");   //清除不与其他弹框共存的overlay

                    vm.$overlay = vm.createObj();

                    vm.$overlay.set("single", vm.single);
                    vm.$overlay.set(vm.category, true);
                    map.addOverlay(vm.$overlay);

                    let position = vm.position;
                    if (position[0] && position[1]) {
                        if (vm.projection != "pixel") {
                            position = coordinateTransform(vm.position, vm.projection, map.getView().getProjection().getCode());
                        }
                        vm.$overlay.setPosition(position);
                    }
                })
            },
            createObj() {
                return new Overlay({
                    id: this.id,
                    element: this.$el,
                    offset: this.offset,
                    positioning: this.positioning,
                    stopEvent: this.stopEvent,
                    insertFirst: this.insertFirst,
                    autoPan: this.autoPan,
                    autoPanMargin: this.autoPanMargin,
                    autoPanAnimation: this.autoPanAnimation
                })
            }
        },
        mounted() {
            this.$nextTick(()=>{
                this.init();
            })
        },
        beforeDestroy() {
            const vm = this;
            vm.getMap().then((map) => {
                vm.$overlay.setElement(undefined);
                map.removeOverlay(vm.$overlay);
            })
        }
    }
</script>