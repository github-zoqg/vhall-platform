<template>
  <div
    class="vmp-exam-icon"
    v-if="examWatchState.dotVisible || (examWatchResult && examWatchResult.total > 0)"
  >
    <img src="./images/exam.png" alt="" @click="throttleCheckExam" />
    <i class="vmp-dot" v-if="examWatchState.dotVisible" />
    <!-- 快问快答-列表弹框 -->
    <vh-dialog
      custom-class="exam_base"
      :visible.sync="examListDialogVisible"
      :close-on-click-modal="false"
      :show-close="true"
      width="420px"
      @close="closeDialog"
    >
      <div slot="title" class="container-title">
        <span class="container-title-text">
          <span class="title_text">{{ $t('exam.exam_1022') }}</span>
        </span>
      </div>
      <div class="vmp-exam-list_container">
        <div class="container-data">
          <ul v-show="examWatchResult.list && examWatchResult.list.length > 0">
            <li
              v-for="(item, index) in examWatchResult.list"
              :key="index"
              :class="`container-data__item ${
                item && item.is_end == 1 && item.status == 0 ? 'button_end_bg' : ''
              }`"
              @click="checkExamInfo(item)"
            >
              <div class="container-data__title">
                <div class="container-data__title__left">{{ item.title }}</div>
                <div class="container-data__title__right">
                  <template v-if="item && item.is_end == 1 && item.status == 0">
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
                  <div
                    class="button_answer"
                    v-else-if="item && item.is_end == 0 && item.status == 0"
                  >
                    <el-button type="danger" size="mini" round class="exam-answer-btn">
                      {{ $t('exam.exam_1027') }}
                    </el-button>
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
                    {{ item.limit_time > 9 ? item.limit_time : `0${item.limit_time}:00` }}
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
        </div>
      </div>
    </vh-dialog>
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
  import { throttle } from 'lodash';
  export default {
    name: 'ExamIcon',
    data() {
      const examWatchState = this.examServer.state;
      const zIndexServerState = this.zIndexServer.state;
      return {
        examWatchState,
        zIndexServerState,
        dotVisible: false,
        examListDialogVisible: false
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
            let arr = val.filter(item => item.is_end == 0 && item.status == 0);
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
      // 点击图标，触发判断[isAutoOpen 是否自动弹出]
      async clickExamIcon(isAutoOpen = false) {
        await this.examServer.getExamPublishList({});
        let list = this.examWatchResult.list || [];
        let arr = list.filter(item => item.is_end == 0 && item.status == 0);
        if (arr.length == 1 && list.length == 1) {
          // 存在未答题的内容，并且 可答题列表数量只有一个，触发自动弹出逻辑
          this.checkExamInfo(arr[0], list);
        } else if (isAutoOpen && list.length == 1) {
          this.checkExamInfo(list[0], list);
        } else if (isAutoOpen && list.length > 1) {
          // 如果是点击小图标，并且列表数量大于1，展示列表弹出框
          this.examListDialogVisible = true;
        }
      },
      // 关闭 快问快答 - 列表弹出框
      closeDialog() {
        this.examListDialogVisible = false;
      },
      // 看成绩 还是答题逻辑
      toShowExamRankOrExam(paper_id = null, executeType = null, source = 'default') {
        let examVo = {
          source: source,
          examId: this.examWatchState?.iconExecuteItem?.paper_id,
          type: this.examWatchState?.iconExecuteType // score 或者 answer
        }; // 默认点击icon触发逻辑
        if (paper_id && executeType) {
          // 单个点击快问快答-选择触发逻辑
          examVo = {
            source: source,
            examId: paper_id,
            type: executeType
          };
        }
        if (!(examVo && examVo.examId)) return;
        this.closeDialog();
        this.$emit('clickIcon', examVo);
      },
      // 单个验证逻辑
      async checkExamInfo(vItem, list = []) {
        if (list.length <= 0) {
          await this.examServer.getExamPublishList({});
          list = this.examWatchResult?.list || [];
        }
        let examItem = list.find(item => {
          if (item.paper_id == vItem.paper_id) return item;
        });
        /**
         * 已结束，部分作答 or 全部作答 is_end == 1、status == 1
         * 已结束，未作答 is_end == 1、status == 0
         * 未结束，已作答 is_end == 0、status == 1
         * 未结束，未作答  is_end == 0、status == 0
         */
        if (examItem && examItem.is_end == 1 && examItem.status == 0) {
          // 已结束 && 未作答
          this.$toast(this.$t('exam.exam_1010'));
        } else if (examItem && examItem.status == 1) {
          // 已作答
          this.toShowExamRankOrExam(examItem.paper_id, 'score');
        } else if (examItem && examItem.is_end == 0 && examItem.status == 0) {
          // 可作答
          this.toShowExamRankOrExam(examItem.paper_id, 'answer');
        }
      },
      setChatItemData(msg, eventType) {
        let text_content = {
          paper_send: this.$t('exam.exam_1001'), // 推送-快问快答
          paper_send_rank: this.$t('exam.exam_1003'), // 公布-快问快答-成绩
          paper_end: this.$t('exam.exam_1041'), // 快问快答-收卷
          paper_auto_end: this.$t('exam.exam_1040'), // 快问快答-自动收卷
          paper_auto_send_rank: this.$t('exam.exam_1032') // 快问
        };
        return {
          nickname: msg.data.nick_name,
          avatar: '//cnstatic01.e.vhall.com/static/images/watch/system.png',
          content: {
            text_content: text_content[eventType],
            exam_id: msg.data.paper_id,
            exam_title: msg.data.paper_title || ''
          },
          roleName: msg.data.role_name,
          type: eventType,
          interactStatus: true,
          isCheck: true
        };
      },
      listenExamWatchMsg(msg, that) {
        if (window.ExamTemplateServer) {
          // 初始化文件PaaS SDK, 使用了单例模式，多次执行不能影响
        }
        if (that.examServer.EVENT_TYPE[`EXAM_${msg.data.type.toUpperCase()}`] !== undefined) {
          useChatServer().addChatToList(that.setChatItemData(msg, msg.data.type));
        }
        if (msg.data.type === that.examServer.EVENT_TYPE.EXAM_PAPER_SEND) {
          //  触发自动弹出 - 快问快答答题
          that.toShowExamRankOrExam(msg.data.paper_id, 'answer', 'event');
        } else if (msg.data.type == that.examServer.EVENT_TYPE.EXAM_PAPER_SEND_RANK) {
          // TODO 快问快答 - 公布成绩
        } else if (msg.data.type == that.examServer.EVENT_TYPE.EXAM_PAPER_AUTO_SEND_RANK) {
          // TODO 快问快答 - 自动公布成绩
        } else if (msg.data.type == 'live_over') {
          // 结束直播
          this.closeDialog();
        }
      },
      initExamEvents() {
        // 监听快问快答消息
        let that = this;
        this.msgServer.$onMsg('ROOM_MSG', msg => {
          this.listenExamWatchMsg(msg, that);
        });
      }
    },
    beforeCreate() {
      this.zIndexServer = useZIndexServer();
      this.msgServer = useMsgServer();
      this.roomBaseServer = useRoomBaseServer();
      this.examServer = useExamServer(false);
    },
    created() {
      this.clickExamIcon();
      this.throttleCheckExam = throttle(this.clickExamIcon, 2000, { trailing: false });
      this.initExamEvents();
    },
    mounted() {}
  };
</script>

<style lang="less" scoped>
  .vmp-exam-icon {
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
      background: #fb2626;
      border: 1px solid var(--footer-icon-tip-border-color);
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
  }
  /deep/.vh-dialog.exam_base {
    height: 460px;
    width: 100%;
    left: 0px;
    bottom: 0;
    background: url('./images/pc_bg_exam_list.png') no-repeat;
    box-shadow: 0px -4px 16px rgba(0, 0, 0, 0.25);
    background-color: #ffffff;
    background-position: top;
    background-size: cover;
    border-radius: 12px;
    .vh-dialog__header {
      padding: 0 0;
    }
    .vh-dialog__body {
      padding: 0 0;
      height: calc(100% - 88px);
    }
  }
  .container-title {
    height: 80px;
    text-align: center;
    position: relative;
    .container-title-text {
      position: absolute;
      top: 24px;
      left: 32px;
      .title_text {
        font-style: normal;
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
        color: #262626;
      }
    }
  }
  .vmp-exam-list_container {
    height: 100%;
    overflow: hidden;
    .container-data {
      padding: 0 16px;
      position: relative;
      color: @font-light-normal;
      z-index: 2;
      overflow-x: hidden;
      overflow-y: auto;
      height: 100%;
      ul {
        width: 388px;
        li {
          color: @font-light-normal;
          position: relative;
          &:last-child {
            .data-text_title {
              padding-bottom: 0;
            }
          }
          padding: 16px 16px;
          background: #ffffff;
          border-radius: 4px;
          margin-bottom: 8px;
          .container-data__title {
            margin-top: 0;
            margin-bottom: 4px;
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
              font-size: 14px;
              line-height: 22px;
              color: #262626;
              margin-right: auto;
            }
            .container-data__title__right {
              margin-left: 8px;
              flex-shrink: 0;
              .button_text {
                span {
                  font-family: 'DINPro';
                  font-style: normal;
                  font-weight: 400;
                  font-size: 18px;
                  line-height: 20px;
                  /* identical to box height, or 100% */
                  text-align: right;
                  color: #fb2626;
                  &.mini-size {
                    font-size: 9px;
                    text-align: left;
                  }
                }
              }
              .exam-answer-btn {
                border: 1px solid var(--theme-more-status-button-border);
                background: var(--theme-more-status-button-bg);
                color: var(--theme-more-status-button-color);
                &:hover {
                  background: var(--theme-more-status-button-hover-bg);
                  border: 1px solid var(--theme-more-status-button-hover-border);
                  color: var(--theme-more-status-button-hover-color);
                }
                &:active {
                  background: var(--theme-more-status-button-active-bg);
                  border: 1px solid var(--theme-more-status-button-active-border);
                  color: var(--theme-more-status-button-active-color);
                }
                &.is-disabled {
                  background: var(--theme-more-status-button-disabled-bg) !important;
                  border: 1px solid var(--theme-more-status-button-disabled-border) !important;
                  color: var(--theme-more-status-button-disabled-color) !important;
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
              font-size: 12px;
              line-height: 20px;
              color: #595959;
            }
            div {
              span {
                padding: 0 8px 0 0;
              }
              &:last-child {
                span {
                  padding: 0 0 0 8px;
                }
              }
            }
          }
          &.button_end_bg {
            // 结束情况下
            background-image: url('./images/pc_end.png');
            background-size: 35px 35px;
            background-position: right bottom;
            background-repeat: no-repeat;
          }
          &:last-child {
            margin-bottom: 24px;
          }
        }
      }
    }
    .vh-line-close {
      position: absolute;
      color: #8c8c8c;
      top: 24px;
      right: 32px;
      cursor: pointer;
      font-size: 12px;
    }
  }
</style>
