<!-- 文件上传及转换的进度状态 -->
<template>
  <div class="doc-progress-status">
    <template v-if="docStatus === 'uploading'">
      <el-progress :percentage="uploadPropress"></el-progress>
    </template>
    <template v-if="Array.isArray(docStatusStr)">
      <div
        v-for="(item, index) in docStatusStr"
        v-bind:key="'status' + index"
        class="transform-status"
        :class="docStatus"
      >
        {{ item }}
      </div>
    </template>
    <div v-else class="transform-status" :class="docStatus">{{ docStatusStr }}</div>
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
      },
      docExt: {
        type: String,
        default: ''
      },
      // 是否在资料库列表中使用
      isInDoclib: {
        type: Boolean,
        default: false
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
          if (this.isInDoclib && /pptx?/.test(this.docExt)) {
            return ['静态转码成功', '动态转码成功'];
          }
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
      &::before {
        content: '';
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 6px;
      }
      &.transcompleted:before {
        background-color: #14ba6a;
      }
      &.transfailed:before {
        background-color: red;
      }

      &.uploadfailed,
      &.transfailed {
        color: red;
      }
    }
  }
</style>
