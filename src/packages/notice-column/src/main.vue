<template>
  <div class="vmp-notice-column" v-show="isNoticeColumn">
    <div class="vmp-notice-column-wrap">
      <span class="vmp-notice-column-wrap-icons"><img src="./img/icon.png" alt="" /></span>
      <p class="vmp-notice-column-wrap-nowrap">
        <span class="vmp-notice-column-wrap-animated">
          <span id="vmp-notice-column-text">{{ noticeText }}</span>
        </span>
      </p>
      <span class="vmp-notice-column-wrap-close" @click="closeNoticeColumn">
        <i class="vh-iconfont vh-line-close"></i>
      </span>
    </div>
  </div>
</template>
<script>
  import { useNoticeServer, useRoomBaseServer, useGroupServer } from 'middle-domain';
  export default {
    name: 'VmpNoticeColumn',
    data() {
      return {
        noticeText: '',
        isNoticeColumn: false
      };
    },
    computed: {
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      },
      noticeLatestInfo() {
        return this.roomBaseServer.state.noticeInfo;
      }
    },
    beforeCreate() {
      this.noticeServer = useNoticeServer();
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
    },
    created() {
      this.openNotice();
    },
    mounted() {
      this.initNotice();
    },
    methods: {
      openNotice() {
        if (
          this.noticeLatestInfo.total &&
          this.noticeLatestInfo.list[0].created_at &&
          this.roomBaseServer.state.watchInitData.webinar.type == 1 &&
          !this.isInGroup
        ) {
          this.isNoticeColumn = true;
          this.noticeText = this.noticeLatestInfo.list[0].content['content'];
          this.animates();
        }
      },
      initNotice() {
        // 公告消息
        this.noticeServer.$on('room_announcement', msg => {
          this.isNoticeColumn = true;
          this.noticeText = msg.room_announcement_text;
          this.animates();
        });
        this.noticeServer.$on('live_over', () => {
          this.isNoticeColumn = false;
        });
        // 结束讨论/踢出
        this.groupServer.$on('ROOM_CHANNEL_CHANGE', () => {
          if (!this.isInGroup) {
            this.openNotice();
          } else {
            this.isNoticeColumn = false;
          }
        });
        this.groupServer.$on('GROUP_SWITCH_START', () => {
          this.isNoticeColumn = false;
        });
      },
      closeNoticeColumn() {
        const noticeText = document.querySelector('#vmp-notice-column-text');
        window.cancelAnimationFrame(noticeText);
        this.isNoticeColumn = false;
      },
      animates() {
        this.$nextTick(() => {
          const noticeText = document.querySelector('#vmp-notice-column-text');
          const widthWrap = document.querySelector('.vmp-notice-column-wrap-nowrap').offsetWidth;
          const widthtext = noticeText.offsetWidth;
          let left = widthWrap;
          function render() {
            if (-left >= widthtext) {
              left = widthWrap;
            }
            left = left - 0.5;
            noticeText.style.marginLeft = left + 'px';
            window.requestAnimationFrame(render);
          }
          window.requestAnimationFrame(render);
        });
      }
    }
  };
</script>
<style lang="less">
  .vmp-notice-column {
    width: calc(100% - 380px);
    z-index: 12;
    position: absolute;
    top: 0;
    left: 0;
    height: 40px;
    background: rgba(255, 233, 209, 1);
    color: @font-error-low;
    border-radius: 4px 4px 0 0;
    height: 44px;
    line-height: 44px;
    font-size: 16px;
    &-wrap {
      display: flex;
      align-content: center;
      justify-content: space-between;
      margin: 0 24px;
      &-icons {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 10px;
        line-height: 42px;
        img {
          width: 100%;
          height: 100%;
          object-fit: scale-down;
        }
      }
      &-nowrap {
        color: #ec7b03;
        font-size: 14px;
        overflow: hidden;
        width: 100%;
        height: 35px;
        flex: 1;
        &-animated {
          span {
            white-space: nowrap;
          }
        }
      }
      &-close {
        cursor: pointer;
        display: inline-block;
        font-size: 14px;
        color: #ec7b03;
        margin-left: 5px;
      }
    }
  }
</style>
