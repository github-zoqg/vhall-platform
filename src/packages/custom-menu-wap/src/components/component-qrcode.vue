<template>
  <div
    class="vmp-custom-menu-qrcode"
    :class="{ 'qrcode-subscribe-page': type == 'subscribe', 'qrcode-subscribe': isSubscribe }"
  >
    <div class="comqrcode-previewbox">
      <div class="qrbox">
        <img :src="info.imageSrc" alt="" />
      </div>
    </div>
  </div>
</template>
<script>
  /**
   * 二维码自定义菜单
   */
  export default {
    name: 'component-qrcode',
    props: {
      info: {
        required: false
      },
      type: {
        type: String,
        default: 'watch'
      }
    },

    data() {
      return {
        domain_url: ''
      };
    },
    computed: {
      // 是否是预约页
      isSubscribe() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status === 'subscribe';
      }
    },
    methods: {}
  };
</script>
<style lang="less">
  .vmp-custom-menu-qrcode {
    padding: 0 0;
    max-width: 100%;
    height: auto;
    margin: 24px auto 0 auto;
    .comqrcode-previewbox {
      width: 100%;
      height: 100%;
      .qrbox {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        text-align: center;
        img {
          display: inline-block;
          width: 70%;
          // height: 100%;
        }
      }
    }

    &.qrcode-subscribe-page {
      width: 160px;
      height: 160px;
      img {
        display: block;
        width: 100%;
        height: 100%;
      }
    }
  }
  .tab-menu__concise {
    .vmp-custom-menu-qrcode {
      max-width: 50%;
      /* 最小手机，自定义菜单高度大约为375px * 225px; */
      &.qrcode-subscribe {
        max-width: 100%;
      }
    }
  }
</style>
