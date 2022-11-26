<template>
  <!-- 快问快答-pc答题-->
  <vh-dialog
    title=""
    :visible.sync="examAnswerVisible"
    width="380px"
    custom-class="vmp-exam-answer"
    :close-on-click-modal="false"
    :show-close="false"
    :z-index="20"
  >
    <div :class="`exam-core__container exam-theme--${theme}`">
      <i class="vh-iconfont vh-line-close exam-close" @click="closeDialog"></i>
      <div id="examAnswer" v-show="isFill"></div>
      <div id="userForm" v-show="!isFill"></div>
    </div>
  </vh-dialog>
</template>
<script>
  import { useMsgServer, useUserServer, useExamServer } from 'middle-domain';
  import { defaultAvatar } from '@/app-shared/utils/ossImgConfig';
  export default {
    name: 'VmpExamPc',
    data() {
      const examWatchState = this.examServer.state;
      return {
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
      isFill() {
        return this.examServer?.state?.userCheckVo?.isFill == 1;
      },
      examWatchResult() {
        return this.examServer.state.examWatchResult;
      },
      // 获取用户信息
      userInfo() {
        return this.$domainStore.state.userServer.userInfo;
      }
    },
    methods: {
      // 关闭 快问快答 - 答题
      closeDialog() {
        this.examAnswerVisible = false;
      },
      async open(examId, answerType) {
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
          this.$message.info(this.$t('exam.exam_1010'));
        } else if (examItem && examItem.status == 1) {
          // 已作答
          this.viewExamDom(examId, 'show');
        } else if (examItem && examItem.is_end == 0 && examItem.status == 0) {
          // 可作答
          this.viewExamDom(examId, 'answer');
        }
      },
      async viewExamDom(examId, answerType) {
        if (localStorage.getItem('token')) {
          await this.userServer.getUserInfo({ scene_id: 2 });
        }
        this.examAnswerVisible = true;
        this.$nextTick(() => {
          // 未答题，直接答题(answerType == 'answer);已答题，查看个人成绩单结果（可以点击去查看答题结果）(answerType == 'score');
          this.examServer.mount({
            examId: examId,
            el: '#examAnswer',
            componentName: 'exampc',
            configs: {
              role: 2,
              pageSize: 1,
              answerType: answerType == 'answer' ? 1 : 2,
              userName: this.userInfo?.nick_name || '',
              headImg: this.userInfo?.avatar || defaultAvatar,
              mobile: this.userInfo?.phone || ''
            }
          });
        });
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
      this.examServer = useExamServer();
      this.msgServer = useMsgServer();
      this.userServer = useUserServer();
    },
    created() {
      this.initExamEvents();
    }
  };
</script>
<style lang="less">
  .vh-dialog.vmp-exam-answer {
    overflow: auto;
    .vh-dialog__header {
      padding: 0 0;
    }
    .vh-dialog__body {
      height: 100%;
      overflow: auto;
      padding: 0 0;
    }
    height: 460px;
    background: url('../images/bg_default.png') no-repeat;
    border-radius: 12px;
    overflow: hidden;
    background-color: #ffffff;
    background-position: top;
    background-size: cover;
    // 重置内部元素
    .exam-execute-body {
      height: calc(460px - 72px) !important;
      max-height: calc(460px - 72px) !important;
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
        top: 22px;
        font-size: 12px;
        z-index: 30;
        cursor: pointer;
      }
    }
    .exam-zdy-progress {
      &.el-progress {
        background: var(--theme-exam-progress-bgColor) !important;
        border-radius: 4px;
        .el-progress__portion {
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
    // .exam-execute-footer {
    //   button.el-button--primary {
    //     background: var(--theme-exam-next-button-bg) !important ;
    //     color: var(--theme-exam-next-button-color) !important ;
    //     border: 1px solid var(--theme-exam-next-button-border) !important;
    //     &:hover,
    //     &.active {
    //       background: var(--theme-exam-next-button-active-bg) !important ;
    //       color: var(--theme-exam-next-button-active-color) !important ;
    //       border: 1px solid var(--theme-exam-next-button-active-border) !important;
    //     }
    //   }
    //   button.el-button--default {
    //     background: var(--theme-exam-last-button-bg) !important ;
    //     color: var(--theme-exam-last-button-color) !important ;
    //     border: 1px solid var(--theme-exam-last-button-border) !important;
    //     &:hover,
    //     &.active {
    //       background: var(--theme-exam-last-button-active-bg) !important ;
    //       color: var(--theme-exam-last-button-active-color) !important ;
    //       border: 1px solid var(--theme-exam-last-button-active-border) !important;
    //     }
    //   }
    // }
  }
</style>
