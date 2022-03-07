<template>
  <div class="vmp-insert-stream" v-show="insertFileStreamVisible" ref="insterWarpRef">
    <div class="vmp-insert-stream-mask">
      <p>
        <span>视图</span>
        <el-tooltip content="切换" placement="top" v-if="!isFullScreen">
          <a
            href="javascript:void(0);"
            class="vh-iconfont vh-line-copy-document"
            @click="exchange"
          ></a>
        </el-tooltip>
        <el-tooltip content="全屏" placement="top">
          <a
            v-if="!isFullScreen"
            href="javascript:void(0);"
            class="vh-iconfont vh-line-amplification"
            @click="enterFullScreen"
          ></a>
          <a
            v-if="isFullScreen"
            href="javascript:void(0);"
            class="vh-iconfont vh-line-narrow"
            @click="exitFullScreen"
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
      v-show="insertFileType == 'local' && isCurrentRoleInsert"
      :style="{ height: isAudio ? '0px' : '100%' }"
    ></div>

    <!-- 音频插播封面图 -->
    <img v-if="isAudio" class="vmp-insert-stream-audio-poster" src="./img/video.gif" alt="" />

    <!-- 远端视频插播的播放器容器 -->
    <div id="vmp-insert-remote-stream" class="vmp-insert-remote-stream">
      <video-preview
        ref="insertStream"
        :videoParam="remoteVideoParam"
        :isInsertVideoPreview="true"
        @remoteInsterSucces="remoteInsterSucces"
        @openInsert="handleOpenInsertFileDialog"
        @handleRemoteInsertVideoPlay="handleRemoteInsertVideoPlay"
        @handleRemoteInsertVideoPause="handleRemoteInsertVideoPause"
        @closeInsertvideo="closeInsertvideo"
        v-if="insertFileType == 'remote' && isCurrentRoleInsert"
      ></video-preview>
    </div>

    <!-- 播放器控制条 -->
    <div
      v-show="insertFileType == 'local' && isCurrentRoleInsert"
      class="vmp-insert-stream-controller"
      :class="{ 'insert-active-top': constrolUp }"
    >
      <div class="vmp-insert-stream-controller-slider">
        <el-slider
          ref="controllerRef"
          v-model="conctorObj.sliderVal"
          :show-tooltip="false"
          @change="setVideoCurrentTime"
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
            :class="conctorObj.statePlay ? 'vh-a-line-videopause' : 'vh-line-video-play'"
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
            <i @click="handleOpenInsertFileDialog" class="iconfont iconchaboliebiao_icon"></i>
          </el-tooltip>
          <el-tooltip effect="dark" content="关闭插播">
            <i
              @click="
                closeInsertvideo({
                  isShowConfirmDialog: true
                })
              "
              class="vh-iconfont vh-line-close"
            ></i>
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
      return {
        insertFileStreamVisible: false, // 是否展示插播流组件
        remoteVideoParam: {
          paas_record_id: '',
          file_type: '',
          autoplay: true
        },
        constrolUp: false, // 控制栏显示、隐藏
        conctorObj: {
          TimesShow: false,
          hoverTime: 0,
          hoverLeft: 0,
          totalTime: 1,
          currentTime: 0,
          sliderVal: 0,
          statePlay: false
        },
        voice: 100,
        streamId: null,
        isFullScreen: false
      };
    },
    computed: {
      // 云插播 remote 本地插播 local
      insertFileType() {
        return this.$domainStore.state.insertFileServer.insertFileType;
      },
      // 是否是音频插播
      isAudio() {
        return !this.$domainStore.state.insertFileServer.insertStreamInfo.has_video;
      },
      // 是否是当前用户插播
      isCurrentRoleInsert() {
        return (
          // 当前正在插播，插播人id等于当前用户id
          this.$domainStore.state.insertFileServer.isInsertFilePushing &&
          this.$domainStore.state.insertFileServer.insertStreamInfo.userInfo.accountId ==
            this.$domainStore.state.roomBaseServer.watchInitData.join_info.third_party_user_id
        );
      }
    },
    watch: {
      'conctorObj.sliderVal'(val) {
        if (this.onmousedownControl) {
          this.hoverTime = (val / 100) * this.conctorObj.totalTime;
          this.hoverLeft = (val / 100) * (this.ContorlWidth || 0);
        }
      },
      '$domainStore.state.insertFileServer.currentRemoteInsertFile': {
        handler(value) {
          if (value) {
            this.remoteVideoParam.paas_record_id = value.paas_record_id;
            this.remoteVideoParam.file_type = value.paas_record_id;
          }
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
      this.interactiveServer = useInteractiveServer();
      this.msgServer = useMsgServer();
    },
    mounted() {
      this.initEventListener();
    },
    methods: {
      // 开始插播的入口
      async startInertFile() {
        const { watchInitData } = useRoomBaseServer().state;
        const insertFileServer = useInsertFileServer();
        // 展示插播流组件
        this.insertFileStreamVisible = true;
        // 设置插播状态为 true
        insertFileServer.setInsertFilePushing(true);
        insertFileServer.state.insertStreamInfo.userInfo = {
          // 推插播流的人的信息
          accountId: watchInitData.join_info.third_party_user_id,
          role: watchInitData.join_info.role_name,
          nickname: watchInitData.join_info.nickname
        };
        if (this.insertFileType === 'local') {
          // 本地插播
          this.initLocalInsertFile();
        } else {
          // 云插播
          this.initRemoteInsertFile();
        }
      },
      // 初始化本地插播,创建video标签播放本地文件
      async initLocalInsertFile() {
        this._videoEnded = false; // 本地插播文件是否播放结束
        this._isFirstInsertSucces = true; // 记录开始本地插播的状态，video play事件会用到
        const insertFileServer = useInsertFileServer();
        if (insertFileServer.state.insertStreamInfo.streamId) {
          await this.stopPushStream();
        }
        // 创建video标签播放本地音视频文件
        insertFileServer
          .createLocalVideoElement(insertFileServer.currentLocalInsertFile, {
            el: 'vmp-insert-stream-video'
          })
          .then(videoElement => {
            // video创建成功，初始化
            this.handleLocalInsertVideoCreated(videoElement);
          })
          .catch(err => {
            console.log('初始化本地插播播放器失败', err);
            this.$message.warning('视频分辨率过高，请打开分辨率为1280*720以下的视频');
            // 关闭插播
            this.closeInsertvideo({
              isShowConfirmDialog: false
            }); // 关闭插播
          });
      },
      // 本地插播，video成功创建之后的处理逻辑
      handleLocalInsertVideoCreated(videoElement) {
        // 保存当前正在播放的videoElement对象，后续播放、暂停、设置事件等需要用到
        this._localFileVideoElement = videoElement;
        // 事件监听 暂停，播放，播放完成
        this.InitVideoEvent();
        // 关闭插播列表弹窗
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitCloseInsertFileDialog')
        );
        this.initSlider(); // 初始化播放器控件
        this.play();
        this.pushLocalStream(); // 推流
      },
      // 创建本地插播流
      creatLoaclStream() {
        const insertFileServer = useInsertFileServer();
        return new Promise((resolve, reject) => {
          insertFileServer
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
              this.closeInsertvideo({
                isShowConfirmDialog: false
              });
              reject(new Error('创建插播本地流失败'));
              this.$message.warning('插播创建失败，请重新选择');
            });
        });
      },
      // 推流
      pushLocalStream() {
        const interactiveServer = useInteractiveServer();
        const { watchInitData } = useRoomBaseServer().state;
        // 如果未开播，不推流
        if (watchInitData.webinar.type != 1) return;

        const insertFileServer = useInsertFileServer();

        this.creatLoaclStream()
          .then(res => {
            insertFileServer
              .publishInsertStream({ streamId: res.streamId })
              .then(() => {
                interactiveServer.resetLayout();
              })
              .catch(() => {
                this.$message.warning('插播推送失败，请重新选择');
              });
          })
          .catch(err => {
            console.log('创建插播流失败', err);
          });
      },
      // 云插播播放器开始播放
      handleRemoteInsertVideoPlay(isVideoEnd) {
        const insertFileServer = useInsertFileServer();
        if (isVideoEnd) {
          // 如果是结束播放，重新开始播放，需要重新推流
          this.stopPushStream().then(() => {
            this.pushLocalStream();
          });
        }
        // 发送自定义消息，通知开始插播，互动角色关闭麦克风
        insertFileServer.sendStateChangeMessage(1);
      },
      // 云插播播放器暂停播放
      handleRemoteInsertVideoPause() {
        const insertFileServer = useInsertFileServer();
        // 发送自定义消息，通知插播暂停，互动角色开启麦克风
        insertFileServer.sendStateChangeMessage(0);
      },
      // 添加播放器video事件
      InitVideoEvent() {
        const insertFileServer = useInsertFileServer();
        // 本地插播
        this._localFileVideoElement.addEventListener('ended', () => {
          this._videoEnded = true;
        });
        // 本地插播播放器播放事件
        this._localFileVideoElement.addEventListener('play', () => {
          console.log(this._videoEnded, 'play');
          this.conctorObj.statePlay = true;
          // 如果是结束播放，重新开始播放，需要重新推流
          if (this._videoEnded) {
            this._videoEnded = false;
            this.stopPushStream().then(() => {
              this.pushLocalStream();
            });
          }
          // 发送自定义消息，通知开始插播，互动角色关闭麦克风
          // 如果是插播由 暂停 ——> 开始，才需要发自定义消息
          if (this._isFirstInsertSucces) {
            this._isFirstInsertSucces = false;
            return;
          }
          insertFileServer.sendStateChangeMessage(1);
        });
        // 本地插播播放器暂停事件
        this._localFileVideoElement.addEventListener('pause', () => {
          console.log('暂停了啊');
          this.conctorObj.statePlay = false;
          // 如果不是关闭触发的暂停，发送自定义消息，通知插播暂停，互动角色开启麦克风
          if (!this._isCloseInsertvideoHandler) {
            insertFileServer.sendStateChangeMessage(0);
            return;
          }
          this._isCloseInsertvideoHandler = false;
        });
      },
      // 打开插播列表dialog
      handleOpenInsertFileDialog() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'openInsertFileDialog'));
      },
      /**
       * 关闭插播
       * @param {Object} param0 isShowConfirmDialog 是否弹出确认关闭的弹窗
       */
      async closeInsertvideo(
        options = {
          isShowConfirmDialog: false
        }
      ) {
        console.log('----关闭插播----', options.isShowConfirmDialog);
        // 如果不需要展示确认关闭按钮
        if (!options.isShowConfirmDialog) {
          await this.closeInsertvideoHandler();
          return;
        }
        // 关闭插播的时候如果处于全屏状态，退出全屏
        if (this.isFullScreen) {
          this.exitFullScreen();
        }
        this.$confirm('确认关闭插播文件，并退出插播页面吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(() => {
            // 关闭插播列表弹窗
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitCloseInsertFileDialog')
            );
            this.closeInsertvideoHandler();
          })
          .catch(() => {});
      },
      // 关闭插播，还原插播状态 isliveStart 是否是开始直播调用的关闭插播的方法
      // 如果是开始直播触发的关闭插播,不需要更改对端的麦克风状态
      closeInsertvideoHandler(isliveStart) {
        const interactiveServer = useInteractiveServer();
        if (this.conctorObj.statePlay) {
          // 如果不是暂停状态，关闭插播时会触发暂停事件，记录这个状态，暂停事件不需要发自定义消息
          this._isCloseInsertvideoHandler = true;
        }
        const insertFileServer = useInsertFileServer();
        // 设置插播状态为 false
        insertFileServer.setInsertFilePushing(false);
        return this.stopPushStream().then(() => {
          interactiveServer.resetLayout();
          // 还原插播状态
          insertFileServer.clearInsertFileInfo();
          document.getElementById('vmp-insert-stream-video').innerHTML = '';
          // 云插播播放器销毁
          this.$refs.insertStream && this.$refs.insertStream.destroy();
          // 本地插播播放器销毁
          this.$refs.localStreamRef.innerHTML = '';
          // 云插播播放器容器销毁
          insertFileServer.setInsertFileType('');
          // 插播隐藏
          this.insertFileStreamVisible = false;
          if (isliveStart) return;
          // 通知更改麦克风状态
          // EventBus.$emit('inster_mic_open');
          // EventBus.$emit('insertVideoStop');
        });
      },
      // 销毁插播流
      stopPushStream() {
        const insertFileServer = useInsertFileServer();
        if (!insertFileServer.state.insertStreamInfo.streamId) {
          return Promise.resolve();
        }
        // 停止推流
        return insertFileServer
          .stopPublishInsertStream(insertFileServer.state.insertStreamInfo.streamId)
          .catch(e => {
            console.log('销毁本地插播流失败', e);
            return e;
          });
      },
      // 初始化云插播
      async initRemoteInsertFile() {
        const insertFileServer = useInsertFileServer();
        if (insertFileServer.state.insertStreamInfo.streamId) {
          await this.stopPushStream();
          const el = document.getElementById('vmp-insert-stream-video');
          el.innerHTML = '';
        }
        if (this.$refs.insertStream) {
          this.$refs.insertStream && this.$refs.insertStream.destroy();
          this.$refs.insertStream.initPlayer();
        }
        // 关闭插播列表弹窗
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitCloseInsertFileDialog')
        );
      },
      remoteInsterSucces(videEl) {
        console.log(videEl, '点播初始化成功');
        const insertFileServer = useInsertFileServer();
        insertFileServer.setInsertVideoElement(videEl);
        this.pushLocalStream();
      },
      initEventListener() {
        const interactiveServer = useInteractiveServer();
        if (interactiveServer.state.remoteStreams[0]) {
          this.subscribeInster();
          this.addSDKEvents();
        }
        this.msgServer.$on('live_start', () => {
          this.closeInsertvideoHandler(true);
        });
        this.msgServer.$on('live_over', () => {
          this.insertFileStreamVisible && this.closeInsertvideoHandler();
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
        const insertFileServer = useInsertFileServer();
        insertFileServer
          .subscribeInsertStream(opt)
          .then(() => {
            const obj = JSON.parse(owner.attributes);
            obj.accountId = owner.accountId;
            this.subscribInsterStreamSucess = true;
          })
          .catch(e => {
            console.log('订阅失败', e);
          });
      },
      addSDKEvents() {
        const insertFileServer = useInsertFileServer();
        const interactiveServer = useInteractiveServer();
        const roomBaseServer = useRoomBaseServer();
        // 流加入
        insertFileServer.$on('INSERT_FILE_STREAM_ADD', e => {
          console.log('监听流加入55555555', e);
          // { e.type， 流类行 }
          // 0: 纯音频, 1: 只是视频, 2: 音视频  3: 屏幕共享, 4: 插播
          console.log('流加入-插播流,自己收不到自己的流', e);
          this.streamId = e.data.streamId;
          const opt = {
            streamId: e.data.streamId,
            videoNode: 'vmp-insert-subscribe-stream', // 远端流显示容器，必填
            mute: { audio: false, video: false } // 是否静音，关视频。选填 默认false
          };
          // 如果是主持人并且是视频插播，设置旁路
          if (
            roomBaseServer.watchInitData.join_info.role_name == 1 &&
            insertFileServer.state.insertStreamInfo.has_video
          ) {
            interactiveServer.resetLayout();
          }
          // this.$emit('addRemoteInterVideo', obj); // 其余订阅的人
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
        });

        // 插播流删除 流结束
        insertFileServer.$on('INSERT_FILE_STREAM_REMOVE', e => {
          console.log('EVENT_REMOTESTREAM_REMOVED插播流删除了', e);
          // 自己和其他人都能收到
          console.log('插播流删除，流id', e.data.streamId, this.streamId);
          if (e.data.streamId == this.streamId) {
            this.streamId = '';
            this.$refs.localStreamRef.innerHTML = '';
            this.subscribInsterStreamSucess = false;
            // EventBus.$emit('inster_mic_open');
            // this.$emit('pushStreamInsterRemove');
            // 如果是主持人并且是视频插播，设置旁路
            if (
              roomBaseServer.watchInitData.join_info.role_name == 1 &&
              insertFileServer.state.insertStreamInfo.has_video
            ) {
              interactiveServer.resetLayout();
            }
            clearInterval(this.resubscribeTimer);
          }
        });
        insertFileServer.$on('INSERT_FILE_STREAM_FAILED', e => {
          if (e.data.stream.getID() == this.streamId) {
            clearInterval(this.resubscribeTimer);
            this.resubscribeTimer = setInterval(() => {
              const opt = {
                streamId: this.streamId,
                videoNode: 'vmp-insert-subscribe-stream', // 远端流显示容器，必填
                mute: { audio: false, video: false } // 是否静音，关视频。选填 默认false
              };
              insertFileServer
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
      // 隐藏控制栏
      hideInsertVideoControl() {
        this.constrolUp = false;
      },
      // 初始化本地插播进度条的事件
      initSlider() {
        this.conctorObj.sliderVal = 0;
        const tol = (this.conctorObj.totalTime = this._localFileVideoElement.duration);
        this.conctorObj.currentTime = 0;
        this._localFileVideoElement.addEventListener('timeupdate', () => {
          const cur = (this.conctorObj.currentTime = this._localFileVideoElement.currentTime);
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
      // 本地插播设置video音量
      setVoice(val) {
        const vo = val / 100;
        if (this._localFileVideoElement) {
          if (val <= 0.01) {
            this._localFileVideoElement.volume = 0.01;
          } else {
            this._localFileVideoElement.volume = vo;
          }
        }
      },
      // 本地插播video开始\暂停
      videoPlayBtn() {
        const ispaused = this._localFileVideoElement.paused;
        if (ispaused) {
          this.play();
        } else {
          this.pause();
        }
      },
      // 大小窗切换
      exchange() {
        // 切换小屏幕
      },
      // video静音
      jingYin() {
        const vo = this._localFileVideoElement && this._localFileVideoElement.volume;
        if (vo) {
          if (vo > 0.01) {
            this._cacheVolume = vo;
            this._localFileVideoElement.volume = 0.01;
            this.voice = 1;
          } else {
            this._localFileVideoElement.volume = this._cacheVolume;
            this.voice = this._cacheVolume * 100;
          }
        }
      },
      // 设置video的currentTime
      setVideoCurrentTime() {
        // 快进功能
        const time = (this.conctorObj.sliderVal / 100) * this.conctorObj.totalTime;
        console.log(this.conctorObj.sliderVal, '快进');
        this._localFileVideoElement.currentTime = time;
        this.play();
      },
      // 本地插播video暂停
      pause() {
        this._localFileVideoElement && this._localFileVideoElement.pause();
      },
      // 本地插播video开始
      play() {
        this._localFileVideoElement && this._localFileVideoElement.play();
        this.conctorObj.statePlay = true;
      },
      // 全屏
      enterFullScreen() {
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
      // 取消全屏
      exitFullScreen() {
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
    .vmp-insert-remote-stream {
      position: absolute;
      height: 100%;
      width: 100%;
    }
    .vmp-insert-stream-video {
      position: absolute;
      height: 100%;
      width: 100%;
      left: 0px;
      top: 0px;
      background-color: #2d2d2d;
    }
    .vmp-insert-stream-audio-poster {
      width: 100%;
      height: 100%;
      object-fit: cover;
      position: absolute;
      left: 0;
      top: 0;
      z-index: 1;
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
