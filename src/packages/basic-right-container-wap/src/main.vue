<template>
  <div class="vmp-container-right-wap" v-if="!isInGroup">
    <div class="base-box" v-show="!showDoc">
      <!-- 问卷 -->
      <questionnaire-icon class="icon-wrap" @clickIcon="checkQuestionnaireIcon" />
      <!-- 签到 -->
      <div class="icon-wrap" @click="handleSign" v-show="showSign">
        <div class="have"></div>
        <img src="./image/icon.png" />
      </div>
      <!-- 抽奖 -->
      <lottery-icon v-if="!isVod" class="icon-wrap" @clickIcon="checkLotteryIcon" />
      <!-- 红包 -->
      <red-packet-icon class="icon-wrap" v-if="!isEmbed" @clickIcon="handleRedPacket" />
      <!-- 计时器 -->
      <div class="icon-wrap" @click="handleTimer" v-show="showTimer">
        <div :class="!timerVisible ? 'have' : ''"></div>
        <img src="./image/timer.png" />
      </div>
      <!-- 公告列表 -->
      <noticeList></noticeList>
    </div>
    <vmp-air-container :cuid="cuid"></vmp-air-container>
  </div>
</template>

<script>
  import { useMenuServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import lotteryIcon from './components/lottery-icon/index.vue';
  import redPacketIcon from './components/red-repakcet-icon/index.vue';
  import questionnaireIcon from './components/questionnaire-icon/index.vue';
  import noticeList from './components/noticeList/index.vue';
  export default {
    name: 'VmpContainerRightWap',
    components: {
      lotteryIcon,
      redPacketIcon,
      questionnaireIcon,
      noticeList
    },
    data() {
      return {
        showTimer: false,
        timerVisible: true,
        showSign: false,
        showDoc: false
      };
    },
    computed: {
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      },
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      isVod() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 5;
      }
    },
    watch: {
      isInGroup: {
        handler: function (val) {
          if (val) {
            this.$domainStore.state.roomBaseServer.timerInfo = {};
          }
        }
      }
    },
    mounted() {
      useMenuServer().$on('tab-switched', async data => {
        if ('comDocWap' === data.cuid) {
          this.showDoc = true;
        } else {
          this.showDoc = false;
        }
      });
    },
    methods: {
      changeStatus(data, status) {
        // console.log(data, status, 'data, status');
        this[data] = status;
      },
      handleTimer() {
        if (!this.timerVisible) {
          this.timerVisible = true;
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenTimer'));
        }
      },
      handleSign() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenSign'));
      },
      handleRedPacket() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenRedPacket'));
      },
      checkLotteryIcon() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickLotteryIcon'));
      },
      checkQuestionnaireIcon(questionnaireId) {
        console.log(questionnaireId);
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickQuestionnaireIcon', [questionnaireId])
        );
      }
    }
  };
</script>

<style lang="less">
  .vmp-container-right-wap {
    .base-box {
      display: flex;
      flex-direction: column;
      position: absolute;
      display: inline-block;
      right: 26px;
      top: 100px;
      // width: 20px;
      .icon-wrap {
        margin-bottom: 10px;
        max-width: 84px;
        max-height: 84px;
        position: relative;
        background-color: transparent;
        img {
          width: 84px;
          height: 84px;
        }
      }
      .have {
        position: absolute;
        top: 2px;
        right: 2px;
        width: 20px;
        height: 20px;
        border-radius: 10px;
        background-color: #ff0005;
        content: '';
      }
    }
  }
</style>
