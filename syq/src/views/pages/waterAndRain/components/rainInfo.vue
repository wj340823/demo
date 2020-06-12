<template>
  <div>
    <el-table
      :data="countData"
      stripe
      border
      :cell-style="columnStyle"
      @cell-click="getSelectPoint"
      @header-click="getSelectLevel"
    >
      <el-table-column prop="level" width="60">
        <template slot="header" slot-scope="scope">
          <i class="el-icon-full-screen" @click="getMore"></i>&nbsp;&nbsp;
          <i class="el-icon-refresh-left" @click="refreshRainData"></i>
        </template>
      </el-table-column>
      <el-table-column prop="first" label="1h" width="50"></el-table-column>
      <el-table-column prop="second" label="3h" width="60"></el-table-column>
      <el-table-column prop="third" label="6h" width="60"></el-table-column>
      <el-table-column prop="fourth" label="12h" width="70"></el-table-column>
      <el-table-column prop="fifth" label="24h"></el-table-column>
    </el-table>
    <p class="defaultBtn">前{{ selectedHour }}降雨{{ selectedLevel }}站点</p>
    <div style="height: 380px">
      <p class="defaultBtn">前{{ selectImgHour }}降雨等值面</p>
      <div v-if=" rainFallNote" style="text-align: center;line-height: 340px">正在获取图片...</div>
      <img
        v-if="rainFallUrl != '' && rainFallNote =='' && !rainFallNote"
        :src="rainFallUrl"
        alt
        width="380"
        @click="fullScreenImg"
      />
      <div
        v-if="rainFallUrl == '' && !rainFallNote"
        style="text-align: center;line-height: 340px"
      >暂无图片</div>
      <!-- <img src="@/assets/legend/jylegend.png" alt /> -->
      <div class="dzmtl">
        <p>等值面图列 (mm)</p>
        <ul>
          <li>
            <div></div>
            <p>0</p>
          </li>
          <li>
            <div></div>
            <p>10</p>
          </li>
          <li>
            <div></div>
            <p>25</p>
          </li>
          <li>
            <div></div>
            <p>50</p>
          </li>
          <li>
            <div></div>
            <p>100</p>
          </li>
          <li>
            <div></div>
            <p>250</p>
          </li>
        </ul>
      </div>
    </div>
    <!--<div class="more" @click="getMore">
    放大        </div>-->
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from "vue-property-decorator";
import { namespace, Mutation } from "vuex-class";
import moment from "moment";
/*250-300，300-400,400-500,500-600，>600*/
const level = [
  { label: "<10", value: 0 },
  { label: "10~25", value: 10 },
  { label: "25~50", value: 25 },
  { label: "50~100", value: 50 },
  { label: "100~250", value: 100 },
  { label: "250~300", value: 250 },
  { label: "300~400", value: 300 },
  { label: "400~500", value: 400 },
  { label: "500~600", value: 500 },
  { label: ">=600", value: 600 }
].reverse();
const rains = [
  { label: "1h", value: 2 },
  { label: "3h", value: 3 },
  { label: "6h", value: 4 },
  { label: "12h", value: 5 },
  { label: "24h", value: 6 }
];
const tableStore: any = namespace("waterAndRain");
@Component
export default class rainInfo extends Vue {
  @Prop() rainPoint: any;
  @Prop() tabIndex: any;
  @tableStore.Mutation("setTbTitle") setTbTitle!: Function;
  @tableStore.Mutation("setTbList") setTbList!: Function;
  @tableStore.Mutation("setTh") setTh!: Function;
  @tableStore.Mutation("controlAllTableState")
  controlAllTableState!: Function;
  @tableStore.Mutation("setRainImg") setRainImg!: Function;
  @tableStore.Mutation("controlRainImgState")
  controlRainImgState!: Function;
  @tableStore.Mutation("setImgTitle")
  setImgTitle!: Function;
  countData: any = [];
  currentDay: string = moment().format("DD");
  currentHour: string = moment().format("HH");
  selectedHour: any = "24小时";
  selectImgHour: any = "24小时";
  selectedLevel: any = "";
  rainFallUrl: any = "";
  mapSetList: any = [];
  rainFallNote: boolean = true;

  refreshRainData() {
    this.$emit("refreshRainData");
  }

  setDefaultPoint() {
    this.$emit("setDefaultPoint");
  }

  columnStyle(row: any) {
    const words = ["first", "second", "third", "fourth", "fifth"];
    if (row.columnIndex && row.row[words[row.columnIndex - 1]] != "-") {
      return { color: "blue" };
    }
  }

  getSelectPoint(row: any, column: any, cell: any) {
    const words = ["first", "second", "third", "fourth", "fifth"];
    console.log(row);
    if (cell.cellIndex && row[words[cell.cellIndex - 1]] != "-") {
      this.selectedHour = column.label.slice(0, -1) + "小时";
      this.selectedLevel = row.level;
      let val1 = 0;
      let val = level.filter((item: any) => {
        return item.label == row.level;
      })[0].value;
      level.forEach((item: any, num: number) => {
        if (item.label == row.level && num != 0) {
          val1 = level[num - 1].value;
        }
      });
      let arr = this.rainPoint[cell.cellIndex - 1].filter((item: any) => {
        if (val1) {
          return item.yl >= val && item.yl < val1;
        } else {
          return item.yl >= val;
        }
      });
      this.$emit("setRainPoint", arr);
    }
  }

  getSelectLevel(col: any) {
    if (col.label != undefined) {
      this.selectImgHour = col.label.slice(0, -1) + "小时";
      this.selectedHour = col.label.slice(0, -1) + "小时";
      this.selectedLevel = "";
      this.getRainPicture(col.label.slice(0, -1));
      let index = 0;
      rains.forEach((item: any, i: number) => {
        if (item.label == col.label) {
          index = i;
        }
      });
      let arr = [...this.rainPoint[index]];
      this.$emit("setRainPoint", arr);
    }
    //this.rainPoint;
  }
  @Watch("tabIndex")
  changeTbIndex(n: any) {
    if (n == 1) {
      this.selectedHour = "24小时";
      this.selectedLevel = "";
    }
  }

  @Watch("rainPoint", { deep: true })
  rainPointState(n: any[]) {
    let len = level.length;
    const words = ["first", "second", "third", "fourth", "fifth"];
    this.countData.forEach((item: any, i: number) => {
      for (let j = 0; j < words.length; j++) {
        this.countData[len - i - 1][words[j]] =
          n[j].filter((point: any) => {
            if (level[len - i - 2]) {
              return (
                point.yl >= level[len - i - 1].value &&
                point.yl < level[len - i - 2].value
              );
            } else {
              return point.yl >= level[len - i - 1].value;
            }
          }).length || "-";
      }
    });
  }

  getMore() {
    const th = [
      { label: "等级", prop: "level", fixed: "left", children: [] },
      { label: "1h", prop: "first", children: [] },
      { label: "3h", prop: "second", children: [] },
      { label: "6h", prop: "third", children: [] },
      { label: "12h", prop: "fourth", children: [] },
      { label: "24h", prop: "fifth", children: [] }
    ];
    let tb = this.countData;
    this.setTbList(tb);
    this.setTh(th);
    this.controlAllTableState(true);
    this.setTbTitle("雨量信息");
  }

  fullScreenImg() {
    this.controlRainImgState(true);
    this.setImgTitle(`前${this.selectImgHour}降雨等值面`);
    this.setRainImg(this.rainFallUrl);
  }

  getRainPicture(num: any) {
    this.rainFallNote = true;

    this.$http
      .post("/rest/pictureHouse/getListOfPicture", {
        DATA: {
          Action: "GetMap",
          tm1: moment()
            .subtract(num, "hour")
            .format("YYYY-MM-DD HH:00:00"),
          tm2: moment().format("YYYY-MM-DD HH:00:00"),
          /*tm1: "2020-4-15 8:00:00",
                        tm2: "2020-5-22 19:00:00",*/
          mapContent: 1 //1面 2 线 4 面+线 8 .。。。
        }
      })
      .then(res => {
        if (res.data.Map && res.data.Map.content) {
          this.rainFallUrl = "data:image/png;base64," + res.data.Map.content;
        } else {
          this.rainFallUrl = "";
        }
        this.rainFallNote = false;
      });
  }

  created(): void {
    this.getRainPicture(24);
    this.$http
      .post("/rest/pictureHouse/getListOfPicture", {
        DATA: {
          Action: "ListMapSet"
        }
      })
      .then(res => {
        this.mapSetList = res.data.Mapset;
      });
    for (let i = 0; i < level.length; i++) {
      this.countData.push({
        level: level[i].label,
        first: "-",
        second: "-",
        third: "-",
        fourth: "-",
        fifth: "-"
      });
    }
  }
}
</script>

<style scoped lang="scss">
.defaultBtn {
  text-align: center;
  margin-top: 5px;
  cursor: pointer;

  &:first-child {
    background: rgb(238, 238, 238);
  }

  &:hover {
    text-decoration: underline;
  }
}
.dzmtl {
  margin: auto;
  p:first-child {
    padding-left: 31px;
    text-align: left;
    color: #000;
  }
  ul {
    text-align: center;
    li {
      display: inline-block;
      margin-right: 1px;
      div {
        width: 55px;
        height: 22px;
      }
      p {
        text-align: left;
        font-size: 12px;
        color: #000;
      }
    }
    li:nth-child(1) {
      div {
        background-color: #4fe176;
      }
    }
    li:nth-child(2) {
      div {
        background-color: #3e7be4;
      }
    }
    li:nth-child(3) {
      div {
        background-color: #f2ca46;
      }
    }
    li:nth-child(4) {
      div {
        background-color: #e275df;
      }
    }
    li:nth-child(5) {
      div {
        background-color: #ff6868;
      }
    }
    li:nth-child(6) {
      div {
        background-color: #474848;
      }
    }
  }
}
</style>
