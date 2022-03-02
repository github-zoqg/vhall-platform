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
  import { useNoticeServer } from 'middle-domain';
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
    beforeCreate() {
      this.noticeServer = useNoticeServer();
    },
    mounted() {
      // 监听到 公告
      this.noticeServer.listenMsg();
      this.noticeServer.$on('room_announcement', msg => {
        this.announcement = {
          content: msg.room_announcement_text,
          isShow: true
        };
        setTimeout(() => {
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
