<!-- 新增分组 -->
<template>
  <div class="vmp-group-add">
    <el-dialog
      :visible.sync="dialogVisible"
      @open="handlOpen"
      :before-close="handleClose"
      width="400px"
      title="新增分组"
    ></el-dialog>
  </div>
</template>
<script>
  export default {
    name: 'VmpGroupAdd',
    data() {
      return {
        dialogVisible: false
      };
    },
    methods: {
      handlOpen() {},
      handleClose() {
        this.dialogVisible = false;
      }
    }
  };
</script>
