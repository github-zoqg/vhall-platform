<template>
  <div
    class="icon-wrap"
    v-if="examWatchState.dotVisible || (examWatchResult && examWatchResult.total > 0)"
  >
    <!-- 有小红点图标 -->
    <img
      src="https://s3.e.vhall.com/common-static/vhall-form/images/exam_no.png"
      alt=""
      v-if="examWatchState.dotVisible"
      @click="clickExamIcon(true)"
    />
    <!-- 无小红点图标 -->
    <img
      src="https://s3.e.vhall.com/common-static/vhall-form/images/exam.png"
      alt=""
      v-else
      @click="clickExamIcon(true)"
    />
    <!-- 快问快答-列表弹框 -->
    <van-popup
      get-container="#otherPopupContainer"
      class="exam_base"
      v-model="examListDialogVisible"
      position="bottom"
      @close="closeDialog"
    >
      <div class="vmp-exam-list_container">
        <div class="container-title">
          <span class="container-title-text">
            <span class="title_text">{{ $t('exam.exam_1022') }}</span>
            <i class="container-title-text-line"></i>
          </span>
          <i class="vh-iconfont vh-line-close" @click="closeDialog"></i>
        </div>
        <van-list
          class="container-data"
          :immediate-check="false"
          offset="30"
          :finished="true"
          finished-text=""
        >
          <ul v-show="examWatchResult.list && examWatchResult.list.length > 0">
            <li
              v-for="(item, index) in examWatchResult.list"
              :key="index"
              :class="`container-data__item ${item && item.is_end ? 'button_end_bg' : ''}`"
              @click="checkExamInfo(item)"
            >
              <div class="container-data__title">
                <div class="container-data__title__left">{{ item.title }}</div>
                <div class="container-data__title__right">
                  <template v-if="item && item.is_end == 1">
                    <div class="button_text gray" v-text="$t('exam.exam_1028')"></div>
                  </template>
                  <template v-else-if="item && item.status == 1">
                    <div class="button_text">
                      <!-- 试卷总分>0，展示得分情况；否则展示正确率 -->
                      <span
                        class="score"
                        v-text="
                          item.total_score > 0
                            ? item.total_score == item.score
                              ? $t('exam.exam_1042')
                              : item.score
                            : item.right_rate
                        "
                      ></span>
                      <span
                        class="mini-size"
                        v-if="item.total_score != item.score"
                        v-text="item.total_score > 0 ? '分' : '%'"
                      ></span>
                    </div>
                  </template>
                  <div class="button_answer" v-else>
                    <van-button type="danger" size="mini" round>
                      {{ $t('exam.exam_1027') }}
                    </van-button>
                  </div>
                </div>
              </div>
              <div class="container-data__info">
                <div>
                  <label v-text="`${$t('exam.exam_1023')}:`"></label>
                  <span>{{ item.push_time | fmtTimeByExp('HH:mm') }}</span>
                </div>
                <div>
                  <label v-text="`${$t('exam.exam_1024')}:`"></label>
                  <span v-if="item.limit_time_switch == 1">
                    {{ item.limit_time | examTimeByMinute }}
                  </span>
                  <span v-else>{{ $t('exam.exam_1006') }}</span>
                </div>
                <div>
                  <label v-text="`${$t('exam.exam_1025')}:`"></label>
                  <span class="color-red" v-text="item.total_score"></span>
                </div>
                <div>
                  <label v-text="`${$t('exam.exam_1026')}:`"></label>
                  <span v-text="item.question_num"></span>
                </div>
              </div>
            </li>
          </ul>
        </van-list>
      </div>
    </van-popup>
  </div>
</template>
<script>
  import {
    useRoomBaseServer,
    useMsgServer,
    useChatServer,
    useZIndexServer,
    useExamServer
  } from 'middle-domain';
  export default {
    name: 'ExamIcon',
    props: {
      iconStyle: {
        default: 1,
        type: Number,
        required: false
      } // 1为传统风格icon，2为新版icon
    },
    data() {
      const examWatchState = this.examServer.state;
      const zIndexServerState = this.zIndexServer.state;
      return {
        examWatchState,
        zIndexServerState,
        examListDialogVisible: false // 快问快答列表-是否展示
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      examWatchResult() {
        return this.examServer.state.examWatchResult;
      }
    },
    watch: {
      'examWatchResult.list': {
        handler: function (val) {
          if (val) {
            let arr = val.filter(item => item.is_answered == 0);
            if (arr.length > 0) {
              this.examServer.setExamWatchDotVisible(true);
            } else {
              this.examServer.setExamWatchDotVisible(false);
            }
          }
        },
        deep: true
      }
    },
    methods: {
      // 点击图标，触发判断
      async clickExamIcon(showPanel = false) {
        const { watchInitData = {} } = this.roomBaseServer.state;
        await this.examServer.getExamPublishList({
          source_id: watchInitData.webinar.id, // 活动ID
          source_type: 1, // 类型：活动1
          switch_id: watchInitData.switch.switch_id
        });
        if (['answer', 'score'].includes(this.examWatchState.iconExecuteType)) {
          // 直接答题 or 查看成绩
          this.toShowExamRankOrExam();
        } else if (this.examWatchState.iconExecuteType == 'miss') {
          // 错过答题机会
          this.$toast(this.$t('exam.exam_1010'));
        }
        if (showPanel && this.examWatchResult.list && this.examWatchResult.list.length > 0) {
          // 如果是点击小图标，并且列表数量大于0，展示列表弹出框
          this.examListDialogVisible = true;
        }
      },
      // 关闭 快问快答 - 列表弹出框
      closeDialog() {
        this.examListDialogVisible = false;
      },
      // 看成绩 还是答题逻辑
      toShowExamRankOrExam(paper_id = null, executeType = null) {
        let examVo = {
          examId: this.examWatchState?.iconExecuteItem?.paper_id,
          type: this.examWatchState?.iconExecuteType // score 或者 answer
        }; // 默认点击icon触发逻辑
        if (paper_id && executeType) {
          // 单个点击快问快答-选择触发逻辑
          examVo = {
            examId: paper_id,
            type: executeType
          };
        }
        if (!(examVo && examVo.examId)) return;
        this.closeDialog();
        this.$emit('clickIcon', examVo);
      },
      // 单个验证逻辑
      checkExamInfo(item) {
        debugger;
        if (item && item.is_end) {
          // 已结束(不做任何处理)
        } else if (item && item.total_score == item.score) {
          // 满分，看成绩
          this.toShowExamRankOrExam(item.paper_id, 'score');
        } else {
          // 进入答题流程
          this.toShowExamRankOrExam(item.paper_id, 'answer');
        }
      },
      setChatItemData(msg, eventType) {
        let text_content = {
          EXAM_PAPER_SEND: this.$t('exam.exam_1001'), // 推送-快问快答
          EXAM_PAPER_SEND_RANK: this.$t('exam.exam_1003'), // 公布-快问快答-成绩
          EXAM_PAPER_END: this.$t('exam.exam_1041'), // 快问快答-收卷
          EXAM_PAPER_AUTO_END: this.$t('exam.exam_1040'), // 快问快答-自动收卷
          EXAM_PAPER_AUTO_SEND_RANK: this.$t('exam.exam_1032') // 快问
        };
        return {
          nickname: msg.nick_name,
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            text_content: text_content[eventType],
            exam_id: msg.paper_id,
            exam_title: msg.paper_title || ''
          },
          roleName: msg.room_role,
          type: eventType,
          interactStatus: true,
          isCheck: true
        };
      },
      listenExamWatchMsg(msg) {
        if (window.ExamTemplateServer) {
          // 初始化文件PaaS SDK, 使用了单例模式，多次执行不能影响
        }
        useChatServer().addChatToList(this.setChatItemData(msg, msg.data.type));
        if (msg.data.type === this.examServer.EVENT_TYPE.EXAM_PAPER_SEND) {
          //  触发自动弹出 - 快问快答答题
          this.open(msg.paper_id);
        } else if (msg.data.type == this.examServer.EVENT_TYPE.EXAM_PAPER_SEND_RANK) {
          // TODO 快问快答 - 公布成绩
        } else if (msg.data.type == this.examServer.EVENT_TYPE.EXAM_PAPER_END) {
          // TODO 快问快答 - 收卷
          // —— 收卷完成（如果正在答题，收卷后，查看列表数据。若大于0，展示列表数据；若不大于0，直接关闭弹窗。）
        } else if (msg.data.type == this.examServer.EVENT_TYPE.EXAM_PAPER_AUTO_END) {
          // TODO 快问快答 - 自动收卷
        } else if (msg.data.type == this.examServer.EVENT_TYPE.EXAM_PAPER_AUTO_SEND_RANK) {
          // TODO 快问快答 - 自动公布成绩
        }
      },
      initExamEvents() {
        // 监听快问快答消息
        this.msgServer.$onMsg('ROOM_MSG', this.listenExamWatchMsg);
      }
    },
    beforeCreate() {
      this.zIndexServer = useZIndexServer();
      this.msgServer = useMsgServer();
      this.roomBaseServer = useRoomBaseServer();
      this.examServer = useExamServer(false);
    },
    created() {
      this.clickExamIcon(true);
      this.initExamEvents();
    },
    mounted() {}
  };
</script>

<style lang="less" scoped>
  .icon-wrap {
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
    .exam_base {
      width: 100%;
      left: 0px;
      bottom: 0;
      background: url('https://s3.e.vhall.com/common-static/vhall-form/images/bg_exam_list.png')
        no-repeat;
      box-shadow: 0px -4px 16px rgba(0, 0, 0, 0.25);
      border-radius: 40px 40px 0px 0px;
      background-color: #ffffff;
      background-position: top;
      background-size: cover;
    }
    .vmp-exam-list_container {
      max-height: 680px;
      overflow: auto;
      .container-title {
        height: 100px;
        text-align: center;
        position: relative;
        // background-image: url('https://s3.e.vhall.com/common-static/vhall-form/images/bg_exam_list_header.png');
        // background-repeat: no-repeat;
        // background-size: cover;
        .container-title-text {
          position: absolute;
          top: 36px;
          left: 32px;
          .title_text {
            font-style: normal;
            font-weight: 500;
            font-size: 28px;
            line-height: 40px;
            color: #262626;
          }
        }
      }
      .container-data {
        max-height: calc(680px - 210px);
        padding: 0 32px;
        margin-bottom: 68px;
        position: relative;
        overflow: auto;
        color: @font-light-normal;
        z-index: 2;
        ul {
          li {
            color: @font-light-normal;
            font-size: 28px;
            line-height: 1.2;
            position: relative;
            &:last-child {
              .data-text_title {
                padding-bottom: 0;
              }
            }
            padding: 32px 32px;
            background: #ffffff;
            border-radius: 16px;
            margin-bottom: 16px;
            .container-data__title {
              margin-top: 0;
              margin-bottom: 16px;
              width: 100%;
              display: flex;
              justify-content: space-around;
              align-items: center;
              .container-data__title__left {
                text-align: left;
                overflow: hidden;
                word-break: break-all;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                font-weight: bold;
                font-size: 28px;
                line-height: 40px;
                color: #262626;
                margin-right: auto;
              }
              .container-data__title__right {
                margin-left: 16px;
                flex-shrink: 0;
                .button_text {
                  span {
                    font-family: 'DINPro';
                    font-style: normal;
                    font-weight: 400;
                    font-size: 40px;
                    line-height: 40px;
                    /* identical to box height, or 100% */
                    text-align: right;
                    color: #fb2626;
                    &.mini-size {
                      font-size: 20px;
                      text-align: left;
                    }
                  }
                }
              }
            }
            .container-data__info {
              display: flex;
              justify-content: flex-start;
              align-items: center;
              flex-wrap: wrap;
              span,
              label {
                font-style: normal;
                font-weight: 400;
                font-size: 20px;
                line-height: 28px;
                color: #595959;
              }
              div {
                span {
                  padding: 0 16px;
                }
                &:last-child {
                  span {
                    padding: 0 0 0 16px;
                  }
                }
              }
            }
            &.button_end_bg {
              // 结束情况下
              background-image: url('https://s3.e.vhall.com/common-static/vhall-form/images/end.png');
              background-size: 118px 118px;
              background-position: right bottom;
              background-repeat: no-repeat;
            }
          }
        }
      }
      .vh-line-close {
        position: absolute;
        color: #8c8c8c;
        top: 37px;
        right: 30px;
        cursor: pointer;
      }
    }
  }
</style>
