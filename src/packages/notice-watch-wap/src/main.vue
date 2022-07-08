<template>
  <div class="vmp-notice-wap">
    <van-notice-bar
      class="notice"
      ref="notice"
      :text="announcement.content"
      :scrollable="true"
      color="#80511B"
      background="#FDE2AD"
      mode="closeable"
      v-if="announcement.isShow"
      @close="closeAnnouncement"
    />
  </div>
</template>

<script>
  import { useNoticeServer, useRoomBaseServer, useGroupServer } from 'middle-domain';
  export default {
    name: 'VmpNoticeWap',
    data() {
      return {
        announcement: {
          content: '12313',
          isShow: false
        }
      };
    },
    computed: {
      isInGroup() {
        return this.$domainStore.state.groupServer.groupInitData.isInGroup;
      }
    },
    watch: {
      isInGroup(val) {
        this.announcement.isShow = false;
        this.openAnnouncement();
      }
    },
    beforeCreate() {
      this.noticeServer = useNoticeServer();
      this.roomBaseServer = useRoomBaseServer();
      this.groupServer = useGroupServer();
    },
    mounted() {
      this.openAnnouncement();
      console.log(this.roomBaseServer, 'useRoomBaseServer123');
      // 监听到 公告
      this.noticeServer.$on('room_announcement', msg => {
        this.announcement = {
          content: msg.room_announcement_text,
          isShow: true
        };
      });
      // 直播结束自动关闭公告
      this.noticeServer.$on('live_over', () => {
        this.announcement.isShow = false;
      });
      // 结束讨论
      this.groupServer.$on('ROOM_CHANNEL_CHANGE', () => {
        if (!this.isInGroup) {
          this.openAnnouncement();
        } else {
          this.announcement.isShow = false;
        }
      });
      this.groupServer.$on('GROUP_SWITCH_START', () => {
        this.announcement.isShow = false;
      });
    },
    methods: {
      closeAnnouncement() {
        this.announcement.isShow = false;
      },
      openAnnouncement() {
        // 刷新展示最新一条公告&&为直播状态
        if (
          this.roomBaseServer.state.noticeInfo.total &&
          this.roomBaseServer.state.watchInitData.webinar.type == 1 &&
          !this.isInGroup
        ) {
          this.announcement = {
            content: this.roomBaseServer.state.noticeInfo.list[0]?.content.content,
            isShow: true
          };
        } else {
          this.announcement.isShow = false;
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-notice-wap {
    .notice {
      position: absolute;
      top: 80px;
      left: 0px;
      width: 100%;
    }
    .van-notice-bar {
      box-sizing: border-box;
    }
  }
</style>
