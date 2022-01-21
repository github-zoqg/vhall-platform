<template>
  <div class="vmp-video-preview">
    <div
      class="vmp-video-preview-wrap"
      v-loading="loading"
      element-loading-text="加载中"
      element-loading-background="rgba(0,0,0,.9)"
    >
      <div :id="'videoDom' + timestamp" class="vmp-video-preview-wrap-container">
        <div class="vmp-video-preview-wrap-tips" v-if="isAudio">
          <div class="vmp-video-img">
            <img class="audio-img" :src="audioImg" alt="" />
          </div>
        </div>
        <div class="vmp-video-preview-wrap-controller">
          <div class="vmp-video-preview-wrap-controller-slider">
            <!-- 进度条 -->
            <el-slider
              v-model="sliderVal"
              :show-tooltip="false"
              ref="controllerRef"
              @change="setVideo"
            ></el-slider>
            <div
              :style="{ left: hoverLeft + 'px' }"
              class="vmp-video-preview-wrap-controller-times"
            >
              <span>{{ hoverTime | secondToDate }}</span>
            </div>
          </div>
          <div class="vmp-video-preview-wrap-controller-icons">
            <div class="vmp-video-preview-wrap-controller-icons-left">
              <i v-if="!statePaly" class="iconfont iconbofang_icon" @click="videoPlayBtn"></i>
              <i v-else class="iconfont iconzanting_icon" @click="videoPlayBtn"></i>
              <div class="vmp-center-box">
                <span>
                  {{ currentTime | secondToDate }}
                </span>
                <span>/</span>
                <span>{{ totalTime | secondToDate }}</span>
              </div>
            </div>
            <div class="vmp-video-preview-wrap-controller-icons-right">
              <div class="vmp-volume-box">
                <span class="vmp-icon-box">
                  <i
                    class="iconfont"
                    @click="jingYin"
                    :class="voice > 0 ? 'iconyinliang_icon' : 'iconyinliangguanbi_icon'"
                  ></i>
                </span>
                <div class="vmp-ver-slider">
                  <el-slider
                    vertical
                    height="100px"
                    :min="0"
                    @change="setVoice"
                    v-model="voice"
                  ></el-slider>
                </div>
              </div>
              <template v-if="!isInsertVideoPreview">
                <i
                  v-if="isFullscreen"
                  class="iconfont iconicon_quxiaoquanping"
                  @click="exitFullscreen"
                ></i>
                <i v-else class="iconfont iconicon_quanping" @click="enterFullscreen"></i>
              </template>
              <!-- 插播视频播放器显示的按钮 -->
              <template v-if="isInsertVideoPreview">
                <el-tooltip effect="dark" content="插播列表">
                  <i @click="$emit('openInsert')" class="iconfont iconchaboliebiao_icon"></i>
                </el-tooltip>
                <el-tooltip effect="dark" content="关闭插播">
                  <i @click="$emit('closeInsertvideo')" class="iconfont iconguanbichabo_icon"></i>
                </el-tooltip>
                <el-tooltip effect="dark" content="隐藏">
                  <i
                    @click="$emit('hideInsertVideoControl')"
                    class="iconfont iconshouqibofangqi_icon"
                  ></i>
                </el-tooltip>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { useRoomBaseServer, usePlayerServer } from 'middle-domain';
  import moment from 'moment';
  export default {
    name: 'VmpVideoPreview',
    props: {
      videoParam: {
        type: Object,
        required: true
      },
      isInsertVideoPreview: {
        type: Boolean,
        default: false,
        required: false
      }
    },
    filters: {
      secondToDate(val) {
        let time = moment.duration(val, 'seconds');
        let hours = time.hours();
        let minutes = time.minutes();
        let seconds = time.seconds();
        let totalTime = '00:00';
        if (hours) {
          totalTime = moment({ h: hours, m: minutes, s: seconds }).format('HH:mm:ss');
        } else {
          totalTime = moment({ m: minutes, s: seconds }).format('mm:ss');
        }
        return totalTime;
      }
    },
    data() {
      return {
        roomBaseState: null,
        totalTime: 0,
        currentTime: 0,
        statePaly: false, // 播放状态
        voice: 20, // 音量
        isMute: false, // 是否为静音
        sliderVal: 0,
        hoverTime: 10, // seek显示时间
        hoverLeft: 10,
        TimesShow: false,
        loading: true,
        hoveVideo: false,
        isFullscreen: false,
        tipsType: 0, // 1为音频封面   2 播放结束
        audioImg: require('./images/video.gif'),
        timestamp: '' // 播放器容器时间戳
      };
    },
    computed: {
      isAudio() {
        const videoType = this.videoParam.msg_url || this.videoParam.file_type;
        return videoType.toLowerCase() == '.mp3' || videoType.toLowerCase() == '.mav';
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
    },
    created() {
      this.roomBaseState = this.roomBaseServer.state;
      this.playerServer = usePlayerServer();
      this.timestamp = new Date().getTime();
      this.initPlayer();
    },
    methods: {
      initPlayer() {
        this.initSDK().then(() => {
          if (this.isInsertVideoPreview) {
            this._firstInit = true;
          }
          this.totalTime = this.playerServer.getDuration(() => {
            console.log('获取总时间失败');
          }); // 获取视频总时长
          this.initSlider(); // 初始化播放进度条
          this.listen();
        });
      },
      async initSDK() {
        const { interact, join_info } = this.roomBaseState.watchInitData;
        const params = {
          appId: interact.paas_app_id || '', // 应用ID，必填
          accountId: join_info.third_party_user_id || '', // 第三方用户ID，必填
          token: interact.paas_access_token || '', // access_token，必填
          type: 'vod', // live 直播  vod 点播  必填
          videoNode: 'videoDom' + this.timestamp, // 播放器的容器， div的id 必填
          poster: '', // 封面地址  仅支持.jpg
          autoplay: false,
          forceMSE: false,
          vodOption: { recordId: this.videoParam.paas_record_id, forceMSE: false },
          subtitleOption: {
            enable: true
          }
        };
        return new Promise(resolve => {
          this.playerServer.init(params).then(() => {
            this.playerServer.openControls(false);
            this.playerServer.openUI(false);
            this.playerServer.$on(VhallPlayer.LOADED, () => {
              this.loading = false;
              resolve();
            });
          });
        });
      },
      videoPlayBtn() {
        this.statePaly ? this.playerServer.pause() : this.playerServer.play();
      },
      setVideo() {
        const time = (this.sliderVal / 100) * this.totalTime; // 快进
        this.setVideoCurrentTime(time);

        this.playerServer.play();
      },
      closeInsertvideo() {
        console.log('关闭插播');
      },
      hideInsertVideoControl() {
        console.log('wosh我是隐藏');
      },
      initSlider() {
        this.playerServer.$on(VhallPlayer.TIMEUPDATE, () => {
          this.currentTime = this.playerServer.getCurrentTime(() => {});
          this.sliderVal = (this.currentTime / this.totalTime) * 100;
        });
        // 拖拽显示时间
        const dom = this.$refs.controllerRef.$el;
        console.log('绑定事件dom', dom);
        const but = document.querySelector(
          '.vmp-video-preview-wrap-controller-slider .el-slider__button-wrapper'
        );
        const innitDom = () => {
          dom.onmouseover = e => {
            console.log('dom over', e);
            if (
              e.target.className === 'el-slider__button-wrapper' ||
              event.target.className.indexOf('el-slider__button') > -1
            ) {
              this.TimesShow = false;
              return;
            }
            this.TimesShow = true;
            const totalWidth = dom.offsetWidth;
            this.ContorlWidth = dom.offsetWidth;
            const lef = e.layerX;
            this.hoverTime = (lef / totalWidth) * this.totalTime;
            if (lef < 16) {
              this.hoverLeft = 16;
            } else if (lef > 600) {
              this.hoverLeft = 600;
            } else {
              this.hoverLeft = lef;
            }

            dom.onmousemove = event => {
              console.log('----dingxiaodong----mousemove', event);
              if (
                event.target.className === 'el-slider__button-wrapper' ||
                event.target.className.indexOf('el-slider__button') > -1
              ) {
                this.TimesShow = false;
                return;
              }
              const lef = event.layerX;
              this.hoverTime = (lef / totalWidth) * this.totalTime;
              if (lef < 16) {
                this.hoverLeft = 16;
              } else if (lef > 600) {
                this.hoverLeft = 600;
              } else {
                this.hoverLeft = lef;
              }
            };
          };
          dom.onmouseout = () => {
            this.TimesShow = false;
          };
        };
        innitDom();
        but.onmousedown = () => {
          dom.onmouseout = dom.onmousemove = dom.onmousemove = dom.onmouseover = null;
          this.ContorlWidth = dom.offsetWidth;
          this.onmousedownControl = true;
          this.playerServer.pause();
          document.onmousemove = () => {
            this.TimesShow = true;
          };
          document.onmouseup = () => {
            document.onmousemove = null;
            this.onmousedownControl = false;
            this.TimesShow = false;
            innitDom();
          };
        };
        but.onmouseover = e => {
          this.TimesShow = false;
          e.stopPropagation();
        };
      },
      jingYin() {
        if (this.isMute) {
          this.voice = this._cacheVolume;
          this.isMute = false;
          this.playerServer.setVolume(this.voice);
        } else {
          this._cacheVolume = this.voice;
          this.voice = 1;
          this.isMute = true;
          this.playerServer.setVolume(this.voice);
        }
      },
      setVoice() {
        this.playerServer.setVolume(this.voice);
      },
      enterFullscreen() {
        this.isFullscreen = true;
        this.playerServer.enterFullScreen();
      },
      exitFullscreen() {
        this.isFullscreen = false;
        this.playerServer.exitFullScreen();
      },
      destroy() {
        console.log('销毁点播播放器');
        this.playerServer.destroy();
<<<<<<< HEAD:src/packages/app-shared/components/video-preview/index.vue
      },
      // 设置播放时间
      setVideoCurrentTime(val) {
        if (!this.playerServer) return;

        this.playerServer.setCurrentTime(val, () => {
          this.$message({
            type: 'error',
            message: '设置当前时间失败,请稍后重试'
          });
          console.error('设置当前播放时间失败');
        });
=======
>>>>>>> f4c18d3 (feat: 新增插播逻辑):src/packages/components/video-preview/index.vue
      },
      // 设置播放时间
      setVideoCurrentTime(val) {
        if (!this.playerServer) return;

        this.playerServer.setCurrentTime(val, () => {
          this.$message({
            type: 'error',
            message: '设置当前时间失败,请稍后重试'
          });
          console.error('设置当前播放时间失败');
        });
      },
      // 设置播放时间
      setVideoCurrentTime(val) {
        if (!this.playerServer) return;

        this.playerServer.setCurrentTime(val, () => {
          this.$message({
            type: 'error',
            message: '设置当前时间失败,请稍后重试'
          });
          console.error('设置当前播放时间失败');
        });
      },
      listen() {
        this.playerServer.$on(VhallPlayer.ENDED, () => {
          console.log('播放结束');
          this.tipsType = 2;
          if (this.isInsertVideoPreview) {
            this._isVideoEnd = true;
            this.tipsType = 0;
          }
        });
        this.playerServer.$on(VhallPlayer.PLAY, () => {
          this.statePaly = true;
          // 监听播放状态
          if (this.isInsertVideoPreview) {
            if (!this._firstInit) {
              this.$emit('handleRemoteInsertVideoPlay', this._isVideoEnd);
            }
            this._isVideoEnd = false;
            if (this._firstInit) {
              const elVideo = document.getElementById('vh-video');
              this.$emit('remoteInsterSucces', elVideo);
              this._firstInit = false;
            }
          }
        });
        this.playerServer.$on(VhallPlayer.PAUSE, () => {
          if (this.isInsertVideoPreview) {
            // 监听暂停状态
            this.$emit('handleRemoteInsertVideoPause');
          }
          this.statePaly = false;
        });
        /**
         *  监听退出全屏事件
         */
        window.addEventListener(
          'fullscreenchange',
          e => {
            if (document.fullscreenElement) {
              // 进入全屏
            } else {
              // 离开全屏
              this.isFullscreen = false;
            }
          },
          true
        );
      }
    },
    beforeDestroy() {
      if (this.playerServer) {
        this.playerServer.destroy();
      }
    }
  };
</script>
<style lang="less">
  .vmp-video-preview {
    width: 100%;
    height: 100%;
    &-wrap {
      height: 100%;
      position: relative;
      overflow: hidden;
      &-container {
        height: 100%;
        width: 100%;
        background: black;
        &.hide {
          background: rgba(0, 0, 0, 0);
          /deep/ video {
            visibility: hidden;
          }
        }
      }
      &-tips {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background: #000;
        .vmp-video-img {
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          .audio-img {
            height: 100%;
            width: 100%;
            object-fit: cover;
          }
        }
      }
      &-controller {
        position: absolute;
        z-index: 20;
        width: 100%;
        height: 40px;
        bottom: 0px;
        background: rgba(0, 0, 0, 0.7);
        transition: all 0.8s;
        color: white;
        &-slider {
          width: 100%;
          position: absolute;
          top: 0;
          left: 0;
          &:hover {
            top: -2px;
            .el-slider__runway {
              height: 3px;
            }
            .el-slider__bar {
              height: 3px;
            }
            .vmp-video-preview-wrap-controller-times {
              display: block;
            }
          }
          .el-slider {
            .el-slider__runway {
              margin: 0;
              height: 3px;
              background-color: rgba(255, 255, 255, 0.3);
            }
          }
          .el-slider__button-wrapper {
            top: -16px;
          }
          .el-slider__bar {
            height: 3px;
            background-color: #fb3a32;
          }
          .el-slider__button {
            width: 10px;
            height: 10px;
            border-color: #fb3a32;
          }
        }
        &-times {
          position: absolute;
          line-height: 14px;
          top: -35px;
          text-align: center;
          padding: 5px;
          background: rgba(0, 0, 0, 0.3);
          font-size: 12px;
          color: #fff;
          transform: translateX(-50%);
          display: none;
        }
        &-icons {
          width: 100%;
          display: flex;
          justify-content: space-between;
          &-left {
            i:first-child {
              padding: 0 8px;
              cursor: pointer;
            }
            .local-icon {
              margin: 0 4px;
            }
            .vmp-center-box {
              display: inline-block;
              line-height: 48px;
            }
          }
          &-right {
            i:last-child {
              padding: 0 12px;
              cursor: pointer;
            }
            .vmp-volume-box {
              display: inline-block;
              line-height: 34px;
              position: relative;
              height: 34px;
              margin-top: 6px;
              &:hover {
                .vmp-ver-slider {
                  display: block;
                }
              }
              .vmp-icon-box {
                i {
                  padding-right: 5px;
                  cursor: pointer;
                }
              }
              .vmp-ver-slider {
                display: none;
                position: absolute;
                left: 16px;
                bottom: 32px;
                .el-slider {
                  .el-slider__runway {
                    margin: 0;
                    height: 3px;
                    background-color: rgba(255, 255, 255, 0.3);
                  }
                }
                .el-slider__bar {
                  height: 3px;
                  background-color: #fb3a32;
                }
                .el-slider__button {
                  width: 10px;
                  height: 10px;
                  border-color: #fb3a32;
                }
              }
            }
            .iconchaboliebiao_icon,
            .iconguanbichabo_icon {
              margin-left: 12px;
            }
            .iconfont {
              cursor: pointer;
            }
          }
        }
      }
    }
    .vhallPlayer-container {
      display: none !important;
    }
  }
</style>
