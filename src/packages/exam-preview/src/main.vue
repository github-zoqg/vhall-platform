<template>
  <el-dialog :visible.sync="dialogVisible" class="exam-preview-pc" width="450px">a</el-dialog>
</template>
<script>
  export default {
    name: 'VmpExamPreview',
    data() {
      return {
        currentRow: {},
        dialogVisible: false
      };
    },
    methods: {
      openPreview(str) {
        if (!str) return;
        this.dialogVisible = true; // 展示弹出框
        this.currentRow = JSON.parse(str) || {};
      }
    }
  };
</script>
<style lang="less"></style>
