<template>
    <div class="menuList">
        <div
            v-for="(item, index) in menuList"
            :key="index"
            @click="changeRight(item)"
        >
            <img :src="{true:item.img,false:item.imgDisabled}[item.abled]" alt="">
            <span>{{item.name}}</span>
        </div>
    </div>
</template>

<script lang="ts">
    import { Vue, Component, Prop, Watch } from "vue-property-decorator";

    @Component
    export default class LeftMenu extends Vue {
        @Prop() props:any
        menuList: any = [
            {
                name: "视频点位",
                icon: "iconlujing7",
                class: "spdw",
                img:require('@/assets/spdw.png'),
                imgDisabled:require('@/assets/spdwDisabled.png'),
                abled:true
            },
            {
                name: "全景图",
                icon: "iconlujing6",
                class: "qjt",
                img:require('@/assets/qjt.png'),
                imgDisabled:require('@/assets/qjtDisabled.png'),
                abled:true
            },
            {
                name: "断面",
                icon: "iconlujing9",
                class: "dm",
                img:require('@/assets/dm.png'),
                imgDisabled:require('@/assets/dmDisabled.png'),
                abled:true
            },
            {
                name: "站点简介",
                icon: "iconlujing11",
                class: "qjt",
                img:require('@/assets/zdjj.png'),
                imgDisabled:require('@/assets/zdjjDisabled.png'),
                abled:true
            },
            {
                name: "水位流量关系",
                icon: "iconlujing10",
                class: "spdw",
                img:require('@/assets/swllgx.png'),
                imgDisabled:require('@/assets/relationDisabled.png'),
                abled:true
            }
        ];
        relation:any = {
            label:'水位流量关系',
            disabled:false
        }
        checkDisabled(){
            let params:any = {
                zh:this.props.zh,
                zl:this.props.zl
            }
            this.$http.get("/rest/basic/inquireSiteOtherInfo",{params:params}).then((res:any)=>{
                this.menuList.forEach((item:any)=>{
                    if(item.name=='水位流量关系'||item.name=='水位库容关系'){
                       if(res.data['水位流量关系']==1) {
                           item.abled = true
                       }else {
                           item.abled = false
                       }
                    }else {
                        if(res.data[item.name]==1){
                            item.abled = true
                        }else {
                            item.abled = false
                        }
                    }

                })
            })
        }
        @Watch('props',{deep:true,immediate:true})
        watchProps(n:any){
            if(n.zl){
                this.checkDisabled()
                if(n&&n.item&&n.zl){
                    this.relation.disabled = false;
                    this.relation.label = '水位流量关系'
                    this.menuList[2].img = require('@/assets/dm.png')
                    this.menuList[4].img = require('@/assets/swllgx.png')
                    if(n.item.match('Z')!==null){
                        if(n.zl=='RR'){
                            this.relation.label = '水位库容关系'
                        }
                    }else {
                        this.relation.disabled = true
                        this.menuList[2].img = require('@/assets/dmDisabled.png')
                        this.menuList[4].img = require('@/assets/relationDisabled.png')
                    }
                    this.menuList[4].name = this.relation.label
                }
            }
        }
        changeRight(item: any) {
            if(item.abled){
                if(this.props.zl!='PP'&&this.props.zl!='MM'){
                    this.$emit("rightType", item.name);
                }else {
                    if(item.name!='水位流量关系'&&item.name!='断面'){
                        this.$emit("rightType", item.name);
                    }
                }
            }
        }

    }
</script>

<style scoped lang="scss">
    .menuList {
        width: 80px;
        padding: 7px 4px;
        font-size: 12px;
        > div {
            text-align: center;
            width: 100%;
            padding: 0;
            letter-spacing: 0;
            color: #666;
            border-radius: 2px;
            cursor: pointer;
            line-height: 0;
            span {
                display: block;
                line-height: 24px;
                font-size: 14px;
                font-weight: normal;
            }
        }
    }
</style>
