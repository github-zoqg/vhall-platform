<!-- 文件上传及转换的进度状态 -->
<template>
  <div class="doc-progress-status">
    <template v-if="docStatus === 'uploading'">
      <el-progress :percentage="uploadPropress"></el-progress>
    </template>
    <div v-else class="transform-status" :class="docStatus">
      {{ docStatusStr }}
    </div>
  </div>
</template>
<script>
  export default {
    name: 'DocProgressStatus',
    props: {
      // 文档转换状态
      // uploading: '上传中'
      // uploadfailed: '上传失败'
      // transwait: 等待转码 （上传成功后会转到此状态）
      // transdoing: 转码中
      // transcompleted: 转码成功
      // transfailed: 转码失败
      docStatus: {
        type: String,
        default: ''
      },
      // 上传进度
      uploadPropress: {
        type: Number,
        default: 0
      },
      // 文档转换进度
      transformProcess: {
        type: Number,
        default: 0
      }
    },
    computed: {
      docStatusStr() {
        if (this.docStatus === 'uploading') {
          return '上传中';
        } else if (this.docStatus === 'uploadfailed') {
          return '上传失败';
        } else if (this.docStatus === 'transwait') {
          return '等待转码';
        } else if (this.docStatus === 'transdoing') {
          return '转码中';
        } else if (this.docStatus === 'transcompleted') {
          return '转码成功';
        } else if (this.docStatus === 'transfailed') {
          return '转码失败';
        } else return '';
      }
    }
  };
</script>
<style lang="less">
  .doc-progress-status {
    .transform-status {
      &::after {
        content: '';
        position: absolute;
        left: -6px;
        top: 50%;
        width: 8px;
        height: 8px;
        transform: translateY(-50%);
        border-radius: 100%;
      }
      &.transcompleted:after {
        background-color: #14ba6a;
      }
      &.transfailed:after {
        background-color: red;
      }

      &.uploadfailed,
      &.transfailed {
        color: red;
      }
    }
  }
</style>
