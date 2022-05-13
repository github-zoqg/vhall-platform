<template>
  <div class="icon-wrap" v-if="questionnaireServerState.iconVisible">
    <img src="./images/questionnaire.png" alt="" @click="clickQuestionnaireIcon" />
    <i class="dot" v-if="questionnaireServerState.dotVisible" />
    <!-- 问卷列表弹框 -->
    <van-popup
      get-container="#otherPopupContainer"
      class="questionnaire_base"
      v-model="showQuestionList"
      position="bottom"
      :overlay="false"
      :style="{ maxHeight: popHeight }"
    >
      <div class="vmp-questionnaire-list_container">
        <img class="q_header" src="./images/header.png" alt="" />
        <div class="container-data">
          <ul v-if="QuestionList && QuestionList.length">
            <li v-for="(item, index) in QuestionList" :key="index">
              <div class="data-time">
                {{ item.created_at | chatTime }}
              </div>

              <div class="data-text">
                <span class="data-text_circle">
                  <i class="num"></i>
                </span>
                <p class="data-text_title" :class="item.isAnswered ? '' : 'write_over'">
                  {{ item.title }}
                </p>
                <span class="write" v-if="item.isAnswered == 0" @click="writeQ(item)">填写</span>
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
      }
    },
    beforeCreate() {
      this.questionnaireServer = useQuestionnaireServer({
        mode: 'watch'
      });
    },
    created() {
      this.questionnaireServer.checkIconStatus();
    },
    methods: {
      async clickQuestionnaireIcon() {
        if (this.showQuestionList) return false;
        await this.questionnaireServer.getSurveyList();
        let arr = this.QuestionList.filter(item => item.isAnswered == 0);
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
        this.$emit('clickIcon', data.questionId);
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
    .questionnaire_base {
      height: 100%;
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
        padding: 100px 30px 60px;
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
            font-size: 14px;
            line-height: 1.2;
          }
        }
        .data-time {
          line-height: 1.2;
          display: inline-block;
          width: 100px;
          text-align: left;
        }
        .data-text {
          display: flex;
          position: relative;
          padding-right: 16px;
          width: calc(100% - 100px);
          .write {
            line-height: 1.2;
            position: absolute;
            color: #3562fa;
            right: 16px;
            cursor: pointer;
          }
          .write_over {
            color: #666;
            cursor: default;
          }
          &_circle {
            display: inline-block;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: linear-gradient(359.08deg, #f0f9ff 0.67%, #f4fbff 86.17%);
            border: 1px solid #3562fa;
            top: 4px;
            left: -11px;
            position: absolute;
            .num {
              display: inline-block;
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: #3562fa;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
          }
          &_title {
            padding: 0 60px 60px 32px;
            line-height: 1.6;
            word-break: break-word;
            border-left: 1px dashed #3562fa;
            border-radius: 2px;
          }
        }
      }
      .vh-line-close {
        position: absolute;
        color: #666;
        top: 110px;
        right: 30px;
        cursor: pointer;
      }
    }
  }
</style>
