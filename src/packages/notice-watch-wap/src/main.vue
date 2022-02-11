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
  import { useMsgServer } from 'middle-domain';
  export default {
    name: 'VmpNoticeWap',
    data() {
      return {
        announcement: {
          content: '12313',
          isShow: true
        }
      };
    },
    beforeCreate() {
      this.msgServer = useMsgServer();
    },
    mounted() {
      this.msgServer.$onMsg('ROOM_MSG', rawMsg => {
        let temp = Object.assign({}, rawMsg);

        if (typeof temp.data !== 'object') {
          temp.data = JSON.parse(temp.data);
          temp.context = JSON.parse(temp.context);
        }
        console.log(temp, '原始消息');
        const { type = '' } = temp.data || {};
        switch (type) {
          // 计时器开始
          case 'room_announcement':
            this.announcement = {
              content: temp.room_announcement_text,
              isShow: true
            };
            setTimeout(() => {
              this.announcement.isShow = false;
            }, 30000);
            break;
          default:
            break;
        }
      });
      // 监听到 公告
      // EventBus.$on('room_announcement', msg => {
      //   this.room_announcement(msg.room_announcement_text);
      // });
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
