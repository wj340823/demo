<template>
    <div class="vueol-markerLayer">
        <slot/>
    </div>
</template>
<script>
    import {Vector as VectorLayer} from 'ol/layer';
    import {Vector as VectorSource} from 'ol/source';
    import * as loadingstrategy from 'ol/loadingstrategy.js';

    export default {
        name: 'ol-markers',
        provide: function () {
            return {
                getLayer: this.getLayer
            }
        },
        inject: ['getMap'],
        props: {
            zIndex: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                layer: null
            }
        },
        beforeDestroy() {
            const vm = this;
            vm.getMap().then((mapObject) => {
                let source = vm.layer.getSource();
                source.getFeatures().forEach(function (f) {
                    let s = f.getStyle();
                    s = null;
                    f.setStyle(null);
                    f = null;
                })
                source.clear();
                mapObject.removeLayer(vm.layer);
            })
        },
        created() {
            const vm = this;
            vm.getMap().then((mapObject) => {
                vm.createLayer(mapObject);
            })
            vm.promise = new Promise(function (resolve, reject) {
                vm.resolve = resolve;
            })
        },
        methods: {
            createLayer(mapObject) {
                this.layer = new VectorLayer({
                    source: new VectorSource({
                        strategy: loadingstrategy.bbox
                    }),
                    zIndex: this.zIndex
                });
                this.layer.set("markers", true);
                mapObject.addLayer(this.layer);
                this.resolve(this.layer);
            },
            getLayer() {
                let vm = this;

                return vm.promise;
            }
        }
    }
</script>