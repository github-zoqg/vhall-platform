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
    <div class="vhsaas-right-gold right-animate"></div>
    <!-- 第三层红包盒子层 z-index:5 -->
    <div class="vhsaas-red-packet-cover"></div>
    <!-- 第四层 彩带层 z-index: 6-->
    <div class="vhsaas-red-packet-line"></div>
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
        {{ (redPacketInfo.nickname || '') | splitLenStr(8) }}
      </p>
      <p class="vhsaas-red-packet__btn" @click="navToList">
        {{ $t('interact_tools.interact_tools_1036') }}
      </p>
      <p v-if="amount > 0" class="vhsaas-red-packet__remark">
        {{ $t('interact_tools.interact_tools_1037') }}
        <i
          class="vhsaas-red-packet__help vh-iconfont vh-line-question"
          @mouseover="noticeShow = true"
          @mouseout="noticeShow = false"
        ></i>
      </p>
    </div>
    <!-- 第五层 - 提现备注悬浮层-->
    <div v-show="noticeShow" class="vhsaas-red-packet_notice">
      <p>
        <span>1.</span>
        {{ $t('webinar.webinar_1004') }}
      </p>
      <p>
        <span>2.</span>
        {{ $t('webinar.webinar_1005') }}
      </p>
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
    filters: {
      splitLenStr: function (name, len) {
        return name && name.length > len ? name.substring(0, len) + '...' : name;
      }
    },
    data() {
      return {
        noticeShow: false
      };
    },
    methods: {
      navToList() {
        this.$emit('navTo', 'RedPacketWinners');
      }
    }
  };
</script>
<style lang="less" scoped>
  .vhsaas-interact-dialog {
    width: 920px;
    height: 880px;
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
    }
  }
  .vhsaas-left-gold {
    width: 400px;
    height: 400px;
    background: url(../images/open-left-money@2x.png);
    background-size: 100% 100%;
    position: absolute;
    top: 96px;
    left: 104px;
    z-index: 23;
    &.left-animate {
      animation-delay: 1s;
      -webkit-animation: leftAnimate 1s;
      -ms-animation: leftAnimate 1s;
      animation: leftAnimate 1s;
    }
    @keyframes leftAnimate {
      from {
        top: 156px;
      }
      to {
        top: 96px;
      }
    }
  }
  .vhsaas-max-gold {
    width: 600px;
    height: 600px;
    background: url(../images/open-money@2x.png);
    background-size: 100% 100%;
    position: absolute;
    top: -64px;
    left: 160px;
    z-index: 24;
    &.max-animate {
      -webkit-animation: maxAnimate 0.35s;
      -ms-animation: maxAnimate 0.35s;
      animation: maxAnimate 0.35s;
    }

    @keyframes maxAnimate {
      from {
        top: 0;
      }
      to {
        top: -64px;
      }
    }
  }
  .vhsaas-gold-title {
    font-size: 24px;
    font-weight: 400;
    color: #ba5003;
    line-height: 34px;
    margin-top: 240px;
    text-align: center;
  }
  .vhsaas-gold-unit {
    text-align: center;
    font-size: 52px;
    font-weight: bold;
    color: #ed0b25;
    line-height: 80px;
    i {
      width: 40px;
      height: 40px;
      font-size: 40px;
      font-weight: 400;
      color: #ed0b25;
      line-height: 40px;
    }
  }
  .vhsaas-gold-null {
    text-align: center;
    height: 100px;
    font-size: 36px;
    font-weight: 600;
    color: #ba5003;
    line-height: 50px;
    margin-top: 228px;
    padding-left: 30px;
  }
  .vhsaas-right-gold {
    width: 400px;
    height: 400px;
    background: url(../images/open-right-money@2x.png);
    background-size: 100% 100%;
    position: absolute;
    top: 96px;
    right: 110px;
    z-index: 23;
    &.right-animate {
      animation-delay: 0.5s;
      -webkit-animation: rightAnimate 0.75s;
      -ms-animation: rightAnimate 0.75s;
      animation: rightAnimate 0.75s;
    }

    @keyframes rightAnimate {
      from {
        top: 156px;
      }
      to {
        top: 96px;
      }
    }
  }

  .vhsaas-red-packet-cover {
    width: 588px;
    height: 662px;
    background: url(../images/open-bg-cover@2x.png);
    background-size: 100% 100%;
    position: absolute;
    bottom: 24px;
    left: 166px;
    z-index: 25;
  }
  .vhsaas-red-packet-line {
    width: 920px;
    height: 880px;
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
    bottom: 64px;
    height: 486px;
    width: 100%;
    left: 0;
  }
  .vhsaas-red-packet-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin: 72px auto 4px auto;
    display: block;
  }
  .vhsaas-red-packet__name {
    font-size: 28px;
    font-weight: 400;
    color: #fee4b3;
    line-height: 40px;
    margin-bottom: 24px;
    text-align: center;
  }
  .vhsaas-red-packet__btn {
    cursor: pointer;
    font-size: 28px;
    font-weight: 400;
    color: #fee4b3;
    line-height: 40px;
    text-align: center;
  }
  .vhsaas-red-packet__remark {
    font-size: 24px;
    font-weight: 400;
    color: rgba(254, 228, 179, 0.8);
    line-height: 24px;
    text-align: center;
    margin-top: 136px;
    padding: 4px 0 6px 0;
  }
  .vhsaas-red-packet__help {
    display: inline-block;
    cursor: pointer;
    margin-left: 10px;
    font-size: 24px;
  }
  .vhsaas-red-packet_notice {
    width: 400px;
    min-height: 170px;
    background: #1a1a1a;
    border-radius: 8px;
    opacity: 0.8;
    position: absolute;
    z-index: 28;
    bottom: 206px;
    text-align: justify;
    padding: 16px 20px 14px 40px;
    p {
      font-size: 24px;
      font-weight: 400;
      color: #ffffff;
      line-height: 34px;
      span {
        margin-left: -18px;
      }
    }
  }
  .vhsaas-other-return {
    font-size: 22px;
    color: #ffffff;
    margin-top: 40px;
    display: block;
    margin-left: 44px;
    cursor: pointer;
  }
  /* 看看大家的手气 */
  .vhsaas-other-unit {
    font-size: 68px;
    font-weight: bold;
    color: #fee4b3;
    line-height: 68px;
    text-align: center;
    margin-bottom: 16px;
    margin-top: -16px;
    i {
      font-size: 40px;
      font-weight: 400;
      color: #fee4b3;
      line-height: 40px;
    }
  }
</style>
