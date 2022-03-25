<template>
  <div class="base-box" v-if="!groupInitData.isInGroup && !showDoc">
    <div class="icon-wrap" @click="handleTimer" v-show="showTimer">
      <div :class="!timerVisible ? 'have' : ''"></div>
      <img src="./image/timer.png" />
    </div>
    <div class="icon-wrap" @click="handleSign" v-show="showSign">
      <div class="have"></div>
      <img src="./image/icon.png" />
    </div>
    <div class="icon-wrap">
      <red-packet-icon @clickIcon="handleRedPacket" />
    </div>
    <div class="icon-wrap">
      <lottery-icon @clickIcon="checkLotteryIcon" />
    </div>
    <div class="icon-wrap">
      <questionnaire-icon @clickIcon="checkQuestionnaireIcon" />
    </div>
    <vmp-air-container :cuid="cuid"></vmp-air-container>
  </div>
</template>

<script>
  import { useMenuServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  import lotteryIcon from './components/lottery-icon/index.vue';
  import redPacketIcon from './components/red-repakcet-icon/index.vue';
  import questionnaireIcon from './components/questionnaire-icon/index.vue';
  export default {
    name: 'VmpContainerRightWap',
    components: {
      lotteryIcon,
      redPacketIcon,
      questionnaireIcon
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
      groupInitData() {
        return this.$domainStore.state.groupServer.groupInitData;
      }
    },
    watch: {
      'groupInitData.isInGroup': {
        handler: function (val) {
          if (val) {
            this.roomBaseServer.state.timerInfo = {};
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
      handleRedPacket(red_packet_uuid) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitOpenRedPacket', [red_packet_uuid])
        );
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

<style lang="less" scoped>
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
      border-radius: 50%;
      background-color: #ff0005;
      content: '';
    }
  }
</style>
