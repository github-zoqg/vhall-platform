<template>
  <section
    class="vmp-rebroadcast-stream"
    :class="[miniElement === 'rebroadcast-stream' ? 'mini' : '']"
    v-show="isShow"
  >
    <span class="toggle-tips" @click="exchangeScreen">
      <el-tooltip content="切换">
        <i class="vh-iconfont vh-line-copy-document"></i>
      </el-tooltip>
    </span>
    <video-preview ref="videoPreview" v-if="isShow" :videoParam="videoParam" />
  </section>
</template>

<script>
  import VideoPreview from '@/packages/app-shared/components/video-preview';
  import { useRoomBaseServer, useInteractiveServer, useRebroadcastServer } from 'middle-domain';

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
    computed: {
      miniElement() {
        return this.$domainStore.state.roomBaseServer.miniElement;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.interactiveServer = useInteractiveServer();
      this.rebroadcastServer = useRebroadcastServer();
    },
    mounted() {
      if (this.roomBaseServer.state.watchInitData.rebroadcast.id) {
        this.open();
      }
    },
    methods: {
      async open() {
        if (this.interactiveServer.state.localStream.streamId) {
          await this.interactiveServer.unpublishStream();
        }

        const { watchInitData } = this.roomBaseServer.state;

        const token = watchInitData.interact.paas_access_token;
        const appId = watchInitData.interact.paas_app_id;
        const accountId = watchInitData.join_info.user_id;
        const roomId = watchInitData.interact.room_id;

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

        this.roomBaseServer.setChangeElement('doc');
      },
      async close() {
        this.$refs.videoPreview && this.$refs.videoPreview.destroy();
        this.miniElement !== 'rebroadcast-stream' && this.exchangeScreen();
        this.isShow = false;
      },
      exchangeScreen() {
        const miniElement =
          this.miniElement === 'rebroadcast-stream' ? 'doc' : 'rebroadcast-stream';
        console.log('next miniElement', miniElement);
        this.roomBaseServer.setChangeElement(miniElement);
      }
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
