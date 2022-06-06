<template>
  <div class="vmp-msgtip" :class="{ 'error-bg': showErrorBg }">
    <div class="vmp-msgtip__inner" v-if="code != 589">
      <div class="vmp-msgtip__image-box">
        <img src="../../assets/images/invalid_url.png" alt="" />
      </div>
      <p class="vmp-msgtip__text">{{ $t(this.code) }}</p>
    </div>
    <div class="vmp-msgtip__inner" v-if="code == 589">
      <div class="vmp-msgtip__image-loading">
        <img src="../../assets/images/loading.gif" alt="" />
      </div>
      <p class="vmp-msgtip__text">{{ $t(this.code) }}</p>
      <van-button
        type="primary"
        size="small"
        round
        :disabled="secondText != 0"
        @click="reloadLiveRoom"
      >
        {{ $t('common.common_1035') }}
        <span class="timer-count" v-show="secondText != 0">({{ secondText }}S)</span>
      </van-button>
    </div>
  </div>
</template>
<script>
  export default {
    data() {
      return {
        code: '',
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
    methods: {
      /**
       * 重新加载直播间
       */
      reloadLiveRoom() {
        window.location.href = `${window.origin}${process.env.VUE_APP_ROUTER_BASE_URL}/lives/watch/${this.webinar_id}`;
      }
    },
    mounted() {
      //如果是地址栏参数传值
      if (this.$route.params.code) {
        this.code = this.$route.params.code;
        this.webinar_id = this.$route.params.id;
        // this.code = 589;
        console.log('this.code------->', this.code);

        //倒计时
        if (this.code == 589) {
          let timer = setInterval(() => {
            this.secondText = this.secondText - 1;
            if (this.secondText == 0) {
              clearInterval(timer);
            }
          }, 1000);
        }
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
        text-align: center;
      }
      .vmp-msgtip__image-loading {
        text-align: center;
        img {
          height: 60px;
          width: 200px;
        }
      }
      .vmp-msgtip__text {
        font-size: 14px;
        line-height: 20px;
        margin: 30px 0 60px 0;
        user-select: none;
        color: #666666;
      }
    }
  }
</style>
