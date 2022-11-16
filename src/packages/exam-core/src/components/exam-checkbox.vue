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
                @change="setItemCheckAnswer(sonItem, item)"
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
<style lang="less" scoped></style>
