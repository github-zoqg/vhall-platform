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
    beforeCreate() {
      this.noticeServer = useNoticeServer();
      this.roomBaseServer = useRoomBaseServer();
    },
    mounted() {
      // 刷新展示最新一条公告
      if (this.roomBaseServer.state.noticeInfo.total) {
        console.log(this.roomBaseServer, 'useRoomBaseServer123');
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
      });
    },
    methods: {
      closeAnnouncement() {
        this.announcement.isShow = false;
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
