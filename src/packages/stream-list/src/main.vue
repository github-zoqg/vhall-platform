<template>
  <div class="vmp-stream-list">
    <div class="vmp-stream-list_stream-box">
      <vmp-stream-remote></vmp-stream-remote>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'VmpStreamList',

    data() {
      return {};
    },

    mounted() {},

    methods: {}
  };
</script>

<style lang="less">
  .vmp-stream-list {
    height: 80px;
    width: 100%;
    background-color: #242424;
    display: flex;
    justify-content: center;
  }
  .vmp-stream-list_stream-box {
    width: 142px;
    height: 80px;
  }
</style>
