<template>
  <div class="vmp-basic-right-container">
    <section v-show="isVisibleMiniElement" class="vmp-basic-right-hd"></section>
    <section class="vmp-basic-right-bd">
      <vmp-air-container :cuid="cuid"></vmp-air-container>
    </section>
  </div>
</template>

<script>
  export default {
    name: 'VmpBasicRightContainer',
    data() {
      return {
        childrenComp: []
      };
    },
    computed: {
      isVisibleMiniElement() {
        // TODO:后续添加插播桌面共享后，再添加插播桌面共享场景的处理
        return this.$domainStore.state.docServer.switchStatus;
      }
    },
    created() {
      // this.childrenComp = window.$serverConfig[this.cuid].children;
    },
    mounted() {},
    methods: {}
  };
</script>

<style lang="less">
  .vmp-basic-right-container {
    width: 360px;
    box-sizing: border-box;
    position: absolute;
    right: 0;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: flex-start;
    .vmp-basic-right-hd {
      padding-top: 56.25%;
    }
    .vmp-basic-right-bd {
      background: #2a2a2a;
      flex: 1;
    }
  }
</style>
