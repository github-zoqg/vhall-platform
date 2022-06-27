<template>
  <div class="vhsaas-interact-dialog open">
    <!-- 第二层金币层 z-index: 3；z-index: 4 -->
    <div class="vhsaas-left-gold left-animate"></div>
    <div class="vhsaas-max-gold max-animate">
      <!-- 抢到金额 -->
      <div v-if="amount > 0">
        <p class="vhsaas-gold-title">{{ $t('interact_tools.interact_tools_1033') }}</p>
        <p class="vhsaas-gold-unit">
          <i>￥</i>
          {{ amount }}
        </p>
      </div>
      <!-- 未抢到金额  -->
      <p v-else class="vhsaas-gold-null">
        {{ $t('interact_tools.interact_tools_1034') }}
        <br />
        {{ $t('interact_tools.interact_tools_1035') }}
      </p>
    </div>
    <!-- 第四层 内容层-->
    <div class="vhsaas-red-packet-content">
      <img
        v-if="redPacketInfo.avatar"
        :src="redPacketInfo.avatar"
        alt=""
        class="vhsaas-red-packet-avatar"
      />
      <img v-else src="../images/avatar_default@2x.png" alt="" class="vhsaas-red-packet-avatar" />
      <p class="vhsaas-red-packet__name">
        {{ (redPacketInfo.nickname || '') | overHidden(8) }}
      </p>
      <p class="vhsaas-red-packet__btn" @click="navToList">
        {{ $t('interact_tools.interact_tools_1036') }}
      </p>
      <input
        type="text"
        ref="shareLink"
        style="width: 1px; height: 0; position: absolute"
        v-model="copyText"
      />
      <div class="btn btn-copy" @click="copy">一键复制</div>
    </div>
    <slot />
  </div>
</template>
<script>
  export default {
    name: 'RedPacketSuccess',
    props: {
      redPacketInfo: {
        type: Object,
        default() {
          return {};
        }
      },
      amount: {
        type: Number,
        default() {
          return 0;
        }
      }
    },
    data() {
      return {
        copyText: '123'
      };
    },
    methods: {
      navToList() {
        this.$emit('navTo', 'RedPacketWinners');
      },
      copy() {
        this.$refs.shareLink.select(); // 选择对象
        document.execCommand('Copy'); // 执行浏览器复制命令
        this.$message({
          message: this.$t('nav.nav_1024'),
          showClose: true,
          type: 'success',
          customClass: 'zdy-info-box'
        });
      }
    }
  };
</script>
<style lang="less" scoped>
  .vhsaas-interact-dialog {
    width: 460px;
    height: 440px;
    background-size: 100% auto;
    margin-top: 15vh;
    margin-left: 50%;
    transform: translate(-50%, 0);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 21;
    &.open {
      background: url(../images/open-bg@2x.png);
      background-size: 100% 100%;
      width: 460px;
    }
  }
  .vhsaas-left-gold {
    width: 200px;
    height: 200px;
    background: url(../images/open-left-money@2x.png);
    background-size: 100% 100%;
    position: absolute;
    top: 48px;
    left: 62px;
    z-index: 23;
    &.left-animate {
      animation-delay: 1s;
      -webkit-animation: leftAnimate 1s;
      -ms-animation: leftAnimate 1s;
      animation: leftAnimate 1s;
    }
    @-webkit-keyframes leftAnimate {
      from {
        top: 78px;
      }
      to {
        top: 48px;
      }
    }
    @-ms-keyframes leftAnimate {
      from {
        top: 78px;
      }
      to {
        top: 48px;
      }
    }
    @keyframes leftAnimate {
      from {
        top: 78px;
      }
      to {
        top: 48px;
      }
    }
  }
  .vhsaas-max-gold {
    width: 300px;
    height: 300px;
    background: url(../images/open-money@2x.png);
    background-size: 100% 100%;
    position: absolute;
    top: -32px;
    left: 80px;
    z-index: 24;
    &.max-animate {
      -webkit-animation: maxAnimate 0.35s;
      -ms-animation: maxAnimate 0.35s;
      animation: maxAnimate 0.35s;
    }
    @-webkit-keyframes maxAnimate {
      from {
        top: 0;
      }
      to {
        top: -32px;
      }
    }
    @-ms-keyframes maxAnimate {
      from {
        top: 0;
      }
      to {
        top: -32px;
      }
    }
    @keyframes maxAnimate {
      from {
        top: 0;
      }
      to {
        top: -32px;
      }
    }
  }
  .vhsaas-gold-title {
    font-size: 12px;
    font-weight: 400;
    color: #ba5003;
    line-height: 17px;
    margin-top: 120px;
    text-align: center;
  }
  .vhsaas-gold-unit {
    text-align: center;
    font-size: 26px;
    font-weight: bold;
    color: #ed0b25;
    line-height: 40px;
    i {
      width: 20px;
      height: 20px;
      font-size: 20px;
      font-weight: 400;
      color: #ed0b25;
      line-height: 20px;
    }
  }
  .vhsaas-gold-null {
    text-align: center;
    height: 50px;
    font-size: 18px;
    font-weight: 600;
    color: #ba5003;
    line-height: 25px;
    margin-top: 114px;
    padding-left: 15px;
  }
  .vhsaas-right-gold {
    width: 200px;
    height: 200px;
    background: url(../images/open-right-money@2x.png);
    background-size: 100% 100%;
    position: absolute;
    top: 48px;
    right: 55px;
    z-index: 23;
    &.right-animate {
      animation-delay: 0.5s;
      -webkit-animation: rightAnimate 0.75s;
      -ms-animation: rightAnimate 0.75s;
      animation: rightAnimate 0.75s;
    }
    @-webkit-keyframes rightAnimate {
      from {
        top: 78px;
      }
      to {
        top: 48px;
      }
    }
    @-ms-keyframes rightAnimate {
      from {
        top: 78px;
      }
      to {
        top: 48px;
      }
    }
    @keyframes rightAnimate {
      from {
        top: 78px;
      }
      to {
        top: 48px;
      }
    }
  }

  .vhsaas-red-packet-cover {
    width: 294px;
    height: 331px;
    background: url(../images/open-bg-cover@2x.png);
    background-size: 100% 100%;
    position: absolute;
    bottom: 12px;
    left: 83px;
    z-index: 25;
  }
  .vhsaas-red-packet-line {
    width: 460px;
    height: 440px;
    background: url(../images/open-cover-caidai@2x.png);
    background-size: 100% 100%;
    position: absolute;
    top: 0;
    z-index: 26;
  }
  /* 红包信息面板 */
  .vhsaas-red-packet-content {
    position: absolute;
    z-index: 27;
    bottom: 32px;
    height: 243px;
    width: 100%;
    left: 0;
    .btn {
      width: 200px;
      height: 40px;
      margin: 20px auto;
      background-color: #fee4b3;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: red;
      border-radius: 40px;
      cursor: pointer;
    }
  }
  .vhsaas-red-packet-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    margin: 36px auto 4px auto;
    display: block;
  }
  .vhsaas-red-packet__name {
    font-size: 14px;
    font-weight: 400;
    color: #fee4b3;
    line-height: 20px;
    margin-bottom: 12px;
    text-align: center;
  }
  .vhsaas-red-packet__btn {
    cursor: pointer;
    font-size: 14px;
    font-weight: 400;
    color: #fee4b3;
    line-height: 20px;
    text-align: center;
  }
  .vhsaas-red-packet__remark {
    font-size: 12px;
    font-weight: 400;
    color: rgba(254, 228, 179, 0.8);
    line-height: 12px;
    text-align: center;
    margin-top: 68px;
    padding: 2px 0 3px 0;
  }
  .vhsaas-red-packet__help {
    display: inline-block;
    cursor: pointer;
    margin-left: 5px;
    font-size: 12px;
  }
  .vhsaas-red-packet_notice {
    width: 200px;
    min-height: 85px;
    background: #1a1a1a;
    border-radius: 4px;
    opacity: 0.8;
    position: absolute;
    z-index: 28;
    bottom: 103px;
    left: 115px;
    padding: 8px 10px 7px 20px;
    p {
      font-size: 12px;
      font-weight: 400;
      color: #ffffff;
      line-height: 17px;
      span {
        margin-left: -9px;
      }
    }
  }
  /* 看看大家的手气 */
  .vhsaas-other-unit {
    font-size: 34px;
    font-weight: bold;
    color: #fee4b3;
    line-height: 34px;
    text-align: center;
    margin-bottom: 8px;
    margin-top: -8px;
    i {
      font-size: 20px;
      font-weight: 400;
      color: #fee4b3;
      line-height: 20px;
    }
  }
</style>
