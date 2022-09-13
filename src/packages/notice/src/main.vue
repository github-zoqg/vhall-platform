<template>
  <div class="vmp-notice-list">
    <main class="vmp-notice-list-container">
      <overlay-scrollbars
        ref="noticeScroll"
        :options="overlayScrollBarsOptions"
        style="height: 100%"
      >
        <ul>
          <li
            class="vmp-notice-list-container__item"
            v-for="(item, index) of noticeList"
            :key="index"
          >
            <i class="vh-iconfont vh-line-voice" />
            <p>
              <span class="v-type">[公告]</span>
              <span>{{ item.content.content }}</span>
            </p>
            <p class="vmp-notice-item__time">{{ item.created_at }}</p>
          </li>
        </ul>
      </overlay-scrollbars>
    </main>

    <footer class="vmp-notice-list-textarea">
      <div class="toSay">
        <div class="clearfix text-box">
          <textarea
            class="mywords fl"
            placeholder="请输入公告内容"
            v-on:keyup.enter="sendNotice"
            v-model.trim="inputVal"
            name="xword"
            maxlength="300"
          ></textarea>
          <input type="button" class="sendMsg fr" value="发送" @click="sendNotice" />
        </div>
      </div>
    </footer>
  </div>
</template>
<script>
  import { useMsgServer, useNoticeServer, useRoomBaseServer } from 'middle-domain';
  import { debounce } from 'lodash';
  export default {
    name: 'VmpNoticeList',
    data() {
      const domainState = this.noticeServer.state;

      return {
        domainState,
        noticeList: [],
        pageInfo: {
          pos: 0,
          limit: 10,
          pageNum: 1
        },
        inputVal: '',

        overlayScrollBarsOptions: {
          resize: 'none',
          paddingAbsolute: true,
          className: 'os-theme-light os-theme-vhall',
          scrollbars: {
            autoHide: 'leave',
            autoHideDelay: 200
          }
        }
      };
    },
    computed: {
      watchInitData() {
        return this.$domainStore.state.roomBaseServer.watchInitData;
      }
    },
    beforeCreate() {
      this.msgServer = useMsgServer();
      this.noticeServer = useNoticeServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    created() {
      this.roomBaseState = this.roomBaseServer.state;
      // 保持和线上一直，不调用接口， 刷新时，就没有公告了
      // this.getNoticeList(false);
    },
    mounted() {
      this.initNotice();
    },
    methods: {
      /**
       * 初始化scroll区域
       */
      initScroll() {
        this.osInstance = this.$refs.noticeScroll.osInstance();
        this.osInstance.options(this.overlayScrollBarsOptions);
      },
      /**
       * 初始化notice
       */
      initNotice() {
        this.noticeServer.$on('room_announcement', msg => {
          this.noticeList.unshift({
            created_at: msg.push_time,
            content: {
              content: msg.room_announcement_text
            }
          });
        });
        this.noticeServer.$on('live_over', () => {
          this.noticeList = [];
        });
      },

      /**
       * 获取历史消息列表
       * @param {Boolean} isLoadMore
       */
      async getNoticeList(isLoadMore = true) {
        const { watchInitData } = this.roomBaseState;
        const params = {
          room_id: watchInitData.interact.room_id,
          is_cache: 1,
          ...this.pageInfo
        };

        await this.noticeServer.getNoticeList({ params, flag: isLoadMore });
      },
      /**
       * 读取更多data
       */
      moreLoadData() {
        if (this.pageInfo.pageNum >= this.domainState.totalPages) {
          return false;
        }
        this.pageInfo.pageNum++;
        this.pageInfo.pos = parseInt((this.pageInfo.pageNum - 1) * this.pageInfo.limit);
        this.getNoticeList(true);
      },
      /**
       * 发送一条公告
       */
      sendNotice: debounce(function () {
        if (this.inputVal === '' || this.inputVal === undefined) {
          return this.$message.warning('内容不能为空');
        }
        const params = {
          messageType: 1,
          roomId: this.watchInitData.interact.room_id,
          channel_id: this.watchInitData.interact.channel_id,
          content: this.inputVal
        };
        try {
          this.noticeServer.sendNotice(params);
          this.inputVal = '';
        } catch (error) {
          console.warn('发送公告消息错误', error);
        }
      }, 300)
    }
  };
</script>

<style lang="less">
  .vmp-notice-list {
    .os-theme-dark > .os-scrollbar > .os-scrollbar-track > .os-scrollbar-handle,
    .os-theme-light > .os-scrollbar > .os-scrollbar-track > .os-scrollbar-handle,
    .os-theme-dark > .os-scrollbar > .os-scrollbar-track,
    .os-theme-light > .os-scrollbar > .os-scrollbar-track {
      border-radius: 6px;
    }
    .os-theme-light > .os-scrollbar > .os-scrollbar-track > .os-scrollbar-handle {
      background: #666666;
    }
    .os-theme-light > .os-scrollbar:hover > .os-scrollbar-track > .os-scrollbar-handle {
      background-color: #666666;
    }
    height: 100%;
    position: relative;
    &-container {
      height: calc(100% - 52px);
      width: 100%;
      background: transparent;
      background-size: 100% 100%;

      &__item {
        position: relative;
        background-color: #2d2d2d;
        width: 100%;
        box-sizing: border-box;
        padding: 14px 20px 14px 43px;

        &:not(:first-child) {
          margin-top: 1px;
        }

        i.vh-iconfont {
          display: inline-block;
          position: absolute;
          top: 17px;
          font-size: 14px;
          color: #fba511;
          left: 15px;
        }

        p {
          width: 100%;
          word-break: break-all;
          font-size: 12px;
          color: #ececec;
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
          padding-right: 20px;
        }

        .vmp-notice-item__time {
          color: #999;
          margin-top: 4px;
        }
      }

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
              background: @bg-error-light;
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

    &-textarea {
      width: 100%;
      height: 52px;
      position: absolute;
      bottom: 0;
      left: 0;
      z-index: 1;
      background-color: #34363a;
      .toSay {
        position: relative;
        background-color: transparent;
        padding: 9px 9px 0;
        height: 100%;
      }
      .text-box {
        .mywords {
          border: none;
          background: #545454;
          height: 32px;
          width: 250px;
          resize: none;
          outline: none;
          padding: 0 9px;
          line-height: 32px;
          color: #fff;
          overflow: auto;
          border-radius: 4px 0 0 4px;
          box-sizing: border-box;
          font-size: 12px;
          float: left;
          display: inline-block;
        }
        .sendMsg {
          box-sizing: border-box;
          width: 40px;
          height: 32px;
          line-height: 32px;
          text-align: center;
          background: #999;
          cursor: pointer;
          border: none;
          color: #fff;
          float: left;
          border-radius: 0 4px 4px 0;
          font-size: 12px;
          display: inline-block;
          outline: none;
          &:hover {
            background: #fb3a32;
          }
        }
      }
    }
  }
</style>
