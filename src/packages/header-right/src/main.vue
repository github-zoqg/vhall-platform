<template>
  <div class="vmp-header-right">
    <section class="vmp-header-right_btn-box">
      <record-control></record-control>
      <div v-if="liveStep == 1" class="vmp-header-right_btn" @click="handleStartClick">
        开始直播
      </div>
      <div v-if="liveStep == 2" class="vmp-header-right_btn">正在启动...</div>
      <div
        v-if="liveStep == 3"
        class="vmp-header-right_btn vmp-header-right_duration"
        @click="handleEndClick"
      >
        <span class="vmp-header-right_duration-text">{{ formatDuration }}</span>
        <span class="vmp-header-right_duration-end">结束直播</span>
      </div>
      <div v-if="liveStep == 4" class="vmp-header-right_btn">正在结束...</div>
      <div class="vmp-header-right_control">
        <headerControl
          :isShowQuit="isShowQuit"
          :isShowSupport="isShowSupport"
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
  </div>
</template>

<script>
  import headerControl from './components/header-control.vue';
  import RecordControl from './components/record-control.vue';
  import { useRoomBaseServer } from 'middle-domain';
  import { boxEventOpitons } from '@/packages/app-shared/utils/tool';
  import SaasAlert from '@/packages/pc-alert/src/alert.vue';
  export default {
    name: 'VmpHeaderRight',
    data() {
      return {
        liveStep: 1, // 1未开始 2启动中 3直播中 4结束中
        liveDuration: '',
        isFullscreen: false,
        assistantType: this.$route.query.assistantType,
        isShowQuit: false, //是否显示退出
        isShowSupport: false, //是否显示技术支持
        isShowSplitScreen: false, //是否显示分屏
        popAlert: {
          text: '',
          visible: false,
          confirm: true
        }
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
      }
    },
    components: {
      headerControl,
      SaasAlert,
      RecordControl
    },
    created() {
      this.roomBaseServer = useRoomBaseServer();
      this.initConfig();
      this.listenEvents();
    },
    mounted() {
      const { watchInitData } = this.roomBaseServer.state;
      if (watchInitData.webinar.type == 1) {
        this.liveDuration = watchInitData.webinar.live_time;
        this.calculateLiveDuration();
        this.liveStep = 2;
      }
    },
    methods: {
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
      // 调开始直播接口
      postStartLive() {
        return this.roomBaseServer.startLive({
          webinar_id: this.roomBaseServer.state.watchInitData.webinar.id,
          start_type: this.roomBaseServer.state.interactToolStatus.start_type
        });
      },
      // 开始直播
      handleStartClick() {
        // this.liveStep = 2;
        // 派发推流事件
        window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickStartLive'));
      },
      // 结束直播
      async handleEndClick() {
        this.liveStep = 4;
        const res = await this.roomBaseServer.endLive({
          webinar_id: this.roomBaseServer.state.watchInitData.webinar.id,
          end_type: this.roomBaseServer.state.interactToolStatus.start_type
        });
        if (res.code == 200 && this.roomBaseServer.state.interactToolStatus.start_type == 4) {
          this.handleSaveVod();
          this.liveStep = 1;
        } else {
          // 派发结束直播事件
          window.$middleEventSdk?.event?.send(boxEventOpitons(this.cuid, 'emitClickEndLive'));
        }
      },
      // 生成回放
      async handleSaveVod() {
        window.clearInterval(this._durationInterval);
        if (this.liveDuration < 30) {
          this.liveDuration = 0;
          const type = this.roomBaseServer.state.watchInitData.webinar.mode == 1 ? '音频' : '视频';
          this.popAlert.text = `${type}时长过短，不支持生成回放`;
          this.popAlert.visible = true;
          this.popAlert.confirm = false;
        } else {
          this.liveDuration = 0;
          const res = await this.roomBaseServer.createRecord({
            webinar_id: this.roomBaseServer.state.watchInitData.webinar.id
          });
          if (res.code == 200 && this.roomBaseServer.state.watchInitData.record_tip == 1) {
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
      },
      handleUnpublishComplate() {
        this.handleSaveVod();
        this.liveStep = 1;
      },
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
