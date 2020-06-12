<template>
    <div class="app_main" :class="userInfo.roles == 'middle' ? 'auto-height' : ''">
        <router-view></router-view>
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from "vue-property-decorator";
    import { State } from "vuex-class";
    @Component
    export default class appMain extends Vue {
        @State("userInfo") userInfo: any;
        created(): void {}
    }
</script>
<style>
    .auto-height {
        height: 100%;
    }
</style>
