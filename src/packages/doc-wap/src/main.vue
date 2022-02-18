<template>
  <div class="vmp-doc-wap" ref="docWrapper">
    <h3>文档</h3>
  </div>
</template>
<script>
  import screenfull from 'screenfull';

  export default {
    name: 'VmpDocWap',

    data() {
      return {
        className: '',
        displayMode: 'normal', // normal: 正常; small: 小屏 fullscreen:全屏
        keepAspectRatio: true,
        hasPager: true, // 是否有分页操作(观看端没有)
        thumbnailShow: false // 文档缩略是否显示
      };
    }
  };
</script>
<style lang="less">
  .vmp-doc-wap {
  }
</style>
