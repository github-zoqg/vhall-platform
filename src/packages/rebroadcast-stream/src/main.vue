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
    <video-preview
      ref="videoPreview"
      v-if="isShow"
      :isShowController="true"
      :videoParam="videoParam"
    />
  </section>
</template>

<script>
  import VideoPreview from '@/app-shared/components/video-preview';
  import {
    useRoomBaseServer,
    useInteractiveServer,
    useRebroadcastServer,
    useMsgServer
  } from 'middle-domain';

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
      },
      roleName() {
        return this.$domainStore.state.roomBaseServer?.join_info?.role_name;
      },
      // 是否为云导播
      streamYun() {
        return (
          this.$domainStore.state.roomBaseServer.watchInitData.webinar.is_director == 1 &&
          this.$domainStore.state.roomBaseServer.watchInitData.permissionKey['webinar.director'] ==
            1
        );
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.interactiveServer = useInteractiveServer();
      this.rebroadcastServer = useRebroadcastServer();
    },
    created() {
      this.listenEvents();
    },
    mounted() {
      const { watchInitData, isThirdStream } = this.roomBaseServer.state;
      const hasRebroadCast = watchInitData.rebroadcast?.id;

      if (
        watchInitData.webinar.type == 1 &&
        (hasRebroadCast ||
          (watchInitData.switch.start_type != 1 &&
            watchInitData.join_info.role_name == 3 &&
            watchInitData.webinar.no_delay_webinar != 1))
      ) {
        this.open();
      }
    },
    methods: {
      listenEvents() {
        const msgServer = useMsgServer();
        this.roomBaseServer.$on('LIVE_BROADCAST_START', () => {
          this.open();
        });

        this.rebroadcastServer.$on('live_broadcast_start', () => {
          this.open();
        });

        this.rebroadcastServer.$on('live_broadcast_stop', () => {
          this.close();
        });

        // 结束直播时关闭
        msgServer.$onMsg('ROOM_MSG', msg => {
          if (msg.data.type === 'live_over') {
            this.close();
          }
        });
      },
      /**
       * 调起转播
       */
      async open() {
        if (this.isShow || this.streamYun) {
          return;
        }
        const { watchInitData } = this.roomBaseServer.state;
        const token = watchInitData.interact.paas_access_token;
        const appId = watchInitData.interact.paas_app_id;
        const accountId = watchInitData.join_info.user_id;
        const roomId = watchInitData.interact.room_id;

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
          },
          isAudio: this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode == 1
        };
        this.isShow = true;

        if (this.interactiveServer.state.localStream.streamId) {
          this.interactiveServer.unpublishStream();
        }

        this.roomBaseServer.setChangeElement('rebroadcast-stream'); // 默认放小窗
      },
      async close() {
        this.isShow = false;
        this.$refs.videoPreview?.destroy();
        await this.$nextTick(0);
      },
      exchangeScreen() {
        const miniElement =
          this.miniElement === 'rebroadcast-stream' ? 'doc' : 'rebroadcast-stream';
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
