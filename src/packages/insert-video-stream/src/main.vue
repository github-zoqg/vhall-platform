<template>
  <div class="vmp-insert-stream" v-show="pushStreamSucces" ref="insterWarpRef">
    <div class="vmp-insert-stream-mask">
      <p>
        <span>视图</span>
        <el-tooltip content="切换" placement="top" v-if="!isFullScreen">
          <a href="javascript:void(0);" class="iconfont iconfuzhi" @click="exchange"></a>
        </el-tooltip>
        <el-tooltip content="全屏" placement="top">
          <a
            v-if="!isFullScreen"
            href="javascript:void(0);"
            class="iconfont iconquanping"
            @click="enterFull"
          ></a>
          <a
            v-if="isFullScreen"
            href="javascript:void(0);"
            class="iconfont iconquanpingguanbi"
            @click="tcqp"
          ></a>
        </el-tooltip>
      </p>
    </div>
    <!-- 本地互动流的显示容器 -->
    <div id="vmp-insert-local-stream" ref="localStreamRef" class="vmp-insert-local-stream"></div>

    <!-- 远端互动流的显示容器 订阅流 -->
    <div
      id="vmp-insert-subscribe-stream"
      ref="remoteStreamRef"
      class="vmp-insert-subscribe-stream"
    ></div>

    <!-- 本地视频插播的video容器 -->
    <div
      id="vmp-insert-stream-video"
      class="vmp-insert-stream-video"
      v-show="!remoteVideo.show"
      :style="{ height: isAudio ? '0px' : '100%' }"
    ></div>

    <!-- 远端视频插播的播放器容器 -->
    <div id="vmp-insert-remote-stream">
      <video-preview
        ref="insertStream"
        :videoParam="remoteVideo.videoParam"
        :isInsertVideoPreview="true"
        @remoteInsterSucces="remoteInsterSucces"
        @openInsert="handleOpenInsert"
        @closeInsertvideo="closeInsertvideo(true)"
        v-if="remoteVideo.show"
      ></video-preview>
    </div>

    <!-- 播放器控制条 -->
    <div
      v-show="!remoteVideo.show"
      class="vmp-insert-stream-controller"
      :class="{ 'insert-active-top': constrolUp }"
    >
      <div class="vmp-insert-stream-controller-slider">
        <el-slider
          ref="controllerRef"
          v-model="conctorObj.sliderVal"
          :show-tooltip="false"
          @change="setVideo"
        ></el-slider>
        <div
          v-show="conctorObj.TimesShow"
          class="vmp-insert-stream-controller-slider-times"
          :style="{ left: conctorObj.hoverLeft + 'px' }"
        >
          <span>{{ conctorObj.hoverTime | secondToDate }}</span>
        </div>
      </div>
      <div class="vmp-insert-stream-controller-wrap">
        <div class="vmp-insert-stream-controller-wrap-left">
          <i
            ref="videoPlayBtnDom"
            class="vh-iconfont"
            @click="videoPlayBtn"
            :class="conctorObj.statePaly ? 'vh-a-line-videopause' : 'vh-a-line-videoplay'"
          ></i>
          <div class="vmp-insert-time">
            <span>{{ conctorObj.currentTime | secondToDate }}</span>
            <span>/</span>
            <span>{{ conctorObj.totalTime | secondToDate }}</span>
          </div>
        </div>
        <div class="vmp-insert-stream-controller-wrap-right">
          <div class="vmp-volume-box">
            <span class="vmp-icon-box">
              <i
                class="vh-iconfont"
                :class="voice > 1 ? 'vh-line-voice' : 'vh-line-mute'"
                @click="jingYin"
              ></i>
            </span>
            <div class="vmp-ver-slider">
              <el-slider
                v-model="voice"
                vertical
                height="100px"
                @change="setVoice"
                :show-tooltip="true"
              ></el-slider>
            </div>
          </div>
          <el-tooltip effect="dark" content="插播列表">
            <i @click="handleOpenInsert" class="iconfont iconchaboliebiao_icon"></i>
          </el-tooltip>
          <el-tooltip effect="dark" content="关闭插播">
            <i @click="closeInsertvideo(true)" class="vh-iconfont vh-line-close"></i>
          </el-tooltip>
          <el-tooltip effect="dark" content="隐藏">
            <i @click="hideInsertVideoControl" class="vh-iconfont vh-line-arrow-down"></i>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import videoPreview from '@/packages/app-shared/components/video-preview';
  import {
    useInsertFileServer,
    useRoomBaseServer,
    useInteractiveServer,
    useMsgServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool.js';
  import moment from 'moment';
  export default {
    name: 'VmpInsertStream',
    data() {
      const { state: interactiveState } = this.interactiveServer;
      return {
        interactiveState,
        pushStreamSucces: false,
        remoteVideo: {
          show: false,
          videoParam: {
            paas_record_id: '48cdaf1d',
            msg_url: '.MP4'
          }
        },
        constrolUp: false, // 控制栏显示、隐藏
        conctorObj: {
          TimesShow: false,
          hoverTime: 0,
          hoverLeft: 0,
          totalTime: 1,
          currentTime: 0,
          sliderVal: 0,
          statePaly: false
        },
        isAudio: false,
        voice: 100,
        streamId: null,
        isLiving: 0,
        isFullScreen: false
      };
    },
    watch: {
      'conctorObj.sliderVal'(val) {
        if (this.onmousedownControl) {
          this.hoverTime = (val / 100) * this.conctorObj.totalTime;
          this.hoverLeft = (val / 100) * (this.ContorlWidth || 0);
        }
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
    components: { videoPreview },
    beforeCreate() {
      this.roomBaseServer = useRoomBaseServer();
      this.interactiveServer = useInteractiveServer();
      this.msgServer = useMsgServer();
      this.insertFileServer = useInsertFileServer();
    },
    mounted() {
      this.initEventListener();
    },
    methods: {
      async openInsertShow(File, type) {
        console.log('=====zhangxiao----', type);
        this.pushStreamSucces = true;
        const { watchInitData } = this.roomBaseServer.state;
        this.isLiving = watchInitData.webinar.type;
        if (type === 'local') {
          this.createInsertStream(File);
        } else {
          this.initRemoteVideo(File);
        }
      },
      async createInsertStream(File) {
        this._isHasLocalStreamIdBeforeInit = false;
        if (this._LoclaStreamId) {
          this._isHasLocalStreamIdBeforeInit = true; // 初始化插播之前如果存在插播流,需要记录一下,后续如果分辨率检测失败,关闭插播的时候会用这个状态判断
          await this.stopPushStream();
        }
        this.insertFileServer
          .createLocalVideoElement(File, { el: 'vmp-insert-stream-video' })
          .then(el => {
            this._isHasLocalStreamIdBeforeInit = false;
            this.insertSucces(el);
          })
          .catch(e => {
            this.$message.warning('视频分辨率过高，请打开分辨率为1280*720以下的视频');
            this.closeInsertvideo(false); // 关闭插播
          });
      },
      insertSucces(videoElement) {
        // 已经插入到dom
        console.log(videoElement);
        this._videoElement = videoElement;
        this._isFirstInsertSucces = true;
        this.InitVideoEvent(); // 事件监听 暂停，播放，播放完成
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClose', [true, ''])); // 关闭插播文件选择弹窗, true:表示有正在插播的文件
        this.initSlider(); // 初始化播放器控件
        this.play();
        this.pushLocalStream(); // 推流
      },
      creatLoaclStream() {
        return new Promise((resolve, reject) => {
          this.insertFileServer
            .createLocalInsertStream({
              videoNode: 'vmp-insert-local-stream'
            })
            .then(e => {
              console.log('创建插播本地流成功');
              resolve(e);
              // 并开始推送互动流
            })
            .catch(() => {
              console.log('创建插播本地流失败');
              // this.closeInsertvideo(false);
              reject(new Error('创建插播本地流失败'));
              this.$message.warning('插播创建失败，请重新选择');
            });
        });
      },
      pushLocalStream() {
        // if (this.isLiving != 1) {
        //   // 不在直播中，不推流
        //   return;
        // }
        const { watchInitData } = this.roomBaseServer.state;
        this.creatLoaclStream().then(res => {
          this.insertFileServer
            .publishInsertStream({ streamId: res })
            .then(e => {
              this._LoclaStreamId = e.streamId;
              console.log('插播推流成功', e, this._LoclaStreamId);
              this._isHasLocalStreamIdBeforeInit = true;
              this.pushStreamSucces = true;
              const obj = {
                accountId: watchInitData.webinar.userinfo.user_id,
                role: watchInitData.join_info.role_name,
                nickname: watchInitData.join_info.nickname,
                stream_type: 4,
                has_video: this.isAudio ? 0 : 1
              };
              window.$middleEventSdk?.event?.send(
                boxEventOpitons(this.cuid, 'emitInsertInfo', [obj])
              );
              // 开始插播事件
              // this.$nextTick(() => {
              //   // 文档需要调整大小
              //   // 手动触发window resize 事件
              //   const resizeEvent = new Event('resize');
              //   window.dispatchEvent(resizeEvent);
              // });
            })
            .catch(e => {
              this.$message.warning('插播推送失败，请重新选择');
            });
        });
      },
      InitVideoEvent() {
        // 本地插播
        this._videoElement.addEventListener('ended', () => {
          this._videoEnded = true;
        });
        this._videoElement.addEventListener('play', () => {
          console.log(this._videoEnded, 'play');
          this.conctorObj.statePaly = true;
        });
        this._videoElement.addEventListener('pause', () => {
          this.conctorObj.statePaly = false;
          console.log('暂停了啊');
        });
      },
      handleOpenInsert() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpen'));
      },
      async closeInsertvideo(isShowConfirmDialog) {
        if (!isShowConfirmDialog) {
          await this.closeInsertvideoHandler();
          return;
        }
        if (this.isFullScreen) {
          this.tcqp();
        }
        this.$confirm('确认关闭插播文件，并退出插播页面吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(() => {
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitClose', [false, ''])
            );
            this.closeInsertvideoHandler();
          })
          .catch(() => {});
      },
      closeInsertvideoHandler(isliveStart) {
        if (this.conctorObj.statePaly) {
          // 如果不是暂停状态，关闭插播时会触发暂停事件
          this._isCloseInsertvideoHandler = true;
        }
        return this.stopPushStream().then(() => {
          console.log('停止推流成功，执行隐藏控制栏的操作');
          // 取消 requestAnimation 的回调函数
          clearInterval(this.animationFrameId);
          this.pushStreamSucces = false;
          this.remoteVideo.show = false;
          document.getElementById('vmp-insert-stream-video').innerHTML = '';
          // this.$emit('update:playingInsertVideoId', null);
          // this.$emit('changeInsertVideoStatus', false);
          // this.$emit('pushStreamInsterRemove');
          this.$refs.insertStream && this.$refs.insertStream.destroy();
          // 关闭插播
          this.$refs.localStreamRef.innerHTML = '';
          if (this._isHasLocalStreamIdBeforeInit) {
            this._isHasLocalStreamIdBeforeInit = false;
            if (isliveStart) return; // 开始直播后，关闭插播，不触发开启麦克风消息
            // EventBus.$emit('inster_mic_open');
            // EventBus.$emit('insertVideoStop');
          }
        });
      },
      stopPushStream() {
        return new Promise((resolve, reject) => {
          if (!this._LoclaStreamId) {
            this.visibleBeforeLive = false;
            resolve();
            return;
          }
          // 停止推流
          this.insertFileServer
            .stopPublishInsertStream(this._LoclaStreamId)
            .then(e => {
              // 销毁本地流
              this._LoclaStreamId = null;
              resolve();
            })
            .catch(e => {
              document.getElementById('vmp-insert-stream-video').innerHTML = '';
              console.log('销毁本地插播流失败', e);
            });
        });
      },
      async initRemoteVideo(file) {
        if (this._LoclaStreamId) {
          await this.stopPushStream();
          const el = document.getElementById('vmp-insert-stream-video');
          el.innerHTML = '';
        }
        // this.$refs.insertStream && this.$refs.insertStream.destroy();
        this.remoteVideo.videoParam = file;
        this.$nextTick(() => {
          this.remoteVideo.show = true;
          this.isAudio = file.isAudio;
        });
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClose', [true, file.id])
        );
      },
      remoteInsterSucces(videEl) {
        console.log(videEl, '点播初始化成功');
        videEl.isAudio = this.isAudio;
        this.insertFileServer.setExistVideoElement(videEl);
        this._videoElement = videEl;
        this._isHasLocalStreamIdBeforeInit = 'noCare'; // 云插播不需要关心这个状态
        this.pushLocalStream();
      },
      initEventListener() {
        if (this.interactiveState.remoteStreams[0]) {
          this.subscribeInster();
          this.addSDKEvents();
        }
        this.msgServer.$on('live_start', msg => {
          this.closeInsertvideoHandler(true);
        });
        this.msgServer.$on('live_over', msg => {
          this.pushStreamSucces && this.closeInsertvideoHandler();
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
              this.isFullScreen = false;
            }
          },
          true
        );
      },
      subscribeInster(currentStreams) {
        if (!currentStreams) return;
        let owner = null;
        currentStreams.forEach(stream => {
          const obj = JSON.parse(stream.attributes);
          if (obj.stream_type == 4 || stream.streamType == 4) {
            owner = stream;
          }
        });
        if (!owner) return;
        console.log('刷新重新订阅- 插播流', owner);
        this.streamId = owner.streamId;
        const opt = {
          streamId: this.streamId,
          videoNode: 'vmp-insert-subscribe-stream', // 远端流显示容器，必填
          mute: { audio: false, video: false } // 是否静音，关视频。选填 默认false
        };
        this.insertFileServer
          .subscribeInsertStream(opt)
          .then(() => {
            const obj = JSON.parse(owner.attributes);
            obj.accountId = owner.accountId;
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitInsertInfo', [obj])
            ); // 其余订阅的人
            this.isAudio = obj.has_video == 0;
            this.subscribInsterStreamSucess = true;
          })
          .catch(e => {
            console.log('订阅失败', e);
          });
      },
      addSDKEvents() {
        // 流加入
        this.interactiveServer.$on(VhallRTC.EVENT_REMOTESTREAM_ADD, e => {
          console.log('监听流加入55555555', e);
          // { e.type， 流类行 }
          // 0: 纯音频, 1: 只是视频, 2: 音视频  3: 屏幕共享, 4: 插播
          const obj = JSON.parse(e.data.attributes);
          obj.accountId = e.data.accountId;
          if (obj.stream_type == 4 || e.data.streamType == 4) {
            console.log('流加入-插播流,自己收不到自己的流', e);
            this.isCurrentRoleInsert = false; // 非当前角色进行的插播
            this.streamId = e.data.streamId;
            const opt = {
              streamId: e.data.streamId,
              videoNode: 'vmp-insert-subscribe-stream', // 远端流显示容器，必填
              mute: { audio: false, video: false } // 是否静音，关视频。选填 默认false
            };
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitInsertInfo', [obj])
            );
            // this.$emit('addRemoteInterVideo', obj); // 其余订阅的人
            this.isAudio = obj.has_video == 0; // 音频是0
            this.interactiveServer
              .subscribeStream(opt)
              .then(() => {
                console.log('插播流订阅成功');
                this.subscribInsterStreamSucess = true;
                // EventBus.$emit('inster_mic_close');
              })
              .catch(e => {
                console.log('订阅失败', e);
              });
          }
        });

        // 插播流删除 流结束
        this.interactiveServer.$on(VhallRTC.EVENT_REMOTESTREAM_REMOVED, e => {
          console.log('EVENT_REMOTESTREAM_REMOVED插播流删除了', e);
          // 自己和其他人都能收到
          console.log('插播流删除，流id', e.data.streamId, this.streamId);
          if (e.data.streamId == this.streamId) {
            this.streamId = '';
            this.$refs.localStreamRef.innerHTML = '';
            this.subscribInsterStreamSucess = false;
            // EventBus.$emit('inster_mic_open');
            // this.$emit('pushStreamInsterRemove');
            clearInterval(this.resubscribeTimer);
          }
        });
        this.interactiveServer.$on(VhallRTC.EVENT_REMOTESTREAM_FAILED, e => {
          if (e.data.stream.getID() == this.streamId) {
            clearInterval(this.resubscribeTimer);
            this.resubscribeTimer = setInterval(() => {
              const opt = {
                streamId: this.streamId,
                videoNode: 'vmp-insert-subscribe-stream', // 远端流显示容器，必填
                mute: { audio: false, video: false } // 是否静音，关视频。选填 默认false
              };
              this.insertFileServer
                .subscribeInsertStream(opt)
                .then(() => {
                  clearInterval(this.resubscribeTimer);
                  console.log('重新插播流订阅成功', e.data.stream);
                  this.subscribInsterStreamSucess = true;
                })
                .catch(e => {
                  console.log('订阅失败', e);
                });
            }, 3000);
          }
        });
      },
      hideInsertVideoControl() {
        this.constrolUp = false;
      },
      initSlider() {
        this.conctorObj.sliderVal = 0;
        const tol = (this.conctorObj.totalTime = this._videoElement.duration);
        this.conctorObj.currentTime = 0;
        this._videoElement.addEventListener('timeupdate', () => {
          const cur = (this.conctorObj.currentTime = this._videoElement.currentTime);
          this.conctorObj.sliderVal = (cur / tol) * 100;
        });
        // 拖拽显示时间
        const dom = this.$refs.controllerRef.$el;
        const but = document.querySelector(
          '.vmp-insert-stream-controller-slider .el-slider__button-wrapper'
        );
        const innitDom = () => {
          dom.onmouseover = e => {
            console.log('dom over', e);
            this.conctorObj.TimesShow = true;
            const totalWidth = (this.ContorlWidth = dom.offsetWidth);
            const lef = e.layerX;
            this.conctorObj.hoverTime = (lef / totalWidth) * tol;
            this.conctorObj.hoverLeft = lef;
            dom.onmousemove = event => {
              const lef = event.layerX;
              this.conctorObj.hoverTime = (lef / totalWidth) * tol;
              this.conctorObj.hoverLeft = lef;
            };
          };
          // eslint-disable-next-line no-unused-vars
          dom.onmouseout = e => {
            this.conctorObj.TimesShow = false;
          };
        };
        innitDom();
        // eslint-disable-next-line no-unused-vars
        but.onmousedown = e => {
          dom.onmouseout = dom.onmousemove = dom.onmousemove = dom.onmouseover = null;
          this.ContorlWidth = dom.offsetWidth;
          this.onmousedownControl = true;
          this.pause();
          // eslint-disable-next-line no-unused-vars
          document.onmousemove = e => {
            this.conctorObj.TimesShow = true;
          };
          // eslint-disable-next-line no-unused-vars
          document.onmouseup = e => {
            document.onmousemove = null;
            this.onmousedownControl = false;
            this.conctorObj.TimesShow = false;
            innitDom();
          };
        };
        but.onmouseover = e => {
          this.conctorObj.TimesShow = false;
          e.stopPropagation();
        };
      },
      setVoice(val) {
        const vo = val / 100;
        if (this._videoElement) {
          if (val <= 0.01) {
            this._videoElement.volume = 0.01;
          } else {
            this._videoElement.volume = vo;
          }
        }
      },
      videoPlayBtn() {
        const ispaused = this._videoElement.paused;
        if (ispaused) {
          this.play();
        } else {
          this.pause();
        }
      },
      exchange() {
        // 切换小屏幕
      },
      jingYin() {
        const vo = this._videoElement && this._videoElement.volume;
        if (vo) {
          if (vo > 0.01) {
            this._cacheVolume = vo;
            this._videoElement.volume = 0.01;
            this.voice = 1;
          } else {
            this._videoElement.volume = this._cacheVolume;
            this.voice = this._cacheVolume * 100;
          }
        }
      },
      setVideo() {
        // 快进功能
        const time = (this.conctorObj.sliderVal / 100) * this.conctorObj.totalTime;
        console.log(this.conctorObj.sliderVal, '快进');
        this.setVideoCurrentTime(time);
        this.play();
      },
      setVideoCurrentTime(time) {
        this._videoElement.currentTime = time;
      },
      pause() {
        this._videoElement && this._videoElement.pause();
      },
      play() {
        this._videoElement && this._videoElement.play();
        this.conctorObj.statePaly = true;
      },
      /**
       * 全屏
       */
      enterFull() {
        this.isFullScreen = true;
        const fullarea = this.$refs.insterWarpRef;
        if (fullarea.requestFullscreen) {
          fullarea.requestFullscreen();
        } else if (fullarea.webkitRequestFullScreen) {
          fullarea.webkitRequestFullScreen();
        } else if (fullarea.mozRequestFullScreen) {
          fullarea.mozRequestFullScreen();
        } else if (fullarea.msRequestFullscreen) {
          // IE11
          fullarea.msRequestFullscreen();
        }
      },
      /**
       * 取消全屏
       */
      tcqp() {
        this.isFullScreen = false;
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    }
  };
</script>
<style lang="less">
  .vmp-insert-stream {
    width: 100%;
    height: 100%;
    position: relative;
    .vmp-insert-local-stream {
      position: absolute;
      height: 100px;
      width: 100px;
      display: none;
    }
    .vmp-insert-stream-video {
      position: absolute;
      height: 100%;
      width: 100%;
      left: 0px;
      top: 0px;
      background-color: #2d2d2d;
    }
    &-mask {
      opacity: 0;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 5;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
        opacity: 1;
      }
      p {
        width: 100%;
        color: #fff;
        text-align: center;
      }
      span {
        display: inline-block;
        text-align: right;
        width: 54px;
        margin-right: 10px;
        font-size: 12px;
      }
      a {
        display: inline-block;
        color: #fff;
        font-size: 16px;
        width: 32px;
        height: 32px;
        line-height: 32px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 100%;
        margin-right: 10px;
        &:hover {
          background: #fc5659;
        }
        &.iconsheweizhujiangren {
          font-size: 14px;
        }
      }
    }
    &-controller {
      position: absolute;
      // bottom: -31px;
      bottom: 0px;
      z-index: 20;
      width: 100%;
      padding: 0px 0 0 23px;
      height: 38px;
      box-sizing: border-box;
      background: rgba(26, 26, 26, 0.7);
      transition: all 0.8s;
      &.insert-active-top {
        bottom: 0px;
      }
      &-slider {
        position: absolute;
        width: 100%;
        height: 4px;
        background-color: rgba(255, 255, 255, 0.2);
        left: 0px;
        top: -8px;
        &:hover {
          height: 8px;
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
        &-times {
          position: absolute;
          top: -35px;
          text-align: center;
          padding: 5px;
          background: rgba(0, 0, 0, 0.3);
          font-size: 12px;
          color: #fff;
          transform: translateX(-50%);
        }
      }
      &-wrap {
        height: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        &-left {
          height: 38px;
          line-height: 38px;
          i {
            color: #fff;
            display: inline-block;
            cursor: pointer;
            font-size: 16px;
            text-align: center;
            position: relative;
          }
          .vmp-insert-time {
            display: inline-block;
            line-height: 48px;
            color: #fff;
            padding-left: 5px;
          }
        }
        &-right {
          color: #fff;
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
          .vh-iconfont {
            cursor: pointer;
          }
        }
      }
    }
  }
</style>
