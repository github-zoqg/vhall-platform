<template>
  <div
    class="vmp-questionnaire-icon"
    v-if="questionnaireServerState.iconVisible || (QuestionList && QuestionList.length > 0)"
  >
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
              <span v-if="index == 0" class="_block"></span>
              <span class="data-text_circle">
                <i class="num"></i>
              </span>
              <p class="data-text_title" :class="item.is_answered ? 'write_over' : ''">
                <span class="ellipsis">
                  {{ item.title }}
                </span>
              </p>
              <span class="write write_hover" v-if="item.is_answered == 0" @click="writeQ(item)">
                填写
              </span>
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
      }
    },
    beforeCreate() {
      this.questionnaireServer = useQuestionnaireServer({
        mode: 'watch'
      });
    },
    created() {
      this.questionnaireServer.checkIconStatus();
      this.questionnaireServer.getSurveyList();
      this.questionnaireServer.$on('questionnaire_push', msg => {
        this.questionnaireServer.getSurveyList();
      });
    },
    methods: {
      async checkQuestionnaireIcon() {
        if (this.isShowQuestionList) return false;
        await this.questionnaireServer.getSurveyList();
        let arr = this.QuestionList && this.QuestionList.filter(item => item.is_answered == 0);
        if (arr.length == 0) {
          this.$message.success(this.$t('form.form_1087'));
          return false;
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
        this.closeQuestionList();
        this.$emit('clickIcon', data.question_id);
      }
    }
  };
</script>
<style lang="less" scoped>
  .vmp-questionnaire-icon {
    color: #fff;
    position: relative;
    width: 32px;
    height: 32px;
    line-height: 32px;
    background: linear-gradient(180deg, #5ac1ff 0%, #2578ff 100%);
    border-radius: 16px;
    cursor: pointer;
    margin-left: 16px;
    img.show_img {
      width: 32px;
      height: 32px;
      -webkit-transform-origin: left center;
      transform-origin: left center;
      margin: -1px 0 0 0;
    }
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
      margin: 0;
    }
    .vmp-questionnaire-list_container {
      position: absolute;
      right: -107px;
      bottom: 60px;
      z-index: 12;
      width: 356px;
      max-height: 350px;
      background: transparent;
      border-radius: 8px;
      padding: 60px 5px 10px 30px;
      box-shadow: 0px 8px 16px 0px rgba(51, 51, 51, 0.24), 0px 2px 4px 0px rgba(0, 0, 0, 0.05);
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
            position: absolute;
            color: #3562fa;
            right: 16px;
            cursor: pointer;
            padding: 0 4px;
          }
          .write_hover:hover {
            border-radius: 4px;
            background: #ebefff;
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
            top: 3px;
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
            padding: 0 44px 0 16px;
            word-break: break-word;
            text-align: justify;
            padding-bottom: 16px;
            color: #1a1a1a;
            border-left: 1px dashed #3562fa;
            border-radius: 2px;
            .ellipsis {
              display: -webkit-box;
              /**autoprefixer: ignore next */
              -webkit-box-orient: vertical;
              -webkit-line-clamp: 2;
              overflow: hidden;
            }
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
