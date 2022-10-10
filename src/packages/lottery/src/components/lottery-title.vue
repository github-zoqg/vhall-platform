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
    height: 36px; // 占位.实际大小48
    overflow: visible;

    .title-panel {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      width: 198px;
      height: 36px;
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translate(-50%);
      background-image: url('../img/title-panel.png');
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      text-align: center;
      line-height: 45px;
      font-weight: 500;
      font-size: 16px;
      color: #ad2000;
    }
    .content {
      margin: 0 8px;
    }
    .intersperse {
      display: inline-block;
      margin: 0 3px;
    }
    .intersperse-left {
      transform: rotate(-30deg);
    }
    .intersperse-right {
      transform: rotate(30deg);
    }
    .intersperse-yellow {
      width: 4px;
      height: 6px;
      background: #ffb029;
    }
    .intersperse-red {
      width: 4px;
      height: 8px;
      background: #fa490c;
    }
  }
</style>
