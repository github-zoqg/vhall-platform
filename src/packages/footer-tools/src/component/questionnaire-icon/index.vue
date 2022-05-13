<template>
  <div class="vmp-questionnaire-icon" v-if="questionnaireServerState.iconVisible">
    <img src="./images/questionnaire.png" alt="" @click="checkQuestionnaireIcon" />
    <i class="vmp-dot" v-if="questionnaireServerState.dotVisible" />
    <!-- 问卷列表弹框 -->
    <div class="vmp-questionnaire-list_container" v-if="isShowQuestionList">
      <img class="q_header" src="./images/header.png" alt="" />
      <div class="container-data">
        <ul v-if="QuestionList && QuestionList.length" v-infinite-scroll="moreLoadData">
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
  </div>
</template>
<script>
  /**
   * @description 红包的图标 + 小红点
   */
  import { useQuestionnaireServer } from 'middle-domain';
  export default {
    name: 'QuestionnaireIcon',
    data() {
      const questionnaireServerState = this.questionnaireServer.state;
      return {
        questionnaireServerState,
        isShowQuestionList: false
        // QuestionList: [
        //   {
        //     created_at: '2022-05-11 16:05:16',
        //     content:
        //       '123123123123123123123123123123123123123123123123123123123123123123123123123123123123123123'
        //   },
        //   {
        //     created_at: '2022-05-11 16:05:13',
        //     content: '13'
        //   }
        // ]
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
      async checkQuestionnaireIcon() {
        if (this.isShowQuestionList) return false;
        await this.questionnaireServer.getSurveyList();
        let arr = this.QuestionList.filter(item => item.isAnswered == 0);
        if (arr.length == 0) {
          this.$message.success('提交成功，感谢您的参与。');
        }
        // 如果只有一份未填写,则直接打开问卷
        if (arr.length == 1) {
          this.writeQ(arr[0]);
        } else {
          this.isShowQuestionList = true;
        }
      },
      // 更多问卷数据
      moreLoadData() {},
      // 关闭问卷面板
      closeQuestionList() {
        this.isShowQuestionList = false;
      },
      // 问卷填写
      writeQ(data) {
        // console.log(data);
        this.$emit('clickIcon', data.questionId);
      }
    }
  };
</script>
<style lang="less" scoped>
  .vmp-questionnaire-icon {
    color: #fff;
    position: relative;
    .vmp-dot {
      position: absolute;
      display: inline-block;
      width: 8px;
      height: 8px;
      background: #fb3a32;
      border: 1px solid #2a2a2a;
      border-radius: 50%;
      right: -3px;
      position: absolute;
    }
    img {
      width: 32px;
      height: 32px;
      cursor: pointer;
    }
    .vmp-questionnaire-list_container {
      position: absolute;
      right: -163px;
      bottom: 45px;
      z-index: 12;
      width: 356px;
      max-height: 350px;
      background: transparent;
      border-radius: 8px;
      padding: 60px 5px 10px 30px;
      background: linear-gradient(359.08deg, #f0f9ff 0.67%, #f4fbff 86.17%);
      ::-webkit-scrollbar-thumb {
        background-color: #cccccc;
      }
      .q_header {
        width: 96px;
        height: 96px;
        position: absolute;
        top: -48px;
        left: 50%;
        transform: translate(-50%);
      }
      .container-data {
        position: relative;
        max-height: 220px;
        overflow: auto;
        color: @font-light-normal;
        ul {
          list-style: none;
          height: 100%;
          li {
            display: flex;
            color: @font-light-normal;
            font-size: 14px;
            line-height: 20px;
          }
        }
        .data-time {
          display: inline-block;
          width: 50px;
          text-align: left;
        }
        .data-text {
          display: flex;
          position: relative;
          padding-right: 16px;
          width: calc(100% - 50px);
          .write {
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
            width: 11px;
            height: 11px;
            border-radius: 50%;
            background: linear-gradient(359.08deg, #f0f9ff 0.67%, #f4fbff 86.17%);
            border: 1px solid #3562fa;
            top: 4px;
            left: -6px;
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
            padding: 0 29px 0 16px;
            word-break: break-word;
            padding-bottom: 16px;
            border-left: 1px dashed #3562fa;
            border-radius: 2px;
          }
        }
      }
      .vh-line-close {
        position: absolute;
        color: #666;
        top: 16px;
        right: 20px;
        cursor: pointer;
      }
    }
  }
</style>
