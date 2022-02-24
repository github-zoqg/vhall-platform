<template>
  <div class="vhall-question">
    <div v-show="dialogVisible" class="vhall-question-box">
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
  import { useQuestionnaireServer } from 'middle-domain';
  const QUESTIONNAIRE_PUSH = 'questionnaire_push'; // 推送消息
  export default {
    name: 'VmpQuestionnaireWatch',
    props: {
      timeInfo: {
        require: true,
        default: () => {
          return {
            start_time: '',
            end_time: ''
          };
        },
        type: Object
      }
    },
    data() {
      return {
        dialogVisible: false,
        questionLastId: '', // 最后一个问卷id
        questionnaireId: '' // 问卷Id
      };
    },
    beforeCreate() {
      this.questionnaireServer = useQuestionnaireServer({ mode: 'watch' });
    },
    created() {
      this.initEvent();
    },
    methods: {
      initEvent() {
        this.questionnaireServer.$on(QUESTIONNAIRE_PUSH, questionnaireId => {
          this.questionnaireServer.renderQuestionnaire4Watch(
            '#qs-preview-box-content',
            questionnaireId
          );
          this.dialogVisible = true;
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
      },

      checkedQuestion(id, flag) {
        this.$vhallapi.question
          .checkSurvey({
            survey_id: id,
            webinar_id: this.webinarId
          })
          .then(res => {
            if (res.data) {
              // 未提交
              this.isShowCircle = true;
              this.chatPreview(id, false);
            } else {
              this.loading = false;
              this.isShowCircle = false;
              if (flag) {
                this.$message({
                  message: this.$t('form.form_1037'),
                  showClose: true,
                  // duration: 0,
                  type: 'success',
                  customClass: 'zdy-info-box'
                });
              }
            }
          });
      }
    }
  };
</script>
<style lang="less" scoped>
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
    z-index: 27;
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
      overflow-y: scroll;
      ::-webkit-scrollbar {
        width: 5px;
        border-radius: 10px;
      }
    }
  }
  /deep/.el-loading-spinner .path {
    stroke: #fb3a32;
  }
  /deep/.el-loading-spinner .el-loading-text {
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
</style>
