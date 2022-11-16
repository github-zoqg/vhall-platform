<template>
  <div class="vmp-exam-item-comp">
    <!-- 图片题 （selectType: 1单选；2多选。支持单选 or 多选）-->
    <h1>
      <span class="zdy-exam-question-type">{{ item.type == 'radio' ? '单选' : '多选' }}</span>
      {{ item.sortNo }}.{{ item.title }}：
      <strong v-if="item.score > 0">({{ item.score }}分)</strong>
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
            `${item.layout_css == 1 ? 'top-bottom' : 'left-right'}`,
            `bg_answer__${sonItem.answerStatus}`
          ]"
          v-for="(sonItem, sonIndex) in item.detail.list"
          :key="`qt_${index}_son${sonIndex}`"
          @click.stop="lineChecked(item, sonItem)"
        >
          <div
            :class="[
              'vmp-exam-info--box',
              `${
                ['no', 'yes'].includes(sonItem.answerStatus)
                  ? 'text__min__width'
                  : 'text__max__width'
              }`
            ]"
          >
            <div
              class="vmp-exam-info--img object_fit_1"
              v-if="item.subject_type == 'img-text' && sonItem.imgUrl != undefined"
            >
              <img :src="sonItem.imgUrl" alt="" />
            </div>
            <div class="vmp-exam-info--text">
              <el-radio
                v-model="item.ownerAnswer"
                :label="sonItem.key"
                :name="`radio_no_${item.id}`"
                v-if="item.type === 'radio'"
                class="zdy-exam-radio"
                :disabled="answerType == 'show'"
              ></el-radio>
              <el-checkbox
                v-model="sonItem.answer"
                :label="sonItem.key"
                :name="`checkbox_no_${item.id}`"
                v-if="item.type === 'checkbox'"
                class="zdy-exam-checkbox"
                :disabled="answerType == 'show'"
                @change.prevent.stop="setItemCheckAnswer(sonItem, item)"
              ></el-checkbox>
              <div
                :class="[
                  'text--content',
                  `item_${item.id}_option_${sonIndex}`,
                  `position_${sonItem.isMoreHeight || 'normal'}`
                ]"
                :ref="`item_${item.id}_option_${sonIndex}`"
                v-text="sonItem.key + '、' + sonItem.value"
              ></div>
              <div class="text--icon--inline" v-if="['no', 'yes'].includes(sonItem.answerStatus)">
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
              @click.prevent.stop="
                $forceUpdate();
                changeStatus(sonItem);
              "
            >
              {{ sonItem.isMoreHeight == 'open' ? '收起' : '展开' }}
            </span>
          </div>
          <div class="text--icon" v-if="['no', 'yes'].includes(sonItem.answerStatus)">
            <img src="../images/icon_exam_option_close.png" v-show="sonItem.answerStatus == 'no'" />
            <img src="../images/icon_exam_option_yes.png" v-show="sonItem.answerStatus == 'yes'" />
          </div>
        </div>
      </template>
    </div>
    <!-- 答案结果 -->
    <div class="vmp-exam-info--question--result" v-if="answerType == 'show'">
      <h2>答案</h2>
      <div class="question--result--box">
        <div class="question--result--left">
          <p>
            <strong>正确答案：</strong>
            {{ item.showReleaseAnswer }}
          </p>
        </div>
        <div class="question--result--center">
          <p class="answer_yes">
            <strong>您的答案：</strong>
            {{ item.showOwnerAnswer }}
          </p>
        </div>
        <div class="question--result--right">
          <img src="../images/icon_correct.png" alt="" v-if="item.answerRes == 'answer_yes'" />
          <img
            src="../images/icon_incorrect.png"
            alt=""
            v-else-if="item.answerRes == 'answer_no'"
          />
          <img src="../images/icon_no_answer.png" alt="" v-else />
          <span
            :class="
              item.answerRes == 'answer_yes'
                ? 'color-green'
                : item.answerRes == 'answer_no'
                ? 'color-red'
                : 'color-gray'
            "
          >
            {{
              item.answerRes == 'answer_yes'
                ? '正确'
                : item.answerRes == 'answer_no'
                ? '错误'
                : '未作答'
            }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'VmpExamCheckbox',
    data() {
      return {};
    },
    components: {},
    props: {
      item: {
        required: true,
        type: Object,
        default: () => {}
      },
      index: {
        required: true,
        type: Number,
        default: 0
      },
      // 是否做答模式
      answerType: {
        required: false,
        type: String,
        default: 'mock' // mock--模拟做题；release--真实答题；show--展示查看
      }
    },
    beforeCreate() {},
    created() {
      this.initComp();
    },
    methods: {
      lineChecked(item, sonItem) {
        if (item.type == 'checkbox') {
          sonItem.answer = !sonItem.answer;
          this.setItemCheckAnswer(sonItem, item);
        } else if (item.type == 'radio') {
          item.ownerAnswer = sonItem.key;
        }
      },
      // 多选题设置的时候，改动任务项其它内容
      setItemCheckAnswer(sonItem, item) {
        let keys = [];
        item.detail.list.forEach(fItem => {
          if (fItem.answer && !keys.includes(fItem.answer)) {
            // 勾中了，并且没在数组里，放入。
            keys.push(fItem.key);
          }
        });
        item.ownerAnswer = keys.join(',');
      },
      /**
       * 聊天图片预览
       * */
      // 预览聊天图片
      previewImg(image, item) {
        let imageList = item.detail.list.filter(akItem => akItem.imgUrl);
        let newImageList = imageList.map(akItem => akItem.imgUrl);
        let index = newImageList.indexOf(image);
        //处理掉图片携带的查询参数，只保留主要链接
        this.$emit('compImgPreview', {
          previewImgList: newImageList.map(akItem => akItem.split('?')[0]),
          index: index,
          image: image
        });
      },
      // 标记题目-选项 是否需要 展开or收缩
      setIsMoreHeight() {
        let item = this.item;
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
            console.log(item.id, parseFloat(domVo.height), maxHeight);
            if (parseInt(domVo.height) >= parseInt(maxHeight)) {
              this.itemVo.detail.list[sonIndex].isMoreHeight = 'close';
            } else {
              this.itemVo.detail.list[sonIndex].isMoreHeight = '';
            }
          }
        });
        this.$forceUpdate();
      },
      // 切换题目-选项 收缩 or 展开效果
      changeStatus(item) {
        if (item.isMoreHeight == '') return;
        item.isMoreHeight = item.isMoreHeight == 'open' ? 'close' : 'open';
        this.$forceUpdate();
      },
      // 页面初始化
      async initComp() {
        this.itemVo = this.item;
        await this.$nextTick(() => {});
        this.setIsMoreHeight();
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
        strong {
          font-family: 'PingFang HK';
          font-style: normal;
          font-weight: 400;
          font-size: 28px;
          line-height: 40px;
          color: #262626;
          margin-bottom: 24px;
        }
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
      &--result {
        padding-top: 16px;
        padding-bottom: 16px;
        h2 {
          font-family: 'PingFang HK';
          font-style: normal;
          font-weight: 400;
          font-size: 28px;
          line-height: 40px;
          color: #262626;
          margin-bottom: 24px;
        }
        .question--result--box {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .question--result--left {
          display: flex;
          flex-wrap: wrap;
          margin-right: 32px;
          p {
            word-break: break-all;
            font-style: normal;
            font-weight: 400;
            font-size: 28px;
            line-height: 36px;
            color: #0fba5a;
            strong {
              color: #262626;
            }
          }
          margin-right: 32px;
        }
        .question--result--center {
          display: flex;
          flex-wrap: wrap;
          margin-right: 32px;
          p {
            word-break: break-all;
            font-style: normal;
            font-weight: 400;
            font-size: 28px;
            line-height: 36px;
            &.answer_yes {
              color: #0fba5a;
              strong {
                color: #262626;
              }
            }
            &.answer_no {
              color: #fb2626;
              strong {
                color: #262626;
              }
            }
          }
        }
        .question--result--right {
          margin-right: 12px;
          padding: 4px 16px;
          border: 1px solid #ffd1c9;
          border-radius: 8px;
          transform: rotate(-5deg);
          display: flex;
          flex-direction: row;
          align-items: center;
          flex-shrink: 0;
          img {
            width: 48px;
            height: 48px;
            margin-right: 4px;
            transform: rotate(-5deg);
          }
          span {
            font-style: normal;
            font-weight: 400;
            font-size: 24px;
            line-height: 32px;
            transform: rotate(-5deg);
            &.color-green {
              color: #0fba5a;
            }
            &.color-red {
              color: #fb2626;
            }
            &.color-default {
              color: #262626;
            }
          }
        }
      }
    }
    &--option {
      background: rgba(0, 0, 0, 0.03);
      border-radius: 8px;
      margin-bottom: 32px;
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
          &.position_close {
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
                  width: 100%;
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
          /* 左右分布 */
          &.left-right {
            .text--icon {
              display: none;
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
      &.bg_answer__undefined {
        &:hover,
        &:active {
          background: rgba(230, 247, 255, 0.65);
        }
      }
      /* 查看的时候才有 正确 or 错误态 */
      &.page-show {
        /* 成功答案 */
        &.bg_answer__yes {
          background: rgba(225, 250, 232, 0.65);
          /deep/.el-radio__input.is-disabled.is-checked .el-radio__inner::after {
            background-color: #0fba5a;
          }
          /deep/.el-radio__input.is-disabled .el-radio__inner,
          .el-radio__input.is-disabled.is-checked .el-radio__inner {
            background: #ffffff;
            border: 2px solid #0fba5a;
            border-color: #0fba5a;
            cursor: not-allowed;
          }
        }
        /* 错误答案 */
        &.bg_answer__no {
          background: rgba(255, 242, 240, 0.65);
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
