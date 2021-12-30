<template>
  <div class="vmp-player-container">
    <div class="vmp-player-box">
      <div id="vmp-player" class="vmp-player"></div>
      <!-- 控制条 进度条、弹幕、全屏、时间等 -->
      <div class="vmp-controller">
        <!-- 进度条 -->
        <div class="vmp-controller-slider">
          <el-slider ref="controllerRef" v-model="sliderVal" :show-tooltip="false"></el-slider>
        </div>
        <div class="vmp-controller-tools">
          <div class="vmp-controller-tools-left">
            <div class="start" @click="play">
              <i :class="`iconfont ${isLiving ? 'iconzanting_icon' : 'iconbofang_icon'}`"></i>
            </div>
            <div class="time">
              <span class="current-time">{{ secondToDate(currentTime) }}</span>
              <span>/</span>
              <span class="all-time">{{ secondToDate(totalTime) }}</span>
            </div>
          </div>
          <div class="vmp-controller-tools-right">
            <div class="quality">高清</div>
            <div class="speed">倍速</div>
            <div class="volume">
              <i
                :class="`iconfont ${voice > 0 ? 'iconyinliang_icon' : 'iconyinliangguanbi_icon'}`"
              ></i>
              <div class="volume-slider">
                <el-slider v-model="voice" vertical height="100px" :show-tooltip="true"></el-slider>
              </div>
            </div>
            <div class="danmuis"><i class="iconfont iconicon-pcdanmuguanbi"></i></div>
            <div class="fullscroll"><i class="iconfont iconquanping"></i></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { usePlayerServer, contextServer } from 'vhall-sass-domain';
  import { secondToDateZH, isIE, windowVersion } from './js/utils';
  export default {
    name: 'VmpPcPlayer',
    data() {
      const { state: playerState } = this.playerServer;
      // const { watchInitData } = this.roomBaseServer.state;
      return {
        playerState,
        isLiving: false, // 是否是播放状态
        isLive: false, // 是否是直播
        vodType: '', //回放的类型 暖场视频还是还是试看
        liveOption: {}, //直播时播放器liveOption参数
        vodOption: {}, //回放时回放id
        voice: 60, //声音
        sliderVal: 0, //进度条显示
        totalTime: 0, // 视频总时长
        currentTime: 0, // 视频当前播放时长
        qualitysList: [], //清晰度列表
        UsableSpeed: [] // 视频倍速列表
      };
    },
    beforeCreate() {
      this.roomBaseServer = contextServer.get('roomBaseServer');
      this.playerServer = usePlayerServer();
    },
    computed: {
      //判断是否是音频直播模式
      isAudio() {
        return this.watchInitData.webinar.mode == 1;
      }
    },
    created() {
      // this.playerServer.getPlayerConfig();
    },
    mounted() {
      setTimeout(() => {
        this.watchInitData = this.roomBaseServer.state.watchInitData;
        this.configList = this.roomBaseServer.state.configList;
        console.warn(this.watchInitData, '???=====zhangxiao======');
        this.getWebinerStatus();
        this.initPlayer();
      }, 1000);
    },
    methods: {
      // 初始化播放器配置项
      initConfig() {
        let params = {
          appId: this.watchInitData.interact.paas_app_id || '', // 应用ID，必填
          accountId: this.watchInitData.join_info.third_party_user_id || '', // 第三方用户ID，必填
          token: this.watchInitData.interact.paas_access_token || '', // access_token，必填
          videoNode: 'vmp-player',
          type: this.playerState.type, // live 直播  vod 点播  必填
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
          peer5Option: {
            open: this.configList['ui.browser_peer5'] == '1',
            customerId: 'ds6mupmtq5gnwa4qmtqf',
            fallback: true
          }
        };
        if (this.playerState.type == 'live') {
          params = Object.assign(params, {
            liveOption: this.liveOption
          });
        } else if (this.playerState.type === 'vod') {
          params = Object.assign(params, {
            vodOption: this.vodOption
          });
          params.pursueOption = { enable: true };
        } else {
          throw new Error('参数异常--2');
        }
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
              this.playerServer.on(VhallPlayer.LOADED, () => {
                resolve();
              });
            }
          });
        });
      },
      // 初始化播放器
      initPlayer() {
        this.initSDK().then(() => {
          this.getCurrentQuality();
          this.getQualitys();
          this.playerServer.on(VhallPlayer.PLAY, () => {
            console.warn('PLAY');
          });
          setTimeout(() => {
            if (this.playerState.type === 'vod') {
              this.totalTime = this.playerServer.getDuration(() => {
                console.log('获取视频总时长失败');
              });
              this.initSlider(); // 初始化播放进度条
              this.initSpeed(); // 获取倍速
            }
          }, 300);
        });
      },
      // 播放
      play() {
        this.isLiving = !this.isLiving;
        this.isLiving
          ? this.playerServer && this.playerServer.play()
          : this.playerServer && this.playerServer.pause();
      },
      // 暂停
      // pause() {
      //   this.isLiving = false;
      //   this.playerServer && this.playerServer.pause();
      // },
      // 判断是直播还是回放 活动状态
      getWebinerStatus() {
        if (this.watchInitData.status === 'live') {
          if (this.watchInitData.webinar.type === 1) {
            // 直播
            this.isLive = true;
            this.optionTypeInfo('live');
          } else if (this.watchInitData.webinar.type === 5) {
            // 回放
            this.optionTypeInfo('vod', this.watchInitData.paas_record_id);
          }
        } else {
          if (this.watchInitData.webinar.type === 3) return; //结束状态
          let _id = this.watchInitData.warmup.warmup_paas_record_id
            ? this.watchInitData.warmup.warmup_paas_record_id
            : this.watchInitData.preview_paas_record_id;
          this.vodType = this.watchInitData.warmup.warmup_paas_record_id ? 'warm' : 'shikan';
          // 暖场视频或者试看
          this.optionTypeInfo('vod', _id);
        }
      },
      optionTypeInfo(type, id) {
        const winVersion = windowVersion();
        // 直播
        this.playerServer.setType(type);
        if (type === 'live') {
          this.vodOption = {};
          this.liveOption = {
            type:
              this.configList['media_server.watch.rtmp_pc_to_hls'] === '1' || isIE()
                ? 'hls'
                : 'flv',
            roomId: this.roomInfo.room_id
          };
          if (isIE() && winVersion == 'win10') {
            this.liveOption.useSWF = false;
          } else if (isIE() && winVersion == 'win7') {
            this.liveOption.useSWF = true;
          }
        } else {
          this.vodOption.recordId = id;
          this.liveOption = {};
          if (isIE() && winVersion == 'win10') {
            this.liveOption.useSWF = false;
          } else if (isIE() && winVersion == 'win7') {
            this.liveOption.useSWF = true;
          }
        }
      },
      // 获取当前视频质量
      getCurrentQuality() {
        console.log(this.playerServer.getCurrentQuality(), '?????1111111');
      },
      // 获取视频清晰度列表
      getQualitys() {
        const qualityList = this.playerServer ? this.playerServer.getQualitys() : [];
        console.log(qualityList, '????222222');
        if (this.isAudio) {
          this.qualitysList = qualityList.filter(item => item.def === 'same');
          return;
        } else {
          this.qualitysList = qualityList;
        }
      },
      initSpeed() {
        this.UsableSpeed = this.playerServer.getUsableSpeed(() => {
          console.log('获取倍速失败');
        });
        console.log('获取倍速', this.UsableSpeed);
        this.UsableSpeed = this.UsableSpeed.filter(value => {
          return [2, 1.75, 1.5, 1.25, 1, 0.75].includes(value);
        });
      },
      initSlider() {
        this.playerServer.on(VhallPlayer.TIMEUPDATE, () => {
          console.log('获取当前视频播放时间失败----------');
          this.currentTime = this.playerServer.getCurrentTime(() => {
            // console.log('获取当前视频播放时间失败----------');
          });
          console.log('current time', this.currentTime);

          this.sliderVal = (this.currentTime / this.totalTime) * 100;
          // 派发播放器时间更新事件，通知章节当前播放的时间节点
          // this.$VhallEventBus.$emit(this.$VhallEventType.Chapter.PLAYER_TIME_UPDATE, this.currentTime);
        });
      },
      formatQualityText(val) {
        let text;
        switch (val) {
          case 'same':
            text = '原画';
            break;
          case '720p':
            text = '超清';
            break;
          case '480p':
            text = '高清';
            break;
          case 'a':
            text = '音频';
            break;
          case '360p':
            text = '标清';
            break;
          default:
            text = '标清';
        }
        return text;
      },
      secondToDate(val) {
        return secondToDateZH(val);
      }
    }
  };
</script>
<style lang="less">
  .vmp-player-container {
    padding-top: 56.25%;
    .vmp-player-box {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
    }
    .vmp-player {
      height: 100%;
      width: 100%;
      border-radius: 4px;
    }
    .vmp-controller {
      position: absolute;
      // bottom: -48px;
      bottom: 5px;
      z-index: 6;
      width: 100%;
      height: 38px;
      box-sizing: border-box;
      background: rgba(0, 0, 0, 0.7);
      transition: all 0.8s;
      &-slider {
        position: absolute;
        top: -4px;
        width: 100%;
        left: 0;
        .el-slider__runway {
          margin: 0;
          height: 4px;
          background-color: rgba(255, 255, 255, 0.3);
        }
        .el-slider__bar {
          height: 4px;
          background-color: @bg-error-light;
        }
        .el-slider__button {
          width: 9px;
          height: 9px;
          border: 0;
          position: absolute;
          top: 13px;
          left: 16px;
          background-color: @bg-error-light;
          box-shadow: 0 0 10px @bg-error-light;
        }
        &:hover {
          .el-slider__runway,
          .el-slider__bar {
            height: 10px;
          }
          .el-slider__button {
            width: 14px;
            height: 14px;
            transform: scale(1) !important;
          }
        }
      }
      &-tools {
        height: 38px;
        display: flex;
        line-height: 38px;
        justify-content: space-between;
        font-size: 14px;
        .iconfont {
          font-size: 20px;
          color: @font-error-low;
        }
        &-left {
          padding-left: 20px;
          display: flex;
          color: @font-error-low;
          div {
            padding-right: 5px;
          }
        }
        &-right {
          display: flex;
          > div {
            padding-right: 20px;
            color: @font-error-low;
          }
          .volume {
            position: relative;
            cursor: pointer;
            &:hover {
              .volume-slider {
                display: block;
              }
            }
            &-slider {
              width: 30px;
              position: absolute;
              bottom: 100%;
              left: -20%;
              background-color: rgba(0, 0, 0, 0.7);
              display: none;
              border-radius: 2px;
              .el-slider__runway {
                margin: 10px auto 10px;
                background-color: rgba(255, 255, 255, 0.3);
              }
              .el-slider__bar {
                background-color: @bg-error-light;
              }
              .el-slider__button {
                position: absolute;
                width: 12px;
                height: 12px;
                top: 10px;
                left: 12px;
                border: 0;
                background-color: @bg-error-light;
                box-shadow: 0 0 10px @bg-error-light;
              }
            }
          }
        }
      }
    }
  }
</style>
