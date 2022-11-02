<template>
  <el-dialog :visible.sync="dialogVisible" class="exam-preview-pc" width="1088px">
    <exam-info :id="currentRow.id" v-if="currentRow"></exam-info>
  </el-dialog>
</template>
<script>
  import ExamInfo from './components/exam-info.vue';
  export default {
    name: 'VmpExamPreview',
    components: {
      ExamInfo
    },
    data() {
      return {
        currentRow: null,
        dialogVisible: false
      };
    },
    methods: {
      openPreview(str) {
        if (!str) return;
        this.dialogVisible = true; // 展示弹出框
        this.currentRow = JSON.parse(str) || null;
      }
    }
  };
</script>
<style lang="less"></style>
