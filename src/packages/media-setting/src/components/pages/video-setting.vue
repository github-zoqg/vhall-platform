<template>
  <section class="vmp-media-setting-video">
    <main>
      <section class="vmp-media-setting-item">
        <label class="vmp-media-setting-item__label">摄像头</label>
        <section class="vmp-media-setting-item__content">
          <el-radio-group v-model="mediaState.videoType" @change="onVideoTypeChange">
            <el-radio label="camera">摄像头</el-radio>
            <el-radio label="picture">图片</el-radio>
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
        <section class="vmp-media-setting-tips__title">看不到摄像头画面？试试以下方法：</section>
        <section class="vmp-media-setting-tips__content">
          <p>1. 请允许浏览器使用摄像头权限</p>
          <p>2. 确认摄像头没有被其他程序占用</p>
          <p>3. 选择外置摄像头或者更换电脑</p>
        </section>
      </section>
    </footer>
  </section>
</template>

<script>
  import canvasDefaultImg from '../../assets/img/canvasDefault.png';
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

      this.mediaState.canvasImgUrl = canvasDefaultImg;
      this.setDefaultVideoType();
    },
    beforeDestroy() {
      this.destroyStream();
    },
    methods: {
      setDefaultVideoType() {
        let param = JSON.parse(localStorage.getItem(`saveCanvasObj_${this.webinar.id}`));
        if (param && param.flag === true && param.streamUrl !== '') {
          this.mediaState.videoType = 'picture';
          this.mediaState.canvasImgUrl = param.streamUrl;
        }
      },
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
          this.videoTipsText = '摄像头切换失败，请稍后重试';
          this.$message.error(`创建本地预览流失败，请检查设备`);
          console.error(`创建本地预览流失败`, err);
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
