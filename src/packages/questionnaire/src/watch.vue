<template>
  <div class="vmp-questionnaire-watch" v-if="dialogVisible">
    <div class="vhall-question-box" :style="{ zIndex: zIndexServerState.zIndexMap.questionnaire }">
      <div class="question-box">
        <div class="question-close" @click="dialogVisible = false">
          <i class="vh-iconfont vh-line-close"></i>
        </div>
        <div id="qs-preview-box-content" class="qs-preview-box-content cef-q-wrap"></div>
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
    computed: {
      isEmbed() {
        // 是不是嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
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
        if (!window.VHall_Questionnaire_Service) {
          this.$message({
            type: 'warning',
            message: '问卷SDK未加载，功能暂不支持'
          });
          return;
        }
        // 初始化文件PaaS SDK, 使用了单例模式，多次执行不能影响
        this.questionnaireServer.init({ mode: 'watch', showVhPrivacy: !this.isEmbed });
        this.questionnaireServer.checkAnswerStatus(questionnaireId).then(res => {
          if (res.data === false) {
            this.$message({
              message: this.$t('form.form_1087'),
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
        this.questionnaireServer.$on(
          this.questionnaireServer.EVENT_TYPE.QUESTIONNAIRE_PUSH,
          async msg => {
            if (window.VHall_Questionnaire_Service) {
              // 初始化文件PaaS SDK, 使用了单例模式，多次执行不能影响
              this.questionnaireServer.init({ mode: 'watch', showVhPrivacy: !this.isEmbed });
            }
            useChatServer().addChatToList({
              nickname: msg.nick_name,
              avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
              content: {
                text_content:
                  msg.alias && msg.alias != '问卷'
                    ? `${this.$t('chat.chat_1099')} ${msg.alias}`
                    : this.$t('chat.chat_1030'),
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
          }
        );
        this.questionnaireServer.$on(
          this.questionnaireServer.EVENT_TYPE.QUESTIONNAIRE_SUBMIT,
          res => {
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
          }
        );
        // 直播结束关闭弹窗
        this.msgServer.$on('live_over', () => {
          this.dialogVisible = false;
        });
      }
    }
  };
</script>
<style lang="less">
  .el-loading-spinner .path {
    stroke: #fb3a32;
  }
  .el-loading-spinner .el-loading-text {
    color: #1a1a1a;
  }
  .vmp-questionnaire-watch {
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
        background: var(--theme-color) !important;
        border-radius: 50%;
      }
      img {
        width: 100%;
        height: 100%;
        object-fit: scale-down;
      }
    }
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
        position: relative;
        z-index: 100;
      }
      .question-close {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 24px;
        height: 24px;
        background: rgba(0, 0, 0, 0.25);
        border-radius: 28px;
        color: #fff;
        font-size: 12px;
        text-align: center;
        line-height: 24px;
        cursor: pointer;
      }
    }
    .qs-preview-box-content {
      height: 100%;
      overflow: auto;
      ::-webkit-scrollbar {
        width: 5px;
        border-radius: 10px;
      }
      .q-wrap {
        .vhall-question-title {
          overflow: hidden;
        }
      }
    }
  }
</style>
