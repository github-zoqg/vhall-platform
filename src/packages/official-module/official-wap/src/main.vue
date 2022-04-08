<template>
  <div class="vh-wap-public-qrcode" v-if="showStatus">
    <div class="qrcode-content">
      <div class="public-code">
        <img class="code-img" :src="officicalInfo.img" alt />
      </div>
      <p class="tip">
        <b class="split-line"></b>
        <span class="text">{{ isWechat ? $t('nav.nav_1021') : $t('nav.nav_1031') }}</span>
        <b class="split-line"></b>
      </p>
      <div class="hand-down">
        <i class="vh-saas-iconfont vh-saas-line-fingerprint"></i>
      </div>
      <i @click="closeOfficial" class="btn-close vh-iconfont vh-line-close"></i>
    </div>
  </div>
</template>

<script>
  import { isWechat } from '@/packages/app-shared/utils/tool.js';
  export default {
    name: 'VmpWapQrCode',
    data() {
      return {
        isWechat: isWechat(),
        showStatus: false
      };
    },
    computed: {
      /**
       * 公众号信息
       */
      officicalInfo() {
        return this.$domainStore.state.roomBaseServer.officicalInfo;
      },
      // 获取嵌入方式
      embedObj() {
        return this.$domainStore.state.roomBaseServer.embedObj;
      },
      isLive() {
        return this.$domainStore.state.roomBaseServer.watchInitData.status == 'live';
      }
    },
    created() {
      if (this.embedObj.embedVideo) return;
      this.getOfficialInfo();
    },
    mounted() {
      console.log('roomBaseServer---->', this.officicalInfo);
    },
    methods: {
      /**
       * 自动弹出公众号
       */
      getOfficialInfo() {
        if (this.officicalInfo && this.officicalInfo.status == 0 && this.officicalInfo.img) {
          if (this.embedObj.embed) {
            if (this.isLive) this.showStatus = true;
          } else {
            if (this.officicalInfo.alert_type == 0) {
              this.showStatus = true;
            }
          }
        }
      },
      /**
       * 显示二维码
       */
      openOfficial() {
        this.showStatus = true;
      },
      /**
       * 关闭方法
       */
      closeOfficial() {
        this.showStatus = false;
        // TODO: 关闭方法
        // this.$emit('close');
      }
    }
  };
</script>

<style lang="less">
  .vh-wap-public-qrcode {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    z-index: 100;
    justify-content: center;
    align-items: center;
    .qrcode-content {
      background-color: #fff;
      border-radius: 14px;
      position: relative;
      .tip {
        color: #666;
        margin-bottom: 40px;
        display: flex;
        justify-content: center;
        align-items: center;
        .split-line {
          width: 55px;
          height: 1px;
          .mixin-border('top', #666, 1);
        }
        .text {
          margin: 0 12px;
        }
      }
      .hand-down {
        height: 100px;
        text-align: center;
        margin-bottom: 50px;
        i {
          color: #fc5459;
          font-size: 100px;
        }
      }
      .btn-close {
        width: 60px;
        height: 60px;
        line-height: 60px;
        text-align: center;
        font-size: 35px;
        position: absolute;
        bottom: -100px;
        left: 50%;
        color: #fff;
        transform: translate(-50%, 0);
      }
    }
    .public-code {
      width: 284px;
      height: 284px;
      padding: 0px;
      position: relative;
      margin: 50px;
      .code-img {
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
