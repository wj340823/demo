<template>
  <el-table :data="pdflist" border stripe :height="tableHeight">
    <el-table-column type="index" label="序" width="40"></el-table-column>
    <el-table-column prop="name" label="文件名" show-overflow-tooltip></el-table-column>
    <el-table-column prop="time" label="上传时间" show-overflow-tooltip></el-table-column>
    <el-table-column prop="size" label="大小" width="60"></el-table-column>
    <el-table-column label="下载" width="40">
      <template slot-scope="scope">
        <a
          target="_blank"
          :href="
                        '/rest/pictureHouse/downloadFtpFile?path=' +
                            scope.row.path +
                            '&name=' +
                            scope.row.name
                    "
        >
          <i class="el-icon-download"></i>
        </a>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "vue-property-decorator";

@Component
export default class pdfList extends Vue {
  @Prop() tableHeight: any;
  pdflist: any[] = [];

  getPdfList() {
    this.pdflist = [];
    this.$http.get("/rest/pictureHouse/getPdfList").then(res => {
      console.log(res.data);
      res.data.forEach((item: any) => {
        this.pdflist.push({
          time: item.lastedUpdateTime,
          name: item.name,
          path: item.localPath,
          size: (item.size / 1024 / 1024).toFixed(2) + "Mb"
        });
      });
    });
  }

  created() {
    this.getPdfList();
  }
}
</script>

<style scoped></style>
