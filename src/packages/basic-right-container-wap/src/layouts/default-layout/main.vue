<template>
  <div class="vmp-container-right-wap" v-if="!isInGroup">
    <div class="base-box" v-show="showIcon">
      <!-- 快问快答 -->
      <exam-icon class="icon-wrap" @clickIcon="checkExamIcon" />
      <!-- 问卷 -->
      <questionnaire-icon class="icon-wrap" @clickIcon="checkQuestionnaireIcon" />
      <!-- 签到 -->
      <div class="icon-wrap" @click="handleSign" v-show="showSign && webinarType == 1">
        <!-- <div class="have"></div> -->
        <img src="../../common/image/icon.png" />
      </div>
      <!-- 抽奖 -->
      <lottery-icon
        v-if="webinarType == 1 || webinarType == 3"
        class="icon-wrap"
        @clickIcon="checkLotteryIcon"
      />
      <!-- 红包 -->
      <red-packet-icon
        class="icon-wrap"
        v-if="!isEmbed && webinarType == 1"
        @clickIcon="handleRedPacket"
      />
      <!-- 计时器 -->
      <div class="icon-wrap" @click="handleTimer" v-show="showTimer && webinarType == 1">
        <!-- <div :class="!timerVisible ? 'have' : ''"></div> -->
        <img src="../../common/image/timer.png" v-if="timerVisible" />
        <img src="../../common/image/timer_no.png" v-else />
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
  import lotteryIcon from '../../common/components/lottery-icon/index.vue';
  import redPacketIcon from '../../common/components/red-repakcet-icon/index.vue';
  import questionnaireIcon from '../../common/components/questionnaire-icon/index.vue';
  import noticeList from '../../common/components/noticeList/index.vue';
  import examIcon from '../../common/components/exam-icon/index.vue';
  export default {
    name: 'VmpContainerRightWap',
    components: {
      lotteryIcon,
      redPacketIcon,
      questionnaireIcon,
      noticeList,
      examIcon
    },
    props: {
      iconStyle: {
        default: 1,
        type: Number,
        required: false
      } // 1为传统风格icon，2为新版icon
    },
    data() {
      return {
        showTimer: false,
        timerVisible: true,
        showSign: false,
        showIcon: true
      };
    },
    computed: {
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      },
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      // 直播类型
      webinarType() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type;
      },
      isVod() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 5;
      },
      // 是否是手机端 - 简洁模式
      isConcise() {
        let skin_json_wap = {
          style: 1
        };
        const skinInfo = this.$domainStore.state.roomBaseServer.skinInfo;
        if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
          skin_json_wap = skinInfo.skin_json_wap;
        }
        return !!(skin_json_wap?.style == 3);
      },
      // 竖屏直播
      isPortraitLive() {
        return (
          this.$domainStore.state.roomBaseServer.watchInitData?.webinar?.webinar_show_type == 0
        );
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
        // 需要展示icon tab
        // console.log(data.cuid, 'data.cuid');
        if (!(this.isConcise || this.isPortraitLive)) {
          if (['comChatWap', 'comIntroWap'].includes(data.cuid)) {
            this.showIcon = true;
          } else {
            this.showIcon = false;
          }
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
      },
      openQa(questionnaireId) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitOpenQa', [questionnaireId])
        );
      },
      checkExamIcon(vo) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickExamIcon', [vo.examId, vo.type, vo.source])
        );
      },
      setExamVisible(vo) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitExamVisible', [vo.examVisible, vo.zIndexType])
        );
      }
    }
  };
</script>

<style lang="less">
  .vmp-container-right-wap {
    width: fit-content;
    .base-box {
      display: flex;
      flex-direction: column;
      position: absolute;
      display: inline-block;
      right: 24px;
      bottom: 108px;
      // width: 20px;
      .icon-wrap {
        margin-top: 24px;
        max-width: 60px;
        max-height: 60px;
        position: relative;
        background-color: transparent;
        img {
          width: 60px;
          height: 60px;
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
