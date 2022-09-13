<template>
  <div
    class="vmp-insert-stream"
    @mouseenter="wrapHover"
    @mouseleave="wrapLeave"
    v-show="insertFileStreamVisible || !isWatch"
    ref="insertWrapRef"
    :class="{
      'vmp-insert-stream__h0': !insertFileStreamVisible,
      'vmp-insert-stream__mini': miniElement == 'insert-video',
      'vmp-insert-stream__is-watch': isWatch,
      'vmp-insert-stream__is-embed': isEmbed,
      'vmp-insert-stream__has-stream-list': hasStreamList,
      'vmp-insert-stream__is-watch-full-screen': isWatch && isFullScreen
    }"
  >
    <div class="vmp-insert-stream-mask">
      <p>
        <span v-show="!isWatch" class="vmp-insert-stream-mask__label">视图</span>
        <el-tooltip
          content="切换"
          placement="top"
          v-if="!isFullScreen && (!isWatch || (isWatch && docSwitchStatus))"
        >
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
      v-show="!isCurrentRoleInsert"
    ></div>

    <!-- 本地视频插播的video容器 -->
    <div
      id="vmp-insert-stream-video"
      class="vmp-insert-stream-video"
      v-show="insertFileType == 'local' && isCurrentRoleInsert"
      :style="{ height: isAudio ? '0px' : '100%' }"
    ></div>

    <!-- 音频插播封面图 -->
    <div
      v-if="isAudio && ((isLiving && isFullScreen) || !isLiving || mode == 1)"
      class="vmp-insert-stream-audio-poster"
    ></div>

    <!-- 远端视频插播的播放器容器 -->
    <div id="vmp-insert-remote-stream" class="vmp-insert-remote-stream">
      <video-preview
        ref="insertStream"
        :videoParam="remoteVideoParam"
        :isInsertVideoPreview="true"
        :isShowController="miniElement != 'insert-video'"
        @remoteInsertSuccess="remoteInsertSuccess"
        @openInsert="handleOpenInsertFileDialog"
        @handleRemoteInsertVideoPlay="handleRemoteInsertVideoPlay"
        @handleRemoteInsertVideoPause="handleRemoteInsertVideoPause"
        @closeInsertvideo="closeInsertvideo({ type: 'remote' })"
        v-if="insertFileType == 'remote' && isCurrentRoleInsert"
      ></video-preview>
    </div>

    <!-- 播放器控制条 -->
    <div
      v-show="insertFileType == 'local' && isCurrentRoleInsert && miniElement != 'insert-video'"
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
                @click="videoMute"
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
            <i @click="handleOpenInsertFileDialog" class="vh-iconfont vh-line-menu"></i>
          </el-tooltip>
          <el-tooltip effect="dark" content="关闭插播">
            <i
              @click="
                closeInsertvideo({
                  isShowConfirmDialog: true,
                  type: 'btn_close'
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
    <vmp-air-container
      v-if="childrenCom && childrenCom.length"
      :oneself="true"
      :cuid="childrenCom[0]"
    ></vmp-air-container>
  </div>
</template>
<script>
  import videoPreview from '@/app-shared/components/video-preview';
  import {
    useInsertFileServer,
    useRoomBaseServer,
    useInteractiveServer,
    useGroupServer,
    useMsgServer,
    useMicServer,
    useDocServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/app-shared/utils/tool.js';
  export default {
    name: 'VmpInsertStream',
    data() {
      return {
        childrenCom: [],
        insertFileStreamVisible: false, // 是否展示插播流组件
        // 云插播文件参数
        remoteVideoParam: {
          paas_record_id: '',
          file_type: '',
          autoplay: true
        },
        constrolUp: false, // 控制栏显示、隐藏
        // 控制栏信息
        conctorObj: {
          TimesShow: false,
          hoverTime: 0,
          hoverLeft: 0,
          totalTime: 1,
          currentTime: 0,
          sliderVal: 0,
          statePlay: false
        },
        // 本地插播音量
        voice: 100,
        // 本地插播全屏
        isFullScreen: false
      };
    },
    computed: {
      // 是否观看端
      isWatch() {
        return !['send', 'record', 'clientEmbed'].includes(
          this.$domainStore.state.roomBaseServer.clientType
        );
      },
      // 是否嵌入
      isEmbed() {
        return this.$domainStore.state.roomBaseServer.embedObj.embed;
      },
      docSwitchStatus() {
        return this.$domainStore.state.docServer.switchStatus;
      },
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
      },
      mode() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.mode;
      },
      isLiving() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1;
      },
      miniElement() {
        return this.$domainStore.state.roomBaseServer.miniElement;
      },
      // 互动是否初始化完成
      isInstanceInit() {
        return this.$domainStore.state.interactiveServer.isInstanceInit;
      },
      hasStreamList() {
        return this.$domainStore.state.interactiveServer.streamListHeightInWatch >= 1;
      },
      // 是否是上麦状态
      isSpeakOn() {
        return this.$domainStore.state.micServer.isSpeakOn;
      },
      // 观众是否加载了旁路播放器
      isPlayerInit() {
        const { interactiveServer, roomBaseServer, micServer } = this.$domainStore.state;
        return (
          (roomBaseServer.watchInitData.join_info.role_name == 2 &&
            roomBaseServer.watchInitData.webinar.mode == 3 &&
            roomBaseServer.watchInitData.webinar.no_delay_webinar != 1 &&
            (!micServer.isSpeakOn || !interactiveServer.isInstanceInit)) ||
          interactiveServer.initInteractiveFailed
        );
      },
      // 是否开启了桌面共享
      isShareScreen() {
        return this.$domainStore.state.desktopShareServer.localDesktopStreamId;
      },
      // 桌面共享人信息
      desktopShareInfo() {
        return this.$domainStore.state.desktopShareServer.desktopShareInfo;
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
            this.remoteVideoParam.file_type = value.file_type;
          }
        }
      },
      '$domainStore.state.insertFileServer.isInsertFilePushing': {
        handler() {
          this.insertFileStreamVisible =
            this.$domainStore.state.insertFileServer.isInsertFilePushing;
        }
      },
      // 主讲人切换，关闭插播
      '$domainStore.state.roomBaseServer.interactToolStatus.doc_permission': {
        handler() {
          if (
            this.isCurrentRoleInsert &&
            this.$domainStore.state.roomBaseServer.watchInitData.join_info.role_name != 3
          ) {
            this.closeInsertvideoHandler();
          }
        }
      },
      insertFileStreamVisible(val, oldVal) {
        if (oldVal && !val && this.isFullScreen) {
          this.autpExitFullscreen();
        }
      },
      isInstanceInit(val, oldVal) {
        if (oldVal && !val && this.isFullScreen) {
          this.autpExitFullscreen();
        }
      }
    },
    components: { videoPreview },
    beforeCreate() {
      this.interactiveServer = useInteractiveServer();
      this.msgServer = useMsgServer();
      this.roomBaseServer = useRoomBaseServer();
      this.insertFileServer = useInsertFileServer();
      this.docServer = useDocServer();
    },
    created() {
      this.childrenCom = window.$serverConfig[this.cuid].children;
    },
    mounted() {
      this.initEventListener();
    },
    methods: {
      // 自动退出全屏
      autpExitFullscreen() {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
      },
      // 开始插播的入口
      async startInertFile() {
        const { watchInitData } = useRoomBaseServer().state;
        // 展示插播流组件
        this.insertFileStreamVisible = true;
        // 设置插播状态为 true
        this.insertFileServer.setInsertFilePushing(true);
        this.insertFileServer.state.insertStreamInfo.userInfo = {
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
          window.vhallReportForProduct?.toReport(110199, { report_extra: { file_info: '' } });
          this.initRemoteInsertFile();
        }
      },
      // 检测当前用户是否可以插播
      checkInsertFileProcess() {
        const { watchInitData } = useRoomBaseServer().state;
        const { isInsertFilePushing, insertStreamInfo } = this.insertFileServer.state;
        console.log('---点击插播文件-确定按钮----', insertStreamInfo);

        // 如果是直播状态需要判断当前主持人是否是用网页发起直播
        // 嘉宾：设为主讲人的时候 可以插播
        // 助理： 如果是网页发起，一直都有插播。如果是客户端发起，不支持插播文件，存在提示
        if (
          watchInitData.switch.start_type != 1 &&
          watchInitData.webinar.type == 1 &&
          watchInitData.join_info.role_name == 3
        ) {
          this.$alert('仅发起端为PC网页时支持使用插播文件功能', '', {
            title: '提示',
            confirmButtonText: '知道了',
            // center: true,
            customClass: 'zdy-message-box',
            cancelButtonClass: 'zdy-confirm-cancel'
          });
          return false;
        }
        // 如果在插播中，并且不是当前用户插播，alert提示
        if (
          isInsertFilePushing &&
          insertStreamInfo.userInfo.accountId != watchInitData.join_info.third_party_user_id
        ) {
          this.$alert(
            `${this.$getRoleName(insertStreamInfo.userInfo.role)}${
              insertStreamInfo.userInfo.role != 1 ? insertStreamInfo.userInfo.nickname : ''
            }正在插播文件，请稍后重试`,
            '',
            {
              title: '提示',
              confirmButtonText: '确定',
              customClass: 'zdy-message-box',
              cancelButtonClass: 'zdy-confirm-cancel'
            }
          );
          return false;
        }
        // 判断该当前浏览器是否支持插播
        if (!this.insertFileServer.isCanUseCaptureStream()) {
          this.$alert(
            '当前浏览器版本不支持插播文件。<br>建议您下载chrome72及以上版本后使用<br>下载<a href="https://www.google.cn/chrome/" target="_blank" style="color: #3562fa">Chrome浏览器</a>',
            '',
            {
              title: '提示',
              confirmButtonText: '知道了',
              customClass: 'zdy-message-box',
              cancelButtonClass: 'zdy-confirm-cancel',
              dangerouslyUseHTMLString: true,
              callback: () => {}
            }
          );
          return false;
        }
        return true;
      },
      // 插播文件更改
      async inertFileChange(video, type) {
        const { watchInitData } = useRoomBaseServer().state;
        // 他人正在演示插播，当前不可操作；有人正在桌面共享，当前不可插播
        if (!this.checkInsertFileProcess() || this.isShareScreen || watchInitData.rebroadcast?.id) {
          if (this.isShareScreen && this.desktopShareInfo) {
            // 当前有桌面共享，并且桌面共享演示人信息能获取的时候
            this.$alert(
              `${this.$getRoleName(this.desktopShareInfo.role)}${
                this.desktopShareInfo.role != 1 ? this.desktopShareInfo.nickname : ''
              }正在进行桌面共享，请稍后重试`,
              '',
              {
                title: '提示',
                confirmButtonText: '确定',
                customClass: 'zdy-message-box',
                cancelButtonClass: 'zdy-confirm-cancel'
              }
            );
          }
          if (watchInitData.rebroadcast?.id) {
            this.$message.warning('正在转播,请稍后重试');
          }
          // 当前不可演示插播, 关闭插播列表弹窗
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitCloseInsertFileDialog')
          );
          return;
        }
        // 如果当前正在插播中，需要先结束现有插播
        if (this.insertFileServer.state.isInsertFilePushing) {
          await this.closeInsertvideoHandler();
        }
        // 更新选择插播的文件
        this.insertFileServer.setInsertFileType(type);
        if (type == 'local') {
          this.insertFileServer.setLocalInsertFile(video);
        } else {
          this.insertFileServer.setRemoteInsertFile(video);
        }
        this.startInertFile();
      },
      // 初始化本地插播,创建video标签播放本地文件
      async initLocalInsertFile() {
        this._videoEnded = false; // 本地插播文件是否播放结束
        this._isFirstInsertSucces = true; // 记录开始本地插播的状态，video play事件会用到
        if (this.insertFileServer.state.insertStreamInfo.streamId) {
          await this.stopPushStream();
        }
        // 创建video标签播放本地音视频文件
        this.insertFileServer
          .createLocalVideoElement(this.insertFileServer.currentLocalInsertFile, {
            el: 'vmp-insert-stream-video'
          })
          .then(videoElement => {
            // video创建成功，初始化
            this.handleLocalInsertVideoCreated(videoElement);
          })
          .catch(err => {
            console.log('初始化本地插播播放器失败', err);
            this.$message.warning('视频分辨率过高，请打开分辨率为1280*720以下的视频');
            // 关闭插播，传 ture 不需要更改麦克风状态
            this.closeInsertvideoHandler(true);
          });
      },
      // 本地插播，video成功创建之后的处理逻辑
      handleLocalInsertVideoCreated(videoElement) {
        // 设置插播画面在大窗,文档在小窗
        this.roomBaseServer.setChangeElement('doc');
        // 隐藏分组设置
        const groupServer = useGroupServer();
        groupServer.state.panelShow = false;
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
        window.vhallReportForProduct?.toReport(110218);
        this.pushLocalStream(); // 推流
      },
      // 创建本地插播流
      createLocalStream() {
        return new Promise((resolve, reject) => {
          this.insertFileServer
            .createLocalInsertStream({
              videoNode: 'vmp-insert-local-stream',
              videoContentHint: sessionStorage.getItem('videoHint') || 'detail'
            })
            .then(e => {
              console.log('创建插播本地流成功');
              resolve(e);
              // 并开始推送互动流
            })
            .catch(() => {
              console.log('创建插播本地流失败');
              this.closeInsertvideo({
                isShowConfirmDialog: false,
                type: 'created_field'
              });
              reject(new Error('创建插播本地流失败'));
              this.$message.warning('插播创建失败，请重新选择');
            });
        });
      },
      // 推流
      async pushLocalStream() {
        const interactiveServer = useInteractiveServer();
        const { watchInitData } = useRoomBaseServer().state;
        // 如果未开播，不推流
        if (watchInitData.webinar.type != 1) return;

        const res = await this.createLocalStream();
        this.insertFileServer
          .publishInsertStream({ streamId: res.streamId })
          .then(() => {
            // 更改麦克风状态
            this.insertFileServer.updateMicMuteStatusByInsert({ isStart: true });
            interactiveServer.resetLayout();
            // 设置旁路观看端大小屏
            this.setDesktop('1');
          })
          .catch(() => {
            this.$message.warning('插播推送失败，请重新选择');
          });
      },
      // 云插播播放器开始播放
      handleRemoteInsertVideoPlay(isVideoEnd) {
        if (isVideoEnd) {
          // 如果是结束播放，重新开始播放，需要重新推流
          this.stopPushStream({ isNotClearInsertFileInfo: true }).then(() => {
            this.pushLocalStream();
          });
        } else {
          // 如果是播放结束重新开始播放，对端会通过流加入时间更改上麦人员麦克风状态，不需要发消息
          // 发送自定义消息，通知开始插播，互动角色关闭麦克风
          this.insertFileServer.sendStateChangeMessage(1);
        }
      },
      // 云插播播放器暂停播放
      handleRemoteInsertVideoPause() {
        // 发送自定义消息，通知插播暂停，互动角色开启麦克风
        this.insertFileServer.sendStateChangeMessage(0);
      },
      // 添加播放器video事件
      InitVideoEvent() {
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
            // 播放结束之后的重新播放，观看端根据流加入事件静音麦克风，不需要发消息，所以置为 true
            this._isFirstInsertSucces = true;
            this.stopPushStream({ isNotClearInsertFileInfo: true }).then(() => {
              this.pushLocalStream();
            });
          }
          // 发送自定义消息，通知开始插播，互动角色关闭麦克风
          // 如果是插播由 暂停 ——> 开始，才需要发自定义消息
          if (this._isFirstInsertSucces) {
            this._isFirstInsertSucces = false;
            return;
          }
          this.insertFileServer.sendStateChangeMessage(1);
        });
        // 本地插播播放器暂停事件
        this._localFileVideoElement.addEventListener('pause', () => {
          console.log('暂停了啊');
          this.conctorObj.statePlay = false;
          // 如果不是关闭触发的暂停，发送自定义消息，通知插播暂停，互动角色开启麦克风
          if (!this._isCloseInsertvideoHandler) {
            this.insertFileServer.sendStateChangeMessage(0);
            return;
          }
          this._isCloseInsertvideoHandler = false;
        });
      },
      // 打开插播列表dialog
      handleOpenInsertFileDialog() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitOpenInsertFileDialog'));
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
        window.vhallReportForProduct?.toStartReporting(110203, [110206, 110209, 110207], {
          evt_tp: options.type,
          file_info: ''
        });
        console.log('----关闭插播----', options.isShowConfirmDialog, options.type);
        // 如果不需要展示确认关闭按钮
        if (!options.isShowConfirmDialog) {
          await this.closeInsertvideoHandler();
          return;
        }
        // 关闭插播的时候如果处于全屏状态，退出全屏
        if (this.isFullScreen) {
          this.exitFullScreen();
        }
        window.vhallReportForProduct?.toResultsReporting(110206, {
          event_type: 'static',
          file_info: ''
        });
        this.$confirm('确认关闭插播文件，并退出插播页面吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          customClass: 'zdy-message-box',
          cancelButtonClass: 'zdy-confirm-cancel'
        })
          .then(() => {
            window.vhallReportForProduct?.toResultsReporting(110209, {
              event_type: 'static',
              file_info: ''
            });
            // 关闭插播列表弹窗
            window.$middleEventSdk?.event?.send(
              boxEventOpitons(this.cuid, 'emitCloseInsertFileDialog')
            );
            this.closeInsertvideoHandler();
          })
          .catch(() => {
            window.vhallReportForProduct?.toResultsReporting(110207, {
              event_type: 'static',
              file_info: ''
            });
          });
      },
      // 关闭插播，还原插播状态 isliveStart 是否是开始直播调用的关闭插播的方法
      // 如果是开始直播触发的关闭插播,不需要更改对端的麦克风状态
      closeInsertvideoHandler(isliveStart) {
        const interactiveServer = useInteractiveServer();
        if (this.conctorObj.statePlay) {
          // 如果不是暂停状态，关闭插播时会触发暂停事件，记录这个状态，暂停事件不需要发自定义消息
          this._isCloseInsertvideoHandler = true;
        }
        // 设置插播状态为 false
        // this.insertFileServer.setInsertFilePushing(false);
        window.vhallReportForProduct.toStartReporting(110210, 110211);
        return this.stopPushStream().then(res => {
          window.vhallReportForProduct.toResultsReporting(110211, {
            request_id: res?.request_id,
            event_type: 'interface',
            res: res
          });
          console.log('---插播流停止成功----');
          interactiveServer.resetLayout();
          // 还原插播状态
          this.insertFileServer.clearInsertFileInfo();
          // 设置流为小屏
          this.roomBaseServer.setChangeElement('stream-list');
          document.getElementById('vmp-insert-stream-video').innerHTML = '';
          // 云插播播放器销毁
          this.$refs.insertStream && this.$refs.insertStream.destroy();
          // 本地插播播放器销毁
          this.$refs.localStreamRef.innerHTML = '';
          // 云插播播放器容器销毁
          this.insertFileServer.setInsertFileType('');
          // 插播隐藏
          this.insertFileStreamVisible = false;
          if (isliveStart) return;
          // 更改麦克风状态
          this.insertFileServer.updateMicMuteStatusByInsert({ isStart: false });
          // 设置旁路观看端大小屏
          this.setDesktop('0');
        });
      },
      // 销毁插播流
      stopPushStream(options = { isNotClearInsertFileInfo: false }) {
        if (!this.insertFileServer.state.insertStreamInfo.streamId) {
          return Promise.resolve();
        }
        // 停止推流
        return this.insertFileServer
          .stopPublishInsertStream(this.insertFileServer.state.insertStreamInfo.streamId, {
            isNotClearInsertFileInfo: options.isNotClearInsertFileInfo
          })
          .catch(e => {
            console.log('销毁本地插播流失败', e);
            return e;
          });
      },
      // 初始化云插播
      async initRemoteInsertFile() {
        if (this.insertFileServer.state.insertStreamInfo.streamId) {
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
      remoteInsertSuccess(videEl) {
        console.log(videEl, '点播初始化成功');
        // 隐藏分组设置
        const groupServer = useGroupServer();
        groupServer.state.panelShow = false;

        this.insertFileServer.setInsertVideoElement(videEl);
        // 设置插播画面在大窗,文档在小窗
        this.roomBaseServer.setChangeElement('doc');
        this.pushLocalStream();
      },
      // 注册事件监听
      initEventListener() {
        const groupServer = useGroupServer();
        if (this.insertFileServer.state.insertStreamInfo.streamId) {
          this.subscribeInsert();
        }

        // this.insertFileServer.$on('insert_mic_mute_change', status => {
        //   if (status == 'play') {
        //     this.$message.warning(this.$t('interact.interact_1026'));
        //   } else {
        //     this.$message.warning('麦克风开启，对方将听到您的声音');
        //   }
        // });

        this.addSDKEvents();
        // 注册发起端独有的事件
        if (this.roomBaseServer.state.watchInitData.join_info.role_name != 2) {
          const micServer = useMicServer();
          this.interactiveServer.$on('live_start', () => {
            this.closeInsertvideoHandler(true);
          });
          this.interactiveServer.$on('live_over', () => {
            this.insertFileStreamVisible && this.closeInsertvideoHandler();
          });
          // 有人开始演示，需要关闭插播
          groupServer.$on(groupServer.EVENT_TYPE.VRTC_CONNECT_PRESENTATION_SUCCESS, () => {
            if (this.isCurrentRoleInsert) {
              this.closeInsertvideoHandler();
            }
          });
          // 进入小组，需要关闭插播
          groupServer.$on(groupServer.EVENT_TYPE.ENTER_GROUP_FROM_MAIN, () => {
            if (this.isCurrentRoleInsert) {
              this.closeInsertvideoHandler();
            }
          });
          // 如果是拥有主讲人权限的嘉宾下麦，需要直接设置miniElement
          micServer.$on('vrtc_disconnect_success', () => {
            if (
              this.roomBaseServer.state.interactToolStatus.doc_permission ==
                this.roomBaseServer.state.watchInitData.join_info.third_party_user_id &&
              this.isCurrentRoleInsert
            ) {
              this.roomBaseServer.setChangeElement('stream-list');
            }
          });
        }

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
      // 订阅插播流
      subscribeInsert() {
        //观众加载旁路播放器的情况下，不走订阅插播流
        if (this.isPlayerInit) return;
        const opt = {
          videoNode: 'vmp-insert-subscribe-stream', // 远端流显示容器，必填
          mute: { audio: false, video: false } // 是否静音，关视频。选填 默认false
        };
        try {
          this.insertFileServer.subscribeInsertStream(opt).then(() => {
            // 展示插播流组件
            this.insertFileStreamVisible = true;
            // 如果不是观众(主持人\助理\嘉宾)
            if (this.roomBaseServer.state.watchInitData.join_info.role_name != 2) {
              // 设置 miniElement 为 doc
              this.roomBaseServer.setChangeElement('doc');
            } else {
              // 如果是观众
              // 如果文档可见
              if (this.docServer.state.switchStatus) {
                // 设置 miniElement 为主屏流
                this.roomBaseServer.setChangeElement('doc');
              } else {
                this.roomBaseServer.setChangeElement('');
              }
            }
          });
        } catch (error) {
          console.log('error', error);
        }
      },
      // 取消订阅插播流
      unsubscribeInsert() {
        // 观众加载旁路播放器的情况下，不走取消订阅插播流
        if (this.isPlayerInit) return;
        // 隐藏插播流组件
        this.insertFileStreamVisible = false;
        // 如果不是观众(主持人\助理\嘉宾)
        if (this.roomBaseServer.state.watchInitData.join_info.role_name != 2) {
          // 设置 miniElement 为 stream-list
          this.roomBaseServer.setChangeElement('stream-list');
        } else {
          // 如果是观众
          // 设置 miniElement 为主屏流
          if (this.docServer.state.switchStatus) {
            this.roomBaseServer.setChangeElement('stream-list');
          } else {
            this.roomBaseServer.setChangeElement('');
          }
        }
        this.insertFileServer.clearInsertFileInfo();
      },
      // 添加互动sdk事件
      addSDKEvents() {
        // 流加入
        this.insertFileServer.$on('INSERT_FILE_STREAM_ADD', () => {
          this.reSetBroadcast();
          this.subscribeInsert();
        });

        // 插播流删除
        this.insertFileServer.$on('INSERT_FILE_STREAM_REMOVE', () => {
          this.unsubscribeInsert();
          this.reSetBroadcast();
        });

        // 订阅失败
        this.insertFileServer.$on('INSERT_FILE_STREAM_FAILED', () => {
          this.reSetBroadcast();
          this.subscribeInsert();
        });
      },
      // 设置旁路
      reSetBroadcast() {
        // 如果是主持人并且是视频插播，设置旁路
        if (
          this.roomBaseServer.state.watchInitData.join_info.role_name == 1 &&
          this.insertFileServer.state.insertStreamInfo.has_video
        ) {
          this.interactiveServer.resetLayout();
        }
      },
      // 鼠标移出隐藏播放器控制栏
      wrapLeave() {
        console.log('----wrapLeave-=----');
        this._timers = setTimeout(() => {
          console.log('----wrapLeave-setTimeout=----');
          this.constrolUp = false;
          clearTimeout(this._timers);
          this.$refs.insertStream && this.$refs.insertStream.wrapLeave();
        }, 3000);
      },
      // 鼠标移入显示播放器控制栏
      wrapHover() {
        console.log('----wrapHover-=----');
        clearTimeout(this._timers);
        this.constrolUp = true;
        this.$refs.insertStream && this.$refs.insertStream.wrapEnter();
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
          this._handleDocumentMouseMove = () => {
            console.log('----insertfile----this----', this);
            this.conctorObj.TimesShow = true;
          };
          this._handleDocumentMouseUp = () => {
            console.log('----insertfile----this----', this);
            document.removeEventListener('mousemove', this._handleDocumentMouseMove);
            document.removeEventListener('mouseup', this._handleDocumentMouseUp);
            this.onmousedownControl = false;
            this.conctorObj.TimesShow = false;
            innitDom();
          };
          document.addEventListener('mousemove', this._handleDocumentMouseMove);
          // eslint-disable-next-line no-unused-vars
          document.addEventListener('mouseup', this._handleDocumentMouseUp);
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
        window.vhallReportForProduct.toReport(110212, {
          report_extra: {
            type: 'localInsert',
            file_info: '',
            pre_status: ispaused ? 'pause' : 'playing',
            after_atatus: ispaused ? 'playing' : 'pause'
          }
        });
      },
      // 大小窗切换
      exchange() {
        if (this.isWatch) {
          const miniElement = this.miniElement == 'insert-video' ? 'doc' : 'insert-video';
          this.roomBaseServer.setChangeElement(miniElement);
        } else {
          const miniElement = this.miniElement == 'insert-video' ? 'doc' : 'insert-video';
          this.roomBaseServer.setChangeElement(miniElement);
        }
        window.vhallReportForProduct?.report(110135);
      },
      // video静音
      videoMute() {
        const vo = this._localFileVideoElement && this._localFileVideoElement.volume;
        if (vo) {
          if (vo > 0.01) {
            this._cacheVolume = vo;
            this._localFileVideoElement.volume = 0;
            this.voice = 0;
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
        window.vhallReportForProduct?.toStartReporting(110213, 110213, {
          currentTime: time
        });
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
        const fullarea = this.$refs.insertWrapRef;
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
      },
      // 开始插播开启并且白板或者文档观众可见状态时观看端视频最大化
      setDesktop(status) {
        if (useDocServer().state.switchStatus) {
          this.interactiveServer.setDesktop({ status });
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
    &__h0 {
      height: 0;
      overflow: hidden;
    }
    &__mini {
      width: 309px;
      height: 240px;
      top: 0;
      right: 0;
      z-index: 10;
      position: absolute;
      overflow: hidden;
    }
    &__is-watch {
      position: absolute;
      top: 0;
      bottom: 56px;
      width: calc(100% - 380px);
      height: auto;
      min-height: auto;
      &.vmp-insert-stream__mini {
        width: 360px;
        height: 204px;
        min-height: 204px;
        top: 0 !important;
        right: 0;
        z-index: 11;
        overflow: hidden;
      }
    }
    &__is-embed {
      width: calc(100% - 360px);
    }
    &__has-stream-list {
      top: 80px;
    }
    &__is-watch-full-screen {
      .vmp-insert-stream-mask {
        height: 25px;
        bottom: 16px;
        top: auto;
        opacity: 1;
        background: none;
      }
      .vmp-insert-stream-mask__label {
        display: none;
      }
    }
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
      background-image: url(./img/video.gif);
      background-repeat: no-repeat;
      background-size: contain;
      background-position: center;
      position: absolute;
      left: 0;
      top: 0;
      z-index: 1;
    }
    .vmp-insert-subscribe-stream {
      width: 100%;
      height: 100%;
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
          background: #fb3a32;
        }
        &.iconsheweizhujiangren {
          font-size: 14px;
        }
      }
    }
    &-controller {
      position: absolute;
      bottom: -31px;
      z-index: 6;
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
</style>
