<template>
  <div class="doc-une">
    <div class="doc-une__toolbar">
      <div class="doc-une__toolbar-hd">
        <el-button size="mini">选择文档</el-button>
        <el-switch>观众课件</el-switch>
      </div>
      <div class="doc-une__toolbar-bd">各种画笔工具</div>
      <div class="doc-une__toolbar-ft">全屏等按扭</div>
    </div>
    <div class="doc-une__content">
      <div class="doc-une-placeholder">
        <i class="iconfont iconzanwuwendang"></i>
        <span>暂未分享任何文档</span>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpDocUne'
  };
</script>
<style lang="less">
  .doc-une {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    color: #fff;
    .doc-une__toolbar {
      height: 50px;
      width: 100%;
      background: #2d2d2d;
      border-bottom: 1px solid #1f1f1f;
      position: absolute;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      z-index: 2;
    }
    .doc-une__content {
      flex: 1;
    }
    .doc-une-placeholder {
      height: 100%;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #2d2d2d;
      flex-direction: column;

      i {
        font-size: 137px;
        color: #7c7c7c;
      }
    }
  }
</style>
