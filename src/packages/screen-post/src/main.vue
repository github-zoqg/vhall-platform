<template>
  <div
    class="vmp-screen-post"
    v-if="screenShow && useRoomBaseServer.state.screenPosterInfo.img"
    @click="handleLink"
  >
    <el-image
      class="vmp-screen-post-img"
      :src="screenPosterInfo_img"
      :fit="imageShowMode"
      :class="{ obj_pos: screenPosterInfo_img.includes('mode=2') }"
      lazy
    ></el-image>
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
  import { cropperImage } from '@/app-shared/utils/common';
  import { parseImgOssQueryString } from '@/app-shared/utils/tool';
  export default {
    name: 'VmpScreenPost',
    data() {
      return {
        useRoomBaseServer: {},
        timer: null,
        time: 5,
        imageShowMode: 'fill',
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
        let url = this.useRoomBaseServer.state.screenPosterInfo.img;
        if (cropperImage(url)) {
          this.handlerImageInfo(url);
          return url;
        } else {
          return `${url}?x-oss-process=image/resize,m_lfit,h_${this.screenHeight},w_${this.screenWidth}`;
        }
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
      // 解析图片地址
      handlerImageInfo(url) {
        let obj = parseImgOssQueryString(url);
        this.imageShowMode = 'fill';
        if (Number(obj.mode) == 2) {
          this.imageShowMode = 'cover';
        } else if (Number(obj.mode) == 3) {
          this.imageShowMode = 'scale-down';
        }
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
    .obj_pos img {
      object-position: left top;
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
