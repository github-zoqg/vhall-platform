<template>
  <div :class="['win-lottery-wrapper', isEmbed ? 'win-lottery-embed-wrapper' : '']">
    <lottery-header :prizeInfo="prizeInfo"></lottery-header>
    <p class="win-lottery-title">{{ $t('interact_tools.interact_tools_1015') }}</p>
    <p class="win-lottery-desc">
      {{ $t('interact_tools.interact_tools_1016') }}“{{
        prizeInfo.award_name || $t('interact_tools.interact_tools_1009')
      }}”
    </p>
    <div class="lottery-accept-btn" @click="acceptLottery">
      {{ $t('interact_tools.interact_tools_1017') }}
    </div>
    <i class="lottery__close-btn vh-iconfont vh-line-circle-close" @click="close" />
  </div>
</template>

<script>
  import LotteryHeader from './lottery-header';
  export default {
    components: {
      LotteryHeader
    },
    props: {
      prizeInfo: {
        type: Object,
        default() {
          return {};
        }
      }
    },
    computed: {
      isEmbed() {
        // 判断完全嵌入，解决签到在特殊高度下 无法完全展示签到弹窗问题
        const { embedObj } = this.roomBaseServer.state;
        return embedObj.embed && !embedObj.embedVideo;
      }
    },
    methods: {
      close() {
        this.$emit('close');
      },
      acceptLottery() {
        this.$emit('navTo', 'LotteryAccept');
      }
    }
  };
</script>

<style lang="less" scoped>
  .win-lottery-wrapper {
    width: 424px;
    height: 436px;
    background: url(../img/bg-win-lottery.png);
    background-size: 100% auto;
    margin-top: 15vh;
    margin-left: 50%;
    transform: translate(-50%, 0);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    .win-lottery-title {
      font-size: 32px;
      line-height: 45px;
      color: #ffffff;
      font-weight: 500;
      margin-top: 32px;
      padding-left: 20px;
    }
    .win-lottery-desc {
      font-size: 16px;
      line-height: 22px;
      color: #ffffff;
      margin-top: 5px;
      padding-left: 5px;
    }
    .lottery-accept-btn {
      width: 160px;
      height: 40px;
      border-radius: 20px;
      background-color: rgba(255, 255, 255, 0.9);
      color: #fb3a32;
      line-height: 40px;
      text-align: center;
      user-select: none;
      cursor: pointer;
      position: absolute;
      bottom: 72px;
      left: 50%;
      transform: translateX(-80px);
    }
  }
  @media screen and (max-height: 580px) {
    .win-lottery-embed-wrapper {
      margin-top: 0px;
    }
  }
</style>
