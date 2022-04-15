<template>
  <div class="vmp-header-right">
    <section class="vmp-header-right_btn-box">
      <record-control v-if="configList['cut_record'] && !isInGroup"></record-control>
      <!-- 主持人显示开始结束直播按钮 -->
      <template v-if="deviceStatus == 2">
        <div class="vmp-header-right_btn" @click="handleRecheck">重新检测</div>
      </template>
      <template v-else-if="roleName == 1 && !isInGroup">
        <div v-if="liveStep == 1" class="vmp-header-right_btn" @click="handleStartClick">
          {{ isRecord ? '开始录制' : '开始直播' }}
        </div>
        <div v-if="liveStep == 2" class="vmp-header-right_btn">正在启动...</div>
        <div
          v-if="liveStep == 3 && configList['ui.hide_live_end']"
          class="vmp-header-right_btn vmp-header-right_duration"
          @click="handleEndClick"
        >
          <span class="vmp-header-right_duration-text">{{ formatDuration }}</span>
          <span class="vmp-header-right_duration-end">
            {{ isRecord ? '结束录制' : '结束直播' }}
          </span>
        </div>
        <div v-if="liveStep == 4" class="vmp-header-right_btn">正在结束...</div>
      </template>
      <!-- 嘉宾显示申请上麦按钮 -->
      <template v-if="roleName == 4 && isLiving && !isInGroup">
        <!-- 申请上麦按钮 -->
        <div
          v-if="!isApplying && !isSpeakOn"
          class="vmp-header-right_btn"
          @click="handleApplyClick"
        >
          申请上麦
        </div>
        <!-- 等待应答按钮 -->
        <div v-if="isApplying" class="vmp-header-right_btn" @click="handleApplyCancleClick">
          等待应答{{ applyTime }}s
        </div>
        <!-- 下麦按钮 -->
        <div v-if="isSpeakOn" class="vmp-header-right_btn" @click="handleSpeakOffClick">下麦</div>
      </template>
      <div class="vmp-header-right_control">
        <headerControl
          @openVirtualProple="openVirtualProple"
          @openMediaSettings="openMediaSettings"
          @thirdPushStream="thirdPushStream"
        ></headerControl>
      </div>
      <div class="vmp-header-right_full" @click="fullScreen('body')">
        <i :class="`vh-iconfont ${isFullscreen ? 'vh-line-narrow' : 'vh-line-amplification'}`"></i>
      </div>
    </section>
    <!-- 是否生成回放的弹窗 -->
    <saas-alert
      :visible="popAlert.visible"
      :confirm="popAlert.confirm"
      :knowText="'知道了'"
      :confirmText="'确定'"
      :cancelText="'取消'"
      @onSubmit="handleSetDefaultRecord"
      @onClose="closeConfirm"
      @onCancel="closeConfirm"
    >
      <main slot="content">{{ popAlert.text }}</main>
    </saas-alert>
    <!-- 非默认回放暂存时间提示 -->
    <saas-alert
      :visible="noDefaultPopAlert.visible"
      :knowText="'知道了'"
      @onClose="noDefaultPopClose"
      @onCancel="noDefaultPopClose"
    >
      <main slot="content">
        <span v-html="noDefaultPopAlert.text"></span>
      </main>
    </saas-alert>
  </div>
</template>

<script>
  import headerControl from './components/header-control.vue';
  import RecordControl from './components/record-control.vue';
  import {
    useRoomBaseServer,
    useMicServer,
    useInteractiveServer,
    useSubscribeServer,
    useSplitScreenServer,
    useMediaCheckServer
  } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  import SaasAlert from '@/packages/pc-alert/src/alert.vue';
  export default {
    name: 'VmpHeaderRight',
    data() {
      return {
        liveStep: 1, // 1未开始 2启动中 3直播中 4结束中
        liveDuration: '',
        isApplying: false, // 是否正在等待应答
        applyTime: 30,
        isFullscreen: false,
        assistantType: this.$route.query.assistantType,
        popAlert: {
          // 设为默认回放的弹窗
          text: '',
          visible: false,
          confirm: true
        },
        noDefaultPopAlert: {
          // 非默认回放暂存时间提示
          text: '',
          visible: false
        },
        deviceStatus: useMediaCheckServer().state.deviceInfo?.device_status
      };
    },
    computed: {
      formatDuration() {
        const temp = this.liveDuration * 1000;
        const hours = this.$moment.duration(temp).hours();
        const minutes = this.$moment.duration(temp).minutes();
        const seconds = this.$moment.duration(temp).seconds();
        return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}:${
          seconds < 10 ? '0' + seconds : seconds
        }`;
      },
      // 是否是录制
      isRecord() {
        return this.$domainStore.state.roomBaseServer.clientType == 'record';
      },
      configList() {
        return this.$domainStore.state.roomBaseServer.configList;
      },
      roleName() {
        return this.$domainStore.state.roomBaseServer.watchInitData.join_info.role_name;
      },
      isSpeakOn() {
        return useMicServer().getSpeakerStatus();
      },
      isLiving() {
        return this.$domainStore.state.roomBaseServer.watchInitData.webinar.type == 1;
      },
      isInGroup() {
        // 在小组中
        return this.$domainStore.state.groupServer.groupInitData?.isInGroup;
      }
    },
    components: {
      headerControl,
      SaasAlert,
      RecordControl
    },
    created() {
      this.roomBaseServer = useRoomBaseServer();
      this.interactiveServer = useInteractiveServer();
      this.splitScreenServer = useSplitScreenServer();
      this.initConfig();
      this.listenEvents();
    },
    mounted() {
      if (this.deviceStatus == 2) {
        this.$message.error('发起直播前，请先允许访问摄像头和麦克风');
      }
      const { watchInitData } = this.roomBaseServer.state;
      if (watchInitData.webinar.type == 1) {
        this.liveDuration = watchInitData.webinar.live_time;
        this.calculateLiveDuration();
        if (!useMicServer().getSpeakerStatus()) {
          this.liveStep = 3;
        } else {
          this.liveStep = 2;
        }
        // 如果开启了分屏
        if (this.splitScreenServer.state.isOpenSplitScreen) {
          this.handlePublishComplate();
        }
      }
    },
    methods: {
      // 嘉宾点击申请上麦
      handleApplyClick() {
        window.vhallReportForProduct?.report(110131);
        useMicServer()
          .userApply()
          .then(res => {
            if (+res.code !== 200) {
              this.$message.error(res.msg);
              return;
            }
            this.isApplying = true;
            this.applyTime = 30;
            this._applyInterval = setInterval(async () => {
              this.applyTime = this.applyTime - 1;
              if (this.applyTime == 0) {
                this.$message.warning({ message: '主持人拒绝了您的上麦请求' });
                clearInterval(this._applyInterval);
                this.isApplying = false;
                const { code, msg } = await useMicServer().speakOff();
                if (code === 513035) {
                  this.$message.error(msg);
                }
              }
            }, 1000);
          });
      },
      // 嘉宾取消申请
      handleApplyCancleClick() {
        window.vhallReportForProduct?.report(110146);
        useMicServer()
          .userCancelApply()
          .then(() => {
            this.isApplying = false;
            this.applyTime = 30;
            clearInterval(this._applyInterval);
          });
      },
      // 嘉宾下麦
      async handleSpeakOffClick() {
        window.vhallReportForProduct?.report(110132);
        // 下麦接口停止推流，成功之后执行下面的逻辑
        const { code, msg } = await useMicServer().speakOff();
        if (parseInt(this.roleName) !== 4) {
          if (code !== 200) {
            this.$message.error(msg);
          }
        }
        this.isApplying = false;
        this.applyTimerCount = 30;
      },

      /**
       * 描述 重新检测当前设备
       *      1、提示麦克风设备不可用
       *      2、检测麦克风设备
       *          可用 则本地修改deviceStatus值
       *               检测是否在直播中，若在直播中，则liveStep = 3
       * @date 2022-03-24
       * @returns {any}
       */
      async handleRecheck() {
        await useMediaCheckServer().getMediaInputPermission({ isNeedBroadcast: false });
        if (useMediaCheckServer().state.deviceInfo?.device_status == 1) {
          this.deviceStatus = 1;
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'emitClickCheckStartPush')
          );
          if (this.isLiving) {
            this.liveStep = 3;
          } else {
            this.liveStep = 1;
          }
        } else {
          this.$message.error('发起直播前，请先允许访问摄像头和麦克风');
        }
      },
      listenEvents() {
        // 全屏事件
        const setFullscreen = () => {
          const fullscreenElement =
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullscreenElement ||
            document.msFullscreenElement;
          if (
            fullscreenElement &&
            fullscreenElement.className &&
            fullscreenElement.className.indexOf('vmp-basic-container') != -1
          ) {
            this.isFullscreen = true;
          } else {
            this.isFullscreen = false;
          }
        };
        window.addEventListener('fullscreenchange', setFullscreen);
        window.addEventListener('webkitfullscreenchange', setFullscreen);
        window.addEventListener('mozfullscreenchange', setFullscreen);
        window.addEventListener('msfullscreenchange', setFullscreen);
        window.addEventListener('MSFullscreenChange', setFullscreen);

        // 嘉宾上麦成功相关处理
        if (this.roleName == 4) {
          useMicServer().$on('vrtc_connect_success', async msg => {
            if (
              msg.data.room_join_id ==
              this.roomBaseServer.state.watchInitData?.join_info?.third_party_user_id
            ) {
              this.isApplying = false;
              clearInterval(this._applyInterval);
            }
          });

          // 开始直播显示申请上麦
          useSubscribeServer().$on('live_start', () => {
            this.liveStep = 2;
          });

          // live_over 结束直播
          this.interactiveServer.$on('live_over', () => {
            this.liveStep = 1;
          });
        }
      },
      initConfig() {
        const widget = window.$serverConfig?.[this.cuid];
        if (widget && widget.options) {
          Object.assign(this.$data, widget.options);
        }
      },
      // 打开媒体设置弹窗
      openMediaSettings() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitMediaSettingClick'));
      },
      // 打开虚拟人数的弹窗
      openVirtualProple() {
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitVirtualClick'));
      },
      // 第三方推流和网页
      thirdPushStream(flag) {
        window.$middleEventSdk?.event?.send(
          boxEventOpitons(this.cuid, 'emitClickThirdStream', [{ status: flag }])
        );
      },
      // 推流成功事件
      async handlePublishComplate() {
        const { watchInitData } = this.roomBaseServer.state;
        // 如果是录制页面
        if (this.isRecord) {
          const res = await this.postStartRecord();
          if (res.code == 200) {
            this.liveStep = 3;
            this.calculateLiveDuration();
          }
          return;
        }
        // 如果是发起端页面
        if (watchInitData.webinar.type != 1) {
          const res = await this.postStartLive();
          // 开始直播成功
          if (res.code == 200) {
            this.liveStep = 3;
            this.calculateLiveDuration();
          }
        } else {
          this.liveStep = 3;
        }
      },
      // 停止本地推流事件
      handleUnpublishComplate() {
        if (this.isRecord) {
          // 如果是回放录制页面
          this.handleSaveVodInRecord();
        } else {
          // 如果是直播页面
          this.handleSaveVodInLive();
        }
        this.liveStep = 1;
      },
      // 调开始录制接口
      postStartRecord() {
        console.log('调开始录制接口');
        return this.roomBaseServer.startRecord({
          webinar_id: this.roomBaseServer.state.watchInitData.webinar.id,
          user_id: this.roomBaseServer.state.watchInitData.join_info.third_party_user_id
        });
      },
      // 调开始直播接口
      postStartLive() {
        return this.roomBaseServer.startLive({
          webinar_id: this.roomBaseServer.state.watchInitData.webinar.id,
          start_type: this.roomBaseServer.state.interactToolStatus.start_type
        });
      },
      // 开始直播/录制事件
      handleStartClick() {
        this.liveStep = 2;
        // 派发推流事件
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickStartLive'));
      },
      // 结束直播/录制
      handleEndClick() {
        if (this.splitScreenServer.state.isHostWaitingSplit) {
          return this.$message.warning('请分屏关闭完成以后结束直播');
        }
        if (this.isRecord) {
          this.handleEndClickInRecord();
        } else {
          this.handleEndClickInLive();
        }
      },
      // 直播页 点击结束直播
      async handleEndClickInLive() {
        const { watchInitData, interactToolStatus } = this.roomBaseServer.state;

        this.liveStep = 4;
        const res = await this.roomBaseServer.endLive({
          webinar_id: watchInitData.webinar.id,
          end_type: interactToolStatus.start_type
        });
        // 如果开启了分屏
        if (this.splitScreenServer.state.isOpenSplitScreen) {
          this.splitScreenServer.state.isOpenSplitScreen = false;
          return;
        }

        if (res.code == 200 && interactToolStatus.start_type == 4) {
          // 如果是第三方推流直接生成回放
          this.handleSaveVodInLive();
          this.liveStep = 1;
        } else {
          // 如果不是第三方推流,派发结束直播事件,停止推流
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickEndLive'));
        }
      },
      // 录制页 点击结束录制
      async handleEndClickInRecord() {
        const { watchInitData } = this.roomBaseServer.state;
        const res = await this.roomBaseServer.endRecord({
          webinar_id: watchInitData.webinar.id,
          user_id: watchInitData.join_info.third_party_user_id
        });
        if (res.code == 200) {
          this._recordId = res.data.sid; // 场次id
          // 派发事件，结束推流
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickEndLive'));
        }
      },
      // 录制 生成回放
      async handleSaveVodInRecord() {
        if (this.liveDuration < 30) {
          this.liveDuration = 0;
          this.popAlert.text = `录制时长过短，不支持生成回放`;
          this.popAlert.visible = true;
          this.popAlert.confirm = false;
        } else {
          this.liveDuration = 0;
          // 如果是录制结束,并且录制时长大于30秒,展示录制结束组件
          window.$middleEventSdk?.event?.send(
            boxEventOpitons(this.cuid, 'recordVideoSuccess', [this._recordId])
          );
        }
      },
      // 直播 生成回放
      async handleSaveVodInLive() {
        window.clearInterval(this._durationInterval);
        const { watchInitData } = this.roomBaseServer.state;
        if (this.liveDuration < 30) {
          this.liveDuration = 0;
          const type = watchInitData.webinar.mode == 1 ? '音频' : '视频';
          this.popAlert.text = `${type}时长过短，不支持生成回放`;
          this.popAlert.visible = true;
          this.popAlert.confirm = false;
        } else {
          this.liveDuration = 0;
          // 直播结束生成回放
          const res = await this.roomBaseServer.createRecordInLive({
            webinar_id: watchInitData.webinar.id
          });
          // 如果是直播并且开启生成回放的提示,展示弹窗
          if (res.code == 200 && watchInitData.record_tip == 1 && !this.isRecord) {
            this.popAlert.text = '自动生成回放成功，是否设置为默认回放？';
            this.popAlert.visible = true;
            this.popAlert.confirm = true;
            this.popAlert._recordId = res.data.record_id;
          }
        }
      },

      // 设置默认回放
      async handleSetDefaultRecord() {
        try {
          window.vhallReportForProduct?.report(110140);
          const res = await this.roomBaseServer.setDefaultRecord({
            webinar_id: this.roomBaseServer.state.watchInitData.webinar.id,
            record_id: this.popAlert._recordId,
            type: 1
          });
          if (res.code == 200) {
            this.popAlert.visible = false;
            this.$message.success('设置成功');
          }
        } catch (err) {
          console.log(err);
        }
      },
      // 关闭弹窗
      closeConfirm() {
        this.popAlert.visible = false;
        window.vhallReportForProduct?.report(110141);
        // 如果是关闭设置默认回放的弹窗，需要给出暂存时间提示，否则直接return
        if (!this.popAlert.confirm) return;
        const { watchInitData } = this.roomBaseServer.state;
        if (watchInitData.record_notice == 4) {
          return;
        }
        this.noDefaultPopAlert.visible = true;
        let html = '非默认回放将暂存15天';
        if (watchInitData.record_notice == 1) {
          html = '非默认回放将暂存15天';
        } else if (watchInitData.record_notice == 2) {
          html =
            "非默认回放将暂存15天，联系您的客户经理或 <a href=\"https://vhall.s4.udesk.cn/im_client/?web_plugin_id=15038\" style='color: #fb3a32' target='_blank'>客服</a> 开通点播服务，即可将非默认回放永久保存和播放";
        } else if (watchInitData.record_notice == 3) {
          html = '非默认回放将暂存15天，发布为点播，即可将非默认回放永久保存和播放';
        }
        this.noDefaultPopAlert.text = html;
      },
      // 关闭非默认回放暂存时间提醒弹窗
      noDefaultPopClose() {
        this.noDefaultPopAlert.visible = false;
      },
      // 开播时间计时器
      calculateLiveDuration() {
        if (this._durationInterval) {
          window.clearInterval(this._durationInterval);
        }
        this._durationInterval = window.setInterval(() => {
          this.liveDuration++;
        }, 1000);
      },
      // 全屏
      fullScreen(el) {
        window.vhallReportForProduct && window.vhallReportForProduct.report(120000);
        this.isFullscreen = !this.isFullscreen;
        if (this.isFullscreen) {
          this.enterFullscreen(el);
        } else {
          this.exitFullscreen(el);
        }
      },
      enterFullscreen() {
        const element = document.querySelector('.vmp-basic-container');
        if (!this.assistantType) {
          if (element.requestFullscreen) element.requestFullscreen();
          else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
          else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
          } else if (element.msRequestFullscreen) element.msRequestFullscreen();
        }
      },
      exitFullscreen() {
        if (!this.assistantType) {
          if (document.exitFullscreen) document.exitFullscreen();
          else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
          else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
          else if (document.msExitFullscreen) document.msExitFullscreen();
        }
      }
    }
  };
</script>

<style lang="less">
  .vmp-header-right {
    .vmp-header-right_btn-box {
      float: right;
      display: flex;
      height: 100%;
      align-items: center;
    }
    .vmp-header-right_btn {
      width: 80px;
      height: 26px;
      border-radius: 80px;
      font-size: 14px;
      text-align: center;
      line-height: 26px;
      color: @font-error-low;
      padding: 0 10px;
      cursor: pointer;
      background-color: @bg-error-light;
    }
    .vmp-header-right_duration {
      &-end {
        display: none;
      }
      &:hover {
        .vmp-header-right_duration-text {
          display: none;
        }
        .vmp-header-right_duration-end {
          display: inline;
        }
      }
    }
    &_control {
      margin-left: 12px;
      color: @font-error-low;
      font-size: 14px;
    }
    &_full {
      margin: 0 20px 0 12px;
      background-color: hsla(0, 0%, 88.6%, 0.15);
      border-radius: 50%;
      width: 28px;
      height: 28px;
      color: @font-dark-low;
      font-size: 14px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      .iconfont {
        font-size: 14px;
      }
    }
  }
</style>
