<template>
  <div class="vmp-attention">
    <div class="vmp-attention-icon" :style="{ color: themeClass.pageBg }" @click="attentionHandler">
      <i class="iconfont iconguankanbuju"></i>
      <p>{{ isAttention ? $t('nav.nav_1003') : $t('nav.nav_1004') }}</p>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpAttention',
    data() {
      return {
        themeClass: {
          pageBg: '#e6e6e6'
        },
        isAttention: false,
        isLogin: false
      };
    },
    methods: {
      attentionHandler() {
        if (!this.isLogin) {
          this.goLoginDialog();
        }
      },
      goLoginDialog() {
        window.$middleEventSdk?.event?.send({
          cuid: this.cuid,
          method: 'emitClickLogin'
        });
      }
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
