<template>
  <div class="vhall-lottery-wap" v-if="dialogVisible">
    <component
      :is="lotteryView"
      :winner-list="winLotteryUserList"
      :fitment="fitment"
      mode="watch"
      :showWinnerList="showWinnerList"
      :prizeInfo="prizeInfo"
      :lottery-id="lotteryId"
      :lottery-info="lotteryInfo"
      @needLogin="handleGoLogin"
      @close="close"
      @navTo="changeView"
    />
  </div>
</template>
<script>
  import { useLotteryServer, useRoomBaseServer, useChatServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  export default {
    name: 'VmpLotteryWatch',
    components: {
      LotteryPending: () => import('./components/lottery-pending.vue'), // 抽奖中界面
      LotteryMiss: () => import('./components/lottery-miss.vue'), // 未中奖界面
      LotteryWin: () => import('./components/lottery-win.vue'), // 中奖界面
      LotteryWinner: () => import('./components/lottery-winner.vue'), // 中奖列表界面
      LotteryAccept: () => import('./components/lottery-accept.vue'), // 领奖界面
      LotterySuccess: () => import('./components/lottery-success.vue') // 领取结果页面
    },
    data() {
      return {
        dialogVisible: false, // 主窗口显隐
        fitment: {}, // 抽奖设置
        lotteryView: '', // 抽奖组件视图名称
        winLotteryUserList: [], // 中奖用户列表
        prizeInfo: {}, // 奖品信息
        showWinnerList: false, // 是否显示中奖列表(的按钮)
        lotteryId: '', // 抽奖的信息id(接口返回)
        lotteryInfo: {}
      };
    },
    provide() {
      return {
        lotteryServer: this.lotteryServer
      };
    },
    beforeCreate() {
      this.lotteryServer = useLotteryServer({ mode: 'watch' });
    },
    created() {
      this.initMsgEvent();
      // this.open();
    },
    destroyed() {
      this.removeMsgEvent();
    },
    methods: {
      // 提示需要登录
      handleGoLogin() {
        this.dialogVisible = false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      },
      accept(msg) {
        this.setFitment(msg);
        this.lotteryView = 'LotteryWin';
        this.dialogVisible = true;
      },
      /**
       * @description 点开抽奖(按钮或者聊天)
       */
      open(uuid = '') {
        this.lotteryServer.checkLottery(uuid).then(res => {
          const data = res.data;
          if (data.lottery_status === 0) {
            // 抽奖中
            // 抽奖进行中
            this.setFitment(data);
            this.lotteryView = 'LotteryPending';
          } else {
            this.setFitment(data);
            if (data.win === 1) {
              // 中奖
              this.lotteryView = 'LotteryWin';
            } else {
              // 未中奖
              this.lotteryView = 'LotteryMiss';
            }
          }
          this.dialogVisible = true;
        });
      },

      /**
       * @description 注册事件
       */
      initMsgEvent() {
        //监听发起抽奖
        this.lotteryServer.$on(this.lotteryServer.Events.LOTTERY_PUSH, this.callBackLotteryPush);
        //监听结束抽奖
        this.lotteryServer.$on(
          this.lotteryServer.Events.LOTTERY_RESULT_NOTICE,
          this.callBackResultNotice
        );
      },
      removeMsgEvent() {
        this.lotteryServer.$off(this.lotteryServer.Events.LOTTERY_PUSH, this.callBackLotteryPush);
        this.lotteryServer.$off(
          this.lotteryServer.Events.LOTTERY_RESULT_NOTICE,
          this.callBackResultNotice
        );
      },
      // 抽奖开始消息推送
      callBackLotteryPush(msg) {
        this.setFitment(msg.data);
        this.lotteryView = 'LotteryPending';
        this.dialogVisible = true;
        useChatServer().addChatToList({
          content: {
            text_content: this.$t('interact_tools.interact_tools_1021')
          },
          type: msg.type,
          interactStatus: true
        });
      },
      // 抽奖结果消息推送
      callBackResultNotice(msg) {
        this.lotteryId = msg.data.lottery_id;
        this.setFitment(msg.data);
        const winnerList = msg.data.lottery_winners.split(',');
        const lotteryResult = winnerList.some(userId => {
          return this.isSelf(userId);
        });
        if (lotteryResult) {
          // 中奖
          this.lotteryView = 'LotteryWin';
        } else {
          // 未中奖
          this.lotteryView = 'LotteryMiss';
        }
        this.showWinnerList = !!msg.data.publish_winner;
        this.dialogVisible = true;
        const join_info = useRoomBaseServer().state?.watchInitData?.join_info;
        useChatServer().addChatToList({
          content: {
            text_content: lotteryResult
              ? this.$t('interact_tools.interact_tools_1023')
              : this.$t('interact_tools.interact_tools_1022'),
            msg: msg,
            userId: join_info.user_id || join_info.third_party_user_id,
            Show: msg.data.lottery_status == 1 && msg.data.win == 1
          },
          type: msg.type,
          interactStatus: true,
          isCheck: lotteryResult
        });
      },
      close() {
        this.dialogVisible = false;
      },
      /**
       * @description 切换视图
       */
      async changeView(view) {
        if (view === 'LotteryWinner') {
          await this.lotteryServer.getWinnerList(this.lotteryId).then(res => {
            this.winLotteryUserList = res.data?.list || [];
          });
        }
        this.lotteryView = view;
      },

      /**
       * @description 赋值奖品/抽奖设置
       */
      setFitment(payload) {
        this.prizeInfo = payload.award_snapshoot || {};
        this.fitment = {
          url: payload.icon,
          text: payload.remark,
          title: payload.title,
          img_order: payload.img_order
        };
        this.lotteryInfo = payload;
      },
      /**
       * @description 判断是否是自己
       * @param id String 用户id
       */
      isSelf(id) {
        const join_info = useRoomBaseServer().state?.watchInitData?.join_info;
        if (join_info && typeof join_info === 'object') {
          const userId = join_info.user_id || join_info.third_party_user_id;
          return userId == id;
        }
        return false;
      }
    }
  };
</script>
<style lang="less">
  .vhall-lottery-wap {
    .lottery__close-btn {
      position: absolute;
      bottom: -18px;
      left: 50%;
      transform: translateX(-15px);
      font-size: 30px;
      color: #ffffff;
      cursor: pointer;
    }
  }
</style>
<style lang="less" scoped>
  .vhall-lottery-wap {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 30;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 100;
  }
</style>
