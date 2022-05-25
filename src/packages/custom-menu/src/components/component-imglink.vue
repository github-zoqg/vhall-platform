<template>
  <div class="vmp-custom-menu-imglink" :class="{ 'qr-preview-page': isSubscribe }">
    <div class="qr-previewbox">
      <div class="qrbox">
        <img :src="info.imageSrc" alt="" @click="jump" />
      </div>
    </div>
  </div>
</template>
<script>
  /**
   * 图文链自定义菜单
   */
  export default {
    name: 'component-imglink',
    props: {
      info: {
        required: false
      }
    },
    computed: {
      isSubscribe() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status === 'subscribe';
      }
    },
    data() {
      return {};
    },

    methods: {
      jump() {
        if (!this.info.src) return;
        window.open(this.info.src);
      }
    }
  };
</script>
<style lang="less">
  .vmp-custom-menu-imglink {
    margin-bottom: 16px;
    box-sizing: border-box;
    padding: 0px 24px;

    .qr-previewbox {
      .qrbox {
        position: relative;
        width: 100%;
        overflow: hidden;
        &:hover {
          cursor: pointer;
        }
        img {
          display: block;
          max-width: 100%;
          margin: 0px auto;
        }
      }
    }
    .qr-preview-page .qr-previewbox {
      .qrbox {
        position: relative;

        margin: 20px auto;
        &:hover {
          cursor: pointer;
        }
        img {
          display: block;
          margin: 0px auto;
          max-width: 100%;
        }
      }
    }
  }
</style>
