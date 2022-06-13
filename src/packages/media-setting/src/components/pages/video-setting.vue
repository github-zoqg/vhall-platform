<template>
  <section class="vmp-media-setting-video">
    <main>
      <section class="vmp-media-setting-item" v-if="!isStreamYun">
        <label class="vmp-media-setting-item__label">{{ $t('setting.setting_1006') }}</label>
        <section class="vmp-media-setting-item__content vmp-media-setting-item__video-type">
          <el-radio-group v-model="mediaState.videoType" @change="onVideoTypeChange">
            <el-radio label="camera">{{ $t('setting.setting_1003') }}</el-radio>
            <el-radio label="picture">{{ $t('setting.setting_1007') }}</el-radio>
          </el-radio-group>
        </section>
      </section>

      <section v-show="mediaState.videoType === 'camera'" class="vmp-media-setting-item">
        <el-select
          class="vmp-media-setting-item__content"
          :placeholder="$t('form.form_1018')"
          v-model="mediaState.video"
        >
          <el-option
            v-for="item in devices"
            :key="item.deviceId"
            :value="item.deviceId"
            :label="item.label"
          ></el-option>
        </el-select>
      </section>

      <section v-show="mediaState.videoType === 'camera'" class="vmp-media-setting-video-canvas">
        <div ref="videoPreviewer" id="vmp-media-setting-preview-video" style="height: 100%"></div>
        <div
          v-show="isVideoSwitching || isVideoError"
          class="vmp-media-setting-preview-loading-container"
        >
          <img :src="videoLoadingImg" alt="" />
          <p>{{ videoTipsText }}</p>
        </div>
      </section>

      <section v-show="mediaState.videoType === 'picture'">
        <picture-uploader ref="picUploader" :canvasImgUrl.sync="mediaState.canvasImgUrl" />
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
    props: {
      selectedItem: {
        type: String,
        default: 'basic-setting'
      },
      isShow: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        mediaState: this.mediaSettingServer.state,
        videoLoadingImg: videoSwitchImg,
        isVideoSwitching: false, // video正在切换
        isVideoError: false, // video读取错误
        videoTipsText: this.$t('setting.setting_1008')
      };
    },
    computed: {
      isVideoSettingActive() {
        return this.selectedItem === 'video-setting';
      },
      devices() {
        return this.mediaState.devices.videoInputDevices;
      },
      // 是否为云导播页面
      isStreamYun() {
        return /lives\/yun/.test(location.pathname);
      }
    },
    watch: {
      selectedItem(val) {
        if (!this.isShow) return;

        if (val === undefined || val === '') return;
        if (val === 'video-setting') {
          this.createPreview();
        } else {
          this.destroyStream();
        }
      },
      'mediaState.video'(val) {
        if (val === undefined || val === '') return;
        if (!this.isShow) return;
        if (!this.isVideoSettingActive) return;
        this.createPreview();
      }
    },
    beforeCreate() {
      this.mediaSettingServer = useMediaSettingServer();
    },
    created() {
      const { watchInitData } = useRoomBaseServer().state;
      this.webinar = watchInitData.webinar;
    },
    beforeDestroy() {
      this.destroyStream();
    },
    methods: {
      /**
       * 视频设备变更
       * @param {String} value 视频设备ID
       */
      async onVideoTypeChange(value) {
        this.mediaSettingServer.setState('videoType', value);

        if (value === 'picture') {
          this.$refs['picUploader'].selected();
          return this.destroyStream();
        }

        if (value === 'camera') {
          this.createPreview();
        }
      },
      /**
       * 创建视频预览流
       */
      async createPreview() {
        if (this.mediaState.videoType !== 'camera') return;
        if (this.mediaState.video === '') return;

        await this.destroyStream();

        this.$refs['videoPreviewer'].innerHTML = '';

        const options = {
          videoNode: 'vmp-media-setting-preview-video',
          audio: this.mediaState.audioInput === '' ? false : true,
          video: this.mediaState.video === '' ? false : true,
          profile: VhallRTC.RTC_VIDEO_PROFILE_480P_16X9_M,
          mute: { audio: false, video: false },
          videoDevice: this.mediaState.video
        };

        try {
          this.isVideoError = false;
          this.isVideoSwitching = true;
          this.videoLoadingImg = videoSwitchImg;
          await this.mediaSettingServer.startVideoPreview(options);
          this.isVideoSwitching = false;
        } catch (err) {
          this.isVideoSwitching = false;
          this.videoLoadingImg = videoFailImg;
          this.isVideoError = true;
          this.videoTipsText = this.$t('setting.setting_1010');
          this.$message.error(this.$t('message.message_1031'));
          console.error(this.$t('message.message_1028'), err);
        }
      },
      /**
       * 销毁预览流
       */
      async destroyStream() {
        try {
          return this.mediaSettingServer.stopVideoPreview();
        } catch (err) {
          console.error(`销毁流异常`, err);
        }

        return true;
      }
    }
  };
</script>

<style lang="less">
  .vmp-media-setting-item__video-type {
    display: flex;
    align-items: center;
  }

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
        color: #fff;
        line-height: 20px;
      }
    }
  }
</style>
