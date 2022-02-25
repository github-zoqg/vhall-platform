<template>
  <section class="vmp-rebroadcast-stream" v-show="isShow">
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
    methods: {
      open() {
        this.interactiveServer.unpublishStream();

        this.isShow = true;
        const { token, appId, accountId, roomId } = this.domainState;
        this.videoParam = {
          token,
          type: 'live',
          appId,
          accountId,
          liveOption: {
            defaultDefinition: '360p',
            type: 'flv',
            roomId
          }
        };
      },
      close(options = {}) {
        if (options.pushLocalStream === true) {
          this.interactiveServer.publishStream();
        }

        this.isShow = false;
      }
    }
  };
</script>

<style></style>
