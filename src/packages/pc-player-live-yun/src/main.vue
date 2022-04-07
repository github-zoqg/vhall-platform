<template>
  <div class="vmp-pc-player-live-yun">
    <!-- 播放器区域 -->
    <div id="vmp-player-yun"></div>
    <!-- 本地推流区域 -->
    <div id="stream-yun-box"></div>
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
      joinInfo() {
        return this.$domainStore.state.roomBaseServer.watchInitData.joinInfo;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.playerServer = usePlayerServer();
      this.interactiveServer = useInteractiveServer();
    },
    mounted() {
      this.init();
    },
    methods: {
      init() {
        // 主持人初始化播放器
        // 其他人创建本地流&推流
      },
      // 初始化播放器
      async initPlayer() {
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
              videoNode: `stream-stream-yun-box`
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

<style lang="less"></style>
