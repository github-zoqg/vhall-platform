<template>
  <div
    class="vmp-interact-menu"
    :class="[className, disable ? 'disable' : '']"
    :style="{ display: hidden ? 'none' : 'flex' }"
  >
    <div class="vmp-interact-menu-icon">
      <i class="vh-saas-iconfont vh-saas-a-line-Interactivetools"></i>
      <p>互动工具</p>
    </div>
    <div class="vmp-interact-menu-wrap" v-if="!disable">
      <div class="vmp-interact-menu-list">
        <div
          class="vmp-interact-menu-list-item"
          @click="openLottery"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
          v-if="configList['ui.hide_lottery']"
        >
          <i class="vh-iconfont vh-a-line-luckydraw"></i>
          <p>抽奖</p>
        </div>
        <div
          class="vmp-interact-menu-list-item"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
          @click="openSign"
          v-if="configList['ui.hide_sign_in']"
        >
          <i class="vh-iconfont vh-line-order"></i>
          <p>签到</p>
        </div>
        <div
          class="vmp-interact-menu-list-item"
          @click="emitOpenQuestionnaire"
          v-if="configList['ui.hide_survey']"
        >
          <i class="vh-iconfont vh-line-questionnaire"></i>
          <p>问卷</p>
        </div>
        <div class="vmp-interact-menu-list-item" @click="emitOpenExam" v-if="configList['exam']">
          <i class="vh-iconfont vh-a-line-Sentaanswer"></i>
          <p>快问快答</p>
        </div>
        <div
          class="vmp-interact-menu-list-item"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
          @click="handleQAPopup"
          v-if="configList['ui.is_hide_qa_button']"
        >
          <i class="vh-iconfont vh-a-line-qanda"></i>
          <p>问答</p>
        </div>
        <!-- 支付牌照问题 -->
        <div
          class="vmp-interact-menu-list-item"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
          @click="openRedPacket"
          v-if="configList['ui.show_redpacket']"
        >
          <i class="vh-iconfont vh-a-line-redpacket"></i>
          <p>红包</p>
          <!-- <vmp-air-container cuid="" :oneself="true"></vmp-air-container> -->
        </div>
        <div
          class="vmp-interact-menu-list-item"
          @click="openTimer"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving }"
          v-if="configList['webinar.timer']"
        >
          <i class="vh-iconfont vh-line-time"></i>
          <p>计时器</p>
        </div>
        <div
          class="vmp-interact-menu-list-item"
          :class="{ 'vmp-interact-menu-list-disable': !isLiving || isThirdStream }"
          @click="openRebroadcast"
          v-if="!isNoDelay && configList['rebroadcast']"
        >
          <i class="vh-saas-iconfont vh-saas-a-color-Playbackmanagement"></i>
          <p>转播</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { debounce } from 'lodash';
  import { useQaServer, useRoomBaseServer, useMsgServer } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  export default {
    name: 'VmpInteractMenu',
    data() {
      return {
        living: false,
        className: '', // 自定义样式
        kind: '', // 类型
        disable: false, // 是否禁用
        hidden: false, // 是否隐藏
        disTimer: false
      };
    },
    computed: {
      //互动工具状态
      interactToolStatus() {
        const { interactToolStatus = {} } = this.$domainStore.state.roomBaseServer;
        return interactToolStatus;
      },
      isLiving() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1;
      },
      // 是否为第三方发起
      isThirdStream() {
        return this.$domainStore.state.roomBaseServer.isThirdStream;
      },
      // 无延迟 Type:Boolean
      isNoDelay() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.no_delay_webinar === 1;
      },
      configList() {
        let configList = this.$domainStore.state.roomBaseServer.configList;
        return configList;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
    },
    mounted() {
      this.QAName = this.interactToolStatus.question_name;
      this.listenEvents();
    },
    methods: {
      listenEvents() {
        const msgServer = useMsgServer();
        const qaServer = useQaServer();
        msgServer.$on('live_over', () => {
          this.isQAEnabled = false;
          this.qaVisible = false;
        });
        qaServer.$on(qaServer.Events.QA_OPEN, msg => {
          this.isQAEnabled = true;
        });
        qaServer.$on(qaServer.Events.QA_CLOSE, msg => {
          this.isQAEnabled = false;
        });
        qaServer.$on(qaServer.Events.QA_SET, msg => {
          this.QAName = msg.name;
        });
      },
      // 设置可用状态
      setDisableState(val) {
        this.disable = val;
      },
      // 设置显示隐藏状态
      setHiddenState(val) {
        this.hidden = val;
      },
      // 打开计时器设置弹框
      openTimer() {
        if (this.disTimer || !this.isLiving) return false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenTimerSet'));
      },
      //  打开转播
      openRebroadcast() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenRebroadcast'));
      },
      // 更改禁用状态
      changeStatus(data, status) {
        // console.log(data, status, 'data, status');
        this[data] = status;
      },
      // 打开抽奖弹窗
      openLottery() {
        if (!this.isLiving) return false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenLottery'));
      },
      // 打开问卷弹窗
      emitOpenQuestionnaire() {
        window.vhallReportForProduct && window.vhallReportForProduct.report(110060);
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenQuestionnaire'));
      },
      // 打开快问快答弹窗
      emitOpenExam() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenExam'));
      },
      // 打开签到弹窗
      openSign() {
        if (!this.isLiving) return false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenSign'));
      },
      // 打开红包弹窗
      // TODO:支付牌照问题
      openRedPacket() {
        console.log('点击红包');
        if (!this.isLiving) return false;
        // this.$message.warning('合规自查中，该功能暂不支持使用');
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenRedPacket'));
      },
      handleQAPopup() {
        if (!this.isLiving) return false;
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitHandleQA'));
      }
    }
  };
</script>
<style lang="less">
  .vmp-interact-menu {
    position: relative;
    justify-content: center;

    &-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: 12px;
      padding: 10px 0px;
      cursor: pointer;
      color: #ececec;
      i {
        user-select: none;
        display: block;
        width: 23px;
        height: 23px;
        margin: 0 auto;
        padding-bottom: 6px;
        font-size: 22px;
      }
      p {
        font-size: 12px;
      }
      &:hover {
        color: #fb3a32;
      }
    }
    &:hover {
      .vmp-interact-menu-wrap {
        display: block;
      }
    }
    &.disable {
      cursor: default;
      i,
      p {
        color: #777777;
      }
      .vmp-interact-menu {
        &-icon {
          cursor: default;
        }
      }

      &:hover {
        .vmp-interact-menu-wrap {
          display: none;
        }
      }
    }

    &-wrap {
      display: none;
      position: absolute;
      left: 58px;
      top: 0;
      width: 182px;
      background: #434343;
      z-index: 2;
      border-radius: 4px;
      box-sizing: border-box;
      border: 1px solid #2d2d2d;
      padding: 0 10px 20px 10px;
      z-index: 110;
    }
    &-list {
      display: flex;
      flex-wrap: wrap;
      &-item {
        flex-shrink: 0;
        width: 52px;
        margin-top: 20px;
        font-size: 12px;
        color: #ececec;
        text-align: center;
        cursor: pointer;
        i {
          display: block;
          margin: 0 auto;
          font-size: 16px;
          padding-bottom: 4px;
        }
        &:hover {
          color: #fb3a32;
        }
      }
      &-disable {
        pointer-events: none; // 不可点击
        i,
        p {
          color: #777777;
        }
        pointer-events: none;
      }
    }
  }
  .qa_modal {
    .el-dialog__body {
      min-height: 80px;
    }
    .qa_content {
      .qa_content_txt {
        padding-bottom: 10px;
        font-weight: 400;
        font-size: 14px;
        line-height: 20px;
        text-align: justify;
        color: #666666;
      }
      .qa_content_form {
        padding-top: 6px;
        .el-form-item__label {
          color: #1a1a1a;
        }
      }
      .qa_name_item {
        margin: 0;
        .qa_name {
          width: 266px;
        }
      }
    }
    .el-dialog__footer {
      padding-top: 0;
    }
    .enable_qa_btn {
      text-align: right;
    }
  }
</style>
