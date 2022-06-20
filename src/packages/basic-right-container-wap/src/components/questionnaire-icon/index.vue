<template>
  <div
    class="icon-wrap"
    v-if="questionnaireServerState.iconVisible || (QuestionList && QuestionList.length > 0)"
  >
    <img src="./images/questionnaire.png" alt="" @click="clickQuestionnaireIcon" />
    <i class="dot" v-if="questionnaireServerState.dotVisible" />
    <!-- 问卷列表弹框 -->
    <div class="popup_base" v-if="showQuestionList"></div>
    <van-popup
      get-container="#otherPopupContainer"
      class="questionnaire_base"
      v-model="showQuestionList"
      position="bottom"
      :overlay="false"
      :style="{ maxHeight: popHeight, zIndex: 31 }"
    >
      <div class="vmp-questionnaire-list_container">
        <img class="q_header" src="./images/header.png" alt="" />
        <div class="container-data">
          <ul v-if="QuestionList && QuestionList.length">
            <li v-for="(item, index) in QuestionList" :key="index">
              <div class="data-time">
                {{ item.created_at.substr(11, 5) }}
              </div>

              <div class="data-text">
                <span v-if="index == 0" class="_block"></span>
                <span class="data-text_circle">
                  <i class="num"></i>
                </span>
                <p class="data-text_title" :class="item.is_answered ? 'write_over' : ''">
                  <span class="ellipsis_title">{{ item.title }}</span>
                </p>
                <span class="write" v-if="item.is_answered == 0" @click="writeQ(item)">填写</span>
                <span v-else class="write write_over">已填</span>
              </div>
            </li>
          </ul>
        </div>
        <i class="vh-iconfont vh-line-close" @click="closeQuestionList"></i>
      </div>
    </van-popup>
  </div>
</template>
<script>
  import { useQuestionnaireServer } from 'middle-domain';
  export default {
    name: 'QuestionnaireIcon',
    data() {
      const questionnaireServerState = this.questionnaireServer.state;
      return {
        questionnaireServerState,
        popHeight: '50vh',
        showQuestionList: false
      };
    },
    computed: {
      QuestionList() {
        return this.questionnaireServer.state.QuestionList;
      },
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      isSmallPlayer() {
        return this.$domainStore.state.playerServer.isSmallPlayer;
      }
    },
    watch: {
      QuestionList: {
        handler: function (val) {
          if (val) {
            let arr = val.filter(item => item.is_answered == 0);
            if (arr.length > 0) {
              this.questionnaireServer.setDotVisible(true);
            } else {
              this.questionnaireServer.setDotVisible(false);
            }
          }
        }
      },
      isSmallPlayer() {
        this.setSetingHeight();
      }
    },
    beforeCreate() {
      this.questionnaireServer = useQuestionnaireServer({
        mode: 'watch'
      });
    },
    created() {
      this.questionnaireServer.checkIconStatus();
      this.setSetingHeight();
      this.questionnaireServer.$on('questionnaire_push', msg => {
        this.closeQuestionList();
      });
      this.questionnaireServer.$on(VHall_Questionnaire_Const.EVENT.SUBMIT, res => {
        if (res.code === 200) {
          this.questionnaireServer.getSurveyList();
        }
      });
    },
    methods: {
      setSetingHeight() {
        let htmlFontSize = document.getElementsByTagName('html')[0].style.fontSize;
        // postcss 换算基数为75 头部+播放器区域高为 522px 80px为顶部图片一般高度
        let playerHeight = this.isSmallPlayer == true ? 130 : 422;
        let baseHeight = playerHeight + 71 - 80;
        if (this.isEmbed) {
          baseHeight = playerHeight - 80;
        }
        this.popHeight =
          document.body.clientHeight - (baseHeight / 75) * parseFloat(htmlFontSize) + 'px';
      },
      async clickQuestionnaireIcon() {
        if (this.showQuestionList) return false;
        await this.questionnaireServer.getSurveyList();
        let arr = this.QuestionList.filter(item => item.is_answered == 0);
        if (arr.length == 0) {
          this.$toast(this.$t('form.form_1087'));
          return false;
        }
        // 如果只有一份未填写,则直接打开问卷
        if (arr.length == 1) {
          this.writeQ(arr[0]);
        } else {
          this.showQuestionList = true;
        }
      },
      // 问卷填写
      writeQ(data) {
        // console.log(data);
        this.closeQuestionList();
        this.$emit('clickIcon', data.question_id);
      },
      // 关闭问卷面板
      closeQuestionList() {
        this.showQuestionList = false;
      }
    }
  };
</script>

<style lang="less" scoped>
  .icon-wrap {
    margin-bottom: 10px;
    width: 84px;
    height: 84px;
    position: relative;
    font-size: 28px;
    background-color: transparent;
    img {
      width: 84px;
      height: 84px;
    }
    .dot {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #ff0005;
      content: '';
    }
    .popup_base {
      height: 100vh;
      width: 100vw;
      background: rgba(0, 0, 0, 0.6);
      position: fixed;
      top: 0;
      left: 0;
      z-index: 30;
    }
    .questionnaire_base {
      height: 100%;
      background: transparent;
      z-index: 31 !important;
    }
    .vmp-questionnaire-list_container {
      height: calc(100% - 80px);
      .q_header {
        width: 160px;
        height: 160px;
        position: absolute;
        top: 0px;
        left: 50%;
        z-index: 1;
        transform: translate(-50%);
      }
      .container-data {
        height: 100%;
        margin-top: 80px;
        padding: 100px 40px 60px;
        background: linear-gradient(359.08deg, #f0f9ff 0.67%, #f4fbff 86.17%);
        position: relative;
        overflow: auto;
        color: @font-light-normal;
        border-radius: 30px 30px 0 0;
        ul {
          list-style: none;
          height: 100%;
          overflow: auto;
          li {
            display: flex;
            color: @font-light-normal;
            font-size: 28px;
            line-height: 1.2;
          }
        }
        .data-time {
          line-height: 1.6;
          font-size: 28px;
          display: inline-block;
          width: 100px;
          text-align: left;
        }
        .data-text {
          display: flex;
          position: relative;
          padding-right: 80px;
          width: calc(100% - 100px);
          ._block {
            display: inline-block;
            width: 10px;
            height: 10px;
            position: absolute;
            background: #f2faff;
            top: 0px;
            left: -5px;
          }
          .write {
            line-height: 1.6;
            font-size: 28px;
            position: absolute;
            color: #3562fa;
            right: 0;
            cursor: pointer;
          }
          .write_over {
            color: #666;
            cursor: default;
          }
          &_circle {
            display: inline-block;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(359.08deg, #f0f9ff 0.67%, #f4fbff 86.17%);
            border: 1px solid #3562fa;
            top: 10px;
            left: -11px;
            position: absolute;
            .num {
              display: inline-block;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #3562fa;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
          }
          &_title {
            padding: 0 0 60px 32px;
            color: #1a1a1a;
            line-height: 1.6;
            word-break: break-word;
            border-left: 1px dashed #3562fa;
            border-radius: 2px;
            font-size: 28px;
            .ellipsis_title {
              display: -webkit-box;
              /* autoprefixer: ignore next */
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
              overflow: hidden;
            }
          }
        }
      }
      .vh-line-close {
        position: absolute;
        color: #8c8c8c;
        top: 110px;
        right: 30px;
        cursor: pointer;
      }
    }
  }
</style>
