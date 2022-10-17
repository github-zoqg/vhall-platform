<template>
  <div class="vmp-video-preview">
    <div
      class="vmp-video-preview-wrap"
      v-loading="loading"
      element-loading-text="加载中"
      element-loading-background="rgba(0,0,0,.9)"
      @mousemove="wrapEnter"
      @mouseleave="wrapLeave(true)"
    >
      <div
        :id="'videoDom' + timestamp"
        class="vmp-video-preview-wrap-container"
        :class="isAudio && isInsertVideoPreview ? 'vmp-video-preview-wrap-container__hide' : ''"
      >
        <div class="vmp-video-preview-wrap-tips" v-if="isAudio && !isInsertVideoPreview">
          <div class="vmp-video-img">
            <img class="audio-img" :src="audioImg" alt="" />
          </div>
        </div>
        <div
          class="vmp-video-preview-wrap-controller"
          :class="hoveVideo ? 'vmp-video-preview-wrap-controller__active' : ''"
          v-show="isShowController"
        >
          <div class="vmp-video-preview-wrap-controller-slider" v-show="isVod">
            <!-- 进度条 -->
            <el-slider
              v-model="sliderVal"
              :show-tooltip="false"
              ref="controllerRef"
              @change="setVideo"
            ></el-slider>
            <div
              v-show="isVod"
              :style="{ left: hoverLeft + 'px' }"
              class="vmp-video-preview-wrap-controller-times"
            >
              <span>{{ hoverTime | secondToDate }}</span>
            </div>
          </div>
          <div class="vmp-video-preview-wrap-controller-icons">
            <div class="vmp-video-preview-wrap-controller-icons-left">
              <i
                class="vh-iconfont"
                :class="statePaly ? 'vh-a-line-videopause' : 'vh-line-video-play'"
                @click="videoPlayBtn"
              ></i>
              <div class="vmp-center-box" :class="isVod ? '' : 'vmp-center-box__hidden'">
                <template v-if="totalTime > 0">
                  <span>
                    {{ currentTime | secondToDate }}
                  </span>
                  <span>/</span>
                  <span>{{ totalTime | secondToDate }}</span>
                </template>
                <template v-else>
                  <span>--:--/--:--</span>
                </template>
              </div>
            </div>
            <div class="vmp-video-preview-wrap-controller-icons-right">
              <div class="vmp-volume-box">
                <span class="vmp-icon-box">
                  <i
                    class="vh-iconfont"
                    @click="jingYin"
                    :class="voice > 0 ? 'vh-line-voice' : 'vh-line-mute'"
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
                  class="vh-iconfont vh-a-line-exitfullscreen"
                  @click="exitFullscreen"
                ></i>
                <i v-else class="vh-iconfont vh-a-line-fullscreen" @click="enterFullscreen"></i>
              </template>
              <!-- 插播视频播放器显示的按钮 -->
              <template v-if="isInsertVideoPreview">
                <el-tooltip effect="dark" content="插播列表">
                  <i @click="$emit('openInsert')" class="vh-iconfont vh-line-menu"></i>
                </el-tooltip>
                <el-tooltip effect="dark" content="关闭插播">
                  <i
                    @click="$emit('closeInsertvideo', { isShowConfirmDialog: true })"
                    class="vh-iconfont vh-line-close"
                  ></i>
                </el-tooltip>
                <el-tooltip effect="dark" content="隐藏">
                  <i @click="hideInsertVideoControl" class="vh-iconfont vh-line-arrow-down"></i>
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
  export default {
    name: 'VmpVideoPreview',
    props: {
      videoParam: {
        type: Object,
        required: true
      },
      // 是否显示控制栏
      isShowController: {
        type: Boolean,
        require: false,
        default: false
      },
      isInsertVideoPreview: {
        type: Boolean,
        default: false,
        required: false
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
        if (!videoType) return false;
        return videoType.toLowerCase() == '.mp3' || videoType.toLowerCase() == '.mav';
      },
      isVod() {
        return this.videoParam.type == 'vod' || !this.videoParam.type;
      }
    },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
    },
    created() {
      this.roomBaseState = this.roomBaseServer.state;
      this.playerServer = usePlayerServer({
        extra: true
      });
      this.timestamp = new Date().getTime();
      this.initPlayer();
    },
    methods: {
      initPlayer() {
        this.initSDK().then(async () => {
          if (this.isInsertVideoPreview) {
            this._firstInit = true;
          }
          console.log('初始化播放器成功');
          this.totalTime =
            this.playerServer.getDuration(() => {
              console.log('获取总时间失败');
            }) || 0; // 获取视频总时长
          this.initSlider(); // 初始化播放进度条
          this.listen();
          await this.$nextTick(0);
          try {
            this.videoParam.autoplay && this.playerServer.play(); // TODO: player sdk 2.3.9+ 如果首次拉流404，后续不会自动播放，先hack解决
          } catch (err) {
            console.error('自动播放失败');
          }
        });
      },
      async initSDK() {
        const { interact, join_info } = this.roomBaseState.watchInitData;
        const { videoParam } = this;
        let params = {
          appId: interact.paas_app_id || '', // 应用ID，必填
          accountId: join_info.third_party_user_id || '', // 第三方用户ID，必填
          token: interact.paas_access_token || '', // access_token，必填
          type: videoParam.type || 'vod', // live 直播  vod 点播  必填
          videoNode: 'videoDom' + this.timestamp, // 播放器的容器， div的id 必填
          poster: '', // 封面地址  仅支持.jpg
          autoplay: videoParam.autoplay || false,
          forceMSE: false,

          subtitleOption: {
            enable: true
          }
        };

        if (params.type === 'live') {
          Object.assign(params, {
            liveOption: videoParam.liveOption
          });
        }

        if (params.type === 'vod') {
          Object.assign(params, {
            vodOption: { recordId: videoParam.paas_record_id, forceMSE: false }
          });
        }

        console.log('video init params', params);
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
        if (this.isInsertVideoPreview) {
          window.vhallReportForProduct.toReport(110212, {
            report_extra: {
              type: 'yunInsert',
              file_info: '',
              pre_status: this.statePaly ? 'playing' : 'pause',
              after_atatus: this.statePaly ? 'pause' : 'playing'
            }
          });
        }
      },
      setVideo() {
        const time = (this.sliderVal / 100) * this.totalTime; // 快进
        this.setVideoCurrentTime(time);

        this.playerServer.play();
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
          console.log('播放器播放事件');
          this.statePaly = true;
          // 监听播放状态
          if (this.isInsertVideoPreview) {
            if (!this._firstInit) {
              this.$emit('handleRemoteInsertVideoPlay', this._isVideoEnd);
            }
            this._isVideoEnd = false;
            if (this._firstInit) {
              const elVideo = document.querySelector(`#videoDom${this.timestamp} video`);
              this.$emit('remoteInsertSuccess', elVideo);
              this._firstInit = false;
            }
          }
        });
        this.playerServer.$on(VhallPlayer.PAUSE, () => {
          console.log('视频预览播放器暂停');
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
          () => {
            if (document.fullscreenElement) {
              // 进入全屏
            } else {
              // 离开全屏
              this.isFullscreen = false;
            }
          },
          true
        );
      },
      // 隐藏播放器控制栏
      hideInsertVideoControl() {
        this.hoveVideo = false;
      },
      wrapEnter() {
        this.hoveVideo = true;
      },
      wrapLeave(isSelfInvok) {
        // 如果是插播播放器，禁止组件自身触发leave方法，只能通过 parent.refs 调用
        if (isSelfInvok && this.isInsertVideoPreview) {
          return;
        }
        this.hoveVideo = false;
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
        &__hide {
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
        z-index: 6;
        width: 100%;
        height: 40px;
        bottom: -31px;
        background: rgba(0, 0, 0, 0.7);
        transition: all 0.8s;
        color: white;
        &__active {
          bottom: 0;
        }
        &-slider {
          width: 100%;
          position: absolute;
          top: 0;
          left: 0;
          &:hover {
            // top: -2px;
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
              &__hidden {
                visibility: hidden;
              }
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
            .vh-line-menu,
            .vh-line-close {
              margin-left: 12px;
            }
            .vh-iconfont {
              cursor: pointer;
              &:hover {
                color: #fb3a32;
              }
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
