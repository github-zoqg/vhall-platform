<template>
  <section class="vmp-rebroadcast-stream mini" v-show="isShow">
    <span class="toggle-tips" @click="toggleScreen">
      <el-tooltip content="切换">
        <i class="vh-iconfont vh-line-copy-document"></i>
      </el-tooltip>
    </span>
    <video-preview v-if="isShow" :videoParam="videoParam" />
  </section>
</template>

<script>
  import VideoPreview from '@/packages/app-shared/components/video-preview';
  import { useInteractiveServer, useRebroadcastServer } from 'middle-domain';

  export default {
    name: 'VmpRebroadcastStream',
    components: { VideoPreview },
    data() {
      const { state: interactiveState } = this.interactiveServer;
      const { state: domainState } = this.rebroadcastServer;

      return {
        isShow: false,
        videoParam: {},
        domainState,
        interactiveState
      };
    },
    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
      this.rebroadcastServer = useRebroadcastServer();
    },
    mounted() {
      if (this.rebroadcastServer.state.rebroadcastId) {
        this.open();
      }
    },
    methods: {
      async open() {
        await this.interactiveServer.unpublishStream();

        const { token, appId, accountId, roomId } = this.domainState;

        console.log('open rebroadcast stream:', { token, appId, accountId, roomId });

        this.videoParam = {
          token,
          type: 'live',
          appId,
          accountId,
          autoplay: true,
          liveOption: {
            defaultDefinition: '360p',
            type: 'flv',
            roomId
          }
        };
        console.log('videoParam:', this.videoParam);
        this.isShow = true;
      },
      async close(options = {}) {
        if (options.pushLocalStream === true) {
          await this.interactiveServer.publishStream();
        }

        this.isShow = false;
      },
      toggleScreen() {}
    }
  };
</script>

<style lang="less">
  .vmp-rebroadcast-stream {
    position: relative;
    width: 100%;
    height: 100%;

    &.mini {
      position: absolute;
      right: 0;
      left: auto;
      top: 0;
      width: 309px;
      height: 240px;
      z-index: 1;
    }

    .toggle-tips {
      width: 32px;
      height: 32px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      position: absolute;
      background: #000;
      color: #fff;
      right: 10px;
      top: 10px;
      z-index: 10;

      &:hover {
        background: @bg-error-light;
      }
    }
  }
</style>
