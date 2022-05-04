<template>
  <div class="vhall-question" v-if="dialogVisible">
    <div class="vhall-question-box" :style="{ zIndex: zIndexServerState.zIndexMap.questionnaire }">
      <div class="question-box">
        <div class="question-close" @click="dialogVisible = false">
          <i class="vh-iconfont vh-line-close"></i>
        </div>
        <div id="qs-preview-box" class="vhall-list-dialog-content">
          <div id="qs-preview-box-content" class="qs-preview-box-content cef-q-wrap"></div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import {
    useQuestionnaireServer,
    useChatServer,
    useZIndexServer,
    useMsgServer
  } from 'middle-domain';
  const QUESTIONNAIRE_PUSH = 'questionnaire_push'; // 推送消息
  export default {
    name: 'VmpQuestionnaireWatch',
    data() {
      const zIndexServerState = this.zIndexServer.state;
      return {
        zIndexServerState,
        dialogVisible: false,
        questionLastId: '', // 最后一个问卷id
        questionnaireId: '' // 问卷Id
      };
    },
    beforeCreate() {
      this.questionnaireServer = useQuestionnaireServer({ mode: 'watch' });
      this.zIndexServer = useZIndexServer();
      this.msgServer = useMsgServer();
    },
    created() {
      this.initEvent();
    },
    methods: {
      /**
       * @description 聊天/按钮打开文件
       */
      open(questionnaireId) {
        console.log('open', questionnaireId);
        this.questionnaireServer.checkAnswerStatus(questionnaireId).then(res => {
          if (res.data === false) {
            this.$message({
              message: this.$t('form.form_1037'),
              showClose: true,
              // duration: 0,
              type: 'success',
              customClass: 'zdy-info-box'
            });
          } else {
            this.dialogVisible = true;
            this.zIndexServer.setDialogZIndex('questionnaire');
            this.$nextTick(() => {
              this.questionnaireServer.renderQuestionnaire4Watch(
                '#qs-preview-box-content',
                questionnaireId
              );
            }); // 等dom渲染
          }
        });
      },
      initEvent() {
        this.questionnaireServer.$on(QUESTIONNAIRE_PUSH, async msg => {
          useChatServer().addChatToList({
            nickname: msg.nick_name,
            avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
            content: {
              text_content: this.$t('chat.chat_1030'),
              questionnaire_id: msg.questionnaire_id
            },
            roleName: msg.room_role,
            type: msg.type,
            interactStatus: true,
            isCheck: true
          });
          const { data: canAnswer } = await this.questionnaireServer.checkAnswerStatus(
            msg.questionnaire_id
          );
          if (canAnswer !== true) {
            this.questionnaireServer.setDotVisible(false);
            return false;
          }
          this.dialogVisible = true;
          this.zIndexServer.setDialogZIndex('questionnaire');
          this.questionnaireServer.setDotVisible(true);
          await this.$nextTick(); // 等dom渲染
          this.questionnaireServer.renderQuestionnaire4Watch(
            '#qs-preview-box-content',
            msg.questionnaire_id
          );
        });
        this.questionnaireServer.$on(VHall_Questionnaire_Const.EVENT.SUBMIT, res => {
          if (res.code === 200) {
            this.dialogVisible = false;
          } else {
            this.$message({
              message: this.$t('register.register_1004'),
              showClose: true,
              type: 'error',
              customClass: 'zdy-info-box'
            });
          }
        });
        // 直播结束关闭弹窗
        this.msgServer.$on('live_over', () => {
          this.dialogVisible = false;
        });
      }
    }
  };
</script>
<style lang="less">
  .vhall-question-box {
    width: 100%;
    height: 100%;
    position: fixed;
    top: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    .question-box {
      float: left;
      left: 0;
      width: 720px;
      height: 540px;
      border-radius: 4px;
      background: #fff;
      overflow: hidden;
      // margin: 0 auto;
      position: relative;
      padding-bottom: 8px;
      z-index: 100;
    }
    .question-close {
      position: absolute;
      top: 10px;
      right: 10px;
      width: 24px;
      height: 24px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 28px;
      color: #fff;
      font-size: 12px;
      text-align: center;
      line-height: 24px;
      cursor: pointer;
    }
    .vhall-list-dialog-content {
      height: 100%;
      ::-webkit-scrollbar {
        width: 5px;
        border-radius: 10px;
      }
    }
  }
  .el-loading-spinner .path {
    stroke: #fb3a32;
  }
  .el-loading-spinner .el-loading-text {
    color: #1a1a1a;
  }
  .vhall-question {
    &-icon {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      position: relative;
      margin-left: 16px;
      .circle {
        position: absolute;
        top: -2px;
        right: -2px;
        display: inline-block;
        width: 7px;
        height: 7px;
        border: 1px solid #2a2a2a;
        background: #fb3a32;
        border-radius: 50%;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: scale-down;
      }
    }
  }
  .qs-preview-box-content {
    height: 100%;
    overflow-y: scroll;
    line-height: initial;
  }
</style>
