<template>
  <div class="vhsaas-interact-dialog open" :class="languagesInfo.language_type == 1 ? 'zh' : 'en'">
    <div class="title">{{ $t('interact_tools.interact_tools_1080') }}</div>
    <div class="vhsaas-command">
      <!-- 抢到金额 -->
      <div v-if="is_luck == 1">
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
      <input type="text" ref="shareLink" class="copyText" readonly v-model="red_code" />
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
  import { doCopy } from '@/app-shared/utils/tool.js';
  export default {
    name: 'RedPacketSuccess',
    props: {
      red_code: {
        type: String,
        default() {
          return '';
        }
      },
      //is_luck  0：打开没抢到     1:抢到了     2：没打开红包
      is_luck: {
        type: Number,
        default() {
          return 0;
        }
      }
    },
    data() {
      return {
        copyText: ''
      };
    },
    computed: {
      // 当前语言
      languagesInfo() {
        return this.$domainStore.state.roomBaseServer.languages.curLang;
      }
    },
    methods: {
      navToList() {
        this.$emit('navTo', 'RedPacketWinners');
      },
      copy() {
        // this.$refs.shareLink.select(); // 选择对象
        // document.execCommand('Copy'); // 执行浏览器复制命令
        doCopy(this.red_code);
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
    width: 342px;
    height: 402px;
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
    &.en {
      .vhsaas-gold-title {
        margin-top: 30px;
      }
      .vhsaas-red-packet-content {
        margin-top: 70px;
      }
    }
    > .title {
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
      color: #87000e;
      margin-top: 68px;
    }
  }
  .vhsaas-gold-title {
    font-weight: 400;
    font-size: 12px;
    line-height: 17px;
    color: #ba5003;
    margin-top: 38px;
    text-align: center;
    width: 190px;
  }
  .vhsaas-gold-unit {
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    width: 180px;
    height: 56px;
    text-align: center;
    color: #ad0914;
    margin: 8px auto 0;
    word-break: break-all;
  }
  .vhsaas-gold-null {
    font-weight: 600;
    font-size: 18px;
    line-height: 25px;
    text-align: center;
    color: #ba5003;
    height: 86px;
    margin-top: 40px;
  }

  /* 红包信息面板 */
  .vhsaas-red-packet-content {
    z-index: 27;
    width: 100%;
    margin-top: 90px;
    .btn {
      background: linear-gradient(180deg, #f9eb8a 0%, #f5b72f 100%);
      box-shadow: 0px 4px 4px rgba(201, 0, 32, 0.2), inset 0px 1px 0px #fff3ab,
        inset 0px -2px 0px #f38817;
      border-radius: 50px;
      width: 160px;
      height: 40px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 400;
      font-size: 16px;
      line-height: 22px;
      color: #61000d;
      cursor: pointer;
      &:hover {
        background: linear-gradient(180deg, #faee9f 0%, #f8c85d 100%);
      }
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
    font-size: 14px;
    font-weight: 400;
    color: #fee4b3;
    line-height: 20px;
    text-align: center;
    margin-top: 12px;
  }
</style>
