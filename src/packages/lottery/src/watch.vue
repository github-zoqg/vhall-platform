<template>
  <div
    class="vhall-lottery-wap"
    v-if="dialogVisible"
    :style="{ zIndex: zIndexServerState.zIndexMap.lottery }"
  >
    <component
      :is="lotteryView"
      :winner-list="winLotteryUserList"
      :fitment="fitment"
      mode="watch"
      :show-winner-list="showWinnerList"
      :prizeInfo="prizeInfo"
      :lottery-id="lotteryId"
      :lottery-info="lotteryInfo"
      :need-take-award="needTakeAward"
      @needLogin="handleGoLogin"
      @close="close"
      @navTo="changeView"
    />
  </div>
</template>
<script>
  import {
    useLotteryServer,
    useRoomBaseServer,
    useChatServer,
    useZIndexServer,
    useMsgServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
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
    provide() {
      return {
        lotteryServer: this.lotteryServer
      };
    },
    data() {
      const zIndexServerState = this.zIndexServer.state;
      return {
        zIndexServerState,
        dialogVisible: false, // 主窗口显隐
        fitment: {}, // 抽奖设置
        lotteryView: '', // 抽奖组件视图名称
        winLotteryUserList: [], // 中奖用户列表
        prizeInfo: {}, // 奖品信息
        showWinnerList: false, // 是否显示中奖列表(的按钮)
        needTakeAward: true, // 是否需要领奖
        lotteryId: '', // 抽奖的信息id(接口返回)
        lotteryInfo: {},
        winLotteryHistory: [], // 中奖历史
        winnerListData: Object
      };
    },
    beforeCreate() {
      this.lotteryServer = useLotteryServer({ mode: 'watch' });
      this.msgServer = useMsgServer();
      this.zIndexServer = useZIndexServer();
    },
    created() {
      this.initMsgEvent();
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
      /**
       * @description 聊天区域点击,显示中奖信息(都是中奖,提交与未提交的区别)
       */
      accept(msg) {
        this.lotteryServer.checkLotteryResult(msg.lottery_id).then(res => {
          this.lotteryId = msg.lottery_id;
          this.setFitment(msg);
          if (res.code === 200) {
            if (res.data.take_award === 0) {
              this.lotteryView = 'LotteryWin';
            } else {
              this.lotteryView = 'LotterySuccess';
            }
            this.dialogVisible = true;
            this.zIndexServer.setDialogZIndex('lottery');
          }
        });
      },
      /**
       * @description 点击聊天按钮
       */
      async handleClickIcon() {
        const list = await this.lotteryServer.initIconStatus();
        const lotteryMiss = () => {
          // 弹出无中奖
          this.showWinnerList = false;
          this.prizeInfo = {};
          this.lotteryView = 'LotteryMiss';
        };
        if (list.length) {
          const lastLottery = list[0]; // 倒序排列
          if (lastLottery.lottery_status === 0) {
            // 抽奖中,显示抽奖面板
            this.lotteryId = lastLottery.id;
            this.setFitment(lastLottery);
            this.lotteryView = 'LotteryPending';
          } else {
            const winLotteryHistory = list.filter(lot => lot.win === 1); // 中奖
            if (winLotteryHistory.length === 1) {
              const winLottery = winLotteryHistory[0];
              // 只中奖一次,显示该次中奖结果
              this.lotteryId = winLottery.id;
              if (winLottery.take_award === 1) {
                this.lotteryView = 'LotterySuccess'; // 已领取提示已提交
              } else {
                this.lotteryView = 'LotteryWin'; // 为领取显示中奖结果
              }
              this.setFitment(winLottery);
            } else if (winLotteryHistory.length > 1) {
              // 中奖记录2条以上显示中奖历史
              this.lotteryServer.$emit('ShowHistory', winLotteryHistory); // 弹起中奖历史
              return false;
            } else {
              lotteryMiss();
            }
          }
        } else {
          lotteryMiss();
        }
        this.dialogVisible = true;
        this.zIndexServer.setDialogZIndex('lottery');
      },
      /**
       * @description 提交中奖信息
       */
      handleTakeAward(lottery) {
        let LotteryView = 'LotteryAccept';
        if (lottery.take_award === 1) {
          // 已领奖
          LotteryView = 'LotterySuccess';
        } else if (lottery.need_take_award === 1) {
          // 尚未领取
          LotteryView = 'LotteryAccept';
        } else {
          // 不需要领取
          LotteryView = 'LotteryWin';
        }
        this.lotteryId = lottery.id;
        this.setFitment(lottery);
        this.lotteryView = LotteryView;
        this.dialogVisible = true;
        this.zIndexServer.setDialogZIndex('lottery');
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
        // 直播结束关闭弹窗
        this.msgServer.$on('live_over', () => {
          this.dialogVisible = false;
        });
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
        this.zIndexServer.setDialogZIndex('lottery');
        useChatServer().addChatToList({
          content: {
            text_content: this.$t('interact_tools.interact_tools_1021')
          },
          type: msg.data.type,
          interactStatus: true
        });
      },
      // 抽奖结果消息推送
      async callBackResultNotice(msg) {
        this.lotteryId = msg.data.lottery_id;
        this.showWinnerList = !!msg.data.publish_winner;
        this.setFitment(msg.data);
        const winnerList = msg.data.lottery_winners.split(',');

        // 遍历是否存在key
        if (
          !Object.prototype.hasOwnProperty.call(this.winnerListData.hasOwnProperty, this.lotteryId)
        ) {
          this.winnerListData[this.lotteryId] = msg.data;
          this.winnerListData[this.lotteryId].list = [];
        }

        this.winnerListData[this.lotteryId].list =
          this.winnerListData[this.lotteryId].list.concat(winnerList);

        // 判断id数量是否等于中奖人数 不等于需要接收后续消息数据
        if (
          this.winnerListData[this.lotteryId].list.length <
          this.winnerListData[this.lotteryId].lottery_number
        ) {
          clearTimeout(this.this.winnerListData[this.lotteryId].timer);
          this.this.winnerListData[this.lotteryId].timer = await setTimeout(() => {}, 5000);
        }

        const lotteryResult = this.winnerListData[this.lotteryId].list.some(userId => {
          return this.isSelf(userId);
        });
        if (lotteryResult) {
          // 中奖
          this.lotteryView = 'LotteryWin';
        } else {
          // 未中奖
          this.lotteryView = 'LotteryMiss';
        }
        this.dialogVisible = true;
        this.zIndexServer.setDialogZIndex('lottery');
        const join_info = useRoomBaseServer().state?.watchInitData?.join_info;
        useChatServer().addChatToList({
          content: {
            text_content: lotteryResult
              ? this.$t('interact_tools.interact_tools_1023')
              : this.$t('interact_tools.interact_tools_1022'),
            msg: msg,
            type: msg.data.type,
            userId: join_info.user_id || join_info.third_party_user_id,
            Show: msg.data.lottery_status == 1 && msg.data.win == 1
          },
          type: msg.data.type,
          interactStatus: true,
          isCheck: lotteryResult
        });
        // 服务之间传递抽奖结果消息
        this.lotteryServer.$emit(
          lotteryResult
            ? this.lotteryServer.Events.LOTTERY_WIN
            : this.lotteryServer.Events.LOTTERY_MISS
        );
        // 清空已发送的中奖数据
        delete this.winnerListData[this.lotteryId];
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
        this.showWinnerList = !!payload.publish_winner;
        this.needTakeAward = !!payload.need_take_award;
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
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 102;
    line-height: initial; // 清除父容器的css影响
    .lottery__close-btn {
      position: absolute;
      bottom: -36px;
      left: 50%;
      transform: translateX(-15px);
      font-size: 30px;
      color: #ffffff;
      cursor: pointer;
    }
  }
</style>
