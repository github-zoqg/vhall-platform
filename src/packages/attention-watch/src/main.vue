<template>
  <div class="vmp-attention">
    <div class="vmp-attention-icon" :style="{ color: themeClass.pageBg }">
      <i class="iconfont iconguankanbuju"></i>
      <p>关注</p>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpAttention',
    data() {
      return {
        themeClass: {
          pageBg: '#3562fa'
        }
      };
    }
  };
</script>
<style lang="less">
  .vmp-attention {
    padding-right: 24px;
    &-icon {
      text-align: center;
      cursor: pointer;
      i {
        font-size: 16px;
      }
      p {
        font-size: 14px;
        line-height: 14px;
        padding-top: 5px;
      }
      &:hover {
        i,
        p {
          cursor: pointer;
          color: @font-high-light-normal !important;
        }
      }
    }
  }
</style>
