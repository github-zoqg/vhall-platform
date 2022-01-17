<template>
  <div class="preview-wrap" :class="isInsertVideoPreview ? 'preview-insert-video-wrap' : ''">
    <div
      class="content"
      v-loading="loading"
      element-loading-text="加载中"
      element-loading-background="rgba(0,0,0,.9)"
      @mousemove="wrapEnter"
      @mouseleave="wrapLeave(true)"
    >
      <div
        :id="'videoDom' + timestamp"
        class="videoContainer"
        :class="isAudio && isInsertVideoPreview ? 'hide' : ''"
      >
        <div
          class="tips"
          v-if="!loading"
          :class="isAudio && !isInsertVideoPreview ? '' : 'tipsIndex'"
        >
          <div class="video-img" v-if="isAudio">
            <img class="audio-img" :src="audioImg" alt="" />
          </div>
          <!-- 插播视频不展示重新播放按钮 -->
          <div v-if="tipsType == 2 && !isInsertVideoPreview" class="video-end">
            <div class="reset-play" @click="resetPlay">
              <i class="iconfont iconicon_replay"></i>
              <p>重新播放</p>
            </div>
            <!-- <el-button class="reset-play" @click="resetPlay">再次播放</el-button> -->
          </div>
        </div>
        <div v-if="!loading" class="vod-controller" :class="{ active: hoveVideo }">
          <div class="slider line-slider">
            <el-slider
              v-model="sliderVal"
              :show-tooltip="false"
              ref="controllerRef"
              @change="setVideo"
            ></el-slider>
            <div
              class="Times"
              :style="{ left: hoverLeft + 'px' }"
              v-show="TimesShow && hoverTime >= 0"
            >
              <span class="current-time">{{ hoverTime | secondToDate }}</span>
            </div>
          </div>
          <div class="wrap clearFix">
            <div class="left-box fl">
              <i v-if="!statePaly" class="iconfont iconbofang_icon" @click="videoPlayBtn"></i>
              <i v-else class="iconfont iconzanting_icon" @click="videoPlayBtn"></i>
              <div class="center-box">
                <span class="current-time">
                  {{ currentTime | secondToDate }}
                </span>
                <span>/</span>
                <span class="all-time">{{ totalTime | secondToDate }}</span>
              </div>
            </div>
            <div class="right-box fr">
              <div class="volume-box">
                <span class="icon-box">
                  <i
                    class="iconfont"
                    @click="jingYin"
                    :class="voice > 0 ? 'iconyinliang_icon' : 'iconyinliangguanbi_icon'"
                  ></i>
                </span>
                <div class="ver-slider">
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
                  <i @click="closeInsertvideo" class="iconfont iconguanbichabo_icon"></i>
                </el-tooltip>
                <el-tooltip effect="dark" content="隐藏">
                  <i @click="hideInsertVideoControl" class="iconfont iconshouqibofangqi_icon"></i>
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
  import { secondToDateZH } from '@/utils/general';
  import controle from './js/control';
  import { sessionOrLocal } from '@/utils/utils';
  export default {
    data() {
      this.$Vhallplayer = null;
      return {
        totalTime: 0,
        currentTime: 0,
        statePaly: true, // 播放状态
        voice: 20, // 音量
        isMute: false, // 是否为静音
        sliderVal: 0, // seek
        hoverTime: 10, // seek显示时间
        hoverLeft: 10,
        TimesShow: false,
        isFullscreen: false, // 全屏
        loading: true,
        hoveVideo: false,
        audioImg: require('./images/video.gif'),
        tipsType: 0, // 1为音频封面   2 播放结束
        timestamp: '' // 播放器容器时间戳
      };
    },
    mixins: [controle],
    props: {
      videoParam: {
        type: Object,
        required: true
      },
      isInsertVideoPreview: {
        type: Boolean,
        default: false,
        required: false
      },
      appId: {
        type: String,
        default: '',
        required: false
      },
      accessToken: {
        type: String,
        default: '',
        required: false
      }
    },
    filters: {
      secondToDate(val) {
        return secondToDateZH(val);
      }
    },
    computed: {
      isAudio() {
        const videoType = this.videoParam.msg_url || this.videoParam.file_type;
        return videoType.toLowerCase() == '.mp3' || videoType.toLowerCase() == '.mav';
      }
    },
    created() {
      this.timestamp = new Date().getTime();
      this.userId =
        JSON.parse(sessionOrLocal.get('userId')) ||
        JSON.parse(sessionOrLocal.get('userInfo')).third_party_user_id;
      this.getVideoAppid();
      console.log(this.videoParam, this.isAudio, '?123454?????');
    },
    beforeDestroy() {
      if (this.$Vhallplayer) {
        this.$Vhallplayer.destroy();
      }
    },
    methods: {
      getVideoAppid() {
        if (this.appId && this.accessToken) {
          this.handleInit({ appId: this.appId, accessToken: this.accessToken });
          return;
        }
        this.$fetch('getAppid').then(res => {
          this.handleInit({ appId: res.data.app_id, accessToken: res.data.access_token });
        });
      },
      handleInit(options) {
        const { appId, accessToken } = options;
        this.initSDK(appId, accessToken).then(() => {
          if (this.isInsertVideoPreview) {
            this._firstInit = true;
          }
          this.initSlider();
          this.totalTime = this.$Vhallplayer.getDuration(() => {
            console.log('获取总时间失败');
          });
          this.listen();
        });
      },
      initSDK(app_id, access_token) {
        const incomingData = {
          appId: app_id, // 应用ID，必填
          accountId: this.userId || 1, // 第三方用户ID，必填
          token: access_token, // access_token，必填
          type: 'vod', // live 直播  vod 点播  必填
          videoNode: 'videoDom' + this.timestamp, // 播放器的容器， div的id 必填
          poster: '', // 封面地址  仅支持.jpg
          vodOption: { recordId: this.videoParam.paas_record_id, forceMSE: false },
          marqueeOption: {
            // 选填
            enable: false, // 默认 false
            text: 'xxx', // 跑马灯的文字
            alpha: 100, // 透明度  100 完全显示   0 隐藏
            size: 18, // 文字大小
            color: '#ff8d41', //  文字颜色
            interval: 20, // 下次跑马灯开始与本次结束的时间间隔 ， 秒为单位
            speed: 6000, // 跑马灯移动速度  3000快     6000中   10000慢
            position: 1 // 跑马灯位置 ， 1 随机 2上  3中 4下
          },
          watermarkOption: {
            // 选填
            enable: false // 默认 false
            // url: this.audioImg, // 水印图片的路径
            // align: 'tr', // 图片的对其方式， tl | tr | bl | br 分别对应：左上，右上，左下，右下
            // position: ['20px', '20px'], // 对应的横纵位置，支持px,vh,vw,%
            // size: ['80px', '35px'], // 水印大小，支持px,vh,vw,%
          },
          subtitleOption: {
            enable: true
          },
          otherOption: {
            vid: 0, // hostId
            vfid: 0,
            guid: 0,
            biz_id: 0,
            report_extra: "{'join_id':0,'switch_id':0,'is_filter':1}"
          }
        };
        return new Promise(resolve => {
          console.log('======实例化播放器参数======', incomingData);
          window.VhallPlayer.createInstance(
            incomingData,
            event => {
              this.$Vhallplayer = event.vhallplayer;
              window.vp = this.$Vhallplayer;
              this.$Vhallplayer.openControls(false);
              this.$Vhallplayer.on(window.VhallPlayer.LOADED, () => {
                this.loading = false;
                // 加载中
                resolve();
              });
            },
            e => {
              console.log('播放器创建实例失败', e, e.message);
              this.loading = false;
              throw new Error(e.message);
            }
          );
        });
      },
      destroy() {
        console.log('销毁点播播放器');
        this.$Vhallplayer.destroy();
      },
      initSlider() {
        this.$Vhallplayer.on(window.VhallPlayer.TIMEUPDATE, () => {
          this.currentTime = this.$Vhallplayer.getCurrentTime(() => {});
          this.sliderVal = (this.currentTime / this.totalTime) * 100;
        });
        // 拖拽显示时间
        const dom = this.$refs.controllerRef.$el;
        console.log('绑定事件dom', dom);
        const but = document.querySelector('div.el-slider__button-wrapper');
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
          this.$Vhallplayer.pause();
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
      closeInsertvideo() {
        this.$emit('closeInsertvideo', true);
      },
      // 隐藏播放器控制栏
      hideInsertVideoControl() {
        this.hoveVideo = false;
      }
    }
  };
</script>
<style lang="less" scoped>
  .preview-wrap {
    height: 100%;
    .content {
      height: 100%;
      position: relative;
      overflow: hidden;
      .videoContainer {
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
      .head {
        height: 40px;
        color: red;
        line-height: 40px;
        background: #ccc;
        span {
          display: inline-block;
          width: calc(100% - 40px);
          text-align: center;
        }
        .close {
          padding-right: 10px;
        }
      }
    }
    .tips {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: #000;
      .video-img {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        // position: absolute;
        // top:50%;
        // left:50%;
        // transform: translate(-50%, -50%);
        .audio-img {
          height: 100%;
          width: 100%;
          object-fit: cover;
        }
      }
      &.tipsIndex {
        display: none;
      }
      .video-end {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 22;
        background: #1a1a1a;
        i {
          color: #fff;
          font-size: 40px;
          padding: 10px;
        }
        // img{
        //   width: 100%;
        //   height: 100%;
        // }
        .reset-play {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          cursor: pointer;
        }
        p {
          color: #fff;
          font-size: 16px;
          padding-top: 10px;
        }
      }
    }
    /deep/.vhallPlayer-container {
      display: none !important;
    }
    .vod-controller {
      position: absolute;
      z-index: 20;
      width: 100%;
      height: 40px;
      bottom: -31px;
      background: rgba(0, 0, 0, 0.7);
      transition: all 0.8s;
      color: white;
      .local-icon {
        display: inline-block;
        width: 38px;
        text-align: center;
        color: white;
      }
      .slider::v-deep {
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        .Times {
          position: absolute;
          line-height: 14px;
          top: -35px;
          text-align: center;
          padding: 5px;
          background: rgba(0, 0, 0, 0.3);
          font-size: 12px;
          color: #fff;
          transform: translateX(-50%);
        }
        &:hover {
          top: -2px;
          .el-slider__runway {
            height: 3px;
          }
          .el-slider__bar {
            height: 3px;
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
      .wrap {
        width: 100%;
        .left-box {
          i:first-child {
            padding: 0 8px;
            cursor: pointer;
          }
          .local-icon {
            margin: 0 4px;
          }
          .center-box {
            display: inline-block;
            line-height: 48px;
          }
        }
        .right-box {
          i:last-child {
            padding: 0 12px;
            cursor: pointer;
          }
          .volume-box {
            display: inline-block;
            line-height: 34px;
            position: relative;
            height: 34px;
            margin-top: 6px;
            &:hover {
              .ver-slider {
                display: block;
              }
            }
            .icon-box {
              i {
                padding-right: 5px;
                cursor: pointer;
              }
            }
            .ver-slider::v-deep {
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
              // .el-slider__button-wrapper{
              //   top: -16px;
              // }
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
          .iconfont {
            cursor: pointer;
          }
        }
      }
    }
    .active {
      bottom: 0px;
    }
  }
  // 插播文件播放器样式 start
  .preview-insert-video-wrap {
    #videoDom {
      ::v-deep #vh-video {
        background-color: #2d2d2d;
      }
    }
    .vod-controller {
      background-color: rgba(26, 26, 26, 0.7);
      height: 38px;
      line-height: 38px;
      ::v-deep .slider {
        top: -8px;
        &:hover {
          top: -8px;
          .el-slider .el-slider__runway {
            height: 8px;
            .el-slider__bar {
              height: 8px;
            }
            .el-slider__button-wrapper {
              top: -14px;
            }
          }
        }
        .Times {
          top: -35px;
        }
      }
      .wrap {
        .left-box {
          height: 38px;
          .iconbofang_icon,
          .iconzanting_icon {
            padding-left: 23px !important;
            float: left;
          }
          .center-box {
            line-height: 38px;
            span {
              font-size: 12px;
              color: #888888;
              vertical-align: text-bottom;
            }
            .current-time {
              color: #f5f5f5;
            }
          }
        }
        .right-box {
          .volume-box {
            margin-top: 0;
            .ver-slider {
              left: 6px;
              bottom: 38px;
              ::v-deep .el-slider {
                width: 30px;
                left: -15px;
                background-color: rgba(0, 0, 0, 0.4);
                height: 120px;
                .el-slider__runway {
                  top: 10px;
                  left: 12px;
                }
              }
            }
          }
          .iconfont {
            font-size: 18px;
            margin-right: 14px;
            padding: 0 !important;
            color: #fff;
            &:hover {
              color: #fb3a32;
            }
            &.iconguanbichabo_icon,
            &.iconshouqibofangqi_icon {
              display: inline-block;
              width: 18px;
              height: 18px;
              padding: 0;
              line-height: 18px;
              text-align: center;
              border-radius: 9px;
              background-color: rgba(0, 0, 0, 0.4);
              font-size: 18px;
              color: #fff;
              &:hover {
                color: #fb3a32;
              }
            }
            &.iconshouqibofangqi_icon {
              margin-right: 24px;
            }
          }
        }
      }
    }
  }
</style>
