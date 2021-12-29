<template>
  <div class="vmp-player-container">
    <div id="vmp-player" class="vmp-player"></div>
  </div>
</template>
<script>
  import { usePlayerServer, contextServer } from 'vhall-sass-domain';
  export default {
    name: 'VmpPcPlayer',
    data() {
      return {
        isLive: false // 是否是直播
      };
    },
    beforeCreate() {
      this.roomBaseServer = contextServer.get('roomBaseServer');
      this.playerServer = usePlayerServer();
    },
    created() {
      // this.playerServer.getPlayerConfig();
    },
    mounted() {
      setTimeout(() => {
        this.initPlayer();
      }, 1000);
    },
    methods: {
      // 初始化播放器配置项
      initConfig() {
        let params = {
          appId: 'fd8d3653', // 应用ID，必填
          accountId: 'visit_v1475340793824301056', // 第三方用户ID，必填
          token: 'access:fd8d3653:643a92ee55dd7b56', // access_token，必填
          videoNode: 'vmp-player',
          type: 'vod', // live 直播  vod 点播  必填
          poster: '',
          autoplay: false,
          forceMSE: false,
          subtitleOption: {
            enable: true
          },
          // 强制卡顿切线
          thornOption: {
            enable: true
          },
          barrageSetting: {
            positionRange: [0, 1],
            speed: 15000,
            style: {
              fontSize: 16
            }
          },
          vodOption: {
            forceMSE: true,
            recordId: 'f3e6eae5'
          },
          peer5Option: {
            open: false,
            customerId: 'ds6mupmtq5gnwa4qmtqf',
            fallback: true
          }
        };
        return params;
      },
      async initSDK() {
        const params = this.initConfig();
        return new Promise(resolve => {
          this.playerServer.init(params).then(() => {
            // this.eventPointList = this.playerServer.state.markPoints;

            this.playerServer.openControls(false);
            this.playerServer.openUI(false);

            if (this.isLive) {
              resolve();
            } else {
              // this.playerServer.on(VhallPlayer.LOADED, () => {
              //   this.loaded = true;
              resolve();
              // });
            }
          });
        });
      },
      // 初始化播放器
      initPlayer() {
        this.initSDK().then(() => {
          // this.playerServer.on(VhallPlayer.PLAY, () => {
          //   console.warn('PLAY');
          // });
        });
      },
      // 获取当前视频质量
      getCurrentQuality() {
        console.log(this.playerServer.getCurrentQuality(), '?????1111111');
      },
      // 获取视频清晰度列表
      getQualitys() {
        const qualityList = this.playerServer ? this.playerServer.getQualitys() : [];
        console.log(qualityList, '????222222');
        // if (this.isAudio) {
        //   this.qualitysMap = qualityList.filter(item => item.def === 'same');
        //   return;
        // }
      },
      formatQualityText(val) {
        let text;
        switch (val) {
          case 'same':
            text = this.$t('original');
            break;
          case '720p':
            text = this.$t('fhd');
            break;
          case '480p':
            text = this.$t('hd');
            break;
          case 'a':
            text = this.$t('audio');
            break;
          case '360p':
            text = this.$t('sd');
            break;
          default:
            text = this.$t('sd');
        }
        return text;
      }
    }
  };
</script>
<style lang="less" scoped>
  .vmp-player-container {
    width: 100%;
    background: #ccc;
    padding-top: 56.25%;
    position: relative;
    .vmp-player {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
    }
  }
</style>
