<template>
  <div class="title-container">
    <div class="title-panel">
      <span class="intersperse intersperse-left intersperse-yellow"></span>
      <span class="intersperse intersperse-left intersperse-red"></span>
      <p class="content">{{ title }}</p>
      <span class="intersperse intersperse-right intersperse-yellow"></span>
      <span class="intersperse intersperse-right intersperse-red"></span>
    </div>
  </div>
</template>
<script>
  /**
   * @description 标题面板
   */
  export default {
    name: 'LotteryTitle',
    props: {
      title: {
        required: true,
        type: String
      }
    }
  };
</script>
<style lang="less">
  .title-container {
    position: relative;
    background: transparent;
    width: 100%;
    height: 96px;

    .title-panel {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      width: 480px;
      height: 80px;
      position: absolute;
      top: -14px;
      left: 50%;
      transform: translate(-50%);
      background-image: url('../img/title-panel.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      text-align: center;
      line-height: 90px;
      font-size: 32px;
      color: #ad2000;
    }
    .content {
      margin: 0 15px;
      font-weight: 500;
    }
    .intersperse {
      display: inline-block;
      margin: 0 5px;
    }
    .intersperse-left {
      transform: rotate(-30deg);
    }
    .intersperse-right {
      transform: rotate(30deg);
    }
    .intersperse-yellow {
      width: 8px;
      height: 12px;
      background: #ffb029;
    }
    .intersperse-red {
      width: 8px;
      height: 15px;
      background: #fa490c;
    }
  }
</style>
