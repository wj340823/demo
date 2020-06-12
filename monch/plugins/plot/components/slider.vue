<template>
    <Slider v-model="newValue" :min="min" :max="max" :step="step" :show-input="showInput" :show-stops="showStops"
            @on-input="$emit('change', newValue)"></Slider>
</template>
<script>
    import { Slider } from "iview";

    export default {
        name: "suc-slider",
        components: {
            Slider
        },
        model: {
            prop: 'value',
            event: 'change'
        },
        props: {
            value: {
                type: Number,
                default: 0
            },
            min: {
                type: Number,
                default: 0
            },
            max: {
                type: Number,
                default: 100
            },
            step: {
                type: Number,
                default: 1
            },
            showInput: {
                type: Boolean,
                default: false
            },
            showStops: {
                type: Boolean,
                default: false
            }
        },
        watch: {
            value(nval){
                this.newValue = nval;
            }
        },
        data(){
            return {
                newValue: this.value
            }
        }
    }
</script>