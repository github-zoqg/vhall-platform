<template>
  <div class="vmp-basic-right-container">
    <section class="vmp-basic-right-hd"></section>
    <section class="vmp-basic-right-bd">
      <vmp-air-container :cuid="childrenComp[0]"></vmp-air-container>
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
    created() {
      this.childrenComp = window.$serverConfig[this.cuid].children;
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
