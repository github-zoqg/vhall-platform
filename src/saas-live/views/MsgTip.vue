<template>
  <div class="vmp-msgtip">
    <div class="vmp-msgtip__inner">
      <div class="vmp-msgtip__image-box"></div>
      <p v-html="text"></p>
    </div>
  </div>
</template>
<script>
  export default {
    props: {
      text: {
        type: [String],
        default: '当前地址已失效，请联系主办方了解详情'
      }
    }
  };
</script>
<style lang="less">
  .vmp-msgtip {
    height: 100vh;
    width: 100%;
    position: relative;
    background: #ffffff;
    .vmp-msgtip__inner {
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -370px;
      margin-top: -200px;
      width: 740px;
      height: 400px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      .vmp-msgtip__image-box {
        height: 130px;
        width: 148px;
        background: url('../assets/images/invalid_url.png') no-repeat;
      }
    }
  }
</style>
