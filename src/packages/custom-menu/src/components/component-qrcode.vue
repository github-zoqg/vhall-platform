<template>
  <div class="vmp-custom-menu-qrcode" :class="{ 'qrcode-subscribe-page': type == 'subscribe' }">
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

    methods: {}
  };
</script>
<style lang="less">
  .vmp-custom-menu-qrcode {
    max-width: 100%;
    height: auto;
    margin: 0px 24px 20px 24px;

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
</style>
