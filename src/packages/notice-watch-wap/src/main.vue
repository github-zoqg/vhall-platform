<template>
  <div>
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
  //  && !this.zIndexObj.Ques && !videoEnd
  import { useNoticeServer, useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'VmpNoticeWap',
    data() {
      return {
        announcement: {
          content: '12313',
          isShow: false,
          timer: null
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
    },
    mounted() {
      this.openAnnouncement();
      console.log(this.roomBaseServer, 'useRoomBaseServer123');
      // 监听到 公告
      this.noticeServer.listenMsg();
      this.noticeServer.$on('room_announcement', msg => {
        this.announcement = {
          content: msg.room_announcement_text,
          isShow: true
        };
        if (this.timer) {
          clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
          this.announcement.isShow = false;
        }, 30000);
        // 直播结束自动关闭公告
        this.noticeServer.$on('live_over', msg => {
          this.announcement.isShow = false;
        });
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
          if (this.timer) {
            clearTimeout(this.timer);
          }
          this.timer = setTimeout(() => {
            this.announcement.isShow = false;
          }, 30000);
        }
      }
    }
  };
</script>

<style lang="less" scoped>
  .notice {
    position: absolute;
    top: 80px;
    left: 0px;
    width: 100%;
    z-index: 25;
  }
  .van-notice-bar {
    box-sizing: border-box;
  }
</style>
