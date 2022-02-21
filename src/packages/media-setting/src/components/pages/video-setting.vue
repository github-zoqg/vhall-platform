<template>
  <section class="vmp-media-setting-video">
    <main>
      <section class="vmp-media-setting-item">
        <label class="vmp-media-setting-item__label">{{ $t('setting.setting_1003') }}</label>
        <section class="vmp-media-setting-item__content">
          <el-radio-group v-model="mediaState.videoType" @change="onVideoTypeChange">
            <el-radio label="camera">{{ $t('setting.setting_1003') }}</el-radio>
            <el-radio label="picture">{{ $t('setting.setting_1007') }}</el-radio>
          </el-radio-group>
        </section>
      </section>

      <section v-show="mediaState.videoType === 'camera'" class="vmp-media-setting-item">
        <el-select class="vmp-media-setting-item__content" v-model="mediaState.video">
          <el-option
            v-for="item in devices"
            :key="item.deviceId"
            :value="item.deviceId"
            :label="item.label"
          ></el-option>
        </el-select>
      </section>

      <section v-show="mediaState.videoType === 'camera'" class="vmp-media-setting-video-canvas">
        <div id="vmp-media-setting-preview-video" style="height: 100%"></div>
        <div
          v-show="isVideoSwitching || isVideoError"
          class="vmp-media-setting-preview-loading-container"
        >
          <img :src="videoLoadingImg" alt="" />
          <p>{{ videoTipsText }}</p>
        </div>
      </section>

      <section v-show="mediaState.videoType === 'picture'">
        <picture-uploader :canvasImgUrl.sync="mediaState.canvasImgUrl" />
      </section>
    </main>
    <footer v-show="mediaState.videoType === 'camera'">
      <section class="vmp-media-setting-tips">
        <section class="vmp-media-setting-tips__title">{{ $t('setting.setting_1011') }}</section>
        <section class="vmp-media-setting-tips__content">
          <p>1. {{ $t('setting.setting_1012') }}</p>
          <p>2. {{ $t('setting.setting_1013') }}</p>
          <p>3. {{ $t('setting.setting_1014') }}</p>
        </section>
      </section>
    </footer>
  </section>
</template>

<script>
  import videoSwitchImg from '@/packages/app-shared/assets/img/video.gif';
  import videoFailImg from '@/packages/app-shared/assets/img/videoFailed.png';
  import PictureUploader from '../picture-uploader.vue';
  import { useMediaSettingServer, useRoomBaseServer } from 'middle-domain';

  export default {
    components: {
      PictureUploader
    },
    data() {
      return {
        mediaState: this.mediaSettingServer.state,
        videoLoadingImg: videoSwitchImg,
        isVideoSwitching: false,
        isVideoError: false,
        videoTipsText: '设备切换中，请稍后…',
        roomId: null, // TODO:
        interactToken: null, // TODO:
        videoError: false
      };
    },
    computed: {
      devices() {
        return this.mediaState.devices.videoInputDevices;
      }
    },
    watch: {
      'mediaState.video'(val) {
        this.mediaSettingServer.setState('video', val);
        this.createPreview();
      },
      devices(val) {
        if (val && val.length) {
          this.mediaSettingServer.setState('video', val[0].deviceId);
        } else {
          sessionStorage.removeItem('selectedVideoDeviceId');
        }
      }
    },
    beforeCreate() {
      this.mediaSettingServer = useMediaSettingServer();
    },
    created() {
      const { watchInitData } = useRoomBaseServer().state;
      this.webinar = watchInitData.webinar;

      // this.setDefaultVideoType();
    },
    beforeDestroy() {
      // this.destroyStream();
    },
    methods: {
      // setDefaultVideoType() {
      //   let param = JSON.parse(localStorage.getItem(`saveCanvasObj_${this.webinar.id}`));
      //   if (param && param.flag === true && param.streamUrl !== '') {
      //     this.mediaState.videoType = 'picture';
      //     this.mediaState.canvasImgUrl = param.streamUrl;
      //   }
      // },
      async onVideoTypeChange(value) {
        this.mediaSettingServer.setState('videoType', value);
        if (value === 'picture') {
          return this.destroyStream();
        }

        if (value === 'camera') {
          await this.destroyStream();
          this.createPreview();
        }
      },
      // 创建视频流
      async createPreview() {
        await this.destroyStream();

        const options = {
          videoNode: 'vmp-media-setting-preview-video',
          audio: this.mediaState.audioInput === '' ? false : true,
          video: this.mediaState.video === '' ? false : true,
          profile: VhallRTC.RTC_VIDEO_PROFILE_480P_16X9_M,
          mute: { audio: false, video: false },
          videoDevice: this.mediaState.video
        };

        try {
          this.videoError = false;
          this.isVideoSwitching = true;
          this.videoLoadingImg = videoSwitchImg;
          await this.mediaSettingServer.startVideoPreview(options);
          this.isVideoSwitching = false;
        } catch (err) {
          this.isVideoSwitching = false;
          this.videoLoadingImg = videoFailImg;
          this.videoError = true;
          this.videoTipsText = this.$t('setting.setting_1010');
          this.$message.error(this.$t('message.message_1031'));
          console.error(this.$t('message.message_1028'), err);
        }
      },
      async destroyStream() {
        // if (!this.mediaState.videoPreviewStreamId) return;
        try {
          await this.mediaSettingServer.stopVideoPreview();
        } catch (err) {
          console.error(`销毁流异常`, err);
        }
      },
      //TODO: let stream save
      saveStream() {},
      uploadSuccessCanvas() {},
      updateDeviceSetting() {}
    }
  };
</script>

<style lang="less">
  .vmp-media-setting-video-canvas {
    height: 166px;
    border-radius: 4px;
    overflow: hidden;
    position: relative;

    .vmp-media-setting-preview-loading-container {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: #1a1a1a;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      img {
        flex: 0 0 auto;
      }

      p {
        padding-top: 10px;
        font-size: 12px;
        color: #ffffff;
        line-height: 20px;
      }
    }
  }
</style>
