<template>
  <div class="vmp-wap-error">
    <span class="vmp-wap-error-tip">{{ liveErrorTip }}</span>
  </div>
</template>
<script>
  export default {
    props: {
      liveErrorTip: {
        type: [String],
        default: '当前地址已失效，请联系主办方了解详情'
      }
    }
  };
</script>
<style lang="less">
  .vmp-wap-error {
    height: 100%;
    background: url('//cnstatic01.e.vhall.com/static/img/webinar.png') no-repeat center;
    background-size: cover;
    font-size: 36px;
    display: flex;
    color: #ffffff;
    align-items: center;
    justify-content: center;
    .vmp-wap-error-tip {
      text-align: center;
    }
  }
</style>
