<template>
  <p class="wordart" :data-text="text">
    {{ text }}
  </p>
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
    font-size: 54px;
    line-height: 64px;
    color: #fef8f4;
    -webkit-text-stroke: 12px #eb6a37;
    text-shadow: 0px 2px 2px rgba(197, 21, 14, 0.56);
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
