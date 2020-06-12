<script>
    import {getControlClasses, isFunction, transformStyle} from "../../util/helpers";
    import {layerMethods} from "../../util/layer";

    export default {
        name: "ol-control",
        render(h) {
            return h('div', {
                class: 'ol-control',
                style: {
                    display: 'none !important'
                }
            });
        },
        inject: ['getMap'],
        props: {
            name: {
                type: String,
                validator(value) {
                    let keys = Object.keys(getControlClasses());
                    return keys.indexOf(value) !== -1;
                }
            },
            config: Object
        },
        watch: {
            name() {
                this.getMap().then((map) => {
                    this.update(map);
                })
            },
            config: {
                handler() {
                    this.getMap().then((map) => {
                        this.update(map);
                    })
                },
                deep: true
            }
        },
        mounted() {
            this.init();
        },
        methods: {
            initData() {
                this.map = null;
                this.olControl = null;
            },
            createControl(map) {
                const controlClasses = getControlClasses();
                const {config} = this;
                let configResult = {...config};

                if (this.name === "overviewmap") {
                    const layers = [];
                    if (config.layers) {
                        config.layers.forEach(function (layer) {
                            const olLayer = layerMethods.createLayer(layer, map.getView().getProjection());
                            if (layer.style && olLayer.setStyle && isFunction(olLayer.setStyle)) {
                                olLayer.setStyle(transformStyle(layer.style));
                            }
                            layers.push(olLayer);
                        });
                        configResult.layers = layers;
                    }
                } else if (this.name === 'zoom') {
                    configResult.zoomInTipLabel = config.zoomInTipLabel || '放大';
                    configResult.zoomOutTipLabel = config.zoomOutTipLabel || '缩小';
                }

                const olControl = new controlClasses[this.name](configResult);
                return olControl;
            },
            init() {
                this.initData();
                this.getMap().then((map) => {
                    this.map = map;
                    this.olControl = this.createControl(map);
                    map.addControl(this.olControl);
                });
            },
            update(map) {
                if (this.olControl) {
                    map.removeControl(this.olControl);
                }
                this.olControl = this.createControl(map);
                map.addControl(this.olControl);
            }
        },
        beforeDestroy() {
            if (this.olControl) {
                this.map.removeControl(this.olControl);
            }
        }
    }
</script>