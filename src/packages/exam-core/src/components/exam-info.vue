<template>
  <div>
    <div class="vmp-exam-info">
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
          <span class="zdy-exam-question-type">{{ item.type == 'radio' ? '单选' : '多选' }}</span>
          {{ item.sortNo }}.{{ item.title }}
        </h1>
        <!-- 非瀑布流[题目-答案区域]
           .page-${answerType}  mock/show/release 作答类别
           .question_${item.subject_type} 题目类型
           .max-width  一排一列
           .min-width  一排双列
           .top-bottom 上下排布
           .left-right 左右排布
        -->
        <div class="exam-way__no__waterfallFlow">
          <template v-if="item.detail">
            <div
              :class="[
                'vmp-exam-info--option',
                `question_${item.subject_type}`,
                `page-${answerType}`,
                `${item.layout_type == 1 ? 'max-width' : 'min-width'}`,
                `${item.layout_css == 1 ? 'top-bottom' : 'left-right'}`
              ]"
              v-for="(sonItem, sonIndex) in item.detail.list"
              :key="`qt_${index}_son${sonIndex}`"
            >
              <div
                :class="[
                  'vmp-exam-info--box',
                  `${sonItem.answerStatus ? 'text__min__width' : 'text__max__width'}`
                ]"
              >
                <div
                  class="vmp-exam-info--img"
                  v-if="item.subject_type == 'img-text' && sonItem.imgUrl != undefined"
                >
                  <img
                    lazy
                    :src="sonItem.imgUrl"
                    :preview-src-list="[sonItem.imgUrl]"
                    width="100%"
                    height="100%"
                    class="object_fit_1"
                  />
                </div>
                <div class="vmp-exam-info--text">
                  <el-radio
                    v-model="item.answer"
                    :label="sonItem.key"
                    :name="`radio_no_${item.id}`"
                    v-if="item.type === 'radio'"
                    class="zdy-exam-radio"
                  ></el-radio>
                  <el-checkbox
                    v-model="item.answer"
                    :label="sonItem.key"
                    :name="`checkbox_no_${item.id}`"
                    v-if="item.type === 'checkbox'"
                    class="zdy-exam-checkbox"
                  ></el-checkbox>
                  <div
                    :class="[
                      'text--content',
                      `item_${item.id}_option_${sonIndex}`,
                      `position_${sonItem.isMoreHeight || 'normal'}`
                    ]"
                    :ref="`item_${item.id}_option_${sonIndex}`"
                  >
                    {{ sonItem.key + '、' + sonItem.value }}
                  </div>
                  <div class="text--icon--inline" v-if="sonItem.answerStatus">
                    <img
                      src="../images/icon_exam_option_close.png"
                      v-show="sonItem.answerStatus == 'no'"
                    />
                    <img
                      src="../images/icon_exam_option_yes.png"
                      v-show="sonItem.answerStatus == 'yes'"
                    />
                  </div>
                </div>
                <span
                  class="text--content__position"
                  v-if="sonItem && sonItem.isMoreHeight"
                  @click="
                    $forceUpdate();
                    changeStatus(sonItem);
                  "
                >
                  {{ sonItem.isMoreHeight == 'open' ? '收起' : '展开' }}
                </span>
              </div>
              <div class="text--icon" v-if="sonItem.answerStatus">
                <img
                  src="../images/icon_exam_option_close.png"
                  v-show="sonItem.answerStatus == 'no'"
                />
                <img
                  src="../images/icon_exam_option_yes.png"
                  v-show="sonItem.answerStatus == 'yes'"
                />
              </div>
            </div>
          </template>
        </div>
        <!-- 答案结果 -->
        <div class="vmp-exam-info--result" v-if="answerType == 'show'">
          <h1>答案</h1>
          <div>
            <div>正确答案：</div>
            <div>AaAbAcAABBCAc</div>
          </div>
          <div>
            <div>您的答案：</div>
            <div>AaAbAcAABBCAc</div>
          </div>
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
        answerIndex: null, // 当前答题序号
        isFirst: true, // 是否是第一道题
        isEnd: false, // 是否最后一题
        questionList: [], // 可答题数组
        previewInfo: null
      };
    },
    props: {
      // 快问快答 - id
      id: {
        required: true,
        type: [Number, String],
        default: ''
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
          if (this.previewInfo && this.previewInfo.jsonData) {
            const questionAlls = this.previewInfo.jsonData;
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
          }
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
      mockExamInfo() {
        let res = {
          code: 200,
          data: {
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
                title: '图文题 - 单选图文题 - 单选',
                answer: '',
                releaseAnswer: 'C',
                type: 'radio',
                score: 2,
                detail: {
                  list: [
                    {
                      id: 2314123,
                      key: 'A',
                      value: '选项1212选项1212选项1212选项1212选项1212选项1212',
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
            limit_time_second: 3600, // 限制时间*60，转换为秒
            limit_time_switch: 1 // 限制时间开关 0.否 1.是
          }
        };
        return res;
      },
      renderPreviewInfo(res) {
        let resData = res.data;
        resData.jsonData = resData.question_detail
          ? JSON.stringify(resData.question_detail)
          : resData.jsonData || [];
        resData.jsonData.map((item, index) => {
          item.sortNo = index + 1;
          item.releaseAnswerStr =
            item.releaseAnswer && Array.isArray(item.releaseAnswer)
              ? item.releaseAnswer.join('、')
              : item.releaseAnswer;
          if (this.answerType == 'show') {
            item.detail.list.forEach((sonItem, sonIndex) => {
              if (Array.isArray(item.releaseAnswer) && item.releaseAnswer.includes(sonItem.key)) {
                // 复选框 & 已勾选
                sonItem.answerStatus = 'yes';
              } else if (item.releaseAnswer == sonItem.key) {
                // 单选题 & 已勾选
                sonItem.answerStatus = 'yes';
              } else {
                sonItem.answerStatus = 'none';
              }
            });
          }
        });
        // 限制时间，分钟转换为秒
        resData.limit_time_second = resData.limit_time > 0 ? Number(resData.limit_time) * 60 : 0;
        this.previewInfo = resData;
        // 通知外部题目变化
        if (this.answerIndex == null) {
          this.answerIndex = 0;
        }
        this.$emit('change', {
          total: this.previewInfo.jsonData.length,
          findIndex: this.answerIndex,
          isFirst: this.isFirst,
          isEnd: this.isEnd
        });
        // 通知外部题目信息
        this.$emit('examData', this.previewInfo);
      },
      // 活动下预览快问快答
      previewExamInfo() {
        this.loading = true;
        let params = {
          id: this.id // 试卷ID
        };
        let res = this.mockExamInfo();
        this.renderPreviewInfo(res);
        return;
        // return this.$fetch('/v1/fqa/paper/get-info', this.$params(params))
        //   .then(res => {
        //     this.loading = false;
        //     this.renderPreviewInfo(res);
        //   })
        //   .catch(e => {
        //     this.loading = false;
        //     this.previewInfo = {};
        //   });
      },
      // 页面初始化
      async initComp() {
        console.log('触发成绩单查询。。。');
        this.answerIndex = null;
        await this.previewExamInfo();
        this.resetQuestion();
        await this.$nextTick(() => {});
        console.log('ak', this.questionList);
        this.setIsMoreHeight();
      },
      // 标记-是否需要 展开or收缩
      setIsMoreHeight() {
        // isMoreHeight: '', // ‘’ 不需要展示收缩；open 开启状态，需要展示，文案“收缩”；close 关闭状态，需要展示，文案“展开”
        this.questionList.map((item, index) => {
          let options = item.detail?.list || [];
          options.forEach((sonItem, sonIndex) => {
            let dom = this.$refs[`item_${item.id}_option_${sonIndex}`];
            if (dom) {
              let domVo = window.getComputedStyle(dom[0]);
              let maxHeight =
                item.layout_type == 1
                  ? parseFloat(domVo['line-height']) * 3
                  : item.layout_css == 2
                  ? parseFloat(domVo['line-height']) * 4
                  : parseFloat(domVo['line-height']) * 3; // 双列的时候，四行；单列的时候，3行高度
              console.log(parseFloat(domVo.height), maxHeight);
              if (parseInt(domVo.height) >= parseInt(maxHeight)) {
                item.detail.list[sonIndex].isMoreHeight = 'close';
              } else {
                item.detail.list[sonIndex].isMoreHeight = '';
              }
            }
          });
        });
        console.log('当前列表', this.questionList);
        this.$forceUpdate();
      },
      // 切换收缩 or 展开效果
      changeStatus(item) {
        if (item.isMoreHeight == '') return;
        item.isMoreHeight = item.isMoreHeight == 'open' ? 'close' : 'open';
        this.$forceUpdate();
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
        this.isFirst = false;
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
          isFirst: this.isFirst,
          isEnd: this.isEnd
        });
      },
      // 重置答题记录
      resetQuestion() {
        this.answerIndex = 0; // 当前答题序号
        this.isFirst = true; // 是否是第一道题
        this.isEnd = false; // 是否最后一题
        this.$emit('change', {
          total: 0,
          findIndex: 0,
          isFirst: this.isFirst,
          isEnd: this.isEnd
        });
      }
    }
  };
</script>
<style lang="less" scoped>
  /* 答题面板 */
  .vmp-exam-info {
    margin: 32px auto 0 auto;
    padding-bottom: 160px;
    .exam-way__no__waterfallFlow {
      display: flex;
      justify-items: stretch;
      flex-wrap: wrap;
      justify-content: flex-start;
    }
    &--question {
      h1 {
        font-family: 'PingFang HK';
        font-style: normal;
        font-weight: 400;
        font-size: 28px;
        line-height: 40px;
        color: #262626;
        margin-bottom: 24px;
      }
      .zdy-exam-question-type {
        background: rgba(251, 38, 38, 0.15);
        font-family: 'Inter';
        font-style: normal;
        font-weight: 500;
        font-size: 22px;
        line-height: 28px;
        color: #fb2626;
        padding: 4px 8px;
      }
    }
    &--option {
      background: rgba(0, 0, 0, 0.03);
      border-radius: 8px;
      margin-bottom: 24px;
      font-style: normal;
      font-weight: 400;
      font-size: 14px;
      line-height: 22px;
      color: #262626;
      position: relative;
      .vmp-exam-info--box {
        height: 100%;
        width: 100%;
      }
      .text--content__position {
        position: absolute;
        font-style: normal;
        font-weight: 400;
        font-size: 28px;
        line-height: 40px;
        color: #0a7ff5;
      }
      .vmp-exam-info--img {
        background: #000000;
        img {
          width: 100%;
          height: 100%;
          border-radius: 2px;
          object-fit: contain;
          object-position: center;
          &.object_fit_1 {
            object-fit: fill;
          }
          &.object_fit_2 {
            object-fit: cover;
            object-position: left top;
          }
        }
      }
      .vmp-exam-info--text {
        display: flex;
        justify-content: space-between;
        align-items: center;
        /deep/.zdy-exam-radio,
        /deep/.zdy-exam-checkbox {
          width: 32px;
          height: 32px;
          margin-right: 16px;
          align-self: flex-start;
          padding-top: 4px;
        }
        /deep/.el-radio__label,
        /deep/.el-checkbox__label {
          display: none;
        }
        .text--content {
          width: calc(100% - 114px); /* 减去单选按钮的宽度和一点点小间距 */
          font-style: normal;
          font-weight: 400;
          font-size: 28px;
          line-height: 40px;
          color: rgba(0, 0, 0, 0.85);
          margin-right: auto;
          word-break: break-all;
          &.position_close,
          &.position_normal {
            overflow: hidden;
            text-overflow: ellipsis;
            text-overflow: -webkit-ellipsis-lastline;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            line-clamp: 3;
            -webkit-box-orient: vertical;
          }
          &.position_open {
            height: auto;
          }
        }
      }
      .text--icon {
        height: 100%;
        width: 42px;
        margin-left: 10px;
        display: inline-flex;
        img {
          width: 42px;
          height: 42px;
          align-self: center;
        }
      }
      .text--icon--inline {
        height: 100%;
        width: 42px;
        margin-left: 10px;
        img {
          width: 42px;
          height: 42px;
          align-self: unset;
        }
      }
      /* 图文题 */
      &.question_img-text {
        padding: 16px 16px;
        .text--content__position {
          right: 68px;
          bottom: 16px;
        }
        /* 一排一列 */
        &.max-width {
          width: 100%;
          /* 左右分布 */
          &.left-right {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            .text--icon {
              height: 100%;
              width: 42px;
              margin-left: 10px;
              display: inline-flex;
              img {
                width: 42px;
                height: 42px;
                align-self: center;
              }
            }
            .text--icon--inline {
              display: none;
            }
            .vmp-exam-info--box {
              display: inline-flex;
              justify-content: space-between;
              align-items: flex-start;
              .vmp-exam-info--img {
                width: 140px;
                height: 140px;
                margin-bottom: 0;
                margin-right: 16px;
              }
              .text--content__position {
                bottom: 36px;
              }
              &.text__max__width {
                .vmp-exam-info--text {
                  margin-right: auto;
                  width: calc(100% - 156px);
                }
                .text--content {
                  width: 100%;
                }
                .text--content__position {
                  right: 16px;
                }
              }
              &.text__min__width {
                .vmp-exam-info--text {
                  margin-right: auto;
                  width: calc(100% - 156px);
                }
                .text--content {
                  width: calc(100% - 114px); /* 减去单选按钮的宽度和一点点小间距 */
                }
                .text--content__position {
                  right: 68px;
                }
              }
            }
          }
          /* 上下分布 */
          &.top-bottom {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            .text--icon {
              height: 100%;
              width: 42px;
              margin-left: 10px;
              display: inline-flex;
              img {
                width: 42px;
                height: 42px;
                align-self: center;
              }
            }
            .vmp-exam-info--box {
              .vmp-exam-info--img {
                width: 300px;
                height: 168px;
                margin-bottom: 16px;
                margin-right: 0;
              }
              &.text__max__width {
                .text--content__position {
                  right: 16px;
                }
              }
              &.text__min__width {
                .text--content__position {
                  right: 68px;
                }
              }
              .vmp-exam-info--text {
                margin-right: auto;
                width: 100%;
                .text--icon--inline {
                  display: none;
                }
                .text--content {
                  width: 100%;
                }
              }
            }
          }
        }
        /* 一排双列 */
        &.min-width {
          display: inline-block;
          vertical-align: top;
          width: calc(50% - 8px);
          margin-right: 0;
          &:nth-child(2n + 1) {
            margin-right: 16px;
          }
          /* 上下分布 */
          &.top-bottom {
            .text--icon {
              display: none;
            }
            .vmp-exam-info--box {
              .vmp-exam-info--img {
                width: 303px;
                height: 171px;
                margin-bottom: 16px;
              }
              .vmp-exam-info--text {
                min-height: calc(100% - 187px);
                .text--content {
                  align-self: flex-start;
                  &.position_close,
                  &.position_normal {
                    -webkit-line-clamp: 4;
                    line-clamp: 4;
                  }
                }
              }
              &.text__max__width {
                .vmp-exam-info--text {
                  margin-right: auto;
                  width: 100%;
                }
                .text--content {
                  width: 100%;
                }
                .text--content__position {
                  right: 16px;
                }
              }
              &.text__min__width {
                .vmp-exam-info--text {
                  margin-right: auto;
                  width: calc(100% - 156px);
                }
                .text--content {
                  width: calc(100% - 114px); /* 减去单选按钮的宽度和一点点小间距 */
                }
                .text--content__position {
                  right: 68px;
                }
              }
            }
          }
        }
      }
      /* 文字题 */
      &.question_text {
        padding: 20px 16px 20px 20px;
        .text--content__position {
          right: 68px;
          bottom: 20px;
        }
        /* 一排一列 */
        &.max-width {
          width: 100%;
          /* 上下分布 */
          &.top-bottom {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            .text--icon {
              height: 100%;
              width: 42px;
              margin-left: 10px;
              display: inline-flex;
              img {
                width: 42px;
                height: 42px;
                align-self: center;
              }
            }
            .vmp-exam-info--box {
              .vmp-exam-info--text {
                margin-right: auto;
                width: 100%;
                .text--icon--inline {
                  display: none;
                }
                .text--content {
                  width: 100%;
                }
              }
              &.text__max__width {
                .text--content__position {
                  right: 16px;
                }
              }
              &.text__min__width {
                .text--content__position {
                  right: 68px;
                }
              }
            }
          }
        }
        /* 一排双列 */
        &.min-width {
          display: inline-block;
          vertical-align: top;
          width: calc(50% - 8px);
          margin-right: 0;
          &:nth-child(2n + 1) {
            margin-right: 16px;
          }
          /* 上下分布 */
          &.top-bottom {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            .text--icon {
              height: 100%;
              width: 42px;
              margin-left: 10px;
              display: inline-flex;
              img {
                width: 42px;
                height: 42px;
                align-self: center;
              }
            }
            .vmp-exam-info--box {
              .vmp-exam-info--text {
                margin-right: auto;
                width: 100%;
                .text--icon--inline {
                  display: none;
                }
                .text--content {
                  width: 100%;
                  &.position_close,
                  &.position_normal {
                    -webkit-line-clamp: 4;
                    line-clamp: 4;
                  }
                }
              }
              &.text__max__width {
                .text--content__position {
                  right: 16px;
                }
              }
              &.text__min__width {
                .text--content__position {
                  right: 68px;
                }
              }
            }
          }
        }
      }
      /* hover、active态 */
      &:hover,
      &:active {
        background: rgba(230, 247, 255, 0.65);
      }
      /* 成功答案 */
      &.answer__yes {
        background: rgba(255, 242, 240, 0.65);
      }
      /* 错误答案 */
      &.answer__no {
        background: rgba(225, 250, 232, 0.65);
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
