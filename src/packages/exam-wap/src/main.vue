<template>
  <!-- 快问快答-答题-->
  <van-popup
    get-container="#otherPopupContainer"
    class="vmp-exam-answer-wap"
    v-model="examAnswerVisible"
    position="bottom"
    @close="closeDialog"
    v-if="examAnswerVisible"
  >
    <div :class="`exam-core__container exam-theme--${theme}`">
      <i class="vh-iconfont vh-line-close exam-close" @click="closeDialog"></i>
      <div id="examAnswerWap" v-show="isFill"></div>
      <div id="userFormWap" v-show="!isFill"></div>
    </div>
  </van-popup>
</template>
<script>
  import { useMsgServer, useChatServer, useZIndexServer, useExamServer } from 'middle-domain';
  export default {
    name: 'VmpExamWap',
    data() {
      const zIndexServerState = this.zIndexServer.state;
      return {
        zIndexServerState,
        examAnswerVisible: false, // 快问快答 - 答题
        examId: null
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
      isFill() {
        return this.examServer?.state?.userCheckVo?.isFill == 1;
      }
    },
    methods: {
      // 关闭 快问快答 - 答题
      closeDialog() {
        this.examAnswerVisible = false;
      },
      async open(examId) {
        this.examId = examId;
        this.ExamInstance = this.examServer.ExamInstance;
        // 答题前置检查
        await this.examServer.checkExam();
        this.examAnswerVisible = true;
        await this.$nextTick();
        this.zIndexServer.setDialogZIndex('exam');
        await this.$nextTick();
        if (this.examServer?.state?.userCheckVo?.is_fill == 1) {
          // 需要填写表单
          this.ExamInstance.mount({ id: examId, el: '#userFormWap', type: 'wap', props: {} });
        } else if (this.examServer?.state?.userCheckVo?.is_answer == 1) {
          // 已答题，查看个人成绩单结果（可以点击去查看答题结果）
        } else {
          // 未答题，直接答题
          this.examServer.mount({
            examId: 17 || examId,
            el: '#examAnswerWap',
            componentName: 'examwap',
            configs: {
              role: 2,
              pageSize: 1,
              answerType: 'release'
            }
          });
        }
      },
      setChatItemData(msg, eventType) {
        let text_content = {
          EXAM_PAPER_SEND: this.$t('exam.exam_1001'), // 推送-快问快答
          EXAM_PAPER_SEND_RANK: this.$t('exam.exam_1003'), // 公布-快问快答-成绩
          EXAM_PAPER_END: this.$t('exam.exam_1041'), // 快问快答-收卷
          EXAM_PAPER_AUTO_END: this.$t('exam.exam_1040'), // 快问快答-自动收卷
          EXAM_PAPER_AUTO_SEND_RANK: this.$t('exam.exam_1032') // 快问
        };
        return {
          nickname: msg.nick_name,
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            text_content: text_content[eventType],
            exam_id: msg.paper_id,
            exam_title: msg.paper_title || ''
          },
          roleName: msg.room_role,
          type: eventType,
          interactStatus: true,
          isCheck: true
        };
      },
      initEvent() {
        this.examServer.$on(this.examServer.EVENT_TYPE.EXAM_PAPER_SEND, async msg => {
          if (window.ExamTemplateServer) {
            // 初始化文件PaaS SDK, 使用了单例模式，多次执行不能影响
          }
          // TODO 快问快答 - 发起快问快答
          useChatServer().addChatToList(
            this.setChatItemData(msg, this.examServer.EVENT_TYPE.EXAM_PAPER_SEND)
          );
          //  触发自动弹出等
          this.open(msg.paper_id);
        });
        this.examServer.$on(this.examServer.EVENT_TYPE.EXAM_PAPER_SEND_RANK, async msg => {
          if (window.ExamTemplateServer) {
            // 初始化文件PaaS SDK, 使用了单例模式，多次执行不能影响
          }
          // TODO 快问快答 - 公布成绩
          useChatServer().addChatToList(
            this.setChatItemData(msg, this.examServer.EVENT_TYPE.EXAM_PAPER_SEND_RANK)
          );
        });
        this.examServer.$on(this.examServer.EVENT_TYPE.EXAM_PAPER_END, async msg => {
          if (window.ExamTemplateServer) {
            // 初始化文件PaaS SDK, 使用了单例模式，多次执行不能影响
          }
          // TODO 快问快答 - 收卷
          useChatServer().addChatToList(
            this.setChatItemData(msg, this.examServer.EVENT_TYPE.EXAM_PAPER_END)
          );
          // —— 收卷完成（如果正在答题，收卷后，查看列表数据。若大于0，展示列表数据；若不大于0，直接关闭弹窗。）
        });
        this.examServer.$on(this.examServer.EVENT_TYPE.EXAM_PAPER_AUTO_END, async msg => {
          if (window.ExamTemplateServer) {
            // 初始化文件PaaS SDK, 使用了单例模式，多次执行不能影响
          }
          // TODO 快问快答 - 自动收卷
          useChatServer().addChatToList(
            this.setChatItemData(msg, this.examServer.EVENT_TYPE.EXAM_PAPER_AUTO_END)
          );
          // —— 收卷完成（如果正在答题，收卷后，查看列表数据。若大于0，展示列表数据；若不大于0，直接关闭弹窗。）
        });
        this.examServer.$on(this.examServer.EVENT_TYPE.EXAM_PAPER_AUTO_SEND_RANK, async msg => {
          if (window.ExamTemplateServer) {
            // 初始化文件PaaS SDK, 使用了单例模式，多次执行不能影响
          } // TODO 快问快答 - 自动公布成绩
          useChatServer().addChatToList(
            this.setChatItemData(msg, this.examServer.EVENT_TYPE.EXAM_PAPER_AUTO_SEND_RANK)
          );
        });
        // 直播结束关闭弹窗
        this.msgServer.$on('live_over', () => {
          this.popupVisible = false;
        });
      }
    },
    beforeCreate() {
      this.zIndexServer = useZIndexServer();
      this.msgServer = useMsgServer();
      this.examServer = useExamServer();
    },
    created() {
      this.initEvent();
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
        top: 48px;
        font-size: 24px;
        z-index: 30;
        cursor: pointer;
      }
    }
    .exam-zdy-progress {
      &.van-progress {
        background: var(--theme-exam-progress-bgColor) !important;
        border-radius: 4px;
        .van-progress__portion {
          background: var(--theme-exam-progress-active-bgColor) !important;
          border-radius: 3px;
        }
      }
    }
    .vmp-exam-info--question {
      .zdy-exam-question-type {
        background: var(--theme-exam-question-type-bgColor) !important;
        color: var(--theme-exam-question-type-color) !important;
      }
    }
    .exam-execute-footer {
      button.van-button--danger {
        background: var(--theme-exam-next-button-bg) !important ;
        color: var(--theme-exam-next-button-color) !important ;
        border: 1px solid var(--theme-exam-next-button-border) !important;
        &:hover,
        &.active {
          background: var(--theme-exam-next-button-active-bg) !important ;
          color: var(--theme-exam-next-button-active-color) !important ;
          border: 1px solid var(--theme-exam-next-button-active-border) !important;
        }
      }
      button.van-button--default {
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
  }
</style>
