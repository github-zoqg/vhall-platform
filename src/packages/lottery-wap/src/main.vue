<template>
  <van-popup
    v-model="popupVisible"
    :position="pending ? 'center' : 'bottom'"
    :class="[pending ? 'pending' : '', 'vmp-lottery']"
    get-container="body"
    overlay-class="vmp-lottery-popup-overlay"
    round
  >
    <i v-if="!pending" class="vh-iconfont vh-line-close close" @click="close" />
    <section class="content-wrapper">
      <component
        :is="lotteryView"
        :winner-list="winLotteryUserList"
        :fitment="fitment"
        :lotteryId="lotteryId"
        :showWinnerList="showWinnerList"
        :prizeInfo="prizeInfo"
        :lotteryInfo="lotteryInfo"
        :win-lottery-history="winLotteryHistory"
        :need-take-award="needTakeAward"
        @needLogin="handleGoLogin"
        @close="close"
        @navTo="changeView"
        @takeAward="handleTakeAward"
      />
    </section>
  </van-popup>
</template>

<script>
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { useLotteryServer, useRoomBaseServer, useChatServer, useMsgServer } from 'middle-domain';

  export default {
    name: 'VmpLotteryWap',
    components: {
      LotteryPending: () => import('./components/lottery-pending.vue'), // 抽奖中界面
      LotteryMiss: () => import('./components/lottery-miss.vue'), // 未中奖界面
      LotteryWin: () => import('./components/lottery-win.vue'), // 中奖界面
      LotteryWinner: () => import('./components/lottery-winner.vue'), // 中奖列表界面
      LotteryAccept: () => import('./components/lottery-accept.vue'), // 领奖界面
      LotterySuccess: () => import('./components/lottery-success.vue'), // 领取结果页面
      LotteryHistory: () => import('./components/lottery-history.vue') // 领取结果页面
    },
    provide() {
      return {
        lotteryServer: this.lotteryServer
      };
    },
    data() {
      return {
        popupVisible: false, // 主窗口显隐
        fitment: {}, // 抽奖设置
        lotteryView: '', // 抽奖组件视图名称
        winLotteryUserList: [], // 中奖用户列表
        prizeInfo: {}, // 奖品信息
        showWinnerList: false, // 是否显示中奖列表(的按钮)
        needTakeAward: true, // 是否需要领奖
        lotteryId: '', // 抽奖的信息id(接口返回)
        lotteryInfo: {}, // 抽奖信息
        winLotteryHistory: [], // 中奖历史
        winnerListData: Object
      };
    },
    computed: {
      pending() {
        return this.lotteryView === 'LotteryPending';
      }
    },
    beforeCreate() {
      this.lotteryServer = useLotteryServer({ mode: 'watch' });
      this.msgServer = useMsgServer();
    },
    created() {
      this.initMsgEvent();
    },
    destroyed() {
      this.removeMsgEvent();
      this.popupVisible = false;
    },
    methods: {
      /**
       * @description 点击聊天,中奖历史
       */
      async accept(msg) {
        this.lotteryId = msg.lottery_id;
        this.showWinnerList = !!msg.publish_winner;
        this.setFitment(msg);
        try {
          const res = await this.lotteryServer.checkLotteryResult(msg.lottery_id);
          const take_award = res?.data?.take_award;
          const lotteryView = take_award === 0 ? 'LotteryWin' : 'LotterySuccess';
          await this.changeView(lotteryView);
        } catch (err) {
          console.warn('获取中奖信息接口: ', err);
        }
      },
      /**
       * @description 点击抽奖按钮
       */
      async handleClickIcon() {
        const list = await this.lotteryServer.initIconStatus();
        let lotteryView = 'LotteryPending';
        const lotteryMiss = () => {
          // 弹出无中奖
          this.showWinnerList = false;
          this.prizeInfo = {};
          lotteryView = 'LotteryMiss';
        };
        if (list.length) {
          const lastLottery = list[0]; // 倒序排列
          if (lastLottery.lottery_status === 0) {
            // 抽奖中,显示抽奖面板
            // 抽奖进行中
            this.setFitment(lastLottery);
            lotteryView = 'LotteryPending';
          } else {
            const winLotteryHistory = list.filter(lot => lot.win === 1); // 中奖
            if (winLotteryHistory.length === 1) {
              // 只有一个中奖,显示中奖结果
              const winLottery = winLotteryHistory[0];
              this.lotteryId = winLottery.id;
              if (winLottery.take_award === 1) {
                lotteryView = 'LotterySuccess'; // 已领取提示已提交
              } else {
                lotteryView = 'LotteryWin'; // 为领取显示中奖结果
              }
              this.setFitment(winLottery);
            } else if (winLotteryHistory.length > 1) {
              // 两条以上中奖记录,显示中奖历史
              this.winLotteryHistory = winLotteryHistory;
              lotteryView = 'LotteryHistory';
            } else {
              lotteryMiss();
            }
          }
        } else {
          lotteryMiss();
        }

        await this.changeView(lotteryView);
      },
      /**
       * @description 注册事件
       */
      initMsgEvent() {
        this.lotteryServer.$on(this.lotteryServer.Events.LOTTERY_PUSH, this.callBackLotteryPush);
        this.lotteryServer.$on(
          this.lotteryServer.Events.LOTTERY_RESULT_NOTICE,
          this.callBackResultNotice
        );
        // 直播结束关闭弹窗
        this.msgServer.$on('live_over', () => {
          this.popupVisible = false;
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
      async callBackLotteryPush(msg) {
        const msgData = msg.data;
        this.setFitment(msgData);
        useChatServer().addChatToList({
          content: {
            text_content: this.$t('interact_tools.interact_tools_1021')
          },
          type: msg.data.type,
          interactStatus: true
        });
        await this.changeView('LotteryPending');
      },
      // 抽奖结果消息推送
      async callBackResultNotice(msg) {
        const msgData = msg.data;
        this.setFitment(msgData);
        this.lotteryId = msgData.lottery_id;
        this.showWinnerList = !!msgData.publish_winner;
        this.setFitment(msgData);
        const winnerList = msgData.lottery_winners.split(',');

        // 遍历是否存在key
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
          this.winnerListData[this.lotteryId].timer = await new Promise(
            resolve => (this.winnerListData[this.lotteryId].timer = setTimeout(resolve, 5000))
          );
        }

        const lotteryResult = this.winnerListData[this.lotteryId].list.some(userId => {
          return this.isSelf(userId);
        });
        this.showWinnerList = !!msgData.publish_winner;
        const join_info = useRoomBaseServer().state?.watchInitData?.join_info;
        useChatServer().addChatToList({
          content: {
            text_content: lotteryResult
              ? this.$t('interact_tools.interact_tools_1023')
              : this.$t('interact_tools.interact_tools_1022'),
            msg: msg,
            type: msg.data.type,
            userId: join_info.user_id || join_info.third_party_user_id,
            Show: lotteryResult ? true : false
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
        await this.changeView(lotteryResult ? 'LotteryWin' : 'LotteryMiss');
        // 清空已发送的中奖数据
        delete this.winnerListData[this.lotteryId];
      },
      close() {
        this.popupVisible = false;
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
        const opneView = view => {
          this.popupVisible = true;
          this.lotteryView = view;
        };
        if (this.popupVisible) {
          this.popupVisible = false; // 先关闭,出现弹窗效果
          await this.$nextTick();
          const st = setTimeout(() => {
            clearTimeout(st);
            opneView(view);
          }, 600);
        } else {
          opneView(view);
        }
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
        console.log(join_info);
        if (join_info && typeof join_info === 'object') {
          const userId = join_info.user_id || join_info.third_party_user_id;
          console.log(userId, id);
          return `${userId}` === `${id}`;
        }
        return false;
      },
      /**
       * @description 展示登录弹窗
       */
      handleGoLogin() {
        this.popupVisible = false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      },
      /**
       * @description 提交中奖信息
       */
      async handleTakeAward(lottery) {
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
        await this.changeView(LotteryView);
      }
    }
  };
</script>

<style lang="less">
  .vmp-lottery {
    &.pending {
      background: transparent;
    }
    .close {
      font-size: 32px;
      position: absolute;
      top: 37px;
      right: 36px;
      color: #8c8c8c;
      z-index: 10;
    }
    .content-wrapper {
      // position: relative;
      box-sizing: border-box;
    }
    // 组件内所有的按钮样式
    .vmp-lottery-btn {
      display: inline-block;
      width: 360px;
      height: 90px;
      background: #fb2626;
      border-radius: 45px;
      line-height: 90px;
      text-align: center;
      font-size: 32px;
      color: #fff;
    }
  }
  .vmp-lottery-popup-overlay {
    background-color: rgba(#000, 0.85); // 遮罩层
  }
</style>
