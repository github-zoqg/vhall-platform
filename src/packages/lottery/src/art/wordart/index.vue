<template>
  <p class="wordart" :data-text="text" v-text="text"></p>
</template>
<script>
  // 艺术字公用UI组件
  export default {
    name: 'Wordart',
    props: {
      text: {
        type: String,
        required: true
      }
    }
  };
</script>
<style scoped lang="less">
  .wordart {
    display: inline-block;
    position: relative;
    font-weight: 600;
    font-size: 27px;
    line-height: 32px;
    color: #fef8f4;
    letter-spacing: 0;
    -webkit-text-stroke: 6px #eb6a37;
    text-shadow: 0px 1px 1px rgba(197, 21, 14, 0.56);
    transform: matrix(0.99, 0, -0.15, 1, 0, 0);
    &::before {
      content: attr(data-text);
      position: absolute;
      -webkit-text-stroke: 0;
      color: #fef8f4;
    }
    &.nowarp {
      white-space: nowrap;
    }
  }
</style>
