<template>
  <div class="vmp-container-right-fullscreen-wap" v-if="!isInGroup">
    <div class="base-box" v-show="showIcon">
      <!-- 快问快答 -->
      <exam-icon
        :icon-style="iconStyle"
        class="icon-wrap icon-wrap__exam"
        @clickIcon="checkExamIcon"
        @setVisible="setExamVisible"
      >
        <span class="icon-name">{{ $t('exam.exam_1047') }}</span>
      </exam-icon>
      <!-- 问卷 -->
      <questionnaire-icon
        :icon-style="iconStyle"
        class="icon-wrap"
        @clickIcon="checkQuestionnaireIcon"
        @openQa="openQa"
      >
        <span class="icon-name">{{ $t('form.form_1074') }}</span>
      </questionnaire-icon>
      <!-- 签到 -->
      <div class="icon-wrap" @click="handleSign" v-show="showSign && webinarType == 1">
        <img v-if="iconStyle == 1" src="../../common/image/icon.png" />
        <img v-else src="../../common/image/icon2.png" />
        <span class="icon-name">{{ $t('interact_tools.interact_tools_1024') }}</span>
      </div>
      <!-- 抽奖 -->
      <lottery-icon
        :icon-style="iconStyle"
        v-if="webinarType == 1 || webinarType == 3"
        class="icon-wrap"
        @clickIcon="checkLotteryIcon"
      >
        <span class="icon-name">{{ $t('interact_tools.interact_tools_1003') }}</span>
      </lottery-icon>
      <!-- 红包 -->
      <red-packet-icon
        :icon-style="iconStyle"
        class="icon-wrap"
        v-if="!isEmbed && webinarType == 1"
        @clickIcon="handleRedPacket"
      >
        <span class="icon-name">{{ $t('interact_tools.interact_tools_1098') }}</span>
      </red-packet-icon>
      <!-- 计时器 -->
      <div class="icon-wrap" @click="handleTimer" v-show="showTimer && webinarType == 1">
        <template v-if="iconStyle == 1">
          <img src="../../common/image/timer.png" v-if="timerVisible" />
          <img src="../../common/image/timer_no.png" v-else />
        </template>
        <template v-else>
          <img src="../../common/image/timer2.png" v-if="timerVisible" />
          <img src="../../common/image/timer_no2.png" v-else />
        </template>

        <span class="icon-name">{{ $t('interact_tools.interact_tools_1099') }}</span>
      </div>
      <!-- 公告列表 -->
      <noticeList :icon-style="iconStyle" class="icon-wrap">
        <span class="icon-name">{{ $t('interact_tools.interact_tools_1086') }}</span>
      </noticeList>
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
        console.log(vo);
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
  .vmp-container-right-fullscreen-wap {
    width: fit-content;
    padding-top: 16px;
    .base-box {
      display: flex;
      margin-left: 8px;
      .icon-wrap {
        width: 72px;
        height: 72px;
        &.icon-wrap__exam {
          width: 96px;
        }
        background: rgba(0, 0, 0, 0.3);
        position: relative;
        border-radius: 16px;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 16px;
        text-align: center;
        img {
          width: 60px;
          height: 60px;
        }
        .icon-name {
          position: absolute;
          width: 100%;
          height: 22px;
          left: 0px;
          bottom: 0px;
          background: rgba(0, 0, 0, 0.45);
          border-radius: 0px 0px 16px 16px;
          font-family: 'PingFang SC';
          font-style: normal;
          font-weight: 400;
          font-size: 14px;
          line-height: 20px;
          color: #ffffff;
          text-align: center;
          // line-height: 22px;
          text-shadow: 0px 1px 2px rgba(118, 0, 0, 0.1);
        }
      }
      .icon-wrap-notice {
        margin-top: 0;
      }
    }
    .vmp-question-wap {
      height: calc(100% - 422px);
      bottom: 0;
      top: auto;
    }
    /** 快问快答 - 答题高度 */
    .exam_base {
      height: calc(100% - 422px);
      max-height: calc(100% - 422px);
      bottom: 0;
      top: auto;
      .vmp-exam-list_container {
        max-height: 100%;
        .container-data {
          max-height: calc(100% - 210px);
        }
      }
    }
    /** 快问快答 - 排行榜高度 */
    .vmp-exam-answer-wap {
      height: calc(100% - 422px);
      bottom: 0;
      top: auto;
    }
    /** 快问快答 - 列表高度 */
    .vmp-exam-rank-wap {
      height: calc(100% - 422px);
      bottom: 0;
      top: auto;
    }
  }
</style>
