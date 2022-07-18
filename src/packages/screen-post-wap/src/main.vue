<template>
  <div
    class="vmp-screen-post-wap"
    v-if="screenShow && useRoomBaseServer.state.screenPosterInfo.m_img"
    @click="handleLink"
  >
    <el-image
      class="vmp-screen-post-wap-img"
      :src="screenPosterInfo_m_img"
      fit="cover"
      lazy
    ></el-image>
    <div class="vmp-screen-post-wap-close-tip" @click.stop="screenPostClose">
      {{ $t('webinar.webinar_1001') }}
      <span v-if="useRoomBaseServer.state.screenPosterInfo.shutdown_type">{{ time }}s</span>
    </div>
  </div>
</template>

<script>
  import { useRoomBaseServer } from 'middle-domain';
  export default {
    name: 'VmpScreenPostWap',
    data() {
      return {
        useRoomBaseServer: {},
        timer: null,
        time: 5,
        screenShow: false,
        screenWidth: 375, //默认是iphonexr设计稿1/2
        screenHeight: 667
      };
    },
    computed: {
      screenPosterInfo_m_img() {
        return `${this.useRoomBaseServer.state.screenPosterInfo.m_img}?x-oss-process=image/resize,m_lfit,h_${this.screenHeight},w_${this.screenWidth}`;
      }
    },
    created() {
      // 是否为嵌入页
      if (this.$domainStore.state.roomBaseServer.embedObj.embed) {
        this.screenShow = false;
        return false;
      }
      this.useRoomBaseServer = useRoomBaseServer();
      // status 1 关闭 0 开启
      this.useRoomBaseServer.state.screenPosterInfo.status === 0 && this.screenPostOpen();
    },
    mounted() {
      //获取页面的宽度, 缩放至现有屏幕大小的2倍图
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
  .vmp-screen-post-wap {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 120; // 公众号 100 开屏海报 120
    background: #333;
    .vmp-screen-post-wap-img {
      width: 100%;
      height: 100%;
    }

    .vmp-screen-post-wap-close-tip {
      position: absolute;
      top: 1.333333rem;
      right: 0.4rem;
      color: #fff;
      padding: 0 0.266667rem;
      height: 0.8rem;
      line-height: 0.8rem;
      border-radius: 0.4rem;
      background: rgba(0, 0, 0, 0.7);
      user-select: none;
    }
  }
</style>
