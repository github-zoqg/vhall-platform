<template>
  <div class="container sysUnder">
    <div class="left-section sysUnder">
      <div class="inner-content">
        <h1 class="heading">{{ $t('message.message_1022') }}</h1>
        <!-- 具体文案 -->
        <p class="subheading">{{ $t('message.message_1023') }}</p>
      </div>
    </div>
    <div class="right-section">
      <img src="~@/saas-wap/assets/images/no-server@2x.png" class="svgImg" alt="" />
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Error'
  };
</script>

<style lang="less">
  /*文字-字体*/
  @fontSemibold: '-apple-system', 'BlinkMacSystemFon', 'Helvetica Neue', Helvetica, 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  @fontRegular: '-apple-system', 'BlinkMacSystemFon', 'Helvetica Neue', Helvetica, 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;

  .left-section.sysUnder {
    width: 416px;
    margin-right: 77px;
  }
  .left-section .inner-content {
    position: absolute;
    top: 70%;
    transform: translateY(-70%);
  }
  .background {
    background: #ffffff;
  }
  .container {
    position: relative;
    margin: 0 auto;
    width: 52%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    .index-btn {
      margin-top: 32px;
      text-align: left;
    }
    .heading {
      font-size: 160px;
      font-family: @fontSemibold;
      font-weight: 600;
      color: #1a1a1a;
      line-height: 224px;
    }
    &.sysUnder {
      .heading {
        font-size: 64px;
        font-family: @fontRegular;
        font-weight: 400;
        color: #1a1a1a;
        line-height: 90px;
      }
    }
    &.network {
      flex-direction: column;
      width: 245px;
      height: auto;
      text-align: center;
      margin-top: calc((100vh - 292px) / 2);
      .heading {
        font-size: 28px;
        font-family: @fontRegular;
        font-weight: 400;
        color: #666666;
        line-height: 40px;
      }
      .index-btn {
        text-align: center;
      }
    }
  }
  .left-section {
    width: 40%;
  }
  .subheading {
    height: 22px;
    font-size: 32px;
    font-family: @fontRegular;
    font-weight: 400;
    color: #1a1a1a;
    line-height: 44px;
  }
  .headingNotice {
    margin-top: 16px;
    width: 266px;
    font-size: 28px;
    font-family: @fontRegular;
    font-weight: 400;
    color: #999999;
    line-height: 44px;
  }
  .right-section {
    width: 50%;
  }
  .svgImg {
    position: absolute;
    top: calc(25%);
    max-width: 100%;
    max-height: 100%;
  }
</style>
