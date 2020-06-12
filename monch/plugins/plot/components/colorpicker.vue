<template>
    <ColorPicker v-model="newValue" :alpha="alpha" :recommend="recommend" @on-change="$emit('change', newValue)" />
</template>
<script>
    import { ColorPicker } from "iview";
    export default {
        name: "suc-colorpicker",
        components: {
            ColorPicker
        },
        model: {
            prop: 'value',
            event: 'change'
        },
        props: {
            value: {
                type: String
            },
            alpha: {
                type: Boolean,
                default: false
            },
            recommend: {
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