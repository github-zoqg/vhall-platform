<template>
  <div
    class="icon-wrap"
    v-if="examWatchState.dotVisible || (examWatchResult && examWatchResult.total > 0)"
  >
    <template v-if="iconStyle == 1">
      <img
        src="./images/exam_no.png"
        alt=""
        @click="clickExamIcon(true)"
        v-if="examWatchState.dotVisible"
      />
      <img src="./images/exam.png" alt="" @click="clickExamIcon(true)" v-else />
    </template>
    <template v-else>
      <img
        src="./images/exam_no2.png"
        alt=""
        @click="clickExamIcon(true)"
        v-if="examWatchState.dotVisible"
      />
      <img src="./images/exam2.png" alt="" @click="clickExamIcon(true)" v-else />
    </template>
    <slot></slot>
    <!-- 快问快答-列表弹框 -->
    <van-popup
      get-container="#otherPopupContainer"
      :class="['exam_base', isExamStickTop ? 'exam-stick-top' : '']"
      v-model="examListDialogVisible"
      position="bottom"
      @close="closeDialog"
      :overlay="!isExamStickTop && !isPortraitLive"
      overlay-class="vmp-exam-list-popup-overlay"
      :overlay-style="{ zIndex: zIndexServerState.zIndexMap.examList }"
      :style="{ zIndex: zIndexServerState.zIndexMap.examList }"
      safe-area-inset-bottom
    >
      <div class="container-title">
        <span class="container-title-text">
          <span class="title_text">{{ $t('exam.exam_1022') }}</span>
          <i class="container-title-text-line"></i>
        </span>
        <i class="vh-iconfont vh-line-close" @click="closeDialog"></i>
      </div>
      <div class="vmp-exam-list_container">
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
              :class="`container-data__item ${
                item && item.is_end == 1 && item.status == 0 ? 'button_end_bg' : ''
              } ${lang > 1 ? 'end_bg_en' : 'end_bg_cn'}`"
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
                      <span
                        class="score"
                        v-text="
                          item.right_rate == 0
                            ? '0'
                            : item.right_rate == 100
                            ? $t('exam.exam_1042')
                            : item.total_score > 0
                            ? item.score
                            : Number(item.right_rate).toFixed(1)
                        "
                      ></span>
                      <span
                        class="mini-size"
                        v-if="item.right_rate >= 0 && item.right_rate < 100"
                        v-text="
                          item.total_score > 0 || item.right_rate == 0 ? $t('exam.exam_1043') : '%'
                        "
                      ></span>
                    </div>
                  </template>
                  <div
                    class="button_answer"
                    v-else-if="item && item.is_end == 0 && item.status == 0"
                  >
                    <van-button type="danger" size="mini" round class="exam-answer-btn">
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
                    {{ item.limit_time > 9 ? item.limit_time : `0${item.limit_time}:00` }}
                  </span>
                  <span v-else>{{ $t('exam.exam_1046') }}</span>
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
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
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
        popHeight: '680px',
        examListDialogVisible: false, // 快问快答列表-是否展示
        lang: localStorage.getItem('lang')
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      // 是否是手机端 - 简洁模式
      isConcise() {
        let skin_json_wap = {
          style: 1
        };
        const skinInfo = this.$domainStore.state.roomBaseServer.skinInfo;
        if (skinInfo?.skin_json_wap && skinInfo.skin_json_wap != 'null') {
          skin_json_wap = skinInfo.skin_json_wap;
        }
        return !!(skin_json_wap?.style == 3);
      },
      examWatchResult() {
        return this.examServer.state.examWatchResult;
      },
      // 快问快答-是否吸顶
      isExamStickTop() {
        return this.$domainStore.state?.roomBaseServer?.isExamStickTop || false;
      },
      // 竖屏直播
      isPortraitLive() {
        return (
          this.$domainStore.state.roomBaseServer.watchInitData?.webinar?.webinar_show_type == 0
        );
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
      },
      // :overlay-style="{ zIndex: zIndexServerState.zIndexMap.examList }"
      // 无法动态更改zIndex
      'zIndexServerState.zIndexMap.examList': {
        handler(val) {
          if (
            !this.isExamStickTop &&
            !this.isPortraitLive &&
            document.querySelector('.vmp-exam-list-popup-overlay')
          ) {
            this.$nextTick(() => {
              document.querySelector('.vmp-exam-list-popup-overlay').style.zIndex = val;
            });
          }
        }
      },
      // 打开快问快答-答题弹窗(全屏,视频需要改为小窗)
      examAnswerVisible(val) {
        if (this.isConcise) {
          this.roomBaseServer.setIsExamStickTop(val);
          this.roomBaseServer.setStickType(val ? 'examList' : '');
        }
        console.log('吸顶之后，触发动作呀');
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitExamVisible', [!!val, 'examList'])
        );
      }
    },
    methods: {
      htmlScoreOrRate(item) {
        /**
         * 满分 、0 分 、正确率 、分数
         * 整卷分数0 情况下展示 正确率   整卷分数不为0 有得分要展示得分
         */
        let rightRate = isNaN(item.right_rate) ? ' ' : Number(item.right_rate).toFixed(1);
        let scoreStr = `<span class="score">${
          item.right_rate == 0
            ? '0'
            : item.right_rate == 100
            ? '满分'
            : item.total_score > 0
            ? item.score
            : Number(item.right_rate).toFixed(1)
        }</span>`;
        let unitStr = `<span class="mini-size">${item.total_score >= 0 ? '分' : '%'}</span>`;
        return `${scoreStr}${item.right_rate > 0 && item.right_rate < 100 ? unitStr : ''}`;
      },
      // 点击图标，触发判断
      async clickExamIcon(isAutoOpen = false) {
        await this.examServer.getExamPublishList({});
        let list = this.examWatchResult.list || [];
        // 可答列表
        let arr = list.filter(item => item.is_end == 0 && item.status == 0);
        if (isAutoOpen && arr.length == 1 && list.length == 1) {
          // 存在未答题的内容，并且 可答题列表数量只有一个，触发自动弹出逻辑
          this.checkExamInfo(arr[0], list);
        } else if (isAutoOpen && list.length == 1) {
          this.checkExamInfo(list[0], list);
        } else if (isAutoOpen && list.length > 1) {
          console.log('打开快问快答-列表部分，icon数量++');
          this.changeIconShowNum(true);
          // 如果是点击小图标，并且列表数量大于1，展示列表弹出框
          this.examListDialogVisible = true;
          this.zIndexServer.setDialogZIndex('examList');
          if (this.isConcise) {
            this.roomBaseServer.setIsExamStickTop(true);
            this.roomBaseServer.setStickType('examList');
          }
          this.$emit('setVisible', {
            examVisible: !!this.examListDialogVisible,
            zIndexType: 'examList'
          });
        }
      },
      // 关闭 快问快答 - 列表弹出框
      closeDialog() {
        console.log('关闭快问快答-列表部分，icon数量--');
        this.changeIconShowNum(false);
        this.examListDialogVisible = false;
        if (this.isConcise) {
          this.roomBaseServer.setIsExamStickTop(false);
          this.roomBaseServer.setStickType('');
        }
        this.$emit('setVisible', {
          examVisible: !!this.examListDialogVisible,
          zIndexType: 'examList'
        });
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
          isCheck: true,
          isLinkBtn: true
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
        } else if (msg.data.type == that.examServer.EVENT_TYPE.EXAM_PAPER_END) {
          // TODO 快问快答 - 收卷 —— 更新列表，便于更新小红点
          that.examServer.getExamPublishList({});
        } else if (msg.data.type == that.examServer.EVENT_TYPE.EXAM_PAPER_AUTO_END) {
          // TODO 快问快答 - 自动收卷 —— 更新列表，便于更新小红点
          that.examServer.getExamPublishList({});
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
      },
      // change icon显示数量
      changeIconShowNum(status) {
        this.roomBaseServer.setShowIconNum(status);
      }
    },
    beforeCreate() {
      this.zIndexServer = useZIndexServer();
      this.roomBaseServer = useRoomBaseServer();
      this.msgServer = useMsgServer();
      this.examServer = useExamServer(false);
    },
    created() {
      this.initExamEvents();
      this.clickExamIcon();
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
      overflow: hidden;

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
        .vh-line-close {
          position: absolute;
          color: #8c8c8c;
          top: 37px;
          right: 30px;
          cursor: pointer;
        }
      }
    }
    .vmp-exam-list_container {
      max-height: 680px;
      overflow: auto;
      .container-data {
        max-height: calc(100% - 210px);
        padding: 0 32px;
        margin-bottom: 68px;
        position: relative;
        overflow: hidden;
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
              margin-bottom: 8px;
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
                margin-right: auto;
                font-style: normal;
                font-weight: 400;
                font-size: 28px;
                line-height: 40px;
                color: #262626;
              }
              .container-data__title__right {
                margin-left: 16px;
                flex-shrink: 0;
                .button_text {
                  span {
                    // font-family: 'DINPro';
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
                  padding: 0 16px 0 0;
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
              &.end_bg_en {
                background-image: url('./images/exam_end_en.png');
              }
            }
          }
        }
      }
      .exam-answer-btn {
        border: 1px solid var(--theme-more-status-button-border);
        background: var(--theme-more-status-button-bg);
        color: var(--theme-more-status-button-color);
        padding: 8px 32px;
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

    /** 快问快答 - 答题高度 */
    .exam_base.exam-stick-top {
      height: calc(100% - 422px);
      max-height: calc(100% - 422px);
      bottom: 0;
      top: auto;
      .vmp-exam-list_container {
        max-height: 100%;
        .container-data {
          max-height: calc(100% - 210px);
        }
      }
    }
  }
</style>
