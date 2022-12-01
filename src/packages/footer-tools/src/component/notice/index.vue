<template>
  <div class="vmp-notice-list" v-show="isShowIcon && noticeNum">
    <div class="vmp-notice-list_icon">
      <div class="icon-num" v-if="noticeNum - noticeNumIsWatch">
        {{ noticeNum - noticeNumIsWatch > 99 ? '99+' : noticeNum - noticeNumIsWatch }}
      </div>
      <div class="icon-img" @click="getNoticeHistoryList">
        <img src="./img/notice-icon.png" alt="" class="show_img" />
      </div>
    </div>
    <div class="common-notice-light-mask" v-if="isShowNotice" @click="closeNoticeList"></div>
    <div class="vmp-notice-list_container" v-if="isShowNotice">
      <div class="container-data">
        <ul v-if="noticeList.length" v-infinite-scroll="moreLoadData">
          <li v-for="(item, index) in noticeList" :key="index">
            <div class="data-time">
              {{ item.created_at | chatTime }}
            </div>
            <div class="data-text">
              <span class="data-text_circle">
                <i class="num" v-if="index == 0"></i>
              </span>
              <p class="data-text_title">{{ item.content.content }}</p>
            </div>
          </li>
        </ul>
      </div>
      <div class="container-data__shadow"></div>
      <div class="container-close">
        <i class="vh-iconfont vh-line-close" @click="closeNoticeList"></i>
      </div>
    </div>
  </div>
</template>
<script>
  import { useNoticeServer, useRoomBaseServer, useGroupServer } from 'middle-domain';
  export default {
    name: 'VmpNoticeList',
    data() {
      return {
        noticeNum: 0,
        isShowIcon: false,
        isShowNotice: false, //是否显示公告列表
        noticeList: [],
        pageInfo: {
          pos: 0,
          limit: 10,
          pageNum: 1
        },
        totalPages: 0,
        total: 0,
        noticeNumIsWatch: sessionStorage.getItem(this.$route.params.id) || 0
      };
    },
    computed: {
      noticeLatestInfo() {
        // 最新公告信息
        return this.roomBaseServer.state.noticeInfo;
      }
    },
    beforeCreate() {
      this.noticeServer = useNoticeServer();
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
    },
    created() {
      this.getNoticeInfo();
    },
    mounted() {
      this.initNotice();
    },
    methods: {
      initNotice() {
        const { groupInitData } = this.groupServer.state;
        this.noticeServer.$on('live_over', () => {
          sessionStorage.setItem(this.$route.params.id, 0);
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
      getNoticeHistoryList() {
        this.isShowNotice = true;
        this.showNoticeNum = false;
        this.getNoticeList(false);
      },
      getNoticeList(flag) {
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
            sessionStorage.setItem(this.$route.params.id, this.noticeNum);
            this.noticeNumIsWatch = this.noticeNum;
          }
        });
      },
      closeNoticeList() {
        this.isShowNotice = false;
        this.pageInfo = {
          pos: 0,
          limit: 10,
          pageNum: 1
        };
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
    // position: relative;
    &_icon {
      position: relative;
      .icon-img {
        position: relative;
        height: 32px;
        width: 32px;
        line-height: 32px;
        background: linear-gradient(180deg, #fca810 0%, #fe7d00 100%);
        border-radius: 16px;
        cursor: pointer;
        margin-left: 16px;
        img.show_img {
          width: 32px;
          -webkit-transform-origin: left center;
          transform-origin: left center;
          margin: -1px 0 0 0;
        }
      }
      .icon-num {
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
    .common-notice-light-mask {
      width: 100%;
      position: fixed;
      height: 100%;
      background: transparent;
      top: 0;
      left: 0;
      z-index: 11;
    }
    &_container {
      position: absolute;
      right: -32px;
      bottom: 64px;
      z-index: 12;
      width: 492px;
      height: 382px;
      background: transparent;
      background-image: url('./img/notice.png');
      background-size: 100% 100%;
      .container-data {
        position: absolute;
        top: 108px;
        left: 60px;
        width: 355px;
        max-height: 254px;
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
        .data-time {
          display: inline-block;
          width: 50px;
          text-align: left;
        }
        .data-text {
          display: flex;
          position: relative;
          // padding-bottom: 16px;
          width: calc(100% - 50px);
          &_circle {
            display: inline-block;
            width: 11px;
            height: 11px;
            border-radius: 50%;
            background: #fff4f4;
            border: 1px solid #ffc5c3;
            top: 4px;
            left: -6px;
            position: absolute;
            .num {
              display: inline-block;
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: @bg-error-light;
              position: absolute;
              top: 2px;
              left: 2px;
            }
          }
          &_title {
            padding-left: 16px;
            word-break: break-word;
            padding-bottom: 16px;
            border-left: 1px dashed #ffc5c3;
            border-radius: 2px;
          }
        }
        &::-webkit-scrollbar {
          /*滚动条*/
          width: 6px;
          background: transparent !important;
        }
        &::-webkit-scrollbar-thumb {
          /*滚动条里面小方块*/
          height: 50px;
          border-radius: 10px;
          background: #cccccc !important;
        }
        &::-webkit-scrollbar-track {
          background: transparent !important;
        }
      }
      .container-data__shadow {
        height: 8px;
        // box-shadow: 0 8px 0 rgb(51 51 51 / 24%), 0 2px 0 rgb(0 0 0 / 5%);
      }
      .container-close {
        position: absolute;
        top: 60px;
        right: 75px;
        cursor: pointer;
        .vh-iconfont {
          font-size: 16px;
          color: #666666;
          color: @font-light-second;
        }
      }
    }
  }
</style>
