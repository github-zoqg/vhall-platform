<template>
  <div class="vmp-mask-top" v-show="showMask">
    <div :class="[activeClass]" id="mask-center">
      <div class="top-area"><i class="vh-saas-iconfont vh-saas-a-icon_zuoyouhuadong2x"></i></div>
      <div class="center-text">{{ $t('other.other_1007') }}</div>
      <div class="bottom-btn" @click="clickSure">{{ $t('other.other_1015') }}</div>
    </div>
  </div>
</template>

<script>
  import { useMicServer } from 'middle-domain';
  export default {
    name: 'MaskTop',
    data() {
      return {
        maskStatus: true,
        activeClass: 'center'
      };
    },
    computed: {
      webinarId() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.id;
      },
      // 在麦上 + 未展示过滑动提示
      showMask() {
        return this.maskStatus && useMicServer().state.isSpeakOn;
      }
    },
    created() {
      this.setfirstModelStatus();
    },
    mounted() {
      if (sessionStorage.getItem(`${this.webinarId}_mask`)) {
        this.maskStatus = false;
      }
    },
    methods: {
      clickSure() {
        this.maskStatus = false;
        sessionStorage.setItem(`${this.webinarId}_mask`, true);
      },
      setfirstModelStatus() {
        if (this.$domainStore.state.roomBaseServer.webinarTag?.organizers_status == 1) {
          // 顶部有距离
          this.activeClass = 'center';
        } else {
          // 贴顶展示
          this.activeClass = 'centerNoTopPadding';
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-mask-top {
    .top-area {
      height: 1.3rem;
      border: 4px dashed #fff;
      color: #fff;
      text-align: center;
      line-height: 86px;
      border-radius: 10px;
      font-size: 26px;
    }
    .center {
      padding: 0.9rem 0.293333rem 0;
      position: relative;
      margin: 0.42rem;
      z-index: 2000;
      opacity: 1;
    }
    .centerNoTopPadding {
      padding: 0 0.293333rem 0;
      position: relative;
      margin: 0 0.42rem 0.42rem;
      z-index: 2000;
      opacity: 1;
    }
    .center-text {
      height: 144px;
      color: #fff;
      text-align: center;
      line-height: 184px;
    }
    .bottom-btn {
      height: 64px;
      color: #fff;
      text-align: center;
      line-height: 64px;
      border: 1px solid #fff;
      width: 176px;
      margin: 0 auto;
      border-radius: 6px;
    }
  }
</style>
