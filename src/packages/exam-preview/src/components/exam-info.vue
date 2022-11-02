<template>
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
      v-for="(item, index) in previewInfo.jsonData"
      :key="`qt_${index}`"
    >
      <!-- 图片题 （selectType: 1单选；2多选。支持单选 or 多选）-->
      <h1>
        <span>{{ index + 1 }}.</span>
        <span v-text="item.title"></span>
      </h1>
      <!-- 瀑布流 -->
      <div
        class="exam-way__waterfallFlow"
        v-masonry:update
        item-selector=".vmp-exam-info--option"
        v-if="waterfallFlow"
      >
        <template v-if="item.detail">
          <div
            v-masonry-tile:update
            :class="`vmp-exam-info--option ${item.layout_type == 1 ? 'max-width' : 'min-width'} ${
              item.layout_css == 1 ? 'top-bottom' : 'left-right'
            }`"
            v-for="(sonItem, sonIndex) in item.detail.list"
            :key="`qt_${index}_son${sonIndex}`"
          >
            <img
              v-if="item.subject_type == 'img-text' && sonItem.imgUrl != undefined"
              lazy
              :src="sonItem.imgUrl"
              :preview-src-list="[sonItem.imgUrl]"
            />
            <div class="vmp-exam-info--text">
              <el-radio
                v-model="item.answer"
                :label="sonItem.key"
                :name="`radio_${item.id}`"
                v-if="item.type === 'radio'"
              ></el-radio>
              <el-checkbox
                v-model="item.answer"
                :label="sonItem.key"
                :name="`checkbox_${item.id}`"
                v-if="item.type === 'checkbox'"
              ></el-checkbox>
              <div>{{ sonItem.key + '、' + sonItem.value }}</div>
            </div>
          </div>
        </template>
      </div>
      <!-- 非瀑布流 -->
      <div class="exam-way__no__waterfallFlow" v-else>
        <template v-if="item.detail">
          <div
            :class="`vmp-exam-info--option ${item.layout_type == 1 ? 'max-width' : 'min-width'} ${
              item.layout_css == 1 ? 'top-bottom' : 'left-right'
            }`"
            v-for="(sonItem, sonIndex) in item.detail.list"
            :key="`qt_${index}_son${sonIndex}`"
          >
            <img
              v-if="item.subject_type == 'img-text' && sonItem.imgUrl != undefined"
              lazy
              :src="sonItem.imgUrl"
              :preview-src-list="[sonItem.imgUrl]"
            />
            <div class="vmp-exam-info--text">
              <el-radio
                v-model="item.answer"
                :label="sonItem.key"
                :name="`radio_${item.id}`"
                v-if="item.type === 'radio'"
              ></el-radio>
              <el-checkbox
                v-model="item.answer"
                :label="sonItem.key"
                :name="`checkbox_${item.id}`"
                v-if="item.type === 'checkbox'"
              ></el-checkbox>
              <div>{{ sonItem.key + '、' + sonItem.value }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer, useGroupServer } from 'middle-domain';
  export default {
    name: 'VmpExamInfo',
    data() {
      return {
        loading: false,
        previewInfo: {
          title: '苹果2022年新品发布会，极致体验知识大盘点',
          extension: '扩展字段',
          question_detail: '',
          jsonData: [
            {
              id: 2435359,
              subject_type: 'img-text',
              layout_type: 1,
              layout_css: 1,
              title: '单选题1231231',
              answer: 'B',
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
              id: 24353591,
              subject_type: 'img-text',
              layout_type: 2,
              layout_css: 1,
              title: '单选题1231231',
              answer: 'A',
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
              id: 24353591,
              subject_type: 'img-text',
              layout_type: 1,
              layout_css: 2,
              title: '单选题1231231',
              answer: 'C',
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
              id: 24353591,
              subject_type: 'text',
              layout_type: 1,
              layout_css: 1,
              title:
                '单选题1231231单选题1231231单选题1231231单选题1231231单选题1231231单选题1231231',
              answer: 'A',
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
              id: 24353591,
              subject_type: 'text',
              layout_type: 2,
              layout_css: 1,
              title:
                '单选题1231231单选题1231231单选题1231231单选题1231231单选题1231231单选题1231231',
              answer: ['A', 'B'],
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
          auto_push_switch: 0,
          limit_time: 60,
          limit_time_switch: 0
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
        default: true
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
    },
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
            this.previewInfo = resData;
          })
          .catch(e => {
            this.loading = false;
            this.previewInfo = {};
          });
      },
      // 页面初始化
      initComp() {
        console.log('触发成绩单查询。。。');
        // this.previewExamInfo();
      }
    },
    created() {
      this.initComp();
    }
  };
</script>
<style lang="less" scoped>
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
  }
</style>
