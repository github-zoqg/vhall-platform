<template>
  <div>
    <div class="vmp-exam-info" :style="`max-width: ${maxWidth};max-height: ${maxHeight};`">
      <div class="vmp-exam-info--title">
        <h1 v-text="previewInfo.title"></h1>
      </div>
      <!--
        题目类型：subject_type（图片题 img-text；文字题 text；）
        选择类型：type（单选 radio；多选 checkbox；）
        排列方式：layout_type（单列 1；多列 2；）
        图文排列方式：layout_css （上图下文：1；左图右文：2）
        -->
      <div
        class="vmp-exam-info--question"
        v-for="(item, index) in questionList"
        :key="`qt_${index}`"
        :data-disabled="isDisabledSave"
      >
        <!-- 图片题 （selectType: 1单选；2多选。支持单选 or 多选）-->
        <h1>
          <span>{{ item.sortNo }}.</span>
          <span v-text="item.title"></span>
        </h1>
        <!-- 瀑布流[题目-答案区域] -->
        <div
          class="exam-way__waterfallFlow"
          v-masonry:update
          item-selector=".vmp-exam-info--option"
          v-if="waterfallFlow"
        >
          <template v-if="item.detail">
            <div
              v-masonry-tile:update
              :class="`vmp-exam-info--option page-${answerType} ${
                item.layout_type == 1 ? 'max-width' : 'min-width'
              } ${item.layout_css == 1 ? 'top-bottom' : 'left-right'}`"
              v-for="(sonItem, sonIndex) in item.detail.list"
              :key="`qt_${index}_son${sonIndex}`"
            >
              <img
                v-if="item.subject_type == 'img-text' && sonItem.imgUrl != undefined"
                lazy
                :src="sonItem.imgUrl"
                :preview-src-list="[sonItem.imgUrl]"
                width="100%"
                height="100%"
              />
              <div class="vmp-exam-info--text">
                <el-radio
                  v-model="item.answer"
                  :label="sonItem.key"
                  :name="`radio_yes_${item.id}`"
                  v-if="item.type === 'radio'"
                ></el-radio>
                <el-checkbox
                  v-model="item.answer"
                  :label="sonItem.key"
                  :name="`checkbox_yes_${item.id}`"
                  v-if="item.type === 'checkbox'"
                ></el-checkbox>
                <div>{{ sonItem.key + '、' + sonItem.value }}</div>
              </div>
            </div>
          </template>
        </div>
        <!-- 非瀑布流[题目-答案区域] -->
        <div class="exam-way__no__waterfallFlow" v-else>
          <template v-if="item.detail">
            <div
              :class="`vmp-exam-info--option page-${answerType} ${
                item.layout_type == 1 ? 'max-width' : 'min-width'
              } ${item.layout_css == 1 ? 'top-bottom' : 'left-right'}`"
              v-for="(sonItem, sonIndex) in item.detail.list"
              :key="`qt_${index}_son${sonIndex}`"
            >
              <img
                v-if="item.subject_type == 'img-text' && sonItem.imgUrl != undefined"
                lazy
                :src="sonItem.imgUrl"
                :preview-src-list="[sonItem.imgUrl]"
                width="100%"
                height="100%"
              />
              <div class="vmp-exam-info--text">
                <el-radio
                  v-model="item.answer"
                  :label="sonItem.key"
                  :name="`radio_no_${item.id}`"
                  v-if="item.type === 'radio'"
                ></el-radio>
                {{ item.answer }}, {{ item.id }}
                <el-checkbox
                  v-model="item.answer"
                  :label="sonItem.key"
                  :name="`checkbox_no_${item.id}`"
                  v-if="item.type === 'checkbox'"
                ></el-checkbox>
                <div>{{ sonItem.key + '、' + sonItem.value }}</div>
              </div>
            </div>
          </template>
        </div>
        <!-- 答案结果 -->
        <div class="vmp-exam-info--result" v-if="answerType == 'show'">
          <label>分数：</label>
          <span>{{ item.score }}</span>
          <strong>|</strong>
          <label>正确答案：</label>
          <span class="success__tag">
            {{ item.releaseAnswerStr }}
          </span>
          <strong>|</strong>
          <label>您的答案：</label>
          <span>{{ item.answer }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpExamInfo',
    data() {
      return {
        loading: false,
        answerIndex: 0, // 当前答题序号
        isFirst: true, // 是否是第一道题
        isEnd: false, // 是否最后一题
        questionList: [], // 可答题数组
        previewInfo: {
          title: '苹果2022年新品发布会，极致体验知识大盘点',
          extension: '扩展字段',
          question_detail: '',
          jsonData: [
            {
              id: 1,
              sortNo: 1, // 模拟题号
              releaseAnswerStr: 'C', // 模拟正确答案
              subject_type: 'img-text',
              layout_type: 1,
              layout_css: 1,
              title: '图文题 - 单选',
              answer: '',
              releaseAnswer: 'C',
              type: 'radio',
              score: 2,
              detail: {
                list: [
                  {
                    id: 2314123,
                    key: 'A',
                    value: '选项1212',
                    imgUrl:
                      'https://t-alistatic01.e.vhall.com/upload/users/logo-imgs/ba/e1/bae13a3f7402fded318e89b1b45050b3.jpg'
                  },
                  {
                    id: 2314124,
                    key: 'B',
                    value:
                      '选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123',
                    imgUrl:
                      'https://t-alistatic01.e.vhall.com/upload/interacts/screen-imgs/202210/dc/1f/dc1f16226003784bc8cdcab2a97c6a06.jpg'
                  },
                  {
                    id: 2314125,
                    key: 'C',
                    value:
                      '选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123',
                    imgUrl:
                      'https://t-alistatic01.e.vhall.com/upload/interacts/screen-imgs/202205/be/c3/bec3e6189b84c2ceb268e236449a0da6.jpg'
                  }
                ],
                min: null,
                max: null
              },
              imgUrl: ''
            },
            {
              id: 2,
              sortNo: 2, // 模拟题号
              releaseAnswerStr: 'C', // 模拟正确答案
              subject_type: 'img-text',
              layout_type: 2,
              layout_css: 1,
              title: '图文题 - 多选',
              answer: ['A', 'B'],
              releaseAnswer: 'C',
              type: 'checkbox',
              score: 2,
              detail: {
                list: [
                  {
                    id: 23141231,
                    key: 'A',
                    value: '选项1212',
                    imgUrl:
                      'https://t-alistatic01.e.vhall.com/upload/interacts/screen-imgs/202205/0c/b7/0cb718a8c30eff8115a25d575a2909ec.jpg'
                  },
                  {
                    id: 23141241,
                    key: 'B',
                    value:
                      '选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123',
                    imgUrl:
                      'https://t-alistatic01.e.vhall.com/upload/interacts/screen-imgs/202203/3c/a1/3ca171b039f3c8d98466d82c57009115.png'
                  },
                  {
                    id: 23141243,
                    key: 'C',
                    value:
                      '选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123',
                    imgUrl:
                      'https://t-alistatic01.e.vhall.com/upload/interacts/screen-imgs/202202/b6/0d/b60da041ef1789c0b3f05ee1f42ed5f0.jpg'
                  }
                ],
                min: null,
                max: null
              },
              imgUrl: ''
            },
            {
              id: 3,
              sortNo: 3, // 模拟题号
              releaseAnswerStr: 'C', // 模拟正确答案
              subject_type: 'img-text',
              layout_type: 1,
              layout_css: 2,
              title: '图文题 - 多选',
              answer: ['C'],
              releaseAnswer: ['C'],
              type: 'checkbox',
              score: 2,
              detail: {
                list: [
                  {
                    id: 23141231,
                    key: 'A',
                    value: '选项1212',
                    imgUrl:
                      'https://t-alistatic01.e.vhall.com/upload/interacts/screen-imgs/202111/3b/5a/3b5aa8434a50def129cda3a68f58fcba.jpg'
                  },
                  {
                    id: 23141241,
                    key: 'B',
                    value:
                      '选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123',
                    imgUrl:
                      'https://t-alistatic01.e.vhall.com/upload/interacts/screen-imgs/202111/6a/d3/6ad3c1aa1b8271c3949e4b6503b20a15.jpg'
                  },
                  {
                    id: 23141243,
                    key: 'C',
                    value:
                      '选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123',
                    imgUrl:
                      'https://t-alistatic01.e.vhall.com/upload/interacts/screen-imgs/202110/25/c7/25c7e7b1a8eccad068ba58a60069f8fc.jpg'
                  }
                ],
                min: null,
                max: null
              },
              imgUrl: ''
            },
            {
              id: 4,
              sortNo: 4, // 模拟题号
              releaseAnswerStr: 'C', // 模拟正确答案
              subject_type: 'text',
              layout_type: 1,
              layout_css: 1,
              title:
                '单选题1231231单选题1231231单选题1231231单选题1231231单选题1231231单选题1231231',
              answer: '',
              releaseAnswer: 'C',
              type: 'radio',
              score: 2,
              detail: {
                list: [
                  {
                    id: 23141231,
                    key: 'A',
                    value:
                      '选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212',
                    imgUrl: ''
                  },
                  {
                    id: 23141241,
                    key: 'B',
                    value:
                      '选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123',
                    imgUrl: ''
                  }
                ],
                min: null,
                max: null
              },
              imgUrl: ''
            },
            {
              id: 5,
              sortNo: 5, // 模拟题号
              releaseAnswerStr: 'C', // 模拟正确答案
              subject_type: 'text',
              layout_type: 2,
              layout_css: 1,
              title:
                '单选题1231231单选题1231231单选题1231231单选题1231231单选题1231231单选题1231231',
              answer: ['C'],
              releaseAnswer: ['C'],
              type: 'checkbox',
              score: 2,
              detail: {
                list: [
                  {
                    id: 23141231,
                    key: 'A',
                    value:
                      '选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212选项1212',
                    imgUrl: ''
                  },
                  {
                    id: 23141241,
                    key: 'B',
                    value:
                      '选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123选项123123',
                    imgUrl: ''
                  },
                  {
                    id: 23141251,
                    key: 'C',
                    value: 'SFSAFSDAFSAFDSAFSDFSDF',
                    imgUrl: ''
                  }
                ],
                min: null,
                max: null
              },
              imgUrl: ''
            }
          ],
          auto_push_switch: 0, // 自动推送 开关 0.否 1.是
          limit_time: 60, // 限制时间
          limit_time_switch: 1 // 限制时间开关 0.否 1.是
        }
      };
    },
    props: {
      // 快问快答 - id
      id: {
        required: true,
        type: [Number, String],
        default: ''
      },
      // 界面最大宽度
      maxWidth: {
        required: false,
        type: String,
        default: '1024px'
      },
      // 界面最大高度
      maxHeight: {
        required: false,
        type: String,
        default: '468px'
      },
      // 是否开启瀑布流模式
      waterfallFlow: {
        required: false,
        type: Boolean,
        default: false
      },
      // 是否做答模式
      answerType: {
        required: false,
        type: String,
        default: 'mock' // mock--模拟做题；release--真实答题；show--展示查看
      },
      // 每次展示的提数
      limit: {
        required: false,
        type: Number,
        default: 1
      }
    },
    watch: {
      answerIndex: {
        handler() {
          const questionAlls = this.previewInfo.jsonData;
          // this.questionList = []; // 重新布局定位
          let questionList = questionAlls.filter((item, index) => {
            if (this.limit <= 1) {
              return index == this.answerIndex;
            } else {
              let lastAnswerIndex = this.answerIndex == 0 ? 0 : this.answerIndex;
              let nexAnswerIndex = this.answerIndex + this.limit;
              return index >= lastAnswerIndex && index < nexAnswerIndex;
            }
          });
          this.questionList = questionList;
        },
        immediate: true,
        deep: true
      }
    },
    computed: {
      // 是否允许点击下一题
      isDisabledSave() {
        let questionList = this.questionList;
        let nullList = questionList.filter((item, index) => {
          return (
            (item.type === 'radio' && item.answer == '') ||
            (item.type == 'checkbox' && item.answer.length == 0)
          );
        });
        // 如若存在没有选择的题目，禁用下一题 or 提交按钮
        let isDisabledSave = nullList && nullList.length > 0;
        this.$emit('examCheckOption', isDisabledSave);
        return isDisabledSave;
      }
    },
    beforeCreate() {},
    methods: {
      // 活动下预览快问快答
      previewExamInfo() {
        this.loading = true;
        let params = {
          id: this.id // 试卷ID
        };
        this.$fetch('/v1/fqa/paper/get-info', this.$params(params))
          .then(res => {
            this.loading = false;
            let resData = res.data;
            resData.jsonData = resData.question_detail
              ? JSON.stringify(resData.question_detail)
              : {};
            resData.jsonData.map((item, index) => {
              item.sortNo = index + 1;
              item.releaseAnswerStr = item.releaseAnswer
                ? item.releaseAnswerStr.join('、')
                : item.releaseAnswer;
            });
            this.previewInfo = resData;
            // 通知外部题目变化
            this.$emit('change', {
              total: this.previewInfo.jsonData.length,
              findIndex: this.answerIndex,
              isFirst: this.isFirst,
              isEnd: this.isEnd
            });
            // 通知外部题目信息
            this.$emit('examData', this.previewInfo);
          })
          .catch(e => {
            this.loading = false;
            this.previewInfo = {};
          });
      },
      // 页面初始化
      async initComp() {
        console.log('触发成绩单查询。。。');
        this.resetQuestion();
        await this.$nextTick(() => {});
        // this.previewExamInfo();
        // 通知外部题目信息 【模拟】
        this.$emit('change', {
          total: this.previewInfo.jsonData.length,
          findIndex: this.answerIndex,
          isFirst: this.isFirst,
          isEnd: this.isEnd
        });
        // 通知外部题目信息 【模拟】
        this.$emit('examData', this.previewInfo);
      },
      // 上一题，序号变更
      lastQuestion() {
        let lastAnswerIndex = this.answerIndex - this.limit;
        if (lastAnswerIndex < 0) {
          this.isFirst = true;
          return;
        } else if (lastAnswerIndex == 0) {
          this.isFirst = true;
          this.answerIndex = lastAnswerIndex;
        } else {
          this.isFirst = false;
          this.answerIndex = lastAnswerIndex;
        }
        // 如果是答题状态
        if (this.answerType == 'release') {
          // TODO 触发接口
        }
        // 通知外部题目变化
        this.$emit('change', {
          total: this.previewInfo.jsonData.length,
          findIndex: lastAnswerIndex,
          isFirst: this.isFirst,
          isEnd: false
        });
      },
      // 下一题，序号变更
      nextQuestion() {
        let nextAnswerIndex = this.answerIndex + this.limit;
        if (nextAnswerIndex >= this.previewInfo.jsonData.length) {
          // 当前已经是最后一题
          this.isEnd = true;
          return;
        } else if (nextAnswerIndex == this.previewInfo.jsonData.length - 1) {
          // 当前已经是最后一题
          this.isEnd = true;
          this.answerIndex = nextAnswerIndex;
        } else {
          this.isEnd = false;
          this.answerIndex = nextAnswerIndex;
        }
        // 如果是答题状态
        if (this.answerType == 'release') {
          // TODO 触发接口
        }
        // 通知外部题目变化
        this.$emit('change', {
          total: this.previewInfo.jsonData.length,
          findIndex: nextAnswerIndex,
          isFirst: false,
          isEnd: this.isEnd
        });
      },
      // 重置答题记录
      resetQuestion() {
        this.answerIndex = 0; // 当前答题序号
        this.isFirst = 0; // 是否是第一道题
        this.isEnd = 0; // 是否最后一题
        this.$emit('change', {
          total: 0,
          findIndex: 0,
          isFirst: 0,
          isEnd: 0
        });
      }
    },
    created() {
      this.initComp();
    }
  };
</script>
<style lang="less" scoped>
  /* 答题面板 */
  .vmp-exam-info {
    margin: 24px auto 0 auto;
    overflow-x: hidden;
    overflow-y: auto;
    &--title {
      h1 {
        font-style: normal;
        font-weight: 500;
        font-size: 20px;
        line-height: 28px;
        color: rgba(0, 0, 0, 0.85);
      }
      margin-bottom: 14px;
    }
    &--question {
      h1 {
        span {
          margin-right: 24px;
        }
        margin-bottom: 16px;
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 24px;
        color: #262626;
      }
    }
    &--option {
      margin-bottom: 8px;
      padding: 0 24px 0 24px;
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 22px;
      color: #262626;
      img {
        width: 100%;
        height: auto;
        margin-bottom: 8px;
      }
      .vmp-exam-info--text {
        /deep/.el-radio,
        /deep/.el-checkbox {
          margin-right: 8px;
        }
        /deep/.el-radio__label,
        /deep/.el-checkbox__label {
          display: none;
        }
        div {
          display: inline-block;
          vertical-align: top;
          width: calc(100% - 22px); /* 减去单选按钮的宽度和一点点小间距 */
          font-style: normal;
          font-weight: 400;
          font-size: 14px;
          line-height: 22px;
          color: rgba(0, 0, 0, 0.85);
        }
      }
      &.max-width {
        width: calc(100% - 18px);
        display: block;
        border: 1px solid #f0f0f0;
        border-radius: 4px;
        padding: 8px 8px;
        &.left-right {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          img {
            display: inline-block;
            width: 50%;
          }
          .vmp-exam-info--text {
            display: inline-block;
            width: 50%;
            padding-left: 10px;
          }
        }
      }
      &.min-width {
        width: calc(50% - 34px);
        display: inline-block;
        border: 1px solid #f0f0f0;
        border-radius: 4px;
        padding: 8px 8px;
        margin-right: 16px;
      }
      /* 预览和答题模式样式 */
      &.page-show {
        &.max-width {
          width: 100%;
          border: none;
          padding: 0 0;
        }
        &.min-width {
          width: calc(50% - 16px);
          border: none;
          padding: 0 0;
        }
      }
    }
    .exam-way__no__waterfallFlow {
      // 非瀑布流
      .vmp-exam-info--option.min-width {
        width: calc(50% - 26px);
        margin-right: 0;
        &:nth-child(2n - 1) {
          margin-right: 16px;
        }
      }
    }
    &--result {
      margin-bottom: 16px;
      label {
      }
      span {
        &.success__tag {
          color: #0fba5a;
        }
      }
      strong {
        margin: 0 8px;
      }
    }
  }
</style>
