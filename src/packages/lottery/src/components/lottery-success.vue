<template>
  <div :class="['lottery-submit-ret', isEmbed ? 'lottery-submit-embed-ret' : '']">
    <lottery-header :prizeInfo="prizeInfo"></lottery-header>
    <p class="lottery-title-icon" :class="prizeInfo.publish_winner != 1 ? 'nobtn' : ''">
      <span
        class="vh-iconfont"
        :class="isSuccess ? 'vh-line-check' : 'vh-a-line-exclamationpoint'"
      ></span>
    </p>
    <p class="lottery-ret-desc">
      {{
        isSuccess
          ? $t('interact_tools.interact_tools_1013')
          : $t('interact_tools.interact_tools_1014')
      }}
    </p>
    <div v-if="showWinnerList" class="lottery-check-ret-btn" @click="getWinnerList">
      {{ $t('interact_tools.interact_tools_1012') }}
    </div>
    <i class="lottery__close-btn vh-iconfont vh-line-circle-close" @click="close"></i>
  </div>
</template>

<script>
  import LotteryHeader from './lottery-header';
  import { useRoomBaseServer } from 'middle-domain';

  export default {
    components: {
      LotteryHeader
    },
    props: {
      showWinnerList: {
        type: Boolean,
        default() {
          return false;
        }
      },
      isSuccess: {
        type: Boolean,
        default() {
          return true;
        }
      },
      prizeInfo: {
        type: Object
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
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
      getWinnerList() {
        this.$emit('navTo', 'LotteryWinner');
      }
    }
  };
</script>

<style lang="less" scoped>
  .lottery-submit-ret {
    width: 424px;
    height: 436px;
    background: url(../img/bg-submit-ret.png);
    background-size: 100% auto;
    margin-top: 15vh;
    margin-left: 50%;
    transform: translate(-50%, 0);
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    .lottery-title-icon {
      margin-top: 23px;
      width: 40px;
      height: 40px;
      border-radius: 22px;
      border: 1px solid #ffffff;
      line-height: 40px;
      text-align: center;
      color: #ffffff;
      &.nobtn {
        margin-top: 47px;
      }
      .iconfont {
        font-size: 20px;
      }
    }
    .lottery-ret-desc {
      line-height: 25px;
      color: #ffffff;
      font-size: 18px;
      margin-top: 10px;
    }
    .lottery-check-ret-btn {
      width: 160px;
      height: 40px;
      text-align: center;
      line-height: 40px;
      color: #fb3a32;
      font-size: 14px;
      user-select: none;
      cursor: pointer;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.9);
      position: absolute;
      bottom: 60px;
    }
  }
  @media screen and (max-height: 580px) {
    .lottery-submit-embed-ret {
      margin-top: 0px;
    }
  }
</style>
