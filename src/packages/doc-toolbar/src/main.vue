<template>
  <div class="vmp-doc-toolbar">
    <div class="vmp-doc-toolbar__hd">
      <div class="choose-document">选择文档</div>
      <div class="audience-visible">
        <span>观众可见</span>
        <el-switch v-model="value1" active-color="#13ce66" inactive-color="#ff4949"></el-switch>
      </div>
    </div>
    <div class="vmp-doc-toolbar__bd"></div>
    <div class="vmp-doc-toolbar__ft">
      <div class="tool-btn document-fullscreen"><i class="iconfont iconquanping"></i></div>
      <div class="tool-btn document-thumbnail"><i class="iconfont iconsuolvetu"></i></div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpDocToolbar',
    data() {
      return {
        value1: true
      };
    },
    mounted() {
      console.log(this);
    }
  };
</script>
<style lang="less">
  .vmp-doc-toolbar {
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

  .vmp-doc-toolbar__hd {
    max-width: 250px;
    display: flex;
    flex-direction: row;
    .choose-document {
      height: 27px;
      width: 76px;
      border-radius: 15px;
      border: 1px solid #dadada;
      font-size: 12px;
      color: #dadada;
      line-height: 27px;
      text-align: center;
      margin-left: 16px;
      cursor: pointer;
    }
    .audience-visible {
      font-size: 12px;
      color: #dadada;
      line-height: 17px;
      display: -webkit-box;
      display: -ms-flexbox;
      display: flex;
      -webkit-box-align: center;
      -ms-flex-align: center;
      align-items: center;
      margin-left: 20px;
      position: relative;
    }
  }
  .vmp-doc-toolbar__bd {
    flex: 1;
  }
  .vmp-doc-toolbar__ft {
    display: flex;
    flex-direction: row;
    margin-right: 0px;

    .tool-btn {
      height: 36px;
      width: 36px;
      margin-left: 3px;
      border-radius: 4px;
      text-align: center;
      vertical-align: middle;
      position: relative;
      line-height: 36px;
      cursor: pointer;
    }
    .document-fullscreen {
      z-index: 100;
    }
    .document-thumbnail {
      z-index: 18;
    }
  }
</style>
