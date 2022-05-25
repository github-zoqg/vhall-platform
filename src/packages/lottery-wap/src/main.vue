/* eslint-disable promise/param-names */
<template>
  <van-popup
    v-model="popupVisible"
    position="bottom"
    class="lottery-popup"
    get-container="body"
    closeable
  >
    <!-- 抽奖标题 -->
    <!-- <header class="title-bar">
      {{ $t('interact_tools.interact_tools_1003') }}
      <i class="vh-iconfont vh-line-close" @click="close"></i>
    </header> -->
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
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
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
        winLotteryHistory: [] // 中奖历史
      };
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
      accept(msg) {
        console.log(msg);
        this.lotteryId = msg.lottery_id;
        this.showWinnerList = !!msg.publish_winner;
        this.setFitment(msg);
        this.lotteryServer.checkLotteryResult(msg.lottery_id).then(res => {
          if (res.code === 200) {
            if (res.data.take_award === 0) {
              this.lotteryView = 'LotteryWin';
            } else {
              this.lotteryView = 'LotterySuccess';
            }
            this.popupVisible = true;
          }
        });
      },
      /**
       * @description 点开抽奖(按钮或者聊天)
       */
      open2(uuid = '') {
        this.lotteryServer.checkLottery(uuid).then(res => {
          const data = res.data;
          this.lotteryId = data.id;
          this.showWinnerList = !!data.publish_winner;
          this.needTakeAward = !!data.need_take_award;
          if (data.lottery_status === 0) {
            // 抽奖中
            // 抽奖进行中
            this.setFitment(data);
            this.lotteryView = 'LotteryPending';
          } else {
            this.setFitment(data);
            if (data.win === 1) {
              // 中奖
              if (data.take_award) {
                this.lotteryView = 'LotterySuccess';
              } else {
                this.lotteryView = 'LotteryWin';
              }
            } else {
              // 未中奖
              this.lotteryView = 'LotteryMiss';
            }
          }
          this.popupVisible = true;
        });
      },
      /**
       * @description 点击聊天按钮
       */
      async handleClickIcon() {
        const list = await this.lotteryServer.initIconStatus();
        if (!list.length) return; // 没有抽奖历史,不可能有点击事件
        const lastLottery = list[0]; // 倒序排列
        if (lastLottery.lottery_status === 0) {
          // 抽奖中,显示抽奖面板
          // 抽奖进行中
          this.setFitment(lastLottery);
          this.lotteryView = 'LotteryPending';
        } else {
          const winLotteryHistory = list.filter(lot => lot.win === 1); // 中奖
          if (winLotteryHistory.length) {
            this.winLotteryHistory = winLotteryHistory;
            this.lotteryView = 'LotteryHistory';
          } else {
            // 弹出无中奖
            this.showWinnerList = false;
            this.prizeInfo = {};
            this.lotteryView = 'LotteryMiss';
          }
        }
        this.popupVisible = true;
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
      callBackLotteryPush(msg) {
        const msgData = msg.data;
        this.setFitment(msgData);
        this.lotteryView = 'LotteryPending';
        this.popupVisible = true;
        useChatServer().addChatToList({
          content: {
            text_content: this.$t('interact_tools.interact_tools_1021')
          },
          type: msg.data.type,
          interactStatus: true
        });
      },
      // 抽奖结果消息推送
      callBackResultNotice(msg) {
        const msgData = msg.data;
        this.setFitment(msgData);
        this.lotteryId = msgData.lottery_id;
        this.showWinnerList = !!msgData.publish_winner;
        this.setFitment(msgData);
        const winnerList = msgData.lottery_winners.split(',');
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
        this.showWinnerList = !!msgData.publish_winner;
        console.log('  this.popupVisible', this.popupVisible);
        this.popupVisible = true;
        console.log('  this.popupVisible', this.popupVisible);
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
            ? this.lotteryServerthis.Events.LOTTERY_WIN
            : this.lotteryServerthis.Events.LOTTERY_MISS
        );
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
        console.log(join_info);
        if (join_info && typeof join_info === 'object') {
          const userId = join_info.user_id || join_info.third_party_user_id;
          console.log(userId, id);
          return `${userId}` === `${id}`;
        }
        return false;
      },
      async showCardfun() {
        this.showCard = true;
        this.showRedIcon = false;
        this.awardInfo.img = '';
        await this.queryLotteryInfo();
        this.latterPrizeInfo();
      },
      handleGoLogin() {
        this.popupVisible = false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLogin'));
      },
      /**
       * @description 提交中奖信息
       */
      handleTakeAward(lottery) {
        this.lotteryId = lottery.id;
        this.setFitment(lottery);
        this.lotteryView = 'LotteryAccept';
        this.popupVisible = true;
      }
    }
  };
</script>

<style lang="less" scoped>
  .lottery-popup {
    // height: calc(100% - 422px);
  }
  .title-bar {
    position: relative;
    font-size: 32px;
    font-weight: 500;
    color: rgba(68, 68, 68, 1);
    text-align: center;
    height: 90px;
    line-height: 90px;
    border-bottom: 1px solid #d4d4d4;
    i {
      position: absolute;
      top: 50%;
      left: 94%;
      transform: translate(-50%, -50%);
      font-size: 27px;
    }
  }
  .content-wrapper {
    box-sizing: border-box;
    // padding: 36px 30px;
    // min-height: calc(100% - 90px);
  }
</style>
