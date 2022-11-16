<template>
  <div
    class="vmp-question-wap"
    v-show="popupVisible"
    :style="{ zIndex: zIndexServerState.zIndexMap.questionnaire }"
  >
    <!-- <van-popup
    v-model="popupVisible"
    position="bottom"
    :overlay="false"
    style="height: 100vh"
    class="qa_popup"
    get-container="body"
  > -->
    <span class="close-btn" @click="close">
      <i class="vh-iconfont vh-line-close"></i>
    </span>

    <!-- 问卷标题 -->
    <div id="qs-content-box" class="qs-content-box"></div>
  </div>
  <!-- </van-popup> -->
</template>
<script>
  import {
    useQuestionnaireServer,
    useChatServer,
    useMsgServer,
    useZIndexServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';

  export default {
    name: 'VmpQuestionnaireWap',
    data() {
      const zIndexServerState = this.zIndexServer.state;
      return {
        zIndexServerState,
        popupVisible: false,
        questionLastId: '', // 最后一个问卷id
        questionnaireId: '' // 当前问卷Id
      };
    },
    computed: {
      isEmbed() {
        // 是不是嵌入
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      }
    },
    beforeCreate() {
      this.zIndexServer = useZIndexServer();
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
            this.$toast(this.$t('form.form_1087'));
          } else {
            this.popupVisible = true;
            this.zIndexServer.setDialogZIndex('questionnaire');
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
            this.questionnaireServer.setDotVisible(true);
            this.popupVisible = true;
            this.zIndexServer.setDialogZIndex('questionnaire');
            await this.$nextTick();
            this.questionnaireServer.renderQuestionnaire4Wap(
              '#qs-content-box',
              msg.questionnaire_id
            );
          }
        );
        this.questionnaireServer.$on(
          this.questionnaireServer.EVENT_TYPE.QUESTIONNAIRE_SUBMIT,
          res => {
            if (res.code === 200) {
              this.$toast(this.$t('form.form_1088'));
              this.popupVisible = false;
            } else {
              this.$toast(this.$t('form.form_1087'));
              this.popupVisible = false;
            }
          }
        );
        // 直播结束关闭弹窗
        this.msgServer.$on('live_over', () => {
          this.popupVisible = false;
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-question-wap {
    width: 100%;
    height: 100vh;
    background: rgba(0, 0, 0, 0.25);
    position: fixed;
    top: 0;
    left: 0;
    .qs-content-box {
      z-index: 23;
      width: 100%;
      position: relative;
      background: #fff;
      height: 100%;
      overflow: auto;
      border-radius: 32px 32px 0 0;
      .el-input__inner::placeholder {
        font-size: 28px;
        vertical-align: middle;
      }
      .el-checkbox__input.is-checked .el-checkbox__inner,
      .el-checkbox__input.is-indeterminate .el-checkbox__inner {
        background-color: var(--theme-component-qa);
        border-color: var(--theme-component-qa);
      }
      .el-checkbox__inner:hover {
        border-color: var(--theme-component-qa);
      }
      .el-checkbox__input.is-checked + .el-checkbox__label {
        color: #1a1a1a;
      }
      .el-checkbox__input.is-focus .el-checkbox__inner {
        border-color: var(--theme-component-qa);
      }
      .el-checkbox__input.is-checked.is-focus .el-checkbox__inner {
        background-color: var(--theme-component-qa);
        border-color: var(--theme-component-qa);
      }
      /*单选选中效果重置*/
      .el-radio__input.is-checked .el-radio__inner {
        background-color: var(--theme-component-qa);
        border-color: var(--theme-component-qa);
      }
      .el-radio__inner:hover {
        border-color: var(--theme-component-qa);
      }
      .el-radio__input.is-focus .el-radio__inner {
        border-color: var(--theme-component-qa);
      }
      .el-radio__input.is-checked + .el-radio__label {
        color: #1a1a1a;
      }
      /* 日期选择效果重置*/
      .el-date-table td.today span {
        color: var(--theme-component-qa);
        font-weight: normal;
      }
      .el-date-table td.available:hover {
        color: var(--theme-component-qa);
      }
      .el-date-table td.current:not(.disabled) span {
        color: #fff;
        background-color: var(--theme-component-qa);
      }
      .q-wrap {
        padding-bottom: 400px;
        .vhall-question-title {
          height: 125px;
          overflow: hidden;
        }
      }
      .q-btns span {
        border: 1px solid var(--theme-component-qa) !important;
        background-color: var(--theme-component-qa) !important;
        color: #fff !important;
      }
    }
  }
  .close-btn {
    position: absolute;
    width: 48px;
    height: 48px;
    top: 16px;
    right: 16px;
    z-index: 30;
    border-radius: 28px;
    background: rgba(0, 0, 0, 0.25);
    display: flex;
    justify-content: center;
    align-items: center;
    .vh-iconfont {
      margin-top: 2px;
      color: #fff;
      font-size: 25px;
    }
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
    box-shadow: 0px 0px 0px 9px var(--theme-component-qa) !important;
    background: var(--theme-component-qa) !important;
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
