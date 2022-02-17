<template>
  <div class="vhsaas-lottery-wrapper">
    <lottery-pending :fitment="fitment" @close="close" />
  </div>
</template>
<script>
  import lotteryPending from './components/lottery-pending.vue';
  import { useMsgServer } from 'middle-domain';
  export default {
    name: 'VmpLotteryWatch',
    components: { lotteryPending },
    data() {
      return {
        fitment: {}
      };
    },
    beforeCreate() {
      this.msgServer = useMsgServer();
    },
    created() {
      this.initMsgEvent();
    },
    methods: {
      initMsgEvent() {
        this.msgServer.$on('ROOM_LOTTERY_PUSH', msg => {
          console.log(msg);
        });
      },
      close() {}
    }
  };
</script>
<style lang="less" scoped>
  .vhsaas-lottery-wrapper {
    position: relative;
    .vhsaas-lottery-icon {
      width: 32px;
      cursor: pointer;
      margin-left: 16px;
    }
    .vhsaas-lottery-tip-icon {
      position: absolute;
      width: 7px;
      height: 7px;
      border-radius: 4px;
      background-color: #fb3a32;
      border: 1px solid #2a2a2a;
      right: -2px;
      top: -2px;
    }
    .lottery-dialog-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.6);
      z-index: 21;
      .lottery-dialog {
        width: 400px;
        height: 456px;
        background: url(./img/bg-normal.png);
        background-size: 100% auto;
        margin-top: 15vh;
        margin-left: 50%;
        transform: translate(-50%, 0);
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        &.blue {
          background: url(./img/bg-blue.png);
        }
        .lottery-title {
          width: 100%;
          text-align: center;
          padding-top: 72px;
          font-size: 26px;
          font-weight: 500;
          color: #ffffff;
          line-height: 37px;
        }
        .lottery-img-box {
          width: 170px;
          height: 170px;
          margin-top: 27px;
          .lottery-img {
            width: 100%;
            height: 100%;
            object-fit: scale-down;
          }
        }
        .lottery-desc {
          margin-top: 28px;
          line-height: 20px;
          color: #ffffff;
          font-size: 14px;
          width: 280px;
          text-align: center;
        }
      }
      .lottery-code-dialog {
        position: relative;
        .lottery-img-box {
          margin-top: 96px;
        }
        .lottery-desc {
          margin-top: 22px;
          &__commond {
            color: #ffdf46;
          }
        }
        .lottery-code-participate-btn {
          width: 160px;
          height: 40px;
          border-radius: 20px;
          background-color: #ffffff;
          color: #fb3a32;
          text-align: center;
          line-height: 40px;
          font-size: 14px;
          position: absolute;
          bottom: 70px;
          left: 50%;
          transform: translateX(-80px);
          user-select: none;
          cursor: pointer;
        }
      }
      ::v-deep .lottery-close-btn {
        position: absolute;
        bottom: -18px;
        left: 50%;
        transform: translateX(-15px);
        font-size: 30px;
        color: #ffffff;
        cursor: pointer;
      }
    }
  }
</style>
