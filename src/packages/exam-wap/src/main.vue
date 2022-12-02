<template>
  <!-- 快问快答-答题-->
  <van-popup
    get-container="#otherPopupContainer"
    class="vmp-exam-answer-wap"
    v-model="examAnswerVisible"
    position="bottom"
    @close="closeDialog"
    v-if="examAnswerVisible"
    overlay-class="vmp-exam-answer-popup-overlay"
    :overlay-style="{ zIndex: zIndexServerState.zIndexMap.examAnser }"
    :style="{ zIndex: zIndexServerState.zIndexMap.examAnser }"
  >
    <div :class="`exam-core__container exam-theme--${theme}`">
      <i class="vh-iconfont vh-line-close exam-close" @click="closeDialog"></i>
      <div id="examAnswerWap"></div>
    </div>
  </van-popup>
</template>
<script>
  import {
    useMsgServer,
    useUserServer,
    useZIndexServer,
    useExamServer,
    useRoomBaseServer
  } from 'middle-domain';
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import languages from '@/app-shared/i18n/languages';
  export default {
    name: 'VmpExamWap',
    data() {
      const examWatchState = this.examServer.state;
      const zIndexServerState = this.zIndexServer.state;
      return {
        examWatchState,
        zIndexServerState,
        examAnswerVisible: false, // 快问快答 - 答题
        examId: null,
        defaultAvatar
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      theme() {
        const themeMap = {
          1: 'black',
          2: 'white',
          3: 'red',
          4: 'golden',
          5: 'blue'
        };
        let skinInfo = this.$domainStore.state.roomBaseServer.skinInfo;
        let skin_json_wap = {};
        if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
          skin_json_wap = skinInfo.skin_json_wap;
        }
        return themeMap[skin_json_wap?.backGroundColor || 3];
      },
      examWatchResult() {
        return this.examServer.state.examWatchResult;
      },
      // 获取用户信息
      userInfo() {
        return this.$domainStore.state.userServer.userInfo;
      },
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info;
      }
    },
    watch: {
      // 打开快问快答-答题弹窗(全屏,视频需要改为小窗)
      examAnswerVisible(val) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitExamVisible', [!!val, 'examAnswer'])
        );
      },
      // :overlay-style="{ zIndex: zIndexServerState.zIndexMap.examAnser }"
      // 无法动态更改zIndex
      'zIndexServerState.zIndexMap.examAnswer': {
        handler(val) {
          if (document.querySelector('.vmp-exam-answer-popup-overlay')) {
            this.$nextTick(() => {
              document.querySelector('.vmp-exam-answer-popup-overlay').style.zIndex = val;
            });
          }
        }
      }
    },
    methods: {
      // 关闭 快问快答 - 答题
      closeDialog() {
        this.examAnswerVisible = false;
      },
      async open(examId, answerType, source = 'default') {
        console.log('当时数据变化进入', source, answerType, examId);
        this.closeDialog();
        // 每次点开的时候，都先关闭一下弹窗
        this.examId = examId;
        /**
           * 验证作用：
            1、用户未作答，答题过程中，正常作答。
            1-1、若开启了限时答题，倒计时-已过期，toast提示“很遗憾，您已错过本次答题机会！”
            1-2、若人工收卷了，用户未作答，toast提示“很遗憾，您已错过本次答题机会！”
            2、不论是否限时，用户已作答，答题过程中，查看个人成绩。
            如果答题过程中，问卷已经作答，收卷后，点击聊天区域，应该展示成绩。
           */
        await this.examServer.getExamPublishList({});
        let examItem = this.examWatchResult?.list?.find(item => {
          if (item.paper_id == examId) return item;
        });
        if (examItem && examItem.is_end == 1 && examItem.status == 0) {
          // 已结束 && 未作答
          this.$toast(this.$t('exam.exam_1010'));
        } else if (examItem && examItem.status == 1) {
          // 已作答
          this.viewExamDom(examId, 'show', source != 'event');
        } else if (examItem && examItem.is_end == 0 && examItem.status == 0) {
          // 可作答
          this.viewExamDom(examId, 'answer');
        }
      },
      async viewExamDom(examId, answerType, allowShow = true) {
        if (localStorage.getItem('token')) {
          await this.userServer.getUserInfo({ scene_id: 2 });
        }
        console.log('当前进入的流程', examId, answerType, allowShow);
        if (!allowShow) return; // 如果不允许弹出，不弹出（比如推送的快问快答消息后，已经做过答案情况）
        this.examAnswerVisible = true;
        this.zIndexServer.setDialogZIndex('examAnser');
        const roomBaseState = useRoomBaseServer().state;
        console.log('展示弹窗。。。。');
        this.$nextTick(() => {
          // 未答题，直接答题(answerType == 'answer);已答题，查看个人成绩单结果（可以点击去查看答题结果）(answerType == 'score');
          this.examServer.mount({
            examId: examId,
            el: '#examAnswerWap',
            componentName: 'examwap',
            lang: roomBaseState?.languages?.lang?.type || 'zh',
            configs: {
              role: 2,
              pageSize: 1,
              answerType: answerType == 'answer' ? 1 : 2,
              userName: this.userInfo?.nick_name || this.joinInfo?.nickname || '',
              headImg: this.userInfo?.avatar || this.joinInfo?.avatar || '',
              mobile: this.userInfo?.phone || this.joinInfo?.phone || ''
            }
          });
          this.examServer.examInstance.$on(
            this.examServer.examInstance.events['SUBMITANSWER'],
            this.changeDotVisible
          );
        });
      },
      changeDotVisible() {
        this.examServer.getExamPublishList({});
      },
      listenExamWatchMsg(msg, that) {
        if (window.ExamTemplateServer) {
          // 初始化文件PaaS SDK, 使用了单例模式，多次执行不能影响
        }
        if (msg.data.type == that.examServer.EVENT_TYPE.EXAM_PAPER_END) {
          // TODO 快问快答 - 收卷
          // —— 收卷完成（如果正在答题，收卷后，查看列表数据。若大于0，展示列表数据；若不大于0，直接关闭弹窗。）
          this.closeDialog();
        } else if (msg.data.type == that.examServer.EVENT_TYPE.EXAM_PAPER_AUTO_END) {
          // TODO 快问快答 - 自动收卷
          this.closeDialog();
        } else if (msg.data.type == 'live_over') {
          // 结束直播
          this.closeDialog();
        }
      },
      initExamEvents() {
        // 监听快问快答消息
        let that = this;
        this.msgServer.$onMsg('ROOM_MSG', msg => {
          this.listenExamWatchMsg(msg, that);
        });
      }
    },
    beforeCreate() {
      this.zIndexServer = useZIndexServer();
      this.examServer = useExamServer();
      this.msgServer = useMsgServer();
      this.userServer = useUserServer();
    },
    created() {
      this.initExamEvents();
    },
    beforeDestroy() {
      this.examServer?.examInstance?.$off(this.examServer?.examInstance?.events['SUBMITANSWER']);
    }
  };
</script>
<style lang="less">
  .vmp-exam-answer-wap {
    width: 100%;
    height: 844px;
    background: url('../images/bg_default.png') no-repeat;
    box-shadow: 0px -4px 16px rgba(0, 0, 0, 0.25);
    border-radius: 40px 40px 0px 0px;
    overflow: hidden;
    background-color: #ffffff;
    background-position: top;
    background-size: cover;
    .exam-execute-body {
      height: calc(844px - 100px) !important;
      max-height: calc(844px - 100px) !important;
    }
    .exam-core__container {
      width: 100%;
      margin: 0 auto;
      overflow: hidden;
      position: relative;
      // 统一定位close
      .exam-close {
        position: absolute;
        right: 32px;
        top: 42px;
        font-size: 24px;
        z-index: 30;
        cursor: pointer;
      }
    }
    .vh-progress-bar__outer {
      background: var(--theme-exam-progress-bgColor) !important;
      border-radius: 4px;
      .vh-progress-bar__inner {
        background: var(--theme-exam-progress-active-bgColor) !important;
        border-radius: 3px;
      }
    }
    .vmp-exam-info--question {
      .zdy-exam-question-type {
        background: var(--theme-exam-question-type-bgColor) !important;
        color: var(--theme-exam-question-type-color) !important;
      }
    }
    .exam-execute-footer {
      button.vh-button--danger {
        border: 1px solid var(--theme-more-status-button-border);
        background: var(--theme-more-status-button-bg);
        color: var(--theme-more-status-button-color);
        &:hover {
          background: var(--theme-more-status-button-hover-bg);
          border: 1px solid var(--theme-more-status-button-hover-border);
          color: var(--theme-more-status-button-hover-color);
        }
        &:active {
          background: var(--theme-more-status-button-active-bg);
          border: 1px solid var(--theme-more-status-button-active-border);
          color: var(--theme-more-status-button-active-color);
        }
        &.is-disabled {
          background: var(--theme-more-status-button-disabled-bg) !important;
          border: 1px solid var(--theme-more-status-button-disabled-border) !important;
          color: var(--theme-more-status-button-disabled-color) !important;
        }
      }
      button.vh-button--info {
        background: var(--theme-exam-last-button-bg) !important ;
        color: var(--theme-exam-last-button-color) !important ;
        border: 1px solid var(--theme-exam-last-button-border) !important;
        &:hover,
        &.active {
          background: var(--theme-exam-last-button-active-bg) !important ;
          color: var(--theme-exam-last-button-active-color) !important ;
          border: 1px solid var(--theme-exam-last-button-active-border) !important;
        }
      }
    }
    .vmp-transcripts {
      button.vh-button--primary {
        border: 1px solid var(--theme-more-status-button-border);
        background: var(--theme-more-status-button-bg);
        color: var(--theme-more-status-button-color);
        &:hover {
          background: var(--theme-more-status-button-hover-bg);
          border: 1px solid var(--theme-more-status-button-hover-border);
          color: var(--theme-more-status-button-hover-color);
        }
        &:active {
          background: var(--theme-more-status-button-active-bg);
          border: 1px solid var(--theme-more-status-button-active-border);
          color: var(--theme-more-status-button-active-color);
        }
        &.is-disabled {
          background: var(--theme-more-status-button-disabled-bg) !important;
          border: 1px solid var(--theme-more-status-button-disabled-border) !important;
          color: var(--theme-more-status-button-disabled-color) !important;
        }
      }
    }
  }
</style>
