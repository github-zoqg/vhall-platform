<template>
  <div class="icon-wrap-notice" v-if="noticeNum && isShowIcon">
    <img src="./images/questionnaire.png" alt="" @click="getNoticeList" />
    <span class="dot" v-if="showNoticeNum">
      <div align="center">{{ noticeNum }}</div>
    </span>
    <!-- 问卷列表弹框 -->
    <div class="popup_base" v-if="isShowNotice"></div>
    <van-popup
      get-container="#otherPopupContainer"
      class="questionnaire_base"
      v-model="isShowNotice"
      position="bottom"
      :overlay="false"
      :style="{ maxHeight: popHeight, zIndex: 31 }"
    >
      <div class="vmp-questionnaire-list_container">
        <img class="q_header" src="./images/header.png" alt="" />
        <div class="container-data">
          <ul v-show="noticeNum" v-infinite-scroll="moreLoadData">
            <li v-for="(item, index) in noticeList" :key="index">
              <div class="data-time">
                {{ item.created_at.substr(11, 5) }}
              </div>

              <div class="data-text">
                <span v-if="index == 0" class="_block"></span>
                <span class="data-text_circle">
                  <i class="num"></i>
                </span>
                <p class="data-text_title">
                  <span>{{ item.content.content }}</span>
                </p>
              </div>
            </li>
          </ul>
        </div>
        <i class="vh-iconfont vh-line-close" @click="closeNotice"></i>
      </div>
    </van-popup>
  </div>
</template>
<script>
  import { useNoticeServer, useRoomBaseServer, useGroupServer } from 'middle-domain';
  export default {
    name: 'QuestionnaireIcon',
    data() {
      return {
        noticeNum: 0,
        isShowIcon: false,
        showNoticeNum: true,
        isShowNotice: false, //是否显示公告列表
        noticeList: [],
        popHeight: '50vh'
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      noticeLatestInfo() {
        // 最新公告信息
        return this.roomBaseServer.state.noticeInfo;
      }
    },
    watch: {},
    beforeCreate() {
      this.noticeServer = useNoticeServer();
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
    },
    created() {
      console.log(13132132);
      this.getNoticeInfo();
    },
    mounted() {
      this.initNotice();
    },
    methods: {
      // 初始化消息
      initNotice() {
        const { groupInitData } = this.groupServer.state;
        this.noticeServer.$on('live_over', () => {
          this.isShowIcon = false;
        });
        // 结束讨论
        this.groupServer.$on('ROOM_CHANNEL_CHANGE', () => {
          if (!groupInitData.isInGroup) {
            this.getNoticeInfo();
          }
        });
        if (groupInitData.isInGroup) return;
        // 公告消息
        this.noticeServer.$on('room_announcement', msg => {
          this.isShowIcon = true;
          this.noticeNum = this.noticeNum + 1;
          this.noticeList.unshift({
            created_at: msg.push_time,
            content: {
              content: msg.room_announcement_text
            }
          });
        });
      },
      // 聚合接口检测是否有历史公告
      getNoticeInfo() {
        this.noticeNum = this.noticeLatestInfo.total || 0;
        if (this.noticeNum && this.noticeLatestInfo.list[0].created_at) {
          this.isShowIcon = true;
          this.pageInfo = {
            pos: 0,
            limit: 10,
            pageNum: 1
          };
        }
      },
      // 获取公告列表
      async getNoticeList(flag) {
        this.isShowNotice = true;
        this.showNoticeNum = false;
        const { watchInitData } = this.roomBaseServer.state;
        const params = {
          room_id: watchInitData.interact.room_id,
          is_cache: 1,
          ...this.pageInfo
        };

        this.noticeServer.getNoticeList({ params, flag }).then(result => {
          if (result.code === 200 && result.data) {
            this.noticeList = this.noticeServer.state.noticeList;
            this.totalPages = this.noticeServer.state.totalPages;
            this.total = result.data.total;
            this.noticeNum = result.data.total;
          }
        });
      },
      // 滚动加载
      moreLoadData() {
        if (this.pageInfo.pageNum >= this.totalPages) {
          return false;
        }
        this.pageInfo.pageNum++;
        this.pageInfo.pos = parseInt((this.pageInfo.pageNum - 1) * this.pageInfo.limit);
        this.getNoticeList(true);
      },
      closeNotice() {
        this.isShowNotice = false;
      }
    }
  };
</script>

<style lang="less" scoped>
  .icon-wrap-notice {
    margin-bottom: 10px;
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
      width: 30px;
      height: 30px;
      line-height: 30px;
      font-size: 18px;
      border-radius: 50%;
      background-color: #ff0005;
      color: white;
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
    .questionnaire_base {
      height: 100%;
      background: transparent;
      z-index: 31 !important;
    }
    .vmp-questionnaire-list_container {
      height: calc(100% - 80px);
      .q_header {
        width: 160px;
        height: 160px;
        position: absolute;
        top: 0px;
        left: 50%;
        z-index: 1;
        transform: translate(-50%);
      }
      .container-data {
        height: 100%;
        margin-top: 80px;
        padding: 100px 40px 60px;
        background: linear-gradient(359.08deg, #f0f9ff 0.67%, #f4fbff 86.17%);
        position: relative;
        overflow: auto;
        color: @font-light-normal;
        border-radius: 30px 30px 0 0;
        ul {
          list-style: none;
          height: 100%;
          overflow: auto;
          li {
            display: flex;
            color: @font-light-normal;
            font-size: 28px;
            line-height: 1.2;
          }
        }
        .data-time {
          line-height: 1.6;
          font-size: 28px;
          display: inline-block;
          width: 100px;
          text-align: left;
        }
        .data-text {
          display: flex;
          position: relative;
          padding-right: 80px;
          width: calc(100% - 100px);
          ._block {
            display: inline-block;
            width: 10px;
            height: 10px;
            position: absolute;
            background: #f2faff;
            top: 0px;
            left: -5px;
          }
          &_circle {
            display: inline-block;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: linear-gradient(359.08deg, #f0f9ff 0.67%, #f4fbff 86.17%);
            border: 1px solid #3562fa;
            top: 10px;
            left: -11px;
            position: absolute;
            .num {
              display: inline-block;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background: #3562fa;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
            }
          }
          &_title {
            padding: 0 0 60px 32px;
            color: #1a1a1a;
            line-height: 1.6;
            word-break: break-word;
            border-left: 1px dashed #3562fa;
            border-radius: 2px;
            font-size: 28px;
          }
        }
      }
      .vh-line-close {
        position: absolute;
        color: #8c8c8c;
        top: 110px;
        right: 30px;
        cursor: pointer;
      }
    }
  }
</style>
