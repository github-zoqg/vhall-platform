<template>
  <div class="vmp-basic-layout vmp-basic-layout-app-question-embed">
    <div class="vmp-basic-container">
      <section>
        <div @click="showQuestionCard" class="questionLogo" v-if="showIcon">
          <i class="redIcon" v-if="showRedIcon"></i>
          <img src="./img/questionnaire.png" alt srcset />
        </div>
        <div class="app-embed-question-box" v-show="showQuestion">
          <header id="questionHeader" class="quest-header">
            <img src="./img/pop-close.png" class="question-close-img" alt srcset @click="close" />
          </header>
          <div id="questionBox"></div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
  import { Domain, questionnaireApi } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  import { getBrowserType } from '@/app-shared/utils/getBrowserType.js';
  // import { logRoomInitSuccess, logRoomInitFailed } from '@/packages/app-shared/utils/report';
  export default {
    name: 'AppEmbedQuestion',
    data() {
      return {
        showQuestion: false,
        showIcon: false, // 是否显示问卷图标
        showRedIcon: false, // 是否显示小红点
        questionSdk: null,
        questionLastId: ''
      };
    },
    async created() {
      try {
        this.params = this.$route.query;
        if (this.params && this.params.appId) {
          // 当前为app-sdk嵌入问卷，更新互动token & token信息
          if (this.params && this.params.token) {
            window.localStorage.setItem('token', this.params.token);
          }
          if (this.params && this.params['interact-token']) {
            window.sessionStorage.setItem('interact_token', this.params['interact-token']);
          }
        }
        await new Domain({
          plugins: ['chat', 'questionnaire'],
          isNotInitRoom: true // 不需要初始化房间
        });
        // 初始化问卷
        this.initQuestionSDK();
        // 检查问卷图片状态
        this.questionHistoryInfo();
        this.$nextTick(() => {
          // 当前问卷是否正在被推送
          this.initAppQuestion();
        });
        //上报日志
        // logRoomInitSuccess();
      } catch (e) {
        console.error('---初始化app-sdk问卷嵌入出现异常--', e);
        //上报日志
        // logRoomInitFailed({ error: e });
      }
    },
    methods: {
      // 是否提交过问卷
      checkSubmit() {
        return new Promise((resolve, reject) => {
          questionnaireApi
            .checkAnswerStatus({
              webinar_id: this.params.webinar_id,
              survey_id: this.params.survey_id,
              user_id: this.params.user_id
            })
            .then(res => {
              if (res.data) {
                // 可提交问卷
                resolve(true);
              } else {
                resolve(false);
              }
            });
        });
      },
      // 点击icon显示问卷
      showQuestionCard() {
        this.checkSubmit().then(res => {
          console.log('debugger info -- 是否已经提交问卷', res);
          if (!res) {
            this.$toast(this.$t('问卷已提交成功，感谢您的参与'));
          } else {
            this.showQuestion = true;
            this.renderQuestionnaire(this.params.survey_id);
          }
        });
      },
      // 初始化问卷
      initQuestionSDK() {
        this.questionSdk = new VHall_Questionnaire_Service({
          auth: {
            app_id: this.params.appId, // paas的应用id,必填
            third_party_user_id: this.params.user_id, // paas的第三方用户id,必填
            access_token: this.params.paas_access_token // paas的授权token,必填
          },
          uploadUrl: process.env.VUE_APP_BASE_URL,
          notify: false // 是否开启消息提示，非必填,默认是true
        });
        this.sdkFlag = true;
        this.questionSdk.$on(window.VHall_Questionnaire_Const.EVENT.READY, data => {
          console.log(`${window.VHall_Questionnaire_Const.EVENT.READY}进入`);
        });
        this.questionSdk.$on(window.VHall_Questionnaire_Const.EVENT.ERROR, data => {
          console.log(`${window.VHall_Questionnaire_Const.EVENT.ERROR}异常`);
        });
        this.questionSdk.$on(window.VHall_Questionnaire_Const.EVENT.SUBMIT, data => {
          console.log(`${window.VHall_Questionnaire_Const.EVENT.SUBMIT}提交`, data);
          // this.addSurveyQuestion(data)
          // data  回答Id
          // naire_id  问卷Id
          this.submitQuestion(data.naire_id, data.data, data.report, data.answer, this);
        });
      },
      // 检查问卷图标的状态
      questionHistoryInfo() {
        questionnaireApi
          .getLastSurvey({
            room_id: this.params.roomId,
            playback_filling: 0,
            start_time: '',
            end_time: ''
          })
          .then(res => {
            if (res && res.data && res.data.questionId) {
              this.questionLastId = res.data.questionId;
              this.showIcon = true;
              this.checkSubmit().then(res => {
                if (res) {
                  // 可提交问卷
                  this.showRedIcon = true;
                } else {
                  this.showRedIcon = false;
                }
              });
            }
          });
      },
      // 当前若有app推送的问卷，展示
      async initAppQuestion() {
        const _checkData = {
          webinar_id: this.params.webinar_id,
          survey_id: this.params.survey_id,
          user_id: this.params.user_id
        };
        await new Promise((resolve, reject) => {
          const time = 1000;
          let step = Math.floor(Math.random() * 10);
          step = step > 5 ? 5 : step;
          setTimeout(() => {
            resolve();
          }, step * time);
        });
        questionnaireApi.checkAnswerStatus(_checkData).then(res => {
          if (res.data) {
            if (parseInt(Math.abs(window.orientation / 90)) == 0) {
              this.showQuestion = true;
            } else {
              this.showQuestion = false;
            }
            this.$nextTick(() => {
              // 消息打开问卷
              this.renderQuestionnaire(this.params.survey_id);
              this.questionnaireId = this.params.survey_id;
            });
          } else {
            // 消息打开问卷
            this.$nextTick(() => {
              // 消息打开问卷
              this.renderQuestionnaire(this.params.survey_id);
              this.questionnaireId = this.params.survey_id;
              this.showQuestion = true;
              this.$nextTick(() => {
                let dom = document.querySelector('.q-btns');
                dom && (dom.style.display = 'none');
              });
            });
          }
        });
      },
      renderQuestionnaire(questionnaire_id) {
        let dom = document.getElementById('questionBox');
        dom && (dom.innerHTML = '');
        this.questionSdk.renderPageH5('#questionBox', questionnaire_id);
        /* this.popHeight =
          document.body.clientHeight -
          document.getElementById('questionHeader').offsetHeight +
          'px'; */
      },
      // 关闭问卷
      close() {
        this.showQuestion = false;
        this.sendToNative();
      },
      // 通知SDK事件
      sendToNative(type, e) {
        const { system } = getBrowserType();
        // 如果是iOS
        if (system == 'ios') {
          // SKWebView
          try {
            if (type == 'submit') {
              console.log('提交');
              window.webkit.messageHandlers.onWebEvent.postMessage(
                JSON.stringify({ event: 'submit', code: e.code, msg: e.msg })
              );
            } else {
              console.log('关闭');
              window.webkit.messageHandlers.onWebEvent.postMessage(
                JSON.stringify({ event: 'close' })
              );
            }
          } catch (error) {
            console.log(error);
          }
          return;
        } else {
          // 如果是安卓
          try {
            if (type == 'submit') {
              window.messageHandlers.onWebEvent(
                JSON.stringify({ event: 'submit', code: e.code, msg: e.msg })
              );
            } else {
              window.messageHandlers.onWebEvent(JSON.stringify({ event: 'close' }));
            }
          } catch (error) {
            console.log(error);
          }
          return;
        }
      },
      submitQuestion(questionId, answerId, report, answer, that) {
        const quesData = {};
        report.forEach(item => {
          switch (item.style) {
            case 'name':
              quesData.real_name = item.value;
              quesData.real_name_source = 'SURVEY';
              break;
            case 'area':
              quesData.address = item.value;
              break;
            case 'industry':
              quesData.industry = item.value;
              break;
            case 'education':
              quesData.education_level = item.value;
              break;
            case 'company':
              quesData.company = item.value;
              break;
            case 'phone':
              quesData.phone = item.value;
              break;
            case 'email':
              quesData.email = item.value;
              break;
            case 'birthday':
              quesData.birthday = item.value;
              break;
            case 'position':
              quesData.position = item.value;
              break;
            case 'sex':
              quesData.sex = item.value == '男' ? 'M' : 'W';
              break;
          }
        });
        questionnaireApi
          .submitQuestionnaire({
            survey_id: questionId,
            room_id: that.params.roomId,
            answer_id: answerId,
            user_id: that.params.user_id,
            visit_id: sessionStorage.getItem('visitorWatchId') || '',
            webinar_id: that.params.webinar_id,
            vss_token: that.params.paas_access_token,
            extend: JSON.stringify(quesData),
            res: answer
          })
          .then(res => {
            that.$toast('提交问卷成功');
            console.log('问卷编号', questionId, that.questionLastId);
            if (`${questionId}` === `${that.questionLastId}`) {
              // 统一转换为字符串比对
              that.showRedIcon = false;
            } else {
              that.showRedIcon = true;
            }
            that.sendToNative('submit', res);
          })
          .catch(e => {
            console.log('提交失败', e);
            that.sendToNative('submit', e);
          });
      },
      checkQuestionnaireIcon() {
        const { survey_id, paas_access_token, user_id, webinar_id, appId, roomId, token } =
          this.$route.query;
        const interactToken = this.$route.query['interact-token'];
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickQuestionnaireIcon', [survey_id])
        );
      }
    }
  };
</script>
<style lang="less">
  .vmp-basic-layout-app-question-embed {
    .vmp-basic-container {
      display: flex;
      align-items: flex-start;
      padding-top: 5px;
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
    .app-embed-question-box {
      width: 100%;
      height: 100vh;
      background: rgba(0, 0, 0, 0.25);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 100;
    }
    #questionBox {
      width: 100%;
      position: relative;
      background: #fff;
      height: 100%;
      z-index: 23;
      -webkit-overflow-scrolling: touch;
      overflow: auto;
      /* 此处deep同 middle-platform\src\packages\questionnaire-wap\src\main.vue */
      ::v-deep {
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
          // 软键盘挡住input框问题
          padding-bottom: 400px;
        }
      }
    }
    .quest-header {
      z-index: 99;
      position: absolute;
      right: 16px;
      top: 16px;
      width: 48px;
      height: 48px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 28px;
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
    .question-close-img {
      width: 22px;
      height: 22px;
    }
  }
</style>
