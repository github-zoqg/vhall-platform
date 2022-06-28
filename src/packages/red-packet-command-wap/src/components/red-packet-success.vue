<template>
  <div class="vhsaas-interact-dialog open">
    <div class="title">{{ $t('interact_tools.interact_tools_1080') }}</div>
    <div class="vhsaas-command">
      <!-- 抢到金额 -->
      <div v-if="!!red_code">
        <p class="vhsaas-gold-title">{{ $t('interact_tools.interact_tools_1081') }}</p>
        <p class="vhsaas-gold-unit">{{ red_code }}</p>
      </div>
      <!-- 未抢到金额  -->
      <div v-else class="vhsaas-gold-null">
        {{ $t('interact_tools.interact_tools_1034') }}
        <br />
        {{ $t('interact_tools.interact_tools_1035') }}
      </div>
    </div>
    <!-- 第四层 内容层-->
    <div class="vhsaas-red-packet-content">
      <input type="text" ref="shareLink" class="copyText" v-model="red_code" />
      <div class="btn btn-copy" v-if="!!red_code" @click="copy">
        {{ $t('interact_tools.interact_tools_1082') }}
      </div>
      <p class="vhsaas-red-packet__btn" @click="navToList">
        {{ $t('interact_tools.interact_tools_1083') }}
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
      red_code: {
        type: String,
        default() {
          return '';
        }
      }
    },
    data() {
      return {
        copyText: ''
      };
    },
    methods: {
      navToList() {
        this.$emit('navTo', 'RedPacketWinners');
      },
      copy() {
        this.$refs.shareLink.select(); // 选择对象
        document.execCommand('Copy'); // 执行浏览器复制命令
        this.$toast(this.$t('nav.nav_1024'));
      }
    }
  };
</script>
<style lang="less" scoped>
  .vhsaas-interact-dialog {
    width: 730px;
    height: 877px;
    background-size: 100% auto;
    margin-left: 50%;
    transform: translate(-50%, -10%);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 21;
    &.open {
      background: url(../images/open-bg@2x.png);
      background-size: 100% 100%;
    }
    > .title {
      font-weight: 600;
      color: #87000e;
      margin-top: 150px;
      font-style: normal;
      font-size: 28px;
      line-height: 39px;
    }
  }
  .vhsaas-gold-title {
    font-weight: 400;
    font-size: 30px;
    line-height: 42px;
    color: #ba5003;
    margin-top: 70px;
    text-align: center;
  }
  .vhsaas-gold-unit {
    font-weight: 600;
    font-size: 48px;
    line-height: 67px;
    width: 432px;
    height: 134px;
    text-align: center;
    color: #ad0914;
    margin-top: 22px;
    word-break: break-all;
  }
  .vhsaas-gold-null {
    font-weight: 600;
    font-size: 48px;
    line-height: 67px;
    text-align: center;
    color: #ba5003;
    height: 194px;
    margin-top: 80px;
  }

  /* 红包信息面板 */
  .vhsaas-red-packet-content {
    z-index: 27;
    width: 100%;
    margin-top: 200px;
    .btn {
      background: linear-gradient(180deg, #f9eb8a 0%, #f5b72f 100%);
      box-shadow: 0px 4px 4px rgba(201, 0, 32, 0.2), inset 0px 1px 0px #fff3ab,
        inset 0px -2px 0px #f38817;
      border-radius: 50px;
      width: 320px;
      height: 80px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 400;
      font-size: 32px;
      line-height: 45px;
      color: #61000d;
      cursor: pointer;
    }
    .copyText {
      width: 1px;
      height: 0;
      position: absolute;
      border: none;
    }
  }
  .vhsaas-red-packet__btn {
    cursor: pointer;
    font-weight: 400;
    color: #fee4b3;
    font-size: 28px;
    line-height: 39px;
    text-align: center;
    margin-top: 40px;
  }
</style>
