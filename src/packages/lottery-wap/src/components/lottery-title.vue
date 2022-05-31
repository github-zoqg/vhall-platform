<template>
  <header class="vmp-title-container">
    <div class="vmp-title-warp">
      <span class="star star-1"></span>
      <span class="star star-2"></span>
      <span class="star star-3"></span>
      <h1 class="vmp-lottery-title">{{ title }}</h1>
      <div class="line"></div>
    </div>
  </header>
</template>
<script>
  export default {
    name: 'LotteryTitle',
    props: {
      title: {
        type: String,
        required: true,
        default() {
          return '';
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-title-warp {
    display: inline-block;
    position: relative;
    .line {
      width: calc(100% + 16px);
      height: 20px;
      border-radius: 10px;
      background: #f3c9c8;
      position: absolute;
      left: 50%;
      bottom: 0;
      transform: translateX(-50%);
      z-index: 1;
    }
    .star {
      position: absolute;
      display: inline-block;
      background-size: 100%;
      background-repeat: no-repeat;
      &-1 {
        width: 25.6px;
        height: 27.1px;
        top: 26px;
        left: -42px;
        background-image: url('../img/star-1.png');
      }
      &-2 {
        width: 26px;
        height: 32px;
        top: -4px;
        right: -32px;
        background-image: url('../img/star-2.png');
      }
      &-3 {
        width: 16px;
        height: 20px;
        top: 20px;
        right: -42px;
        background-image: url('../img/star-3.png');
      }
    }
    .vmp-lottery-title {
      position: relative;
      min-width: 160px;
      color: #000;
      font-size: 40px;
      font-weight: 500;
      text-shadow: 0 4px 0 #fff;
      z-index: 2;
    }
  }
</style>
