<template>
  <!-- 快问快答-pc答题-->
  <vh-dialog
    title=""
    :visible.sync="examAnswerVisible"
    width="380px"
    custom-class="vmp-exam-answer"
    :close-on-click-modal="true"
    :show-close="false"
    v-if="examAnswerVisible"
    draggable
    :modal="false"
    :part-block="true"
    :z-index="zIndexServerState.zIndexMap.examAnswer"
  >
    <span slot="title" class="dialog-header take--place">&nbsp;</span>
    <div :class="`exam-core__container exam-theme--${theme}`">
      <i class="vh-iconfont vh-line-close exam-close" @click="closeDialog"></i>
      <div id="examAnswer"></div>
    </div>
  </vh-dialog>
</template>
<script>
  import {
    useZIndexServer,
    useMsgServer,
    useUserServer,
    useExamServer,
    useRoomBaseServer
  } from 'middle-domain';
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';
  export default {
    name: 'VmpExamPc',
    data() {
      const examWatchState = this.examServer.state;
      const zIndexServerState = this.zIndexServer.state;
      return {
        zIndexServerState,
        examWatchState,
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
      },
      // 是否改变聊天区-昵称/头像(若开启报名表单 或 开启白名单情况下，不改变聊天区等昵称/头像)
      noChangeChatUserInfo() {
        const webinarInfo = this.$domainStore.state.roomBaseServer.watchInitData.webinar;
        // reg_form 是否开启报名表单
        // verify 验证类别，0 无验证，1 密码，2 白名单，3 付费活动, 4 F码, 6 F码+付费
        return (webinarInfo.verify == 5 && webinarInfo.reg_form == 1) || webinarInfo.verify == 2;
      }
    },
    methods: {
      // 关闭 快问快答 - 答题
      closeDialog() {
        this.examAnswerVisible = false;
      },
      async open(examId, answerType, source = 'default') {
        // 每次打开之前，都先关闭一下
        this.closeDialog();
        console.log('answerType', answerType);
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
          this.$message.warning(this.$t('exam.exam_1010'));
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
        if (!allowShow) return; // 如果不允许弹出，不弹出（比如推送的快问快答，已经做过答案情况）
        this.zIndexServer.setDialogZIndex('examAnswer');
        this.examAnswerVisible = true;
        const roomBaseState = useRoomBaseServer().state;
        this.$nextTick(() => {
          // 未答题，直接答题(answerType == 'answer);已答题，查看个人成绩单结果（可以点击去查看答题结果）(answerType == 'score');
          let userInfo = {
            userName: this.userInfo?.nick_name || this.joinInfo?.nickname || '',
            headImg: this.userInfo?.avatar || this.joinInfo?.avatar || '',
            mobile: this.userInfo?.phone || this.joinInfo?.phone || ''
          };
          if (this.noChangeChatUserInfo) {
            // 白名单 和 报名表单用户，使用joinInfo表里的参会信息
            userInfo = {
              userName: this.joinInfo?.nickname || '',
              headImg: this.joinInfo?.avatar || '',
              mobile: this.joinInfo?.phone || ''
            };
          }
          this.examServer.mount({
            examId: examId,
            el: '#examAnswer',
            componentName: 'exampc',
            lang: roomBaseState?.languages?.lang?.type || 'zh',
            configs: {
              role: 2,
              pageSize: 1,
              answerType: answerType == 'answer' ? 1 : 2,
              ...userInfo
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
      this.userServer = useUserServer();
      this.examServer = useExamServer();
      this.msgServer = useMsgServer();
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
  .vh-dialog.vmp-exam-answer {
    overflow: auto;
    .vh-dialog__header {
      padding: 0 0;
      height: 24px;
      .take--place {
        height: 16px;
      }
    }
    .vh-dialog__body {
      height: calc(100% - 24px);
      overflow: auto;
      padding: 0 0;
    }
    // height: 460px;
    min-height: 287px;
    background: url('../images/bg_default.png') no-repeat;
    border-radius: 12px;
    overflow: hidden;
    background-color: #ffffff;
    background-position: top;
    background-size: cover;
    // 重置内部元素
    .exam-execute-body {
      height: calc(460px - 145px) !important;
      max-height: calc(460px - 145px) !important;
      margin-right: 2px;
    }
    .exam-core__container {
      width: 100%;
      height: 100%;
      margin: 0 auto;
      overflow: hidden;
      position: relative;
      // 统一定位close
      .exam-close {
        position: absolute;
        right: 32px;
        top: 6px;
        font-size: 12px;
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
      // button.vh-button--info {
      //   background: var(--theme-exam-last-button-bg) !important ;
      //   color: var(--theme-exam-last-button-color) !important ;
      //   border: 1px solid var(--theme-exam-last-button-border) !important;
      //   &:hover,
      //   &.active {
      //     background: var(--theme-exam-last-button-active-bg) !important ;
      //     color: var(--theme-exam-last-button-active-color) !important ;
      //     border: 1px solid var(--theme-exam-last-button-active-border) !important;
      //   }
      // }
    }

    .vmp-transcripts {
      button.vh-button--primary {
        margin: 24px auto;
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
      &.vmp-transcripts-other {
        // 百分比 or 正确率
        height: 409px;
        padding-top: 27px;
        button.vh-button--primary {
          margin: 57px auto 64px auto;
        }
      }
      &.vmp-transcripts-extreme {
        // 满分 or 0分
        button.vh-button--primary {
          margin: 24px auto 24px auto;
        }
        .trophy-wrap {
          margin-top: 30px;
        }
      }
    }
  }
</style>
