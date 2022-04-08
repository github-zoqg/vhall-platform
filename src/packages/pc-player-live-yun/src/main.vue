<template>
  <div class="vmp-pc-player-live-yun">
    <!-- 播放器区域 -->
    <div id="vmp-player-yun" class="player_box" v-if="roleName == 1 && !pushStream"></div>
    <!-- 本地推流区域 -->
    <div v-else class="stream_box">
      <div id="stream-yun-box"></div>
    </div>
  </div>
</template>

<script>
  import { useRoomBaseServer, usePlayerServer, useInteractiveServer } from 'middle-domain';
  export default {
    name: 'VmpPcPlayerLiveYun',
    data() {
      return {};
    },
    computed: {
      // 直播类型 6分组
      mode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      },
      roleName() {
        return this.$domainStore.state.roomBaseServer.watchInitData?.join_info?.role_name;
      },
      pushStream() {
        return /lives\/yun/.test(location.pathname);
      }
    },
    watch: {},
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.playerServer = usePlayerServer();
      this.interactiveServer = useInteractiveServer();
    },
    created() {
      this.init();
    },
    methods: {
      async init() {
        // 主持人初始化播放器
        if (this.roleName == 1 && !this.pushStream) {
          this.initPlayer();
        } else {
          // 其他人创建本地流&推流
          await this.createLocalStream();
          await this.publishLocalStream();
        }
      },
      // 初始化播放器
      async initPlayer() {
        console.log('云导播初始化播放器');
        return this.playerServer
          .init({
            videoNode: 'vmp-player-yun'
          })
          .then(() => {});
      },
      // 创建本地流
      async createLocalStream() {
        console.log('创建本地流', this.$domainStore.state.mediaSettingServer.videoType);
        if (this.$domainStore.state.mediaSettingServer.videoType == 'camera') {
          await this.interactiveServer
            .createLocalVideoStream({
              videoNode: `stream-yun-box`
            })
            .catch(e => {
              if (e && e?.name == 'NotAllowed') {
                return Promise.reject('NotAllowed');
              } else {
                return Promise.reject('createLocalStreamError');
              }
            });
        } else {
          // 若是图片推流，刷新则需等待canvas进行绘制
          await this.sleep();
          const videoTracks = await this.$refs.imgPushStream.getCanvasStream();
          if (!videoTracks) {
            throw 'getCanvasStreamError';
          }
          await this.interactiveServer
            .createLocalPhotoStream({
              videoNode: `stream-${this.joinInfo.third_party_user_id}`,
              videoTrack: videoTracks
            })
            .catch(() => {
              return Promise.reject('createLocalPhotoStreamError');
            });
        }
      },
      // 推流
      async publishLocalStream() {
        await this.interactiveServer.publishStream().catch(e => {
          console.log('paltForm publishLocalStream failed....', e);
          if (e.code === '611007') {
            this.handleSpeakOnError('noPermission');
          } else {
            this.handleSpeakOnError('publishStreamError');
          }
        });
      }
    }
  };
</script>

<style lang="less">
  .vmp-pc-player-live-yun {
    width: 100%;
    height: 100%;
    .player_box,
    .stream_box,
    #stream-yun-box {
      width: 100%;
      height: 100%;
    }
  }
</style>
