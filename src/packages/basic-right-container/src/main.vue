<template>
  <div class="vmp-basic-right-container"></div>
</template>

<script>
  import { contextServer } from 'vhall-sass-domain';
  export default {
    name: 'VmpBasicRightContainer',
    data() {
      return {};
    },
    created() {},
    mounted() {},
    methods: {}
  };
</script>

<style lang="less">
  .vmp-basic-right-container {
    width: 360px;
    box-sizing: border-box;
    background: #2a2a2a;
    position: absolute;
    right: 0;
    top: 20px;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    height: 100%;
    flex-direction: column;
    justify-content: flex-start;
  }
</style>
