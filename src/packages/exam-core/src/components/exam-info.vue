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
                  @click="previewImg(sonItem.imgUrl, item)"
                  :style="`backgroundImage: url('${
                    sonItem.imgUrl + '?x-oss-process=image/resize,m_lfit,h_84,w_86'
                  }')`"
                  alt="图片加载失败"
                ></div>
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
                  <div
                    class="text--icon--inline"
                    v-if="['no', 'yes'].includes(sonItem.answerStatus)"
                  >
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
    </div>
    <!-- 图片预览 -->
    <img-preview
      ref="imgPreview"
      v-if="imgPreviewVisible"
      :images="previewImgList"
      @closeImgPreview="onClosePreviewImg"
    ></img-preview>
  </div>
</template>
<script>
  import ImgPreview from './img-preview.vue';
  import { cl_previewImg, cl_join, cl_left } from '@/app-shared/client/client-methods.js';
  export default {
    name: 'VmpExamInfo',
    data() {
      return {
        loading: false,
        answerIndex: null, // 当前答题序号
        isFirst: true, // 是否是第一道题
        isEnd: false, // 是否最后一题
        questionList: [], // 可答题数组
        previewInfo: null,
        imgPreviewVisible: false // 图片是否展示
      };
    },
    components: {
      ImgPreview
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
            (item.type === 'radio' && item.questionAnswer == '') ||
            (item.type == 'checkbox' && item.questionAnswer.split(',').length == 0)
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
        this.previewImgList = newImageList.map(akItem => akItem.split('?')[0]);
        if (this.$route.query.assistantType) {
          cl_previewImg({ list: this.previewImgList, index });
          return;
        }
        this.imgPreviewVisible = true;
        this.$nextTick(() => {
          this.$refs.imgPreview.jumpToTargetImg(index);
        });
      },
      //关闭预览图片弹窗之后的处理
      onClosePreviewImg() {
        this.imgPreviewVisible = false;
      },
      // 快问快答详情-mock数据
      mockExamInfo() {
        let formJson = {
          id: 731682,
          title: '标题',
          description: '问卷简介',
          publish: 'Y',
          start_time: null,
          app_id: 'd317f559',
          third_party_user_id: null,
          extension: '扩展信息',
          created_at: '2022-11-11 15:31:53',
          updated_at: '2022-11-11 15:31:53',
          detail: [
            {
              id: 2533558,
              third_party_user_id: null,
              title:
                '单选题题目最多50个字单选题题目最多50个字单选题题目最多50个字单选题题目最多50个字单选题题目最',
              type: 'radio',
              placeholder: null,
              verification: 'N',
              required: 'N',
              score: 0,
              style: '',
              ext: '',
              created_at: '2022-11-11 15:31:53',
              updated_at: '2022-11-11 15:31:53',
              custom_id: null,
              app_id: 'd317f559',
              custom_ques: 2,
              extension: '',
              analysis: '',
              detail: {
                list: [
                  {
                    id: 2388718,
                    is_answer: 0,
                    key: 'A',
                    value: '选项单选题题目最多50个字单选题题目最多50个字',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533558,
                    imgUrl: ''
                  },
                  {
                    id: 2388719,
                    is_answer: 0,
                    key: 'B',
                    value:
                      '单选题题目最多50个字单选题题目最多50个字单选题题目最多50个字单选题题目最多50个字单选题题目最',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533558,
                    imgUrl: ''
                  },
                  {
                    id: 2388720,
                    is_answer: 0,
                    key: 'C',
                    value: '单选题题目最多50个字',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533558,
                    imgUrl: ''
                  },
                  {
                    id: 2388721,
                    is_answer: 0,
                    key: 'D',
                    value: '单选题选项',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533558,
                    imgUrl: ''
                  }
                ],
                min: null,
                max: null
              },
              imgUrl: ''
            },
            {
              id: 2533559,
              third_party_user_id: null,
              title:
                '多选题名称最多50个字多选题名称最多50个字多选题名称最多50个字多选题名称最多50个字多选题名称最',
              type: 'checkbox',
              placeholder: null,
              verification: 'N',
              required: 'N',
              score: 0,
              style: '',
              ext: '',
              created_at: '2022-11-11 15:31:53',
              updated_at: '2022-11-11 15:31:53',
              custom_id: null,
              app_id: 'd317f559',
              custom_ques: 2,
              extension: '',
              analysis: '',
              detail: {
                list: [
                  {
                    id: 2388722,
                    is_answer: 0,
                    key: 'A',
                    value: '图片答案1111111111111111111111111111111111111111111111',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533559,
                    imgUrl:
                      'http://vhallyun-static.oss-cn-beijing.aliyuncs.com/form/20221111152841/9161555b01dea66ec50f04f9a839226e/origin.jpg'
                  },
                  {
                    id: 2388723,
                    is_answer: 0,
                    key: 'B',
                    value:
                      '选项2最多50个字选项2最多50个字选项2最多50个字选项2最多50个字选项2最多50个字选项2最多',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533559,
                    imgUrl:
                      'http://vhallyun-static.oss-cn-beijing.aliyuncs.com/form/20221111152938/7c90e80a17388e1c5d0597f133bf4651/origin.jpg'
                  },
                  {
                    id: 2388724,
                    is_answer: 0,
                    key: 'C',
                    value:
                      '华为合伙人沃尔沃华为合伙人沃尔沃华为合伙人沃尔沃华为合伙人沃尔沃华为合伙人沃尔沃华为合伙人沃尔沃华为',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533559,
                    imgUrl:
                      'http://vhallyun-static.oss-cn-beijing.aliyuncs.com/form/20221111153019/71f3d1ea1ccfe7302036206c002eead1/origin.jpg'
                  },
                  {
                    id: 2388725,
                    is_answer: 0,
                    key: 'D',
                    value: '黑呵呵呵呵呵',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533559,
                    imgUrl:
                      'http://vhallyun-static.oss-cn-beijing.aliyuncs.com/form/20221111153027/bf2b8f0273e9aeeccc958291ead4d4df/origin.jpg'
                  }
                ],
                min: 2,
                max: 10
              },
              imgUrl: ''
            },
            {
              id: 2533560,
              third_party_user_id: null,
              title:
                '多选题题纯文字，和鹅鹅鹅饿多选题题纯文字，和鹅鹅鹅饿多选题题纯文字，和鹅鹅鹅饿多选题题纯文字，和鹅鹅',
              type: 'checkbox',
              placeholder: null,
              verification: 'N',
              required: 'N',
              score: 0,
              style: '',
              ext: '',
              created_at: '2022-11-11 15:31:53',
              updated_at: '2022-11-11 15:31:53',
              custom_id: null,
              app_id: 'd317f559',
              custom_ques: 2,
              extension: '',
              analysis: '',
              detail: {
                list: [
                  {
                    id: 2388726,
                    is_answer: 0,
                    key: 'A',
                    value: '选项1123123123选项1123123123选项1123123123选项1123123123选项',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533560,
                    imgUrl: ''
                  },
                  {
                    id: 2388727,
                    is_answer: 0,
                    key: 'B',
                    value: 'AKSFSDFAKSFSDFAKSFSDFAKSFSDFAKSFSDFAKSFSDFAKSFSDFA',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533560,
                    imgUrl: ''
                  },
                  {
                    id: 2388728,
                    is_answer: 0,
                    key: 'C',
                    value: 'WORDKSFAJFLAJSFLSAJDLKFSDAWORDKSFAJFLAJSFLSAJDLKFS',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533560,
                    imgUrl: ''
                  },
                  {
                    id: 2388729,
                    is_answer: 0,
                    key: 'D',
                    value: 'WORDKSFAJFLAJSFLSAJDLKFSDA4',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533560,
                    imgUrl: ''
                  },
                  {
                    id: 2388730,
                    is_answer: 0,
                    key: 'E',
                    value: '选项啊',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533560,
                    imgUrl: ''
                  }
                ],
                min: 2,
                max: 10
              },
              imgUrl: ''
            },
            {
              id: 2533561,
              third_party_user_id: null,
              title:
                '多选题名称最多50个字多选题名称最多50个字多选题名称最多50个字多选题名称最多50个字多选题名称最',
              type: 'checkbox',
              placeholder: null,
              verification: 'N',
              required: 'N',
              score: 0,
              style: '',
              ext: '',
              created_at: '2022-11-11 15:31:53',
              updated_at: '2022-11-11 15:31:53',
              custom_id: null,
              app_id: 'd317f559',
              custom_ques: 2,
              extension: '',
              analysis: '',
              detail: {
                list: [
                  {
                    id: 2388726,
                    is_answer: 0,
                    key: 'A',
                    value: '图片答案1111111111111111111111111111111111111111111111',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533561,
                    imgUrl:
                      'http://vhallyun-static.oss-cn-beijing.aliyuncs.com/form/20221111152841/9161555b01dea66ec50f04f9a839226e/origin.jpg'
                  },
                  {
                    id: 2388727,
                    is_answer: 0,
                    key: 'B',
                    value:
                      '选项2最多50个字选项2最多50个字选项2最多50个字选项2最多50个字选项2最多50个字选项2最多',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533561,
                    imgUrl:
                      'http://vhallyun-static.oss-cn-beijing.aliyuncs.com/form/20221111152938/7c90e80a17388e1c5d0597f133bf4651/origin.jpg'
                  },
                  {
                    id: 2388728,
                    is_answer: 0,
                    key: 'C',
                    value:
                      '华为合伙人沃尔沃华为合伙人沃尔沃华为合伙人沃尔沃华为合伙人沃尔沃华为合伙人沃尔沃华为合伙人沃尔沃华为',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533561,
                    imgUrl:
                      'http://vhallyun-static.oss-cn-beijing.aliyuncs.com/form/20221111153019/71f3d1ea1ccfe7302036206c002eead1/origin.jpg'
                  },
                  {
                    id: 2388729,
                    is_answer: 0,
                    key: 'D',
                    value: '黑呵呵呵呵呵',
                    custom_opt: 2,
                    updated_at: '2022-11-11 15:31:53',
                    created_at: '2022-11-11 15:31:53',
                    deleted_at: null,
                    question_id: 2533561,
                    imgUrl:
                      'http://vhallyun-static.oss-cn-beijing.aliyuncs.com/form/20221111153027/bf2b8f0273e9aeeccc958291ead4d4df/origin.jpg'
                  }
                ],
                min: 2,
                max: 10
              },
              imgUrl: ''
            }
          ],
          imgUrl: null,
          finishTime: null
        };
        let res = {
          code: 200,
          data: {
            title: '苹果2022年新品发布会，极致体验知识大盘点',
            extension: '扩展字段',
            question_detail: JSON.stringify(formJson),
            limit_time: 60, // 限制时间
            limit_time_switch: 1, // 限制时间开关 0.否 1.是
            push_time: ''
          }
        };
        return res;
      },
      mockDefaultInfo(item, index) {
        item.score = 10;
        item.ownerScore = 5; // 自己得分
        if (index == 0) {
          item.questionAnswer = 'A'; // 题目正确答案
          item.ownerAnswer = 'A'; // 自己作答内容
          item.subject_type = 'text'; // 图文题（img-text）;文字题（text）
          item.layout_type = 1; // 一行一列（1）；一行二列（2）
          item.layout_css = 1; // 上下布局（1）；左右布局（2）
        } else if (index == 1) {
          item.questionAnswer = 'A,B'; // 题目正确答案
          item.ownerAnswer = 'A'; // 自己作答内容
          item.subject_type = 'img-text'; // 图文题（img-text）;文字题（text）
          item.layout_type = 1; // 一行一列（1）；一行二列（2）
          item.layout_css = 2; // 上下布局（1）；左右布局（2）
        } else if (index == 2) {
          item.questionAnswer = 'A,B'; // 题目正确答案
          item.ownerAnswer = 'A,B'; // 自己作答内容
          item.subject_type = 'text'; // 图文题（img-text）;文字题（text）
          item.layout_type = 2; // 一行一列（1）；一行二列（2）
          item.layout_css = 1; // 上下布局（1）；左右布局（2）
        } else if (index == 3) {
          item.questionAnswer = 'A'; // 题目正确答案
          item.ownerAnswer = 'B'; // 自己作答内容
          item.subject_type = 'img-text'; // 图文题（img-text）;文字题（text）
          item.layout_type = 2; // 一行一列（1）；一行二列（2）
          item.layout_css = 1; // 上下布局（1）；左右布局（2）
        }
        return item;
      },
      // 获取快问快答-详情后，数据组装
      renderPreviewInfo(res) {
        let resData = res.data;
        resData.limit_time_second = resData.limit_time > 0 ? Number(resData.limit_time) * 60 : 0; // 限制时间*60，转换为秒
        resData.number = 25; // TODO 拼接数据
        resData.number_second = resData.number > 0 ? Number(resData.number) * 60 : 0; // 限制时间*60，转换为秒
        resData.form = resData.question_detail
          ? JSON.parse(resData.question_detail)
          : { detail: [] };
        resData.jsonData = resData.form.detail || [];
        resData.jsonData.map((item, index) => {
          item.sortNo = index + 1;
          item = this.mockDefaultInfo(item, index);
          if (this.answerType == 'show') {
            // 题目标记答题是否正确等
            let answerResVo = this.setAnswerResTag(item);
            item.answerRes = answerResVo.answerRes;
            item.showReleaseAnswer = answerResVo.showReleaseAnswer;
            item.showOwnerAnswer = answerResVo.showOwnerAnswer;
            item.detail.list.map((sonItem, sonIndex) => {
              // 选项标记区域
              let sonAnswerVo = this.setAnswerOptionTag(item, sonItem);
              sonItem.answerStatus = sonAnswerVo.answerStatus;
              if (item.type == 'checkbox') {
                // 如果是复选题，绑定一个answer进行勾选
                sonItem.answer = sonAnswerVo.answer;
              }
            });
          } else {
            // 答题的时候，绑定值
            if (item.type == 'radio') {
              item.ownerAnswer = '';
            }
            item.detail.list.map((sonItem, sonIndex) => {
              if (item.type == 'checkbox') {
                sonItem.answer = false;
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
      // 标记题目答题状态
      setAnswerResTag(item) {
        // 若自己作答，比对正确答案；若未作答，不做处理。
        // 题目-正确答案（item.questionAnswer）
        // 自己-作答内容（item.ownerAnswer）
        if (item.type == 'radio') {
          // 单选题
          if (item.ownerAnswer && item.questionAnswer == item.ownerAnswer) {
            // 本题正确作答
            item.answerRes = 'answer_yes';
          } else if (item.ownerAnswer && item.questionAnswer != item.ownerAnswer) {
            // 本题错误作答
            item.answerRes = 'answer_no';
          } else {
            // 本题未作答
            item.answerRes = 'answer_normal';
          }
          // 转换正确答案 和 自己作答答案
          item.showReleaseAnswer = item.questionAnswer;
          item.showOwnerAnswer = item.ownerAnswer;
        } else if (item.type == 'checkbox') {
          // 多选题 （排序后比对数组是否相等）；
          let questionAnswer = Array.isArray(item.questionAnswer)
            ? item.questionAnswer
            : item.questionAnswer.split(',');
          let ownerAnswer = Array.isArray(item.ownerAnswer)
            ? item.ownerAnswer
            : item.ownerAnswer.split(',');
          if (
            ownerAnswer &&
            JSON.stringify(ownerAnswer.sort()) === JSON.stringify(questionAnswer.sort())
          ) {
            // 本题正确作答
            item.answerRes = 'answer_yes';
          } else if (
            ownerAnswer &&
            JSON.stringify(ownerAnswer.sort()) !== JSON.stringify(questionAnswer.sort())
          ) {
            // 本题错误作答（部分正确 or 全错）
            item.answerRes = 'answer_no';
          } else {
            // 本地未作答
            item.answerRes = 'answer_normal';
          }
          // 转换正确答案 和 自己作答答案
          item.showReleaseAnswer = questionAnswer.join('');
          item.showOwnerAnswer = ownerAnswer.join('');
        }
        return {
          answerRes: item.answerRes,
          showReleaseAnswer: item.showReleaseAnswer,
          showOwnerAnswer: item.showOwnerAnswer
        };
      },
      // 标记题目下-选项答题状态
      setAnswerOptionTag(item, sonItem) {
        if (item.answerRes != 'answer_normal') {
          if (item.type == 'radio') {
            sonItem.answerStatus =
              sonItem.key == item.ownerAnswer
                ? item.answerRes == 'answer_yes'
                  ? 'yes'
                  : 'no'
                : '';
            // 答题选项 - 单选题不用此
            sonItem.answer = sonItem.answer || '';
          } else if (item.type == 'checkbox') {
            let ownerAnswer = Array.isArray(item.ownerAnswer)
              ? item.ownerAnswer
              : item.ownerAnswer.split(',');
            sonItem.answerStatus = ownerAnswer.includes(sonItem.key)
              ? item.answerRes == 'answer_yes'
                ? 'yes'
                : 'no'
              : '';
            // 答题选项v-model绑定变量
            sonItem.answer = ownerAnswer.includes(sonItem.key) ? true : false;
          }
        }
        return {
          answerStatus: sonItem.answerStatus,
          answer: sonItem.answer
        };
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
      // 标记题目-选项 是否需要 展开or收缩
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
              console.log(item.id, parseFloat(domVo.height), maxHeight);
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
      // 切换题目-选项 收缩 or 展开效果
      changeStatus(item) {
        if (item.isMoreHeight == '') return;
        item.isMoreHeight = item.isMoreHeight == 'open' ? 'close' : 'open';
        this.$forceUpdate();
      },
      // 上一题，序号变更
      async lastQuestion() {
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
        await this.$nextTick(() => {});
        this.setIsMoreHeight();
      },
      // 下一题，序号变更
      async nextQuestion() {
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
        await this.$nextTick(() => {});
        this.setIsMoreHeight();
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
      },
      // 页面初始化
      async initComp() {
        console.log('触发成绩单查询。。。');
        this.answerIndex = null;
        // 渲染赋值之前，先清空标记；
        this.resetQuestion();
        // 获取详情数据
        await this.previewExamInfo();
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
