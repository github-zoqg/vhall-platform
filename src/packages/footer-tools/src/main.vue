<template>
  <div class="vmp-footer-tools">
    <div class="vmp-footer-tools-left">
      <div class="vmp-footer-tools-left-setting">
        <i class="iconfont iconmeitishezhi"></i>
        设置
      </div>
      <div class="vmp-footer-tools-left-online">
        <i class="iconfont iconzaixianrenshu"></i>
        <onlineNum></onlineNum>
      </div>
      <div class="vmp-footer-tools-left-hot">
        <i class="iconfont iconzaixianrenshu"></i>
        <hotNum></hotNum>
      </div>
    </div>
    <div class="vmp-footer-tools-right">
      <div class="vmp-footer-tools-right-like">点赞</div>
    </div>
  </div>
</template>
<script>
  import onlineNum from '../../components/online.vue';
  import hotNum from '../../components/hot.vue';
  export default {
    name: 'VmpFooterTools',
    components: {
      onlineNum,
      hotNum
    }
  };
</script>
<style lang="less">
  .vmp-footer-tools {
    height: 56px;
    background: @bg-dark-section;
    line-height: 56px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    &-left {
      display: flex;
      align-items: center;
      color: @font-dark-normal;
      font-size: 14px;
      > div {
        margin-right: 16px;
        .iconfont {
          vertical-align: bottom;
        }
      }
    }
    &-right {
      display: flex;
      align-items: center;
      color: @font-dark-normal;
      font-size: 14px;
      > div {
        margin-left: 16px;
      }
    }
  }
</style>
