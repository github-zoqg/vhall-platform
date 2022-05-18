<template>
  <div class="vmp-question-wap" v-show="popupVisible">
    <!-- <van-popup
    v-model="popupVisible"
    position="bottom"
    :overlay="false"
    style="height: 100vh"
    class="qa_popup"
    get-container="body"
  > -->
    <i class="vh-iconfont vh-full-error close-btn" @click="close"></i>
    <!-- 问卷标题 -->
    <div id="qs-content-box"></div>
  </div>
  <!-- </van-popup> -->
</template>
<script>
  import { useQuestionnaireServer, useChatServer, useMsgServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  const QUESTIONNAIRE_PUSH = 'questionnaire_push'; // 推送消息
  export default {
    name: 'VmpQuestionnaireWap',
    data() {
      return {
        popupVisible: false,
        questionLastId: '', // 最后一个问卷id
        questionnaireId: '' // 当前问卷Id
      };
    },
    beforeCreate() {
      this.questionnaireServer = useQuestionnaireServer({ mode: 'watch' });
      this.msgServer = useMsgServer();
    },
    created() {
      this.initEvent();
    },
    watch: {
      // 打开问卷弹窗(全屏,视频需要改为小窗)
      popupVisible(val) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitQuestionnaireVisible', [!!val])
        );
      }
    },
    methods: {
      /**
       * @description 聊天/按钮打开文件
       */
      open(questionnaireId) {
        this.questionnaireServer.checkAnswerStatus(questionnaireId).then(res => {
          if (res.data === false) {
            this.$toast(this.$t('form.form_1087'));
          } else {
            this.popupVisible = true;
            this.$nextTick(() => {
              this.questionnaireServer.renderQuestionnaire4Wap('#qs-content-box', questionnaireId);
            }); // 等dom渲染
          }
        });
      },
      close() {
        this.popupVisible = false;
      },
      initEvent() {
        this.questionnaireServer.$on(QUESTIONNAIRE_PUSH, async msg => {
          useChatServer().addChatToList({
            nickname: msg.nick_name,
            avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
            content: {
              text_content: msg.alias ? `推送了${msg.alias}` : this.$t('chat.chat_1030'),
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
          this.questionnaireServer.setDotVisible(true);
          this.popupVisible = true;
          await this.$nextTick();
          this.questionnaireServer.renderQuestionnaire4Wap('#qs-content-box', msg.questionnaire_id);
        });
        this.questionnaireServer.$on(VHall_Questionnaire_Const.EVENT.SUBMIT, res => {
          if (res.code === 200) {
            this.$toast(this.$t('form.form_1088'));
            this.popupVisible = false;
          } else {
            this.$toast(this.$t('form.form_1087'));
            this.popupVisible = false;
          }
        });
        // 直播结束关闭弹窗
        this.msgServer.$on('live_over', () => {
          this.popupVisible = false;
        });
      }
    }
  };
</script>
<style lang="less">
  #qs-content-box {
    .el-input__inner::placeholder {
      font-size: 28px;
      vertical-align: middle;
    }
    .el-checkbox__input.is-checked .el-checkbox__inner,
    .el-checkbox__input.is-indeterminate .el-checkbox__inner {
      background-color: #fb3a32;
      border-color: #fb3a32;
    }
    .el-checkbox__inner:hover {
      border-color: #fb3a32;
    }
    .el-checkbox__input.is-checked + .el-checkbox__label {
      color: #1a1a1a;
    }
    .el-checkbox__input.is-focus .el-checkbox__inner {
      border-color: #fb3a32;
    }
    .el-checkbox__input.is-checked.is-focus .el-checkbox__inner {
      background-color: #fb3a32;
      border-color: #fb3a32;
    }
    /*单选选中效果重置*/
    .el-radio__input.is-checked .el-radio__inner {
      background-color: #fb3a32;
      border-color: #fb3a32;
    }
    .el-radio__inner:hover {
      border-color: #fb3a32;
    }
    .el-radio__input.is-focus .el-radio__inner {
      border-color: #fb3a32;
    }
    .el-radio__input.is-checked + .el-radio__label {
      color: #1a1a1a;
    }
    /* 日期选择效果重置*/
    .el-date-table td.today span {
      color: #fb3a32;
      font-weight: normal;
    }
    .el-date-table td.available:hover {
      color: #fb3a32;
    }
    .el-date-table td.current:not(.disabled) span {
      color: #fff;
      background-color: #fb3a32;
    }
    .q-wrap {
      padding-bottom: 400px;
    }
  }
</style>
<style lang="less">
  .vmp-question-wap {
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
  }
  .close-btn {
    position: fixed;
    color: black;
    font-size: 60px;
    width: 50px;
    height: 50px;
    top: 50px;
    right: 50px;
    z-index: 30;
  }
  .title-bar {
    position: relative;
    font-size: 32px;
    font-weight: 500;
    color: rgba(68, 68, 68, 1);
    text-align: center;
    height: 90px;
    line-height: 90px;
    border-bottom: 1px solid #d4d4d4;
    i {
      position: absolute;
      top: 50%;
      left: 94%;
      transform: translate(-50%, -50%);
      font-size: 27px;
    }
  }
  .questionLogo {
    position: relative;
    margin-bottom: 10px;
    width: 84px;
    img {
      width: 100%;
    }
  }

  .redIcon {
    position: absolute;
    top: 5px;
    right: 12px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    box-shadow: 0px 0px 0px 9px #ff0005;
    background: #ff0005;
  }
  .question-box {
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    background: white;
    left: 0;
    z-index: 4200;
    // 更多那个弹窗是慢慢增加的
  }

  #qs-content-box {
    z-index: 23;
    width: 100%;
    position: relative;
    background: #fff;
    height: 100%;
    overflow: auto;
  }
  .quest-header {
    z-index: 99;
    position: absolute;
    right: 20px;
    top: 20px;
    width: 60px;
    height: 60px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    line-height: 60px;
    text-align: center;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    i {
      font-size: 24px;
    }
  }
</style>
