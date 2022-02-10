<template>
  <div class="vmp-notice-list" v-if="noticeNum">
    <div class="vmp-notice-list-icon">
      <div class="vmp-notice-list-icon-num">{{ noticeNum }}</div>
      <div class="vmp-notice-list-icon-img" @click="getNoticeHistoryList">
        <img src="./images/notice-icon.png" alt="" />
      </div>
    </div>
    <div class="vmp-notice-list-container" v-if="isShowNotice">
      <div class="vmp-notice-list-container-data">
        <ul v-if="noticeList.length" v-infinite-scroll="moreLoadData">
          <li v-for="(item, index) in noticeList" :key="index">
            <div class="vmp-notice-list-container-data-time">
              {{ item.created_at | formatTime }}
            </div>
            <div class="vmp-notice-list-container-data-text">
              <span class="vmp-notice-list-container-data-text-circle">
                <i v-if="index == 0"></i>
              </span>
              <p class="vmp-notice-list-container-data-text-title">{{ item.content.content }}</p>
            </div>
          </li>
        </ul>
      </div>
      <div class="vmp-notice-list-container-close">
        <i class="iconfont iconguanbi_icon" @click="isShowNotice = false"></i>
      </div>
    </div>
  </div>
</template>
<script>
  import { useMsgServer, useNoticeServer, useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'VmpNoticeList',
    filters: {
      formatTime(value) {
        return value.substring(11, 16);
      }
    },
    data() {
      return {
        noticeOptions: {},
        noticeNum: 1,
        isShowNotice: false, //是否显示公告列表
        noticeList: [],
        pageInfo: {
          pos: 0,
          limit: 10,
          pageNum: 1
        },
        totalPages: 0,
        total: 0
      };
    },
    beforeCreate() {
      this.msgServer = useMsgServer();
      this.noticeServer = useNoticeServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    created() {
      this.initConfig();
      this.roomBaseState = this.roomBaseServer.state;
      console.log(this.roomBaseState, '===zhangxiao===???');
      this.initNotice();
    },
    methods: {
      // 初始化配置
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          this.noticeOptions = widget.options;
        }
      },
      initNotice() {
        // 公告消息
        this.msgServer.$on('ROOM_MSG', msg => {
          alert('success');
          let msgs = JSON.parse(msg.data);
          if (msgs.type == 'room_announcement') {
            this.noticeNum++;
            this.noticeList.unshift({
              created_at: msgs.push_time,
              content: {
                content: msgs.room_announcement_text
              }
            });
          }
        });
      },
      getNoticeHistoryList() {
        this.isShowNotice = true;
        this.getNoticeList(false);
      },
      getNoticeList(flag) {
        const { getNoticeList } = this.noticeServer;
        const { watchInitData } = this.roomBaseState;
        const params = {
          room_id: watchInitData.interact.room_id,
          is_cache: 1,
          ...this.pageInfo
        };

        getNoticeList({ params, flag }).then(result => {
          const { backData: res, state } = result;
          if (res.code == 200 && res.data) {
            this.noticeList = state.noticeList;
            this.totalPages = state.totalPages;
            this.total = state.total;
            this.noticeNum = state.total;
          }
        });
      },
      moreLoadData() {
        if (this.pageInfo.pageNum >= this.totalPages) {
          return false;
        }
        this.pageInfo.pageNum++;
        this.pageInfo.pos = parseInt((this.pageInfo.pageNum - 1) * this.pageInfo.limit);
        this.getNoticeList(true);
      }
    }
  };
</script>
<style lang="less">
  .vmp-notice-list {
    height: 100%;
    position: relative;
    &-icon {
      &-img {
        height: 32px;
        width: 32px;
        line-height: 32px;
        border-radius: 50%;
        position: relative;
        cursor: pointer;
        img {
          height: 32px;
          width: 32px;
        }
      }
      &-num {
        position: absolute;
        top: -10px;
        right: -8px;
        border-radius: 9px;
        background: @bg-error-light;
        color: @font-error-low;
        font-size: 12px;
        padding: 0 5px;
        text-align: center;
        line-height: 17px;
        height: 17px;
        z-index: 1;
        border: solid 1px @border-tools-color;
      }
    }
    &-container {
      position: absolute;
      right: -100px;
      bottom: 50px;
      z-index: 12;
      width: 492px;
      height: 382px;
      background: transparent;
      background-image: url('./images/notice.png');
      background-size: 100% 100%;
      &-data {
        position: absolute;
        top: 108px;
        left: 60px;
        width: 352px;
        max-height: 267px;
        padding-right: 20px;
        overflow: auto;
        color: @font-light-normal;
        ul {
          list-style: none;
          height: 100%;
          li {
            display: flex;
            color: @font-light-normal;
            font-size: 14px;
            line-height: 20px;
          }
        }
        &-time {
          display: inline-block;
          width: 50px;
          text-align: left;
        }
        &-text {
          display: flex;
          position: relative;
          // padding-bottom: 16px;
          width: calc(100% - 50px);
          &-circle {
            display: inline-block;
            width: 11px;
            height: 11px;
            border-radius: 50%;
            background: #fff4f4;
            border: 1px solid #ffc5c3;
            top: 4px;
            left: -6px;
            position: absolute;
            i {
              display: inline-block;
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: @font-error;
              position: absolute;
              top: 2px;
              left: 2px;
            }
          }
          &-title {
            padding-left: 16px;
            word-break: break-word;
            padding-bottom: 16px;
            border-left: 1px dashed #ffc5c3;
            border-radius: 2px;
          }
        }
      }
      &-close {
        position: absolute;
        top: 60px;
        right: 75px;
        cursor: pointer;
        cursor: pointer;
        i {
          font-size: 12px;
          color: @font-error;
        }
      }
    }
  }
</style>
