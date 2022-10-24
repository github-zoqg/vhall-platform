<template>
  <div
    class="vhall-lottery-wap"
    v-if="dialogVisible"
    :style="{ zIndex: zIndexServerState.zIndexMap.lottery }"
  >
    <div class="lottery-content-container">
      <i
        :class="['vh-iconfont', boxLayout ? 'vh-line-close' : 'vh-line-circle-close']"
        @click="close"
      />
      <component
        class="lottery-content"
        :is="lotteryView"
        :winner-list="winLotteryUserList"
        :fitment="fitment"
        mode="watch"
        :show-winner-list="showWinnerList"
        :prizeInfo="prizeInfo"
        :lottery-id="lotteryId"
        :lottery-info="lotteryInfo"
        :need-take-award="needTakeAward"
        :win-lottery-history="winLotteryHistory"
        @takeAward="handleTakeAward"
        @needLogin="handleGoLogin"
        @close="close"
        @navTo="changeView"
      />
    </div>
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
      LotterySuccess: () => import('./components/lottery-success.vue'), // 领取结果页面
      LotteryHistory: () => import('./components/lottery-history.vue'), // 领取结果页面
      LotterySubmitDetail: () => import('./components/lottery-submit-detail.vue') // 中奖详情页
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
        visible: true,
        dialogVisible: false, // 主窗口显隐
        fitment: {}, // 抽奖设置
        lotteryView: 'LotteryAccept', // 抽奖组件视图名称
        winLotteryUserList: [], // 中奖用户列表
        prizeInfo: {}, // 奖品信息
        showWinnerList: false, // 是否显示中奖列表(的按钮)
        needTakeAward: true, // 是否需要领奖
        lotteryId: '', // 抽奖的信息id(接口返回)
        lotteryInfo: {},
        winLotteryHistory: [], // 中奖历史
        winnerListData: {}
      };
    },
    computed: {
      boxLayout() {
        const boxLayoutModules = [
          'LotterySubmitDetail',
          'LotterySuccess',
          'LotteryMiss',
          'LotteryAccept',
          'LotteryWinner',
          'LotteryHistory'
        ];
        return boxLayoutModules.includes(this.lotteryView);
      }
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
              this.lotteryView = 'LotterySubmitDetail';
            }
            this.dialogVisible = true;
            this.zIndexServer.setDialogZIndex('lottery');
          }
        });
      },
      /**
       * @description 点击视频下方的抽奖icon
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
              this.showWinnerList = !!winLottery.publish_winner;
              if (winLottery.take_award === 1) {
                this.lotteryView = 'LotterySubmitDetail'; // 已领取提示已提交
              } else {
                this.lotteryView = 'LotteryWin'; // 为领取显示中奖结果
              }
              this.setFitment(winLottery);
            } else if (winLotteryHistory.length > 1) {
              // 中奖记录2条以上显示中奖历史
              // this.lotteryServer.$emit('ShowHistory', winLotteryHistory); // 弹起中奖历史
              this.winLotteryHistory = winLotteryHistory;
              this.lotteryView = 'LotteryHistory';
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
          LotteryView = 'LotterySubmitDetail';
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
        this.showWinnerList = !!lottery.publish_winner;
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
        this.lotteryId = msg.data.lottery_id;
        this.dialogVisible = true;
        this.zIndexServer.setDialogZIndex('lottery');
        useChatServer().addChatToList({
          content: {
            text_content: this.$t('interact_tools.interact_tools_1021')
          },
          type: msg.data.type,
          interactStatus: true
        });
        window.vhallReportForWatch?.report(170022, {
          lottery_id: msg.data.lottery_id
        });
      },
      // 抽奖结果消息推送
      async callBackResultNotice(msg) {
        this.lotteryId = msg.data.lottery_id;
        this.showWinnerList = !!msg.data.publish_winner;
        this.setFitment(msg.data);
        this.close(); // 先关闭,防止异步
        const winnerList = msg.data.lottery_winners.split(',');
        // 遍历是否存在key
        console.log(!Object.prototype.hasOwnProperty.call(this.winnerListData, this.lotteryId));
        if (!Object.prototype.hasOwnProperty.call(this.winnerListData, this.lotteryId)) {
          this.winnerListData[this.lotteryId] = msg.data;
          this.winnerListData[this.lotteryId].list = [];
        }

        this.winnerListData[this.lotteryId].list =
          this.winnerListData[this.lotteryId].list.concat(winnerList);

        clearTimeout(this.winnerListData[this.lotteryId].timer);
        // 判断id数量是否等于中奖人数 不等于需要接收后续消息数据
        if (
          this.winnerListData[this.lotteryId].list.length <
          this.winnerListData[this.lotteryId].lottery_number
        ) {
          await new Promise(
            resolve => (this.winnerListData[this.lotteryId].timer = setTimeout(resolve, 5000))
          );
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
        this.lotteryView = '';
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
    .lottery-content-container {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }
    .vmp-lottery-btn {
      width: 160px;
      height: 40px;
      text-align: center;
      color: #fff;
      font-size: 14px;
      cursor: pointer;
      border-radius: 20px;
      background: #fb2626;
      border: 0;
    }
    .lottery-box {
      position: relative;
      box-sizing: border-box;
      width: 424px;
      background: linear-gradient(37.94deg, #fffbe8 3.86%, #fbf0e6 84.36%);
      border-radius: 20px 20px 0px 0px;
      border-radius: 12px;
      text-align: center;
      padding: 24px 32px;
    }
    .vh-line-close {
      position: absolute;
      top: 24px;
      right: 32px;
      cursor: pointer;
      color: #f6c667;
      z-index: 10;
      &:hover {
        color: #fc9600;
      }
    }
    .vh-line-circle-close {
      position: absolute;
      bottom: -45px;
      color: #fff;
      font-size: 27px;
      display: inline-block;
      left: 50%;
      transform: translateX(-50%);
      cursor: pointer;
    }
  }
</style>
