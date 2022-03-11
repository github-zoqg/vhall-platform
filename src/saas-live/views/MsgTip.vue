<template>
  <div class="vmp-msgtip" :class="{ 'error-bg': showErrorBg }">
    <div class="vmp-msgtip__inner" v-if="code != 589">
      <div class="vmp-msgtip__image-box"></div>
      <p v-html="text"></p>
    </div>
    <div class="vmp-msgtip__inner" v-if="code == 589">
      <div class="vmp-msgtip__image-loading"></div>
      <p class="vmp-msgtip__text">服务器正在使劲加载，请稍候...</p>
      <el-button
        type="primary"
        size="small"
        round
        :disabled="secondText != 0"
        @click="reloadLiveRoom"
      >
        点我重新加载
        <span class="timer-count" v-show="secondText != 0">({{ secondText }}S)</span>
      </el-button>
    </div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        code: '',
        errorText: '服务器正在使劲加载，请稍候...',
        secondText: 3
      };
    },
    computed: {
      showErrorBg() {
        if (this.code == 589) {
          return true;
        } else {
          return false;
        }
      }
    },
    props: {
      text: {
        type: [String],
        default: '当前地址已失效，请联系主办方了解详情'
      }
    },
    methods: {
      /**
       * 重新加载直播间
       */
      reloadLiveRoom() {
        window.location.href = `${window.origin}/lives/room/${this.webinar_id}`;
      }
    },
    mounted() {
      this.code = this.$route.params.code;
      this.webinar_id = this.$route.params.id;
      // this.code = 589;
      console.log('this.code------->', this.code);

      //倒计时
      let timer = setInterval(() => {
        this.secondText = this.secondText - 1;
        if (this.secondText == 0) {
          clearInterval(timer);
        }
      }, 1000);
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
      .vmp-msgtip__image-loading {
        height: 200px;
        width: 200px;
        background: url('../assets/images/loading.gif') center center no-repeat;
      }
      .vmp-msgtip__text {
        margin: 40px 0 20px 0;
        user-select: none;
      }
    }
    .error-bg {
    }
  }
</style>
