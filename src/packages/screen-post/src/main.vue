<template>
  <div
    class="vmp-screen-post"
    v-if="screenShow && useRoomBaseServer.state.screenPosterInfo.img"
    @click="handleLink"
  >
    <el-image class="vmp-screen-post-img" :src="screenPosterInfo_img" fit="cover" lazy></el-image>
    <div
      class="vmp-screen-post-close-tip"
      :class="{ time: useRoomBaseServer.state.screenPosterInfo.shutdown_type }"
      @click.stop="screenPostClose"
    >
      <span v-if="useRoomBaseServer.state.screenPosterInfo.shutdown_type">{{ time }}s</span>
      {{ $t('webinar.webinar_1001') }}
    </div>
  </div>
</template>

<script>
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'VmpScreenPost',
    data() {
      return {
        useRoomBaseServer: {},
        timer: null,
        time: 5,
        screenShow: false,
        screenWidth: 1920, //默认是pc设计稿
        screenHeight: 1080
      };
    },
    computed: {
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      screenPosterInfo_img() {
        return `${this.useRoomBaseServer.state.screenPosterInfo.img}?x-oss-process=image/resize,m_lfit,h_${this.screenHeight},w_${this.screenWidth}`;
      }
    },
    created() {
      this.useRoomBaseServer = useRoomBaseServer();
      // status 1 关闭 0 开启
      if (this.isEmbed) {
        // 嵌入页没有开屏海报
        this.screenShow = false;
      } else {
        this.useRoomBaseServer.state.screenPosterInfo.status === 0 && this.screenPostOpen();
      }
    },
    mounted() {
      //获取页面的宽度
      this.screenWidth = 2 * window.screen.width;
      this.screenHeight = 2 * window.screen.height;
    },
    methods: {
      // 链接跳转
      handleLink() {
        const url = this.useRoomBaseServer.state.screenPosterInfo.url;
        url && window.open(url);
      },

      // 自动关闭
      handleAutoClose() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
          this.time--;
          if (this.time == 0) {
            clearInterval(this.timer);
            this.timer = null;
            this.time = 5;
            this.screenPostClose();
          }
        }, 1000);
      },

      // 关闭事件
      screenPostClose() {
        this.screenShow = false;
      },

      // 开启事件
      screenPostOpen() {
        this.screenShow = true;
        // shutdown_type 0 手动关闭 1 自动关闭
        this.useRoomBaseServer.state.screenPosterInfo.shutdown_type === 1 && this.handleAutoClose();
      }
    }
  };
</script>

<style lang="less">
  .vmp-screen-post {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 120;
    background: #333;

    .vmp-screen-post-img {
      width: 100%;
      height: 100%;
    }

    .vmp-screen-post-close-tip {
      position: absolute;
      top: 20px;
      right: 20px;
      min-width: 64px;
      height: 38px;
      text-align: center;
      line-height: 38px;
      border-radius: 19px;
      color: #ffffff;
      background: rgba(0, 0, 0, 0.65);
      font-size: 16px;
      span {
        margin-right: 4px;
      }
      &:hover {
        cursor: pointer;
      }
    }
    .time {
      width: 88px;
    }
  }
</style>
