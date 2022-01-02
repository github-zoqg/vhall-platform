<template>
  <div class="vmp-stream-list">
    <div v-for="i in count" :key="i" class="vmp-stream-container">
      <div class="vmp-stream-list_stream-box" :id="`stream-${i}`">
        <vmp-stream-remote :index="i" @exchange="exchange"></vmp-stream-remote>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'VmpStreamList',

    data() {
      return {
        count: 3
      };
    },

    methods: {
      exchange(compName) {
        window.$middleEventSdk?.event?.send({
          cuid: 'ps.surface',
          method: 'exchange',
          args: [compName, 2]
        });
      }
    }
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
  .vmp-stream-container {
    width: 142px;
    height: 80px;
  }
  .vmp-stream-list_stream-box {
    width: 100%;
    height: 100%;
  }
</style>
